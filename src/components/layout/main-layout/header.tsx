import BrandLogo from "@/components/common/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { paths } from "@/utils/constant/path";
import { ChevronDown, Heart, LogOut, User, Sliders, Home, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { searchPostsByTitle, searchPostsByTag } from "@/services/posts/postService";
import { searchUsersByUsername } from "@/services/accounts/accountService";
import { Post } from "@/types/post";
import { UserProfile } from "@/types/account";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postSuggestions, setPostSuggestions] = useState<Post[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<
    { name: string; tag_id: string; status: string }[]
  >([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim() && selectedTags.length === 0) {
      setPostSuggestions([]);
      setUserSuggestions([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (selectedTags.length > 0) {
        // Gọi searchPostsByTag cho từng tag và gộp kết quả
        const postResultsPromises = selectedTags.map((tag) =>
          searchPostsByTag(tag, 0, 5)
        );
        const postResults = await Promise.all(postResultsPromises);
        // Gộp kết quả và loại bỏ trùng lặp dựa trên post_id
        const uniquePosts = Array.from(
          new Map(
            postResults
              .flat()
              .map((post) => [post.post_id, post])
          ).values()
        ).slice(0, 5); // Giới hạn 5 bài viết
        setPostSuggestions(uniquePosts);
        setUserSuggestions([]);
        if (uniquePosts.length === 0) {
          setError(
            `Không tìm thấy bài viết với các thẻ: ${selectedTags.join(", ")}.`
          );
        }
      } else {
        // Tìm kiếm theo tiêu đề và người dùng
        const [userResults, postTitleResults] = await Promise.all([
          searchUsersByUsername(query, 0, 5),
          searchPostsByTitle(query, 0, 5),
        ]);
        setUserSuggestions(userResults);
        setPostSuggestions(postTitleResults);
        if (userResults.length === 0 && postTitleResults.length === 0) {
          setError(`Không tìm thấy bài viết hoặc người dùng với "${query}".`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau!");
      setPostSuggestions([]);
      setUserSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedTags]);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
    setIsTagDropdownOpen(true);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, selectedTags, handleSearch]);

  const clearSearch = () => {
    setQuery("");
    setSelectedTags([]);
    setPostSuggestions([]);
    setUserSuggestions([]);
    setError(null);
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/tags/?skip=0&limit=100"
        );
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to={paths.home}>
          <BrandLogo />
        </Link>

        <div className="relative flex items-center w-full max-w-md mx-4">
          <DropdownMenu
            open={isTagDropdownOpen}
            onOpenChange={setIsTagDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Sliders className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 max-h-40 overflow-y-auto mt-2 bg-background border border-gray-200 rounded-md shadow-lg"
              align="start"
            >
              {tags
                .filter((tag) => tag.status === "active")
                .map((tag) => (
                  <DropdownMenuItem
                    key={tag.tag_id}
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      className="h-4 w-4"
                    />
                    <span>{tag.name}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1 flex items-center flex-wrap gap-2 p-2 border border-gray-300 rounded-full bg-background">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-2 py-1 rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, thẻ, hoặc người dùng..."
              className="flex-1 min-w-0 p-1 bg-transparent focus:outline-none placeholder-muted-foreground"
            />
          </div>
          {(query || selectedTags.length > 0) && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <span className="text-xl">×</span>
            </button>
          )}
          {isLoading && (
            <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              Loading...
            </span>
          )}
          {(error || postSuggestions.length > 0 || userSuggestions.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-background border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              {error && <div className="p-2 text-red-500 text-sm">{error}</div>}
              {userSuggestions.length > 0 && (
                <div className="p-2 border-b">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Người dùng
                  </span>
                  {userSuggestions.map((user) => (
                    <Link
                      key={user.account_id}
                      to={`/profile/${encodeURIComponent(user.username)}`}
                      onClick={clearSearch}
                      className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.full_name} />
                        <AvatarFallback>
                          {user.full_name && user.full_name.trim() !== "string"
                            ? user.full_name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()
                            : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.full_name && user.full_name.trim() !== "string"
                          ? user.full_name
                          : user.username}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        @{user.username}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {postSuggestions.length > 0 && (
                <div className="p-2 border-b">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Bài viết theo thẻ
                  </span>
                  {postSuggestions.map((post) => (
                    <Link
                      key={post.post_id}
                      to={`/posts/${post.post_id}`}
                      onClick={clearSearch}
                      className="block p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <span className="font-medium">{post.title}</span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to={`/search?q=${encodeURIComponent(
                  query
                )}&tags=${selectedTags.join(",")}`}
                onClick={clearSearch}
                className="block p-2 text-center text-primary hover:bg-gray-100 cursor-pointer"
              >
                Xem thêm kết quả
              </Link>
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <NavLink
            to={paths.home}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Home className="w-7 h-10" />
            <span className="sr-only">Trang chủ</span>
          </NavLink>
          <NavLink
            to={paths.favorites}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Heart className="w-7 h-10" />
            <span className="sr-only">Yêu thích</span>
          </NavLink>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.full_name} />
                    <AvatarFallback>
                      {user?.full_name
                        ? user.full_name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {user.full_name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {(user?.role?.role_name === "moderator" ||
                  user?.role?.role_name === "admin") && (
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Link
                      to={
                        paths[user.role.role_name as "moderator" | "admin"]
                          ?.dashboard || "/moderator"
                      }
                      className="flex items-center gap-2 w-full"
                    >
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="flex flex-col items-start w-full">
                  <Link
                    to={paths.profile}
                    className="flex items-center gap-2 w-full"
                  >
                    <User className="h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to={paths.login}>Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to={paths.register}>Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;