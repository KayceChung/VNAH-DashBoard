"use client";

import { Dialog } from "@/components/ui/dialog";

interface PdfViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Short-lived (60s) Supabase signed URL — never a public URL. */
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Renders a PDF from a blob: URL built out of a short-lived signed-URL
 * fetch (see reports-table.tsx) — never the direct storage URL, and never
 * persisted beyond this render. Deliberately unsandboxed: the content is a
 * blob we fetched ourselves after an RLS-checked, audit-logged lookup (not
 * arbitrary third-party HTML), and Chrome's built-in PDF viewer refuses to
 * render at all inside a sandboxed iframe regardless of which tokens are
 * granted — so sandboxing it here breaks the feature without adding
 * meaningful protection against content we already trust.
 */
export function PdfViewer({ open, onOpenChange, title, signedUrl, loading, error }: PdfViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} className="h-[85vh] max-w-4xl">
      {loading && (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Đang tạo liên kết xem an toàn...
        </div>
      )}
      {!loading && error && (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">
          {error}
        </div>
      )}
      {!loading && !error && signedUrl && (
        <iframe src={signedUrl} title={title} className="h-full min-h-[70vh] w-full" />
      )}
    </Dialog>
  );
}
