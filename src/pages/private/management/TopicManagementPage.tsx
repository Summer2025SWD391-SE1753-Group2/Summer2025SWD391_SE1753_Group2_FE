import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth";
import { createTopic, updateTopic, deleteTopic } from "@/services/topics/topicService";
import TopicTable from "@/components/management/topic/TopicTable";
import CreateTopicDialog from "@/components/management/topic/CreateTopicDialog";
import EditTopicDialog from "@/components/management/topic/EditTopicDialog";
import GroupChatDialog from "@/components/management/topic/GroupChatDialog";
import { Pagination } from "@/components/ui/pagination";

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

interface User {
  account_id: string;
  full_name: string;
  username: string;
}

const PAGE_SIZE = 8;

export default function TopicManagementPage() {
  const [topics, setTopics] = useState<TopicWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicWithGroup | null>(null);

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupStep, setGroupStep] = useState(1);
  const [creatingGroupTopicId, setCreatingGroupTopicId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSuggest, setMemberSuggest] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupCreating, setGroupCreating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicStatus, setNewTopicStatus] = useState<"active" | "inactive">("active");
  const [creatingTopic, setCreatingTopic] = useState(false);

  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [editLoading, setEditLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const user = useAuthStore((state) => state.user);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/v1/group-chat/topics/with-or-without-group");
      setTopics(res.data);
      setCurrentPage(1);
    } catch {
      toast.error("Không thể tải danh sách chủ đề.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  useEffect(() => {
    if (groupDialogOpen && groupStep === 2) {
      axiosInstance.get("/api/v1/accounts?active=true").then((res) => {
        setMemberSuggest(res.data.filter((u: User) => u.account_id !== user?.account_id));
      });
    }
  }, [groupDialogOpen, groupStep, user?.account_id]);

  useEffect(() => {
    if (groupDialogOpen && groupStep === 2 && memberSearch.trim().length > 1) {
      setSearchLoading(true);
      axiosInstance.get(`/api/v1/accounts/search/?name=${encodeURIComponent(memberSearch)}`).then((res) => {
        setMemberSuggest(res.data.filter((u: User) => !selectedMembers.some((m) => m.account_id === u.account_id) && u.account_id !== user?.account_id));
      }).finally(() => setSearchLoading(false));
    } else {
      setMemberSuggest([]);
    }
  }, [groupDialogOpen, groupStep, memberSearch, selectedMembers, user?.account_id]);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim() || !user?.account_id) return;
    setCreatingTopic(true);
    toast.loading("Đang tạo chủ đề...");
    try {
      await createTopic({ name: newTopicName, status: newTopicStatus, created_by: user.account_id });
      fetchTopics();
      setNewTopicName("");
      setNewTopicStatus("active");
      setCreateDialogOpen(false);
      toast.success(`Đã tạo chủ đề '${newTopicName}'`);
    } catch {
      toast.error("Không thể tạo chủ đề.");
    } finally {
      setCreatingTopic(false);
      toast.dismiss();
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic) return;
    setEditLoading(true);
    try {
      await updateTopic(editingTopic.topic_id, { name: editName, status: editStatus });
      fetchTopics();
      setEditDialogOpen(false);
      setEditingTopic(null);
      toast.success("Cập nhật chủ đề thành công!");
    } catch {
      toast.error("Không thể cập nhật chủ đề.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (user?.role.role_name !== "admin") {
      toast.error("Bạn không có quyền xóa chủ đề.");
      return;
    }
    toast.loading("Đang xóa chủ đề...");
    try {
      await deleteTopic(id);
      fetchTopics();
      toast.success("Đã xóa chủ đề thành công.");
    } catch {
      toast.error("Không thể xóa chủ đề.");
    } finally {
      toast.dismiss();
    }
  };

  const handleCreateGroup = async () => {
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
      fetchTopics();
      setGroupDialogOpen(false);
      setGroupStep(1);
      setGroupName("");
      setGroupDesc("");
      setSelectedMembers([]);
    } catch (err: any) {
      setGroupError(err?.response?.data?.detail || "Không thể tạo group chat");
    } finally {
      setGroupCreating(false);
    }
  };

  const totalPages = Math.ceil(topics.length / PAGE_SIZE);
  const paginatedTopics = topics.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Chủ đề</h1>
        <CreateTopicDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          name={newTopicName}
          status={newTopicStatus}
          onNameChange={setNewTopicName}
          onStatusChange={setNewTopicStatus}
          onSubmit={handleCreateTopic}
          loading={creatingTopic}
        />
      </div>

      <TopicTable
        topics={paginatedTopics}
        loading={loading}
        user={user}
        onDelete={handleDeleteTopic}
        onEdit={(topic) => {
          setEditingTopic(topic);
          setEditName(topic.topic_name);
          setEditStatus(topic.status as "active" | "inactive");
          setEditDialogOpen(true);
        }}
        onCreateGroup={(id) => {
          setCreatingGroupTopicId(id);
          setGroupDialogOpen(true);
        }}
      />

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      )}

      <EditTopicDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        name={editName}
        status={editStatus}
        onNameChange={setEditName}
        onStatusChange={setEditStatus}
        onSubmit={handleEditTopic}
        loading={editLoading}
      />

      <GroupChatDialog
        open={groupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        step={groupStep}
        groupName={groupName}
        groupDesc={groupDesc}
        memberSearch={memberSearch}
        memberSuggest={memberSuggest}
        selectedMembers={selectedMembers}
        groupError={groupError}
        creating={groupCreating}
        searchLoading={searchLoading}
        onGroupNameChange={setGroupName}
        onGroupDescChange={setGroupDesc}
        onMemberSearchChange={setMemberSearch}
        onAddMember={(u) => {
          if (selectedMembers.length < 49) setSelectedMembers([...selectedMembers, u]);
          setMemberSearch("");
          setMemberSuggest([]);
        }}
        onRemoveMember={(id) => setSelectedMembers(selectedMembers.filter((m) => m.account_id !== id))}
        onNextStep={() => setGroupStep((prev) => prev + 1)}
        onPrevStep={() => setGroupStep((prev) => prev - 1)}
        onSubmit={handleCreateGroup}
        topicName={topics.find((t) => t.topic_id === creatingGroupTopicId)?.topic_name}
      />
    </div>
  );
}
