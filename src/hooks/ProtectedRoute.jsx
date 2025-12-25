import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/Stores/authStore";
import LoadingIndicator from "@/Layouts/LoadingIndicator";

export default function ProtectedRoute({ children }) {
  const { user, loading, forcePasswordChange } = useAuthStore();

  // While auth is being resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator/>
      </div>
    );
  }
// Authenticated but must change password → redirect to force password change
  if (forcePasswordChange) {
    return <Navigate to="/force-password-change" replace />;
  }
  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  

  // Authenticated and no password change required → allow access
  return children;
}