import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/components/layout/main-layout/main-layout";
import DashboardLayout from "@/components/layout/dashboard-layout/dashboard-layout";
import TagManagementPage from "@/pages/private/management/TagManagementPage";
import MaterialManagementPage from "@/pages/private/management/MaterialManagementPage";
import TopicManagementPage from "@/pages/private/management/TopicManagementPage";
import ApprovePostPage from "@/pages/private/management/ApprovePostPage";
import PublicRoute from "./public-route";
import ProtectedRoute from "./protected-route";
import { paths } from "@/utils/constant/path";
import LoginPage from "@/pages/publicPage/auth/LoginPage";
import RegisterPage from "@/pages/publicPage/auth/RegisterPage";
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
import UnitManagementPage from "@/pages/private/management/UnitManagementPage";
import SettingPage from "@/pages/private/management/SettingPage";


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
          { path: paths.googleCallback, element: <LoginPage /> },
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
      { path: paths.postDetail, element: <PostDetailPage /> },
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

      { path: paths.user.profile, element: <ProfilePage /> },
      { path: paths.user.setting, element: <SettingPage /> },

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
      { path: paths.moderator.materialManagement, element: <MaterialManagementPage />, },
      { path: paths.moderator.tagManagement, element: <TagManagementPage /> },
      { path: paths.moderator.topicManagement, element: <TopicManagementPage />, },
      { path: paths.moderator.unitManagement, element: <UnitManagementPage />, },
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

      { path: paths.admin.approvePost, element: <ApprovePostPage /> },
      { path: paths.admin.materialManagement, element: <MaterialManagementPage />, },
      { path: paths.admin.tagManagement, element: <TagManagementPage /> },
      { path: paths.admin.topicManagement, element: <TopicManagementPage />, },
      { path: paths.admin.unitManagement, element: <UnitManagementPage />, },
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
