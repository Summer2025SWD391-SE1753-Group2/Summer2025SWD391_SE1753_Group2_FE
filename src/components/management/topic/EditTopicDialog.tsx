import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

export default function EditTopicDialog({
  open,
  onOpenChange,
  name,
  status,
  onNameChange,
  onStatusChange,
  onSubmit,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa chủ đề</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
          <Select value={status} onValueChange={(val) => onStatusChange(val as "active" | "inactive") }>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
