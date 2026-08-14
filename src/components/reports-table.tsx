"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Sheet as SheetIcon } from "lucide-react";
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
  blobUrl: string | null;
}

const INITIAL_VIEWER_STATE: ViewerState = {
  open: false,
  title: "",
  loading: false,
  error: null,
  blobUrl: null,
};

async function requestSignedUrl(row: ReportRow, fileKind: "pdf" | "excel") {
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
    throw new Error(body?.error ?? "Không thể tạo liên kết xem an toàn.");
  }

  const data = (await res.json()) as SignedUrlResponse;
  return data.signedUrl;
}

export function ReportsTable({ rows }: { rows: ReportRow[] }) {
  const [viewer, setViewer] = useState<ViewerState>(INITIAL_VIEWER_STATE);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const activeBlobUrl = useRef<string | null>(null);

  function releaseBlobUrl() {
    if (activeBlobUrl.current) {
      URL.revokeObjectURL(activeBlobUrl.current);
      activeBlobUrl.current = null;
    }
  }

  async function openPdf(row: ReportRow) {
    releaseBlobUrl();
    setViewer({
      open: true,
      title: `${row.documentLabel} — ${row.beneficiaryName}`,
      loading: true,
      error: null,
      blobUrl: null,
    });

    try {
      const signedUrl = await requestSignedUrl(row, "pdf");
      // The signed URL points at Supabase Storage's own origin, which can
      // refuse to be framed directly (X-Frame-Options/CSP). Fetching the
      // bytes ourselves and handing the iframe a same-origin blob: URL
      // sidesteps that and renders reliably in Chrome's built-in PDF viewer.
      const fileRes = await fetch(signedUrl);
      if (!fileRes.ok) throw new Error("Không tải được nội dung tệp.");
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrl.current = blobUrl;
      setViewer((prev) => ({ ...prev, loading: false, blobUrl }));
    } catch (err) {
      setViewer((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Lỗi kết nối, vui lòng thử lại.",
      }));
    }
  }

  function closeViewer(open: boolean) {
    if (open) return;
    releaseBlobUrl();
    setViewer(INITIAL_VIEWER_STATE);
  }

  async function downloadExcel(row: ReportRow) {
    const key = `${row.resourceType}-${row.resourceId}`;
    setDownloadingKey(key);
    try {
      const signedUrl = await requestSignedUrl(row, "excel");
      const fileRes = await fetch(signedUrl);
      if (!fileRes.ok) throw new Error("Không tải được nội dung tệp.");
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${row.beneficiaryName} - ${row.documentLabel}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.alert("Không thể tải bảng điểm Excel. Vui lòng thử lại.");
    } finally {
      setDownloadingKey(null);
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
          {rows.map((row) => {
            const key = `${row.resourceType}-${row.resourceId}`;
            const isDownloading = downloadingKey === key;
            return (
              <TableRow key={key}>
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
                      <Button size="sm" variant="outline" onClick={() => openPdf(row)}>
                        <FileText className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    )}
                    {row.hasExcel && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        onClick={() => downloadExcel(row)}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <SheetIcon className="h-3.5 w-3.5" />
                        )}
                        Excel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PdfViewer
        open={viewer.open}
        onOpenChange={closeViewer}
        title={viewer.title}
        signedUrl={viewer.blobUrl}
        loading={viewer.loading}
        error={viewer.error}
      />
    </>
  );
}
