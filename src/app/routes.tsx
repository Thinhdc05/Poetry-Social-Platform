import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { HomePage } from '../pages/home/HomePage'
import { PoemDetailPage } from '../pages/poems/PoemDetailPage'
import { CreatePoemPage } from '../pages/poems/CreatePoemPage'
import { EditPoemPage } from '../pages/poems/EditPoemPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { AuthorPage } from '../pages/authors/AuthorPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { NotFoundPage } from '../pages/common/NotFoundPage'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'poems/new',
        element: (
          <ProtectedRoute>
            <CreatePoemPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'poems/:id',
        element: <PoemDetailPage />,
      },
      {
        path: 'poems/:id/edit',
        element: (
          <ProtectedRoute>
            <EditPoemPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'authors/:authorName',
        element: <AuthorPage />,
      },
      {
        path: 'poets/:authorName',
        element: <AuthorPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
])
