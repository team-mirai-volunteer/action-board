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
            referencedRelation: "mission_category_view";
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
        ];
      };
      mission_category: {
        Row: {
          category_kbn: string;
          category_title: string | null;
          created_at: string;
          del_flg: boolean;
          id: string;
          slug: string;
          sort_no: number;
          updated_at: string;
        };
        Insert: {
          category_kbn?: string;
          category_title?: string | null;
          created_at?: string;
          del_flg?: boolean;
          id: string;
          slug: string;
          sort_no?: number;
          updated_at?: string;
        };
        Update: {
          category_kbn?: string;
          category_title?: string | null;
          created_at?: string;
          del_flg?: boolean;
          id?: string;
          slug?: string;
          sort_no?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      mission_category_link: {
        Row: {
          category_id: string;
          created_at: string;
          del_flg: boolean;
          mission_id: string;
          sort_no: number;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          del_flg?: boolean;
          mission_id: string;
          sort_no?: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          del_flg?: boolean;
          mission_id?: string;
          sort_no?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_category_link_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "mission_category";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mission_category_link_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["category_id"];
          },
          {
            foreignKeyName: "mission_category_link_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_category_link_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_category_link_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      mission_main_links: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          link: string;
          mission_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          link: string;
          mission_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          link?: string;
          mission_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_main_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: true;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_main_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: true;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_main_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: true;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      mission_quiz_links: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          link: string;
          mission_id: string;
          remark: string | null;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          link: string;
          mission_id: string;
          remark?: string | null;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          link?: string;
          mission_id?: string;
          remark?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mission_quiz_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_quiz_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "mission_quiz_links_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
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
          slug: string;
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
          slug: string;
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
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      poster_activities: {
        Row: {
          address: string | null;
          board_id: string | null;
          city: string;
          created_at: string;
          id: string;
          lat: number | null;
          long: number | null;
          mission_artifact_id: string;
          name: string | null;
          note: string | null;
          number: string;
          poster_count: number;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          board_id?: string | null;
          city: string;
          created_at?: string;
          id?: string;
          lat?: number | null;
          long?: number | null;
          mission_artifact_id: string;
          name?: string | null;
          note?: string | null;
          number: string;
          poster_count: number;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string | null;
          board_id?: string | null;
          city?: string;
          created_at?: string;
          id?: string;
          lat?: number | null;
          long?: number | null;
          mission_artifact_id?: string;
          name?: string | null;
          note?: string | null;
          number?: string;
          poster_count?: number;
          prefecture?: Database["public"]["Enums"]["poster_prefecture_enum"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poster_activities_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "poster_board_latest_editors";
            referencedColumns: ["board_id"];
          },
          {
            foreignKeyName: "poster_activities_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "poster_boards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poster_activities_mission_artifact_id_fkey";
            columns: ["mission_artifact_id"];
            isOneToOne: false;
            referencedRelation: "mission_artifacts";
            referencedColumns: ["id"];
          },
        ];
      };
      poster_board_status_history: {
        Row: {
          board_id: string;
          created_at: string;
          id: string;
          new_status: Database["public"]["Enums"]["poster_board_status"];
          note: string | null;
          previous_status:
            | Database["public"]["Enums"]["poster_board_status"]
            | null;
          user_id: string;
        };
        Insert: {
          board_id: string;
          created_at?: string;
          id?: string;
          new_status: Database["public"]["Enums"]["poster_board_status"];
          note?: string | null;
          previous_status?:
            | Database["public"]["Enums"]["poster_board_status"]
            | null;
          user_id: string;
        };
        Update: {
          board_id?: string;
          created_at?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["poster_board_status"];
          note?: string | null;
          previous_status?:
            | Database["public"]["Enums"]["poster_board_status"]
            | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poster_board_status_history_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "poster_board_latest_editors";
            referencedColumns: ["board_id"];
          },
          {
            foreignKeyName: "poster_board_status_history_board_id_fkey";
            columns: ["board_id"];
            isOneToOne: false;
            referencedRelation: "poster_boards";
            referencedColumns: ["id"];
          },
        ];
      };
      poster_board_totals: {
        Row: {
          city: string | null;
          created_at: string | null;
          id: string;
          note: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          source: string | null;
          total_count: number;
          updated_at: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          source?: string | null;
          total_count: number;
          updated_at?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          prefecture?: Database["public"]["Enums"]["poster_prefecture_enum"];
          source?: string | null;
          total_count?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      poster_boards: {
        Row: {
          address: string | null;
          city: string;
          created_at: string;
          file_name: string | null;
          id: string;
          lat: number;
          long: number;
          name: string | null;
          number: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number: number | null;
          status: Database["public"]["Enums"]["poster_board_status"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city: string;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          lat: number;
          long: number;
          name?: string | null;
          number?: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number?: number | null;
          status?: Database["public"]["Enums"]["poster_board_status"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          city?: string;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          lat?: number;
          long?: number;
          name?: string | null;
          number?: string | null;
          prefecture?: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number?: number | null;
          status?: Database["public"]["Enums"]["poster_board_status"];
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
          id?: string;
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
          hubspot_contact_id: string | null;
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
          hubspot_contact_id?: string | null;
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
          hubspot_contact_id?: string | null;
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
          github_username: string | null;
          id: string;
          name: string;
          x_username: string | null;
        };
        Insert: {
          address_prefecture: string;
          avatar_url?: string | null;
          created_at: string;
          github_username?: string | null;
          id: string;
          name: string;
          x_username?: string | null;
        };
        Update: {
          address_prefecture?: string;
          avatar_url?: string | null;
          created_at?: string;
          github_username?: string | null;
          id?: string;
          name?: string;
          x_username?: string | null;
        };
        Relationships: [];
      };
      quiz_categories: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          category_id: string;
          correct_answer: number;
          created_at: string;
          explanation: string | null;
          id: string;
          is_active: boolean;
          mission_id: string | null;
          option1: string;
          option2: string;
          option3: string;
          option4: string;
          question: string;
          question_order: number | null;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          correct_answer: number;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          is_active?: boolean;
          mission_id?: string | null;
          option1: string;
          option2: string;
          option3: string;
          option4: string;
          question: string;
          question_order?: number | null;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          correct_answer?: number;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          is_active?: boolean;
          mission_id?: string | null;
          option1?: string;
          option2?: string;
          option3?: string;
          option4?: string;
          question?: string;
          question_order?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "quiz_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      staging_poster_boards: {
        Row: {
          address: string | null;
          city: string;
          created_at: string;
          file_name: string | null;
          id: string | null;
          lat: number;
          long: number;
          name: string | null;
          number: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number: number | null;
          status: Database["public"]["Enums"]["poster_board_status"];
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city: string;
          created_at?: string;
          file_name?: string | null;
          id?: string | null;
          lat: number;
          long: number;
          name?: string | null;
          number?: string | null;
          prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number?: number | null;
          status?: Database["public"]["Enums"]["poster_board_status"];
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          city?: string;
          created_at?: string;
          file_name?: string | null;
          id?: string | null;
          lat?: number;
          long?: number;
          name?: string | null;
          number?: string | null;
          prefecture?: Database["public"]["Enums"]["poster_prefecture_enum"];
          row_number?: number | null;
          status?: Database["public"]["Enums"]["poster_board_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      user_activities: {
        Row: {
          activity_title: string;
          activity_type: string;
          created_at: string;
          id: string;
          user_id: string | null;
        };
        Insert: {
          activity_title: string;
          activity_type: string;
          created_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          activity_title?: string;
          activity_type?: string;
          created_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "public_user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_badges: {
        Row: {
          achieved_at: string;
          badge_type: string;
          created_at: string;
          id: string;
          is_notified: boolean;
          rank: number;
          sub_type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          achieved_at?: string;
          badge_type: string;
          created_at?: string;
          id?: string;
          is_notified?: boolean;
          rank: number;
          sub_type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          achieved_at?: string;
          badge_type?: string;
          created_at?: string;
          id?: string;
          is_notified?: boolean;
          rank?: number;
          sub_type?: string | null;
          updated_at?: string;
          user_id?: string;
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
          activity_type: string | null;
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
      mission_category_view: {
        Row: {
          artifact_label: string | null;
          category_id: string | null;
          category_kbn: string | null;
          category_sort_no: number | null;
          category_title: string | null;
          content: string | null;
          created_at: string | null;
          difficulty: number | null;
          event_date: string | null;
          icon_url: string | null;
          is_featured: boolean | null;
          is_hidden: boolean | null;
          link_sort_no: number | null;
          max_achievement_count: number | null;
          mission_id: string | null;
          ogp_image_url: string | null;
          required_artifact_type: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
      mission_quiz_with_links: {
        Row: {
          category_description: string | null;
          category_id: string | null;
          category_name: string | null;
          correct_answer: number | null;
          explanation: string | null;
          mission_id: string | null;
          mission_links: Json | null;
          option1: string | null;
          option2: string | null;
          option3: string | null;
          option4: string | null;
          question: string | null;
          question_id: string | null;
          question_order: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "quiz_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      poster_board_latest_editors: {
        Row: {
          board_id: string | null;
          last_edited_at: string | null;
          last_editor_id: string | null;
          lat: number | null;
          long: number | null;
          new_status: Database["public"]["Enums"]["poster_board_status"] | null;
          prefecture:
            | Database["public"]["Enums"]["poster_prefecture_enum"]
            | null;
          previous_status:
            | Database["public"]["Enums"]["poster_board_status"]
            | null;
          status: Database["public"]["Enums"]["poster_board_status"] | null;
        };
        Relationships: [];
      };
      quiz_questions_with_category: {
        Row: {
          category_description: string | null;
          category_display_order: number | null;
          category_id: string | null;
          category_name: string | null;
          correct_answer: number | null;
          created_at: string | null;
          explanation: string | null;
          id: string | null;
          is_active: boolean | null;
          mission_id: string | null;
          option1: string | null;
          option2: string | null;
          option3: string | null;
          option4: string | null;
          question: string | null;
          question_order: number | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "quiz_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_achievement_count_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "mission_category_view";
            referencedColumns: ["mission_id"];
          },
          {
            foreignKeyName: "quiz_questions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
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
      get_mission_links: {
        Args: { p_mission_id: string };
        Returns: {
          link: string;
          remark: string;
          display_order: number;
        }[];
      };
      get_mission_quiz_questions: {
        Args: { p_mission_id: string };
        Returns: {
          question_id: string;
          question_order: number;
          category_id: string;
          category_name: string;
          category_description: string;
          mission_links: Json;
          question: string;
          option1: string;
          option2: string;
          option3: string;
          option4: string;
          correct_answer: number;
          explanation: string;
        }[];
      };
      get_mission_ranking: {
        Args: { mission_id: string; limit_count?: number };
        Returns: {
          user_id: string;
          user_name: string;
          address_prefecture: string;
          level: number;
          xp: number;
          updated_at: string;
          clear_count: number;
          total_points: number;
          rank: number;
        }[];
      };
      get_period_mission_ranking: {
        Args: { p_mission_id: string; p_limit?: number; p_start_date?: string };
        Returns: {
          mission_id: string;
          user_id: string;
          name: string;
          address_prefecture: string;
          user_achievement_count: number;
          total_points: number;
          rank: number;
        }[];
      };
      get_period_prefecture_ranking: {
        Args: { p_prefecture: string; p_limit?: number; p_start_date?: string };
        Returns: {
          user_id: string;
          name: string;
          rank: number;
          xp: number;
        }[];
      };
      get_period_ranking: {
        Args: { p_limit?: number; p_start_date?: string; p_end_date?: string };
        Returns: {
          user_id: string;
          address_prefecture: string;
          level: number;
          name: string;
          rank: number;
          updated_at: string;
          xp: number;
        }[];
      };
      get_poster_board_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          prefecture: string;
          status: Database["public"]["Enums"]["poster_board_status"];
          count: number;
        }[];
      };
      get_poster_board_stats_optimized: {
        Args: {
          target_prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
        };
        Returns: {
          total_count: number;
          status_counts: Json;
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
      get_top_users_posting_count: {
        Args: { user_ids: string[] };
        Returns: {
          user_id: string;
          posting_count: number;
        }[];
      };
      get_user_by_email: {
        Args: { user_email: string };
        Returns: {
          id: string;
          email: string;
          user_metadata: Json;
        }[];
      };
      get_user_edited_boards_by_prefecture: {
        Args: {
          target_prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          target_user_id: string;
        };
        Returns: {
          board_id: string;
        }[];
      };
      get_user_edited_boards_with_details: {
        Args: {
          target_prefecture: Database["public"]["Enums"]["poster_prefecture_enum"];
          target_user_id: string;
        };
        Returns: {
          board_id: string;
          lat: number;
          long: number;
          status: Database["public"]["Enums"]["poster_board_status"];
          last_edited_at: string;
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
          total_points: number;
          rank: number;
        }[];
      };
      get_user_period_mission_ranking: {
        Args: {
          p_mission_id: string;
          p_user_id: string;
          p_start_date?: string;
        };
        Returns: {
          mission_id: string;
          user_id: string;
          name: string;
          address_prefecture: string;
          user_achievement_count: number;
          total_points: number;
          rank: number;
        }[];
      };
      get_user_period_prefecture_ranking: {
        Args: {
          p_prefecture: string;
          p_user_id: string;
          p_start_date?: string;
        };
        Returns: {
          user_id: string;
          name: string;
          level: number;
          rank: number;
          xp: number;
        }[];
      };
      get_user_period_ranking: {
        Args: { target_user_id: string; start_date?: string };
        Returns: {
          user_id: string;
          address_prefecture: string;
          level: number;
          name: string;
          rank: number;
          updated_at: string;
          xp: number;
        }[];
      };
      get_user_posting_count: {
        Args: { target_user_id: string };
        Returns: number;
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
      poster_board_status:
        | "not_yet"
        | "reserved"
        | "done"
        | "error_wrong_place"
        | "error_damaged"
        | "error_wrong_poster"
        | "other";
      poster_prefecture_enum:
        | "北海道"
        | "宮城県"
        | "埼玉県"
        | "千葉県"
        | "東京都"
        | "神奈川県"
        | "長野県"
        | "愛知県"
        | "大阪府"
        | "兵庫県"
        | "愛媛県"
        | "福岡県";
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
    Enums: {
      poster_board_status: [
        "not_yet",
        "reserved",
        "done",
        "error_wrong_place",
        "error_damaged",
        "error_wrong_poster",
        "other",
      ],
      poster_prefecture_enum: [
        "北海道",
        "宮城県",
        "埼玉県",
        "千葉県",
        "東京都",
        "神奈川県",
        "長野県",
        "愛知県",
        "大阪府",
        "兵庫県",
        "愛媛県",
        "福岡県",
      ],
    },
  },
} as const;
