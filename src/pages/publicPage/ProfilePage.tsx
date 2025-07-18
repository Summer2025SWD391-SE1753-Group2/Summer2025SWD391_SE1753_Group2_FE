import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import accountService from "@/services/accounts/accountService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/account";
import { Check, Crown, Loader2, Pencil, Shield, User } from "lucide-react";
import { GoogleUserSetup } from "@/components/auth/GoogleUserSetup";
import { getMyPosts } from "@/services/posts/postService";
import { Post } from "@/types/post";
import { Link } from "react-router-dom";
import { getFriendsList } from "@/services/friends/friendService";
import { Button } from "@/components/ui/button"; // Assuming Button is available

const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const getRoleInfo = (role: string) => {
  switch (role) {
    case "admin":
      return {
        label: "Quản trị viên",
        className: "bg-red-100 text-red-700",
        icon: <Crown className="w-4 h-4 mr-1" />,
      };
    case "moderator":
      return {
        label: "Kiểm duyệt viên",
        className: "bg-blue-100 text-blue-700",
        icon: <Shield className="w-4 h-4 mr-1" />,
      };
    default:
      return {
        label: "Thành viên",
        className: "bg-green-100 text-green-700",
        icon: <User className="w-4 h-4 mr-1" />,
      };
  }
};

const getStatusStyle = (status: string) => {
  return status === "active"
    ? "bg-black text-white"
    : "bg-gray-300 text-gray-700";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendCount, setFriendCount] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await accountService.getOwnProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    const fetchPosts = async () => {
      try {
        const data = await getMyPosts(0, 10);
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    const fetchFriendCount = async () => {
      try {
        const friends = await getFriendsList();
        setFriendCount(friends.length);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }
    };

    fetchProfile();
    fetchPosts();
    fetchFriendCount();
  }, []);

  if (!profile) {
    return (
      <div className="p-6 text-center min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const roleName = profile?.role?.role_name;
  const roleInfo = getRoleInfo(roleName);

  return (
    <div>
      {/* Banner */}
      <Card className="h-40 p-6 border-0 rounded-none bg-gradient-to-t from-red-200 to-rose-300" />

      {/* Avatar + Info */}
      <div className="flex justify-start relative pl-30">
        <div className="flex items-center space-x-4 justify-between absolute -top-12">
          <Avatar className="h-40 w-40 mb-4 border-4 border-white shadow-md">
            <AvatarImage
              src={profile.avatar ?? undefined}
              alt={profile.full_name ?? profile.username}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {getInitials(profile.full_name ?? profile.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold leading-none mt-10 mb-2">
              {profile.full_name || profile.username}
            </p>
            <div className="mt-1">
              <Link to={roleName === "moderator" ? "/moderator/setting" : "/user/friends"}>
                <Badge
                  variant="secondary"
                  className="bg-gray-700 text-white text-sm font-normal cursor-pointer"
                >
                  {friendCount} người bạn
                </Badge>
              </Link>
            </div>
            <div className="flex gap-3 mt-3">
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center px-4 py-1.5 text-sm border-none font-semibold",
                  roleInfo.className
                )}
              >
                {roleInfo.icon}
                {roleInfo.label}
              </Badge>
              <Badge
                className={cn(
                  "px-4 py-2 text-sm font-semibold flex items-center gap-1",
                  getStatusStyle(profile.status)
                )}
              >
                {profile.status === "active" ? (
                  <>
                    Hoạt động
                    <Check />
                  </>
                ) : (
                  <>Không hoạt động</>
                )}
              </Badge>
              <Link to={roleName === "moderator" ? "/moderator/setting" : "/user/setting"}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 text-white hover:brightness-110 rounded-md px-4 py-1.5 text-sm font-semibold border-none transition-all duration-200 flex items-center gap-1"
                >
                  <Pencil className="w-4 h-4" />
                  Chỉnh sửa trang cá nhân
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-40"></div>
      <div className="space-y-2 ml-30">
        <div className="text-xl leading-none">{profile.email}</div>
        <div className="text-xl leading-none">
          {profile.bio || "Chưa có tiểu sử"}
        </div>
      </div>

      {/* Google User Setup Section */}
      <div className="mt-8 ml-30">
        <GoogleUserSetup
          onComplete={() => {
            // Refresh profile data
            window.location.reload();
          }}
        />
      </div>
      {/* Posts Section */}
      <div className="mt-8 ml-12 mr-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Bài viết đã tạo</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-8 bg-gray-50 rounded-lg">
            Chưa có bài viết nào
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.post_id}>
                <Link
                  to={`/posts/${post.post_id}`}
                  className="block"
                >
                  <div className="flex items-start py-3 px-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={post.images.length > 0 ? post.images[0].image_url : "/placeholder-image.jpg"}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                      {post.topics.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">{post.topics[0].name}</p>
                      )}
                      {post.tags.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
                            #{post.tags[0].name}
                          </Badge>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Ngày tạo: {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;