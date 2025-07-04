import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Topic {
  topic_id: string;
  topic_name: string;
  status: string;
  group_chat: any;
}

interface User {
  account_id: string;
  full_name: string;
  username: string;
  role: {
    role_name: string;
  };
}

interface Props {
  topics: Topic[];
  user: User | null;
  loading: boolean;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: string) => void;
  onCreateGroup: (topicId: string) => void;
}

export default function TopicTable({
  topics,
  user,
  loading,
  onEdit,
  onDelete,
  onCreateGroup,
}: Props) {
  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (topics.length === 0) return <p>Chưa có chủ đề nào được tạo.</p>;

  const isAdmin = user?.role.role_name === "admin";
  const isMod = user?.role.role_name === "moderator";

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Chủ đề</TableHead>
            <TableHead className="w-40">Trạng thái</TableHead>
            <TableHead className="text-center pr-4">Hành động</TableHead>
          </TableRow>

        </TableHeader>
        <TableBody>
          {topics.map((topic) => {
            const canCreateGroup =
              topic.status === "active" && !topic.group_chat;

            return (
              <TableRow key={topic.topic_id}>
                <TableCell className="font-medium">
                  {topic.topic_name}
                </TableCell>
                <TableCell>
                  {topic.status === "active"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </TableCell>
                <TableCell className="">
                  <div className="flex justify-center gap-2">
                    {(isAdmin || isMod) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(topic)}
                        >
                          Sửa
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Bạn có chắc muốn xóa?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(topic.topic_id)}
                              >
                                Xác nhận
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          size="sm"
                          className={
                            canCreateGroup
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }
                          disabled={!canCreateGroup}
                          style={{ minWidth: 140 }}
                          onClick={() =>
                            canCreateGroup && onCreateGroup(topic.topic_id)
                          }
                        >
                          {topic.group_chat
                            ? "Đã có Group Chat"
                            : topic.status !== "active"
                              ? "Không thể tạo group chat"
                              : "Tạo Group Chat"}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
