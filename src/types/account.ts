export interface Role {
  role_id: number;
  role_name: "user" | "moderator" | "admin";
  status: "active" | "inactive";
}

export interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  avatar: string;
  bio: string;
  account_id: string;
  status: "active" | "inactive" | "banned";
  role: Role;
  email_verified: boolean;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}