import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getOwnProfile } from "@/services/accounts/accountService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/account";

// Icons
import { ShieldCheck, ShieldHalf, UserRound } from "lucide-react";

const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

// Thêm icon + class cho mỗi role
const getRoleInfo = (role: string) => {
  switch (role) {
    case "admin":
      return {
        label: "Quản trị viên",
        className: "bg-red-100 text-red-700",
        icon: <ShieldCheck className="w-4 h-4 mr-1" />,
      };
    case "moderator":
      return {
        label: "Kiểm duyệt viên",
        className: "bg-blue-100 text-blue-700",
        icon: <ShieldHalf className="w-4 h-4 mr-1" />,
      };
    default:
      return {
        label: "Thành viên",
        className: "bg-green-100 text-green-700",
        icon: <UserRound className="w-4 h-4 mr-1" />,
      };
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
  const roleInfo = getRoleInfo(roleName);

  return (
    <div>
      {/* Banner */}
      <Card className="h-40 p-6 border-0 rounded-none bg-gradient-to-t from-red-200 to-rose-300" />

      {/* Avatar + Info */}
      <div className="flex justify-start relative pl-30">
        <div className="flex items-center space-x-4 justify-between absolute -top-12">
          {/* Avatar */}
          <Avatar className="h-40 w-40 mb-4 border-4 border-white shadow-md">
            <AvatarImage src={profile.avatar} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>

          {/* Thông tin */}
          <div>
            <p className="text-xl font-semibold leading-none">@{profile.username}</p>


            <div className="flex gap-3 mt-3">
              {/* Role badge with icon */}
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
      </div>
      <div className="h-40" ></div>
      <div className="space-y-2 ml-30">
        <div className="text-xl leading-none">{profile.email}</div>
        <div className="text-xl leading-none">{profile.bio}</div>
      </div>

    </div>
  );
};

export default ProfilePage;
