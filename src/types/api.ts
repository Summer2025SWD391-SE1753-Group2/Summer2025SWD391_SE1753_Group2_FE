export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  status: number;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string;
  phone?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  phone_verified: boolean;
  role: string;
  status: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: UserInfo;
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}
