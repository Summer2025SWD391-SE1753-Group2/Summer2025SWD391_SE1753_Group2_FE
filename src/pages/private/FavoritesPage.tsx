import { useState, useEffect, useCallback, useRef } from "react";
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
  getFavoritePosts,
} from "@/services/favorites/favoriteService";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/constant/path";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";

// Cache interface to store fetched data
interface Cache {
  folders: Favorite[] | null;
  images: Record<string, string | null>;
}

export default function FavoritesPage() {
  const [favouriteName, setFavouriteName] = useState<string>("");
  const [editFavouriteId, setEditFavouriteId] = useState<string | null>(null);
  const [editFavouriteName, setEditFavouriteName] = useState<string>("");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteImages, setFavoriteImages] = useState<
    Record<string, string | null>
  >({});
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const cache = useRef<Cache>({ folders: null, images: {} });
  const isMounted = useRef<boolean>(true);

  const fetchFavorites = useCallback(async (forceRefresh: boolean = false) => {
    if (!forceRefresh && cache.current.folders) {
      setFavorites(cache.current.folders);
      setFavoriteImages(cache.current.images);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getFavoriteFolders();
      if (!isMounted.current) return;

      setFavorites(data);
      cache.current.folders = data;
      console.log("Fetched favorites data:", data);

      const uncachedFolders = data.filter(
        (favorite: Favorite) => !(favorite.favourite_id in cache.current.images),
      );

      if (uncachedFolders.length === 0) {
        setFavoriteImages(cache.current.images);
        setIsLoading(false);
        return;
      }

      const imagePromises = uncachedFolders.map(async (favorite: Favorite) => {
        try {
          const posts = await getFavoritePosts(favorite.favourite_id, 0, 1);
          const firstImage =
            posts &&
            posts.length > 0 &&
            posts[0].images &&
            posts[0].images.length > 0
              ? posts[0].images[0].image_url
              : null;
          return { favouriteId: favorite.favourite_id, image: firstImage };
        } catch (error) {
          console.error(`Error fetching posts for ${favorite.favourite_id}:`, error);
          return { favouriteId: favorite.favourite_id, image: null };
        }
      });

      const images = await Promise.all(imagePromises);
      const imagesMap = images.reduce(
        (acc, { favouriteId, image }) => {
          acc[favouriteId] = image;
          return acc;
        },
        { ...cache.current.images } as Record<string, string | null>,
      );

      if (!isMounted.current) return;
      setFavoriteImages(imagesMap);
      cache.current.images = imagesMap;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể lấy danh sách thư mục!");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  const createFavorite = async () => {
    if (!favouriteName) {
      toast.error("Vui lòng nhập tên thư mục!");
      return;
    }

    try {
      await createFavoriteFolder({
        favourite_name: favouriteName,
        account_id: "",
      });
      toast.success("Tạo thư mục thành công!");
      setFavouriteName("");
      setIsCreateOpen(false);
      cache.current.folders = null;
      fetchFavorites(true);
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
      cache.current.folders = null;
      fetchFavorites(true);
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
      cache.current.folders = null;
      delete cache.current.images[favourite_id];
      fetchFavorites(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể xóa thư mục!");
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchFavorites();
    return () => {
      isMounted.current = false;
    };
  }, [fetchFavorites]);

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

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((favorite) => {
                const firstPostImage = favoriteImages[favorite.favourite_id];

                return (
                  <div
                    key={favorite.favourite_id}
                    className="group bg-white border-b border-gray-200 py-4 px-6 transition-all duration-200"
                  >
                    <div className="flex items-center gap-6 mb-4">
                      {firstPostImage ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-t-4 border-gray-400">
                          <img
                            src={firstPostImage}
                            alt={favorite.favourite_name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent rounded-lg"></div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Bookmark className="h-6 w-6 text-orange-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors truncate"
                          onClick={() =>
                            navigate(
                              paths.user.favoritesDetail.replace(
                                ":favouriteId",
                                favorite.favourite_id,
                              ),
                            )
                          }
                        >
                          {favorite.favourite_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {favorite.post_count || 0} bài viết đã lưu
                        </p>
                      </div>
                      <div className="ml-auto">
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
                              <Button
                                onClick={updateFavorite}
                                className="w-full"
                              >
                                Cập nhật
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex justify-end items-center pt-4 border-t-2 border-gray-300">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFavorite(favorite.favourite_id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                );
              })}
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