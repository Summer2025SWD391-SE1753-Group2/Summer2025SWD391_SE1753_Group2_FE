import React, { useState, useEffect, useCallback } from "react";
import {
  getAllGroupChats,
  joinGroupChat,
  checkMembershipBatch,
} from "@/services/groupChat/groupChatService";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import type { AxiosError } from "axios";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface GroupChatSearchProps {
  token: string;
}

interface GroupChatSearchResult {
  group_id: string;
  group_name: string;
  group_description: string;
  leader_name: string;
  member_count: number;
  topic_name: string;
}

const PAGE_LIMIT = 5;

export default function GroupChatSearch({ token }: GroupChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<GroupChatSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  // Bỏ hasMore, dùng totalCount từ API
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Tính tổng số trang dựa vào tổng số kết quả
  const totalPages = Math.ceil(totalCount / PAGE_LIMIT);

  // Debounced fetch
  const doFetch = useCallback(
    debounce(async (term: string, pageNum = 1) => {
      setLoading(true);
      try {
        const skipParam = (pageNum - 1) * PAGE_LIMIT;
        const data = await getAllGroupChats({
          search: term,
          skip: skipParam,
          limit: PAGE_LIMIT,
          token,
        });
        const newGroups = data.groups || [];
        setGroups(newGroups);
        setTotalCount(
          typeof data.total === "number"
            ? data.total
            : data.total_count || newGroups.length
        );
        // Batch check membership
        if (newGroups.length > 0) {
          const memberships = await checkMembershipBatch(
            newGroups.map((g: GroupChatSearchResult) => g.group_id),
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
        setGroups([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }, 400),
    [token]
  );

  // Load group chat khi searchTerm thay đổi
  useEffect(() => {
    setPage(1);
    doFetch(searchTerm, 1);
    return doFetch.cancel;
  }, [searchTerm, doFetch]);

  // Load group chat khi page thay đổi
  useEffect(() => {
    if (page === 1) return;
    doFetch(searchTerm, page);
  }, [page, searchTerm, doFetch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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

  // Tạo array các trang để hiển thị
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else if (totalPages > 1) {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 w-5 h-5" />
        <input
          className="border border-blue-200 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-0 shadow bg-white placeholder-gray-400"
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
              className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl shadow-md p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-lg transition"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-700 transition">
                  {group.group_name}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Chủ đề: {group.topic_name}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Thành viên:{" "}
                  <span className="font-semibold text-gray-700">
                    {group.member_count}/50
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Chủ nhóm:{" "}
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

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-1 mt-8">
          {/* Previous button */}
          <button
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
              page === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 bg-white shadow-sm"
            }`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === "..." ? (
                  <span className="px-3 py-2 text-gray-400 select-none">
                    ...
                  </span>
                ) : (
                  <button
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${
                      pageNum === page
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 shadow-sm"
                    }`}
                    onClick={() => handlePageChange(pageNum as number)}
                    disabled={pageNum === page}
                  >
                    {pageNum}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 ${
              page === totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 bg-white shadow-sm"
            }`}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pagination info */}
      {totalCount > 0 && !loading && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Hiển thị {(page - 1) * PAGE_LIMIT + 1} -{" "}
          {Math.min(page * PAGE_LIMIT, totalCount)} của {totalCount} kết quả
        </div>
      )}
    </div>
  );
}
