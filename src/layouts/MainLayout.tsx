import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800 font-sans">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
