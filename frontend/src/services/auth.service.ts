import api from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  CompleteGoogleRegistration,
  User,
  ForgotPassword,
  ResetPassword,
} from "@/types/auth.types";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    return response.data;
  }

  async completeGoogleRegistration(
    data: CompleteGoogleRegistration
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/auth/google/complete",
      data
    );
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>("/auth/profile");
    return response.data.user;
  }

  // Google OAuth
  redirectToGoogleLogin() {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    window.location.href = `${baseUrl}/auth/google`;
  }

  async forgotPassword(email: string): Promise<ForgotPassword> {
    const response = await api.post<ForgotPassword>("/auth/forgot-password", {
      email,
    });
    return response.data;
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ResetPassword> {
    const response = await api.post<ResetPassword>("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  }
}

export default new AuthService();
