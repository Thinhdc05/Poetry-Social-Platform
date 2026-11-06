import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AuthProvider } from '../features/auth'
import { ReadingProvider } from '../features/reading'

export default function App() {
  return (
    <AuthProvider>
      <ReadingProvider>
        <RouterProvider router={router} />
      </ReadingProvider>
    </AuthProvider>
  )
}
