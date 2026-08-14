import { HorizontalBarChart } from "@/components/dashboard/horizontal-bar-chart";
import type { FormSupportCount } from "@/types/domain";

export function FormsBarChart({ data }: { data: FormSupportCount[] }) {
  return (
    <HorizontalBarChart
      data={data.map((row) => ({ key: row.code, label: row.name, count: row.count }))}
      emptyLabel="Chưa có phiếu nào được ghi nhận."
      unitLabel="lượt"
    />
  );
}
