import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  status: "active" | "inactive";
  onNameChange: (val: string) => void;
  onStatusChange: (val: "active" | "inactive") => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function CreateTopicDialog({
  open, onOpenChange, name, status, onNameChange, onStatusChange, onSubmit, loading
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">+ Thêm Chủ đề</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo chủ đề mới</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Input placeholder="Tên chủ đề" value={name} onChange={(e) => onNameChange(e.target.value)} />
          <Select value={status} onValueChange={(val) => onStatusChange(val as "active" | "inactive")}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Đang tạo..." : "Tạo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
