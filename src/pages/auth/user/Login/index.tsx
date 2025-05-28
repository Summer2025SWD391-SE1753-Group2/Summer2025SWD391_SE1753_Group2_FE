import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Log In</h2>
        </div>

        <Separator />

        <form className="space-y-4">
          <Input
            className="rounded-2xl border-0 bg-gray-50"
            type="email"
            placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <Input
            className="rounded-2xl border-0 bg-gray-50"
            type="password"
            placeholder="Password*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline block"
            aria-label="Forgot your password?"
          >
            Forgot your password?
          </Link>

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="w-1/2 bg-blue-600 hover:bg-rose-500 transition-colors"
              aria-label="Sign in"
            >
              Sign in
            </Button>
            <Button
              asChild
              className="w-1/2 bg-gray-600 hover:bg-rose-500 transition-colors"
              aria-label="Create an account"
            >
              <Link to="/signup">Create an account</Link>
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Or sign in with:
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-[#3b5998] hover:bg-[#334d84] transition-colors"
            aria-label="Sign in with Facebook"
          >
            FACEBOOK
          </Button>
          <Button
            className="w-full bg-[#db4437] hover:bg-zinc-800 transition-colors"
            aria-label="Sign in with Google"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}