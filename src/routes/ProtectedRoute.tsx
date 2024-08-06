import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { PropsWithChildren } from "react";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useAuthContext();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
