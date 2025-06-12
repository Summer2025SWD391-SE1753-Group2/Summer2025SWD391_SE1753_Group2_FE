export interface Topic {
  topic_id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string; 
  updated_at: string;
}
