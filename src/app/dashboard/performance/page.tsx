import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { StaffSelector } from "@/components/dashboard/staff-selector";
import { PerformanceTable } from "@/components/dashboard/performance-table";
import { HorizontalBarChart } from "@/components/dashboard/horizontal-bar-chart";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ClipboardList, FolderOpen, Users } from "lucide-react";
import type { FormSupportCount, StaffOption, StaffPerformanceRow } from "@/types/domain";

const FETCH_LIMIT = 20000;
const LEADERBOARD_CHART_LIMIT = 20;

interface StaffQueryRow {
  id: string;
  full_name: string;
  title: { content_vi: string } | null;
}
interface AssessmentFormQueryRow {
  staff_id: string | null;
  forms: { code: string; name: string; category: string } | null;
}
interface CaseQueryRow {
  opened_by: string | null;
}
interface AssignmentQueryRow {
  staff_id: string;
}

interface PerformancePageProps {
  searchParams: Promise<{ from?: string; to?: string; staff?: string }>;
}

export default async function PerformancePage({ searchParams }: PerformancePageProps) {
  const { from, to, staff: selectedStaffId } = await searchParams;
  const supabase = await createClient();

  // RLS on cases/beneficiary_assignments/assessment_forms is branch-scoped,
  // not role-scoped, so a regular 'staff' account could otherwise still read
  // colleagues' performance figures within their own branch. Gate the page
  // explicitly, same as audit-logs.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: viewer } = await supabase.from("staff").select("role").eq("user_id", user.id).single();
  if (!viewer || (viewer.role !== "admin" && viewer.role !== "manager")) {
    redirect("/dashboard");
  }

  let assessmentFormsQuery = supabase
    .from("assessment_forms")
    .select("staff_id, forms(code, name, category)")
    .eq("status", "committed")
    .is("deleted_at", null)
    .limit(FETCH_LIMIT);
  if (from) assessmentFormsQuery = assessmentFormsQuery.gte("created_at", `${from}T00:00:00`);
  if (to) assessmentFormsQuery = assessmentFormsQuery.lte("created_at", `${to}T23:59:59.999`);

  let casesQuery = supabase.from("cases").select("opened_by").is("deleted_at", null).limit(FETCH_LIMIT);
  if (from) casesQuery = casesQuery.gte("opened_at", from);
  if (to) casesQuery = casesQuery.lte("opened_at", to);

  let assignmentsQuery = supabase.from("beneficiary_assignments").select("staff_id").limit(FETCH_LIMIT);
  if (from) assignmentsQuery = assignmentsQuery.gte("assigned_at", `${from}T00:00:00`);
  if (to) assignmentsQuery = assignmentsQuery.lte("assigned_at", `${to}T23:59:59.999`);

  const [staffList, assessmentForms, cases, assignments] = await Promise.all([
    supabase
      .from("staff")
      .select("id, full_name, title:codes(content_vi)")
      .eq("status", "active")
      .order("full_name"),
    assessmentFormsQuery,
    casesQuery,
    assignmentsQuery,
  ]);

  const staffRows = (staffList.data as StaffQueryRow[] | null) ?? [];
  const assessmentFormRows = (assessmentForms.data as AssessmentFormQueryRow[] | null) ?? [];
  const caseRows = (cases.data as CaseQueryRow[] | null) ?? [];
  const assignmentRows = (assignments.data as AssignmentQueryRow[] | null) ?? [];

  const formsByStaff = new Map<string, number>();
  const formsByStaffAndForm = new Map<string, Map<string, FormSupportCount>>();
  for (const row of assessmentFormRows) {
    if (!row.staff_id || !row.forms) continue;
    formsByStaff.set(row.staff_id, (formsByStaff.get(row.staff_id) ?? 0) + 1);

    let byForm = formsByStaffAndForm.get(row.staff_id);
    if (!byForm) {
      byForm = new Map();
      formsByStaffAndForm.set(row.staff_id, byForm);
    }
    const existing = byForm.get(row.forms.code);
    if (existing) existing.count += 1;
    else byForm.set(row.forms.code, { code: row.forms.code, name: row.forms.name, category: row.forms.category, count: 1 });
  }

  const casesByStaff = new Map<string, number>();
  for (const row of caseRows) {
    if (!row.opened_by) continue;
    casesByStaff.set(row.opened_by, (casesByStaff.get(row.opened_by) ?? 0) + 1);
  }

  const assignmentsByStaff = new Map<string, number>();
  for (const row of assignmentRows) {
    assignmentsByStaff.set(row.staff_id, (assignmentsByStaff.get(row.staff_id) ?? 0) + 1);
  }

  const staffOptions: StaffOption[] = staffRows.map((s) => ({
    id: s.id,
    fullName: s.full_name,
    title: s.title?.content_vi ?? null,
  }));

  const performanceRows: StaffPerformanceRow[] = staffRows
    .map((s) => ({
      staffId: s.id,
      fullName: s.full_name,
      title: s.title?.content_vi ?? null,
      formsCommitted: formsByStaff.get(s.id) ?? 0,
      casesOpened: casesByStaff.get(s.id) ?? 0,
      beneficiariesAssigned: assignmentsByStaff.get(s.id) ?? 0,
    }))
    .sort((a, b) => b.formsCommitted - a.formsCommitted);

  const selectedStaff = selectedStaffId ? staffRows.find((s) => s.id === selectedStaffId) : undefined;

  const clearStaffParams = new URLSearchParams();
  if (from) clearStaffParams.set("from", from);
  if (to) clearStaffParams.set("to", to);
  const clearStaffHref = `/dashboard/performance${clearStaffParams.toString() ? `?${clearStaffParams}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Hiệu suất nhân sự</h1>
          <p className="text-sm text-muted-foreground">
            Hiệu suất làm việc của nhân sự &amp; cộng tác viên (CTV) theo thời gian.
          </p>
        </div>
        <Suspense fallback={null}>
          <div className="flex flex-wrap items-end gap-3">
            <DateRangeFilter />
            <StaffSelector options={staffOptions} />
          </div>
        </Suspense>
      </div>

      {!selectedStaff ? (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">Bảng xếp hạng theo số phiếu đã ghi nhận</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {performanceRows.length > LEADERBOARD_CHART_LIMIT
                ? `Top ${LEADERBOARD_CHART_LIMIT} nhân sự có số phiếu cao nhất`
                : "Số phiếu đánh giá đã ghi nhận (Ghi nhận/commit) theo từng nhân sự"}
            </p>
            <HorizontalBarChart
              data={performanceRows
                .slice(0, LEADERBOARD_CHART_LIMIT)
                .filter((r) => r.formsCommitted > 0)
                .map((r) => ({ key: r.staffId, label: r.fullName, count: r.formsCommitted }))}
              emptyLabel="Chưa có phiếu nào được ghi nhận trong khoảng thời gian này."
              unitLabel="phiếu"
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Chi tiết theo nhân sự</h2>
            <PerformanceTable rows={performanceRows} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{selectedStaff.full_name}</h2>
              <p className="text-sm text-muted-foreground">{selectedStaff.title?.content_vi ?? "—"}</p>
            </div>
            <Link href={clearStaffHref} className="text-sm text-primary hover:underline">
              ← Xem tất cả nhân sự
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile icon={ClipboardList} label="Phiếu đã ghi nhận" value={formsByStaff.get(selectedStaff.id) ?? 0} />
            <StatTile icon={FolderOpen} label="Hồ sơ đã mở" value={casesByStaff.get(selectedStaff.id) ?? 0} />
            <StatTile
              icon={Users}
              label="NKT phụ trách"
              value={assignmentsByStaff.get(selectedStaff.id) ?? 0}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">Phiếu đã ghi nhận theo loại</h2>
            <p className="mb-4 text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
            <HorizontalBarChart
              data={Array.from(formsByStaffAndForm.get(selectedStaff.id)?.values() ?? [])
                .sort((a, b) => b.count - a.count)
                .map((row) => ({ key: row.code, label: row.name, count: row.count }))}
              emptyLabel="Chưa có phiếu nào được ghi nhận trong khoảng thời gian này."
              unitLabel="lượt"
            />
          </div>
        </div>
      )}
    </div>
  );
}
