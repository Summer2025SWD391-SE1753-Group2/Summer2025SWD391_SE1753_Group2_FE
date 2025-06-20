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
import { useFavoriteStore } from "@/stores/favoriteStore";
import { toast } from "sonner";
import { Bookmark, Plus, Loader2, Trash2 } from "lucide-react";

interface BookmarkModalProps {
  postId: string;
  children?: React.ReactNode;
}

export function BookmarkModal({ postId, children }: BookmarkModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAllFolders, setShowAllFolders] = useState(false); // State mới để toggle hiển thị folder
  const {
    folders,
    isLoading,
    initializeFavorites,
    addPost,
    removePost,
    createFolder,
    getSavedFoldersForPost,
  } = useFavoriteStore();
  const savedFolders = getSavedFoldersForPost(postId);

  const handleToggleFavorite = async (
    favoriteId: string,
    favoriteName: string
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (savedFolders.has(favoriteId)) {
        await removePost(favoriteId, postId, favoriteName);
      } else {
        await addPost(favoriteId, postId, favoriteName);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(
        savedFolders.has(favoriteId)
          ? "Không thể xóa bài viết khỏi thư mục"
          : "Không thể thêm bài viết vào thư mục"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (isProcessing) return;
    if (!newFolderName.trim()) {
      toast.error("Vui lòng nhập tên thư mục");
      return;
    }
    setIsProcessing(true);
    try {
      await createFolder(newFolderName, postId);
      setIsOpen(false);
      setNewFolderName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Không thể tạo thư mục mới");
    } finally {
      setIsProcessing(false);
    }
  };

  // Chỉ gọi initializeFavorites nếu chưa có dữ liệu và chỉ một lần
  useEffect(() => {
    if (isOpen && folders.length === 0 && !isLoading) {
      initializeFavorites();
    }
  }, [isOpen, initializeFavorites, folders.length, isLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
              {folders.length > 0 && (
                <div className="space-y-2">
                  <Label>Chọn thư mục:</Label>
                  <div className="space-y-2">
                    {folders
                      .slice(0, showAllFolders ? undefined : 4) // Hiển thị tất cả nếu showAllFolders, ngược lại chỉ 4
                      .map((folder) => (
                        <Button
                          key={folder.favourite_id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() =>
                            handleToggleFavorite(
                              folder.favourite_id,
                              folder.favourite_name
                            )
                          }
                          disabled={isProcessing}
                        >
                          {savedFolders.has(folder.favourite_id) ? (
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          ) : (
                            <Bookmark className="h-4 w-4 mr-2" />
                          )}
                          {folder.favourite_name}
                          <span className="ml-auto text-sm text-muted-foreground">
                            {folder.post_count || 0} bài viết
                          </span>
                        </Button>
                      ))}
                    {folders.length > 4 && (
                      <Button
                        variant="ghost"
                        className="w-full text-sm text-muted-foreground"
                        onClick={() => setShowAllFolders(!showAllFolders)}
                      >
                        {showAllFolders ? "Thu gọn" : `Xem thêm (${folders.length - 4} thư mục)`}
                      </Button>
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
                    disabled={isProcessing}
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
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
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