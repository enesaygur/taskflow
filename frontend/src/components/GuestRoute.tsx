import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function GuestRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();

  if (accessToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default GuestRoute;
