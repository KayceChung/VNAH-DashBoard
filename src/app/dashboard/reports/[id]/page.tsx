import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ClipboardList, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportsTable } from "@/components/reports-table";
import { StatTile } from "@/components/dashboard/stat-tile";
import { InfoTile } from "@/components/dashboard/info-tile";
import { CaseTimeline } from "@/components/dashboard/case-timeline";
import { ProgressLineChart } from "@/components/dashboard/progress-line-chart";
import { CaseAlerts } from "@/components/dashboard/case-alerts";
import { formatDateTime } from "@/lib/utils";
import { buildProgressSeries } from "@/lib/individual-progress";
import type { CaseAlert, ReportRow, TimelineEvent } from "@/types/domain";

interface StaffEmbed {
  full_name: string;
}
interface AssessmentFormQueryRow {
  id: string;
  created_at: string;
  pdf_path: string | null;
  excel_path: string | null;
  staff: StaffEmbed | null;
  form: { name: string } | null;
}
interface DocumentQueryRow {
  id: string;
  created_at: string;
  pdf_path: string | null;
  staff: StaffEmbed | null;
}

interface BeneficiaryDetailQueryRow {
  code: string | null;
  full_name: string;
  phone: string | null;
  disability_type: string | null;
  disability_level: string | null;
  created_at: string;
  province: { name: string } | null;
}

interface CommittedFormQueryRow {
  id: string;
  created_at: string;
  next_appointment: string | null;
  answers: unknown;
  form: { code: string; name: string } | null;
}

interface CaseQueryRow {
  id: string;
  status: string;
  opened_at: string;
  support_round: string | null;
}

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string }>;
}

export default async function ReportBeneficiaryDetailPage({ params, searchParams }: ReportDetailPageProps) {
  const { id } = await params;
  const { q, from, to, page } = await searchParams;
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const fromBound = from ? `${from}T00:00:00` : null;
  const toBound = to ? `${to}T23:59:59.999` : null;

  const beneficiaryQuery = supabase
    .from("beneficiaries")
    .select("code, full_name, phone, disability_type, disability_level, created_at, province:provinces(name)")
    .eq("id", id)
    .maybeSingle();

  const primaryStaffQuery = supabase
    .from("beneficiary_assignments")
    .select("staff:staff(full_name)")
    .eq("beneficiary_id", id)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  const casesQuery = supabase
    .from("cases")
    .select("id, status, opened_at, support_round")
    .eq("beneficiary_id", id)
    .is("deleted_at", null)
    .order("opened_at", { ascending: false });

  // Vùng 1/3/4 (thống kê, tiến bộ, cảnh báo) đọc TOÀN BỘ lịch sử của NKT,
  // không áp bộ lọc ngày của trang danh sách — đây là hồ sơ cố định của NKT,
  // lọc theo ngày chỉ nên thu hẹp bảng tài liệu bên dưới.
  const committedFormsQuery = supabase
    .from("assessment_forms")
    .select("id, created_at, next_appointment, answers, form:forms(code, name)")
    .eq("beneficiary_id", id)
    .eq("status", "committed")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const allConsentsCountQuery = supabase
    .from("consents")
    .select("id, created_at")
    .eq("beneficiary_id", id)
    .order("created_at", { ascending: false });

  const allCcdcCountQuery = supabase
    .from("ccdc_forms")
    .select("id, created_at")
    .eq("beneficiary_id", id)
    .order("created_at", { ascending: false });

  // Vùng 2 (timeline) và bảng tài liệu bên dưới dùng chung dữ liệu đã lọc
  // theo from/to mang qua từ trang danh sách.
  let assessmentFormsQuery = supabase
    .from("assessment_forms")
    .select("id, created_at, pdf_path, excel_path, staff:staff(full_name), form:forms(name)")
    .eq("beneficiary_id", id)
    .not("pdf_path", "is", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  let consentsQuery = supabase
    .from("consents")
    .select("id, created_at, pdf_path, staff:staff(full_name)")
    .eq("beneficiary_id", id)
    .not("pdf_path", "is", null)
    .order("created_at", { ascending: false });
  let ccdcFormsQuery = supabase
    .from("ccdc_forms")
    .select("id, created_at, pdf_path, staff:staff(full_name)")
    .eq("beneficiary_id", id)
    .not("pdf_path", "is", null)
    .order("created_at", { ascending: false });

  if (fromBound) {
    assessmentFormsQuery = assessmentFormsQuery.gte("created_at", fromBound);
    consentsQuery = consentsQuery.gte("created_at", fromBound);
    ccdcFormsQuery = ccdcFormsQuery.gte("created_at", fromBound);
  }
  if (toBound) {
    assessmentFormsQuery = assessmentFormsQuery.lte("created_at", toBound);
    consentsQuery = consentsQuery.lte("created_at", toBound);
    ccdcFormsQuery = ccdcFormsQuery.lte("created_at", toBound);
  }

  const [
    beneficiaryResult,
    primaryStaffResult,
    casesResult,
    committedFormsResult,
    allConsentsResult,
    allCcdcResult,
    assessmentForms,
    consents,
    ccdcForms,
  ] = await Promise.all([
    beneficiaryQuery,
    primaryStaffQuery,
    casesQuery,
    committedFormsQuery,
    allConsentsCountQuery,
    allCcdcCountQuery,
    assessmentFormsQuery,
    consentsQuery,
    ccdcFormsQuery,
  ]);

  const beneficiary = beneficiaryResult.data as BeneficiaryDetailQueryRow | null;
  if (!beneficiary) notFound();

  const primaryStaffName =
    (primaryStaffResult.data as { staff: StaffEmbed | null } | null)?.staff?.full_name ?? null;
  const cases = (casesResult.data as CaseQueryRow[] | null) ?? [];
  const currentCase = cases[0] ?? null;
  const committedForms = (committedFormsResult.data as CommittedFormQueryRow[] | null) ?? [];
  const allConsents = (allConsentsResult.data as { id: string; created_at: string }[] | null) ?? [];
  const allCcdc = (allCcdcResult.data as { id: string; created_at: string }[] | null) ?? [];

  // Vùng 1 — thống kê nhanh
  const lastSupportAt = committedForms[0]?.created_at ?? null;
  const upcomingAppointments = committedForms
    .map((f) => f.next_appointment)
    .filter((d): d is string => Boolean(d) && d! >= nowIso)
    .sort();
  const nextAppointment = upcomingAppointments[0] ?? null;
  const daysSinceIntake = Math.floor(
    (Date.now() - new Date(beneficiary.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  const totalSupportInstances = committedForms.length + allConsents.length + allCcdc.length;

  // Vùng 2 — timeline hợp nhất (theo bộ lọc ngày mang qua từ danh sách)
  const timelineEvents: TimelineEvent[] = [
    ...((assessmentForms.data as AssessmentFormQueryRow[] | null) ?? []).map(
      (row): TimelineEvent => ({
        type: "assessment_form",
        eventAt: row.created_at,
        label: row.form?.name ?? "Phiếu đánh giá",
        status: null,
      }),
    ),
    ...((consents.data as DocumentQueryRow[] | null) ?? []).map(
      (row): TimelineEvent => ({
        type: "consent",
        eventAt: row.created_at,
        label: "Biên bản đồng thuận",
        status: null,
      }),
    ),
    ...((ccdcForms.data as DocumentQueryRow[] | null) ?? []).map(
      (row): TimelineEvent => ({
        type: "ccdc_form",
        eventAt: row.created_at,
        label: "Cấp công cụ/dụng cụ",
        status: null,
      }),
    ),
    ...cases.map(
      (c): TimelineEvent => ({
        type: "case_opened",
        eventAt: c.opened_at,
        label: c.support_round ? `Đợt hỗ trợ: ${c.support_round}` : "Đợt hỗ trợ mới",
        status: c.status,
      }),
    ),
  ].sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime());

  // Vùng 3 — chuỗi điểm tiến bộ (VietPOS/WHODAS), toàn bộ lịch sử
  const progressSeries = buildProgressSeries(
    committedForms.map((row) => ({
      createdAt: row.created_at,
      formCode: row.form?.code,
      answers: row.answers,
    })),
  );

  // Vùng 4 — cảnh báo
  const alerts: CaseAlert[] = [];
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const threeSixtyFiveDaysAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const lastActivityTime = lastSupportAt
    ? new Date(lastSupportAt).getTime()
    : currentCase
      ? new Date(currentCase.opened_at).getTime()
      : null;

  if (currentCase?.status === "open" && lastActivityTime !== null && lastActivityTime < sixtyDaysAgo) {
    alerts.push({
      key: "stalled",
      severity: "warning",
      label: "Chững tiến độ — hồ sơ đang mở nhưng không có phiếu ghi nhận mới trong hơn 60 ngày.",
    });
  }

  const overdueUnaddressed = committedForms.some((f) => {
    if (!f.next_appointment || f.next_appointment >= nowIso) return false;
    return !committedForms.some((other) => other.created_at > f.next_appointment!);
  });
  if (overdueUnaddressed) {
    alerts.push({
      key: "overdue",
      severity: "warning",
      label: "Quá hạn tái khám — có lịch hẹn đã qua ngày mà chưa có phiếu ghi nhận nào sau đó.",
    });
  }

  if (progressSeries.length === 0) {
    alerts.push({
      key: "no_baseline",
      severity: "critical",
      label: "Chưa có đánh giá tiến bộ nào (VietPOS hoặc WHODAS/WHODAS-TETN) — không có cơ sở để đo tiến bộ.",
    });
  }

  if (progressSeries.some((s) => s.latestStatus === "khong_cai_thien")) {
    alerts.push({
      key: "no_improvement",
      severity: "critical",
      label: "Không cải thiện — điểm ghi nhận gần nhất không thấp hơn điểm tệ nhất từng ghi nhận. Cần trao đổi với cán bộ phụ trách.",
    });
  }

  if (currentCase?.status === "open" && new Date(currentCase.opened_at).getTime() < threeSixtyFiveDaysAgo) {
    alerts.push({
      key: "long_open",
      severity: "info",
      label: "Hồ sơ đang mở đã hơn 365 ngày chưa đóng — một số ca hỗ trợ dài hạn là bình thường, chỉ mang tính nhắc nhở.",
    });
  }

  if (!primaryStaffName) {
    alerts.push({
      key: "no_primary_staff",
      severity: "info",
      label: "Chưa có cán bộ phụ trách chính thức được gán cho NKT này.",
    });
  }

  // Bảng tài liệu (đã lọc theo from/to)
  const assessmentFormRows = (assessmentForms.data as AssessmentFormQueryRow[] | null) ?? [];
  const consentRows = (consents.data as DocumentQueryRow[] | null) ?? [];
  const ccdcFormRows = (ccdcForms.data as DocumentQueryRow[] | null) ?? [];

  const rows: ReportRow[] = [
    ...assessmentFormRows.map((row): ReportRow => ({
      resourceType: "assessment_form",
      resourceId: row.id,
      beneficiaryName: beneficiary.full_name,
      beneficiaryPhone: beneficiary.phone,
      documentLabel: row.form?.name ?? "Phiếu đánh giá",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: Boolean(row.excel_path),
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
    ...consentRows.map((row): ReportRow => ({
      resourceType: "consent",
      resourceId: row.id,
      beneficiaryName: beneficiary.full_name,
      beneficiaryPhone: beneficiary.phone,
      documentLabel: "Biên bản đồng thuận",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: false,
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
    ...ccdcFormRows.map((row): ReportRow => ({
      resourceType: "ccdc_form",
      resourceId: row.id,
      beneficiaryName: beneficiary.full_name,
      beneficiaryPhone: beneficiary.phone,
      documentLabel: "Biên bản cấp công cụ/dụng cụ",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: false,
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const backQuery = new URLSearchParams();
  if (q) backQuery.set("q", q);
  if (from) backQuery.set("from", from);
  if (to) backQuery.set("to", to);
  if (page) backQuery.set("page", page);
  const backQueryString = backQuery.toString();

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/reports${backQueryString ? `?${backQueryString}` : ""}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại danh sách
      </Link>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-lg font-semibold">{beneficiary.full_name}</h1>
          <span className="font-mono text-xs text-muted-foreground">{beneficiary.code ?? "—"}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>SĐT: {beneficiary.phone ?? "—"}</span>
          <span>Dạng tật: {beneficiary.disability_type ?? "—"}</span>
          <span>Mức độ: {beneficiary.disability_level ?? "—"}</span>
          <span>Tỉnh: {beneficiary.province?.name ?? "—"}</span>
          {currentCase && <span>Trạng thái hồ sơ: {currentCase.status}</span>}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ClipboardList} label="Tổng lượt hỗ trợ" value={totalSupportInstances} />
        <StatTile icon={Clock} label="Đang hỗ trợ (ngày)" value={daysSinceIntake} />
        <InfoTile icon={Users} label="Cán bộ phụ trách chính" value={primaryStaffName ?? "Chưa gán"} />
        <InfoTile
          icon={CalendarClock}
          label="Lịch hẹn tái khám kế tiếp"
          value={nextAppointment ? formatDateTime(nextAppointment) : "Không có"}
        />
      </section>

      {alerts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Cảnh báo</h2>
          <CaseAlerts alerts={alerts} />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Tiến bộ theo lần ghi nhận</h2>
        <ProgressLineChart series={progressSeries} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Hành trình hỗ trợ</h2>
        <CaseTimeline events={timelineEvents} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Tài liệu (PDF/Excel)</h2>
        <ReportsTable rows={rows} />
      </section>
    </div>
  );
}
