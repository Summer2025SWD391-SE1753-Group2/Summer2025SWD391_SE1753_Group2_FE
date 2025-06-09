import { useAuthStore } from "@/store/auth/authStore";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { toast } from "sonner";
import type { Post } from "@/types/post";

export const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();

  // Mock posts data
  const mockPosts: Post[] = [
    {
      post_id: "1",
      title: "Cách làm phở bò ngon đúng điệu Hà Nội",
      content:
        "Phở bò là món ăn truyền thống của Việt Nam, đặc biệt là Hà Nội. Để có một tô phở ngon, quan trọng nhất là nước dùng phải được ninh từ xương bò trong nhiều giờ...",
      status: "approved",
      tags: [
        { tag_id: "1", name: "Món Việt", status: "active" },
        { tag_id: "2", name: "Món chính", status: "active" },
      ],
      topics: [{ topic_id: "1", name: "Món truyền thống", status: "active" }],
      materials: [
        {
          material_id: "1",
          material: {
            material_id: "1",
            name: "Xương bò",
            description: "Xương bò tươi để ninh nước dùng",
            default_unit: "kg",
            category: "thit",
            status: "active",
          },
          quantity: 2,
          unit: "kg",
          notes: "Chọn xương có tủy",
        },
        {
          material_id: "2",
          material: {
            material_id: "2",
            name: "Bánh phở",
            description: "Bánh phở tươi",
            default_unit: "gram",
            category: "hat_lua",
            status: "active",
          },
          quantity: 500,
          unit: "gram",
        },
        {
          material_id: "3",
          material: {
            material_id: "3",
            name: "Thịt bò tái",
            description: "Thịt bò thăn tươi",
            default_unit: "gram",
            category: "thit",
            status: "active",
          },
          quantity: 300,
          unit: "gram",
          notes: "Thái lát mỏng",
        },
        {
          material_id: "4",
          material: {
            material_id: "4",
            name: "Hành lá",
            description: "Hành lá tươi",
            default_unit: "bo",
            category: "rau_cu",
            status: "active",
          },
          quantity: 2,
          unit: "bo",
          notes: "Thái nhỏ",
        },
        {
          material_id: "5",
          material: {
            material_id: "5",
            name: "Nước mắm",
            description: "Nước mắm Phú Quốc",
            default_unit: "muong_canh",
            category: "nuoc_tuong",
            status: "active",
          },
          quantity: 3,
          unit: "muong_canh",
        },
      ],
      images: [
        {
          image_id: "1",
          image_url:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
          caption: "Tô phở bò nóng hổi",
        },
      ],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      created_by: "user123",
      creator: {
        username: "chef_anna",
        full_name: "Anna Nguyễn",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      post_id: "2",
      title: "Cách làm bánh mì kẹp thịt nướng chuẩn vị Sài Gòn",
      content:
        "Bánh mì Việt Nam nổi tiếng khắp thế giới với vỏ bánh giòn tan và nhân thịt nướng thơm ngon. Hôm nay mình sẽ hướng dẫn các bạn cách làm từ A-Z...",
      status: "waiting",
      tags: [
        { tag_id: "3", name: "Món Việt", status: "active" },
        { tag_id: "4", name: "Ăn sáng", status: "active" },
      ],
      topics: [{ topic_id: "2", name: "Đồ nướng", status: "active" }],
      materials: [
        {
          material_id: "6",
          material: {
            material_id: "6",
            name: "Thịt heo",
            description: "Thịt heo vai",
            default_unit: "gram",
            category: "thit",
            status: "active",
          },
          quantity: 500,
          unit: "gram",
          notes: "Thái miếng vừa ăn",
        },
        {
          material_id: "7",
          material: {
            material_id: "7",
            name: "Bánh mì",
            description: "Bánh mì que tươi",
            default_unit: "qua",
            category: "hat_lua",
            status: "active",
          },
          quantity: 4,
          unit: "qua",
        },
        {
          material_id: "8",
          material: {
            material_id: "8",
            name: "Đường",
            description: "Đường cát trắng",
            default_unit: "muong_canh",
            category: "gia_vi",
            status: "active",
          },
          quantity: 2,
          unit: "muong_canh",
        },
        {
          material_id: "9",
          material: {
            material_id: "9",
            name: "Tỏi",
            description: "Tỏi tươi",
            default_unit: "cu",
            category: "rau_cu",
            status: "active",
          },
          quantity: 3,
          unit: "cu",
          notes: "Băm nhuyễn",
        },
      ],
      images: [
        {
          image_id: "2",
          image_url:
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop",
          caption: "Bánh mì thịt nướng",
        },
      ],
      created_at: "2024-01-16T14:20:00Z",
      updated_at: "2024-01-16T14:20:00Z",
      created_by: "user456",
      creator: {
        username: "foodie_saigon",
        full_name: "Minh Tuấn",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      post_id: "3",
      title: "Bí quyết làm gỏi cuốn tôm thịt ngon như ngoài hàng",
      content:
        "Gỏi cuốn là món ăn nhẹ rất được yêu thích, đặc biệt trong những ngày hè oi ả. Với nguyên liệu đơn giản và cách làm không quá phức tạp...",
      status: "rejected",
      rejection_reason:
        "Hình ảnh không rõ nét, vui lòng cập nhật ảnh chất lượng cao hơn",
      tags: [
        { tag_id: "5", name: "Món Việt", status: "active" },
        { tag_id: "6", name: "Healthy", status: "active" },
      ],
      topics: [{ topic_id: "3", name: "Gỏi salad", status: "active" }],
      materials: [
        {
          material_id: "10",
          material: {
            material_id: "10",
            name: "Tôm sú",
            description: "Tôm sú tươi",
            default_unit: "gram",
            category: "ca",
            status: "active",
          },
          quantity: 300,
          unit: "gram",
          notes: "Luộc chín",
        },
        {
          material_id: "11",
          material: {
            material_id: "11",
            name: "Thịt heo luộc",
            description: "Thịt heo ba chỉ",
            default_unit: "gram",
            category: "thit",
            status: "active",
          },
          quantity: 200,
          unit: "gram",
          notes: "Thái lát mỏng",
        },
        {
          material_id: "12",
          material: {
            material_id: "12",
            name: "Bánh tráng",
            description: "Bánh tráng mỏng",
            default_unit: "mieng",
            category: "hat_lua",
            status: "active",
          },
          quantity: 20,
          unit: "mieng",
        },
        {
          material_id: "13",
          material: {
            material_id: "13",
            name: "Rau xà lách",
            description: "Rau xà lách tươi",
            default_unit: "la",
            category: "rau_cu",
            status: "active",
          },
          quantity: 10,
          unit: "la",
          notes: "Rửa sạch",
        },
      ],
      images: [
        {
          image_id: "3",
          image_url:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
          caption: "Gỏi cuốn tôm thịt",
        },
      ],
      created_at: "2024-01-17T09:15:00Z",
      updated_at: "2024-01-17T16:45:00Z",
      created_by: "user789",
      creator: {
        username: "mom_kitchen",
        full_name: "Lan Anh",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      },
    },
  ];

  const handlePostAction = (action: string, postId: string) => {
    toast.success(`${action} bài viết ${postId}`);
  };

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
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link to="/posts/create">
              <PlusCircle className="w-4 h-4 mr-2" />
              Đăng công thức mới
            </Link>
          </Button>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Bài viết mới nhất</h2>
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              onLike={() => handlePostAction("Đã thích", post.post_id)}
              onComment={() => handlePostAction("Đã bình luận", post.post_id)}
              onShare={() => handlePostAction("Đã chia sẻ", post.post_id)}
              onBookmark={() => handlePostAction("Đã lưu", post.post_id)}
            />
          ))}
        </div>
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
