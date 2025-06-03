import { RouteConfig } from "../../types/router.types";
import { AuthGuard } from "../../guards/AuthGuard";
import { PhoneVerifiedGuard } from "../../guards/PhoneVerifiedGuard";
import { HomePage } from "@/pages/user/HomePage";
import { ProfilePage } from "@/pages/auth/user/profile/ProfilePage";
import { CreatePostPage } from "@/pages/auth/user/create-post/CreatePostPage";
import { ChatPage } from "@/pages/chat/chat-with-friend/ChatPage";

export const userRoutes: RouteConfig[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
  },
  {
    path: "/profile",
    element: (
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    ),
  },
  {
    path: "/create-post",
    element: (
      <AuthGuard>
        <PhoneVerifiedGuard requirePhoneVerification>
          <CreatePostPage />
        </PhoneVerifiedGuard>
      </AuthGuard>
    ),
  },
  {
    path: "/chat",
    element: (
      <AuthGuard>
        <PhoneVerifiedGuard requirePhoneVerification>
          <ChatPage />
        </PhoneVerifiedGuard>
      </AuthGuard>
    ),
  },
];
