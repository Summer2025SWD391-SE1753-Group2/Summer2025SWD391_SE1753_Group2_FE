import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function GuestTopbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl">
              🍜 Food Forum
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/auth/login">
            <Button variant="outline">Đăng nhập</Button>
          </Link>
          <Link to="/auth/register">
            <Button>Đăng ký</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
