import axiosInstance from "@/lib/api/axios";

// Lấy danh sách topic có thể tạo group chat
export const getAvailableTopicsForGroupChat = async () => {
  const res = await axiosInstance.get("/api/v1/group-chat/topics/available");
  return res.data;
};

// Lấy danh sách topic đã có group chat
export const getTopicsWithGroups = async () => {
  const res = await axiosInstance.get("/api/v1/group-chat/topics/with-groups");
  return res.data;
};

// Kiểm tra topic cụ thể có thể tạo group chat không
export const checkTopicGroupChat = async (topic_id: string) => {
  const res = await axiosInstance.get(
    `/api/v1/group-chat/topics/${topic_id}/check`
  );
  return res.data;
};

// Tạo group chat từ topic
export const createGroupChat = async (data: {
  topic_id: string;
  name: string;
  description?: string;
  max_members?: number;
}) => {
  const res = await axiosInstance.post("/api/v1/group-chat/create", data);
  return res.data;
};

// Lấy group chat theo topic
export const getGroupChatByTopic = async (topic_id: string) => {
  const res = await axiosInstance.get(
    `/api/v1/group-chat/by-topic/${topic_id}`
  );
  return res.data;
};

// Lấy group chat theo id
export const getGroupChatById = async (group_id: string) => {
  const res = await axiosInstance.get(`/api/v1/group-chat/${group_id}`);
  return res.data;
};

// Thêm thành viên vào group
export const addGroupMember = async (
  group_id: string,
  data: { account_id: string; role: string }
) => {
  const res = await axiosInstance.post(
    `/api/v1/group-chat/${group_id}/members`,
    data
  );
  return res.data;
};

// Lấy danh sách thành viên
export const getGroupMembers = async (group_id: string) => {
  const res = await axiosInstance.get(`/api/v1/group-chat/${group_id}/members`);
  return res.data;
};

// Gửi tin nhắn trong group
export const sendGroupMessage = async (group_id: string, content: string) => {
  const res = await axiosInstance.post(
    `/api/v1/group-chat/${group_id}/messages`,
    { content }
  );
  return res.data;
};

// Lấy lịch sử chat của group
export const getGroupMessages = async (
  group_id: string,
  skip = 0,
  limit = 50
) => {
  const res = await axiosInstance.get(
    `/api/v1/group-chat/${group_id}/messages?skip=${skip}&limit=${limit}`
  );
  return res.data;
};
