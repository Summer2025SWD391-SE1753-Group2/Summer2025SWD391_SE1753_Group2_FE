export interface GroupChat {
  group_id: string;
  group_name: string;
  group_description: string;
  topic_id: string;
  topic_name: string;
  member_count: number;
  max_members: number;
  my_role: "leader" | "moderator" | "member";
  my_status: "active" | "inactive" | "left" | "removed" | "banned";
  leader_name: string;
  created_at: string;
  joined_at: string;
  is_active: boolean;
}

export interface GroupChatSender {
  account_id: string;
  username: string;
  full_name: string;
  avatar: string;
}

export interface GroupChatMessage {
  message_id: string;
  group_id: string;
  sender_id: string;
  content: string;
  status: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender: GroupChatSender;
}

export interface GroupChatMessagesResponse {
  messages: GroupChatMessage[];
  total: number;
  skip: number;
  limit: number;
}

export interface GroupMember {
  group_member_id: string;
  account_id: string;
  group_id: string;
  role: "leader" | "moderator" | "member";
  status: "active" | "inactive" | "left" | "removed" | "banned";
  joined_at: string;
  username?: string;
  full_name?: string;
  avatar?: string;
  email?: string;
}

export interface GroupMembershipStatus {
  group_id: string;
  is_member: boolean;
  role: string | null;
  status: string;
  is_active: boolean;
  joined_at?: string;
}

export interface BatchMembershipResponse {
  memberships: GroupMembershipStatus[];
}

export enum GroupMemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  LEFT = "left",
  REMOVED = "removed",
  BANNED = "banned",
  NO_JOIN = "no-join",
}

export enum GroupMemberRole {
  LEADER = "leader",
  MODERATOR = "moderator",
  MEMBER = "member",
}
