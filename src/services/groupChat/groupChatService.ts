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

// Tạo group chat với thành viên ban đầu (2 bước)
export const createGroupChatWithMembers = async (data: {
  topic_id: string;
  name: string;
  description?: string;
  max_members?: number;
  member_ids: string[];
}) => {
  // Bước 1: Tạo group chat
  const groupRes = await axiosInstance.post("/api/v1/group-chat/create", {
    topic_id: data.topic_id,
    name: data.name,
    description: data.description,
    max_members: data.max_members,
  });

  const groupId = groupRes.data.group_id;

  // Bước 2: Thêm tất cả members
  const addMemberPromises = data.member_ids.map((memberId) =>
    axiosInstance.post(`/api/v1/group-chat/${groupId}/members`, {
      account_id: memberId,
      role: "member",
    })
  );

  await Promise.all(addMemberPromises);

  return groupRes.data;
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

export async function getAllGroupChats({
  skip = 0,
  limit = 20,
  search = "",
  topic_id = "",
  token,
}: {
  skip?: number;
  limit?: number;
  search?: string;
  topic_id?: string;
  token: string;
}) {
  const params: any = { skip, limit };
  if (search) params.search = search;
  if (topic_id) params.topic_id = topic_id;
  const res = await axiosInstance.get("/api/v1/group-chat/all", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function checkMembershipBatch(groupIds: string[], token: string) {
  const res = await axiosInstance.post(
    "/api/v1/group-chat/membership/batch",
    { group_ids: groupIds },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.memberships as { group_id: string; is_member: boolean }[];
}

export async function searchGroupChats(
  searchTerm: string,
  skip = 0,
  limit = 20,
  token: string
) {
  if (searchTerm.length < 2) return { groups: [], has_more: false };
  const res = await axiosInstance.get("/api/v1/group-chat/search", {
    params: { search_term: searchTerm, skip, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function joinGroupChat(groupId: string, token: string) {
  const res = await axiosInstance.post(
    `/api/v1/group-chat/${groupId}/join`,
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}
