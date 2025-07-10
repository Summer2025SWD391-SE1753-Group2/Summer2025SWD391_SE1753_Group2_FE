import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import axiosInstance from "@/lib/api/axios";
import { createGroupChatWithMembers } from "@/services/groupChat/groupChatService";
import type { AvailableTopic } from "@/types/topic";
import type { UserProfile } from "@/types/account";

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Step1Data {
  selectedTopic: AvailableTopic | null;
}

interface Step2Data {
  name: string;
  description: string;
}

interface Step3Data {
  selectedMembers: UserProfile[];
  searchKeyword: string;
  searchResults: UserProfile[];
  searching: boolean;
}

export default function CreateGroupChatDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGroupChatDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<AvailableTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Step data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    selectedTopic: null,
  });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    name: "",
    description: "",
  });
  const [step3Data, setStep3Data] = useState<Step3Data>({
    selectedMembers: [],
    searchKeyword: "",
    searchResults: [],
    searching: false,
  });

  const [debouncedSearch] = useDebounce(step3Data.searchKeyword, 300);

  // Load available topics
  useEffect(() => {
    if (open && currentStep === 1) {
      loadAvailableTopics();
    }
  }, [open, currentStep]);

  // Search members when keyword changes
  useEffect(() => {
    if (debouncedSearch.trim() && currentStep === 3) {
      searchMembers(debouncedSearch);
    } else if (!debouncedSearch.trim()) {
      setStep3Data((prev) => ({ ...prev, searchResults: [] }));
    }
  }, [debouncedSearch, currentStep]);

  const loadAvailableTopics = async () => {
    setTopicsLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/v1/group-chat/topics/available"
      );
      setAvailableTopics(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách chủ đề");
    } finally {
      setTopicsLoading(false);
    }
  };

  const searchMembers = async (keyword: string) => {
    setStep3Data((prev) => ({ ...prev, searching: true }));
    try {
      const response = await axiosInstance.get(
        `/api/v1/accounts/search/?name=${encodeURIComponent(
          keyword
        )}&skip=0&limit=50`
      );
      const results = response.data.filter(
        (user: UserProfile) =>
          !step3Data.selectedMembers.some(
            (member) => member.account_id === user.account_id
          )
      );
      setStep3Data((prev) => ({ ...prev, searchResults: results }));
    } catch (error) {
      toast.error("Không thể tìm kiếm thành viên");
    } finally {
      setStep3Data((prev) => ({ ...prev, searching: false }));
    }
  };

  const addMember = (user: UserProfile) => {
    if (step3Data.selectedMembers.length >= 50) {
      toast.error("Tối đa 50 thành viên");
      return;
    }
    setStep3Data((prev) => ({
      ...prev,
      selectedMembers: [...prev.selectedMembers, user],
      searchResults: prev.searchResults.filter(
        (u) => u.account_id !== user.account_id
      ),
    }));
  };

  const removeMember = (accountId: string) => {
    setStep3Data((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.filter(
        (m) => m.account_id !== accountId
      ),
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!step1Data.selectedTopic) {
        toast.error("Vui lòng chọn một chủ đề");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!step2Data.name.trim()) {
        toast.error("Vui lòng nhập tên group chat");
        return;
      }
      if (step2Data.name.length > 100) {
        toast.error("Tên group chat tối đa 100 ký tự");
        return;
      }
      if (step2Data.description.length > 500) {
        toast.error("Mô tả tối đa 500 ký tự");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    if (step3Data.selectedMembers.length < 2) {
      toast.error("Cần ít nhất 2 thành viên");
      return;
    }

    setLoading(true);
    try {
      await createGroupChatWithMembers({
        topic_id: step1Data.selectedTopic!.topic_id,
        name: step2Data.name,
        description: step2Data.description || undefined,
        max_members: 50,
        member_ids: step3Data.selectedMembers.map((m) => m.account_id),
      });

      toast.success("Tạo group chat thành công");
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Tạo group chat thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStep1Data({ selectedTopic: null });
    setStep2Data({ name: "", description: "" });
    setStep3Data({
      selectedMembers: [],
      searchKeyword: "",
      searchResults: [],
      searching: false,
    });
    onOpenChange(false);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Chọn chủ đề cho group chat</h3>
        <p className="text-sm text-gray-600 mb-4">
          Chọn một chủ đề chưa có group chat để tạo group mới
        </p>
      </div>

      {topicsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách chủ đề...</p>
        </div>
      ) : availableTopics.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            Không có chủ đề nào có thể tạo group chat
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {availableTopics.map((topic) => (
            <div
              key={topic.topic_id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                step1Data.selectedTopic?.topic_id === topic.topic_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setStep1Data({ selectedTopic: topic })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{topic.topic_name}</h4>
                  <p className="text-sm text-gray-600">
                    Trạng thái: {topic.status}
                  </p>
                </div>
                {step1Data.selectedTopic?.topic_id === topic.topic_id && (
                  <Check className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Thông tin group chat</h3>
        <p className="text-sm text-gray-600 mb-4">
          Nhập tên và mô tả cho group chat
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Tên group chat <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Nhập tên group chat"
          value={step2Data.name}
          onChange={(e) =>
            setStep2Data((prev) => ({ ...prev, name: e.target.value }))
          }
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          {step2Data.name.length}/100 ký tự
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mô tả</label>
        <Textarea
          placeholder="Nhập mô tả (tùy chọn)"
          value={step2Data.description}
          onChange={(e) =>
            setStep2Data((prev) => ({ ...prev, description: e.target.value }))
          }
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          {step2Data.description.length}/500 ký tự
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Thêm thành viên</h3>
        <p className="text-sm text-gray-600 mb-4">
          Chọn thành viên cho group chat (ít nhất 2, tối đa 50)
        </p>
      </div>

      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm thành viên..."
            value={step3Data.searchKeyword}
            onChange={(e) =>
              setStep3Data((prev) => ({
                ...prev,
                searchKeyword: e.target.value,
              }))
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Selected Members */}
      {step3Data.selectedMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">
            Thành viên đã chọn ({step3Data.selectedMembers.length}/50)
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {step3Data.selectedMembers.map((member) => (
              <div
                key={member.account_id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {member.full_name?.charAt(0) || member.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {member.full_name || member.username}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(member.account_id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {step3Data.searchKeyword.trim() && (
        <div>
          <h4 className="text-sm font-medium mb-2">Kết quả tìm kiếm</h4>
          {step3Data.searching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : step3Data.searchResults.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Không tìm thấy kết quả
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {step3Data.searchResults.map((user) => (
                <div
                  key={user.account_id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => addMember(user)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.full_name?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {user.full_name || user.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Group Chat</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Bước 1: Chọn chủ đề cho group chat"}
            {currentStep === 2 && "Bước 2: Nhập thông tin group chat"}
            {currentStep === 3 && "Bước 3: Thêm thành viên"}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="flex-1">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={loading}>
              Quay lại
            </Button>
          )}

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={loading}>
              Tiếp
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading || step3Data.selectedMembers.length < 2}
            >
              {loading ? "Đang tạo..." : "Xác nhận"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
