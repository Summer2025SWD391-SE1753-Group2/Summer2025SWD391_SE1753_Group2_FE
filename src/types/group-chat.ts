export interface GroupChat {
  group_id: string;
  group_name: string;
  group_description: string;
  topic_id: string;
  topic_name: string;
  member_count: number;
  max_members: number;
  my_role: "leader" | "moderator" | "member";
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
