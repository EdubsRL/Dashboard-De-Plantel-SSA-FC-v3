import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import ConnectionBanner from '../feedback/ConnectionBanner'
import PageLoader from '../feedback/PageLoader'
import ErrorBoundary from '../feedback/ErrorBoundary'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden pt-14 lg:pt-6">
        <ConnectionBanner />
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
