import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getFavoriteFolders,
  addPostToFavorite,
  createFavoriteFolder,
} from "@/services/favorites/favoriteService";
import { Favorite } from "@/types/favorite";
import { toast } from "sonner";
import { Bookmark, Plus, Loader2 } from "lucide-react";

interface BookmarkModalProps {
  postId: string;
  children?: React.ReactNode;
}

export function BookmarkModal({ postId, children }: BookmarkModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await getFavoriteFolders();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Không thể tải danh sách thư mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToFavorite = async (
    favoriteId: string,
    favoriteName: string
  ) => {
    try {
      await addPostToFavorite(favoriteId, postId);
      toast.success(`Đã thêm bài viết vào "${favoriteName}"`);
      setIsOpen(false);
      // Refresh favorites list to update post count
      fetchFavorites();
    } catch (error) {
      console.error("Error adding to favorite:", error);
      toast.error("Không thể thêm bài viết vào thư mục");
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newFolderName.trim()) {
      toast.error("Vui lòng nhập tên thư mục");
      return;
    }

    try {
      setIsCreating(true);
      const newFolder = await createFavoriteFolder({
        favourite_name: newFolderName,
        account_id: "", // This will be handled by the backend from auth token
      });

      await addPostToFavorite(newFolder.favourite_id, postId);
      toast.success(`Đã tạo thư mục "${newFolderName}" và thêm bài viết`);
      setIsOpen(false);
      setNewFolderName("");
      setShowCreateForm(false);
      // Refresh favorites list to update post count
      fetchFavorites();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Không thể tạo thư mục mới");
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFavorites();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lưu bài viết</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Existing Folders */}
              {favorites.length > 0 && (
                <div className="space-y-2">
                  <Label>Chọn thư mục:</Label>
                  <div className="space-y-2">
                    {favorites.slice(0, 4).map((favorite) => (
                      <Button
                        key={favorite.favourite_id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() =>
                          handleAddToFavorite(
                            favorite.favourite_id,
                            favorite.favourite_name
                          )
                        }
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        {favorite.favourite_name}
                        <span className="ml-auto text-sm text-muted-foreground">
                          {favorite.post_count || 0} bài viết
                        </span>
                      </Button>
                    ))}
                    {favorites.length > 4 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{favorites.length - 4} thư mục khác. Vào trang quản lý
                        để xem tất cả.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Create New Folder */}
              <div className="border-t pt-4">
                {!showCreateForm ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo thư mục mới
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newFolderName">Tên thư mục mới:</Label>
                      <Input
                        id="newFolderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nhập tên thư mục"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateAndAdd}
                        disabled={isCreating}
                        className="flex-1"
                      >
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Tạo và lưu
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewFolderName("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
