import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FindFriends } from "@/components/friends/FindFriends";
import { PendingRequests } from "@/components/friends/PendingRequests";
import { FriendsPage } from "./FriendsPage";

export function FriendManagementPage() {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Quản lý bạn bè</h1>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">Danh sách bạn bè</TabsTrigger>
              <TabsTrigger value="find">Tìm kiếm bạn bè</TabsTrigger>
              <TabsTrigger value="requests">Lời mời kết bạn</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-6">
              <FriendsPage />
            </TabsContent>

            <TabsContent value="find" className="mt-6">
              <FindFriends />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <PendingRequests />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
