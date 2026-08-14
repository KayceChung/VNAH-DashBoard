"use client";

import { useState } from "react";
import { FileText, Sheet as SheetIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/pdf-viewer";
import { maskSensitive, formatDateTime } from "@/lib/utils";
import type { ReportRow, ReportResourceType, SignedUrlResponse } from "@/types/domain";

const DOCUMENT_TYPE_LABEL: Record<ReportResourceType, string> = {
  assessment_form: "Phiếu đánh giá",
  consent: "Đồng thuận",
  ccdc_form: "CCDC",
};

interface ViewerState {
  open: boolean;
  title: string;
  loading: boolean;
  error: string | null;
  signedUrl: string | null;
}

const INITIAL_VIEWER_STATE: ViewerState = {
  open: false,
  title: "",
  loading: false,
  error: null,
  signedUrl: null,
};

export function ReportsTable({ rows }: { rows: ReportRow[] }) {
  const [viewer, setViewer] = useState<ViewerState>(INITIAL_VIEWER_STATE);

  async function openFile(row: ReportRow, fileKind: "pdf" | "excel") {
    setViewer({
      open: true,
      title: `${row.documentLabel} — ${row.beneficiaryName}`,
      loading: true,
      error: null,
      signedUrl: null,
    });

    try {
      const res = await fetch("/api/pdf/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType: row.resourceType,
          resourceId: row.resourceId,
          fileKind,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setViewer((prev) => ({
          ...prev,
          loading: false,
          error: body?.error ?? "Không thể tạo liên kết xem an toàn.",
        }));
        return;
      }

      const data = (await res.json()) as SignedUrlResponse;
      setViewer((prev) => ({ ...prev, loading: false, signedUrl: data.signedUrl }));
    } catch {
      setViewer((prev) => ({ ...prev, loading: false, error: "Lỗi kết nối, vui lòng thử lại." }));
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Chưa có tài liệu nào được đồng bộ từ ứng dụng di động.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người thụ hưởng</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Loại tài liệu</TableHead>
            <TableHead>Nhân sự ghi nhận</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.resourceType}-${row.resourceId}`}>
              <TableCell className="font-medium">{row.beneficiaryName}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {maskSensitive(row.beneficiaryPhone)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">{DOCUMENT_TYPE_LABEL[row.resourceType]}</Badge>
                  <span className="text-xs text-muted-foreground">{row.documentLabel}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.staffName ?? "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(row.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {row.hasPdf && (
                    <Button size="sm" variant="outline" onClick={() => openFile(row, "pdf")}>
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  )}
                  {row.hasExcel && (
                    <Button size="sm" variant="outline" onClick={() => openFile(row, "excel")}>
                      <SheetIcon className="h-3.5 w-3.5" />
                      Excel
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PdfViewer
        open={viewer.open}
        onOpenChange={(open) => setViewer((prev) => (open ? prev : INITIAL_VIEWER_STATE))}
        title={viewer.title}
        signedUrl={viewer.signedUrl}
        loading={viewer.loading}
        error={viewer.error}
      />
    </>
  );
}
