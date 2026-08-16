import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FormCountSummary } from "@/components/form-count-summary";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { BeneficiarySearchFilter } from "@/components/dashboard/beneficiary-search-filter";
import { Pagination } from "@/components/dashboard/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
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
  searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { q, from, to, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createClient();

  const fromBound = from ? `${from}T00:00:00` : null;
  const toBound = to ? `${to}T23:59:59.999` : null;

  let formSummaryQuery = supabase
    .from("assessment_forms")
    .select("forms(code, name, category)")
    .not("pdf_path", "is", null)
    .is("deleted_at", null)
    .limit(SUMMARY_FETCH_LIMIT);
  if (fromBound) formSummaryQuery = formSummaryQuery.gte("created_at", fromBound);
  if (toBound) formSummaryQuery = formSummaryQuery.lte("created_at", toBound);

  const [summaryResult, formSummary] = await Promise.all([
    supabase.rpc("report_beneficiary_summary", {
      p_search: q?.trim() || undefined,
      p_from: fromBound ?? undefined,
      p_to: toBound ?? undefined,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE,
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
  // detail page can return to the same search/date/page state.
  const detailQuery = new URLSearchParams();
  if (q) detailQuery.set("q", q);
  if (from) detailQuery.set("from", from);
  if (to) detailQuery.set("to", to);
  if (page > 1) detailQuery.set("page", String(page));
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

      {beneficiaries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Không tìm thấy NKT nào khớp bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NKT</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead className="text-right">Phiếu đánh giá</TableHead>
                <TableHead className="text-right">Đồng thuận</TableHead>
                <TableHead className="text-right">CCDC</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead>Lần gần nhất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((b) => (
                <TableRow key={b.beneficiaryId}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.code ?? "—"}</TableCell>
                  <TableCell className="font-medium">{b.fullName}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.assessmentCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.consentCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.ccdcCount}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{b.totalCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(b.lastActivity)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/reports/${b.beneficiaryId}${detailQueryString ? `?${detailQueryString}` : ""}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination page={page} pageSize={PAGE_SIZE} total={totalMatching} />
        </div>
      )}
    </div>
  );
}
