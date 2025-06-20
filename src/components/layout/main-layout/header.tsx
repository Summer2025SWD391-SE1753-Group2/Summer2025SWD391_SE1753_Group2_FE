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
import { ChevronDown, Heart, LogOut, User, Sliders, Home, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  searchPostsByTitle,
  searchPostsByTag,
} from "@/services/posts/postService";
import { Post } from "@/types/post";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Post[]>([]);
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
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const postTitleResults = await searchPostsByTitle(query, 0, 5);
      setSuggestions(postTitleResults);
    } catch (error) {
      console.error("Search error:", error);
      setError("Không tìm thấy kết quả. Vui lòng thử lại!");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleTagSelect = async (tagName: string) => {
    setQuery(tagName);
    setIsLoading(true);
    setError(null);
    try {
      const postTagResults = await searchPostsByTag(tagName, 0, 5);
      setSuggestions(postTagResults);
    } catch (error) {
      console.error("Tag search error:", error);
      setError("Không tìm thấy bài viết với thẻ này!");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, handleSearch]);

  const clearSearch = () => {
    setSuggestions([]);
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
            <DropdownMenuContent className="w-48">
              {tags
                .filter((tag) => tag.status === "active")
                .map((tag) => (
                  <DropdownMenuItem
                    key={tag.tag_id}
                    onClick={() => handleTagSelect(tag.name)}
                  >
                    {tag.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                clearSearch();
              }}
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
          {(error || suggestions.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-background border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
              {error && <div className="p-2 text-red-500 text-sm">{error}</div>}
              {suggestions.length > 0 && (
                <div className="p-2 border-b">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Bài viết
                  </span>
                  {suggestions.map((post) => (
                    <Link
                      key={post.post_id}
                      to={`/posts/${post.post_id}`}
                      onClick={clearSearch}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
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
                to={`/search?q=${encodeURIComponent(query)}`}
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
            className={({ isActive }: { isActive: boolean }) =>
              `text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Home className="w-7 h-10" />
            <span className="sr-only">Trang chủ</span>
          </NavLink>
          <NavLink
            to={paths.user.favorites}
            className={({ isActive }: { isActive: boolean }) =>
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
                {user?.role?.role_name && (
  <DropdownMenuItem className="flex items-center gap-2">
    <Link
      to={
        paths[user.role.role_name as "user" | "moderator" | "admin"]
          ?.dashboard
      }
      className="flex items-center gap-2 w-full"
    >
      <LayoutDashboard className="h-4 w-4" />
      Quay lại dashboard
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
