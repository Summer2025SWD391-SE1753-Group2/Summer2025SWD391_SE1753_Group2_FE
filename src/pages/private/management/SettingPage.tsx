import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GoogleUserSetup } from "@/components/auth/GoogleUserSetup";
import accountService from "@/services/accounts/accountService";
import type { UserProfile, ProfileUpdateData } from "@/types/account";
import { User, Shield, Key, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SettingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await accountService.getOwnProfile();
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone_number || "",
          date_of_birth: data.date_of_birth || "",
          bio: data.bio || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone_number || "",
        date_of_birth: profile.date_of_birth || "",
        bio: profile.bio || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Convert null to undefined for API compatibility
      const dataToSend = {
        ...formData,
        email: formData.email === null ? undefined : formData.email,
        full_name: formData.full_name === null ? undefined : formData.full_name,
        phone: formData.phone === null ? undefined : formData.phone,
        date_of_birth:
          formData.date_of_birth === null ? undefined : formData.date_of_birth,
        bio: formData.bio === null ? undefined : formData.bio,
        avatar: formData.avatar === null ? undefined : formData.avatar,
        background_url:
          formData.background_url === null
            ? undefined
            : formData.background_url,
      };
      const updatedProfile = await accountService.updateOwnProfile(dataToSend);
      setProfile(updatedProfile);
      setEditing(false);
      toast.success("Cập nhật profile thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Cập nhật profile thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Tài khoản
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Google OAuth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin tài khoản
                </div>
                {!editing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button onClick={handleSave} size="sm" disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <p className="text-lg font-semibold">@{profile.username}</p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {editing ? (
                      <Input
                        id="email"
                        value={formData.email ?? ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="Nhập email"
                      />
                    ) : (
                      <p className="text-lg">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="full_name">Họ và tên</Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name ?? ""}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.full_name || "Chưa có"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone ?? ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.phone_number || "Chưa có"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                    {editing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth ?? ""}
                        onChange={(e) =>
                          handleInputChange("date_of_birth", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Chưa có"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <p className="text-lg capitalize">
                      {profile.role.role_name === "admin"
                        ? "Quản trị viên"
                        : profile.role.role_name === "moderator"
                        ? "Kiểm duyệt viên"
                        : "Thành viên"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Tiểu sử</Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio ?? ""}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Nhập tiểu sử"
                        rows={3}
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.bio || "Chưa có tiểu sử"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Số bạn bè</Label>
                    <p className="text-lg">{profile.friend_count || 0}</p>
                  </div>

                  <div>
                    <Label>Ngày tạo</Label>
                    <p className="text-lg">
                      {new Date(profile.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bảo mật tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Xác thực email</h3>
                <p className="text-muted-foreground">
                  Trạng thái xác thực email của bạn
                </p>
                <div className="flex items-center gap-2">
                  {profile?.email_verified ? (
                    <span className="text-green-600 font-medium">
                      ✓ Email đã được xác thực
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      ⚠ Email chưa được xác thực
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Xác thực số điện thoại
                </h3>
                <p className="text-muted-foreground">
                  Trạng thái xác thực số điện thoại của bạn
                </p>
                <div className="flex items-center gap-2">
                  {profile?.phone_verified ? (
                    <span className="text-green-600 font-medium">
                      ✓ Số điện thoại đã được xác thực
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      ⚠ Số điện thoại chưa được xác thực
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
                <p className="text-muted-foreground">
                  Cập nhật mật khẩu tài khoản của bạn
                </p>
                <p className="text-sm text-muted-foreground">
                  Tính năng này có sẵn trong tab "Google OAuth" nếu bạn là người
                  dùng Google
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Thiết lập Google OAuth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleUserSetup
                onComplete={() => {
                  // Refresh profile data
                  window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
