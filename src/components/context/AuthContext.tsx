import { createContext, PropsWithChildren } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AuthContextProps } from "../../types/AuthContext";

export const AuthContext = createContext<AuthContextProps>({
  isSignedIn: false,
  setToSignedIn: () => {},
  setToSignedOut: () => {},
  supabaseClient: null,
  loading: true,
});

export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const props = useAuth();
  return <AuthContext.Provider value={props}>{children}</AuthContext.Provider>;
};
