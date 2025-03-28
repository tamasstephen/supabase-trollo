import { useEffect, useState } from "react";
import { AuthContextProps } from "@/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_PROJECT_URL,
  import.meta.env.VITE_ANON_KEY
);

export const useAuth = (): AuthContextProps => {
  const [isSignedIn, setIsLoggedIn] = useState(false);
  const [supabaseClient] = useState(supabase);
  const [loading, setLoading] = useState(true);

  const setToSignedIn = () => {
    localStorage.setItem("auth", "signedIn");
    setLoading(false);
    setIsLoggedIn(true);
  };
  const setToSignedOut = () => {
    localStorage.removeItem("auth");
    setLoading(false);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      setToSignedIn();
    }
  }, [setLoading]);

  return { setToSignedIn, setToSignedOut, isSignedIn, supabaseClient, loading };
};
