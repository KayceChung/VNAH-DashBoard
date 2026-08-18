"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReportsTable } from "@/components/reports-table";
import { Button } from "@/components/ui/button";
import type { ReportResourceType, ReportRow } from "@/types/domain";

const PAGE_SIZE = 20;

interface DocumentRpcRow {
  resource_type: string;
  resource_id: string;
  document_label: string;
  has_pdf: boolean;
  has_excel: boolean;
  external_link: string | null;
  created_at: string;
  staff_name: string | null;
  total_matching: number;
}

function toReportRow(row: DocumentRpcRow, beneficiaryName: string, beneficiaryPhone: string | null): ReportRow {
  return {
    resourceType: row.resource_type as ReportResourceType,
    resourceId: row.resource_id,
    beneficiaryName,
    beneficiaryPhone,
    documentLabel: row.document_label,
    hasPdf: row.has_pdf,
    hasExcel: row.has_excel,
    externalLink: row.external_link,
    createdAt: row.created_at,
    staffName: row.staff_name,
  };
}

interface PaginatedReportsTableProps {
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string | null;
  initialRows: ReportRow[];
  initialTotal: number;
  fromBound: string | null;
  toBound: string | null;
}

/** "Xem thêm" (load-more) instead of loading every document for a NKT at once — a NKT can accumulate dozens of forms over years, and with no date filter applied that list has no natural cap. */
export function PaginatedReportsTable({
  beneficiaryId,
  beneficiaryName,
  beneficiaryPhone,
  initialRows,
  initialTotal,
  fromBound,
  toBound,
}: PaginatedReportsTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("report_beneficiary_documents", {
        p_beneficiary_id: beneficiaryId,
        p_from: fromBound ?? undefined,
        p_to: toBound ?? undefined,
        p_limit: PAGE_SIZE,
        p_offset: rows.length,
      });
      if (rpcError) throw rpcError;
      const nextRows = ((data as DocumentRpcRow[] | null) ?? []).map((row) =>
        toReportRow(row, beneficiaryName, beneficiaryPhone),
      );
      setRows((prev) => [...prev, ...nextRows]);
      setTotal((data as DocumentRpcRow[] | null)?.[0]?.total_matching ?? total);
    } catch {
      setError("Không tải thêm được tài liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <ReportsTable rows={rows} />
      {rows.length < total && (
        <div className="flex flex-col items-center gap-2">
          <Button size="sm" variant="outline" disabled={loading} onClick={loadMore}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Xem thêm ({rows.length}/{total.toLocaleString("vi-VN")})
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
