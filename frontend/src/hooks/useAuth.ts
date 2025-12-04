// src/hooks/useAuth.ts
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/auth.service";
import type { LoginCredentials, RegisterCredentials } from "@/types/auth.types";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setUser, setToken, logout } =
    useAuthStore();

  // REMOVER useEffect com initialize - já roda no ProtectedRoute

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast("Login realizado!", {
        description: `Bem-vindo de volta, ${response.user.name}!`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast("Erro ao fazer login", {
        description: error.response?.data?.message || "Credenciais inválidas",
      });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authService.register(credentials);

      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast("Cadastro realizado!", {
        description: "Conta criada com sucesso. Redirecionando...",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast("Erro ao cadastrar", {
        description: error.response?.data?.message || "Erro ao criar conta",
      });
      throw error;
    }
  };

  const handleGoogleLogin = () => {
    authService.redirectToGoogleLogin();
  };

  const handleLogout = () => {
    logout();
    toast("Logout realizado", {
      description: "Até logo!",
    });
    navigate("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    handleGoogleLogin,
    handleLogout,
  };
};
