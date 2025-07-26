import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import accountService from "@/services/accounts/accountService";
import type { UserProfile, ProfileUpdateData } from "@/types/account";
import { User, Shield, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getFriendsList } from "@/services/friends/friendService";
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
  const [friendCount, setFriendCount] = useState<number>(0);

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

    const fetchFriendCount = async () => {
      try {
        const friends = await getFriendsList();
        setFriendCount(friends.length);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }
    };

    fetchFriendCount();
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Cài đặt tài khoản
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-16 p-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl">
            <TabsTrigger
              value="account"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-slate-600 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50"
            >
              <User className="w-4 h-4" />
              Tài khoản
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-slate-600 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50"
            >
              <Shield className="w-4 h-4" />
              Bảo mật
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100/50 p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                <CardTitle className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Thông tin tài khoản
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Quản lý thông tin cá nhân của bạn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!editing ? (
                      <Button
                        onClick={handleEdit}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl px-6 py-2.5"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          size="sm"
                          className="border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-200 px-4 py-2.5"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSave}
                          size="sm"
                          disabled={saving}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white border-0 shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl px-4 py-2.5"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Đang lưu..." : "Lưu"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Tên đăng nhập
                      </Label>
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <p className="text-lg font-semibold text-slate-800">
                          @{profile.username}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Email
                      </Label>
                      {editing ? (
                        <Input
                          id="email"
                          value={formData.email ?? ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Nhập email"
                          className="h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-lg text-slate-800">
                            {profile.email}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Họ và tên
                      </Label>
                      {editing ? (
                        <Input
                          id="full_name"
                          value={formData.full_name ?? ""}
                          onChange={(e) =>
                            handleInputChange("full_name", e.target.value)
                          }
                          placeholder="Nhập họ và tên"
                          className="h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-lg text-slate-800">
                            {profile.full_name || "Chưa có"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Số điện thoại
                      </Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={formData.phone ?? ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Nhập số điện thoại"
                          className="h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-lg text-slate-800">
                            {profile.phone_number || "Chưa có"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="date_of_birth"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Ngày sinh
                      </Label>
                      {editing ? (
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth ?? ""}
                          onChange={(e) =>
                            handleInputChange("date_of_birth", e.target.value)
                          }
                          className="h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-lg text-slate-800">
                            {profile.date_of_birth
                              ? new Date(
                                  profile.date_of_birth
                                ).toLocaleDateString("vi-VN")
                              : "Chưa có"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Vai trò
                      </Label>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-lg font-semibold text-blue-800 capitalize">
                          {profile.role.role_name === "admin"
                            ? "Quản trị viên"
                            : profile.role.role_name === "moderator"
                            ? "Kiểm duyệt viên"
                            : "Thành viên"}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label
                        htmlFor="bio"
                        className="text-sm font-semibold text-slate-600 uppercase tracking-wide"
                      >
                        Tiểu sử
                      </Label>
                      {editing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio ?? ""}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          placeholder="Nhập tiểu sử"
                          rows={3}
                          className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                        />
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                          <p className="text-lg text-slate-800 leading-relaxed">
                            {profile.bio || "Chưa có tiểu sử"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Số bạn bè
                      </Label>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <p className="text-lg font-semibold text-green-800">
                          {friendCount}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Ngày tạo
                      </Label>
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <p className="text-lg text-slate-800">
                          {new Date(profile.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-b border-red-100/50 p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5"></div>
                <CardTitle className="relative flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Bảo mật tài khoản
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Cài đặt bảo mật và xác thực
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Xác thực email
                  </h3>
                  <p className="text-slate-600">
                    Trạng thái xác thực email của bạn
                  </p>
                  <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed">
                    {profile?.email_verified ? (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                        <span className="font-semibold">
                          Email đã được xác thực
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-amber-600">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          ⚠
                        </div>
                        <span className="font-semibold">
                          Email chưa được xác thực
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Xác thực số điện thoại
                  </h3>
                  <p className="text-slate-600">
                    Trạng thái xác thực số điện thoại của bạn
                  </p>
                  <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed">
                    {profile?.phone_verified ? (
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                        <span className="font-semibold">
                          Số điện thoại đã được xác thực
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-amber-600">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          ⚠
                        </div>
                        <span className="font-semibold">
                          Số điện thoại chưa được xác thực
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-slate-600">
                    Cập nhật mật khẩu tài khoản của bạn
                  </p>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      Tính năng này có sẵn trong tab "Google OAuth" nếu bạn là
                      người dùng Google
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
