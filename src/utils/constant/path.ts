import { UserRole } from "@/types/user-role";

export const paths = {
  home: "/",
  profile: "profile",
  setting: "setting",
  login: "/auth/login",
  register: "/auth/register",
  googleCallback: "/auth/google/callback",

  postDetail: "/posts/:postId",
  //user
  user: {
    dashboard: "/user/my-posts",
    createPost: "/user/posts/create",
    profile: "user/profile",
    setting: "user/setting",
    editPost: "/user/posts/edit/:postId",
    favorites: "/user/favorites",
    favoritesDetail: "/user/favorites/:favouriteId",

  },

  // Moderator
  moderator: {
    dashboard: "/moderator",
    profile: "/moderator/profile",
    setting: "/moderator/setting",
    approvePost: "/moderator/approvepost",
    tagManagement: "/moderator/tag-management",
    materialManagement: "/moderator/material-management",
    topicManagement: "/moderator/topic-management",
    unitManagement: "/moderator/unit-management",
  },
  //admin
  admin: {
    dashboard: "/admin",
    profile: "/admin/profile",
    setting: "/admin/settings",
    approvePost: "/admin/approvepost",
    tagManagement: "/admin/tag-management",
    materialManagement: "/admin/material-management",
    topicManagement: "/admin/topic-management",
    unitManagement: "/admin/unit-management",
  },

  // Not found
  notFound: "*",
};

export const getDefaultRouteByRole = (role_name?: UserRole) => {
  switch (role_name) {
    case "admin":
      return paths.admin.dashboard;
    case "moderator":
      return paths.moderator.dashboard;
    case "user":
      return paths.home;
    case "guest":
    default:
      return paths.login;
  }
};
