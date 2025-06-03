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

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    role: string;
  };
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}
