import { Outlet } from 'react-router-dom'
import { LeftSidebar } from './LeftSidebar'
import { TopNav } from './TopNav'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <LeftSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
