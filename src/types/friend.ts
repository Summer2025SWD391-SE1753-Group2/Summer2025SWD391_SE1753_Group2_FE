export type FriendStatus = "pending" | "accepted" | "rejected";

export interface Friend {
  sender_id: string;
  receiver_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  receiver_id: string;
}

export interface FriendResponse {
  sender_id: string;
  receiver_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
}

export interface SenderAccountInfo {
  account_id: string;
  username: string;
  full_name: string;
  email: string;
  avatar: string | null;
}

export interface PendingFriendRequest {
  sender_id: string;
  receiver_id: string;
  status: FriendStatus;
  created_at: string;
  updated_at: string;
  sender: SenderAccountInfo;
}

export type FriendshipStatusType =
  | "self"
  | "none"
  | "friends"
  | "request_sent"
  | "request_received"
  | "rejected";

export interface FriendshipStatus {
  status: FriendshipStatusType;
  can_send_request: boolean;
}

// For displaying friend list with account info
export interface FriendListItem {
  account_id: string;
  username: string;
  full_name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  status: "active" | "inactive" | "banned";
  role: {
    role_id: number;
    role_name: "user" | "moderator" | "admin";
    status: "active" | "inactive";
  };
  email_verified: boolean;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}
