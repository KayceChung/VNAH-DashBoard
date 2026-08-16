import type { ImprovementStatus, ProgressFormCode, ProgressPoint, ProgressSeries } from "@/types/domain";

export const PROGRESS_SERIES_LABEL: Record<ProgressFormCode, string> = {
  CSTN_DGHD: "VietPOS (CSTN)",
  PHCN_WHODAS: "WHODAS (PHCN - người lớn)",
  PHCN_WHODAS_TETN: "WHODAS-TETN (PHCN - trẻ em/thanh niên)",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Reads the progress score for a committed form from its `answers` jsonb,
 * using the exact field names verified against the live DB and the original
 * AppSheet Excel templates (see "Dashboard Hồ Sơ Cá Nhân NKT" design doc).
 * `total_score` is intentionally not used — it's 100% NULL in production.
 */
export function extractProgressScore(formCode: string, answers: unknown): number | null {
  if (!answers || typeof answers !== "object") return null;
  const record = answers as Record<string, unknown>;
  switch (formCode) {
    case "CSTN_DGHD":
      return toNumber(record.Total_Scores);
    case "PHCN_WHODAS":
      // Matches the original AppSheet "cải thiện" formula, which compares POINT_P7.
      return toNumber(record.POINT_P7);
    case "PHCN_WHODAS_TETN":
      return toNumber(record.TOTAL_POINT);
    default:
      return null;
  }
}

/**
 * Replicates the original AppSheet "cải thiện" evaluation formulas exactly:
 * compare the latest record's score against MAX(score) across every
 * committed record of the same form code for this beneficiary (inclusive of
 * itself). Lower score = better for all three form codes. A lone first
 * record can't be judged either way, so it reports "-" rather than
 * misleadingly showing "không cải thiện" for a first-ever assessment — an
 * explicit, documented deviation from the literal formula (see design doc).
 */
export function computeImprovementStatus(points: ProgressPoint[], formCode: ProgressFormCode): ImprovementStatus {
  if (points.length < 2) return "-";
  const sorted = [...points].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const latest = sorted[sorted.length - 1]!;
  const maxScore = Math.max(...sorted.map((p) => p.score));
  const diff = latest.score - maxScore;
  if (diff < 0) return "cai_thien";
  if (diff === 0 && formCode === "CSTN_DGHD") return "on_dinh";
  return "khong_cai_thien";
}

export interface ProgressSourceRow {
  createdAt: string;
  formCode: string | null | undefined;
  answers: unknown;
}

export function buildProgressSeries(rows: ProgressSourceRow[]): ProgressSeries[] {
  const byCode = new Map<ProgressFormCode, ProgressPoint[]>();

  for (const row of rows) {
    if (!row.formCode || !(row.formCode in PROGRESS_SERIES_LABEL)) continue;
    const code = row.formCode as ProgressFormCode;
    const score = extractProgressScore(code, row.answers);
    if (score === null) continue;
    const points = byCode.get(code) ?? [];
    points.push({ createdAt: row.createdAt, score });
    byCode.set(code, points);
  }

  const series: ProgressSeries[] = [];
  for (const [formCode, points] of byCode) {
    const sortedPoints = [...points].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    series.push({
      formCode,
      seriesLabel: PROGRESS_SERIES_LABEL[formCode],
      points: sortedPoints,
      latestStatus: computeImprovementStatus(sortedPoints, formCode),
    });
  }

  // Stable order: CSTN before PHCN, adult before trẻ em/thanh niên.
  const order: ProgressFormCode[] = ["CSTN_DGHD", "PHCN_WHODAS", "PHCN_WHODAS_TETN"];
  series.sort((a, b) => order.indexOf(a.formCode) - order.indexOf(b.formCode));
  return series;
}
