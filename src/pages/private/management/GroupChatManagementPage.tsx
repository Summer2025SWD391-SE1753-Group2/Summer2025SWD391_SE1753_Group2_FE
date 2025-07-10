import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  User,
  Shield,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
import CreateGroupChatDialog from "@/components/chat/CreateGroupChatDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types for group detail and member
interface GroupDetail {
  group_id: string;
  topic_id: string;
  name: string;
  description: string;
  max_members: number;
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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  // View group state
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit group state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  // Edit members state
  const [editMembers, setEditMembers] = useState<GroupMember[]>([]);
  const [editMembersLoading, setEditMembersLoading] = useState(false);

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

  // New state for inactive confirmation
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const prevIsActive = useRef(true);

  // Load groups with search and pagination
  const loadGroups = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearchTerm.trim()) {
      params.append("search", debouncedSearchTerm.trim());
    }
    params.append("skip", ((currentPage - 1) * pageSize).toString());
    params.append("limit", pageSize.toString());

    // Moderator/Admin xem tất cả, User thường chỉ xem group của mình
    const baseUrl =
      isAdmin || user?.role?.role_name === "moderator"
        ? "/api/v1/group-chat/all"
        : "/api/v1/group-chat/my-groups";

    const url = `${baseUrl}?${params}`;

    axiosInstance
      .get(url)
      .then((res) => {
        const data = res.data;
        // Kiểm tra xem response có phải là array không, nếu không thì lấy property groups
        const groupsData = Array.isArray(data) ? data : data.groups || [];
        setGroups(groupsData);

        // Cập nhật thông tin phân trang
        if (data.total !== undefined) {
          setTotalItems(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      })
      .catch((error) => {
        console.error("Error loading groups:", error);
        toast.error("Không thể tải danh sách group chat");
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, [
    debouncedSearchTerm,
    currentPage,
    pageSize,
    isAdmin,
    user?.role?.role_name,
  ]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // View group logic
  useEffect(() => {
    if (!viewGroupId) return;
    setViewLoading(true);

    // Sử dụng API detail mới
    axiosInstance
      .get(`/api/v1/group-chat/${viewGroupId}`)
      .then((groupRes) => {
        setGroupDetail(groupRes.data);
        // Load members nếu user là thành viên của group
        return axiosInstance.get(`/api/v1/group-chat/${viewGroupId}/members`);
      })
      .then((membersRes) => {
        setGroupMembers(membersRes.data);
      })
      .catch((error) => {
        console.error("Error loading group details:", error);
        if (error.response?.status === 404) {
          toast.error("Không tìm thấy group chat");
        } else if (error.response?.status === 403) {
          toast.error("Bạn không có quyền xem thông tin group này");
        } else {
          toast.error("Không thể tải thông tin group");
        }
      })
      .finally(() => setViewLoading(false));
  }, [viewGroupId]);

  // Edit group logic
  useEffect(() => {
    if (!editGroupId) return;
    setEditLoading(true);
    setEditMembersLoading(true);

    Promise.all([
      axiosInstance.get(`/api/v1/group-chat/${editGroupId}`),
      axiosInstance.get(`/api/v1/group-chat/${editGroupId}/members`),
    ])
      .then(([groupRes, membersRes]) => {
        setEditName(groupRes.data.name);
        setEditDesc(groupRes.data.description || "");
        setEditIsActive(groupRes.data.is_active);
        setEditMembers(membersRes.data);
      })
      .catch(() => toast.error("Không thể tải thông tin group"))
      .finally(() => {
        setEditLoading(false);
        setEditMembersLoading(false);
      });
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
    // Nếu chuyển từ active sang inactive thì show popup xác nhận
    if (prevIsActive.current && !editIsActive) {
      setShowInactiveConfirm(true);
      return;
    }
    setEditLoading(true);
    try {
      await axiosInstance.put(`/api/v1/group-chat/${editGroupId}`, {
        name: editName,
        description: editDesc,
        is_active: editIsActive,
      });
      toast.success("Cập nhật thành công");
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === editGroupId
            ? { ...g, group_name: editName, is_active: editIsActive }
            : g
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
      // Reload current page if it becomes empty
      if (groups.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Xóa group chat thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!editGroupId) return;
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này khỏi group?"))
      return;

    try {
      await axiosInstance.delete(
        `/api/v1/group-chat/${editGroupId}/members/${memberId}`
      );
      setEditMembers((prev) => prev.filter((m) => m.account_id !== memberId));
      toast.success("Đã xóa thành viên khỏi group");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Xóa thành viên thất bại");
    }
  };

  useEffect(() => {
    if (editGroupId !== null) {
      prevIsActive.current = editIsActive;
    }
  }, [editGroupId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader":
        return <Crown className="w-4 h-4" />;
      case "moderator":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "leader":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => goToPage(Math.min(totalPages, currentPage + 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Group Chat
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi các nhóm chat trong hệ thống
              </p>
            </div>
          </div>
          {(isAdmin || user?.role?.role_name === "moderator") && (
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
              size="lg"
              onClick={() => setCreateOpen(true)}
            >
              <PlusCircle className="w-5 h-5" />
              Tạo Group Chat
            </Button>
          )}
        </div>

        {/* Search Section */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm theo tên group chat hoặc chủ đề..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Tên Group
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Chủ đề
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Số thành viên
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600">
                            Đang tải danh sách group chat...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : groups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <MessageCircle className="w-12 h-12 text-gray-300" />
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Không có group chat nào
                            </h3>
                            <p className="text-gray-600">
                              Chưa có group chat nào được tạo hoặc không tìm
                              thấy kết quả phù hợp.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    groups.map((group) => (
                      <tr
                        key={group.group_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {group.group_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {group.topic_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {group.member_count}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={
                              group.is_active ? "default" : "destructive"
                            }
                          >
                            {group.is_active ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-900">
                            {format(new Date(group.created_at), "dd/MM/yyyy")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setViewGroupId(group.group_id)
                                    }
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xem chi tiết</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditGroupId(group.group_id);
                                      setEditName(group.group_name);
                                      setEditDesc("");
                                      setEditIsActive(
                                        group.is_active !== undefined
                                          ? group.is_active
                                          : true
                                      );
                                    }}
                                    disabled={
                                      !(
                                        group.my_role === "leader" ||
                                        group.my_role === "moderator" ||
                                        isAdmin
                                      )
                                    }
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sửa thông tin</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(group)}
                                    disabled={
                                      !isAdmin || deletingId === group.group_id
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {isAdmin
                                      ? "Xóa group"
                                      : "Chỉ admin mới được xóa"}
                                  </p>
                                </TooltipContent>
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

            {/* Pagination */}
            {!loading && groups.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
                    {Math.min(currentPage * pageSize, totalItems)} trong tổng số{" "}
                    {totalItems} group chat
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Group Dialog */}
        <Dialog open={!!viewGroupId} onOpenChange={() => setViewGroupId(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Thông tin Group Chat
              </DialogTitle>
              <DialogDescription>
                {viewLoading ? "Đang tải..." : groupDetail?.name}
              </DialogDescription>
            </DialogHeader>
            {groupDetail && !viewLoading && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Chủ đề
                        </label>
                        <p className="text-sm text-gray-900">
                          {groupDetail.topic_name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Leader
                        </label>
                        <p className="text-sm text-gray-900">
                          {groupDetail.leader_name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Số thành viên
                        </label>
                        <p className="text-sm text-gray-900">
                          {groupDetail.member_count}/{groupDetail.max_members}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Ngày tạo
                        </label>
                        <p className="text-sm text-gray-900">
                          {format(
                            new Date(groupDetail.created_at),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Mô tả
                      </label>
                      <p className="text-sm text-gray-900">
                        {groupDetail.description || "Không có"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Ngày cập nhật
                      </label>
                      <p className="text-sm text-gray-900">
                        {format(
                          new Date(groupDetail.updated_at),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                {groupMembers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Danh sách thành viên
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          className="pl-10"
                          placeholder="Tìm kiếm thành viên..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {memberLoading && (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Đang tải...
                            </span>
                          </div>
                        )}
                        {!memberLoading && groupMembers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Không có thành viên nào
                          </div>
                        )}
                        {groupMembers.map((member) => (
                          <div
                            key={member.group_member_id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={member.avatar || "/default-avatar.png"}
                              />
                              <AvatarFallback>
                                {member.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {member.full_name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                @{member.username} • {member.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getRoleBadgeVariant(member.role)}
                                className="flex items-center gap-1"
                              >
                                {getRoleIcon(member.role)}
                                {member.role}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(member.joined_at).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                        {memberPage.hasMore && !memberLoading && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={loadMoreMembers}
                          >
                            Tải thêm thành viên
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Sửa Group Chat
              </DialogTitle>
            </DialogHeader>

            {editLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">
                  Đang tải thông tin group...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Tên group chat *
                      </label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={100}
                        disabled={editLoading}
                        placeholder="Nhập tên group chat"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Mô tả
                      </label>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        maxLength={500}
                        rows={3}
                        disabled={editLoading}
                        placeholder="Nhập mô tả group chat"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Trạng thái
                      </label>
                      <select
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={editIsActive ? "active" : "inactive"}
                        onChange={(e) =>
                          setEditIsActive(e.target.value === "active")
                        }
                        disabled={editLoading}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Members Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Quản lý thành viên
                      </CardTitle>
                      <Badge variant="outline">
                        {editMembers.length} thành viên
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editMembersLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">
                          Đang tải danh sách thành viên...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          Thành viên hiện tại
                        </h4>
                        <div className="max-h-64 overflow-y-auto space-y-3">
                          {editMembers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              Không có thành viên nào
                            </div>
                          ) : (
                            editMembers.map((member) => (
                              <div
                                key={member.group_member_id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={
                                        member.avatar || "/default-avatar.png"
                                      }
                                    />
                                    <AvatarFallback>
                                      {member.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm text-gray-900">
                                      {member.full_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      @{member.username}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={getRoleBadgeVariant(member.role)}
                                    className="flex items-center gap-1"
                                  >
                                    {getRoleIcon(member.role)}
                                    {member.role}
                                  </Badge>
                                  {member.role !== "leader" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRemoveMember(member.account_id)
                                      }
                                      disabled={editLoading}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditGroupId(null)}
                disabled={editLoading}
              >
                Hủy
              </Button>
              <Button onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Group Dialog - Chỉ hiển thị cho Moderator/Admin */}
        {(isAdmin || user?.role?.role_name === "moderator") && (
          <CreateGroupChatDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSuccess={() => {
              // Refresh the groups list
              loadGroups();
            }}
          />
        )}

        {/* Inactive Confirmation Dialog */}
        <AlertDialog
          open={showInactiveConfirm}
          onOpenChange={setShowInactiveConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận chuyển trạng thái</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn chuyển group chat này sang trạng thái{" "}
                <b>Không hoạt động</b>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setShowInactiveConfirm(false);
                  setEditLoading(true);
                  try {
                    await axiosInstance.put(
                      `/api/v1/group-chat/${editGroupId}`,
                      {
                        name: editName,
                        description: editDesc,
                        is_active: false,
                      }
                    );
                    toast.success("Cập nhật thành công");
                    setGroups((prev) =>
                      prev.map((g) =>
                        g.group_id === editGroupId
                          ? { ...g, group_name: editName, is_active: false }
                          : g
                      )
                    );
                    setEditGroupId(null);
                  } catch (err: unknown) {
                    const error = err as {
                      response?: { data?: { detail?: string } };
                    };
                    toast.error(
                      error.response?.data?.detail || "Cập nhật thất bại"
                    );
                  } finally {
                    setEditLoading(false);
                  }
                }}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
