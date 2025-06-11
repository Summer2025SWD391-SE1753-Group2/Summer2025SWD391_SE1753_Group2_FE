import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/store/layout/layoutStore";
import { useAuthStore } from "@/store/auth/authStore";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Link } from "react-router-dom";
import { Menu, LogIn, UserPlus } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { searchUsersByUsername } from "@/services/accounts/account-service";
import { searchPostsByTopic, searchPostsByTag, searchPostsByTitle } from "@/services/post/post-service";
import { UserProfile } from "@/types/user";
import { Post } from "@/types/post";

interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Topbar({ className, children, ...props }: TopbarProps) {
  const { toggleMobileMenu } = useLayoutStore();
  const { user, isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    postsByTitle: Post[];
    postsByTopic: Post[];
    postsByTag: Post[];
    users: UserProfile[];
  }>({ postsByTitle: [], postsByTopic: [], postsByTag: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setSuggestions({ postsByTitle: [], postsByTopic: [], postsByTag: [], users: [] });
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [postTitleResults, postTopicResults, postTagResults, userResults] = await Promise.all([
        searchPostsByTitle(query, 0, 5),
        searchPostsByTopic(query, 0, 5),
        searchPostsByTag(query, 0, 5),
        searchUsersByUsername(query, 0, 5),
      ]);
      setSuggestions({
        postsByTitle: postTitleResults,
        postsByTopic: postTopicResults,
        postsByTag: postTagResults,
        users: userResults,
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Không tìm thấy kết quả. Vui lòng thử!');
      setSuggestions({ postsByTitle: [], postsByTopic: [], postsByTag: [], users: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const clearSearch = () => {
    // Chỉ xóa suggestions và error, giữ nguyên query
    setSuggestions({ postsByTitle: [], postsByTopic: [], postsByTag: [], users: [] });
    setError(null);
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-1.5 flex h-16 items-center gap-3 border-b bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 px-4",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          🍲 Food Forum
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm bài viết hoặc người dùng (e.g., ăn kiêng, k)"
          className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 placeholder-gray-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {query && (
          <button
            onClick={() => {
              setQuery(''); // Xóa query khi nhấp vào nút "x"
              clearSearch();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <span className="text-xl">×</span>
          </button>
        )}
        {isLoading && <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500">Loading...</span>}
        {(error || suggestions.postsByTitle.length > 0 || suggestions.postsByTopic.length > 0 || suggestions.postsByTag.length > 0 || suggestions.users.length > 0) && (
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10 max-h-96 overflow-y-auto">
            {error && (
              <div className="p-2 text-red-500 text-sm">{error}</div>
            )}
            {suggestions.postsByTitle.length > 0 && (
              <div className="p-2 border-b">
                <span className="text-sm font-semibold text-gray-600">Bài viết (theo tiêu đề)</span>
                {suggestions.postsByTitle.map((post) => (
                  <Link
                    key={post.post_id}
                    to={`/posts/${post.post_id}`}
                    onClick={clearSearch} // Gọi clearSearch để đóng dropdown
                    className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {suggestions.postsByTopic.length > 0 && (
              <div className="p-2 border-b">
                <span className="text-sm font-semibold text-gray-600">Bài viết (theo chủ đề)</span>
                {suggestions.postsByTopic.map((post) => (
                  <Link
                    key={post.post_id}
                    to={`/posts/${post.post_id}`}
                    onClick={clearSearch} // Gọi clearSearch để đóng dropdown
                    className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {suggestions.postsByTag.length > 0 && (
              <div className="p-2 border-b">
                <span className="text-sm font-semibold text-gray-600">Bài viết (theo thẻ)</span>
                {suggestions.postsByTag.map((post) => (
                  <Link
                    key={post.post_id}
                    to={`/posts/${post.post_id}`}
                    onClick={clearSearch} // Gọi clearSearch để đóng dropdown
                    className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {suggestions.users.length > 0 && (
              <div className="p-2">
                <span className="text-sm font-semibold text-gray-600">Người dùng</span>
                {suggestions.users.map((user) => (
                  <Link
                    key={user.account_id}
                    to={`/profile/${user.username}`}
                    onClick={clearSearch} // Gọi clearSearch để đóng dropdown
                    className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{user.username}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              to={`/search?q=${encodeURIComponent(query)}`}
              onClick={clearSearch} // Gọi clearSearch để đóng dropdown
              className="block p-2 text-center text-blue-500 hover:bg-gray-100 cursor-pointer"
            >
              Xem thêm kết quả
            </Link>
          </div>
        )}
      </div>

      {/* Auth Section */}
      <div className="flex items-center gap-2">
        {isAuthenticated && user ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth/register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng ký</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}