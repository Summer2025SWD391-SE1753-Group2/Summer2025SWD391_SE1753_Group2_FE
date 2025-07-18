import { UserProfile } from "@/types/account";

export interface Report {
  report_id: string;
  title: string;
  type: "report_topic" | "report_tag" | "report_material";
  reason: string;
  status: "pending" | "approve" | "reject";
  description: string;
  reject_reason: string | null;
  unit: string;
  object_add: string;
  created_by: string;
  creator?: UserProfile;
  created_at: string;
  updated_at: string;
}