import { SupabaseClient } from "@supabase/supabase-js";

export interface AuthContextProps {
  setToSignedIn: () => void;
  setToSignedOut: () => void;
  isSignedIn: boolean;
  supabaseClient: SupabaseClient | null;
}
