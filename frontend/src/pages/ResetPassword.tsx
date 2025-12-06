import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ForgotPasswordForm } from "@/components/Auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/Auth/ResetPasswordForm";
import { Cloud } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token"); // token da URL para resetar senha

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cloud className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Weather Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Dados climáticos com IA + Pokémons
          </p>
        </div>
        <div className="mt-8">
          {resetToken ? (
            <ResetPasswordForm token={resetToken} />
          ) : (
            <ForgotPasswordForm />
          )}
        </div>
      </div>
    </div>
  );
}
