export interface Role {
  role_id: number;
  role_name: "user" | "moderator" | "admin";
  status: "active" | "inactive";
}

export interface UserProfile {
  account_id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar: string | null;
  background_url: string | null;
  bio: string | null;
  status: "active" | "inactive" | "banned";
  role: {
    role_id: number;
    role_name: "user" | "moderator" | "admin";
  };
  email_verified: boolean;
  phone_verified: boolean;
  phone_number: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
  friend_count: number | null;
  is_friend: boolean | null;
}

export interface ProfileUpdateData {
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  date_of_birth?: string | null;
  avatar?: string | null;
  background_url?: string | null;
  bio?: string | null;
}

export interface PasswordUpdateData {
  current_password?: string;
  new_password: string;
  confirm_password?: string;
}

export interface UsernameUpdateData {
  new_username: string;
}

export interface GoogleUserInfo {
  is_google_user: boolean;
  current_username: string;
  email: string;
}
