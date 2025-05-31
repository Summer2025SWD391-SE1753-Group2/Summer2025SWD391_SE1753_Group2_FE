// src/pages/SplashPage.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Danh sách URL hình ảnh thức ăn từ Unsplash (có thể thay thế bằng ảnh của bạn)
const foodImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1513104890138-7cacd02a8a98?q=80&w=300&auto=format&fit=crop", // Burger
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop", // Pasta
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=300&auto=format&fit=crop", // Sushi
  "https://images.unsplash.com/photo-1565299624946-b28fddf7f5a7?q=80&w=300&auto=format&fit=crop", // Salad
  "https://images.unsplash.com/photo-1621184455862-c163e4b4e0fa?q=80&w=300&auto=format&fit=crop", // Dessert
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=300&auto=format&fit=crop", // Donut
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop", // Tacos
  "https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?q=80&w=300&auto=format&fit=crop", // BBQ
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop", // Smoothie
  "https://images.unsplash.com/photo-1628253747716-0c8c83f48ac5?q=80&w=300&auto=format&fit=crop", // Steak
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=300&auto=format&fit=crop", // Ramen
  "https://images.unsplash.com/photo-1565299585323-76e1a0d2a5d6?q=80&w=300&auto=format&fit=crop", // Pancakes
  "https://images.unsplash.com/photo-1551024709-8f23bef730fb?q=80&w=300&auto=format&fit=crop", // Coffee
  "https://images.unsplash.com/photo-1599599810769-91aa89e382b2?q=80&w=300&auto=format&fit=crop", // Phở
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
                  alt={`Food image ${index + 1}`}
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
            Welcome to Your Food App
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white drop-shadow-lg max-w-md">
            Discover delicious recipes and culinary inspirations
          </p>
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold transition-colors"
            aria-label="Log in"
          >
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}