import { useAuthStore } from "@/store/auth/authStore";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle } from "lucide-react";

export const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();

  const mockPosts = [
    {
      id: 1,
      title: "Cách làm bánh mì nướng muối ớt siêu ngon",
      author: "Nguyễn Văn A",
      content:
        "Hôm nay mình sẽ chia sẻ cách làm bánh mì nướng muối ớt cực kỳ đơn giản mà ai cũng có thể làm được tại nhà...",
      likes: 24,
      comments: 8,
      shares: 3,
      createdAt: "2 giờ trước",
    },
    {
      id: 2,
      title: "Bún bò Huế chuẩn vị miền Trung",
      author: "Trần Thị B",
      content:
        "Món bún bò Huế này được mình học từ bà ngoại, giữ nguyên hương vị truyền thống...",
      likes: 45,
      comments: 12,
      shares: 7,
      createdAt: "5 giờ trước",
    },
    {
      id: 3,
      title: "Salad rau củ giảm cân hiệu quả",
      author: "Lê Văn C",
      content:
        "Công thức salad này không chỉ ngon mà còn giúp bạn duy trì vóc dáng hoàn hảo...",
      likes: 18,
      comments: 5,
      shares: 2,
      createdAt: "1 ngày trước",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
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
          <Button className="bg-orange-600 hover:bg-orange-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Đăng công thức mới
          </Button>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockPosts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-800 dark:to-red-800 flex items-center justify-center">
              <span className="text-4xl">🍳</span>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="text-sm">
                Bởi {post.author} • {post.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
