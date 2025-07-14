import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface User {
  account_id: string;
  full_name: string;
  username: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  step: number;
  groupName: string;
  groupDesc: string;
  memberSearch: string;
  memberSuggest: User[];
  selectedMembers: User[];
  groupError: string | null;
  creating: boolean;
  searchLoading: boolean;
  onGroupNameChange: (val: string) => void;
  onGroupDescChange: (val: string) => void;
  onMemberSearchChange: (val: string) => void;
  onAddMember: (u: User) => void;
  onRemoveMember: (id: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSubmit: () => void;
  topicName?: string;
}

export default function GroupChatDialog({
  open, onClose, step, groupName, groupDesc, memberSearch, memberSuggest, selectedMembers, groupError,
  creating, searchLoading, onGroupNameChange, onGroupDescChange, onMemberSearchChange, onAddMember,
  onRemoveMember, onNextStep, onPrevStep, onSubmit, topicName
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo group chat cho: {topicName}</DialogTitle>
          <DialogDescription>
            {step === 1 && "Nhập thông tin group chat."}
            {step === 2 && "Chọn thành viên cho group chat (ít nhất 2, tối đa 49)."}
            {step === 3 && "Xác nhận lại thông tin trước khi tạo."}
          </DialogDescription>
        </DialogHeader>
        {groupError && <div className="text-red-500 text-sm mb-2">{groupError}</div>}

        {step === 1 && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onNextStep(); }}>
            <Input placeholder="Tên group chat" value={groupName} maxLength={100} onChange={(e) => onGroupNameChange(e.target.value)} required />
            <Textarea placeholder="Mô tả (tùy chọn)" value={groupDesc} maxLength={500} onChange={(e) => onGroupDescChange(e.target.value)} />
            <DialogFooter>
              <Button type="submit" disabled={!groupName.trim()}>Tiếp</Button>
            </DialogFooter>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Input placeholder="Tìm username hoặc tên thành viên..." value={memberSearch} onChange={(e) => onMemberSearchChange(e.target.value)} />
            {searchLoading && <div className="text-xs text-gray-500">Đang tìm...</div>}
            {memberSuggest.length > 0 && (
              <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
                {memberSuggest.map((u) => (
                  <li key={u.account_id}>
                    <button type="button" onClick={() => onAddMember(u)} disabled={selectedMembers.length >= 49} className="w-full text-left px-2 py-1 hover:bg-gray-100">
                      {u.full_name || u.username} ({u.username})
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div>
              {selectedMembers.map((u) => (
                <span key={u.account_id} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1">
                  {u.full_name || u.username}
                  <button type="button" className="ml-1 text-red-500" onClick={() => onRemoveMember(u.account_id)}>×</button>
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500">Đã chọn {selectedMembers.length} thành viên (tối đa 49, ít nhất 2)</div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onPrevStep}>Quay lại</Button>
              <Button type="button" onClick={onNextStep} disabled={selectedMembers.length < 2}>Tiếp</Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="font-medium">Tên group chat:</div>
              <div>{groupName}</div>
            </div>
            <div>
              <div className="font-medium">Mô tả:</div>
              <div>{groupDesc || <span className="text-gray-400">(Không có)</span>}</div>
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
              <Button type="button" variant="secondary" onClick={onPrevStep}>Quay lại</Button>
              <Button type="button" onClick={onSubmit} disabled={creating}>{creating ? "Đang tạo..." : "Tạo Group Chat"}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
