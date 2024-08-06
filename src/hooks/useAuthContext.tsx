import { useContext } from "react";
import { AuthContext } from "../components/context/AuthContext";
import { AuthContextProps } from "../types/AuthContext";

export const useAuthContext = (): AuthContextProps => {
  const { isSignedIn, setToSignedIn, setToSignedOut, supabaseClient } =
    useContext(AuthContext);

  return { isSignedIn, setToSignedIn, setToSignedOut, supabaseClient };
};
