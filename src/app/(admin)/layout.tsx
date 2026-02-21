import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import '@/app/(frontend)/styles.css' // Import existing globals/styles for tailwind

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage projects, applications, and settings.',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: 'light' }}>
      <body className="flex min-h-screen bg-gray-50/50">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-14 lg:pt-0">
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
