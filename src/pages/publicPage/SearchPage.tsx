import { useEffect, useState } from "react";
import { useLocation, Link, useSearchParams } from "react-router-dom";
import { searchPostsByTitle, searchPostsByTag, searchPostsByTopic, getApprovedPosts } from "@/services/posts/postService";
import { searchUsersByUsername } from "@/services/accounts/accountService";
import { Post } from "@/types/post";
import { UserProfile } from "@/types/account";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const SearchPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tags = searchParams.get("tags")?.split(",").filter(tag => tag) || [];

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với loading
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  const fetchSearchResults = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    const skip = (page - 1) * postsPerPage;

    try {
      let postResults: Post[] = [];
      if (query.trim() || tags.length > 0) {
        if (tags.length > 0) {
          postResults = await searchPostsByTag(tags.join(","), skip, postsPerPage);
        }
        const [userResults, titleResults, topicResults] = await Promise.all([
          query.trim() ? searchUsersByUsername(query, skip, postsPerPage) : Promise.resolve([]),
          query.trim() ? searchPostsByTitle(query, skip, postsPerPage) : Promise.resolve([]),
          query.trim() ? searchPostsByTopic(query, skip, postsPerPage) : Promise.resolve([]),
        ]);
        const uniquePosts = Array.from(
          new Map([...titleResults, ...topicResults, ...postResults].map(post => [post.post_id, post])).values()
        );
        setUsers(userResults);
        setPosts(uniquePosts);
        setTotalPages(Math.ceil(uniquePosts.length / postsPerPage));

        if (uniquePosts.length === 0 && userResults.length === 0) {
          setError(`Không tìm thấy bài viết, người dùng hoặc chủ đề tương ứng`);
          const approvedPosts = await getApprovedPosts(skip, postsPerPage);
          setPosts(approvedPosts);
          setTotalPages(Math.ceil(approvedPosts.length / postsPerPage));
        }
      } else {
        const approvedPosts = await getApprovedPosts(skip, postsPerPage);
        setPosts(approvedPosts);
        setUsers([]);
        setTotalPages(Math.ceil(approvedPosts.length / postsPerPage));
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!");
      setPosts([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ gọi API khi trang load lần đầu hoặc thay đổi trang
    fetchSearchResults(currentPage);
  }, [currentPage, location.search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
        Kết quả tìm kiếm cho "{query || tags.join(", ")}"
      </h1>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-100 animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <CardContent className="p-3 flex flex-col items-center">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-center text-red-600 text-lg">{error}</p>}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.length > 0 && users.map(user => (
            <Card
              key={user.account_id}
              className="overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
            >
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <Avatar className="w-36 h-36 mb-4 rounded-full border-2 border-gray-100">
                  <AvatarImage src={user.avatar} alt={user.full_name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-gray-200">
                    {user.full_name && user.full_name.trim() !== "string"
                      ? user.full_name.split(" ").map(word => word[0]).join("").toUpperCase()
                      : user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link
                  to={`/profile/${encodeURIComponent(user.username)}`}
                  className="hover:underline text-center text-lg font-semibold text-gray-800"
                >
                  {user.full_name && user.full_name.trim() !== "string" ? user.full_name : user.username}
                </Link>
                <p className="text-sm text-gray-500 text-center mt-1">@{user.username}</p>
              </CardContent>
            </Card>
          ))}

          {posts.length > 0 && posts.map(post => (
            <Card
              key={post.post_id}
              className="overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white relative"
            >
              <div className="w-full h-48 absolute top-0 left-0">
                {post.images.length > 0 && (
                  <img
                    src={post.images[0].image_url}
                    alt={post.title}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                )}
              </div>
              <CardContent className="p-3 flex flex-col items-center relative z-10 bg-white bg-opacity-95 pt-48">
                <Link to={`/posts/${post.post_id}`} className="hover:underline">
                  <h3 className="font-semibold text-center text-lg text-gray-800 line-clamp-2">{post.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 text-center mt-1">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 text-center mt-1 line-clamp-1">{post.tags.map(tag => tag.name).join(", ") || "Không có thẻ"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-6 flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-100"}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-gray-100"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SearchPage;