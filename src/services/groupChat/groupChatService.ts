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

// Đổi tên nhóm
export const updateGroupName = async (
  group_id: string,
  name: string,
  token: string
) => {
  const res = await axiosInstance.put(
    `/api/v1/group-chat/${group_id}`,
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Lấy danh sách thành viên
export const getGroupMembers = async (group_id: string, token: string) => {
  const res = await axiosInstance.get(
    `/api/v1/group-chat/${group_id}/members`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Thêm thành viên vào nhóm
export const addGroupMember = async (
  group_id: string,
  account_id: string,
  token: string
) => {
  const res = await axiosInstance.post(
    `/api/v1/group-chat/${group_id}/members`,
    { account_id, role: "member" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Xóa thành viên khỏi nhóm
export const removeGroupMember = async (
  group_id: string,
  account_id: string,
  token: string
) => {
  const res = await axiosInstance.delete(
    `/api/v1/group-chat/${group_id}/members/${account_id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Tìm kiếm user (FE filter user đã trong nhóm)
export const searchAccounts = async (keyword: string, token: string) => {
  const res = await axiosInstance.get(
    `/api/v1/accounts/search/?name=${encodeURIComponent(
      keyword
    )}&skip=0&limit=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
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
