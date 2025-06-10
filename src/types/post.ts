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
  unit?: string; // Reference to Unit.name
  default_unit?: string; // For backward compatibility with existing mock data
  category?: MaterialCategory; // For backward compatibility with mock data
  status: "active" | "inactive";
}

export interface PostMaterial {
  material_id: string;
  material?: Material; // Optional for display
  quantity: number; // Required in BE
  unit?: string; // For backward compatibility
  notes?: string; // For backward compatibility
}

export type MaterialCategory =
  | "thit"
  | "ca"
  | "rau_cu"
  | "gia_vi"
  | "hat_lua"
  | "sua_trung"
  | "dau_mo"
  | "nuoc_tuong"
  | "do_kho"
  | "trai_cay"
  | "khac";

export type CookingUnit =
  | "gram"
  | "kg"
  | "mg"
  | "lit"
  | "ml"
  | "muong_cafe"
  | "muong_canh"
  | "coc"
  | "chen"
  | "qua"
  | "cu"
  | "la"
  | "bo"
  | "canh"
  | "thai"
  | "mieng"
  | "lon"
  | "chai"
  | "goi"
  | "tui"
  | "hop"
  | "thia";

export const COOKING_UNITS: Record<
  CookingUnit,
  { label: string; abbr: string; category: string }
> = {
  // Khối lượng
  gram: { label: "Gram", abbr: "g", category: "Khối lượng" },
  kg: { label: "Kilogram", abbr: "kg", category: "Khối lượng" },
  mg: { label: "Milligram", abbr: "mg", category: "Khối lượng" },

  // Thể tích
  lit: { label: "Lít", abbr: "l", category: "Thể tích" },
  ml: { label: "Millilít", abbr: "ml", category: "Thể tích" },
  muong_cafe: { label: "Muỗng cà phê", abbr: "mcf", category: "Thể tích" },
  muong_canh: { label: "Muỗng canh", abbr: "mc", category: "Thể tích" },
  coc: { label: "Cốc", abbr: "cốc", category: "Thể tích" },
  chen: { label: "Chén", abbr: "chén", category: "Thể tích" },
  thia: { label: "Thìa", abbr: "thìa", category: "Thể tích" },

  // Đơn vị đếm
  qua: { label: "Quả", abbr: "quả", category: "Đơn vị đếm" },
  cu: { label: "Củ", abbr: "củ", category: "Đơn vị đếm" },
  la: { label: "Lá", abbr: "lá", category: "Đơn vị đếm" },
  bo: { label: "Bó", abbr: "bó", category: "Đơn vị đếm" },
  canh: { label: "Cành", abbr: "cành", category: "Đơn vị đếm" },
  thai: { label: "Thái", abbr: "thái", category: "Đơn vị đếm" },
  mieng: { label: "Miếng", abbr: "miếng", category: "Đơn vị đếm" },

  // Đóng gói
  lon: { label: "Lon", abbr: "lon", category: "Đóng gói" },
  chai: { label: "Chai", abbr: "chai", category: "Đóng gói" },
  goi: { label: "Gói", abbr: "gói", category: "Đóng gói" },
  tui: { label: "Túi", abbr: "túi", category: "Đóng gói" },
  hop: { label: "Hộp", abbr: "hộp", category: "Đóng gói" },
};

export const MATERIAL_CATEGORIES: Record<MaterialCategory, string> = {
  thit: "Thịt",
  ca: "Cá & Hải sản",
  rau_cu: "Rau củ",
  gia_vi: "Gia vị",
  hat_lua: "Hạt & Lúa",
  sua_trung: "Sữa & Trứng",
  dau_mo: "Dầu & Mỡ",
  nuoc_tuong: "Nước tương & Tương ớt",
  do_kho: "Đồ khô",
  trai_cay: "Trái cây",
  khac: "Khác",
};

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
