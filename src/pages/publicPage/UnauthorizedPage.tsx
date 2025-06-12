import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft, Home } from "lucide-react";

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Không có quyền truy cập
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
            viên nếu bạn cho rằng đây là lỗi.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>• Kiểm tra lại vai trò tài khoản của bạn</p>
            <p>• Đảm bảo bạn đã xác thực đầy đủ</p>
            <p>• Liên hệ hỗ trợ nếu cần thiết</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => window.history.back()} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
