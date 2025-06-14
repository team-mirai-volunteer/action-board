export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string;
          id: string;
          mission_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          mission_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          mission_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "achievements_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_action_summary: {
        Row: {
          count: number;
          created_at: string;
          date: string;
        };
        Insert: {
          count: number;
          created_at?: string;
          date: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          date?: string;
        };
        Relationships: [];
      };
      daily_dashboard_registration_by_prefecture_summary: {
        Row: {
          count: number;
          created_at: string;
          date: string;
          prefecture: string;
        };
        Insert: {
          count: number;
          created_at?: string;
          date: string;
          prefecture: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          date?: string;
          prefecture?: string;
        };
        Relationships: [];
      };
      daily_dashboard_registration_summary: {
        Row: {
          count: number;
          created_at: string;
          date: string;
        };
        Insert: {
          count: number;
          created_at?: string;
          date: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          date?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          created_at: string;
          id: string;
          starts_at: string;
          title: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          starts_at: string;
          title: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          starts_at?: string;
          title?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      mission_artifact_geolocations: {
        Row: {
          accuracy: number | null;
          altitude: number | null;
          created_at: string;
          id: number;
          lat: number;
          lon: number;
          mission_artifact_id: string;
        };
        Insert: {
          accuracy?: number | null;
          altitude?: number | null;
          created_at?: string;
          id?: number;
          lat: number;
          lon: number;
          mission_artifact_id: string;
        };
        Update: {
          accuracy?: number | null;
          altitude?: number | null;
          created_at?: string;
          id?: number;
          lat?: number;
          lon?: number;
          mission_artifact_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_artifact_geolocations_mission_artifact_id_fkey";
            columns: ["mission_artifact_id"];
            isOneToOne: false;
            referencedRelation: "mission_artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      mission_artifacts: {
        Row: {
          achievement_id: string;
          artifact_type: string;
          created_at: string;
          description: string | null;
          id: string;
          image_storage_path: string | null;
          link_url: string | null;
          text_content: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          achievement_id: string;
          artifact_type: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_storage_path?: string | null;
          link_url?: string | null;
          text_content?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          achievement_id?: string;
          artifact_type?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_storage_path?: string | null;
          link_url?: string | null;
          text_content?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_artifacts_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mission_artifacts_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "activity_timeline_view";
            referencedColumns: ["id"];
          },
        ];
      };
      missions: {
        Row: {
          artifact_label: string | null;
          content: string | null;
          created_at: string;
          difficulty: number;
          event_date: string | null;
          icon_url: string | null;
          id: string;
          is_featured: boolean;
          is_hidden: boolean;
          max_achievement_count: number | null;
          ogp_image_url: string | null;
          required_artifact_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          artifact_label?: string | null;
          content?: string | null;
          created_at?: string;
          difficulty: number;
          event_date?: string | null;
          icon_url?: string | null;
          id: string;
          is_featured?: boolean;
          is_hidden?: boolean;
          max_achievement_count?: number | null;
          ogp_image_url?: string | null;
          required_artifact_type?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          artifact_label?: string | null;
          content?: string | null;
          created_at?: string;
          difficulty?: number;
          event_date?: string | null;
          icon_url?: string | null;
          id?: string;
          is_featured?: boolean;
          is_hidden?: boolean;
          max_achievement_count?: number | null;
          ogp_image_url?: string | null;
          required_artifact_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posting_activities: {
        Row: {
          created_at: string;
          id: string;
          location_text: string;
          mission_artifact_id: string;
          posting_count: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location_text: string;
          mission_artifact_id: string;
          posting_count: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location_text?: string;
          mission_artifact_id?: string;
          posting_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posting_activities_mission_artifact_id_fkey";
            columns: ["mission_artifact_id"];
            isOneToOne: false;
            referencedRelation: "mission_artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      posting_shapes: {
        Row: {
          coordinates: Json;
          created_at: string | null;
          id: string;
          properties: Json | null;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          coordinates: Json;
          created_at?: string | null;
          id: string;
          properties?: Json | null;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          coordinates?: Json;
          created_at?: string | null;
          id?: string;
          properties?: Json | null;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      private_users: {
        Row: {
          address_prefecture: string;
          avatar_url: string | null;
          created_at: string;
          date_of_birth: string;
          id: string;
          name: string;
          postcode: string;
          registered_at: string;
          updated_at: string;
          x_username: string | null;
        };
        Insert: {
          address_prefecture: string;
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth: string;
          id: string;
          name: string;
          postcode: string;
          registered_at?: string;
          updated_at?: string;
          x_username?: string | null;
        };
        Update: {
          address_prefecture?: string;
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string;
          id?: string;
          name?: string;
          postcode?: string;
          registered_at?: string;
          updated_at?: string;
          x_username?: string | null;
        };
        Relationships: [];
      };
      public_user_profiles: {
        Row: {
          address_prefecture: string;
          avatar_url: string | null;
          created_at: string;
          id: string;
          name: string;
          x_username: string | null;
        };
        Insert: {
          address_prefecture: string;
          avatar_url?: string | null;
          created_at: string;
          id: string;
          name: string;
          x_username?: string | null;
        };
        Update: {
          address_prefecture?: string;
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          x_username?: string | null;
        };
        Relationships: [];
      };
      user_levels: {
        Row: {
          last_notified_level: number | null;
          level: number;
          updated_at: string;
          user_id: string;
          xp: number;
        };
        Insert: {
          last_notified_level?: number | null;
          level?: number;
          updated_at?: string;
          user_id: string;
          xp?: number;
        };
        Update: {
          last_notified_level?: number | null;
          level?: number;
          updated_at?: string;
          user_id?: string;
          xp?: number;
        };
        Relationships: [];
      };
      user_referral: {
        Row: {
          created_at: string | null;
          del_flg: boolean;
          referral_code: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          del_flg?: boolean;
          referral_code: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          del_flg?: boolean;
          referral_code?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      weekly_event_count_by_prefecture_summary: {
        Row: {
          count: number;
          created_at: string;
          date: string;
          prefecture: string;
        };
        Insert: {
          count: number;
          created_at?: string;
          date: string;
          prefecture: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          date?: string;
          prefecture?: string;
        };
        Relationships: [];
      };
      weekly_event_count_summary: {
        Row: {
          count: number;
          created_at: string;
          date: string;
        };
        Insert: {
          count: number;
          created_at?: string;
          date: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          date?: string;
        };
        Relationships: [];
      };
      xp_transactions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          source_id: string | null;
          source_type: string;
          user_id: string;
          xp_amount: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          source_id?: string | null;
          source_type: string;
          user_id: string;
          xp_amount: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          source_id?: string | null;
          source_type?: string;
          user_id?: string;
          xp_amount?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      activity_timeline_view: {
        Row: {
          address_prefecture: string | null;
          avatar_url: string | null;
          created_at: string | null;
          id: string | null;
          name: string | null;
          title: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      mission_achievement_count_view: {
        Row: {
          achievement_count: number | null;
          mission_id: string | null;
        };
        Relationships: [];
      };
      user_ranking_view: {
        Row: {
          address_prefecture: string | null;
          level: number | null;
          name: string | null;
          rank: number | null;
          updated_at: string | null;
          user_id: string | null;
          xp: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_mission_ranking: {
        Args: { mission_id: string; limit_count: number };
        Returns: {
          user_id: string;
          user_name: string;
          address_prefecture: string;
          level: number;
          xp: number;
          updated_at: string;
          clear_count: number;
          rank: number;
        }[];
      };
      get_prefecture_ranking: {
        Args: { prefecture: string; limit_count?: number };
        Returns: {
          user_id: string;
          user_name: string;
          address_prefecture: string;
          rank: number;
          level: number;
          xp: number;
          updated_at: string;
        }[];
      };
      get_user_mission_ranking: {
        Args: { mission_id: string; user_id: string };
        Returns: {
          user_id: string;
          user_name: string;
          address_prefecture: string;
          level: number;
          xp: number;
          updated_at: string;
          clear_count: number;
          rank: number;
        }[];
      };
      get_user_prefecture_ranking: {
        Args: { prefecture: string; target_user_id: string };
        Returns: {
          user_id: string;
          user_name: string;
          address_prefecture: string;
          rank: number;
          level: number;
          xp: number;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
