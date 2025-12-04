// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast("Erro", {
        description: "Token não encontrado",
      });
      navigate("/login");
      return;
    }

    // Salvar token PRIMEIRO
    setToken(token);

    // Buscar dados do usuário
    authService
      .getProfile()
      .then((user) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));

        toast("Login realizado!", {
          description: `Bem-vindo, ${user.name}!`,
        });

        // Pequeno delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      })
      .catch((error) => {
        console.error("Erro ao buscar perfil:", error);

        toast("Erro", {
          description: "Falha ao carregar perfil",
        });

        navigate("/login");
      });
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Autenticando...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Aguarde enquanto finalizamos seu login
        </p>
      </div>
    </div>
  );
}
