import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getOwnProfile, updateOwnProfile } from "@/services/accounts/accountService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/account";
import { toast } from "sonner";

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

const SettingPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    date_of_birth: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getOwnProfile();
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          bio: data.bio || "",
          date_of_birth: data.date_of_birth || "",
          email: data.email || "",
        });
      } catch {
        toast.error("Không thể tải dữ liệu.");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOwnProfile({
        full_name: form.full_name,
        bio: form.bio,
        date_of_birth: form.date_of_birth,
      });
      toast.success("Cập nhật thành công!");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  if (!profile) {
    return <p className="p-6 text-center">Đang tải dữ liệu...</p>;
  }

  const roleName = profile?.role?.role_name;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="p-6 rounded-2xl shadow-sm space-y-6">
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
              {profile.username}
            </p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>

            <div className="flex gap-3 mt-2">
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

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>

         
            <Input
              id="email"
              name="email"
              value={form.email}
              hidden
              className="bg-gray-100 cursor-not-allowed"
            />
        

          <div>
            <Label htmlFor="bio">Mô tả</Label>
            <Textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date_of_birth">Ngày sinh</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="mt-2">
            Lưu thay đổi
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SettingPage;
