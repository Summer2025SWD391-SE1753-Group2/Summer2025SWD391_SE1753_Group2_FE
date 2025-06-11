import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfileByUsername } from "@/services/accounts/account-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user";

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
  return status === "active"
    ? "bg-black text-white"
    : "bg-gray-300 text-gray-700";
};

export function PersonalPage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProfile = async () => {
      if (!username) {
        setError("Không tìm thấy tên người dùng");
        setLoading(false);
        return;
      }
      try {
        const data = await getProfileByUsername(username);
        setProfile(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Không thể tải hồ sơ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => controller.abort();
  }, [username]);

  const handleAddFriend = async () => {
    try {
      // Giả sử có API addFriend
      await addFriend(profile!.username);
      setProfile((prev) => (prev ? { ...prev, friends: (prev.friends || 0) + 1 } : null));
    } catch (err) {
      console.error("Lỗi khi thêm bạn:", err);
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-6 text-center">Không tìm thấy hồ sơ</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-6">
            {/* Info */}
            <div className="space-y-1 w-[55%]">
              <div className="flex items-center gap-1">
                <p className="text-xl font-semibold leading-none">{profile.full_name}</p>
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
              <p className="text-sm text-gray-500">
                {(profile.friends || 0).toLocaleString()} bạn bè
              </p>

              <div className="flex gap-3 mt-3">
                {/* Role badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "px-4 py-1.5 text-sm border-none font-semibold",
                    getRoleStyle(profile.role.role_name)
                  )}
                >
                  {profile.role.role_name === "admin"
                    ? "Quản trị viên"
                    : profile.role.role_name === "moderator"
                    ? "Kiểm duyệt viên"
                    : "Thành viên"}
                </Badge>

                {/* Status badge */}
                <Badge
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold",
                    getStatusStyle(profile.status)
                  )}
                >
                  {profile.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>

              {/* Add Friend Button */}
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

            {/* Image Section */}
            <div className="w-[45%] flex justify-center ">
              <img
                src={profile.avatar || "/default-profile-image.png"}
                alt={`Ảnh của ${profile.full_name}`}
                className="h-auto max-h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/default-profile-image.png";
                }}
              />
            </div>
          </div>
        </Card>
        <div className="text-center text-gray-500 text-sm mt-2">
          Đã tạo · Đã lưu
        </div>
      </div>
    </div>
  );
}