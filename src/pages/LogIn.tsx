import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuthContext } from "../hooks/useAuthContext";

export const Login = () => {
  const { supabaseClient: supabase } = useAuthContext();
  if (supabase) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  }
  return <></>;
};
