export interface Unit {
  unit_id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
