import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfileByUsername } from "@/services/accounts/accountService";
import { sendFriendRequest } from "@/services/friends/friendService";
import { getUserPostsById } from "@/services/posts/postService"; // Use new function
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/account";
import { Post } from "@/types/post";
import { toast } from "sonner";

const getRoleStyle = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700";
    case "moderator":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-green-100 text-green-700";
  }
};

const getStatusStyle = (status: string) => {
  return status === "active" ? "bg-black text-white" : "bg-gray-300 text-gray-700";
};

export function PersonalPage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch profile
  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      if (!username) {
        setErrorProfile("Không tìm thấy tên người dùng");
        setLoadingProfile(false);
        return;
      }
      try {
        const data = await getProfileByUsername(username);
        setProfile(data);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "AbortError") return;
        setErrorProfile(error.message || "Không thể tải hồ sơ. Vui lòng thử lại.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => controller.abort();
  }, [username]);

  // Fetch posts by user's account_id
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile || !hasMore) return;
      setLoadingMyPosts(true);
      try {
        const postsData = await getUserPostsById(profile.account_id, page * 10, 10); // Use account_id
        setMyPosts((prev) => [...prev, ...postsData]);
        setHasMore(postsData.length === 10); // Assume no more posts if less than 10 are returned
      } catch (err: unknown) {
        const error = err as Error;
        setErrorPosts(error.message || "Không thể tải bài viết");
      } finally {
        setLoadingMyPosts(false);
      }
    };
    fetchPosts();
  }, [profile, page]);

  const handleAddFriend = async () => {
    if (!profile) return;
    try {
      await sendFriendRequest({ receiver_id: profile.account_id });
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Lỗi khi gửi lời mời kết bạn");
      console.error("Lỗi khi thêm bạn:", err);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const renderPost = (post: Post) => (
    <Link to={`/posts/${post.post_id}`} key={post.post_id} className="block">
      <Card
        className="w-64 overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="w-full h-60 overflow-hidden pt-0"> {/* Remove top padding */}
          <img
            src={post.images.length > 0 ? post.images[0].image_url : "/default-image.png"}
            alt={post.images[0]?.caption || "Hình ảnh bài viết"}
            className="w-full h-full object-cover"
            style={{ marginTop: 0 }} // Remove top margin
          />
        </div>
        <div className="pb-2 text-center"> {/* Keep bottom padding, no top padding */}
          <h3 className="text-sm font-semibold line-clamp-2">{post.title}</h3>
          {post.tags.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                #{post.tags[0].name}
              </Badge>
            </p>
          )}
          {post.topics.length > 0 && (
            <p className="text-xs text-gray-600 mt-1">{post.topics[0].name}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            Ngày tạo: {new Date(post.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </Card>
    </Link>
  );

  if (loadingProfile) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  if (errorProfile) return <div className="p-6 text-center text-red-500">{errorProfile}</div>;
  if (!profile) return <div className="p-6 text-center">Không tìm thấy hồ sơ</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1 w-[55%]">
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold leading-none">
                  {profile.full_name || profile.username}
                </p>
                {profile.email_verified && (
                  <span className="text-blue-500 text-xs">✔</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p>{profile.bio || "Chưa có tiểu sử"}</p>
              <p>
                Ngày sinh:{" "}
                {profile.date_of_birth
                  ? new Date(profile.date_of_birth).toLocaleDateString("vi-VN")
                  : "Không có"}
              </p>
              <div className="flex gap-3 mt-3">
                <Badge
                  variant="outline"
                  className={cn("px-4 py-1.5 text-sm border-none font-semibold", getRoleStyle(profile.role.role_name))}
                >
                  {profile.role.role_name === "admin" ? "Quản trị viên" : profile.role.role_name === "moderator" ? "Kiểm duyệt viên" : "Thành viên"}
                </Badge>
                <Badge className={cn("px-4 py-1.5 text-sm font-semibold", getStatusStyle(profile.status))}>
                  {profile.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
              <div className="mt-4">
                <Button
                  variant="default"
                  className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  onClick={handleAddFriend}
                  aria-label={`Thêm bạn ${profile.username}`}
                >
                  Thêm bạn
                </Button>
              </div>
            </div>
            <div className="w-[45%] flex justify-center">
              <img
                src={profile.avatar || "/default-profile-image.png"}
                alt={`Ảnh của ${profile.full_name || profile.username}`}
                className="h-auto max-h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/default-profile-image.png";
                }}
              />
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Bài viết đã tạo</h2>
          <div className="space-y-4">
            {loadingMyPosts && <div className="text-center">Đang tải bài viết...</div>}
            {errorPosts && <div className="text-center text-red-500">{errorPosts}</div>}
            {!loadingMyPosts && !errorPosts && myPosts.length === 0 && (
              <div className="text-center">Chưa có bài viết nào</div>
            )}
            {myPosts.map(renderPost)}
            {hasMore && !loadingMyPosts && (
              <Button onClick={handleLoadMore} className="mt-4">
                Tải thêm
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}