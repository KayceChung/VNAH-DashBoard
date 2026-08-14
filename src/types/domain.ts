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
