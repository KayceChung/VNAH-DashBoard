export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          pdf_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          pdf_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          pdf_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      app_menu_items: {
        Row: {
          group_name: string
          icon_path: string | null
          id: string
          label: string
          link: string | null
          sort_order: number
        }
        Insert: {
          group_name: string
          icon_path?: string | null
          id?: string
          label: string
          link?: string | null
          sort_order?: number
        }
        Update: {
          group_name?: string
          icon_path?: string | null
          id?: string
          label?: string
          link?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      assessment_form_history: {
        Row: {
          assessment_form_id: string
          changed_at: string
          changed_by: string | null
          diff: Json
          id: string
        }
        Insert: {
          assessment_form_id: string
          changed_at?: string
          changed_by?: string | null
          diff: Json
          id?: string
        }
        Update: {
          assessment_form_id?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_form_history_assessment_form_id_fkey"
            columns: ["assessment_form_id"]
            isOneToOne: false
            referencedRelation: "assessment_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_form_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_forms: {
        Row: {
          answers: Json
          beneficiary_id: string
          case_id: string
          change_log: Json
          created_at: string
          deleted_at: string | null
          evaluation: string | null
          excel_path: string | null
          family_contact_id: string | null
          form_id: string
          id: string
          next_appointment: string | null
          pdf_path: string | null
          staff_id: string | null
          status: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          beneficiary_id: string
          case_id: string
          change_log?: Json
          created_at?: string
          deleted_at?: string | null
          evaluation?: string | null
          excel_path?: string | null
          family_contact_id?: string | null
          form_id: string
          id?: string
          next_appointment?: string | null
          pdf_path?: string | null
          staff_id?: string | null
          status?: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          beneficiary_id?: string
          case_id?: string
          change_log?: Json
          created_at?: string
          deleted_at?: string | null
          evaluation?: string | null
          excel_path?: string | null
          family_contact_id?: string | null
          form_id?: string
          id?: string
          next_appointment?: string | null
          pdf_path?: string | null
          staff_id?: string | null
          status?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_forms_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_forms_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_forms_family_contact_id_fkey"
            columns: ["family_contact_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_family_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_forms_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_forms_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_path: string
          resource_type: string
          staff_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_path: string
          resource_type: string
          staff_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_path?: string
          resource_type?: string
          staff_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          disability_cert_path: string | null
          disability_level: string | null
          disability_type: string | null
          dob: string | null
          ethnicity: string | null
          full_name: string
          has_disability_cert: boolean
          id: string
          image_path: string | null
          location: unknown
          managing_branch_id: string | null
          phone: string | null
          sex: string | null
          status: string
          updated_at: string
          updated_history: Json
          ward_id: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          disability_cert_path?: string | null
          disability_level?: string | null
          disability_type?: string | null
          dob?: string | null
          ethnicity?: string | null
          full_name: string
          has_disability_cert?: boolean
          id?: string
          image_path?: string | null
          location?: unknown
          managing_branch_id?: string | null
          phone?: string | null
          sex?: string | null
          status?: string
          updated_at?: string
          updated_history?: Json
          ward_id?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          disability_cert_path?: string | null
          disability_level?: string | null
          disability_type?: string | null
          dob?: string | null
          ethnicity?: string | null
          full_name?: string
          has_disability_cert?: boolean
          id?: string
          image_path?: string | null
          location?: unknown
          managing_branch_id?: string | null
          phone?: string | null
          sex?: string | null
          status?: string
          updated_at?: string
          updated_history?: Json
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_managing_branch_id_fkey"
            columns: ["managing_branch_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_assignments: {
        Row: {
          assigned_at: string
          beneficiary_id: string
          is_primary: boolean
          staff_id: string
        }
        Insert: {
          assigned_at?: string
          beneficiary_id: string
          is_primary?: boolean
          staff_id: string
        }
        Update: {
          assigned_at?: string
          beneficiary_id?: string
          is_primary?: boolean
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_assignments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_family_contacts: {
        Row: {
          beneficiary_id: string
          birth_year: number | null
          created_at: string
          deleted_at: string | null
          dob: string | null
          email: string | null
          full_name: string
          id: string
          image_path: string | null
          phone: string | null
          relationship: string | null
          sex: string | null
          signature_path: string | null
          updated_at: string
        }
        Insert: {
          beneficiary_id: string
          birth_year?: number | null
          created_at?: string
          deleted_at?: string | null
          dob?: string | null
          email?: string | null
          full_name: string
          id?: string
          image_path?: string | null
          phone?: string | null
          relationship?: string | null
          sex?: string | null
          signature_path?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          birth_year?: number | null
          created_at?: string
          deleted_at?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string
          id?: string
          image_path?: string | null
          phone?: string | null
          relationship?: string | null
          sex?: string | null
          signature_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_family_contacts_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          beneficiary_id: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          opened_at: string
          opened_by: string | null
          patient_type: string | null
          program_type: string | null
          project_id: string | null
          recorded_at: string
          status: string
          support_round: string | null
          updated_at: string
        }
        Insert: {
          beneficiary_id: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          patient_type?: string | null
          program_type?: string | null
          project_id?: string | null
          recorded_at?: string
          status?: string
          support_round?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          opened_at?: string
          opened_by?: string | null
          patient_type?: string | null
          program_type?: string | null
          project_id?: string | null
          recorded_at?: string
          status?: string
          support_round?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      ccdc_forms: {
        Row: {
          beneficiary_id: string
          case_id: string
          confirmed_by: string | null
          confirmed_by_relationship: string | null
          created_at: string
          disability_status: string | null
          equipment_id: string | null
          family_contact_id: string | null
          handling_direction: string | null
          handover_location: string | null
          id: string
          pdf_path: string | null
          po_code: string | null
          proof_image_path: string | null
          pwd_case_number: string | null
          reason: string | null
          record_location: unknown
          recorded_at: string | null
          request_id: string | null
          signature_path: string | null
          staff_id: string | null
          status: string | null
          vnah_staff_id: string | null
        }
        Insert: {
          beneficiary_id: string
          case_id: string
          confirmed_by?: string | null
          confirmed_by_relationship?: string | null
          created_at?: string
          disability_status?: string | null
          equipment_id?: string | null
          family_contact_id?: string | null
          handling_direction?: string | null
          handover_location?: string | null
          id?: string
          pdf_path?: string | null
          po_code?: string | null
          proof_image_path?: string | null
          pwd_case_number?: string | null
          reason?: string | null
          record_location?: unknown
          recorded_at?: string | null
          request_id?: string | null
          signature_path?: string | null
          staff_id?: string | null
          status?: string | null
          vnah_staff_id?: string | null
        }
        Update: {
          beneficiary_id?: string
          case_id?: string
          confirmed_by?: string | null
          confirmed_by_relationship?: string | null
          created_at?: string
          disability_status?: string | null
          equipment_id?: string | null
          family_contact_id?: string | null
          handling_direction?: string | null
          handover_location?: string | null
          id?: string
          pdf_path?: string | null
          po_code?: string | null
          proof_image_path?: string | null
          pwd_case_number?: string | null
          reason?: string | null
          record_location?: unknown
          recorded_at?: string | null
          request_id?: string | null
          signature_path?: string | null
          staff_id?: string | null
          status?: string | null
          vnah_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ccdc_forms_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_family_contact_id_fkey"
            columns: ["family_contact_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_family_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccdc_forms_vnah_staff_id_fkey"
            columns: ["vnah_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      codes: {
        Row: {
          category: string
          code: string
          content_en: string | null
          content_vi: string
          created_at: string
          id: string
        }
        Insert: {
          category: string
          code: string
          content_en?: string | null
          content_vi: string
          created_at?: string
          id?: string
        }
        Update: {
          category?: string
          code?: string
          content_en?: string | null
          content_vi?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          beneficiary_id: string | null
          case_id: string
          created_at: string
          family_contact_id: string | null
          id: string
          ncs_email: string | null
          ncs_full_name: string | null
          ncs_phone: string | null
          pdf_path: string | null
          proof_image_path: string | null
          record_location: unknown
          recorded_at: string | null
          signature_path: string | null
          signed_by: string | null
          signer_type: string | null
          staff_id: string | null
        }
        Insert: {
          beneficiary_id?: string | null
          case_id: string
          created_at?: string
          family_contact_id?: string | null
          id?: string
          ncs_email?: string | null
          ncs_full_name?: string | null
          ncs_phone?: string | null
          pdf_path?: string | null
          proof_image_path?: string | null
          record_location?: unknown
          recorded_at?: string | null
          signature_path?: string | null
          signed_by?: string | null
          signer_type?: string | null
          staff_id?: string | null
        }
        Update: {
          beneficiary_id?: string | null
          case_id?: string
          created_at?: string
          family_contact_id?: string | null
          id?: string
          ncs_email?: string | null
          ncs_full_name?: string | null
          ncs_phone?: string | null
          pdf_path?: string | null
          proof_image_path?: string | null
          record_location?: unknown
          recorded_at?: string | null
          signature_path?: string | null
          signed_by?: string | null
          signer_type?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_family_contact_id_fkey"
            columns: ["family_contact_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_family_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_logs: {
        Row: {
          audit_json: Json
          beneficiary_id: string
          created_at: string
          id: string
        }
        Insert: {
          audit_json: Json
          beneficiary_id: string
          created_at?: string
          id?: string
        }
        Update: {
          audit_json?: Json
          beneficiary_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      disability_articles: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          image_path: string | null
          pdf_path: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_path?: string | null
          pdf_path?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_path?: string | null
          pdf_path?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disability_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          province_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          province_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          province_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      download_logs: {
        Row: {
          created_at: string
          file_name: string | null
          filter_type: string | null
          id: string
          location: string | null
          patient_type: string | null
          period_from: string | null
          period_to: string | null
          staff_id: string | null
          template: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          filter_type?: string | null
          id?: string
          location?: string | null
          patient_type?: string | null
          period_from?: string | null
          period_to?: string | null
          staff_id?: string | null
          template?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          filter_type?: string | null
          id?: string
          location?: string | null
          patient_type?: string | null
          period_from?: string | null
          period_to?: string | null
          staff_id?: string | null
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_catalog: {
        Row: {
          brand_code: string | null
          brand_name: string | null
          created_at: string
          description: string | null
          equipment_type: string | null
          id: string
          image_path: string | null
          name: string
          unit: string | null
        }
        Insert: {
          brand_code?: string | null
          brand_name?: string | null
          created_at?: string
          description?: string | null
          equipment_type?: string | null
          id?: string
          image_path?: string | null
          name: string
          unit?: string | null
        }
        Update: {
          brand_code?: string | null
          brand_name?: string | null
          created_at?: string
          description?: string | null
          equipment_type?: string | null
          id?: string
          image_path?: string | null
          name?: string
          unit?: string | null
        }
        Relationships: []
      }
      equipment_request_approvals: {
        Row: {
          acted_at: string
          action: string
          id: string
          level: number
          request_id: string
          staff_id: string | null
        }
        Insert: {
          acted_at?: string
          action: string
          id?: string
          level?: number
          request_id: string
          staff_id?: string | null
        }
        Update: {
          acted_at?: string
          action?: string
          id?: string
          level?: number
          request_id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_request_approvals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_request_approvals_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_requests: {
        Row: {
          case_id: string
          description: string | null
          equipment_id: string | null
          id: string
          image_path: string | null
          reject_reason: string | null
          requested_at: string
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_path?: string | null
          reject_reason?: string | null
          requested_at?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          image_path?: string | null
          reject_reason?: string | null
          requested_at?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          auto_timestamp_of: string | null
          blocks_commit_if_missing: boolean
          composite_of_fields: string | null
          count_of_field: string | null
          data_type: string
          default_from_case_field: string | null
          default_from_form_answer: string | null
          form_id: string
          help_text: string | null
          id: string
          is_active: boolean
          is_computed_attendance: boolean
          is_computed_score: boolean
          is_computed_sum: boolean
          is_required: boolean
          label: string
          layout_row_group: string | null
          months_since_form_field: string | null
          options: Json | null
          order_index: number
          question_code: string
          section: string | null
          show_if: Json | null
          staff_title_filter: string | null
        }
        Insert: {
          auto_timestamp_of?: string | null
          blocks_commit_if_missing?: boolean
          composite_of_fields?: string | null
          count_of_field?: string | null
          data_type?: string
          default_from_case_field?: string | null
          default_from_form_answer?: string | null
          form_id: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_computed_attendance?: boolean
          is_computed_score?: boolean
          is_computed_sum?: boolean
          is_required?: boolean
          label: string
          layout_row_group?: string | null
          months_since_form_field?: string | null
          options?: Json | null
          order_index?: number
          question_code: string
          section?: string | null
          show_if?: Json | null
          staff_title_filter?: string | null
        }
        Update: {
          auto_timestamp_of?: string | null
          blocks_commit_if_missing?: boolean
          composite_of_fields?: string | null
          count_of_field?: string | null
          data_type?: string
          default_from_case_field?: string | null
          default_from_form_answer?: string | null
          form_id?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_computed_attendance?: boolean
          is_computed_score?: boolean
          is_computed_sum?: boolean
          is_required?: boolean
          label?: string
          layout_row_group?: string | null
          months_since_form_field?: string | null
          options?: Json | null
          order_index?: number
          question_code?: string
          section?: string | null
          show_if?: Json | null
          staff_title_filter?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          category: string
          code: string
          id: string
          is_active: boolean
          name: string
          version: number
        }
        Insert: {
          category: string
          code: string
          id?: string
          is_active?: boolean
          name: string
          version?: number
        }
        Update: {
          category?: string
          code?: string
          id?: string
          is_active?: boolean
          name?: string
          version?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          beneficiary_id: string | null
          case_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          document_name: string | null
          id: string
          image_paths: string[]
        }
        Insert: {
          beneficiary_id?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_name?: string | null
          id?: string
          image_paths?: string[]
        }
        Update: {
          beneficiary_id?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_name?: string | null
          id?: string
          image_paths?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "notes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_files: {
        Row: {
          file_ref: string | null
          generated_at: string
          generated_by: string | null
          id: string
          storage_path: string
        }
        Insert: {
          file_ref?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          storage_path: string
        }
        Update: {
          file_ref?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_files_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          code: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          kpi_target: number | null
          name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_target?: number | null
          name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpi_target?: number | null
          name?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      provinces: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          avatar_path: string | null
          created_at: string
          department_id: string | null
          dob: string | null
          email: string | null
          employee_code: string | null
          full_name: string
          id: string
          patient_permission_level_id: string | null
          phone: string | null
          qldl_permission_level_id: string | null
          role: string
          sex: string | null
          signature_path: string | null
          status: string
          title_id: string | null
          updated_at: string
          user_id: string | null
          ward_id: string | null
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          department_id?: string | null
          dob?: string | null
          email?: string | null
          employee_code?: string | null
          full_name: string
          id?: string
          patient_permission_level_id?: string | null
          phone?: string | null
          qldl_permission_level_id?: string | null
          role?: string
          sex?: string | null
          signature_path?: string | null
          status?: string
          title_id?: string | null
          updated_at?: string
          user_id?: string | null
          ward_id?: string | null
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          department_id?: string | null
          dob?: string | null
          email?: string | null
          employee_code?: string | null
          full_name?: string
          id?: string
          patient_permission_level_id?: string | null
          phone?: string | null
          qldl_permission_level_id?: string | null
          role?: string
          sex?: string | null
          signature_path?: string | null
          status?: string
          title_id?: string | null
          updated_at?: string
          user_id?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_patient_permission_level_id_fkey"
            columns: ["patient_permission_level_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_qldl_permission_level_id_fkey"
            columns: ["qldl_permission_level_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_branches: {
        Row: {
          province_id: string
          staff_id: string
        }
        Insert: {
          province_id: string
          staff_id: string
        }
        Update: {
          province_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_branches_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_branches_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_module_access: {
        Row: {
          menu_item_id: string
          staff_id: string
        }
        Insert: {
          menu_item_id: string
          staff_id: string
        }
        Update: {
          menu_item_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_module_access_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "app_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_module_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_patient_view_access: {
        Row: {
          menu_item_id: string
          staff_id: string
        }
        Insert: {
          menu_item_id: string
          staff_id: string
        }
        Update: {
          menu_item_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_patient_view_access_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "app_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_patient_view_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_qldl_view_access: {
        Row: {
          menu_item_id: string
          staff_id: string
        }
        Insert: {
          menu_item_id: string
          staff_id: string
        }
        Update: {
          menu_item_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_qldl_view_access_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "app_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_qldl_view_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          case_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          received_org: string | null
          received_org_number: string | null
          receiver_name: string | null
          receiver_phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          received_org?: string | null
          received_org_number?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          received_org?: string | null
          received_org_number?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_logs: {
        Row: {
          beneficiary_id: string | null
          case_id: string | null
          category: string | null
          checkin_at: string | null
          checkin_location: unknown
          checkout_at: string | null
          checkout_location: unknown
          id: string
          note: string | null
          reason: string | null
          staff_id: string | null
          status: string | null
          total_minutes: number | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          beneficiary_id?: string | null
          case_id?: string | null
          category?: string | null
          checkin_at?: string | null
          checkin_location?: unknown
          checkout_at?: string | null
          checkout_location?: unknown
          id?: string
          note?: string | null
          reason?: string | null
          staff_id?: string | null
          status?: string | null
          total_minutes?: number | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          beneficiary_id?: string | null
          case_id?: string | null
          category?: string | null
          checkin_at?: string | null
          checkin_location?: unknown
          checkout_at?: string | null
          checkout_location?: unknown
          id?: string
          note?: string | null
          reason?: string | null
          staff_id?: string | null
          status?: string | null
          total_minutes?: number | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_logs_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          code: string | null
          created_at: string
          district_id: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          district_id: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          district_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "wards_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _hard_delete_beneficiary: {
        Args: {
          _beneficiary_id: string
          _executed_by: string
          _execution_type: string
        }
        Returns: undefined
      }
      beneficiary_deletion_summary: {
        Args: { _beneficiary_id: string }
        Returns: Json
      }
      beneficiary_in_my_branch: {
        Args: { _beneficiary_id: string }
        Returns: boolean
      }
      case_in_my_branch: { Args: { _case_id: string }; Returns: boolean }
      current_staff_id: { Args: never; Returns: string }
      dashboard_form_counts: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          category: string
          count: number
          form_code: string
          form_name: string
        }[]
      }
      dashboard_gender_counts: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          count: number
          sex: string
        }[]
      }
      dashboard_province_counts: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          count: number
          province_code: string
          province_name: string
        }[]
      }
      hard_delete_beneficiary: {
        Args: { _beneficiary_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_content_admin: { Args: never; Returns: boolean }
      is_same_branch: {
        Args: { _managing_branch_id: string }
        Returns: boolean
      }
      purge_expired_beneficiaries: { Args: never; Returns: undefined }
      report_beneficiary_documents: {
        Args: {
          p_beneficiary_id: string
          p_from?: string
          p_limit?: number
          p_offset?: number
          p_to?: string
        }
        Returns: {
          created_at: string
          document_label: string
          external_link: string
          has_excel: boolean
          has_pdf: boolean
          resource_id: string
          resource_type: string
          staff_name: string
          total_matching: number
        }[]
      }
      report_beneficiary_summary: {
        Args: {
          p_from?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_to?: string
        }
        Returns: {
          assessment_count: number
          beneficiary_id: string
          ccdc_count: number
          code: string
          consent_count: number
          full_name: string
          last_activity: string
          phone: string
          total_count: number
          total_matching: number
        }[]
      }
      request_in_my_branch: { Args: { _request_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
