import React, { useState, useEffect, useCallback } from "react";
import {
  getAllGroupChats,
  joinGroupChat,
  checkMembershipBatch,
} from "@/services/groupChat/groupChatService";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import type { AxiosError } from "axios";
import { Search } from "lucide-react";

interface GroupChatSearchProps {
  token: string;
}

interface GroupChatSearchResult {
  group_id: string;
  group_name: string;
  group_description: string;
  leader_name: string;
  member_count: number;
  topic_name: string; // thêm dòng này
}

const PAGE_LIMIT = 50;

export default function GroupChatSearch({ token }: GroupChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<GroupChatSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});

  // Debounced fetch
  const doFetch = useCallback(
    debounce(async (term: string, skipParam = 0, append = false) => {
      setLoading(true);
      try {
        const data = await getAllGroupChats({
          search: term,
          skip: skipParam,
          limit: PAGE_LIMIT,
          token,
        });
        const newGroups = data.groups || [];
        const allGroups = append ? [...groups, ...newGroups] : newGroups;
        setGroups(allGroups);
        setHasMore(data.has_more || false);
        setSkip(skipParam + newGroups.length);
        // Batch check membership (dùng biến cục bộ, không phụ thuộc state)
        if (allGroups.length > 0) {
          const memberships = await checkMembershipBatch(
            allGroups.map((g: GroupChatSearchResult) => g.group_id),
            token
          );
          const map: Record<string, boolean> = {};
          memberships.forEach((m: { group_id: string; is_member: boolean }) => {
            map[m.group_id] = m.is_member;
          });
          setJoinedMap(map);
        } else {
          setJoinedMap({});
        }
      } catch {
        toast.error("Lỗi khi tải group chat");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 400),
    [token]
  );

  // Load group chat khi searchTerm thay đổi
  useEffect(() => {
    doFetch(searchTerm, 0, false);
    return doFetch.cancel;
  }, [searchTerm, doFetch]);

  const handleLoadMore = () => {
    doFetch(searchTerm, skip, true);
  };

  const handleJoin = async (groupId: string) => {
    try {
      await joinGroupChat(groupId, token);
      toast.success("Tham gia group thành công!");
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === groupId
            ? { ...g, member_count: g.member_count + 1 }
            : g
        )
      );
      setJoinedMap((prev) => ({ ...prev, [groupId]: true }));
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "isAxiosError" in err &&
        (err as AxiosError).isAxiosError &&
        ((err as AxiosError).response?.data as { detail?: string })?.detail
      ) {
        toast.error(
          ((err as AxiosError).response?.data as { detail?: string })?.detail ||
            "Lỗi khi tham gia group"
        );
      } else {
        toast.error("Lỗi khi tham gia group");
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-0 shadow-sm bg-white placeholder-gray-400"
          placeholder="Tìm tên group chat"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading && (
        <div className="flex justify-center items-center text-blue-500 font-medium py-8 animate-pulse">
          Đang tìm kiếm...
        </div>
      )}
      <ul className="space-y-5">
        {groups.map((group) => {
          const isJoined = joinedMap[group.group_id] === true;
          const isFull = group.member_count >= 50;
          return (
            <li
              key={group.group_id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-lg transition"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-gray-800 truncate">
                  {group.group_name}
                </div>
                <div className="text-xs text-blue-500 mt-1 font-medium">
                  Chủ đề: {group.topic_name}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Thành viên:{" "}
                  <span className="font-semibold text-gray-700">
                    {group.member_count}/50
                  </span>{" "}
                  &nbsp;|&nbsp; Chủ nhóm:{" "}
                  <span className="font-medium text-gray-600">
                    {group.leader_name}
                  </span>
                </div>
              </div>
              <button
                className={`w-full md:w-auto mt-2 md:mt-0 px-6 py-2 rounded-full font-semibold text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300
                  ${
                    isJoined
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isFull
                      ? "bg-red-100 text-red-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                  }
                `}
                disabled={isJoined || isFull}
                onClick={() => handleJoin(group.group_id)}
              >
                {isJoined
                  ? "Đã tham gia"
                  : isFull
                  ? "Đã đủ 50 người"
                  : "Tham gia"}
              </button>
            </li>
          );
        })}
      </ul>
      {groups.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-10 select-none">
          <span className="text-3xl mb-2">😕</span>
          <span className="font-medium">Không tìm thấy group nào phù hợp.</span>
        </div>
      )}
      {hasMore && !loading && (
        <button
          className="mt-8 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full py-2 font-semibold shadow-sm transition border border-blue-100"
          onClick={handleLoadMore}
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}
