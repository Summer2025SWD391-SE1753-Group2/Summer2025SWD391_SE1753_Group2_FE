import React, { useEffect, useState } from "react";
import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/services/topics/topicService";
import {
  getGroupChatByTopic,
  createGroupChat,
} from "@/services/groupChat/groupChatService";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Topic } from "@/types/topic";

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const [groupChatMap, setGroupChatMap] = useState<Record<string, unknown>>({});
  const [creatingGroupTopicId, setCreatingGroupTopicId] = useState<
    string | null
  >(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);

  // Dialog state management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchTopics = async () => {
      toast.loading("Đang tải danh sách chủ đề...");
      try {
        const data = await getAllTopics();
        setTopics(data);
        toast.dismiss();
      } catch {
        toast.error("Không thể tải danh sách chủ đề.");
      } finally {
        setLoading(false);
        toast.dismiss();
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (
      topics.length > 0 &&
      (user?.role.role_name === "moderator" || user?.role.role_name === "admin")
    ) {
      const fetchGroups = async () => {
        const groupPromises = topics.map(async (topic) => {
          try {
            const group = await getGroupChatByTopic(topic.topic_id!);
            return {
              [topic.topic_id!]: group && group.is_chat_group ? group : null,
            };
          } catch {
            return { [topic.topic_id!]: null };
          }
        });
        const groupResults = await Promise.all(groupPromises);
        const map = Object.assign({}, ...groupResults);
        setGroupChatMap(map);
      };
      fetchGroups();
    }
  }, [topics, user?.role.role_name]);

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
      const newTopic = await createTopic(newTopicData);
      setTopics((prev) => [newTopic, ...prev]);
      setNewName("");
      setNewStatus("active");
      setIsCreateDialogOpen(false);
      toast.success(`Đã tạo chủ đề '${newTopic.name}'`);
    } catch {
      toast.error("Không thể tạo chủ đề.");
    } finally {
      setCreating(false);
      toast.dismiss();
    }
  };

  const toggleStatus = async (topic: Topic) => {
    toast.loading("Đang cập nhật trạng thái...");
    try {
      const updatedTopic = await updateTopic(topic.topic_id!, {
        status: topic.status === "active" ? "inactive" : "active",
      });
      setTopics((prev) =>
        prev.map((t) => (t.topic_id === topic.topic_id ? updatedTopic : t))
      );
      toast.success(`Đã cập nhật trạng thái cho chủ đề '${updatedTopic.name}'`);
    } catch {
      toast.error("Không thể cập nhật trạng thái.");
    } finally {
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
      setTopics((prev) => prev.filter((t) => t.topic_id !== topicId));
      toast.success("Đã xóa chủ đề thành công.");
    } catch {
      toast.error("Không thể xóa chủ đề.");
    } finally {
      toast.dismiss();
    }
  };

  const handleCreateGroupChat = async (topic: Topic) => {
    setGroupLoading(true);
    toast.loading("Đang tạo group chat...");
    try {
      await createGroupChat({
        topic_id: topic.topic_id!,
        name: groupName || topic.name,
        description: groupDesc,
        max_members: 50,
      });

      const group = await getGroupChatByTopic(topic.topic_id!);
      setGroupChatMap((prev) => ({ ...prev, [topic.topic_id!]: group }));

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
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.topic_id}>
                  <TableCell className="font-medium">{topic.name}</TableCell>
                  <TableCell
                    className={cn(
                      "font-medium",
                      topic.status === "active"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    {topic.status === "active"
                      ? "Hoạt động"
                      : "Không hoạt động"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleStatus(topic)}
                      >
                        {topic.status === "active" ? "Ẩn" : "Hiện"}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Xoá
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
                              onClick={() => handleDelete(topic.topic_id!)}
                            >
                              Xác nhận
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {(user?.role.role_name === "moderator" ||
                        user?.role.role_name === "admin") &&
                        (groupChatMap[topic.topic_id!] ? (
                          <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-md">
                            Đã có group
                          </span>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => openGroupDialog(topic.topic_id!)}
                            >
                              Tạo Group
                            </Button>
                          </>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
              {topics.find((t) => t.topic_id === creatingGroupTopicId)?.name}
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
                topics.find((t) => t.topic_id === creatingGroupTopicId)?.name ||
                ""
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
    </div>
  );
}
