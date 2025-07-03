import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fwdpbfasktypqjyizecm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZHBiZmFza3R5cHFqeWl6ZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzA5MDcsImV4cCI6MjA2NjE0NjkwN30._3xrZJEe7e-O-oGMxNOxlmmuUde2777pP6Ntyo19iG4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベースの型定義
export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          team_name: string;
          created_by: string;
          created_at: string;
          is_active: boolean;
          show_results: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          team_name: string;
          created_by: string;
          created_at?: string;
          is_active?: boolean;
          show_results?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          team_name?: string;
          created_by?: string;
          created_at?: string;
          is_active?: boolean;
          show_results?: boolean;
        };
      };
      options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          votes: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          votes?: number;
        };
        Update: {
          id?: string;
          poll_id?: string;
          text?: string;
          votes?: number;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          voter_id: string;
          team_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          voter_id: string;
          team_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          voter_id?: string;
          team_name?: string;
          created_at?: string;
        };
      };
    };
  };
}
