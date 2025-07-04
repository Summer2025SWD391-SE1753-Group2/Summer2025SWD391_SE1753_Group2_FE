import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Props = {
  onFilter: (status: string, sort: string) => void;
};

export const PostFilter: React.FC<Props> = ({ onFilter }) => {
  const [status, setStatus] = React.useState("all");
  const [sort, setSort] = React.useState("newest");

  React.useEffect(() => {
    onFilter(status, sort);
  }, [status, sort]);

  return (
    <div className="flex items-center gap-4">
      <div>
        <label className="text-sm font-medium">Trạng thái</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="waiting">Chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">Sắp xếp</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
