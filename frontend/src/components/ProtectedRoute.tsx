import { ReactNode } from "react";
import { Navigate, useLoaderData } from "react-router";

// This component is now simplified since protection is handled by the router
// It's kept for backward compatibility or for cases where you need to use the user data
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // The user data is now loaded by the router and available via useLoaderData
  const user = useLoaderData();
  
  // Render children since authentication is already verified by the loader
  return <>{children}</>;
};

export default ProtectedRoute;
