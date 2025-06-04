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
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
  bio?: string;
  phone_number?: string;
  status: string;
  role: {
    role_id: number;
    role_name: string;
    status: string;
  };
  email_verified: boolean;
  phone_verified: boolean;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
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
