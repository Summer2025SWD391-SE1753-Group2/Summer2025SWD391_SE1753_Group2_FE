export interface Tag {
  tag_id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export interface Topic {
  topic_id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export interface Unit {
  unit_id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export interface Material {
  material_id: string;
  name: string;
  description?: string;
  image_url?: string;
  unit?: string;
  default_unit?: string;
  status: "active" | "inactive";
}

export interface PostMaterial {
  material_id: string;
  material_name?: string;
  unit?: string;
  quantity: number;
  material?: Material;
  notes?: string;
}

export interface PostImage {
  image_id: string;
  image_url: string;
  caption?: string;
}

export interface Post {
  post_id: string;
  title: string;
  content: string;
  status: "waiting" | "approved" | "rejected";
  rejection_reason?: string;
  approved_by?: string;
  tags: Tag[];
  topics: Topic[];
  materials: PostMaterial[];
  images: PostImage[];
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: {
    username: string;
    full_name: string;
    avatar?: string;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tag_ids: string[];
  topic_ids: string[];
  materials: Array<{
    material_id: string;
    quantity: number;
  }>;
  images: string[]; // Firebase URLs
}

export interface PostFormData {
  title: string;
  content: string;
  selectedTags: Tag[];
  selectedTopics: Topic[];
  selectedMaterials: PostMaterial[];
  images: File[];
}