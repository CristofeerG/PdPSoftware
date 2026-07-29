import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type Rol } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  rolesPermitidos?: Rol[];
}

export function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
