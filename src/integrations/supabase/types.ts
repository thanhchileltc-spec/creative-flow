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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          by_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          from_state: string
          id: string
          note: string | null
          step_id: string
          talent_id: string
          to_state: string
        }
        Insert: {
          by_role: Database["public"]["Enums"]["app_role"]
          created_at?: string
          from_state: string
          id?: string
          note?: string | null
          step_id: string
          talent_id: string
          to_state: string
        }
        Update: {
          by_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          from_state?: string
          id?: string
          note?: string | null
          step_id?: string
          talent_id?: string
          to_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          code: string
          created_at: string
          delay: number
          id: string
          location: string
          logline: string | null
          meta: string | null
          paired_with: string | null
          roles: Database["public"]["Enums"]["app_role"][]
          shoot_window: string | null
          slug: string
          stage_details: Json
          stage_index: number
          stage_label: string | null
          status: string
          talent_records: Json
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          delay?: number
          id?: string
          location: string
          logline?: string | null
          meta?: string | null
          paired_with?: string | null
          roles?: Database["public"]["Enums"]["app_role"][]
          shoot_window?: string | null
          slug: string
          stage_details?: Json
          stage_index?: number
          stage_label?: string | null
          status?: string
          talent_records?: Json
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          delay?: number
          id?: string
          location?: string
          logline?: string | null
          meta?: string | null
          paired_with?: string | null
          roles?: Database["public"]["Enums"]["app_role"][]
          shoot_window?: string | null
          slug?: string
          stage_details?: Json
          stage_index?: number
          stage_label?: string | null
          status?: string
          talent_records?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_sync_log: {
        Row: {
          actions: Json
          created_at: string
          episode_id: string
          id: string
          signature: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          episode_id: string
          id?: string
          signature: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          created_at?: string
          episode_id?: string
          id?: string
          signature?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sync_log_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_checklist: {
        Row: {
          created_at: string
          handoff_id: string
          id: string
          label: string
          note: string | null
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          handoff_id: string
          id?: string
          label: string
          note?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          handoff_id?: string
          id?: string
          label?: string
          note?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoff_checklist_handoff_id_fkey"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_deliverables: {
        Row: {
          created_at: string
          due: string | null
          handoff_id: string
          id: string
          label: string
          sort_order: number
          spec: string | null
        }
        Insert: {
          created_at?: string
          due?: string | null
          handoff_id: string
          id?: string
          label: string
          sort_order?: number
          spec?: string | null
        }
        Update: {
          created_at?: string
          due?: string | null
          handoff_id?: string
          id?: string
          label?: string
          sort_order?: number
          spec?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handoff_deliverables_handoff_id_fkey"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_dp_notes: {
        Row: {
          created_at: string
          handoff_id: string
          id: string
          lens: string | null
          light: string | null
          movement: string | null
          note: string | null
          scene: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          handoff_id: string
          id?: string
          lens?: string | null
          light?: string | null
          movement?: string | null
          note?: string | null
          scene: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          handoff_id?: string
          id?: string
          lens?: string | null
          light?: string | null
          movement?: string | null
          note?: string | null
          scene?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "handoff_dp_notes_handoff_id_fkey"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_feedback: {
        Row: {
          body: string
          by_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          episode_id: string
          id: string
          resolved_at: string | null
          resolved_by: Database["public"]["Enums"]["app_role"] | null
          state: string
          target: string
        }
        Insert: {
          body: string
          by_role: Database["public"]["Enums"]["app_role"]
          created_at?: string
          episode_id: string
          id?: string
          resolved_at?: string | null
          resolved_by?: Database["public"]["Enums"]["app_role"] | null
          state?: string
          target: string
        }
        Update: {
          body?: string
          by_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          episode_id?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: Database["public"]["Enums"]["app_role"] | null
          state?: string
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoff_feedback_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_treatment_sections: {
        Row: {
          body: string
          created_at: string
          handoff_id: string
          heading: string
          id: string
          sort_order: number
        }
        Insert: {
          body: string
          created_at?: string
          handoff_id: string
          heading: string
          id?: string
          sort_order?: number
        }
        Update: {
          body?: string
          created_at?: string
          handoff_id?: string
          heading?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "handoff_treatment_sections_handoff_id_fkey"
            columns: ["handoff_id"]
            isOneToOne: false
            referencedRelation: "handoffs"
            referencedColumns: ["id"]
          },
        ]
      }
      handoffs: {
        Row: {
          created_at: string
          director: string | null
          dp: string | null
          edit_window: string | null
          editor: string | null
          episode_id: string
          id: string
          music_ref: string | null
          narrative_spine: string | null
          status: string
          tech: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          director?: string | null
          dp?: string | null
          edit_window?: string | null
          editor?: string | null
          episode_id: string
          id?: string
          music_ref?: string | null
          narrative_spine?: string | null
          status?: string
          tech?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          director?: string | null
          dp?: string | null
          edit_window?: string | null
          editor?: string | null
          episode_id?: string
          id?: string
          music_ref?: string | null
          narrative_spine?: string | null
          status?: string
          tech?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoffs_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          episode_id: string | null
          from_role: Database["public"]["Enums"]["app_role"]
          id: string
          kind: string
          read: boolean
          title: string
          to_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          body: string
          created_at?: string
          episode_id?: string | null
          from_role: Database["public"]["Enums"]["app_role"]
          id?: string
          kind: string
          read?: boolean
          title: string
          to_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          body?: string
          created_at?: string
          episode_id?: string | null
          from_role?: Database["public"]["Enums"]["app_role"]
          id?: string
          kind?: string
          read?: boolean
          title?: string
          to_role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_role: Database["public"]["Enums"]["app_role"] | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_role?: Database["public"]["Enums"]["app_role"] | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_role?: Database["public"]["Enums"]["app_role"] | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shoot_day_crew: {
        Row: {
          call_time: string | null
          created_at: string
          id: string
          name: string
          role: string
          shoot_day_id: string
          sort_order: number
          unit: string
        }
        Insert: {
          call_time?: string | null
          created_at?: string
          id?: string
          name: string
          role: string
          shoot_day_id: string
          sort_order?: number
          unit: string
        }
        Update: {
          call_time?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          shoot_day_id?: string
          sort_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "shoot_day_crew_shoot_day_id_fkey"
            columns: ["shoot_day_id"]
            isOneToOne: false
            referencedRelation: "shoot_days"
            referencedColumns: ["id"]
          },
        ]
      }
      shoot_day_logistics: {
        Row: {
          created_at: string
          id: string
          label: string
          shoot_day_id: string
          sort_order: number
          status: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          shoot_day_id: string
          sort_order?: number
          status?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          shoot_day_id?: string
          sort_order?: number
          status?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shoot_day_logistics_shoot_day_id_fkey"
            columns: ["shoot_day_id"]
            isOneToOne: false
            referencedRelation: "shoot_days"
            referencedColumns: ["id"]
          },
        ]
      }
      shoot_day_schedule: {
        Row: {
          created_at: string
          id: string
          label: string
          note: string | null
          shoot_day_id: string
          sort_order: number
          time: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          note?: string | null
          shoot_day_id: string
          sort_order?: number
          time: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          note?: string | null
          shoot_day_id?: string
          sort_order?: number
          time?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "shoot_day_schedule_shoot_day_id_fkey"
            columns: ["shoot_day_id"]
            isOneToOne: false
            referencedRelation: "shoot_days"
            referencedColumns: ["id"]
          },
        ]
      }
      shoot_days: {
        Row: {
          city: string
          created_at: string
          date: string
          day_code: string
          id: string
          note: string | null
          pair: Json
          status: string
          updated_at: string
          wrap: string | null
        }
        Insert: {
          city: string
          created_at?: string
          date: string
          day_code: string
          id?: string
          note?: string | null
          pair?: Json
          status?: string
          updated_at?: string
          wrap?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          date?: string
          day_code?: string
          id?: string
          note?: string | null
          pair?: Json
          status?: string
          updated_at?: string
          wrap?: string | null
        }
        Relationships: []
      }
      talent_calls: {
        Row: {
          created_at: string
          date: string
          duration: string | null
          id: string
          interviewer: Database["public"]["Enums"]["app_role"]
          outcome: string
          summary: string | null
          talent_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: string | null
          id?: string
          interviewer: Database["public"]["Enums"]["app_role"]
          outcome: string
          summary?: string | null
          talent_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: string | null
          id?: string
          interviewer?: Database["public"]["Enums"]["app_role"]
          outcome?: string
          summary?: string | null
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_calls_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_episodes: {
        Row: {
          episode_id: string
          id: string
          talent_id: string
        }
        Insert: {
          episode_id: string
          id?: string
          talent_id: string
        }
        Update: {
          episode_id?: string
          id?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_episodes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_episodes_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_step_records: {
        Row: {
          by_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          date: string | null
          id: string
          note: string | null
          state: string
          step_id: string
          talent_id: string
          updated_at: string
        }
        Insert: {
          by_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          date?: string | null
          id?: string
          note?: string | null
          state?: string
          step_id: string
          talent_id: string
          updated_at?: string
        }
        Update: {
          by_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          date?: string | null
          id?: string
          note?: string | null
          state?: string
          step_id?: string
          talent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_step_records_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          approval: string
          contact: string | null
          craft: string
          created_at: string
          id: string
          location: string
          name: string
          slug: string
          sourced_by: Database["public"]["Enums"]["app_role"]
          sourced_on: string | null
          sourced_via: string | null
          story_fit_note: string | null
          story_fit_risk: string | null
          story_fit_score: number
          updated_at: string
        }
        Insert: {
          approval?: string
          contact?: string | null
          craft: string
          created_at?: string
          id?: string
          location: string
          name: string
          slug: string
          sourced_by: Database["public"]["Enums"]["app_role"]
          sourced_on?: string | null
          sourced_via?: string | null
          story_fit_note?: string | null
          story_fit_risk?: string | null
          story_fit_score?: number
          updated_at?: string
        }
        Update: {
          approval?: string
          contact?: string | null
          craft?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          slug?: string
          sourced_by?: Database["public"]["Enums"]["app_role"]
          sourced_on?: string | null
          sourced_via?: string | null
          story_fit_note?: string | null
          story_fit_risk?: string | null
          story_fit_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          owner: Database["public"]["Enums"]["app_role"]
          required: boolean
          sort_order: number
          step_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          owner: Database["public"]["Enums"]["app_role"]
          required?: boolean
          sort_order?: number
          step_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          owner?: Database["public"]["Enums"]["app_role"]
          required?: boolean
          sort_order?: number
          step_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "EP" | "PR" | "SP" | "DP" | "ED"
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
      app_role: ["EP", "PR", "SP", "DP", "ED"],
    },
  },
} as const
