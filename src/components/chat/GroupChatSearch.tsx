import React, { useState, useEffect, useCallback } from "react";
import {
  searchGroupChats,
  joinGroupChat,
} from "@/services/groupChat/groupChatService";
import { toast } from "sonner";
// Nếu chưa cài: npm install lodash.debounce
import debounce from "lodash.debounce";

interface GroupChatSearchProps {
  token: string;
  joinedGroupIds: string[]; // List group user đã join (nếu có)
}

interface GroupChatSearchResult {
  group_id: string;
  group_name: string;
  group_description: string;
  leader_name: string;
  member_count: number;
}

export default function GroupChatSearch({
  token,
  joinedGroupIds,
}: GroupChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<GroupChatSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  const doSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setGroups([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchGroupChats(term, 0, 20, token);
        setGroups(data.groups || []);
      } catch {
        toast.error("Lỗi khi tìm kiếm group chat");
      } finally {
        setLoading(false);
      }
    }, 400),
    [token]
  );

  useEffect(() => {
    doSearch(searchTerm);
    return doSearch.cancel;
  }, [searchTerm, doSearch]);

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
        placeholder="Tìm group chat (tối thiểu 2 ký tự)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading && <div>Đang tìm kiếm...</div>}
      <ul className="space-y-3">
        {groups.map((group) => {
          const isJoined = joinedGroupIds.includes(group.group_id);
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
      {groups.length === 0 && searchTerm.length >= 2 && !loading && (
        <div className="text-gray-500 mt-4">
          Không tìm thấy group nào phù hợp.
        </div>
      )}
    </div>
  );
}
