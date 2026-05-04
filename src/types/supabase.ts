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
      batch_inputs: {
        Row: {
          batch_id: string
          brewery_id: string
          created_at: string
          id: string
          ingredient_id: string
          ingredient_receipt_id: string | null
          inventory_movement_id: string | null
          is_traceability_required: boolean
          quantity: number
          role: string | null
          stage: string | null
          unit: string
          used_at: string | null
        }
        Insert: {
          batch_id: string
          brewery_id: string
          created_at?: string
          id?: string
          ingredient_id: string
          ingredient_receipt_id?: string | null
          inventory_movement_id?: string | null
          is_traceability_required?: boolean
          quantity: number
          role?: string | null
          stage?: string | null
          unit: string
          used_at?: string | null
        }
        Update: {
          batch_id?: string
          brewery_id?: string
          created_at?: string
          id?: string
          ingredient_id?: string
          ingredient_receipt_id?: string | null
          inventory_movement_id?: string | null
          is_traceability_required?: boolean
          quantity?: number
          role?: string | null
          stage?: string | null
          unit?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_inputs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inputs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inputs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inputs_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inputs_ingredient_receipt_id_fkey"
            columns: ["ingredient_receipt_id"]
            isOneToOne: false
            referencedRelation: "ingredient_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_inputs_inventory_movement_id_fkey"
            columns: ["inventory_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          actual_volume_liters: number | null
          batch_number: string | null
          brew_date: string | null
          brewery_id: string
          created_at: string
          declaration_number: string | null
          id: string
          notes: string | null
          recipe_id: string | null
          status: Database["public"]["Enums"]["batch_status"]
          target_volume_liters: number | null
          updated_at: string
        }
        Insert: {
          actual_volume_liters?: number | null
          batch_number?: string | null
          brew_date?: string | null
          brewery_id: string
          created_at?: string
          declaration_number?: string | null
          id?: string
          notes?: string | null
          recipe_id?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_volume_liters?: number | null
          updated_at?: string
        }
        Update: {
          actual_volume_liters?: number | null
          batch_number?: string | null
          brew_date?: string | null
          brewery_id?: string
          created_at?: string
          declaration_number?: string | null
          id?: string
          notes?: string | null
          recipe_id?: string | null
          status?: Database["public"]["Enums"]["batch_status"]
          target_volume_liters?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      boil_additions: {
        Row: {
          actual_temp_c: number | null
          addition_stage: string | null
          addition_type: string | null
          batch_input_id: string | null
          brew_log_id: string
          created_at: string
          duration_min: number | null
          id: string
          ingredient_id: string | null
          ingredient_receipt_id: string | null
          notes: string | null
          quantity: number | null
          step_order: number
          target_temp_c: number | null
          time_min: number | null
          unit: string | null
        }
        Insert: {
          actual_temp_c?: number | null
          addition_stage?: string | null
          addition_type?: string | null
          batch_input_id?: string | null
          brew_log_id: string
          created_at?: string
          duration_min?: number | null
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          notes?: string | null
          quantity?: number | null
          step_order?: number
          target_temp_c?: number | null
          time_min?: number | null
          unit?: string | null
        }
        Update: {
          actual_temp_c?: number | null
          addition_stage?: string | null
          addition_type?: string | null
          batch_input_id?: string | null
          brew_log_id?: string
          created_at?: string
          duration_min?: number | null
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          notes?: string | null
          quantity?: number | null
          step_order?: number
          target_temp_c?: number | null
          time_min?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boil_additions_batch_input_id_fkey"
            columns: ["batch_input_id"]
            isOneToOne: false
            referencedRelation: "batch_inputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boil_additions_brew_log_id_fkey"
            columns: ["brew_log_id"]
            isOneToOne: false
            referencedRelation: "brew_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boil_additions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boil_additions_ingredient_receipt_id_fkey"
            columns: ["ingredient_receipt_id"]
            isOneToOne: false
            referencedRelation: "ingredient_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      brew_logs: {
        Row: {
          actual_boil_duration_min: number | null
          actual_cooling_temp_c: number | null
          actual_fermenter_volume_liters: number | null
          actual_final_gravity: number | null
          actual_last_runnings_gravity: number | null
          actual_mash_ph: number | null
          actual_mash_volume_liters: number | null
          actual_mash_water_liters: number | null
          actual_original_gravity: number | null
          actual_post_boil_volume_liters: number | null
          actual_pre_boil_gravity: number | null
          actual_pre_boil_volume_liters: number | null
          actual_sparge_duration_min: number | null
          actual_sparge_temp_c: number | null
          actual_sparge_water_liters: number | null
          actual_strike_water_temp_c: number | null
          actual_transfer_temp_c: number | null
          batch_id: string
          brew_date: string | null
          brewer_notes: string | null
          brewery_id: string
          created_at: string
          exceptions: string | null
          id: string
          lautering_notes: string | null
          log_status: string
          packaged_date: string | null
          packaged_volume_liters: number | null
          packaging_format_id: string | null
          planned_final_gravity: number | null
          planned_mash_water_liters: number | null
          planned_original_gravity: number | null
          planned_ph_max: number | null
          planned_ph_min: number | null
          planned_pre_boil_gravity: number | null
          planned_sparge_temp_c: number | null
          planned_sparge_water_liters: number | null
          planned_strike_water_temp_c: number | null
          transfer_finished_at: string | null
          transfer_started_at: string | null
          updated_at: string
          yeast_notes: string | null
          yeast_pitch_quantity: number | null
          yeast_pitch_temp_c: number | null
          yeast_pitch_time: string | null
          yeast_pitch_unit: string | null
        }
        Insert: {
          actual_boil_duration_min?: number | null
          actual_cooling_temp_c?: number | null
          actual_fermenter_volume_liters?: number | null
          actual_final_gravity?: number | null
          actual_last_runnings_gravity?: number | null
          actual_mash_ph?: number | null
          actual_mash_volume_liters?: number | null
          actual_mash_water_liters?: number | null
          actual_original_gravity?: number | null
          actual_post_boil_volume_liters?: number | null
          actual_pre_boil_gravity?: number | null
          actual_pre_boil_volume_liters?: number | null
          actual_sparge_duration_min?: number | null
          actual_sparge_temp_c?: number | null
          actual_sparge_water_liters?: number | null
          actual_strike_water_temp_c?: number | null
          actual_transfer_temp_c?: number | null
          batch_id: string
          brew_date?: string | null
          brewer_notes?: string | null
          brewery_id: string
          created_at?: string
          exceptions?: string | null
          id?: string
          lautering_notes?: string | null
          log_status?: string
          packaged_date?: string | null
          packaged_volume_liters?: number | null
          packaging_format_id?: string | null
          planned_final_gravity?: number | null
          planned_mash_water_liters?: number | null
          planned_original_gravity?: number | null
          planned_ph_max?: number | null
          planned_ph_min?: number | null
          planned_pre_boil_gravity?: number | null
          planned_sparge_temp_c?: number | null
          planned_sparge_water_liters?: number | null
          planned_strike_water_temp_c?: number | null
          transfer_finished_at?: string | null
          transfer_started_at?: string | null
          updated_at?: string
          yeast_notes?: string | null
          yeast_pitch_quantity?: number | null
          yeast_pitch_temp_c?: number | null
          yeast_pitch_time?: string | null
          yeast_pitch_unit?: string | null
        }
        Update: {
          actual_boil_duration_min?: number | null
          actual_cooling_temp_c?: number | null
          actual_fermenter_volume_liters?: number | null
          actual_final_gravity?: number | null
          actual_last_runnings_gravity?: number | null
          actual_mash_ph?: number | null
          actual_mash_volume_liters?: number | null
          actual_mash_water_liters?: number | null
          actual_original_gravity?: number | null
          actual_post_boil_volume_liters?: number | null
          actual_pre_boil_gravity?: number | null
          actual_pre_boil_volume_liters?: number | null
          actual_sparge_duration_min?: number | null
          actual_sparge_temp_c?: number | null
          actual_sparge_water_liters?: number | null
          actual_strike_water_temp_c?: number | null
          actual_transfer_temp_c?: number | null
          batch_id?: string
          brew_date?: string | null
          brewer_notes?: string | null
          brewery_id?: string
          created_at?: string
          exceptions?: string | null
          id?: string
          lautering_notes?: string | null
          log_status?: string
          packaged_date?: string | null
          packaged_volume_liters?: number | null
          packaging_format_id?: string | null
          planned_final_gravity?: number | null
          planned_mash_water_liters?: number | null
          planned_original_gravity?: number | null
          planned_ph_max?: number | null
          planned_ph_min?: number | null
          planned_pre_boil_gravity?: number | null
          planned_sparge_temp_c?: number | null
          planned_sparge_water_liters?: number | null
          planned_strike_water_temp_c?: number | null
          transfer_finished_at?: string | null
          transfer_started_at?: string | null
          updated_at?: string
          yeast_notes?: string | null
          yeast_pitch_quantity?: number | null
          yeast_pitch_temp_c?: number | null
          yeast_pitch_time?: string | null
          yeast_pitch_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brew_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brew_logs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brew_logs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brew_logs_packaging_format_id_fkey"
            columns: ["packaging_format_id"]
            isOneToOne: false
            referencedRelation: "packaging_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      brewery_overhead_items: {
        Row: {
          amount: number
          brewery_id: string
          cost_category: string
          coverage_period_months: number | null
          created_at: string
          currency: string
          ends_on: string | null
          id: string
          is_active: boolean
          monthly_equivalent: number | null
          name: string
          starts_on: string | null
          supplier_name: string | null
          tag: string
          updated_at: string
        }
        Insert: {
          amount: number
          brewery_id: string
          cost_category: string
          coverage_period_months?: number | null
          created_at?: string
          currency?: string
          ends_on?: string | null
          id?: string
          is_active?: boolean
          monthly_equivalent?: number | null
          name: string
          starts_on?: string | null
          supplier_name?: string | null
          tag?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          brewery_id?: string
          cost_category?: string
          coverage_period_months?: number | null
          created_at?: string
          currency?: string
          ends_on?: string | null
          id?: string
          is_active?: boolean
          monthly_equivalent?: number | null
          name?: string
          starts_on?: string | null
          supplier_name?: string | null
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brewery_overhead_items_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brewery_overhead_items_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brewery_profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          authorisation_holder: string | null
          city: string | null
          country: string | null
          country_code: string
          created_at: string
          currency: string
          customs_office_email: string | null
          customs_office_name: string | null
          default_batch_number_format: string | null
          default_finished_lot_strategy: string | null
          default_vessel_volume_l: number | null
          display_name: string | null
          emcs_enabled: boolean
          excise_authorisation_number: string | null
          excise_authorization_number: string | null
          id: string
          is_demo: boolean
          is_small_independent_brewery: boolean
          language: string
          legal_name: string | null
          name: string
          notion_source_id: string | null
          onboarding_status: string
          packaging_contribution_mode: string | null
          postal_code: string | null
          timezone: string
          trading_name: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          authorisation_holder?: string | null
          city?: string | null
          country?: string | null
          country_code?: string
          created_at?: string
          currency?: string
          customs_office_email?: string | null
          customs_office_name?: string | null
          default_batch_number_format?: string | null
          default_finished_lot_strategy?: string | null
          default_vessel_volume_l?: number | null
          display_name?: string | null
          emcs_enabled?: boolean
          excise_authorisation_number?: string | null
          excise_authorization_number?: string | null
          id?: string
          is_demo?: boolean
          is_small_independent_brewery?: boolean
          language?: string
          legal_name?: string | null
          name: string
          notion_source_id?: string | null
          onboarding_status?: string
          packaging_contribution_mode?: string | null
          postal_code?: string | null
          timezone?: string
          trading_name?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          authorisation_holder?: string | null
          city?: string | null
          country?: string | null
          country_code?: string
          created_at?: string
          currency?: string
          customs_office_email?: string | null
          customs_office_name?: string | null
          default_batch_number_format?: string | null
          default_finished_lot_strategy?: string | null
          default_vessel_volume_l?: number | null
          display_name?: string | null
          emcs_enabled?: boolean
          excise_authorisation_number?: string | null
          excise_authorization_number?: string | null
          id?: string
          is_demo?: boolean
          is_small_independent_brewery?: boolean
          language?: string
          legal_name?: string | null
          name?: string
          notion_source_id?: string | null
          onboarding_status?: string
          packaging_contribution_mode?: string | null
          postal_code?: string | null
          timezone?: string
          trading_name?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      brewery_settings: {
        Row: {
          brewery_id: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          tag: string
          updated_at: string
        }
        Insert: {
          brewery_id: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          tag: string
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brewery_settings_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brewery_settings_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brewery_supplier_roles: {
        Row: {
          brewery_id: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          supplier_name: string
          supplier_role: string
          supplier_type: string | null
          tag: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          brewery_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          supplier_name: string
          supplier_role: string
          supplier_type?: string | null
          tag?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          brewery_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          supplier_name?: string
          supplier_role?: string
          supplier_type?: string | null
          tag?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brewery_supplier_roles_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brewery_supplier_roles_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      declarations: {
        Row: {
          brewery_id: string
          created_at: string
          declaration_number: string | null
          declaration_type: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          reference_number: string | null
          status: Database["public"]["Enums"]["declaration_status"]
          submission_date: string | null
          updated_at: string
        }
        Insert: {
          brewery_id: string
          created_at?: string
          declaration_number?: string | null
          declaration_type: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["declaration_status"]
          submission_date?: string | null
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          created_at?: string
          declaration_number?: string | null
          declaration_type?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["declaration_status"]
          submission_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "declarations_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_overlay_records: {
        Row: {
          created_at: string
          demo_session_id: string
          id: string
          operation: Database["public"]["Enums"]["demo_overlay_op"]
          payload: Json
          record_id: string | null
          table_name: string
        }
        Insert: {
          created_at?: string
          demo_session_id: string
          id?: string
          operation: Database["public"]["Enums"]["demo_overlay_op"]
          payload?: Json
          record_id?: string | null
          table_name: string
        }
        Update: {
          created_at?: string
          demo_session_id?: string
          id?: string
          operation?: Database["public"]["Enums"]["demo_overlay_op"]
          payload?: Json
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_overlay_records_demo_session_id_fkey"
            columns: ["demo_session_id"]
            isOneToOne: false
            referencedRelation: "demo_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_sessions: {
        Row: {
          client_fingerprint: string | null
          created_at: string
          demo_brewery_id: string
          expires_at: string
          id: string
          status: Database["public"]["Enums"]["demo_session_status"]
        }
        Insert: {
          client_fingerprint?: string | null
          created_at?: string
          demo_brewery_id: string
          expires_at: string
          id?: string
          status?: Database["public"]["Enums"]["demo_session_status"]
        }
        Update: {
          client_fingerprint?: string | null
          created_at?: string
          demo_brewery_id?: string
          expires_at?: string
          id?: string
          status?: Database["public"]["Enums"]["demo_session_status"]
        }
        Relationships: [
          {
            foreignKeyName: "demo_sessions_demo_brewery_id_fkey"
            columns: ["demo_brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_sessions_demo_brewery_id_fkey"
            columns: ["demo_brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_logs: {
        Row: {
          actor_role: Database["public"]["Enums"]["user_role"] | null
          actor_user_id: string | null
          brewery_id: string
          created_at: string
          event_timestamp: string
          event_type: string
          id: string
          object_id: string | null
          object_type: string | null
          payload_json: Json | null
          related_ids: Json | null
          summary: string | null
        }
        Insert: {
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          actor_user_id?: string | null
          brewery_id: string
          created_at?: string
          event_timestamp?: string
          event_type: string
          id?: string
          object_id?: string | null
          object_type?: string | null
          payload_json?: Json | null
          related_ids?: Json | null
          summary?: string | null
        }
        Update: {
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          actor_user_id?: string | null
          brewery_id?: string
          created_at?: string
          event_timestamp?: string
          event_type?: string
          id?: string
          object_id?: string | null
          object_type?: string | null
          payload_json?: Json | null
          related_ids?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "brewery_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "event_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_logs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_logs_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fermentation_checks: {
        Row: {
          batch_id: string | null
          brew_log_id: string
          check_date: string
          check_time: string | null
          check_type: string | null
          created_at: string
          day_number: number | null
          gravity: number | null
          id: string
          is_stable_fg_check: boolean
          measured_at: string | null
          ph: number | null
          reading_type: string | null
          sensory_notes: string | null
          temperature_c: number | null
        }
        Insert: {
          batch_id?: string | null
          brew_log_id: string
          check_date: string
          check_time?: string | null
          check_type?: string | null
          created_at?: string
          day_number?: number | null
          gravity?: number | null
          id?: string
          is_stable_fg_check?: boolean
          measured_at?: string | null
          ph?: number | null
          reading_type?: string | null
          sensory_notes?: string | null
          temperature_c?: number | null
        }
        Update: {
          batch_id?: string | null
          brew_log_id?: string
          check_date?: string
          check_time?: string | null
          check_type?: string | null
          created_at?: string
          day_number?: number | null
          gravity?: number | null
          id?: string
          is_stable_fg_check?: boolean
          measured_at?: string | null
          ph?: number | null
          reading_type?: string | null
          sensory_notes?: string | null
          temperature_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fermentation_checks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fermentation_checks_brew_log_id_fkey"
            columns: ["brew_log_id"]
            isOneToOne: false
            referencedRelation: "brew_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_receipts: {
        Row: {
          best_before_date: string | null
          brewery_id: string
          created_at: string
          id: string
          ingredient_id: string
          internal_lot_code: string | null
          notes: string | null
          quality_status: string
          quantity_received: number
          received_date: string | null
          storage_location: string | null
          supplier_lot_number: string | null
          supplier_name: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          best_before_date?: string | null
          brewery_id: string
          created_at?: string
          id?: string
          ingredient_id: string
          internal_lot_code?: string | null
          notes?: string | null
          quality_status?: string
          quantity_received: number
          received_date?: string | null
          storage_location?: string | null
          supplier_lot_number?: string | null
          supplier_name?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          best_before_date?: string | null
          brewery_id?: string
          created_at?: string
          id?: string
          ingredient_id?: string
          internal_lot_code?: string | null
          notes?: string | null
          quality_status?: string
          quantity_received?: number
          received_date?: string | null
          storage_location?: string | null
          supplier_lot_number?: string | null
          supplier_name?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_receipts_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_receipts_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_receipts_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          brewery_id: string
          category: string | null
          created_at: string
          default_unit: string | null
          id: string
          ingredient_type: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          brewery_id: string
          category?: string | null
          created_at?: string
          default_unit?: string | null
          id?: string
          ingredient_type?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          category?: string | null
          created_at?: string
          default_unit?: string | null
          id?: string
          ingredient_type?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          base_quantity_kg: number | null
          base_quantity_liters: number | null
          batch_id: string | null
          brewery_id: string
          created_at: string
          destination_lot_id: string | null
          direction: Database["public"]["Enums"]["movement_direction"]
          elimination_reason: string | null
          excise_effect: boolean
          id: string
          ingredient_id: string | null
          ingredient_receipt_id: string | null
          lot_id: string | null
          movement_timestamp: string
          movement_type: string
          notes: string | null
          quantity: number
          reason: string | null
          reference_number: string | null
          sale_id: string | null
          scope: string | null
          source_lot_id: string | null
          source_pending_movement_id: string | null
          unit: string
        }
        Insert: {
          base_quantity_kg?: number | null
          base_quantity_liters?: number | null
          batch_id?: string | null
          brewery_id: string
          created_at?: string
          destination_lot_id?: string | null
          direction: Database["public"]["Enums"]["movement_direction"]
          elimination_reason?: string | null
          excise_effect?: boolean
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          lot_id?: string | null
          movement_timestamp?: string
          movement_type: string
          notes?: string | null
          quantity: number
          reason?: string | null
          reference_number?: string | null
          sale_id?: string | null
          scope?: string | null
          source_lot_id?: string | null
          source_pending_movement_id?: string | null
          unit: string
        }
        Update: {
          base_quantity_kg?: number | null
          base_quantity_liters?: number | null
          batch_id?: string | null
          brewery_id?: string
          created_at?: string
          destination_lot_id?: string | null
          direction?: Database["public"]["Enums"]["movement_direction"]
          elimination_reason?: string | null
          excise_effect?: boolean
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          lot_id?: string | null
          movement_timestamp?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reason?: string | null
          reference_number?: string | null
          sale_id?: string | null
          scope?: string | null
          source_lot_id?: string | null
          source_pending_movement_id?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_destination_lot_id_fkey"
            columns: ["destination_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_ingredient_receipt_id_fkey"
            columns: ["ingredient_receipt_id"]
            isOneToOne: false
            referencedRelation: "ingredient_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_source_lot_id_fkey"
            columns: ["source_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_source_pending_movement_id_fkey"
            columns: ["source_pending_movement_id"]
            isOneToOne: false
            referencedRelation: "pending_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          brewery_id: string
          created_at: string
          description: string | null
          id: string
          issue_date: string | null
          linked_batch_id: string | null
          linked_lot_id: string | null
          linked_sale_id: string | null
          severity: Database["public"]["Enums"]["issue_severity"]
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
        }
        Insert: {
          brewery_id: string
          created_at?: string
          description?: string | null
          id?: string
          issue_date?: string | null
          linked_batch_id?: string | null
          linked_lot_id?: string | null
          linked_sale_id?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          created_at?: string
          description?: string | null
          id?: string
          issue_date?: string | null
          linked_batch_id?: string | null
          linked_lot_id?: string | null
          linked_sale_id?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"]
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_linked_batch_id_fkey"
            columns: ["linked_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_linked_lot_id_fkey"
            columns: ["linked_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_linked_sale_id_fkey"
            columns: ["linked_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          batch_id: string | null
          brewery_id: string
          created_at: string
          excise_state: Database["public"]["Enums"]["excise_state"]
          id: string
          internal_lot_ref: string | null
          lot_date: string | null
          lot_number: string
          lot_type: Database["public"]["Enums"]["lot_type"]
          notes: string | null
          packaging_format_id: string | null
          packaging_state: Database["public"]["Enums"]["packaging_state"]
          parent_lot_id: string | null
          status: Database["public"]["Enums"]["lot_status"]
          units_count: number | null
          updated_at: string
          volume_liters: number | null
        }
        Insert: {
          batch_id?: string | null
          brewery_id: string
          created_at?: string
          excise_state?: Database["public"]["Enums"]["excise_state"]
          id?: string
          internal_lot_ref?: string | null
          lot_date?: string | null
          lot_number: string
          lot_type?: Database["public"]["Enums"]["lot_type"]
          notes?: string | null
          packaging_format_id?: string | null
          packaging_state?: Database["public"]["Enums"]["packaging_state"]
          parent_lot_id?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          units_count?: number | null
          updated_at?: string
          volume_liters?: number | null
        }
        Update: {
          batch_id?: string | null
          brewery_id?: string
          created_at?: string
          excise_state?: Database["public"]["Enums"]["excise_state"]
          id?: string
          internal_lot_ref?: string | null
          lot_date?: string | null
          lot_number?: string
          lot_type?: Database["public"]["Enums"]["lot_type"]
          notes?: string | null
          packaging_format_id?: string | null
          packaging_state?: Database["public"]["Enums"]["packaging_state"]
          parent_lot_id?: string | null
          status?: Database["public"]["Enums"]["lot_status"]
          units_count?: number | null
          updated_at?: string
          volume_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_packaging_format_id_fkey"
            columns: ["packaging_format_id"]
            isOneToOne: false
            referencedRelation: "packaging_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_parent_lot_id_fkey"
            columns: ["parent_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      mash_steps: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          actual_temp_c: number | null
          brew_log_id: string
          created_at: string
          duration_min: number | null
          id: string
          notes: string | null
          ph_actual: number | null
          stage: string | null
          step_order: number
          step_status: string | null
          target_temp_c: number | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          actual_temp_c?: number | null
          brew_log_id: string
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          ph_actual?: number | null
          stage?: string | null
          step_order?: number
          step_status?: string | null
          target_temp_c?: number | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          actual_temp_c?: number | null
          brew_log_id?: string
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          ph_actual?: number | null
          stage?: string | null
          step_order?: number
          step_status?: string | null
          target_temp_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mash_steps_brew_log_id_fkey"
            columns: ["brew_log_id"]
            isOneToOne: false
            referencedRelation: "brew_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_formats: {
        Row: {
          brewery_id: string
          container_type: string
          created_at: string
          id: string
          is_active: boolean
          is_reusable: boolean
          name: string
          notes: string | null
          package_size_label: string | null
          packaging_contribution_category: string | null
          size_liters: number
          updated_at: string
        }
        Insert: {
          brewery_id: string
          container_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_reusable?: boolean
          name: string
          notes?: string | null
          package_size_label?: string | null
          packaging_contribution_category?: string | null
          size_liters: number
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          container_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_reusable?: boolean
          name?: string
          notes?: string | null
          package_size_label?: string | null
          packaging_contribution_category?: string | null
          size_liters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_formats_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaging_formats_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_movements: {
        Row: {
          batch_id: string | null
          brewery_id: string
          completion_notes: string | null
          created_at: string
          destination_lot_id: string | null
          direction: Database["public"]["Enums"]["movement_direction"] | null
          elimination_reason: string | null
          id: string
          ingredient_id: string | null
          ingredient_receipt_id: string | null
          linked_task_id: string | null
          lot_id: string | null
          missing_fields_summary: string | null
          pending_type: string
          quantity: number | null
          resolution_status: Database["public"]["Enums"]["resolution_status"]
          sale_id: string | null
          scope: string | null
          source_lot_id: string | null
          unit: string | null
          updated_at: string
          why_completion_matters: string | null
        }
        Insert: {
          batch_id?: string | null
          brewery_id: string
          completion_notes?: string | null
          created_at?: string
          destination_lot_id?: string | null
          direction?: Database["public"]["Enums"]["movement_direction"] | null
          elimination_reason?: string | null
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          linked_task_id?: string | null
          lot_id?: string | null
          missing_fields_summary?: string | null
          pending_type: string
          quantity?: number | null
          resolution_status?: Database["public"]["Enums"]["resolution_status"]
          sale_id?: string | null
          scope?: string | null
          source_lot_id?: string | null
          unit?: string | null
          updated_at?: string
          why_completion_matters?: string | null
        }
        Update: {
          batch_id?: string | null
          brewery_id?: string
          completion_notes?: string | null
          created_at?: string
          destination_lot_id?: string | null
          direction?: Database["public"]["Enums"]["movement_direction"] | null
          elimination_reason?: string | null
          id?: string
          ingredient_id?: string | null
          ingredient_receipt_id?: string | null
          linked_task_id?: string | null
          lot_id?: string | null
          missing_fields_summary?: string | null
          pending_type?: string
          quantity?: number | null
          resolution_status?: Database["public"]["Enums"]["resolution_status"]
          sale_id?: string | null
          scope?: string | null
          source_lot_id?: string | null
          unit?: string | null
          updated_at?: string
          why_completion_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_destination_lot_id_fkey"
            columns: ["destination_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_ingredient_receipt_id_fkey"
            columns: ["ingredient_receipt_id"]
            isOneToOne: false
            referencedRelation: "ingredient_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_movements_source_lot_id_fkey"
            columns: ["source_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_boil_additions: {
        Row: {
          addition_stage: string | null
          addition_type: string | null
          created_at: string
          id: string
          ingredient_id: string | null
          notes: string | null
          quantity: number | null
          recipe_id: string
          step_order: number
          time_min: number | null
          unit: string | null
        }
        Insert: {
          addition_stage?: string | null
          addition_type?: string | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          notes?: string | null
          quantity?: number | null
          recipe_id: string
          step_order?: number
          time_min?: number | null
          unit?: string | null
        }
        Update: {
          addition_stage?: string | null
          addition_type?: string | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          notes?: string | null
          quantity?: number | null
          recipe_id?: string
          step_order?: number
          time_min?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_boil_additions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_boil_additions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          notes: string | null
          recipe_id: string
          sort_order: number
          stage: string | null
          suggested_quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          notes?: string | null
          recipe_id: string
          sort_order?: number
          stage?: string | null
          suggested_quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          notes?: string | null
          recipe_id?: string
          sort_order?: number
          stage?: string | null
          suggested_quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_mash_steps: {
        Row: {
          created_at: string
          duration_min: number | null
          id: string
          notes: string | null
          recipe_id: string
          stage: string | null
          step_order: number
          target_ph: number | null
          target_temp_c: number | null
        }
        Insert: {
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          recipe_id: string
          stage?: string | null
          step_order?: number
          target_ph?: number | null
          target_temp_c?: number | null
        }
        Update: {
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          recipe_id?: string
          stage?: string | null
          step_order?: number
          target_ph?: number | null
          target_temp_c?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_mash_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          brewery_id: string
          created_at: string
          default_batch_size_liters: number | null
          default_boil_duration_min: number | null
          default_packaging_format_id: string | null
          default_packaging_type: string | null
          default_yeast_notes: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          target_fermenter_volume_liters: number | null
          target_fg: number | null
          target_og: number | null
          target_post_boil_volume_liters: number | null
          target_pre_boil_volume_liters: number | null
          updated_at: string
        }
        Insert: {
          brewery_id: string
          created_at?: string
          default_batch_size_liters?: number | null
          default_boil_duration_min?: number | null
          default_packaging_format_id?: string | null
          default_packaging_type?: string | null
          default_yeast_notes?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          target_fermenter_volume_liters?: number | null
          target_fg?: number | null
          target_og?: number | null
          target_post_boil_volume_liters?: number | null
          target_pre_boil_volume_liters?: number | null
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          created_at?: string
          default_batch_size_liters?: number | null
          default_boil_duration_min?: number | null
          default_packaging_format_id?: string | null
          default_packaging_type?: string | null
          default_yeast_notes?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          target_fermenter_volume_liters?: number | null
          target_fg?: number | null
          target_og?: number | null
          target_post_boil_volume_liters?: number | null
          target_pre_boil_volume_liters?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_default_packaging_format_id_fkey"
            columns: ["default_packaging_format_id"]
            isOneToOne: false
            referencedRelation: "packaging_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number | null
          arc_reference: string | null
          brewery_id: string
          created_at: string
          currency: string
          customer: string
          due_date: string | null
          elimination_reason: string | null
          emcs_reference: string | null
          excise_mode: string | null
          id: string
          invoice_number: string | null
          lot_id: string | null
          notes: string | null
          sale_date: string | null
          status: Database["public"]["Enums"]["sale_status"]
          stock_direction: Database["public"]["Enums"]["movement_direction"]
          unit: string | null
          updated_at: string
          volume_sold: number | null
        }
        Insert: {
          amount?: number | null
          arc_reference?: string | null
          brewery_id: string
          created_at?: string
          currency?: string
          customer: string
          due_date?: string | null
          elimination_reason?: string | null
          emcs_reference?: string | null
          excise_mode?: string | null
          id?: string
          invoice_number?: string | null
          lot_id?: string | null
          notes?: string | null
          sale_date?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          stock_direction?: Database["public"]["Enums"]["movement_direction"]
          unit?: string | null
          updated_at?: string
          volume_sold?: number | null
        }
        Update: {
          amount?: number | null
          arc_reference?: string | null
          brewery_id?: string
          created_at?: string
          currency?: string
          customer?: string
          due_date?: string | null
          elimination_reason?: string | null
          emcs_reference?: string | null
          excise_mode?: string | null
          id?: string
          invoice_number?: string | null
          lot_id?: string | null
          notes?: string | null
          sale_date?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          stock_direction?: Database["public"]["Enums"]["movement_direction"]
          unit?: string | null
          updated_at?: string
          volume_sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      tanks: {
        Row: {
          brewery_id: string
          capacity_liters: number
          created_at: string
          current_batch_id: string | null
          id: string
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["tank_status"]
          updated_at: string
        }
        Insert: {
          brewery_id: string
          capacity_liters: number
          created_at?: string
          current_batch_id?: string | null
          id?: string
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["tank_status"]
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          capacity_liters?: number
          created_at?: string
          current_batch_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["tank_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tanks_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tanks_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tanks_current_batch_id_fkey"
            columns: ["current_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          brewery_id: string
          completed_at: string | null
          created_at: string
          deduplication_key: string | null
          due_date: string | null
          id: string
          is_archived: boolean
          is_deleted: boolean
          is_system_generated: boolean
          linked_batch_id: string | null
          linked_issue_id: string | null
          linked_pending_movement_id: string | null
          linked_sale_id: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          relevance_score: number | null
          scheduled_time: string | null
          source: string | null
          status: Database["public"]["Enums"]["task_status"]
          suggestion_reason: string | null
          suggestion_type: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          brewery_id: string
          completed_at?: string | null
          created_at?: string
          deduplication_key?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          is_system_generated?: boolean
          linked_batch_id?: string | null
          linked_issue_id?: string | null
          linked_pending_movement_id?: string | null
          linked_sale_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          relevance_score?: number | null
          scheduled_time?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          suggestion_reason?: string | null
          suggestion_type?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          completed_at?: string | null
          created_at?: string
          deduplication_key?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          is_system_generated?: boolean
          linked_batch_id?: string | null
          linked_issue_id?: string | null
          linked_pending_movement_id?: string | null
          linked_sale_id?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          relevance_score?: number | null
          scheduled_time?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          suggestion_reason?: string | null
          suggestion_type?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_linked_batch_id_fkey"
            columns: ["linked_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_linked_issue_id_fkey"
            columns: ["linked_issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_linked_pending_movement_id_fkey"
            columns: ["linked_pending_movement_id"]
            isOneToOne: false
            referencedRelation: "pending_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_linked_sale_id_fkey"
            columns: ["linked_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          brewery_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          brewery_id: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      breweries: {
        Row: {
          country: string | null
          created_at: string | null
          currency: string | null
          display_name: string | null
          emcs_enabled: boolean | null
          excise_authorization_number: string | null
          id: string | null
          is_small_independent_brewery: boolean | null
          language: string | null
          legal_name: string | null
          name: string | null
          notion_source_id: string | null
          onboarding_status: string | null
          packaging_contribution_mode: string | null
          timezone: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          emcs_enabled?: boolean | null
          excise_authorization_number?: string | null
          id?: string | null
          is_small_independent_brewery?: boolean | null
          language?: string | null
          legal_name?: string | null
          name?: string | null
          notion_source_id?: string | null
          onboarding_status?: string | null
          packaging_contribution_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          emcs_enabled?: boolean | null
          excise_authorization_number?: string | null
          id?: string | null
          is_small_independent_brewery?: boolean | null
          language?: string | null
          legal_name?: string | null
          name?: string | null
          notion_source_id?: string | null
          onboarding_status?: string | null
          packaging_contribution_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      brewery_users: {
        Row: {
          brewery_id: string | null
          created_at: string | null
          email: string | null
          is_active: boolean | null
          membership_role: Database["public"]["Enums"]["user_role"] | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          brewery_id?: string | null
          created_at?: string | null
          email?: string | null
          is_active?: boolean | null
          membership_role?: Database["public"]["Enums"]["user_role"] | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          brewery_id?: string | null
          created_at?: string | null
          email?: string | null
          is_active?: boolean | null
          membership_role?: Database["public"]["Enums"]["user_role"] | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "brewery_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      provision_brewery: {
        Args: {
          p_auth_user_id: string
          p_brewery_name: string
          p_country: string
          p_emcs_enabled: boolean
          p_language: string
          p_notion_source_id?: string
          p_timezone: string
          p_user_email: string
          p_user_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      batch_status:
        | "planned"
        | "brewing"
        | "fermenting"
        | "conditioning"
        | "ready"
        | "packaged"
        | "closed"
      declaration_status: "draft" | "submitted" | "accepted" | "rejected"
      demo_overlay_op: "insert" | "update" | "delete"
      demo_session_status: "active" | "exited" | "expired"
      excise_state: "not_applicable" | "pending" | "submitted" | "cleared"
      issue_severity: "low" | "medium" | "high" | "critical"
      issue_status: "open" | "in_progress" | "resolved" | "dismissed"
      lot_status: "active" | "depleted" | "archived"
      lot_type: "batch_output" | "packaged" | "adjustment" | "transfer_in"
      movement_direction: "in" | "out" | "internal"
      packaging_state: "unpackaged" | "packaged" | "mixed"
      resolution_status: "pending" | "resolved" | "eliminated"
      sale_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "invoiced"
        | "paid"
        | "cancelled"
      tank_status:
        | "available"
        | "fermenting"
        | "conditioning"
        | "cleaning"
        | "maintenance"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status: "pending" | "in_progress" | "completed" | "archived"
      user_role:
        | "owner"
        | "brewmaster_admin"
        | "finance"
        | "brewer"
        | "assistant"
        | "viewer"
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
  public: {
    Enums: {
      batch_status: [
        "planned",
        "brewing",
        "fermenting",
        "conditioning",
        "ready",
        "packaged",
        "closed",
      ],
      declaration_status: ["draft", "submitted", "accepted", "rejected"],
      demo_overlay_op: ["insert", "update", "delete"],
      demo_session_status: ["active", "exited", "expired"],
      excise_state: ["not_applicable", "pending", "submitted", "cleared"],
      issue_severity: ["low", "medium", "high", "critical"],
      issue_status: ["open", "in_progress", "resolved", "dismissed"],
      lot_status: ["active", "depleted", "archived"],
      lot_type: ["batch_output", "packaged", "adjustment", "transfer_in"],
      movement_direction: ["in", "out", "internal"],
      packaging_state: ["unpackaged", "packaged", "mixed"],
      resolution_status: ["pending", "resolved", "eliminated"],
      sale_status: [
        "pending",
        "confirmed",
        "shipped",
        "invoiced",
        "paid",
        "cancelled",
      ],
      tank_status: [
        "available",
        "fermenting",
        "conditioning",
        "cleaning",
        "maintenance",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: ["pending", "in_progress", "completed", "archived"],
      user_role: [
        "owner",
        "brewmaster_admin",
        "finance",
        "brewer",
        "assistant",
        "viewer",
      ],
    },
  },
} as const
