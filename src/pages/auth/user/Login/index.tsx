// src/pages/LoginPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập logic đăng nhập (thay thế bằng API thực tế của bạn)
    if (email && password) {
      console.log("Login successful with:", { email, password });
      // Chuyển hướng đến homepage sau khi đăng nhập thành công
      navigate("/home");
    } else {
      alert("Please enter valid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md text-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800">Log In</h2>
        </div>

        <Separator />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="email"
            placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="password"
            placeholder="Password*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          <div className="flex justify-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-800 hover:text-blue-600 hover:underline"
              aria-label="Forgot your password?"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="submit"
              className="w-1/2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 transition-colors"
              aria-label="Sign in"
            >
              Sign in
            </Button>
            <Button
              asChild
              className="w-1/2 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 transition-colors"
              aria-label="Create an account"
            >
              <Link to="/register">Create an account</Link>
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Or sign in with:
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <Button
            className="w-full rounded-2xl bg-[#3b5998] hover:bg-[#2a4373] text-white px-4 py-3 transition-colors"
            aria-label="Sign in with Facebook"
          >
            FACEBOOK
          </Button>
          <Button
            className="w-full rounded-2xl bg-[#db4437] hover:bg-[#c1352a] text-white px-4 py-3 transition-colors"
            aria-label="Sign in with Google"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}