import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";
import { Navigate } from "react-router-dom";

// Pages
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import CompleteRegistration from "@/pages/CompleteRegistration";
import Dashboard from "@/pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/complete-registration",
    element: <CompleteRegistration />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
]);
