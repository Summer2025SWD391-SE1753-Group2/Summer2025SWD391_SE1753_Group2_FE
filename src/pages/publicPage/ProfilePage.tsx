import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getOwnProfile } from "@/services/accounts/accountService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/account";
import { Check, Crown, Shield, User } from "lucide-react";
import { getMyPosts } from "@/services/posts/postService";
import { Post } from "@/types/post";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getOwnProfile();
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

    fetchProfile();
    fetchPosts();
  }, []);

  if (!profile) {
    return <p className="p-6 text-center">Đang tải dữ liệu...</p>;
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
            <AvatarImage src={profile.avatar} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold leading-none">@{profile.username}</p>
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
                  "px-4 py-1.5 text-sm font-semibold flex items-center gap-1",
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
            </div>
          </div>
        </div>
      </div>
      <div className="h-40"></div>
      <div className="space-y-2 ml-12">
        <div className="text-xl leading-none">{profile.email}</div>
        <div className="text-xl leading-none">{profile.bio}</div>
      </div>

      {/* Posts Section */}
      <div className="mt-8 ml-12">
        <h2 className="text-lg font-semibold mb-4">Bài viết đã tạo</h2>
        <div className="flex gap-4">
          {posts.map((post) => (
            <Link
              to={`/posts/${post.post_id}`}
              key={post.post_id}
            >
              <Card
                className="w-64 overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
                style={{ margin: 0, padding: 0 }}
              >
                <div className="w-full h-60 overflow-hidden">
                  <img
                    src={post.images.length > 0 ? post.images[0].image_url : "/placeholder-image.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    style={{ marginTop: 0 }}
                  />
                </div>
                <div className="pb-2 text-center">
                  <h3 className="text-sm font-semibold line-clamp-2">{post.title}</h3>
                  {post.topics.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">{post.topics[0].name}</p>
                  )}
                  {post.tags.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        #{post.tags[0].name}
                      </Badge>
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Ngày tạo: {formatDate(post.created_at)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;