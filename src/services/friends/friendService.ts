import axiosInstance from "@/lib/api/axios";
import {
  FriendRequest,
  FriendResponse,
  FriendListItem,
  PendingFriendRequest,
  FriendshipStatus,
} from "@/types/friend";

// Send friend request
const sendFriendRequest = async (
  data: FriendRequest
): Promise<FriendResponse> => {
  const response = await axiosInstance.post<FriendResponse>(
    "/api/v1/friends/request",
    data
  );
  return response.data;
};

// Accept friend request
const acceptFriendRequest = async (
  sender_id: string
): Promise<FriendResponse> => {
  const response = await axiosInstance.post<FriendResponse>(
    `/api/v1/friends/accept/${sender_id}`
  );
  return response.data;
};

// Get friends list
const getFriendsList = async (): Promise<FriendListItem[]> => {
  const response = await axiosInstance.get<FriendListItem[]>(
    "/api/v1/friends/list"
  );
  return response.data;
};

// Get pending friend requests
const getPendingRequests = async (): Promise<PendingFriendRequest[]> => {
  const response = await axiosInstance.get<PendingFriendRequest[]>(
    "/api/v1/friends/pending"
  );
  return response.data;
};

// Reject friend request
const rejectFriendRequest = async (
  sender_id: string
): Promise<FriendResponse> => {
  const response = await axiosInstance.post<FriendResponse>(
    `/api/v1/friends/reject/${sender_id}`
  );
  return response.data;
};

// Remove friend
const removeFriend = async (friend_id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/friends/${friend_id}`);
};

// Check friendship status
const getFriendshipStatus = async (
  friend_id: string
): Promise<FriendshipStatus> => {
  const response = await axiosInstance.get<FriendshipStatus>(
    `/api/v1/friends/status/${friend_id}`
  );
  return response.data;
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
  getPendingRequests,
  removeFriend,
  getFriendshipStatus,
};
