"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { UserProfile } from "@/types/user";
import {
  getOwnProfile,
  updateOwnProfile,
} from "@/services/accounts/account-service";
import { toast, Toaster } from "sonner";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getOwnProfile();
        setProfile(data);
        setForm({
          full_name: data.full_name,
          bio: data.bio,
          avatar: data.avatar,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Không thể load profile 😵‍💫");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const updated = await updateOwnProfile(form);
      setProfile(updated);
      toast.success("✅ Update thành công!");
    } catch (err) {
      console.error("Update fail:", err);
      toast.error("❌ Update thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!profile)
    return <p className="p-6 text-center">⏳ Đang load dữ liệu...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-4">👤 Trang cá nhân</h1>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="grid grid-cols-2 gap-4 py-4">
          <div>
            <strong>Username:</strong> {profile.username}
          </div>
          <div>
            <strong>Email:</strong> {profile.email}
          </div>

          <div>
            <strong>Status:</strong> {profile.status}
          </div>
          <div>
            <strong>Role:</strong> {profile.role.role_name}
          </div>
          <div>
            <strong>Email Verified:</strong>{" "}
            {profile.email_verified ? "✅" : "❌"}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {new Date(profile.created_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 py-6">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              name="full_name"
              value={form.full_name || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              name="bio"
              rows={3}
              value={form.bio || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              name="avatar"
              value={form.avatar || ""}
              onChange={handleChange}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang cập nhật..." : "💾 Lưu thay đổi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
