import React, { useState, useEffect, useCallback } from "react";
import {
  getAllGroupChats,
  joinGroupChat,
  checkMembershipBatch,
} from "@/services/groupChat/groupChatService";
import { toast } from "sonner";
import debounce from "lodash.debounce";

interface GroupChatSearchProps {
  token: string;
}

interface GroupChatSearchResult {
  group_id: string;
  group_name: string;
  group_description: string;
  leader_name: string;
  member_count: number;
}

const PAGE_LIMIT = 20;

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
        "response" in err &&
        (err as any).response?.data?.detail
      ) {
        toast.error((err as any).response.data.detail);
      } else {
        toast.error("Lỗi khi tham gia group");
      }
    }
  };

  return (
    <div className="p-4">
      <input
        className="border rounded px-3 py-2 w-full mb-4"
        placeholder="Tìm group chat (có thể để trống hoặc bất kỳ độ dài nào)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <div>Đang tìm kiếm...</div>}
      <ul className="space-y-3">
        {groups.map((group) => {
          const isJoined = joinedMap[group.group_id] === true;
          const isFull = group.member_count >= 50;
          return (
            <li
              key={group.group_id}
              className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-bold">{group.group_name}</div>
                <div className="text-sm text-gray-500">
                  {group.group_description}
                </div>
                <div className="text-xs text-gray-400">
                  Thành viên: {group.member_count}/50 &nbsp;|&nbsp; Chủ nhóm:{" "}
                  {group.leader_name}
                </div>
              </div>
              <button
                className={`mt-2 md:mt-0 px-4 py-2 rounded font-semibold ${
                  isJoined
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : isFull
                    ? "bg-red-200 text-red-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
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
        <div className="text-gray-500 mt-4">
          Không tìm thấy group nào phù hợp.
        </div>
      )}
      {hasMore && !loading && (
        <button
          className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded py-2 font-semibold"
          onClick={handleLoadMore}
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}
