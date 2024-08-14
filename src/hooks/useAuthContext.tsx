import { useContext } from "react";
import { AuthContext } from "@/components";
import { AuthContextProps } from "@/types";

export const useAuthContext = (): AuthContextProps => {
  const { isSignedIn, setToSignedIn, setToSignedOut, supabaseClient, loading } =
    useContext(AuthContext);

  return { isSignedIn, setToSignedIn, setToSignedOut, supabaseClient, loading };
};
