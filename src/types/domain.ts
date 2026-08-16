import type { Database } from "@/types/supabase";

export type Staff = Database["public"]["Tables"]["staff"]["Row"];
export type Beneficiary = Database["public"]["Tables"]["beneficiaries"]["Row"];
export type AssessmentForm = Database["public"]["Tables"]["assessment_forms"]["Row"];
export type Consent = Database["public"]["Tables"]["consents"]["Row"];
export type CcdcForm = Database["public"]["Tables"]["ccdc_forms"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export type StaffRole = "staff" | "manager" | "admin";

/** The three tables in the real schema that hold a generated PDF path. */
export type ReportResourceType = "assessment_form" | "consent" | "ccdc_form";

/**
 * One row per generated document, normalized across assessment_forms,
 * consents, and ccdc_forms so the reports table can render them together.
 */
export interface ReportRow {
  resourceType: ReportResourceType;
  resourceId: string;
  beneficiaryName: string;
  beneficiaryPhone: string | null;
  documentLabel: string;
  hasPdf: boolean;
  hasExcel: boolean;
  createdAt: string;
  staffName: string | null;
}

export interface SignedUrlRequest {
  resourceType: ReportResourceType;
  resourceId: string;
  fileKind: "pdf" | "excel";
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresIn: number;
}

export interface FormSupportCount {
  code: string;
  name: string;
  category: string;
  count: number;
}

export interface BeneficiaryReportSummary {
  beneficiaryId: string;
  code: string | null;
  fullName: string;
  phone: string | null;
  assessmentCount: number;
  consentCount: number;
  ccdcCount: number;
  totalCount: number;
  lastActivity: string;
}

export interface CaseSupportCount {
  caseId: string;
  beneficiaryName: string;
  count: number;
}

export interface GenderCount {
  label: string;
  count: number;
}

export interface ProvinceCount {
  code: string;
  name: string;
  count: number;
  lat: number;
  lng: number;
}

export interface OverviewData {
  totalBeneficiaries: number;
  totalSupportInstances: number;
  totalProvincesCovered: number;
  formCounts: FormSupportCount[];
  genderCounts: GenderCount[];
  provinceCounts: ProvinceCount[];
}

export interface StaffOption {
  id: string;
  fullName: string;
  title: string | null;
}

export interface StaffPerformanceRow {
  staffId: string;
  fullName: string;
  title: string | null;
  formsCommitted: number;
  formsDrafted: number;
  completionRate: number | null;
  casesOpened: number;
  beneficiariesAssigned: number;
  avgRevisions: number | null;
}

export interface TrendPoint {
  monthLabel: string;
  count: number;
}

export interface FunnelStepDatum {
  label: string;
  count: number;
}

export interface HeatmapCell {
  weekday: number;
  staffId: string;
  staffLabel: string;
  count: number;
}

export interface ScatterDatum {
  staffId: string;
  label: string;
  volume: number;
  revisions: number;
}

export interface RadarAxisDatum {
  axis: string;
  individual: number;
  teamAverage: number;
}
