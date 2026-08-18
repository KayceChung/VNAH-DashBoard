import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FormCountSummary } from "@/components/form-count-summary";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { BeneficiarySearchFilter } from "@/components/dashboard/beneficiary-search-filter";
import { PaginatedBeneficiaryList } from "@/components/dashboard/paginated-beneficiary-list";
import type { BeneficiaryReportSummary, FormSupportCount } from "@/types/domain";

const PAGE_SIZE = 20;
// Uncapped-ish query just for the "total by form type" summary — the
// per-NKT table below is grouped/paginated separately via the RPC.
const SUMMARY_FETCH_LIMIT = 20000;

interface FormSummaryQueryRow {
  forms: { code: string; name: string; category: string } | null;
}

interface ReportBeneficiarySummaryRpcRow {
  beneficiary_id: string;
  code: string | null;
  full_name: string;
  phone: string | null;
  assessment_count: number;
  consent_count: number;
  ccdc_count: number;
  total_count: number;
  last_activity: string;
  total_matching: number;
}

interface ReportsPageProps {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { q, from, to } = await searchParams;
  const supabase = await createClient();

  const fromBound = from ? `${from}T00:00:00` : null;
  const toBound = to ? `${to}T23:59:59.999` : null;

  let formSummaryQuery = supabase
    .from("assessment_forms")
    .select("forms(code, name, category)")
    .eq("status", "committed")
    .is("deleted_at", null)
    .limit(SUMMARY_FETCH_LIMIT);
  if (fromBound) formSummaryQuery = formSummaryQuery.gte("created_at", fromBound);
  if (toBound) formSummaryQuery = formSummaryQuery.lte("created_at", toBound);

  // Initial "Xem thêm" (load-more) batch — the client component fetches
  // further batches on demand instead of loading the full, potentially
  // thousands-of-NKT-long, result set up front.
  const [summaryResult, formSummary] = await Promise.all([
    supabase.rpc("report_beneficiary_summary", {
      p_search: q?.trim() || undefined,
      p_from: fromBound ?? undefined,
      p_to: toBound ?? undefined,
      p_limit: PAGE_SIZE,
      p_offset: 0,
    }),
    formSummaryQuery,
  ]);

  if (summaryResult.error) {
    console.error("report_beneficiary_summary failed", summaryResult.error);
  }

  const summaryRows = (summaryResult.data as ReportBeneficiarySummaryRpcRow[] | null) ?? [];
  const totalMatching = summaryRows[0]?.total_matching ?? 0;

  const beneficiaries: BeneficiaryReportSummary[] = summaryRows.map((row) => ({
    beneficiaryId: row.beneficiary_id,
    code: row.code,
    fullName: row.full_name,
    phone: row.phone,
    assessmentCount: row.assessment_count,
    consentCount: row.consent_count,
    ccdcCount: row.ccdc_count,
    totalCount: row.total_count,
    lastActivity: row.last_activity,
  }));

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

  // Detail links carry the current filters forward so "Quay lại" on the
  // detail page can return to the same search/date state.
  const detailQuery = new URLSearchParams();
  if (q) detailQuery.set("q", q);
  if (from) detailQuery.set("from", from);
  if (to) detailQuery.set("to", to);
  const detailQueryString = detailQuery.toString();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Báo cáo</h1>
        <p className="text-sm text-muted-foreground">
          Tài liệu PDF/Excel được gộp theo từng NKT — chọn một NKT để xem toàn bộ phiếu/consent/CCDC của người
          đó. Xem file luôn qua liên kết bảo mật có hiệu lực 60 giây — không có đường dẫn công khai.
        </p>
      </div>

      <Suspense fallback={null}>
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
          <BeneficiarySearchFilter />
          <DateRangeFilter />
        </div>
      </Suspense>

      <FormCountSummary data={formSummaryCounts} />

      <PaginatedBeneficiaryList
        initialRows={beneficiaries}
        initialTotal={totalMatching}
        q={q}
        fromBound={fromBound}
        toBound={toBound}
        detailQueryString={detailQueryString}
      />
    </div>
  );
}
