export interface Material {
  material_id: string;
  name: string;
  status: 'active' | 'inactive';
  image_url: string;
  unit: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}