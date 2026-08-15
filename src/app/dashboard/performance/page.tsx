import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { StaffSelector } from "@/components/dashboard/staff-selector";
import { PerformanceTable } from "@/components/dashboard/performance-table";
import { HorizontalBarChart } from "@/components/dashboard/horizontal-bar-chart";
import { StatTile } from "@/components/dashboard/stat-tile";
import { CaseSupportTable } from "@/components/dashboard/case-support-table";
import { TrendLineChart } from "@/components/dashboard/trend-line-chart";
import { FunnelSteps } from "@/components/dashboard/funnel-steps";
import { CompletionStackedList } from "@/components/dashboard/completion-stacked-list";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { ScatterQualityChart } from "@/components/dashboard/scatter-quality-chart";
import { RadarComparisonChart } from "@/components/dashboard/radar-comparison-chart";
import { NotAvailable } from "@/components/dashboard/not-available";
import { ClipboardList, FolderOpen, Users, CheckCircle2 } from "lucide-react";
import type {
  CaseSupportCount,
  FormSupportCount,
  FunnelStepDatum,
  HeatmapCell,
  RadarAxisDatum,
  ScatterDatum,
  StaffOption,
  StaffPerformanceRow,
  TrendPoint,
} from "@/types/domain";

const FETCH_LIMIT = 20000;
const LEADERBOARD_CHART_LIMIT = 20;
const HEATMAP_STAFF_LIMIT = 10;

interface StaffQueryRow {
  id: string;
  full_name: string;
  title: { content_vi: string } | null;
}
interface AssessmentFormQueryRow {
  staff_id: string | null;
  case_id: string;
  status: string;
  created_at: string;
  pdf_path: string | null;
  change_log: unknown;
  forms: { code: string; name: string; category: string } | null;
  beneficiary: { full_name: string } | null;
}
interface CaseQueryRow {
  opened_by: string | null;
}
interface AssignmentQueryRow {
  staff_id: string;
  beneficiary_id: string;
}

interface PerformancePageProps {
  searchParams: Promise<{ from?: string; to?: string; staff?: string }>;
}

function monthLabel(isoDate: string): string {
  const [y, m] = isoDate.slice(0, 7).split("-");
  return `${m}/${y}`;
}

const VN_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Weekday (0=CN..6=T7) as seen in Vietnam local time (UTC+7), independent of
 * the server runtime's own timezone (Vercel functions run in UTC — using
 * plain `Date.getDay()` would misclassify timestamps near midnight VN time).
 */
function vietnamWeekday(isoTimestamp: string): number {
  return new Date(new Date(isoTimestamp).getTime() + VN_UTC_OFFSET_MS).getUTCDay();
}

/** "YYYY-MM" bucket for `isoTimestamp`, in Vietnam local time (see vietnamWeekday). */
function vietnamMonthKey(isoTimestamp: string): string {
  return new Date(new Date(isoTimestamp).getTime() + VN_UTC_OFFSET_MS).toISOString().slice(0, 7);
}

/** Percentile rank of `value` within `values` (0-100), midpoint rule for ties. */
function percentileRank(values: number[], value: number): number {
  if (values.length <= 1) return 50;
  const less = values.filter((v) => v < value).length;
  const equal = values.filter((v) => v === value).length;
  return Math.round(((less + equal / 2) / values.length) * 100);
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

  // No status filter here (unlike earlier) — draft rows are needed too, for
  // the completion-rate and funnel charts.
  let assessmentFormsQuery = supabase
    .from("assessment_forms")
    .select(
      "staff_id, case_id, status, created_at, pdf_path, change_log, forms(code, name, category), beneficiary:beneficiaries(full_name)",
    )
    .is("deleted_at", null)
    .limit(FETCH_LIMIT);
  if (from) assessmentFormsQuery = assessmentFormsQuery.gte("created_at", `${from}T00:00:00`);
  if (to) assessmentFormsQuery = assessmentFormsQuery.lte("created_at", `${to}T23:59:59.999`);

  let casesQuery = supabase.from("cases").select("opened_by").is("deleted_at", null).limit(FETCH_LIMIT);
  if (from) casesQuery = casesQuery.gte("opened_at", from);
  if (to) casesQuery = casesQuery.lte("opened_at", to);

  let assignmentsQuery = supabase.from("beneficiary_assignments").select("staff_id, beneficiary_id").limit(FETCH_LIMIT);
  if (from) assignmentsQuery = assignmentsQuery.gte("assigned_at", `${from}T00:00:00`);
  if (to) assignmentsQuery = assignmentsQuery.lte("assigned_at", `${to}T23:59:59.999`);

  const [staffList, assessmentForms, cases, assignments] = await Promise.all([
    supabase
      .from("staff")
      .select("id, full_name, title:codes!staff_title_id_fkey(content_vi)")
      .eq("status", "active")
      .order("full_name"),
    assessmentFormsQuery,
    casesQuery,
    assignmentsQuery,
  ]);

  for (const [label, result] of [
    ["staff", staffList],
    ["assessment_forms", assessmentForms],
    ["cases", cases],
    ["beneficiary_assignments", assignments],
  ] as const) {
    if (result.error) console.error(`[dashboard/performance] ${label} query failed:`, result.error);
  }

  const staffRows = (staffList.data as StaffQueryRow[] | null) ?? [];
  const assessmentFormRows = (assessmentForms.data as AssessmentFormQueryRow[] | null) ?? [];
  const caseRows = (cases.data as CaseQueryRow[] | null) ?? [];
  const assignmentRows = (assignments.data as AssignmentQueryRow[] | null) ?? [];

  const staffNameById = new Map(staffRows.map((s) => [s.id, s.full_name]));

  const formsCommittedByStaff = new Map<string, number>();
  const formsDraftByStaff = new Map<string, number>();
  const formsByStaffAndForm = new Map<string, Map<string, FormSupportCount>>();
  const formsByStaffAndCase = new Map<string, Map<string, CaseSupportCount>>();
  const revisionsSumByStaff = new Map<string, number>();
  const revisionsCountByStaff = new Map<string, number>();
  const monthlyOrgCounts = new Map<string, number>();
  const monthlyStaffCounts = new Map<string, Map<string, number>>();
  const weekdayStaffCounts = new Map<string, number>();
  let totalCommittedOrg = 0;
  let totalPdfGeneratedOrg = 0;

  for (const row of assessmentFormRows) {
    const isCommitted = row.status === "committed";
    if (isCommitted) {
      totalCommittedOrg += 1;
      if (row.pdf_path) totalPdfGeneratedOrg += 1;
    }

    if (row.staff_id) {
      if (isCommitted) formsCommittedByStaff.set(row.staff_id, (formsCommittedByStaff.get(row.staff_id) ?? 0) + 1);
      else formsDraftByStaff.set(row.staff_id, (formsDraftByStaff.get(row.staff_id) ?? 0) + 1);
    }

    if (!isCommitted || !row.staff_id) continue;

    if (row.forms) {
      let byForm = formsByStaffAndForm.get(row.staff_id);
      if (!byForm) {
        byForm = new Map();
        formsByStaffAndForm.set(row.staff_id, byForm);
      }
      const existingForm = byForm.get(row.forms.code);
      if (existingForm) existingForm.count += 1;
      else byForm.set(row.forms.code, { code: row.forms.code, name: row.forms.name, category: row.forms.category, count: 1 });
    }

    let byCase = formsByStaffAndCase.get(row.staff_id);
    if (!byCase) {
      byCase = new Map();
      formsByStaffAndCase.set(row.staff_id, byCase);
    }
    const existingCase = byCase.get(row.case_id);
    if (existingCase) existingCase.count += 1;
    else byCase.set(row.case_id, { caseId: row.case_id, beneficiaryName: row.beneficiary?.full_name ?? "—", count: 1 });

    const revisionCount = Array.isArray(row.change_log) ? row.change_log.length : 0;
    revisionsSumByStaff.set(row.staff_id, (revisionsSumByStaff.get(row.staff_id) ?? 0) + revisionCount);
    revisionsCountByStaff.set(row.staff_id, (revisionsCountByStaff.get(row.staff_id) ?? 0) + 1);

    const month = vietnamMonthKey(row.created_at);
    monthlyOrgCounts.set(month, (monthlyOrgCounts.get(month) ?? 0) + 1);
    let staffMonths = monthlyStaffCounts.get(row.staff_id);
    if (!staffMonths) {
      staffMonths = new Map();
      monthlyStaffCounts.set(row.staff_id, staffMonths);
    }
    staffMonths.set(month, (staffMonths.get(month) ?? 0) + 1);

    const weekday = vietnamWeekday(row.created_at);
    const weekdayKey = `${weekday}-${row.staff_id}`;
    weekdayStaffCounts.set(weekdayKey, (weekdayStaffCounts.get(weekdayKey) ?? 0) + 1);
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
  const totalNktAssignedOrg = new Set(assignmentRows.map((r) => r.beneficiary_id)).size;

  const staffOptions: StaffOption[] = staffRows.map((s) => ({
    id: s.id,
    fullName: s.full_name,
    title: s.title?.content_vi ?? null,
  }));

  const performanceRows: StaffPerformanceRow[] = staffRows
    .map((s) => {
      const formsCommitted = formsCommittedByStaff.get(s.id) ?? 0;
      const formsDrafted = formsDraftByStaff.get(s.id) ?? 0;
      const revSum = revisionsSumByStaff.get(s.id);
      const revCount = revisionsCountByStaff.get(s.id);
      return {
        staffId: s.id,
        fullName: s.full_name,
        title: s.title?.content_vi ?? null,
        formsCommitted,
        formsDrafted,
        completionRate: formsCommitted + formsDrafted > 0 ? formsCommitted / (formsCommitted + formsDrafted) : null,
        casesOpened: casesByStaff.get(s.id) ?? 0,
        beneficiariesAssigned: assignmentsByStaff.get(s.id) ?? 0,
        avgRevisions: revCount ? (revSum ?? 0) / revCount : null,
      };
    })
    .sort((a, b) => b.formsCommitted - a.formsCommitted);

  const selectedStaff = selectedStaffId ? staffRows.find((s) => s.id === selectedStaffId) : undefined;
  const selectedPerf = selectedStaff ? performanceRows.find((r) => r.staffId === selectedStaff.id) : undefined;

  const clearStaffParams = new URLSearchParams();
  if (from) clearStaffParams.set("from", from);
  if (to) clearStaffParams.set("to", to);
  const clearStaffHref = `/dashboard/performance${clearStaffParams.toString() ? `?${clearStaffParams}` : ""}`;

  // --- Org-wide chart data (leaderboard/overview mode) ---
  const trendData: TrendPoint[] = Array.from(monthlyOrgCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({ monthLabel: monthLabel(`${key}-01`), count }));

  const funnelData: FunnelStepDatum[] = [
    { label: "Đã tạo (kể cả bản nháp)", count: assessmentFormRows.length },
    { label: "Đã ghi nhận (Commit)", count: totalCommittedOrg },
    { label: "Đã sinh PDF", count: totalPdfGeneratedOrg },
  ];

  const heatmapStaffIds = performanceRows
    .filter((r) => r.formsCommitted > 0)
    .slice(0, HEATMAP_STAFF_LIMIT)
    .map((r) => r.staffId);
  const heatmapCells: HeatmapCell[] = heatmapStaffIds.flatMap((staffId) =>
    Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      staffId,
      staffLabel: staffNameById.get(staffId) ?? "—",
      count: weekdayStaffCounts.get(`${weekday}-${staffId}`) ?? 0,
    })),
  );

  const scatterData: ScatterDatum[] = performanceRows
    .filter((r) => r.formsCommitted > 0 && r.avgRevisions !== null)
    .map((r) => ({ staffId: r.staffId, label: r.fullName, volume: r.formsCommitted, revisions: r.avgRevisions ?? 0 }));

  const orgCompletionRate = assessmentFormRows.length > 0 ? totalCommittedOrg / assessmentFormRows.length : null;

  // --- Individual drill-down chart data ---
  const personalTrendData: TrendPoint[] = selectedStaff
    ? Array.from(monthlyStaffCounts.get(selectedStaff.id)?.entries() ?? [])
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, count]) => ({ monthLabel: monthLabel(`${key}-01`), count }))
    : [];

  const radarData: RadarAxisDatum[] =
    selectedStaff && selectedPerf
      ? [
          {
            axis: "Số phiếu",
            individual: percentileRank(performanceRows.map((r) => r.formsCommitted), selectedPerf.formsCommitted),
            teamAverage: 50,
          },
          {
            axis: "Hồ sơ mở",
            individual: percentileRank(performanceRows.map((r) => r.casesOpened), selectedPerf.casesOpened),
            teamAverage: 50,
          },
          {
            axis: "NKT phụ trách",
            individual: percentileRank(performanceRows.map((r) => r.beneficiariesAssigned), selectedPerf.beneficiariesAssigned),
            teamAverage: 50,
          },
          {
            axis: "Tỷ lệ hoàn thành",
            individual: percentileRank(
              performanceRows.map((r) => r.completionRate ?? 0),
              selectedPerf.completionRate ?? 0,
            ),
            teamAverage: 50,
          },
        ]
      : [];

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
          <div className="grid gap-4 sm:grid-cols-4">
            <StatTile icon={ClipboardList} label="Phiếu đã ghi nhận (tổ chức)" value={totalCommittedOrg} />
            <StatTile
              icon={CheckCircle2}
              label="Tỷ lệ hoàn thành chung"
              value={orgCompletionRate !== null ? Math.round(orgCompletionRate * 100) : null}
              suffix="%"
            />
            <StatTile icon={FolderOpen} label="Hồ sơ đã mở" value={caseRows.length} />
            <StatTile icon={Users} label="NKT đang phụ trách" value={totalNktAssignedOrg} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">Xu hướng phiếu ghi nhận theo tháng</h2>
              <p className="mb-4 text-xs text-muted-foreground">Toàn tổ chức</p>
              <TrendLineChart data={trendData} unitLabel="phiếu" />
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">Phễu xử lý phiếu</h2>
              <p className="mb-4 text-xs text-muted-foreground">Đã tạo → Đã ghi nhận → Đã sinh PDF</p>
              <FunnelSteps data={funnelData} />
            </div>
          </div>

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
            <h2 className="mb-1 text-sm font-semibold">Tỷ lệ hoàn thành theo nhân sự</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Đã ghi nhận (commit) so với bản nháp còn tồn đọng — Top {HEATMAP_STAFF_LIMIT} theo tổng số phiếu
            </p>
            <CompletionStackedList rows={performanceRows} limit={HEATMAP_STAFF_LIMIT} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">Nhịp hoạt động theo ngày trong tuần</h2>
              <p className="mb-4 text-xs text-muted-foreground">Số phiếu đã ghi nhận theo nhân sự × ngày trong tuần</p>
              <ActivityHeatmap cells={heatmapCells} staffIds={heatmapStaffIds} staffLabels={staffNameById} />
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">Khối lượng × Số lần chỉnh sửa</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                Mỗi điểm là 1 nhân sự — góc trên-trái (khối lượng cao, ít chỉnh sửa) là vùng đáng chú ý
              </p>
              <ScatterQualityChart data={scatterData} />
            </div>
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

          <div className="grid gap-4 sm:grid-cols-4">
            <StatTile icon={ClipboardList} label="Phiếu đã ghi nhận" value={selectedPerf?.formsCommitted ?? 0} />
            <StatTile
              icon={CheckCircle2}
              label="Tỷ lệ hoàn thành"
              value={
                selectedPerf?.completionRate !== null && selectedPerf?.completionRate !== undefined
                  ? Math.round(selectedPerf.completionRate * 100)
                  : null
              }
              suffix="%"
            />
            <StatTile icon={FolderOpen} label="Hồ sơ đã mở" value={selectedPerf?.casesOpened ?? 0} />
            <StatTile icon={Users} label="NKT phụ trách" value={selectedPerf?.beneficiariesAssigned ?? 0} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">Xu hướng theo tháng</h2>
              <p className="mb-4 text-xs text-muted-foreground">Số phiếu đã ghi nhận của nhân sự này</p>
              <TrendLineChart data={personalTrendData} unitLabel="phiếu" />
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-sm font-semibold">So với trung bình team</h2>
              <p className="mb-4 text-xs text-muted-foreground">Percentile trên 4 chỉ số, trong khoảng thời gian đã chọn</p>
              <RadarComparisonChart data={radarData} teamSize={performanceRows.length} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">Tổng phiếu ghi nhận theo hồ sơ</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Số phiếu đã ghi nhận cho từng hồ sơ (người thụ hưởng) trong khoảng thời gian đã chọn
            </p>
            <CaseSupportTable
              data={Array.from(formsByStaffAndCase.get(selectedStaff.id)?.values() ?? []).sort(
                (a, b) => b.count - a.count,
              )}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">Phiếu đã ghi nhận theo loại</h2>
            <p className="mb-4 text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
            {formsCommittedByStaff.get(selectedStaff.id) ? (
              <HorizontalBarChart
                data={Array.from(formsByStaffAndForm.get(selectedStaff.id)?.values() ?? [])
                  .sort((a, b) => b.count - a.count)
                  .map((row) => ({ key: row.code, label: row.name, count: row.count }))}
                emptyLabel="Chưa có phiếu nào được ghi nhận trong khoảng thời gian này."
                unitLabel="lượt"
              />
            ) : (
              <NotAvailable reason="Nhân sự này chưa ghi nhận phiếu nào trong khoảng thời gian đã chọn." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
