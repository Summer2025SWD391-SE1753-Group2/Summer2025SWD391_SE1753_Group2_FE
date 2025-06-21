import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getFavoritePosts,
  removeFavoritePost,
} from "@/services/favorites/favoriteService";
import { Post } from "@/types/post";
import { paths } from "@/utils/constant/path";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function DetailFavoritePage() {
  const { favouriteId } = useParams<{ favouriteId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getFavoritePosts(favouriteId!, 0, 100);
      setPosts(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể lấy danh sách bài viết!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePost = async (post_id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này khỏi thư mục?")) return;

    try {
      await removeFavoritePost(favouriteId!, post_id);
      toast.success("Xóa bài viết thành công!");
      fetchPosts(); // Refresh post list
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể xóa bài viết!");
    }
  };

  useEffect(() => {
    if (favouriteId) {
      fetchPosts();
    }
  }, [favouriteId]);

  return (
    <div className="p-6">
      <div className="max-w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(paths.user.favorites)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết thư mục
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Danh sách bài viết trong thư mục yêu thích
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.post_id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex">
                    {/* Image preview */}
                    {post.images && post.images.length > 0 && (
                      <div className="w-40 h-32 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                        <img
                          src={post.images[0].image_url}
                          alt={post.images[0].caption || post.title}
                          className="w-full h-full object-cover aspect-[4/3] transform transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div
                            onClick={() =>
                              navigate(paths.postDetail.replace(":postId", post.post_id))
                            }
                            className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 cursor-pointer"
                          >
                            {post.title}
                          </div>

                          {post.content && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {post.content}
                            </p>
                          )}

                          {/* Tags preview */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.tag_id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>
                              Tác giả: {post.creator?.full_name || "Không rõ"}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(post.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePost(post.post_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Chưa có bài viết nào trong thư mục này.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Hãy thêm bài viết yêu thích từ trang chủ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
