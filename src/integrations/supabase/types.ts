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
      applications: {
        Row: {
          comments: string | null
          created_at: string
          department: string | null
          from_date: string | null
          id: string
          is_draft: boolean | null
          reason: string | null
          register_number: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          student_name: string | null
          to_date: string | null
          type: Database["public"]["Enums"]["application_type"]
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          department?: string | null
          from_date?: string | null
          id?: string
          is_draft?: boolean | null
          reason?: string | null
          register_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          student_name?: string | null
          to_date?: string | null
          type: Database["public"]["Enums"]["application_type"]
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          department?: string | null
          from_date?: string | null
          id?: string
          is_draft?: boolean | null
          reason?: string | null
          register_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          student_name?: string | null
          to_date?: string | null
          type?: Database["public"]["Enums"]["application_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "public_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          blood_group: string | null
          boarding_point: string | null
          bus_number: string | null
          cgpa: number | null
          class_coordinator_name: string | null
          college: string | null
          created_at: string
          department: string | null
          dob: string | null
          father_name: string | null
          github_id: string | null
          id: string
          linkedin_id: string | null
          mobile: string | null
          mother_name: string | null
          name: string | null
          parent_mobile: string | null
          portfolio_link: string | null
          profile_completed: boolean | null
          profile_picture: string | null
          register_number: string | null
          resume_link: string | null
          room_number: string | null
          section: string | null
          semester: number | null
          student_type: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          blood_group?: string | null
          boarding_point?: string | null
          bus_number?: string | null
          cgpa?: number | null
          class_coordinator_name?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          dob?: string | null
          father_name?: string | null
          github_id?: string | null
          id: string
          linkedin_id?: string | null
          mobile?: string | null
          mother_name?: string | null
          name?: string | null
          parent_mobile?: string | null
          portfolio_link?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          register_number?: string | null
          resume_link?: string | null
          room_number?: string | null
          section?: string | null
          semester?: number | null
          student_type?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          blood_group?: string | null
          boarding_point?: string | null
          bus_number?: string | null
          cgpa?: number | null
          class_coordinator_name?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          dob?: string | null
          father_name?: string | null
          github_id?: string | null
          id?: string
          linkedin_id?: string | null
          mobile?: string | null
          mother_name?: string | null
          name?: string | null
          parent_mobile?: string | null
          portfolio_link?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          register_number?: string | null
          resume_link?: string | null
          room_number?: string | null
          section?: string | null
          semester?: number | null
          student_type?: string | null
          updated_at?: string
          year?: number | null
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
    }
    Views: {
      public_portfolios: {
        Row: {
          bio: string | null
          cgpa: number | null
          college: string | null
          department: string | null
          github_id: string | null
          id: string | null
          linkedin_id: string | null
          name: string | null
          portfolio_link: string | null
          profile_picture: string | null
          resume_link: string | null
          section: string | null
          semester: number | null
          year: number | null
        }
        Insert: {
          bio?: string | null
          cgpa?: number | null
          college?: string | null
          department?: string | null
          github_id?: string | null
          id?: string | null
          linkedin_id?: string | null
          name?: string | null
          portfolio_link?: string | null
          profile_picture?: string | null
          resume_link?: string | null
          section?: string | null
          semester?: number | null
          year?: number | null
        }
        Update: {
          bio?: string | null
          cgpa?: number | null
          college?: string | null
          department?: string | null
          github_id?: string | null
          id?: string | null
          linkedin_id?: string | null
          name?: string | null
          portfolio_link?: string | null
          profile_picture?: string | null
          resume_link?: string | null
          section?: string | null
          semester?: number | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_portfolio: {
        Args: { _user_id: string }
        Returns: {
          bio: string
          cgpa: number
          college: string
          department: string
          github_id: string
          id: string
          linkedin_id: string
          name: string
          portfolio_link: string
          profile_picture: string
          resume_link: string
          section: string
          semester: number
          year: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      application_status: "pending" | "approved" | "rejected"
      application_type:
        | "od"
        | "leave"
        | "internship"
        | "industrial-visit"
        | "hostel-od"
        | "day-scholar-od"
        | "siph-od"
      notification_type: "approval" | "rejection" | "info"
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
      app_role: ["admin", "user"],
      application_status: ["pending", "approved", "rejected"],
      application_type: [
        "od",
        "leave",
        "internship",
        "industrial-visit",
        "hostel-od",
        "day-scholar-od",
        "siph-od",
      ],
      notification_type: ["approval", "rejection", "info"],
    },
  },
} as const
