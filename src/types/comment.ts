export interface Comment {
  comment_id: string;
  post_id: string;
  account_id: string;
  content: string;
  parent_comment_id?: string;
  status: string;
  created_at: string;
  level: number;

  // Populated fields from backend
  account?: {
    account_id: string;
    username: string;
    full_name: string;
    avatar?: string;
  };
  replies?: Comment[];
}

export interface CommentCreate {
  content: string;
  post_id: string;
  parent_comment_id?: string;
}

export interface CommentUpdate {
  content: string;
}
