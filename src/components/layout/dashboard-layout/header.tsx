import { Bell, Crown, Repeat, Shield, Sliders, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  searchPostsByTitle,
  searchPostsByTag,
  searchPostsByTopic,
} from "@/services/posts/postService";
import { searchUsersByUsername } from "@/services/accounts/accountService";
import { getAllTags } from "@/services/tags/tagsService";
import { Post } from "@/types/post";
import { UserProfile } from "@/types/account";
import { useRoleStore } from '@/stores/roleStore';

const DashboardHeader = () => {
  const { user } = useAuthStore();
  const { tempRole, setTempRole } = useRoleStore();

  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postSuggestions, setPostSuggestions] = useState<Post[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<{ name: string; tag_id: string; status: string }[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map((word) => word[0]).join('').toUpperCase();
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
        const postResultsPromises = selectedTags.map((tag) => searchPostsByTag(tag, 0, 5));
        const postResults = await Promise.all(postResultsPromises);
        const uniquePosts = Array.from(
          new Map(postResults.flat().map((post) => [post.post_id, post])).values()
        ).slice(0, 5);
        setPostSuggestions(uniquePosts);
        setUserSuggestions([]);
        if (uniquePosts.length === 0) {
          setError(`Không tìm thấy bài viết với các thẻ: ${selectedTags.join(', ')}.`);
        }
      } else {
        const [userResults, postTitleResults, postTopicResults] = await Promise.all([
          searchUsersByUsername(query, 0, 5),
          searchPostsByTitle(query, 0, 5),
          searchPostsByTopic(query, 0, 5),
        ]);

        const uniquePosts = Array.from(
          new Map([...postTitleResults, ...postTopicResults].map((post) => [post.post_id, post])).values()
        ).slice(0, 5);

        setUserSuggestions(userResults);
        setPostSuggestions(uniquePosts);
        if (userResults.length === 0 && uniquePosts.length === 0) {
          setError(`Không tìm thấy bài viết, chủ đề, hoặc người dùng với "${query}".`);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau!');
      setPostSuggestions([]);
      setUserSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedTags]);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else if (prev.length < 3) {
        return [...prev, tagName];
      }
      return prev;
    });
    setIsTagDropdownOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedTags([]);
    setPostSuggestions([]);
    setUserSuggestions([]);
    setError(null);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, selectedTags, handleSearch]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getAllTags(0, 100);
        setTags(data.tags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      }
    };
    fetchTags();
  }, []);

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', className: 'bg-red-100 text-red-700', icon: <Crown className="w-4 h-4 mr-1" /> };
      case 'moderator':
        return { label: 'Kiểm duyệt viên', className: 'bg-blue-100 text-blue-700', icon: <Shield className="w-4 h-4 mr-1" /> };
      default:
        return { label: 'Thành viên', className: 'bg-green-100 text-green-700', icon: <User className="w-4 h-4 mr-1" /> };
    }
  };

  const roleInfo = getRoleInfo(tempRole || 'user');

  const handleRoleChange = () => {
    if (user?.role?.role_name === 'moderator') {
      const newRole = tempRole === 'user' ? 'moderator' : 'user';
      setTempRole(newRole);
    }
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          <div className="relative flex items-center w-full max-w-md">
            <DropdownMenu open={isTagDropdownOpen} onOpenChange={setIsTagDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Sliders className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 max-h-40 overflow-y-auto mt-2 bg-background border border-gray-200 rounded-md shadow-lg"
                align="start"
              >
                {(Array.isArray(tags) ? tags : [])
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
                        disabled={
                          selectedTags.length >= 3 &&
                          !selectedTags.includes(tag.name)
                        }
                      />
                      <span>{tag.name}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1 flex items-center flex-wrap gap-2 p-2 border border-gray-300 rounded-full bg-background">
              {selectedTags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
                  {tag}
                  <button onClick={() => handleTagToggle(tag)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={selectedTags.length > 0 ? '' : 'Tìm kiếm bài viết, thẻ, hoặc người dùng...'}
                className="flex-1 min-w-0 p-1 bg-transparent focus:outline-none placeholder-muted-foreground"
              />
            </div>
            {(query || selectedTags.length > 0) && (
              <button onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                    <span className="text-sm font-semibold text-muted-foreground">Người dùng</span>
                    {userSuggestions.map((user) => (
                      <Link
                        key={user.account_id}
                        to={`/profile/${encodeURIComponent(user.username)}`}
                        onClick={clearSearch}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || ''} alt={user.full_name || ''} />
                          <AvatarFallback>
                            {user.full_name && user.full_name.trim() !== 'string'
                              ? user.full_name.split(' ').map((word) => word[0]).join('').toUpperCase()
                              : user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.full_name && user.full_name.trim() !== 'string' ? user.full_name : user.username}
                        </span>
                        <span className="text-muted-foreground text-sm">@{user.username}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {postSuggestions.length > 0 && (
                  <div className="p-2 border-b">
                    <span className="text-sm font-semibold text-muted-foreground">Bài viết</span>
                    {postSuggestions.map((post) => (
                      <Link
                        key={post.post_id}
                        to={`/posts/${post.post_id}`}
                        onClick={clearSearch}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <span className="font-medium">{post.title}</span>
                        <span className="text-muted-foreground text-sm">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  to={`/searchPage?q=${encodeURIComponent(query)}&tags=${selectedTags.join(',')}`}
                  onClick={clearSearch}
                  className="block p-2 text-center text-primary hover:bg-gray-100 cursor-pointer"
                >
                  Xem thêm kết quả
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center w-fit overflow-hidden rounded-full ">
              <div
                className={`px-2 py-1 flex items-center ${roleInfo.className} whitespace-nowrap`}
              >
                {roleInfo.icon}
                {roleInfo.label}
              </div>

              {user?.role?.role_name === 'moderator' && (
                <Button
                  variant="repeat"
                  className="h-auto rounded-l-none px-2 flex-shrink-0"
                  onClick={handleRoleChange}
                >
                  <Repeat />
                </Button>
              )}
            </div>


            <Avatar>
              <AvatarImage src={user?.avatar || ''} alt={user?.full_name || 'User'} />
              <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
