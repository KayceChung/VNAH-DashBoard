import { createClient } from "@/lib/supabase/server";
import { VN_PROVINCE_CENTROIDS } from "@/lib/vn-province-centroids";
import { StatTile } from "@/components/dashboard/stat-tile";
import { FormsBarChart } from "@/components/dashboard/forms-bar-chart";
import { GenderBar } from "@/components/dashboard/gender-bar";
import { ProvinceMap } from "@/components/dashboard/province-map";
import { Users, ClipboardList, MapPinned } from "lucide-react";
import type { FormSupportCount, GenderCount, OverviewData, ProvinceCount } from "@/types/domain";

// Safety cap — comfortably above VNAH's current data volume. Revisit with a
// database-side aggregate (view/RPC) if the org's beneficiary/assessment
// counts grow past what's reasonable to pull into a single request.
const FETCH_LIMIT = 20000;

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
};

interface BeneficiaryStatsRow {
  sex: string | null;
  managing_branch_id: string | null;
  provinces: { code: string | null; name: string } | null;
}

interface AssessmentFormStatsRow {
  form_id: string;
  forms: { code: string; name: string; category: string } | null;
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  const [beneficiaries, assessmentForms] = await Promise.all([
    supabase
      .from("beneficiaries")
      .select("sex, managing_branch_id, provinces(code, name)")
      .eq("status", "active")
      .is("deleted_at", null)
      .limit(FETCH_LIMIT),
    supabase
      .from("assessment_forms")
      .select("form_id, forms(code, name, category)")
      .eq("status", "committed")
      .is("deleted_at", null)
      .limit(FETCH_LIMIT),
  ]);

  const beneficiaryRows = (beneficiaries.data as BeneficiaryStatsRow[] | null) ?? [];
  const assessmentFormRows = (assessmentForms.data as AssessmentFormStatsRow[] | null) ?? [];

  // Gender ratio
  const genderTally = new Map<string, number>();
  for (const row of beneficiaryRows) {
    const key = row.sex ?? "unknown";
    genderTally.set(key, (genderTally.get(key) ?? 0) + 1);
  }
  const genderCounts: GenderCount[] = Array.from(genderTally.entries())
    .map(([key, count]) => ({ label: GENDER_LABEL[key] ?? "Khác", count }))
    .sort((a, b) => b.count - a.count);

  // Beneficiaries by province (geography chart)
  const provinceTally = new Map<string, { name: string; count: number }>();
  for (const row of beneficiaryRows) {
    const code = row.provinces?.code;
    if (!code) continue;
    const existing = provinceTally.get(code);
    if (existing) {
      existing.count += 1;
    } else {
      provinceTally.set(code, { name: row.provinces!.name, count: 1 });
    }
  }
  const provinceCounts: ProvinceCount[] = Array.from(provinceTally.entries())
    .map(([code, { name, count }]) => {
      const centroid = VN_PROVINCE_CENTROIDS[code];
      return centroid ? { code, name, count, lat: centroid.lat, lng: centroid.lng } : null;
    })
    .filter((row): row is ProvinceCount => row !== null)
    .sort((a, b) => b.count - a.count);

  // Support instances by the clinical forms ("12 phiếu")
  const formTally = new Map<string, FormSupportCount>();
  for (const row of assessmentFormRows) {
    if (!row.forms) continue;
    const existing = formTally.get(row.forms.code);
    if (existing) {
      existing.count += 1;
    } else {
      formTally.set(row.forms.code, {
        code: row.forms.code,
        name: row.forms.name,
        category: row.forms.category,
        count: 1,
      });
    }
  }
  const formCounts = Array.from(formTally.values()).sort((a, b) => b.count - a.count);

  const overview: OverviewData = {
    totalBeneficiaries: beneficiaryRows.length,
    totalSupportInstances: assessmentFormRows.length,
    totalProvincesCovered: provinceTally.size,
    formCounts,
    genderCounts,
    provinceCounts,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">
          Tình hình hoạt động của tổ chức, tổng hợp từ dữ liệu ứng dụng di động.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Users}
          label="Số người khuyết tật (NKT)"
          value={overview.totalBeneficiaries}
        />
        <StatTile
          icon={ClipboardList}
          label="Lượt hỗ trợ đã ghi nhận"
          value={overview.totalSupportInstances}
        />
        <StatTile
          icon={MapPinned}
          label="Tỉnh/thành có NKT"
          value={overview.totalProvincesCovered}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 text-sm font-semibold">Tỷ lệ nam / nữ</h2>
          <p className="mb-4 text-xs text-muted-foreground">Trong tổng số NKT đang quản lý</p>
          <GenderBar data={overview.genderCounts} total={overview.totalBeneficiaries} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-1 text-sm font-semibold">NKT theo khu vực</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Kích thước &amp; màu bong bóng thể hiện số lượng NKT tại tỉnh/thành
          </p>
          <ProvinceMap data={overview.provinceCounts} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-semibold">Số lượt hỗ trợ theo phiếu đánh giá</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Số phiếu đã ghi nhận (Ghi nhận/commit) theo từng loại phiếu CSTN/PHCN
        </p>
        <FormsBarChart data={overview.formCounts} />
      </div>
    </div>
  );
}
