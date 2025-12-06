import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import authService from "@/services/auth.service";
import type { LoginCredentials, RegisterCredentials } from "@/types/auth.types";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setUser, setToken, logout } =
    useAuthStore();

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

  const handleForgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      toast("Email enviado!", {
        description: `Verifique sua caixa de entrada para redefinir a senha.`,
      });
      return response;
    } catch (error: any) {
      toast("Erro ao enviar email", {
        description:
          error.response?.data?.message || "Não foi possível enviar o email",
      });
      throw error;
    }
  };

  const handleResetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
      toast("Senha redefinida!", {
        description: "Você pode fazer login com a nova senha.",
      });
      navigate("/login");
    } catch (error: any) {
      toast("Erro ao redefinir senha", {
        description:
          error.response?.data?.message || "Não foi possível redefinir a senha",
      });
      throw error;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    login,
    register,
    handleGoogleLogin,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
  };
};
