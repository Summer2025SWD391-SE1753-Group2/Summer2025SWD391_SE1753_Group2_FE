import { useEffect, useState } from "react";
import {
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/services/friends/friendService";
import { PendingFriendRequest } from "@/types/friend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { searchUsersByUsername } from "@/services/accounts/accountService";
import { UserProfile } from "@/types/account";

export function PendingRequests() {
  const [requests, setRequests] = useState<PendingFriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [senderProfiles, setSenderProfiles] = useState<
    Record<string, UserProfile>
  >({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getPendingRequests();
        setRequests(data);
        const missing = data.filter((r) => !r.sender).map((r) => r.sender_id);
        for (const id of missing) {
          try {
            const users = await searchUsersByUsername(id, 0, 1);
            if (users && users[0]) {
              setSenderProfiles((prev) => ({ ...prev, [id]: users[0] }));
            }
          } catch {
            /* ignore */
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải lời mời kết bạn:", error);
        toast.error("Không thể tải lời mời kết bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (senderId: string) => {
    setAcceptingId(senderId);
    try {
      await acceptFriendRequest(senderId);
      toast.success("Đã chấp nhận lời mời kết bạn!");
      // Remove from list after accepting
      setRequests((prev) => prev.filter((req) => req.sender_id !== senderId));
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (senderId: string) => {
    setRejectingId(senderId);
    try {
      await rejectFriendRequest(senderId);
      toast.success("Đã từ chối lời mời kết bạn!");
      // Remove from list after rejecting
      setRequests((prev) => prev.filter((req) => req.sender_id !== senderId));
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời:", error);
      toast.error("Không thể từ chối lời mời kết bạn");
    } finally {
      setRejectingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải lời mời kết bạn...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Không có lời mời kết bạn nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Lời mời kết bạn</h2>
      {requests.map((request) => (
        <Card key={request.sender_id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={
                  request.sender?.avatar ||
                  senderProfiles[request.sender_id]?.avatar ||
                  "/default-profile-image.png"
                }
                alt={
                  request.sender?.full_name ||
                  senderProfiles[request.sender_id]?.full_name ||
                  "Ẩn danh"
                }
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/default-profile-image.png";
                }}
              />
              <div>
                <p className="font-medium">
                  {request.sender?.full_name ||
                    senderProfiles[request.sender_id]?.full_name ||
                    "Ẩn danh"}
                </p>
                <p className="text-sm text-gray-500">
                  @
                  {request.sender?.username ||
                    senderProfiles[request.sender_id]?.username ||
                    "unknown"}
                </p>
                <p className="text-xs text-gray-400">
                  Gửi lúc:{" "}
                  {new Date(request.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAccept(request.sender_id)}
                disabled={
                  acceptingId === request.sender_id ||
                  rejectingId === request.sender_id
                }
                className="bg-green-500 hover:bg-green-600"
              >
                {acceptingId === request.sender_id
                  ? "Đang xử lý..."
                  : "Chấp nhận"}
              </Button>
              <Button
                onClick={() => handleReject(request.sender_id)}
                disabled={
                  acceptingId === request.sender_id ||
                  rejectingId === request.sender_id
                }
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                {rejectingId === request.sender_id
                  ? "Đang xử lý..."
                  : "Từ chối"}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
