import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Favorite } from "@/types/favorite";
import {
  getFavoriteFolders,
  createFavoriteFolder,
  updateFavoriteFolder,
  deleteFavoriteFolder,
} from "@/services/favorites/favoriteService";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/constant/path";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";

export default function FavoritesPage() {
  const [favouriteName, setFavouriteName] = useState<string>("");
  const [editFavouriteId, setEditFavouriteId] = useState<string | null>(null);
  const [editFavouriteName, setEditFavouriteName] = useState<string>("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await getFavoriteFolders();
      setFavorites(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể lấy danh sách thư mục!");
    } finally {
      setIsLoading(false);
    }
  };

  const createFavorite = async () => {
    if (!favouriteName) {
      toast.error("Vui lòng nhập tên thư mục!");
      return;
    }

    try {
      await createFavoriteFolder({
        favourite_name: favouriteName,
        account_id: "", // Backend will get this from auth token
      });
      toast.success("Tạo thư mục thành công!");
      setFavouriteName("");
      setIsCreateOpen(false);
      fetchFavorites();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể tạo thư mục!");
    }
  };

  const updateFavorite = async () => {
    if (!editFavouriteId || !editFavouriteName) {
      toast.error("Vui lòng nhập tên thư mục!");
      return;
    }

    try {
      await updateFavoriteFolder(editFavouriteId, {
        favourite_name: editFavouriteName,
      });
      toast.success("Cập nhật thư mục thành công!");
      setEditFavouriteId(null);
      setEditFavouriteName("");
      setIsEditOpen(false);
      fetchFavorites();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể cập nhật thư mục!");
    }
  };

  const deleteFavorite = async (favourite_id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thư mục này?")) return;

    try {
      await deleteFavoriteFolder(favourite_id);
      toast.success("Xóa thư mục thành công!");
      fetchFavorites();
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể xóa thư mục!");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bài viết yêu thích
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý các thư mục bài viết yêu thích của bạn
            </p>
          </div>
          <DropdownMenu open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DropdownMenuTrigger asChild>
              <Button>Tạo Thư Mục</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-4 w-64">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="favourite_name">Tên Thư Mục</Label>
                  <Input
                    id="favourite_name"
                    value={favouriteName}
                    onChange={(e) => setFavouriteName(e.target.value)}
                    placeholder="Nhập tên thư mục"
                    className="mt-1"
                  />
                </div>
                <Button onClick={createFavorite} className="w-full">
                  Tạo
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.favourite_id}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Bookmark className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() =>
                            navigate(
                              paths.user.favoritesDetail.replace(
                                ":favouriteId",
                                favorite.favourite_id
                              )
                            )
                          }
                        >
                          {favorite.favourite_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {favorite.post_count || 0} bài viết đã lưu
                        </p>
                      </div>
                    </div>

                    {/* Preview posts if available */}
                    {favorite.posts && favorite.posts.length > 0 && (
                      <div className="mb-4">
                        <div className="space-y-2">
                          {favorite.posts.slice(0, 2).map((post) => (
                            <div
                              key={post.post_id}
                              className="flex items-center gap-2 text-xs text-gray-500"
                            >
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="line-clamp-1">{post.title}</span>
                            </div>
                          ))}
                          {favorite.posts.length > 2 && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <span>
                                +{favorite.posts.length - 2} bài viết khác
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <DropdownMenu
                        open={
                          isEditOpen &&
                          editFavouriteId === favorite.favourite_id
                        }
                        onOpenChange={(open) => {
                          setIsEditOpen(open);
                          if (open) {
                            setEditFavouriteId(favorite.favourite_id);
                            setEditFavouriteName(favorite.favourite_name);
                          } else {
                            setEditFavouriteId(null);
                            setEditFavouriteName("");
                          }
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Sửa
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-4 w-64">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit_favourite_name">
                                Tên Thư Mục
                              </Label>
                              <Input
                                id="edit_favourite_name"
                                value={editFavouriteName}
                                onChange={(e) =>
                                  setEditFavouriteName(e.target.value)
                                }
                                placeholder="Nhập tên thư mục"
                                className="mt-1"
                              />
                            </div>
                            <Button onClick={updateFavorite} className="w-full">
                              Cập nhật
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFavorite(favorite.favourite_id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có thư mục yêu thích nào.</p>
              <p className="text-sm text-gray-400 mt-1">
                Tạo thư mục đầu tiên để lưu các bài viết yêu thích
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
