import React, { useEffect, useState } from "react";
import {
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/services/topics/topicService";
import { createGroupChat } from "@/services/groupChat/groupChatService";
import axiosInstance from "@/lib/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth";

// Topic type with group_chat
interface TopicWithGroup {
  topic_id: string;
  topic_name: string;
  status: string;
  group_chat: null | {
    group_id: string;
    group_name: string;
    group_description: string;
    member_count: number;
    max_members: number;
    created_at: string;
  };
}

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<TopicWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const [creatingGroupTopicId, setCreatingGroupTopicId] = useState<
    string | null
  >(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);

  // Dialog state management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  // Edit dialog state
  const [editingTopic, setEditingTopic] = useState<TopicWithGroup | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editLoading, setEditLoading] = useState(false);

  const user = useAuthStore((state) => state.user);

  // Fetch topics with group info
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          "/api/v1/group-chat/topics/with-or-without-group"
        );
        setTopics(res.data);
      } catch {
        toast.error("Không thể tải danh sách chủ đề.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !user?.account_id) return;
    setCreating(true);
    toast.loading("Đang tạo chủ đề...");
    try {
      const newTopicData = {
        name: newName,
        status: newStatus,
        created_by: user.account_id,
      };
      await createTopic(newTopicData);
      // Refresh topics
      const res = await axiosInstance.get(
        "/api/v1/group-chat/topics/with-or-without-group"
      );
      setTopics(res.data);
      setNewName("");
      setNewStatus("active");
      setIsCreateDialogOpen(false);
      toast.success(`Đã tạo chủ đề '${newTopicData.name}'`);
    } catch {
      toast.error("Không thể tạo chủ đề.");
    } finally {
      setCreating(false);
      toast.dismiss();
    }
  };

  const handleDelete = async (topicId: string) => {
    if (user?.role.role_name !== "admin") {
      toast.error("Bạn không có quyền xóa chủ đề.");
      return;
    }
    toast.loading("Đang xóa chủ đề...");
    try {
      await deleteTopic(topicId);
      // Refresh topics
      const res = await axiosInstance.get(
        "/api/v1/group-chat/topics/with-or-without-group"
      );
      setTopics(res.data);
      toast.success("Đã xóa chủ đề thành công.");
    } catch {
      toast.error("Không thể xóa chủ đề.");
    } finally {
      toast.dismiss();
    }
  };

  // Edit topic
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    setEditLoading(true);
    try {
      await updateTopic(editingTopic.topic_id, {
        name: editName,
        status: editStatus,
      });
      toast.success("Cập nhật chủ đề thành công!");
      setEditingTopic(null);
      // refresh topics
      const res = await axiosInstance.get(
        "/api/v1/group-chat/topics/with-or-without-group"
      );
      setTopics(res.data);
    } catch {
      toast.error("Không thể cập nhật chủ đề.");
    } finally {
      setEditLoading(false);
    }
  };

  // Group chat creation
  const handleCreateGroupChat = async (topic: TopicWithGroup) => {
    setGroupLoading(true);
    toast.loading("Đang tạo group chat...");
    try {
      await createGroupChat({
        topic_id: topic.topic_id,
        name: groupName || topic.topic_name,
        description: groupDesc,
        max_members: 50,
      });
      // Refresh topics
      const res = await axiosInstance.get(
        "/api/v1/group-chat/topics/with-or-without-group"
      );
      setTopics(res.data);
      setCreatingGroupTopicId(null);
      setGroupName("");
      setGroupDesc("");
      setIsGroupDialogOpen(false);
      toast.success("Tạo group chat thành công!");
    } catch {
      toast.error("Không thể tạo group chat.");
    } finally {
      setGroupLoading(false);
      toast.dismiss();
    }
  };

  const openGroupDialog = (topicId: string) => {
    setCreatingGroupTopicId(topicId);
    setIsGroupDialogOpen(true);
  };

  const closeGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setCreatingGroupTopicId(null);
    setGroupName("");
    setGroupDesc("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Chủ đề</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Thêm Chủ đề</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo chủ đề mới</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên chủ đề"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Select
                value={newStatus}
                onValueChange={(val: "active" | "inactive") =>
                  setNewStatus(val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : topics.length === 0 ? (
        <p>Chưa có chủ đề nào được tạo.</p>
      ) : (
        <div className="rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Chủ đề</TableHead>
                <TableHead className="w-40">Trạng thái</TableHead>
                <TableHead className="pl-4">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => {
                const canCreateGroup =
                  topic.status === "active" && !topic.group_chat;
                let groupBtnText = "Tạo Group Chat";
                let groupBtnClass = "bg-blue-600 hover:bg-blue-700 text-white";
                let groupBtnDisabled = false;

                if (topic.group_chat) {
                  groupBtnText = "Đã có Group Chat";
                  groupBtnClass =
                    "bg-gray-300 text-gray-600 cursor-not-allowed";
                  groupBtnDisabled = true;
                } else if (topic.status !== "active") {
                  groupBtnText = "Không thể tạo group chat";
                  groupBtnClass =
                    "bg-gray-300 text-gray-600 cursor-not-allowed";
                  groupBtnDisabled = true;
                }

                return (
                  <TableRow key={topic.topic_id}>
                    <TableCell className="font-medium">
                      {topic.topic_name}
                    </TableCell>
                    <TableCell className="w-40">
                      {topic.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </TableCell>
                    <TableCell className="pl-4">
                      <div className="flex items-center justify-start gap-2">
                        {(user?.role.role_name === "admin" ||
                          user?.role.role_name === "moderator") && (
                          <>
                            {/* Nút Sửa */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTopic(topic);
                                setEditName(topic.topic_name);
                                setEditStatus(
                                  topic.status as "active" | "inactive"
                                );
                              }}
                            >
                              Sửa
                            </Button>
                            {/* Nút Xóa */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  Xóa
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Bạn có chắc chắn muốn xóa chủ đề này?
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await handleDelete(topic.topic_id);
                                    }}
                                  >
                                    Xác nhận
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {/* Nút Group chat */}
                        {(user?.role.role_name === "admin" ||
                          user?.role.role_name === "moderator") && (
                          <Button
                            size="sm"
                            style={{ minWidth: 140 }}
                            className={groupBtnClass}
                            disabled={groupBtnDisabled}
                            onClick={() => {
                              if (canCreateGroup)
                                openGroupDialog(topic.topic_id);
                            }}
                          >
                            {groupBtnText}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Group Chat Creation Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={closeGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tạo group chat cho:{" "}
              {
                topics.find((t) => t.topic_id === creatingGroupTopicId)
                  ?.topic_name
              }
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo group chat cho chủ đề này.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const topic = topics.find(
                (t) => t.topic_id === creatingGroupTopicId
              );
              if (topic) {
                handleCreateGroupChat(topic);
              }
            }}
            className="space-y-4"
          >
            <Input
              placeholder={`Tên group (mặc định: ${
                topics.find((t) => t.topic_id === creatingGroupTopicId)
                  ?.topic_name || ""
              })`}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Input
              placeholder="Mô tả (tùy chọn)"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={groupLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {groupLoading ? "Đang tạo..." : "Tạo Group Chat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa chủ đề</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Select
              value={editStatus}
              onValueChange={(val) =>
                setEditStatus(val as "active" | "inactive")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                type="submit"
                variant="destructive"
                disabled={editLoading}
              >
                {editLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingTopic(null)}
              >
                Hủy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
