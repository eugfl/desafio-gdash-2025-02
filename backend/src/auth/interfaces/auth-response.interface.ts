export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    city: string;
    role: string;
    picture?: string;
    provider: string;
  };
}

export interface GoogleNeedsCityResponse {
  needsCity: true;
  tempToken: string;
  user: {
    name: string;
    email: string;
    picture?: string;
  };
}

export type GoogleLoginResponse = AuthResponse | GoogleNeedsCityResponse;
