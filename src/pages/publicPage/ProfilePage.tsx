import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getOwnProfile } from "@/services/accounts/accountService";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/account";

const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getOwnProfile();
        setProfile(data);
      } catch {
        // handle error
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p className="p-6 text-center">Đang tải dữ liệu...</p>;
  }

  const roleName = profile?.role?.role_name;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <p className="text-xl font-semibold leading-none">
              {profile.full_name}
            </p>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p>{profile.bio}</p>
            <p>
              Ngày sinh:{" "}
              {profile.date_of_birth
                ? new Date(profile.date_of_birth).toLocaleDateString("vi-VN")
                : "Không có"}
            </p>

            <div className="flex gap-3 mt-3">
              {/* Role badge */}
              <Badge
                variant="outline"
                className={cn(
                  "px-4 py-1.5 text-sm border-none font-semibold",
                  getRoleStyle(roleName)
                )}
              >
                {roleName === "admin"
                  ? "Quản trị viên"
                  : roleName === "moderator"
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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
