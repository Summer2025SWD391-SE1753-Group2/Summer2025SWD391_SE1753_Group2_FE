import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-7xl font-bold text-red-500">404</div>
      <div className="text-xl font-semibold">
        Không tìm thấy trang bạn yêu cầu!
      </div>
      <Button asChild size="lg" className="mt-2">
        <Link to="/">Quay về trang chủ</Link>
      </Button>
    </div>
  );
}
