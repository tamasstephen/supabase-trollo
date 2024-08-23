import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/hooks";
import { PropsWithChildren } from "react";
import { Loading } from "@/components";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isSignedIn, loading: contextLoading } = useAuthContext();

  if (contextLoading) {
    return <Loading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
