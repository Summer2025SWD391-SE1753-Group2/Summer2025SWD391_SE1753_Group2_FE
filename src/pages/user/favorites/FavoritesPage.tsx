import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Favorite } from '@/types/favorite';
import { getFavoriteFolders, createFavoriteFolder, updateFavoriteFolder, deleteFavoriteFolder } from '@/services/favorites/favoriteService';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/utils/constant/path';

export default function FavoritesPage() {
  const [favouriteName, setFavouriteName] = useState<string>('');
  const [editFavouriteId, setEditFavouriteId] = useState<string | null>(null);
  const [editFavouriteName, setEditFavouriteName] = useState<string>('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    setIsLoading(true); // Start loading
    try {
      const data = await getFavoriteFolders();
      setFavorites(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể lấy danh sách thư mục!');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const createFavorite = async () => {
    if (!favouriteName) {
      alert('Vui lòng nhập tên thư mục!');
      return;
    }

    try {
      await createFavoriteFolder({
        favourite_name: favouriteName,
        account_id: 'a678cc6a-1a5a-49b7-9199-468eaae68287',
      });
      alert('Tạo thư mục thành công!');
      setFavouriteName('');
      setIsCreateOpen(false);
      fetchFavorites();
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể kết nối đến API!');
    }
  };

  const updateFavorite = async () => {
    if (!editFavouriteId || !editFavouriteName) {
      alert('Vui lòng nhập tên thư mục!');
      return;
    }

    try {
      await updateFavoriteFolder(editFavouriteId, {
        favourite_name: editFavouriteName,
      });
      alert('Cập nhật thư mục thành công!');
      setEditFavouriteId(null);
      setEditFavouriteName('');
      setIsEditOpen(false);
      fetchFavorites();
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể kết nối đến API!');
    }
  };

  const deleteFavorite = async (favourite_id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thư mục này?')) return;

    try {
      await deleteFavoriteFolder(favourite_id);
      alert('Xóa thư mục thành công!');
      fetchFavorites();
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể kết nối đến API!');
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Danh Sách Thư Mục Yêu Thích</h1>
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.favourite_id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => navigate(paths.favoritesDetail.replace(':favouriteId', favorite.favourite_id))}
                        >
                          {favorite.favourite_name}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600">
                        Posts: {favorite.post_count}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <DropdownMenu
                        open={isEditOpen && editFavouriteId === favorite.favourite_id}
                        onOpenChange={(open) => {
                          setIsEditOpen(open);
                          if (open) {
                            setEditFavouriteId(favorite.favourite_id);
                            setEditFavouriteName(favorite.favourite_name);
                          } else {
                            setEditFavouriteId(null);
                            setEditFavouriteName('');
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
                              <Label htmlFor="edit_favourite_name">Tên Thư Mục</Label>
                              <Input
                                id="edit_favourite_name"
                                value={editFavouriteName}
                                onChange={(e) => setEditFavouriteName(e.target.value)}
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
            <p>Chưa có thư mục nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}