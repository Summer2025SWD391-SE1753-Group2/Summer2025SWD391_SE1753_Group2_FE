import { UserRole } from "@/types/user-role";

export const paths = {
  home: "",
  profile: "profile",
  personal: "/profile/:username",
  setting: "setting",
  login: "/auth/login",
  register: "/auth/register",
  googleCallback: "/auth/google-callback",
  postDetail: "/posts/:postId",
  search: "/searchPage",  chat: "chat",
  forgotPassword: "/auth/forgot-password",
  changePassword: "/auth/change-password",

  //user
  user: {
    home: "/user/",
    dashboard: "/user/my-posts",
    createPost: "/user/posts/create",
    profile: "/user/profile",
    setting: "/user/setting",
    editPost: "/user/posts/edit/:postId",
    postDetail: "/user/posts/:postId",
    favorites: "/user/favorites",
    favoritesDetail: "/user/favorites/:favouriteId",
    friends: "/user/friends",
    chat: "/user/chat",
    createReport: "/user/report/create",
    userReport: "/user/report/:userId",
  },

  // Moderator
  moderator: {
    home: "/moderator/",
    dashboard: "/moderator/dashboard",
    profile: "/moderator/profile",
    setting: "/moderator/setting",
    postDetail: "/moderator/posts/:postId",
    approvePost: "/moderator/approvepost",
    postReview: "/moderator/posts/review/:postId",
    tagManagement: "/moderator/tag-management",
    materialManagement: "/moderator/material-management",
    topicManagement: "/moderator/topic-management",
    unitManagement: "/moderator/unit-management",
    groupChatManagement: "/moderator/group-chat-management",
    chat: "/moderator/chat",
    report: "/moderator/report",
  },
  //admin
  admin: {
    home: "/admin/",
    dashboard: "/admin/dashboard",
    profile: "/admin/profile",
    setting: "/admin/setting",
    postDetail: "/admin/posts/:postId",
    approvePost: "/admin/approvepost",
    postReview: "/admin/posts/review/:postId",
    tagManagement: "/admin/tag-management",
    materialManagement: "/admin/material-management",
    topicManagement: "/admin/topic-management",
    unitManagement: "/admin/unit-management",
    groupChatManagement: "/admin/group-chat-management",
    userManagement: "/admin/user-management",
    chat: "/admin/chat",
  },

  // Not found
  notFound: "*",
};

export const getDefaultRouteByRole = (role_name?: UserRole) => {
  switch (role_name) {
    case "admin":
      return paths.admin.home;
    case "moderator":
      return paths.moderator.home;
    case "user":
      return paths.user.home;
    case "guest":
    default:
      return paths.login;
  }
};
