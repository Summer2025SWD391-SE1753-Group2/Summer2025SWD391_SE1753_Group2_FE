export interface Tag {
  tag_id?: string; 
  name: string; 
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}