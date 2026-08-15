/** Consistent "N/A" placeholder for a chart that has no usable data yet — distinct from an empty state, this means the metric can't be computed (e.g. not enough staff/periods to compare), not that the query returned zero rows. */
export function NotAvailable({ reason }: { reason: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
      <span className="text-lg font-semibold text-muted-foreground">N/A</span>
      <p className="max-w-xs text-xs text-muted-foreground">{reason}</p>
    </div>
  );
}
