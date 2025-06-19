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
import { PersonalPage } from "@/pages/user/profile/PersonalPage";

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
          { path: paths.googleCallback, element: <LoginPage /> }, // Giả định callback dùng LoginPage
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
    ],
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: paths.createPost, element: <CreatePostPage /> },
      { path: paths.myPosts, element: <MyPostsPage /> },
      { path: "/user/posts/edit/:postId", element: <EditPostPage /> },
      { path: "/user/favorites", element: <FavoritesPage /> },
      { path: "/user/favorites/:favouriteId", element: <DetailFavoritePage /> },
    ],
  },
  {
    path: paths.moderator.dashboard,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: paths.moderator.profile, element: <ProfilePage /> },
      { path: paths.moderator.approvePost, element: <ApprovePostPage /> },
      {
        path: paths.moderator.materialManagement,
        element: <MaterialManagementPage />,
      },
      { path: paths.moderator.tagManagement, element: <TagManagementPage /> },
      {
        path: paths.moderator.topicManagement,
        element: <TopicManagementPage />,
      },
    ],
  },
  {
    path: paths.admin.dashboard,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <DashboardPage /> }],
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
