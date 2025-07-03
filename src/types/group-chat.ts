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
}
