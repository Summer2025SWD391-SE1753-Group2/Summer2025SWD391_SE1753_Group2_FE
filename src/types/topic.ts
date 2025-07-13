export interface Topic {
  topic_id: string;
  name: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AvailableTopic {
  topic_id: string;
  topic_name: string;
  status: "active" | "inactive";
  can_create: boolean;
}
