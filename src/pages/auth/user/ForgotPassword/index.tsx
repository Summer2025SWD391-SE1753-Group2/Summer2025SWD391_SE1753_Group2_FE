// src/pages/ForgotPasswordPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Lock } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset request for:", { email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6 p-6 text-center border border-gray-300 rounded-lg">
        {/* Lock icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-gray-600 flex items-center justify-center">
            <Lock className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Title and description */}
        <h2 className="text-xl font-bold text-gray-800">
          Having trouble signing in?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Enter your email or username <br />
          and we’ll send you a link <br />
          to get back into your account.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            className="rounded-lg bg-gray-100 border border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="email"
            placeholder="Email or username"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
            aria-label="Email or username"
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            aria-label="Send login link"
          >
            Send Login Link
          </Button>
        </form>

        {/* Link "Can't reset your password?" */}
        <div>
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            aria-label="Back to login"
          >
            Can’t reset your password?
          </Link>
        </div>

        {/* Separator "OR" */}
        <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
          <span className="h-px w-10 bg-gray-300"></span>
          <span>OR</span>
          <span className="h-px w-10 bg-gray-300"></span>
        </div>

        {/* Link "Create new account" */}
        <div>
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            aria-label="Create new account"
          >
            Create New Account
          </Link>
        </div>

        {/* Link "Back to login" */}
        <div className="mt-6">
          <Link
            to="/login"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
            aria-label="Back to login"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;