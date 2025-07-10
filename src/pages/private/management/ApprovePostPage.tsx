import React, { useEffect, useState } from "react";
import type { Post } from "@/types/post";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPosts } from "@/services/posts/postService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

import { Pagination } from "@/components/ui/pagination";
import { PostFilter } from "@/components/management/PostFilter";
import { PostActions } from "@/components/management/PostActions";
import { PostSearch } from "@/components/management/PostSearch";

const PAGE_SIZE = 8;

const ApprovePostPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const moderatorId = user?.account_id || "";

  // Tính toán statistics
  const getStatistics = () => {
    const total = posts.length;
    const waiting = posts.filter((p) => p.status === "waiting").length;
    const approved = posts.filter((p) => p.status === "approved").length;
    const rejected = posts.filter((p) => p.status === "rejected").length;

    return { total, waiting, approved, rejected };
  };

  const stats = getStatistics();

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Tất cả bài viết trong hệ thống
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.waiting}
          </div>
          <p className="text-xs text-muted-foreground">Cần xem xét và duyệt</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.approved}
          </div>
          <p className="text-xs text-muted-foreground">
            Bài viết đã được phê duyệt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.rejected}
          </div>
          <p className="text-xs text-muted-foreground">Bài viết bị từ chối</p>
        </CardContent>
      </Card>
    </div>
  );

  const handleUpdatePostStatus = (
    id: string,
    status: "approved" | "rejected"
  ) => {
    setPosts((prev) =>
      prev.map((p) => (p.post_id === id ? { ...p, status } : p))
    );

    setFilteredPosts((prev) =>
      prev.map((p) => (p.post_id === id ? { ...p, status } : p))
    );
  };

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
    setCurrentPage(1);
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Danh sách bài viết chờ duyệt
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý và xem xét các bài viết đã được đăng
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <PostSearch
                onSearchResults={(results) => {
                  setFilteredPosts(results);
                  setCurrentPage(1);
                }}
                onReset={() => {
                  setFilteredPosts(posts);
                }}
              />
              <PostFilter onFilter={handleFilter} />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-900 w-[30%]">
                    Tiêu đề
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[15%]">
                    Tác giả
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[12%]">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[13%]">
                    Ngày tạo
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 text-center w-[30%]">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <PostActions
                    key={post.post_id}
                    post={post}
                    moderatorId={moderatorId}
                    updatePostStatus={handleUpdatePostStatus}
                  />
                ))}
                {paginatedPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-400 text-lg">📝</div>
                        <p className="text-gray-500">Không có bài viết nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovePostPage;
