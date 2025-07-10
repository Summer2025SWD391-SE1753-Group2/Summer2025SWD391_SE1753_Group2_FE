import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getApprovedPosts } from "@/services/posts/postService";
import type { Post } from "@/types/post";
import { useAuthStore } from "@/stores/auth";
import { HomePostCard } from "@/components/posts/HomePostCard";
import { paths } from "@/utils/constant/path";

export const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getApprovedPosts(0, 20); // Get first 20 approved posts
        setPosts(response || []); // API trả về array trực tiếp
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể tải bài viết";
        toast.error(errorMessage);
        setPosts([]); // Không fallback về mock data nữa
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-6 justify-start">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-6">
        <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-2">
          {isAuthenticated && user
            ? `Chào mừng ${user.full_name}! 👋`
            : "Chào mừng đến với Food Forum! 🍜"}
        </h1>
        <p className="text-orange-700 dark:text-orange-200 mb-4">
          {isAuthenticated
            ? "Khám phá và chia sẻ những công thức nấu ăn tuyệt vời cùng cộng đồng!"
            : "Đăng nhập để tham gia cộng đồng chia sẻ công thức nấu ăn!"}
        </p>
        {isAuthenticated && user && (
          <div className="flex gap-2">
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link to={paths.user.createPost}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Đăng công thức mới
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={paths.user.dashboard}>Quản lý bài viết</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Posts Feed */}

      <div className="max-w-3xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center  p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-2">Đang tải bài viết...</span>
          </div>
        ) : posts.length === 0 ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ công thức!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <HomePostCard key={post.post_id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Guest CTA */}
      {!isAuthenticated && (
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">
              Tham gia cộng đồng ngay hôm nay!
            </h3>
            <p className="text-muted-foreground mb-4">
              Đăng ký để chia sẻ công thức, bình luận và kết nối với những người
              yêu thích nấu ăn khác.
            </p>
            <div className="space-x-2">
              <Button asChild variant="outline">
                <Link to="/auth/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Đăng ký ngay</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
