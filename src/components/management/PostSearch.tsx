import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { searchPostsByTitle } from "@/services/posts/postService";
import { toast } from "sonner";
import type { Post } from "@/types/post";
import { Search } from "lucide-react";

interface PostSearchProps {
  onSearchResults: (results: Post[]) => void;
  onReset: () => void;
}

export const PostSearch: React.FC<PostSearchProps> = ({
  onSearchResults,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      onReset();
      return;
    }

    try {
      setSearching(true);
      const results = await searchPostsByTitle(searchTerm);
      onSearchResults(results);
    } catch (err) {
      toast.error("Không thể tìm kiếm bài viết");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-sm ">
      <Input
        type="text"
        placeholder="Tìm bài viết theo tiêu đề..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={searching}
        className="pr-10 rounded-3xl"
      />
      {/* icon search nằm trong input */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search/>
      </span>
    </div>
  );
};
