import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/components/layout/main-layout/main-layout";
import DashboardLayout from "@/components/layout/dashboard-layout/dashboard-layout";
import TagManagementPage from "@/pages/private/management/TagManagementPage";
import MaterialManagementPage from "@/pages/private/management/MaterialManagementPage";
import TopicManagementPage from "@/pages/private/management/TopicManagementPage";
import ApprovePostPage from "@/pages/private/management/ApprovePostPage";
import { PostReviewPage } from "@/pages/private/management/PostReviewPage";
import PublicRoute from "./public-route";
import ProtectedRoute from "./protected-route";
import { paths } from "@/utils/constant/path";
import LoginPage from "@/pages/publicPage/auth/LoginPage";
import RegisterPage from "@/pages/publicPage/auth/RegisterPage";
import GoogleCallback from "@/pages/publicPage/auth/google-callback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CreatePostPage } from "@/pages/publicPage/posts/CreatePostPage";
import { PostDetailPage } from "@/pages/publicPage/posts/PostDetailPage";
import HomePage from "@/pages/publicPage/HomePage";
import ProfilePage from "@/pages/publicPage/ProfilePage";
import DashboardPage from "@/pages/private/Dashboard";
import NotFound from "@/pages/publicPage/NotFound";
import FavoritesPage from "@/pages/private/FavoritesPage";
import DetailFavoritePage from "@/pages/private/DetailFavoritePage";
import MyPostsPage from "@/pages/user/posts/MyPostsPage";
import EditPostPage from "@/pages/user/posts/EditPostPage";
import { PersonalPage } from "@/pages/user/profile/PersonalPage";
import { FriendManagementPage } from "@/pages/user/friends/FriendManagementPage";
import UnitManagementPage from "@/pages/private/management/UnitManagementPage";
import { SettingPage } from "@/pages/private/management/SettingPage";
import SearchPage from "@/pages/publicPage/SearchPage";
import UserManagementPage from "@/pages/private/management/UserManagementPage";
import ChatPage from "@/pages/publicPage/ChatPage";
import ForgotPasswordPage from "@/pages/publicPage/auth/ForgotPasswordPage";
import ChangePasswordPage from "@/pages/publicPage/auth/ChangePasswordPage";
import GroupChatManagementPage from "@/pages/private/management/GroupChatManagementPage";
import { ReportPage } from "@/pages/private/management/ReportPage";
import CreateReportPage from "@/pages/private/CreateReportPage";
import { UserReportPage } from "@/pages/private/UserReportPage";
import VerifyEmailPage from "@/pages/publicPage/verify-email";
import VerifySuccess from "@/pages/publicPage/verify-success";
import ResetPasswordPage from "@/pages/publicPage/auth/ResetPasswordPage";

const router = createBrowserRouter([
  {
    path: paths.home,
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <PublicRoute />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
          { path: paths.googleCallback, element: <GoogleCallback /> },
          { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
          { path: paths.changePassword, element: <ChangePasswordPage /> },
          { path: paths.verifyEmail, element: <VerifyEmailPage /> },
          { path: paths.verifySuccess, element: <VerifySuccess /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    path: paths.home,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: paths.personal, element: <PersonalPage /> },
      { path: paths.postDetail, element: <PostDetailPage /> },
      { path: paths.search, element: <SearchPage /> },
    ],
  },
  //user
  {
    path: paths.user.home,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.user.dashboard, element: <MyPostsPage /> },

      { path: paths.user.createPost, element: <CreatePostPage /> },
      { path: paths.user.editPost, element: <EditPostPage /> },
      { path: paths.user.postDetail, element: <PostDetailPage /> },
      { path: paths.user.favorites, element: <FavoritesPage /> },
      { path: paths.user.favoritesDetail, element: <DetailFavoritePage /> },
      { path: paths.user.friends, element: <FriendManagementPage /> },
      { path: paths.user.createReport, element: <CreateReportPage /> },
      { path: paths.user.userReport, element: <UserReportPage /> },

      { path: paths.user.profile, element: <ProfilePage /> },
      { path: paths.user.setting, element: <SettingPage /> },
      //
      { path: paths.user.chat, element: <ChatPage /> },
      { path: "/user/chat/:friendId", element: <ChatPage /> },
    ],
  },
  //moderator
  {
    path: paths.moderator.home,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.moderator.postDetail, element: <PostDetailPage /> },
      { path: paths.moderator.profile, element: <ProfilePage /> },
      { path: paths.moderator.setting, element: <SettingPage /> },

      { path: paths.moderator.dashboard, element: <DashboardPage /> },

      { path: paths.moderator.approvePost, element: <ApprovePostPage /> },
      { path: paths.moderator.postReview, element: <PostReviewPage /> },
      {
        path: paths.moderator.materialManagement,
        element: <MaterialManagementPage />,
      },
      { path: paths.moderator.tagManagement, element: <TagManagementPage /> },
      {
        path: paths.moderator.topicManagement,
        element: <TopicManagementPage />,
      },
      { path: paths.moderator.unitManagement, element: <UnitManagementPage /> },

      //
      { path: paths.moderator.chat, element: <ChatPage /> },
      { path: paths.moderator.friends, element: <FriendManagementPage /> },
      {
        path: paths.moderator.groupChatManagement,
        element: <GroupChatManagementPage />,
      },
      { path: paths.moderator.report, element: <ReportPage /> },
    ],
  },
  //admin
  {
    path: paths.admin.home,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.admin.postDetail, element: <PostDetailPage /> },
      { path: paths.admin.profile, element: <ProfilePage /> },
      { path: paths.admin.setting, element: <SettingPage /> },

      { path: paths.admin.dashboard, element: <DashboardPage /> },
      { path: paths.admin.userManagement, element: <UserManagementPage /> },

      { path: paths.admin.approvePost, element: <ApprovePostPage /> },
      { path: paths.admin.postReview, element: <PostReviewPage /> },
      {
        path: paths.admin.materialManagement,
        element: <MaterialManagementPage />,
      },
      { path: paths.admin.tagManagement, element: <TagManagementPage /> },
      { path: paths.admin.topicManagement, element: <TopicManagementPage /> },
      { path: paths.admin.unitManagement, element: <UnitManagementPage /> },
      //
      { path: paths.admin.chat, element: <ChatPage /> },
      {
        path: paths.admin.groupChatManagement,
        element: <GroupChatManagementPage />,
      },
    ],
  },
  {
    path: paths.notFound,
    element: <NotFound />,
  },
]);

export const AppRouter = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
