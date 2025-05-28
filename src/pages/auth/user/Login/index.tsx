import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Log In</h2>
        </div>

        <Separator />

        <div className="space-y-4">
          <Input className="rounded-2xl border-0" type="email" placeholder="Email*" />
          <Input className="rounded-2xl border-0" type="password" placeholder="Password*" />
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <div className="flex space-x-4">
<<<<<<< Updated upstream
          <Button className="w-1/2 hover:bg-rose-500">Sign in</Button>
=======
          <Button className="btn w-1/2 hover:bg-rose-500">Sign in</Button>
>>>>>>> Stashed changes
          <Button  className="w-1/2 hover:bg-rose-500">
            Create an account
          </Button>
        </div>

<<<<<<< Updated upstream
        <div className="text-center text-sm text-muted-foreground">
=======
        <div className=" text-center text-sm text-muted-foreground">
>>>>>>> Stashed changes
          Or sign in with:
        </div>

        <div className="space-y-3">
          <Button
            className="w-full hover:bg-[#334d84]"
            
          >
            FACEBOOK
          </Button>
          <Button className="w-full hover:bg-zinc-800">
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}