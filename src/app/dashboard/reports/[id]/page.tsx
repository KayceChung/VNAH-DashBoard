import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportsTable } from "@/components/reports-table";
import type { ReportRow } from "@/types/domain";

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
  province: { name: string } | null;
}

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string }>;
}

export default async function ReportBeneficiaryDetailPage({ params, searchParams }: ReportDetailPageProps) {
  const { id } = await params;
  const { q, from, to, page } = await searchParams;
  const supabase = await createClient();

  const fromBound = from ? `${from}T00:00:00` : null;
  const toBound = to ? `${to}T23:59:59.999` : null;

  const beneficiaryQuery = supabase
    .from("beneficiaries")
    .select("code, full_name, phone, disability_type, disability_level, province:provinces(name)")
    .eq("id", id)
    .maybeSingle();

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

  const [beneficiaryResult, assessmentForms, consents, ccdcForms] = await Promise.all([
    beneficiaryQuery,
    assessmentFormsQuery,
    consentsQuery,
    ccdcFormsQuery,
  ]);

  const beneficiary = beneficiaryResult.data as BeneficiaryDetailQueryRow | null;
  if (!beneficiary) notFound();

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
    <div className="space-y-4">
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
        </div>
      </div>

      <ReportsTable rows={rows} />
    </div>
  );
}
