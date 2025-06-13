import { Post } from "./post";

export interface Favorite {
  favourite_id: string;
  favourite_name: string;
  account_id: string;
  created_at: string;
  post_count: number;
  posts: Post[];
}
