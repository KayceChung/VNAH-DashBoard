import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { VN_PROVINCE_CENTROIDS } from "@/lib/vn-province-centroids";
import { StatTile } from "@/components/dashboard/stat-tile";
import { FormsBarChart } from "@/components/dashboard/forms-bar-chart";
import { GenderBar } from "@/components/dashboard/gender-bar";
import { ProvinceMap } from "@/components/dashboard/province-map";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { InfoTooltip } from "@/components/dashboard/info-tooltip";
import { Users, ClipboardList, MapPinned } from "lucide-react";
import type { FormSupportCount, GenderCount, OverviewData, ProvinceCount } from "@/types/domain";

const GENDER_LABEL: Record<string, string> = {
  Nam: "Nam",
  Nữ: "Nữ",
};

interface GenderCountsRpcRow {
  sex: string | null;
  count: number;
}
interface ProvinceCountsRpcRow {
  province_code: string;
  province_name: string;
  count: number;
}
interface FormCountsRpcRow {
  form_code: string;
  form_name: string;
  category: string;
  count: number;
}

interface DashboardOverviewPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function DashboardOverviewPage({ searchParams }: DashboardOverviewPageProps) {
  const { from, to } = await searchParams;
  const supabase = await createClient();

  const fromBound = from ? `${from}T00:00:00` : undefined;
  const toBound = to ? `${to}T23:59:59.999` : undefined;

  // Aggregation happens in Postgres (RPCs below), not by pulling every
  // beneficiary/assessment_form row into Next.js — that silently truncates
  // at PostgREST's project-level max-rows cap once the org's data crosses
  // it (charts under-counted once real historical data was imported).
  let totalBeneficiariesQuery = supabase
    .from("beneficiaries")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .is("deleted_at", null);
  if (fromBound) totalBeneficiariesQuery = totalBeneficiariesQuery.gte("created_at", fromBound);
  if (toBound) totalBeneficiariesQuery = totalBeneficiariesQuery.lte("created_at", toBound);

  let totalSupportQuery = supabase
    .from("assessment_forms")
    .select("id", { count: "exact", head: true })
    .eq("status", "committed")
    .is("deleted_at", null);
  if (fromBound) totalSupportQuery = totalSupportQuery.gte("created_at", fromBound);
  if (toBound) totalSupportQuery = totalSupportQuery.lte("created_at", toBound);

  const [totalBeneficiariesResult, totalSupportResult, genderResult, provinceResult, formResult] =
    await Promise.all([
      totalBeneficiariesQuery,
      totalSupportQuery,
      supabase.rpc("dashboard_gender_counts", { p_from: fromBound, p_to: toBound }),
      supabase.rpc("dashboard_province_counts", { p_from: fromBound, p_to: toBound }),
      supabase.rpc("dashboard_form_counts", { p_from: fromBound, p_to: toBound }),
    ]);

  // Gender ratio — any raw value that isn't Nam/Nữ (including null) merges
  // into a single "Khác" bucket instead of one bar per unrecognized value.
  const genderTally = new Map<string, number>();
  for (const row of (genderResult.data as GenderCountsRpcRow[] | null) ?? []) {
    const label = (row.sex && GENDER_LABEL[row.sex]) || "Khác";
    genderTally.set(label, (genderTally.get(label) ?? 0) + row.count);
  }
  const genderCounts: GenderCount[] = Array.from(genderTally.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const provinceRows = (provinceResult.data as ProvinceCountsRpcRow[] | null) ?? [];
  const provinceCounts: ProvinceCount[] = provinceRows
    .map((row) => {
      const centroid = VN_PROVINCE_CENTROIDS[row.province_code];
      return centroid
        ? { code: row.province_code, name: row.province_name, count: row.count, lat: centroid.lat, lng: centroid.lng }
        : null;
    })
    .filter((row): row is ProvinceCount => row !== null)
    .sort((a, b) => b.count - a.count);

  const formCounts: FormSupportCount[] = ((formResult.data as FormCountsRpcRow[] | null) ?? [])
    .map((row) => ({ code: row.form_code, name: row.form_name, category: row.category, count: row.count }))
    .sort((a, b) => b.count - a.count);

  const overview: OverviewData = {
    totalBeneficiaries: totalBeneficiariesResult.count ?? 0,
    totalSupportInstances: totalSupportResult.count ?? 0,
    totalProvincesCovered: provinceRows.length,
    formCounts,
    genderCounts,
    provinceCounts,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">
            Tình hình hoạt động của tổ chức, tổng hợp từ dữ liệu ứng dụng di động.
          </p>
        </div>
        <Suspense fallback={null}>
          <DateRangeFilter />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Users}
          label="Số người khuyết tật (NKT)"
          value={overview.totalBeneficiaries}
          info="Tổng số hồ sơ NKT đang hoạt động (không tính hồ sơ đã xoá), trong khoảng thời gian đã lọc ở trên."
        />
        <StatTile
          icon={ClipboardList}
          label="Lượt hỗ trợ đã ghi nhận"
          value={overview.totalSupportInstances}
          info="Tổng số phiếu đánh giá/theo dõi đã được nhân sự ghi nhận (chốt) trong khoảng thời gian đã lọc."
        />
        <StatTile
          icon={MapPinned}
          label="Tỉnh/thành có NKT"
          value={overview.totalProvincesCovered}
          info="Số tỉnh/thành khác nhau có ít nhất 1 NKT đang được quản lý."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            Tỷ lệ nam / nữ
            <InfoTooltip text="Tỷ lệ NKT theo giới tính trên tổng số NKT đang quản lý. Các giá trị giới tính không xác định hoặc còn thiếu được gộp vào nhóm 'Khác'." />
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">Trong tổng số NKT đang quản lý</p>
          <GenderBar data={overview.genderCounts} total={overview.totalBeneficiaries} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            NKT theo khu vực
            <InfoTooltip text="Mỗi bong bóng là một tỉnh/thành có NKT đang được quản lý. Bong bóng càng lớn và màu càng đậm nghĩa là tỉnh đó có càng nhiều NKT." />
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Kích thước &amp; màu bong bóng thể hiện số lượng NKT tại tỉnh/thành
          </p>
          <ProvinceMap data={overview.provinceCounts} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
          Số lượt hỗ trợ theo phiếu đánh giá
          <InfoTooltip text="Số lượng phiếu đã được nhân sự ghi nhận (chốt), phân theo từng loại phiếu đánh giá/theo dõi của CSTN và PHCN." />
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Số phiếu đã ghi nhận (Ghi nhận/commit) theo từng loại phiếu CSTN/PHCN
        </p>
        <FormsBarChart data={overview.formCounts} />
      </div>
    </div>
  );
}
