import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import type { GroupChat } from "@/types/group-chat";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDebounce } from "use-debounce";

// Types for group detail and member
interface GroupDetail {
  group_id: string;
  topic_id: string;
  name: string;
  description: string;
  group_leader: string;
  created_by: string;
  is_chat_group: boolean;
  created_at: string;
  updated_at: string;
  topic_name: string;
  leader_name: string;
  member_count: number;
}
interface GroupMember {
  group_member_id: string;
  account_id: string;
  username: string;
  full_name: string;
  avatar: string;
  role: string;
  joined_at: string;
  email: string;
}

export default function GroupChatManagementPage() {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role?.role_name === "admin";
  const [viewGroupId, setViewGroupId] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // View group state
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit group state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Add state for member search and pagination
  const [memberSearch, setMemberSearch] = useState("");
  const [debouncedMemberSearch] = useDebounce(memberSearch, 300);
  const [memberPage, setMemberPage] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/api/v1/group-chat/my-groups")
      .then((res) => setGroups(res.data))
      .finally(() => setLoading(false));
  }, []);

  // View group logic
  useEffect(() => {
    if (!viewGroupId) return;
    setViewLoading(true);
    Promise.all([
      axiosInstance.get(`/api/v1/group-chat/${viewGroupId}`),
      axiosInstance.get(`/api/v1/group-chat/${viewGroupId}/members`),
    ])
      .then(([groupRes, membersRes]) => {
        setGroupDetail(groupRes.data);
        setGroupMembers(membersRes.data);
      })
      .catch(() => toast.error("Không thể tải thông tin group"))
      .finally(() => setViewLoading(false));
  }, [viewGroupId]);

  // Edit group logic
  useEffect(() => {
    if (!editGroupId) return;
    setEditLoading(true);
    axiosInstance
      .get(`/api/v1/group-chat/${editGroupId}`)
      .then((res) => {
        setEditName(res.data.name);
        setEditDesc(res.data.description);
      })
      .catch(() => toast.error("Không thể tải thông tin group"))
      .finally(() => setEditLoading(false));
  }, [editGroupId]);

  // Fetch members with search & pagination
  const loadMembers = async (search = "", skip = 0) => {
    setMemberLoading(true);
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: memberPage.limit.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      const res = await axiosInstance.get(
        `/api/v1/group-chat/${viewGroupId}/members/search?${params}`
      );
      const data = res.data;
      if (skip === 0) {
        setGroupMembers(data.members);
      } else {
        setGroupMembers((prev) => [...prev, ...data.members]);
      }
      setMemberPage({
        skip: data.skip,
        limit: data.limit,
        total: data.total,
        hasMore: data.has_more,
      });
    } catch {
      toast.error("Không thể tải danh sách thành viên");
    } finally {
      setMemberLoading(false);
    }
  };

  // Load members on open/search
  useEffect(() => {
    if (!viewGroupId) return;
    loadMembers(debouncedMemberSearch, 0);
    setMemberPage((p) => ({ ...p, skip: 0 }));
  }, [viewGroupId, debouncedMemberSearch]);

  const loadMoreMembers = () => {
    if (memberPage.hasMore && !memberLoading) {
      loadMembers(debouncedMemberSearch, memberPage.skip + memberPage.limit);
    }
  };

  const handleEditSave = async () => {
    if (!editGroupId) return;
    if (!editName.trim() || editName.length > 100) {
      toast.error("Tên group chat là bắt buộc, tối đa 100 ký tự");
      return;
    }
    if (editDesc.length > 500) {
      toast.error("Mô tả tối đa 500 ký tự");
      return;
    }
    setEditLoading(true);
    try {
      await axiosInstance.put(`/api/v1/group-chat/${editGroupId}`, {
        name: editName,
        description: editDesc,
      });
      toast.success("Cập nhật thành công");
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === editGroupId ? { ...g, group_name: editName } : g
        )
      );
      setEditGroupId(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Cập nhật thất bại");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (group: GroupChat) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa group chat "${group.group_name}"?`)
    )
      return;
    setDeletingId(group.group_id);
    try {
      await axiosInstance.delete(`/api/v1/group-chat/${group.group_id}`);
      setGroups((prev) => prev.filter((g) => g.group_id !== group.group_id));
      toast.success("Đã xóa group chat thành công");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Xóa group chat thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Quản lý Group Chat
        </h1>
        <Button
          className="flex items-center gap-2"
          variant="default"
          onClick={() => setCreateOpen(true)}
        >
          <PlusCircle className="w-5 h-5" /> Tạo group chat
        </Button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Tên group</th>
              <th className="py-2 text-left">Chủ đề</th>
              <th className="py-2 text-center">Số thành viên</th>
              <th className="py-2 text-left">Leader</th>
              <th className="py-2 text-left">Ngày tạo</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Đang tải...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Không có group chat nào
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.group_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-semibold">{group.group_name}</td>
                  <td className="py-2">{group.topic_name}</td>
                  <td className="py-2 text-center">{group.member_count}</td>
                  <td className="py-2">{group.leader_name}</td>
                  <td className="py-2">
                    {format(new Date(group.created_at), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="py-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewGroupId(group.group_id)}
                      >
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditGroupId(group.group_id)}
                        disabled={
                          !(
                            group.my_role === "leader" ||
                            group.my_role === "moderator" ||
                            isAdmin
                          )
                        }
                      >
                        Sửa
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(group)}
                                disabled={
                                  !isAdmin || deletingId === group.group_id
                                }
                              >
                                Xóa
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!isAdmin && (
                            <TooltipContent>
                              Chỉ admin mới được xóa
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Group Dialog */}
      <Dialog open={!!viewGroupId} onOpenChange={() => setViewGroupId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin Group Chat</DialogTitle>
            <DialogDescription>
              {viewLoading ? "Đang tải..." : groupDetail?.name}
            </DialogDescription>
          </DialogHeader>
          {groupDetail && !viewLoading && (
            <div className="space-y-2">
              <div>
                <b>Chủ đề:</b> {groupDetail.topic_name}
              </div>
              <div>
                <b>Leader:</b> {groupDetail.leader_name}
              </div>
              <div>
                <b>Mô tả:</b> {groupDetail.description || "Không có"}
              </div>
              <div>
                <b>Ngày tạo:</b>{" "}
                {format(new Date(groupDetail.created_at), "dd/MM/yyyy HH:mm")}
              </div>
              <div>
                <b>Số thành viên:</b> {memberPage.total}
              </div>
              <div className="my-2">
                <input
                  className="w-full border rounded px-2 py-1 mb-2"
                  placeholder="Tìm kiếm thành viên..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                <div className="max-h-64 overflow-y-auto">
                  {memberLoading && (
                    <div className="text-center text-gray-400 py-4">
                      Đang tải...
                    </div>
                  )}
                  {!memberLoading && groupMembers.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      Không có thành viên nào
                    </div>
                  )}
                  {groupMembers.map((member) => (
                    <div
                      key={member.group_member_id}
                      className="flex items-center gap-3 border rounded p-2 mb-2 bg-gray-50"
                    >
                      <img
                        src={member.avatar || "/default-avatar.png"}
                        alt={member.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{member.full_name}</div>
                        <div className="text-xs text-gray-500">
                          @{member.username} • {member.email}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          member.role === "leader"
                            ? "bg-yellow-400 text-white"
                            : member.role === "moderator"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {member.role}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(member.joined_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  ))}
                  {memberPage.hasMore && !memberLoading && (
                    <button
                      className="w-full py-2 mt-2 border rounded bg-white hover:bg-gray-100"
                      onClick={loadMoreMembers}
                    >
                      Tải thêm
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewGroupId(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={!!editGroupId} onOpenChange={() => setEditGroupId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa Group Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block font-medium mb-1">Tên group chat *</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={100}
                disabled={editLoading}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Mô tả</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={editLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditGroupId(null)}
              disabled={editLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog (placeholder, implement multi-step as needed) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo Group Chat</DialogTitle>
          </DialogHeader>
          <div className="text-gray-500">
            Tính năng tạo group chat nhiều bước sẽ được bổ sung ở bước tiếp
            theo.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
