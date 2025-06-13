import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getFavoritePosts, removeFavoritePost } from '@/services/favorites/favoriteService';
import { Post } from '@/types/post';
import { paths } from '@/utils/constant/path';

export default function DetailFavoritePage() {
  const { favouriteId } = useParams<{ favouriteId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setIsLoading(true); // Start loading
    try {
      const data = await getFavoritePosts(favouriteId!, 0, 100);
      setPosts(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể lấy danh sách bài viết!');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleRemovePost = async (post_id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này khỏi thư mục?')) return;

    try {
      await removeFavoritePost(favouriteId!, post_id);
      alert('Xóa bài viết thành công!');
      fetchPosts(); // Refresh post list
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể xóa bài viết!');
    }
  };

  useEffect(() => {
    if (favouriteId) {
      fetchPosts();
    }
  }, [favouriteId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Danh Sách Bài Viết Yêu Thích</h1>
          <Button onClick={() => navigate(paths.favorites)}>Quay Lại</Button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.post_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                >
                  <span
                    className="cursor-pointer hover:underline text-lg font-medium"
                    onClick={() => navigate(paths.postDetail.replace(':postId', post.post_id))}
                  >
                    {post.title}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePost(post.post_id)}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có bài viết nào trong thư mục này.</p>
          )}
        </div>
      </div>
    </div>
  );
}