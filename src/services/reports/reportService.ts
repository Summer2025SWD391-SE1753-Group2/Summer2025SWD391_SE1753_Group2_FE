import axios from "axios";
import { Report } from "@/types/report";

const API_URL = "http://localhost:8000/api/v1/report/";

export const getAllReports = async (token: string): Promise<Report[]> => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReport = async (
  reportId: string,
  data: { status: string; reject_reason?: string },
  token: string
): Promise<void> => {
  await axios.put(`${API_URL}${reportId}/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createReport = async (
  data: {
    title: string;
    type: "report_topic" | "report_tag" | "report_material";
    reason: string;
    description: string;
    unit: string;
    object_add: string;
  },
  token: string
): Promise<void> => {
  await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};