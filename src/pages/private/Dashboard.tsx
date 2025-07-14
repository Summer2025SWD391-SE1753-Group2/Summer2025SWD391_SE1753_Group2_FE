import { useEffect, useState } from "react";
import { getAllPosts } from "@/services/posts/postService";
import { getAllAccounts } from "@/services/accounts/accountService";
import { getAllTopics } from "@/services/topics/topicService";
import { getAllTags } from "@/services/tags/tagsService";
import { getAllMaterials } from "@/services/materials/materialService";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CheckCircle, XCircle, Hash, Tag, Box } from "lucide-react";

export default function Dashboard() {
  const [totalApproved, setTotalApproved] = useState<number>(0);
  const [totalRejected, setTotalRejected] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTopics, setTotalTopics] = useState<number>(0);
  const [totalTags, setTotalTags] = useState<number>(0);
  const [totalMaterials, setTotalMaterials] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        allPosts,
        allAccounts,
        allTopics,
        allTags,
        allMaterials,
      ] = await Promise.all([
        getAllPosts(),
        getAllAccounts(),
        getAllTopics(),
        getAllTags(),
        getAllMaterials(),
      ]);

      setTotalUsers(allAccounts.length);
      setTotalTopics(allTopics.total);
      setTotalTags(allTags.total);
      setTotalMaterials(allMaterials.total);

      const approved = allPosts.filter((p) => p.status === "approved").length;
      const rejected = allPosts.filter((p) => p.status === "rejected").length;
      setTotalApproved(approved);
      setTotalRejected(rejected);
    } catch {
      setTotalUsers(0);
      setTotalTopics(0);
      setTotalTags(0);
      setTotalMaterials(0);
      setTotalApproved(0);
      setTotalRejected(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    bgColor,
    color,
  }: {
    icon: React.FC<any>;
    label: string;
    value: number;
    bgColor: string;
    color: string;
  }) => (
    <Card className="flex items-center p-4 gap-4">
      <div className={`p-3 rounded-full ${bgColor} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Thống kê tổng quan</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={CheckCircle}
            label="Bài viết đã duyệt"
            value={totalApproved}
            bgColor="bg-green-100"
            color="text-green-600"
          />
          <StatCard
            icon={XCircle}
            label="Bài viết bị từ chối"
            value={totalRejected}
            bgColor="bg-red-100"
            color="text-red-600"
          />
          <StatCard
            icon={Users}
            label="Tổng số người dùng"
            value={totalUsers}
            bgColor="bg-blue-100"
            color="text-blue-600"
          />
          <StatCard
            icon={Hash}
            label="Tổng số chủ đề"
            value={totalTopics}
            bgColor="bg-purple-100"
            color="text-purple-600"
          />
          <StatCard
            icon={Tag}
            label="Tổng số thẻ"
            value={totalTags}
            bgColor="bg-yellow-100"
            color="text-yellow-600"
          />
          <StatCard
            icon={Box}
            label="Tổng số nguyên liệu"
            value={totalMaterials}
            bgColor="bg-indigo-100"
            color="text-indigo-600"
          />
        </div>
      )}
    </div>
  );
}
