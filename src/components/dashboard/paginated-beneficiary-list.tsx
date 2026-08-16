"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { BeneficiaryReportSummary } from "@/types/domain";

const PAGE_SIZE = 20;

interface SummaryRpcRow {
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

function toSummary(row: SummaryRpcRow): BeneficiaryReportSummary {
  return {
    beneficiaryId: row.beneficiary_id,
    code: row.code,
    fullName: row.full_name,
    phone: row.phone,
    assessmentCount: row.assessment_count,
    consentCount: row.consent_count,
    ccdcCount: row.ccdc_count,
    totalCount: row.total_count,
    lastActivity: row.last_activity,
  };
}

interface PaginatedBeneficiaryListProps {
  initialRows: BeneficiaryReportSummary[];
  initialTotal: number;
  q?: string;
  fromBound: string | null;
  toBound: string | null;
  detailQueryString: string;
}

/** "Xem thêm" (load-more) instead of a full result set — with thousands of NKT, loading everything up front (or even one giant offset-paged table) makes the initial page heavy for no reason. */
export function PaginatedBeneficiaryList({
  initialRows,
  initialTotal,
  q,
  fromBound,
  toBound,
  detailQueryString,
}: PaginatedBeneficiaryListProps) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("report_beneficiary_summary", {
        p_search: q?.trim() || undefined,
        p_from: fromBound ?? undefined,
        p_to: toBound ?? undefined,
        p_limit: PAGE_SIZE,
        p_offset: rows.length,
      });
      if (rpcError) throw rpcError;
      const nextRows = ((data as SummaryRpcRow[] | null) ?? []).map(toSummary);
      setRows((prev) => [...prev, ...nextRows]);
      setTotal((data as SummaryRpcRow[] | null)?.[0]?.total_matching ?? total);
    } catch {
      setError("Không tải thêm được danh sách NKT. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Không tìm thấy NKT nào khớp bộ lọc hiện tại.
      </div>
    );
  }

  return (
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
          {rows.map((b) => (
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

      {rows.length < total ? (
        <div className="flex flex-col items-center gap-2">
          <Button size="sm" variant="outline" disabled={loading} onClick={loadMore}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Xem thêm ({rows.length}/{total.toLocaleString("vi-VN")})
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Đã hiển thị toàn bộ {total.toLocaleString("vi-VN")} NKT phù hợp.
        </p>
      )}
    </div>
  );
}
