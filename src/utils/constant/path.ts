import { UserRole } from "@/types/user-role";

export const paths = {
  home: "/",
  profile: "/profile",

  // Auth
  login: "/auth/login",
  register: "/auth/register",
  googleCallback: "/auth/google/callback",

  // Posts
  createPost: "/posts/create",
  postDetail: "/posts/:postId",

  // Moderator
  moderator: {
    dashboard: "/moderator",
    profile: "/moderator/profile",
    approvePost: "/moderator/approvepost",
    tagManagement: "/moderator/tag-management",
    materialManagement: "/moderator/material-management",
    topicManagement: "/moderator/topic-management",
  },
  admin: {
    dashboard: "/admin",
  },

  // Not found
  notFound: "*",
};
export const getDefaultRouteByRole = (role_name?: UserRole) => {
  switch (role_name) {
    case 'admin':
      return paths.admin.dashboard;
    case 'moderator':
      return paths.moderator.dashboard;
    case 'user':
      return paths.home;
    case 'guest':
    default:
      return paths.login;
  }
};