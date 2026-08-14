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
 * Renders a PDF strictly from a short-lived signed URL, inside a sandboxed
 * iframe. The URL is never persisted (not stored in component state beyond
 * this render, not written to localStorage/query params) so it expires with
 * no lingering, reusable link left in the browser.
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
        <iframe
          src={signedUrl}
          title={title}
          className="h-full min-h-[70vh] w-full"
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      )}
    </Dialog>
  );
}
