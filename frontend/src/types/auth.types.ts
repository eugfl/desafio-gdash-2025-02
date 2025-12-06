export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  picture?: string;
  provider: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  city: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CompleteGoogleRegistration {
  tempToken: string;
  city: string;
}
export interface ForgotPassword {
  email: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
}
