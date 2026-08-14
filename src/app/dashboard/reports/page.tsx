import { createClient } from "@/lib/supabase/server";
import { ReportsTable } from "@/components/reports-table";
import { FormCountSummary } from "@/components/form-count-summary";
import type { FormSupportCount, ReportRow } from "@/types/domain";

const PAGE_LIMIT = 50;
// Separate, uncapped-ish query just for the summary counts below — the
// itemized table above is deliberately capped to the 50 most recent per
// resource type, which would under-count a "total by form type" summary.
const SUMMARY_FETCH_LIMIT = 20000;

// PostgREST embeds a many-to-one FK (e.g. assessment_forms.beneficiary_id ->
// beneficiaries.id) as a single object at runtime, but the generated
// Database type marks the relationship `isOneToOne: false` (looking at it
// from the "one" side's reverse direction), which makes supabase-js's
// string-based `.select()` inference type it as an array. Shaping the query
// result explicitly here is more reliable than fighting that inference.
interface BeneficiaryEmbed {
  full_name: string;
  phone: string | null;
}
interface StaffEmbed {
  full_name: string;
}
interface AssessmentFormQueryRow {
  id: string;
  created_at: string;
  pdf_path: string | null;
  excel_path: string | null;
  beneficiary: BeneficiaryEmbed | null;
  staff: StaffEmbed | null;
  form: { name: string } | null;
}
interface DocumentQueryRow {
  id: string;
  created_at: string;
  pdf_path: string | null;
  beneficiary: BeneficiaryEmbed | null;
  staff: StaffEmbed | null;
}
interface FormSummaryQueryRow {
  forms: { code: string; name: string; category: string } | null;
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const [assessmentForms, consents, ccdcForms, formSummary] = await Promise.all([
    supabase
      .from("assessment_forms")
      .select(
        "id, created_at, pdf_path, excel_path, beneficiary:beneficiaries(full_name, phone), staff:staff(full_name), form:forms(name)",
      )
      .not("pdf_path", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    supabase
      .from("consents")
      .select("id, created_at, pdf_path, beneficiary:beneficiaries(full_name, phone), staff:staff(full_name)")
      .not("pdf_path", "is", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    supabase
      .from("ccdc_forms")
      .select("id, created_at, pdf_path, beneficiary:beneficiaries(full_name, phone), staff:staff(full_name)")
      .not("pdf_path", "is", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    supabase
      .from("assessment_forms")
      .select("forms(code, name, category)")
      .not("pdf_path", "is", null)
      .is("deleted_at", null)
      .limit(SUMMARY_FETCH_LIMIT),
  ]);

  const assessmentFormRows = (assessmentForms.data as AssessmentFormQueryRow[] | null) ?? [];
  const consentRows = (consents.data as DocumentQueryRow[] | null) ?? [];
  const ccdcFormRows = (ccdcForms.data as DocumentQueryRow[] | null) ?? [];

  const formSummaryTally = new Map<string, FormSupportCount>();
  for (const row of (formSummary.data as FormSummaryQueryRow[] | null) ?? []) {
    if (!row.forms) continue;
    const existing = formSummaryTally.get(row.forms.code);
    if (existing) {
      existing.count += 1;
    } else {
      formSummaryTally.set(row.forms.code, {
        code: row.forms.code,
        name: row.forms.name,
        category: row.forms.category,
        count: 1,
      });
    }
  }
  const formSummaryCounts = Array.from(formSummaryTally.values()).sort((a, b) => b.count - a.count);

  const rows: ReportRow[] = [
    ...assessmentFormRows.map((row): ReportRow => ({
      resourceType: "assessment_form",
      resourceId: row.id,
      beneficiaryName: row.beneficiary?.full_name ?? "—",
      beneficiaryPhone: row.beneficiary?.phone ?? null,
      documentLabel: row.form?.name ?? "Phiếu đánh giá",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: Boolean(row.excel_path),
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
    ...consentRows.map((row): ReportRow => ({
      resourceType: "consent",
      resourceId: row.id,
      beneficiaryName: row.beneficiary?.full_name ?? "—",
      beneficiaryPhone: row.beneficiary?.phone ?? null,
      documentLabel: "Biên bản đồng thuận",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: false,
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
    ...ccdcFormRows.map((row): ReportRow => ({
      resourceType: "ccdc_form",
      resourceId: row.id,
      beneficiaryName: row.beneficiary?.full_name ?? "—",
      beneficiaryPhone: row.beneficiary?.phone ?? null,
      documentLabel: "Biên bản cấp công cụ/dụng cụ",
      hasPdf: Boolean(row.pdf_path),
      hasExcel: false,
      createdAt: row.created_at,
      staffName: row.staff?.full_name ?? null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Báo cáo</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách tài liệu PDF/Excel đã sinh từ ứng dụng di động. Xem file luôn qua liên kết bảo mật có hiệu
          lực 60 giây — không có đường dẫn công khai.
        </p>
      </div>
      <FormCountSummary data={formSummaryCounts} />
      <ReportsTable rows={rows} />
    </div>
  );
}
