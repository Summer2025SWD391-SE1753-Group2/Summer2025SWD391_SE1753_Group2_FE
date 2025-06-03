import { Outlet, Link } from "react-router-dom";
import { BaseLayout } from "../../shared/BaseLayout";
import { Topbar } from "../../shared/Topbar/Topbar";
import { Button } from "@/components/ui/button";

export default function GuestLayout() {
  const year = new Date().getFullYear();
  return (
    <BaseLayout
      topbar={
        <Topbar>
          <div className="flex w-full items-center justify-between py-2">
            <span className="font-bold text-lg">Food Forum</span>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/register">Đăng ký</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        </Topbar>
      }
    >
      <Outlet />
      <footer className="w-full text-center text-xs text-muted-foreground py-4 border-t mt-8">
        © {year} Food Forum. All rights reserved.
      </footer>
    </BaseLayout>
  );
}
