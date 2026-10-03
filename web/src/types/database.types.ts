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
  public: {
    Tables: {
      ae_boq_items: {
        Row: {
          code: string
          description: string
          formula_template: string | null
          id: string
          project_id: string | null
          rate: number
          required_variables: string | null
          sl_no: number
          unit: string
        }
        Insert: {
          code: string
          description: string
          formula_template?: string | null
          id: string
          project_id?: string | null
          rate: number
          required_variables?: string | null
          sl_no: number
          unit: string
        }
        Update: {
          code?: string
          description?: string
          formula_template?: string | null
          id?: string
          project_id?: string | null
          rate?: number
          required_variables?: string | null
          sl_no?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_boq_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ae_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_dsr_categories: {
        Row: {
          code: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          code?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ae_dsr_items: {
        Row: {
          category_id: string | null
          description: string
          embedding: string | null
          formula_template: string | null
          id: string
          item_code: string
          rate: number
          required_variables: string | null
          unit: string
        }
        Insert: {
          category_id?: string | null
          description: string
          embedding?: string | null
          formula_template?: string | null
          id: string
          item_code: string
          rate: number
          required_variables?: string | null
          unit: string
        }
        Update: {
          category_id?: string | null
          description?: string
          embedding?: string | null
          formula_template?: string | null
          id?: string
          item_code?: string
          rate?: number
          required_variables?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_dsr_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ae_dsr_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_measurements: {
        Row: {
          boq_item_id: string | null
          description: string
          id: string
          order_index: number
          quantity: number
          variables_json: string
        }
        Insert: {
          boq_item_id?: string | null
          description: string
          id: string
          order_index: number
          quantity: number
          variables_json: string
        }
        Update: {
          boq_item_id?: string | null
          description?: string
          id?: string
          order_index?: number
          quantity?: number
          variables_json?: string
        }
        Relationships: [
          {
            foreignKeyName: "ae_measurements_boq_item_id_fkey"
            columns: ["boq_item_id"]
            isOneToOne: false
            referencedRelation: "ae_boq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ae_projects: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          location?: string | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          action_by: string | null
          attachments: Json | null
          comments: string | null
          created_at: string | null
          id: string
          project_id: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          action_by?: string | null
          attachments?: Json | null
          comments?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          action_by?: string | null
          attachments?: Json | null
          comments?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approvals_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_items: {
        Row: {
          amount: number | null
          boq_id: string
          created_at: string | null
          description: string
          id: string
          is_validated: boolean | null
          item_number: string | null
          matched_confidence: number | null
          project_id: string
          quantity: number | null
          quantity_variance: number | null
          rate: number | null
          rate_master_id: string | null
          rate_variance: number | null
          raw_text: string | null
          sor_code: string | null
          sort_order: number | null
          unit: string | null
          validation_notes: string | null
          validation_status: string | null
        }
        Insert: {
          amount?: number | null
          boq_id: string
          created_at?: string | null
          description: string
          id?: string
          is_validated?: boolean | null
          item_number?: string | null
          matched_confidence?: number | null
          project_id: string
          quantity?: number | null
          quantity_variance?: number | null
          rate?: number | null
          rate_master_id?: string | null
          rate_variance?: number | null
          raw_text?: string | null
          sor_code?: string | null
          sort_order?: number | null
          unit?: string | null
          validation_notes?: string | null
          validation_status?: string | null
        }
        Update: {
          amount?: number | null
          boq_id?: string
          created_at?: string | null
          description?: string
          id?: string
          is_validated?: boolean | null
          item_number?: string | null
          matched_confidence?: number | null
          project_id?: string
          quantity?: number | null
          quantity_variance?: number | null
          rate?: number | null
          rate_master_id?: string | null
          rate_variance?: number | null
          raw_text?: string | null
          sor_code?: string | null
          sort_order?: number | null
          unit?: string | null
          validation_notes?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_rate_master_id_fkey"
            columns: ["rate_master_id"]
            isOneToOne: false
            referencedRelation: "rate_master"
            referencedColumns: ["id"]
          },
        ]
      }
      boqs: {
        Row: {
          ai_validation_report: Json | null
          contractor_name: string | null
          created_at: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          item_count: number | null
          name: string
          notes: string | null
          ocr_confidence: number | null
          parsed_at: string | null
          project_id: string
          status: Database["public"]["Enums"]["boq_status"] | null
          total_amount: number | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_validation_report?: Json | null
          contractor_name?: string | null
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          item_count?: number | null
          name: string
          notes?: string | null
          ocr_confidence?: number | null
          parsed_at?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["boq_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_validation_report?: Json | null
          contractor_name?: string | null
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          item_count?: number | null
          name?: string
          notes?: string | null
          ocr_confidence?: number | null
          parsed_at?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["boq_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boqs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          ai_warnings: Json | null
          assumptions: Json | null
          beam_size: string | null
          breadth: number | null
          carpet_area: number | null
          column_size: string | null
          column_spacing_x: number | null
          column_spacing_y: number | null
          created_at: string | null
          flooring_type: string | null
          footing_size: string | null
          foundation_depth: number | null
          height: number | null
          id: string
          length: number | null
          name: string
          num_floors: number | null
          painting_type: string | null
          plaster_type: string | null
          plinth_area: number | null
          plinth_height: number | null
          post_type: string | null
          project_id: string
          roof_slope: number | null
          slab_thickness: number | null
          total_built_up_area: number | null
          truss_type: string | null
          type: Database["public"]["Enums"]["building_type"]
          updated_at: string | null
          verandah_width: number | null
          wall_thickness: number | null
          waterproofing_type: string | null
        }
        Insert: {
          ai_warnings?: Json | null
          assumptions?: Json | null
          beam_size?: string | null
          breadth?: number | null
          carpet_area?: number | null
          column_size?: string | null
          column_spacing_x?: number | null
          column_spacing_y?: number | null
          created_at?: string | null
          flooring_type?: string | null
          footing_size?: string | null
          foundation_depth?: number | null
          height?: number | null
          id?: string
          length?: number | null
          name: string
          num_floors?: number | null
          painting_type?: string | null
          plaster_type?: string | null
          plinth_area?: number | null
          plinth_height?: number | null
          post_type?: string | null
          project_id: string
          roof_slope?: number | null
          slab_thickness?: number | null
          total_built_up_area?: number | null
          truss_type?: string | null
          type?: Database["public"]["Enums"]["building_type"]
          updated_at?: string | null
          verandah_width?: number | null
          wall_thickness?: number | null
          waterproofing_type?: string | null
        }
        Update: {
          ai_warnings?: Json | null
          assumptions?: Json | null
          beam_size?: string | null
          breadth?: number | null
          carpet_area?: number | null
          column_size?: string | null
          column_spacing_x?: number | null
          column_spacing_y?: number | null
          created_at?: string | null
          flooring_type?: string | null
          footing_size?: string | null
          foundation_depth?: number | null
          height?: number | null
          id?: string
          length?: number | null
          name?: string
          num_floors?: number | null
          painting_type?: string | null
          plaster_type?: string | null
          plinth_area?: number | null
          plinth_height?: number | null
          post_type?: string | null
          project_id?: string
          roof_slope?: number | null
          slab_thickness?: number | null
          total_built_up_area?: number | null
          truss_type?: string | null
          type?: Database["public"]["Enums"]["building_type"]
          updated_at?: string | null
          verandah_width?: number | null
          wall_thickness?: number | null
          waterproofing_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          boq_id: string | null
          content: string
          created_at: string | null
          estimate_item_id: string | null
          id: string
          project_id: string | null
          resolved: boolean | null
          user_id: string
        }
        Insert: {
          boq_id?: string | null
          content: string
          created_at?: string | null
          estimate_item_id?: string | null
          id?: string
          project_id?: string | null
          resolved?: boolean | null
          user_id: string
        }
        Update: {
          boq_id?: string | null
          content?: string
          created_at?: string | null
          estimate_item_id?: string | null
          id?: string
          project_id?: string | null
          resolved?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_estimate_item_id_fkey"
            columns: ["estimate_item_id"]
            isOneToOne: false
            referencedRelation: "estimate_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dsr_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      dsr_items: {
        Row: {
          category_id: string | null
          description: string
          id: string
          item_code: string
          rate: number
          unit: string
        }
        Insert: {
          category_id?: string | null
          description: string
          id: string
          item_code: string
          rate: number
          unit: string
        }
        Update: {
          category_id?: string | null
          description?: string
          id?: string
          item_code?: string
          rate?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsr_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dsr_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          amount: number | null
          assumptions: string | null
          audit_trail: Json | null
          building_id: string | null
          category: string | null
          chapter: string | null
          created_at: string | null
          description: string
          formula: string | null
          id: string
          is_finishing: boolean | null
          is_provisional: boolean | null
          is_structural: boolean | null
          item_number: string | null
          notes: string | null
          parent_id: string | null
          project_id: string
          quantity: number | null
          rate: number | null
          rate_master_id: string | null
          rate_source: Database["public"]["Enums"]["sor_type"] | null
          sort_order: number | null
          sub_category: string | null
          unit: Database["public"]["Enums"]["item_unit"]
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          assumptions?: string | null
          audit_trail?: Json | null
          building_id?: string | null
          category?: string | null
          chapter?: string | null
          created_at?: string | null
          description: string
          formula?: string | null
          id?: string
          is_finishing?: boolean | null
          is_provisional?: boolean | null
          is_structural?: boolean | null
          item_number?: string | null
          notes?: string | null
          parent_id?: string | null
          project_id: string
          quantity?: number | null
          rate?: number | null
          rate_master_id?: string | null
          rate_source?: Database["public"]["Enums"]["sor_type"] | null
          sort_order?: number | null
          sub_category?: string | null
          unit: Database["public"]["Enums"]["item_unit"]
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          assumptions?: string | null
          audit_trail?: Json | null
          building_id?: string | null
          category?: string | null
          chapter?: string | null
          created_at?: string | null
          description?: string
          formula?: string | null
          id?: string
          is_finishing?: boolean | null
          is_provisional?: boolean | null
          is_structural?: boolean | null
          item_number?: string | null
          notes?: string | null
          parent_id?: string | null
          project_id?: string
          quantity?: number | null
          rate?: number | null
          rate_master_id?: string | null
          rate_source?: Database["public"]["Enums"]["sor_type"] | null
          sort_order?: number | null
          sub_category?: string | null
          unit?: Database["public"]["Enums"]["item_unit"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "estimate_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_items_rate_master_id_fkey"
            columns: ["rate_master_id"]
            isOneToOne: false
            referencedRelation: "rate_master"
            referencedColumns: ["id"]
          },
        ]
      }
      floors: {
        Row: {
          area: number | null
          building_id: string
          created_at: string | null
          floor_name: string | null
          floor_number: number
          height: number | null
          id: string
        }
        Insert: {
          area?: number | null
          building_id: string
          created_at?: string | null
          floor_name?: string | null
          floor_number: number
          height?: number | null
          id?: string
        }
        Update: {
          area?: number | null
          building_id?: string
          created_at?: string | null
          floor_name?: string | null
          floor_number?: number
          height?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floors_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      material_statements: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          id: string
          material_name: string
          notes: string | null
          project_id: string
          quantity: number | null
          quantity_with_wastage: number | null
          rate: number | null
          source_items: Json | null
          unit: string | null
          wastage_pct: number | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          material_name: string
          notes?: string | null
          project_id: string
          quantity?: number | null
          quantity_with_wastage?: number | null
          rate?: number | null
          source_items?: Json | null
          unit?: string | null
          wastage_pct?: number | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          id?: string
          material_name?: string
          notes?: string | null
          project_id?: string
          quantity?: number | null
          quantity_with_wastage?: number | null
          rate?: number | null
          source_items?: Json | null
          unit?: string | null
          wastage_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_statements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          breadth: number | null
          created_at: string | null
          deduction: boolean | null
          depth: number | null
          description: string | null
          estimate_item_id: string
          id: string
          length: number | null
          nos: number | null
          notes: string | null
          project_id: string
          quantity: number | null
          sl_no: number | null
        }
        Insert: {
          breadth?: number | null
          created_at?: string | null
          deduction?: boolean | null
          depth?: number | null
          description?: string | null
          estimate_item_id: string
          id?: string
          length?: number | null
          nos?: number | null
          notes?: string | null
          project_id: string
          quantity?: number | null
          sl_no?: number | null
        }
        Update: {
          breadth?: number | null
          created_at?: string | null
          deduction?: boolean | null
          depth?: number | null
          description?: string | null
          estimate_item_id?: string
          id?: string
          length?: number | null
          nos?: number | null
          notes?: string | null
          project_id?: string
          quantity?: number | null
          sl_no?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_estimate_item_id_fkey"
            columns: ["estimate_item_id"]
            isOneToOne: false
            referencedRelation: "estimate_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      openings: {
        Row: {
          building_id: string
          created_at: string | null
          floor_id: string | null
          frame_material: string | null
          height: number
          id: string
          ironmongery: string | null
          mark: string | null
          notes: string | null
          opening_type: string
          quantity: number | null
          room_id: string | null
          shutter_material: string | null
          shutter_type: string | null
          thickness: number | null
          width: number
        }
        Insert: {
          building_id: string
          created_at?: string | null
          floor_id?: string | null
          frame_material?: string | null
          height: number
          id?: string
          ironmongery?: string | null
          mark?: string | null
          notes?: string | null
          opening_type: string
          quantity?: number | null
          room_id?: string | null
          shutter_material?: string | null
          shutter_type?: string | null
          thickness?: number | null
          width: number
        }
        Update: {
          building_id?: string
          created_at?: string | null
          floor_id?: string | null
          frame_material?: string | null
          height?: number
          id?: string
          ironmongery?: string | null
          mark?: string | null
          notes?: string | null
          opening_type?: string
          quantity?: number | null
          room_id?: string | null
          shutter_material?: string | null
          shutter_type?: string | null
          thickness?: number | null
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "openings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "openings_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "openings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          approved_amount: number | null
          approved_by: string | null
          archived_at: string | null
          circle: string | null
          client_name: string | null
          created_at: string | null
          created_by: string | null
          department: string | null
          district: string | null
          division: string | null
          financial_year: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          project_code: string | null
          reviewed_by: string | null
          state: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          subdivision: string | null
          tags: string[] | null
          total_estimate: number | null
          updated_at: string | null
        }
        Insert: {
          approved_amount?: number | null
          approved_by?: string | null
          archived_at?: string | null
          circle?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          district?: string | null
          division?: string | null
          financial_year?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          project_code?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          subdivision?: string | null
          tags?: string[] | null
          total_estimate?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_amount?: number | null
          approved_by?: string | null
          archived_at?: string | null
          circle?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          district?: string | null
          division?: string | null
          financial_year?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          project_code?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          subdivision?: string | null
          tags?: string[] | null
          total_estimate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_analysis: {
        Row: {
          created_at: string | null
          id: string
          item_description: string
          labour: Json | null
          labour_total: number | null
          material_total: number | null
          materials: Json | null
          overhead_amount: number | null
          overhead_pct: number | null
          plant: Json | null
          plant_total: number | null
          profit_amount: number | null
          profit_pct: number | null
          project_id: string | null
          rate_master_id: string | null
          sor_rate: number | null
          total_rate: number | null
          unit: Database["public"]["Enums"]["item_unit"]
          variance_pct: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_description: string
          labour?: Json | null
          labour_total?: number | null
          material_total?: number | null
          materials?: Json | null
          overhead_amount?: number | null
          overhead_pct?: number | null
          plant?: Json | null
          plant_total?: number | null
          profit_amount?: number | null
          profit_pct?: number | null
          project_id?: string | null
          rate_master_id?: string | null
          sor_rate?: number | null
          total_rate?: number | null
          unit: Database["public"]["Enums"]["item_unit"]
          variance_pct?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_description?: string
          labour?: Json | null
          labour_total?: number | null
          material_total?: number | null
          materials?: Json | null
          overhead_amount?: number | null
          overhead_pct?: number | null
          plant?: Json | null
          plant_total?: number | null
          profit_amount?: number | null
          profit_pct?: number | null
          project_id?: string | null
          rate_master_id?: string | null
          sor_rate?: number | null
          total_rate?: number | null
          unit?: Database["public"]["Enums"]["item_unit"]
          variance_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_analysis_rate_master_id_fkey"
            columns: ["rate_master_id"]
            isOneToOne: false
            referencedRelation: "rate_master"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_master: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          district: string | null
          effective_from: string | null
          effective_to: string | null
          financial_year: string | null
          id: string
          is_active: boolean | null
          item_number: string | null
          labour_component: number | null
          material_component: number | null
          notes: string | null
          overhead_pct: number | null
          plant_component: number | null
          profit_pct: number | null
          rate: number
          sor_code: string | null
          sor_type: Database["public"]["Enums"]["sor_type"]
          sub_category: string | null
          unit: Database["public"]["Enums"]["item_unit"]
          unit_rate: number | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          district?: string | null
          effective_from?: string | null
          effective_to?: string | null
          financial_year?: string | null
          id?: string
          is_active?: boolean | null
          item_number?: string | null
          labour_component?: number | null
          material_component?: number | null
          notes?: string | null
          overhead_pct?: number | null
          plant_component?: number | null
          profit_pct?: number | null
          rate: number
          sor_code?: string | null
          sor_type?: Database["public"]["Enums"]["sor_type"]
          sub_category?: string | null
          unit: Database["public"]["Enums"]["item_unit"]
          unit_rate?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          district?: string | null
          effective_from?: string | null
          effective_to?: string | null
          financial_year?: string | null
          id?: string
          is_active?: boolean | null
          item_number?: string | null
          labour_component?: number | null
          material_component?: number | null
          notes?: string | null
          overhead_pct?: number | null
          plant_component?: number | null
          profit_pct?: number | null
          rate?: number
          sor_code?: string | null
          sor_type?: Database["public"]["Enums"]["sor_type"]
          sub_category?: string | null
          unit?: Database["public"]["Enums"]["item_unit"]
          unit_rate?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      rooms: {
        Row: {
          breadth: number | null
          building_id: string
          carpet_area: number | null
          created_at: string | null
          floor_id: string
          flooring_type: string | null
          height: number | null
          id: string
          length: number | null
          name: string
          notes: string | null
          plinth_area: number | null
          room_type: string | null
        }
        Insert: {
          breadth?: number | null
          building_id: string
          carpet_area?: number | null
          created_at?: string | null
          floor_id: string
          flooring_type?: string | null
          height?: number | null
          id?: string
          length?: number | null
          name: string
          notes?: string | null
          plinth_area?: number | null
          room_type?: string | null
        }
        Update: {
          breadth?: number | null
          building_id?: string
          carpet_area?: number | null
          created_at?: string | null
          floor_id?: string
          flooring_type?: string | null
          height?: number | null
          id?: string
          length?: number | null
          name?: string
          notes?: string | null
          plinth_area?: number | null
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
        ]
      }
      structural_elements: {
        Row: {
          breadth: number | null
          building_id: string
          concrete_grade: string | null
          created_at: string | null
          depth: number | null
          element_type: string
          floor_id: string | null
          id: string
          length: number | null
          mark: string | null
          notes: string | null
          quantity: number | null
          reinforcement_ratio: number | null
          steel_grade: string | null
          volume: number | null
        }
        Insert: {
          breadth?: number | null
          building_id: string
          concrete_grade?: string | null
          created_at?: string | null
          depth?: number | null
          element_type: string
          floor_id?: string | null
          id?: string
          length?: number | null
          mark?: string | null
          notes?: string | null
          quantity?: number | null
          reinforcement_ratio?: number | null
          steel_grade?: string | null
          volume?: number | null
        }
        Update: {
          breadth?: number | null
          building_id?: string
          concrete_grade?: string | null
          created_at?: string | null
          depth?: number | null
          element_type?: string
          floor_id?: string | null
          id?: string
          length?: number | null
          mark?: string | null
          notes?: string | null
          quantity?: number | null
          reinforcement_ratio?: number | null
          steel_grade?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "structural_elements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structural_elements_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      valuation_reports: {
        Row: {
          age_of_building: number | null
          building_id: string | null
          condition_grade: string | null
          condition_notes: string | null
          created_at: string | null
          depreciation_amount: number | null
          depreciation_method: string | null
          depreciation_pct: number | null
          fair_value: number | null
          id: string
          land_value: number | null
          life_of_building: number | null
          market_value: number | null
          observations: string | null
          plinth_area: number | null
          plinth_area_rate: number | null
          present_value: number | null
          project_id: string
          replacement_cost: number | null
          report_data: Json | null
          salvage_value: number | null
          updated_at: string | null
          valuation_date: string
          valuation_method: Database["public"]["Enums"]["valuation_method"]
          valuator_name: string | null
          valuator_qualification: string | null
        }
        Insert: {
          age_of_building?: number | null
          building_id?: string | null
          condition_grade?: string | null
          condition_notes?: string | null
          created_at?: string | null
          depreciation_amount?: number | null
          depreciation_method?: string | null
          depreciation_pct?: number | null
          fair_value?: number | null
          id?: string
          land_value?: number | null
          life_of_building?: number | null
          market_value?: number | null
          observations?: string | null
          plinth_area?: number | null
          plinth_area_rate?: number | null
          present_value?: number | null
          project_id: string
          replacement_cost?: number | null
          report_data?: Json | null
          salvage_value?: number | null
          updated_at?: string | null
          valuation_date?: string
          valuation_method?: Database["public"]["Enums"]["valuation_method"]
          valuator_name?: string | null
          valuator_qualification?: string | null
        }
        Update: {
          age_of_building?: number | null
          building_id?: string | null
          condition_grade?: string | null
          condition_notes?: string | null
          created_at?: string | null
          depreciation_amount?: number | null
          depreciation_method?: string | null
          depreciation_pct?: number | null
          fair_value?: number | null
          id?: string
          land_value?: number | null
          life_of_building?: number | null
          market_value?: number | null
          observations?: string | null
          plinth_area?: number | null
          plinth_area_rate?: number | null
          present_value?: number | null
          project_id?: string
          replacement_cost?: number | null
          report_data?: Json | null
          salvage_value?: number | null
          updated_at?: string | null
          valuation_date?: string
          valuation_method?: Database["public"]["Enums"]["valuation_method"]
          valuator_name?: string | null
          valuator_qualification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valuation_reports_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valuation_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ae_match_dsr_items: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          item_code: string
          rate: number
          similarity: number
          unit: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      approval_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "archived"
      boq_status:
        | "uploaded"
        | "processing"
        | "parsed"
        | "validated"
        | "approved"
        | "error"
      building_type:
        | "rcc"
        | "assam_type"
        | "mixed"
        | "school"
        | "residential"
        | "office"
        | "hospital"
        | "commercial"
        | "toilet_block"
      item_unit:
        | "sqm"
        | "sqft"
        | "cum"
        | "cft"
        | "rm"
        | "rft"
        | "kg"
        | "nos"
        | "ls"
        | "mt"
        | "quintal"
        | "litre"
      sor_type: "apwd" | "cpwd" | "market" | "district" | "custom"
      user_role: "admin" | "estimator" | "reviewer" | "approver" | "viewer"
      valuation_method:
        | "replacement_cost"
        | "market_value"
        | "book_value"
        | "salvage_value"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "archived",
      ],
      boq_status: [
        "uploaded",
        "processing",
        "parsed",
        "validated",
        "approved",
        "error",
      ],
      building_type: [
        "rcc",
        "assam_type",
        "mixed",
        "school",
        "residential",
        "office",
        "hospital",
        "commercial",
        "toilet_block",
      ],
      item_unit: [
        "sqm",
        "sqft",
        "cum",
        "cft",
        "rm",
        "rft",
        "kg",
        "nos",
        "ls",
        "mt",
        "quintal",
        "litre",
      ],
      sor_type: ["apwd", "cpwd", "market", "district", "custom"],
      user_role: ["admin", "estimator", "reviewer", "approver", "viewer"],
      valuation_method: [
        "replacement_cost",
        "market_value",
        "book_value",
        "salvage_value",
      ],
    },
  },
} as const
