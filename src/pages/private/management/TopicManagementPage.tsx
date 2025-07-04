import React, { useEffect, useState } from "react";
import {
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/services/topics/topicService";
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
import { Textarea } from "@/components/ui/textarea";

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

type User = { account_id: string; full_name: string; username: string };

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<TopicWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");

  const [creatingGroupTopicId, setCreatingGroupTopicId] = useState<
    string | null
  >(null);
  const [groupStep, setGroupStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSuggest, setMemberSuggest] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupCreating, setGroupCreating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

  // Fetch member options when dialog opens and step 2
  useEffect(() => {
    if (isGroupDialogOpen && groupStep === 2) {
      // Example: fetch all users except current user
      axiosInstance.get("/api/v1/accounts?active=true").then((res) => {
        setMemberSuggest(
          res.data.filter((u: User) => u.account_id !== user?.account_id)
        );
      });
    }
  }, [isGroupDialogOpen, groupStep, user?.account_id]);

  useEffect(() => {
    if (
      isGroupDialogOpen &&
      groupStep === 2 &&
      memberSearch.trim().length > 1
    ) {
      setSearchLoading(true);
      axiosInstance
        .get(
          `/api/v1/accounts/search/?name=${encodeURIComponent(memberSearch)}`
        )
        .then((res) => {
          setMemberSuggest(
            res.data.filter(
              (u: User) =>
                !selectedMembers.some((m) => m.account_id === u.account_id) &&
                u.account_id !== user?.account_id
            )
          );
        })
        .finally(() => setSearchLoading(false));
    } else {
      setMemberSuggest([]);
    }
  }, [
    isGroupDialogOpen,
    groupStep,
    memberSearch,
    selectedMembers,
    user?.account_id,
  ]);

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

  // Multi-step group chat creation handler
  const handleCreateGroupTransaction = async () => {
    setGroupCreating(true);
    setGroupError(null);
    try {
      await axiosInstance.post("/api/v1/group-chat/create-transaction", {
        topic_id: creatingGroupTopicId,
        name: groupName,
        description: groupDesc,
        member_ids: selectedMembers.map((u) => u.account_id),
      });
      toast.success("Tạo group chat thành công!");
      setIsGroupDialogOpen(false);
      setGroupStep(1);
      setGroupName("");
      setGroupDesc("");
      setSelectedMembers([]);
      // Refresh topics
      const res = await axiosInstance.get(
        "/api/v1/group-chat/topics/with-or-without-group"
      );
      setTopics(res.data);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object" &&
        (err as { response: { data?: unknown } }).response.data !== undefined
      ) {
        setGroupError(
          (err as { response: { data?: { detail?: string } } }).response.data
            ?.detail || "Không thể tạo group chat"
        );
      } else {
        setGroupError("Không thể tạo group chat");
      }
    } finally {
      setGroupCreating(false);
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
              {groupStep === 1 && "Nhập thông tin group chat."}
              {groupStep === 2 &&
                "Chọn thành viên cho group chat (ít nhất 2, tối đa 49)."}
              {groupStep === 3 && "Xác nhận lại thông tin trước khi tạo."}
            </DialogDescription>
          </DialogHeader>
          {groupError && (
            <div className="text-red-500 text-sm mb-2">{groupError}</div>
          )}
          {groupStep === 1 && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setGroupStep(2);
              }}
            >
              <Input
                placeholder="Tên group chat"
                value={groupName}
                maxLength={100}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <Textarea
                placeholder="Mô tả (tùy chọn)"
                value={groupDesc}
                maxLength={500}
                onChange={(e) => setGroupDesc(e.target.value)}
              />
              <DialogFooter>
                <Button type="submit" disabled={!groupName.trim()}>
                  Tiếp
                </Button>
              </DialogFooter>
            </form>
          )}
          {groupStep === 2 && (
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Tìm username hoặc tên thành viên..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {searchLoading && (
                  <div className="text-xs text-gray-500">Đang tìm...</div>
                )}
                {memberSuggest.length > 0 && (
                  <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
                    {memberSuggest.map((u) => (
                      <li key={u.account_id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedMembers.length < 49) {
                              setSelectedMembers([...selectedMembers, u]);
                              setMemberSearch("");
                              setMemberSuggest([]);
                            }
                          }}
                          disabled={selectedMembers.length >= 49}
                          className="w-full text-left px-2 py-1 hover:bg-gray-100"
                        >
                          {u.full_name || u.username} ({u.username})
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2">
                  {selectedMembers.map((u) => (
                    <span
                      key={u.account_id}
                      className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1"
                    >
                      {u.full_name || u.username}
                      <button
                        type="button"
                        className="ml-1 text-red-500"
                        onClick={() =>
                          setSelectedMembers(
                            selectedMembers.filter(
                              (m) => m.account_id !== u.account_id
                            )
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Đã chọn {selectedMembers.length} thành viên (tối đa 49, ít
                  nhất 2)
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setGroupStep(1)}
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={() => setGroupStep(3)}
                  disabled={selectedMembers.length < 2}
                >
                  Tiếp
                </Button>
              </DialogFooter>
            </div>
          )}
          {groupStep === 3 && (
            <div className="space-y-4">
              <div>
                <div className="font-medium">Tên group chat:</div>
                <div>{groupName}</div>
              </div>
              <div>
                <div className="font-medium">Mô tả:</div>
                <div>
                  {groupDesc || (
                    <span className="text-gray-400">(Không có)</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium">Thành viên sẽ được thêm:</div>
                <ul className="list-disc pl-5">
                  {selectedMembers.map((u) => (
                    <li key={u.account_id}>{u.full_name || u.username}</li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setGroupStep(2)}
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateGroupTransaction}
                  disabled={groupCreating}
                >
                  {groupCreating ? "Đang tạo..." : "Tạo Group Chat"}
                </Button>
              </DialogFooter>
            </div>
          )}
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
