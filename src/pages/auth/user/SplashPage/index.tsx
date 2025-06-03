import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Danh sách URL hình ảnh thức ăn của bạn
const foodImages = [
  "https://bizweb.dktcdn.net/100/339/225/files/thuc-an-nhanh.jpg?v=1627638748869",
  "https://blog.abit.vn/wp-content/uploads/2020/05/lay-si-do-an-vat-trung-quoc-10_opt.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyHRBN_msdrprIUxPRKUQ_D55psSRY-aadQw&s",
  "https://objectstorage.omzcloud.vn/pys-object-storage/web/uploads/posts/avatar/1646117052.jpg",
  "https://suckhoedoisong.qltns.mediacdn.vn/2014/11-greek-yogurt-636-0-0-1389186353473.jpg",
  "https://goldensmiletravel.com/uploads/images/2023/06/09/image1-1686293610.jpg",
  "https://blog.dktcdn.net/files/ban-do-an.jpg",
  "https://beptruong.edu.vn/wp-content/uploads/2017/09/nguoi-an-do-an-boc-de-ton-trong-hat-gao.jpg",
  "https://file.hstatic.net/200000201143/file/chup-do-an__1__223f315554d649228a59ac97c5a51045_grande.jpg",
  "https://cdn.nguyenkimmall.com/images/companies/_1/Content/tin-tuc/gia-dung/10-mon-do-an-vat-giam-can-day-tinh-healthy-va-balance-h1.jpg",
  "https://itsvietnam.com.vn/wp-content/uploads/2021/10/326-%C4%91%E1%BA%A1i-di%E1%BB%87n-600x600.png",
  "https://storage.quannhautudo.com/data/thumb_1200/Data/images/product/2023/06/202306271709202695.webp",
  "https://simg.zalopay.com.vn/zlp-website/assets/do_an_ngon_ha_noi_Pho_Cuon_Ha_Noi_0f923efc0f.jpg",
  "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1153329463-1669175879108.jpg",
  "https://cdn.prod.website-files.com/5f37e24d2bb0e5491702cddb/5f7f3dc784183855fde5a89c_dich-vu-chup-anh-mon-an.jpg",

];

export default function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Phần nội dung chính */}
      <main className="flex-1 relative flex items-center justify-center px-4">
        {/* Hình nền ghép (masonry layout) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 p-3 h-full">
            {foodImages.map((image, index) => (
              <div key={index} className="mb-3 break-inside-avoid">
                <img
                  src={image}
                  alt={`Hình ảnh món ăn ${index + 1}`}
                  className="w-full rounded-lg shadow-sm object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overlay mờ */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Nội dung chính */}
        <div className="relative z-20 flex flex-col items-center justify-center space-y-6 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Chào mừng đến với ứng dụng ẩm thực của bạn
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white drop-shadow-lg max-w-md">
            Khám phá các công thức nấu ăn ngon và nguồn cảm hứng ẩm thực
          </p>
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold transition-colors"
            aria-label="Đăng nhập"
          >
            <Link to="/login">Đăng nhập</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}