// src/pages/RegisterPage.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register with:", { username, fullname, phone, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md text-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800">Register</h2>
        </div>

        <Separator />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="text"
            placeholder="Username*"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            required
            aria-label="Username"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="text"
            placeholder="Fullname*"
            value={fullname}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFullname(e.target.value)
            }
            required
            aria-label="Fullname"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="tel"
            placeholder="Phone*"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPhone(e.target.value)
            }
            required
            aria-label="Phone number"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="email"
            placeholder="Email*"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
            aria-label="Email address"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="password"
            placeholder="Password*"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
            aria-label="Password"
          />
          <Input
            className="w-full rounded-2xl border-0 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-0 focus:border-blue-600"
            type="password"
            placeholder="Confirm Password*"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            required
            aria-label="Confirm password"
          />
          <div className="flex justify-center">
            <Link
              to="/login"
              className="text-sm text-gray-800 hover:text-blue-600 hover:underline"
              aria-label="Already have an account? Sign in"
            >
              Already have an account? Sign in
            </Link>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              type="submit"
             

 className="w-1/2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 transition-colors"
              aria-label="Create an account"
            >
              Create an account
            </Button>
            <Button
              asChild
              className="w-1/2 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 transition-colors"
              aria-label="Back to login"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Or register with:
        </div>

        <div className="space-y-3 flex flex-col items-center">
          <Button
            className="w-full rounded-2xl bg-[#3b5998] hover:bg-[#2a4373] text-white px-4 py-3 transition-colors"
            aria-label="Register with Facebook"
          >
            FACEBOOK
          </Button>
          <Button
            className="w-full rounded-2xl bg-[#db4437] hover:bg-[#c1352a] text-white px-4 py-3 transition-colors"
            aria-label="Register with Google"
          >
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}