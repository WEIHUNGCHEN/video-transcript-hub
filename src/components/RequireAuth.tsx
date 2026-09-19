import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "@/hooks/use-session";

export function RequireAuth() {
  const { session, loading } = useSession();
  const location = useLocation();

  // Hold the render until the stored session has been read, otherwise a signed-in
  // user gets bounced to /signin on every hard refresh of a deep link.
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!session) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
