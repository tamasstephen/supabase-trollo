import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks";
import { PropsWithChildren } from "react";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isSignedIn, loading: contextLoading } = useAuthContext();

  if (contextLoading) {
    return <p>Loading</p>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
