import React, { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  getAllPosts, getPostById, moderatePost,
} from "@/services/posts/postService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";


import { Pagination } from "@/components/ui/pagination";
import { PostFilter } from "@/components/posts/PostFilter";
import { PostActions } from "@/components/posts/PostActions";
import { PostSearch } from "@/components/posts/PostSearch";

const PAGE_SIZE = 8;

const ApprovePostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const { user } = useAuthStore();
  const moderatorId = user?.account_id || "";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPosts();
      setPosts(data);
      setFilteredPosts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFilter = (status: string, sort: string) => {
    let updated = [...posts];

    if (status !== "all") {
      updated = updated.filter((p) => p.status === status);
    }

    updated.sort((a, b) =>
      sort === "newest"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setFilteredPosts(updated);
    setCurrentPage(1); // reset về trang đầu khi lọc
  };

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center">
        <h1 className="text-xl flex-1 font-semibold">Danh sách bài viết chờ duyệt</h1>
        <div className="mt-6 mr-4">
          <PostSearch
            onSearchResults={(results) => {
              setFilteredPosts(results);
              setCurrentPage(1);
            }}
            onReset={() => {
              setFilteredPosts(posts);
            }}
          />
        </div>
          <PostFilter onFilter={handleFilter} />
      </div>

      <div className="border-2 rounded-3xl p-2 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right pr-18">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map((post) => (
              <PostActions
                key={post.post_id}
                post={post}
                moderatorId={moderatorId}
                updatePostStatus={(id, status) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.post_id === id ? { ...p, status } : p
                    )
                  )
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-cente">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default ApprovePostPage;
