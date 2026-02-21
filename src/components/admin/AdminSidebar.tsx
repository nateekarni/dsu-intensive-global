'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, Settings, LogOut, Menu, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationList } from '@/components/shared/NotificationList'
import { mockAdminNotifications } from '@/data/mockNotifications'

const navigation = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
  { name: 'จัดการโครงการ', href: '/projects', icon: FolderKanban },
  { name: 'จัดการนักเรียน', href: '/students', icon: Users },
  { name: 'ตั้งค่า', href: '/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const unreadCount = mockAdminNotifications.filter((n) => !n.isRead).length

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4">
      {navigation.map((item) => {
        const isActive =
          pathname.startsWith(item.href) &&
          (item.href !== '/dashboard' || pathname === '/dashboard')
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 w-full z-50 flex items-center justify-between border-b bg-background p-4">
        <span className="font-semibold">DSU Admin</span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center border-b px-4">
              <span className="font-semibold">DSU Admin</span>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 border-r bg-background min-h-screen sticky top-0">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-semibold text-lg">DSU Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t space-y-2">
          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground relative"
              >
                <Bell className="mr-2 h-4 w-4" />
                การแจ้งเตือน
                {unreadCount > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              className="w-[320px] p-0 shadow-xl"
              sideOffset={12}
            >
              <div className="h-[400px]">
                <NotificationList notifications={mockAdminNotifications} userRole="admin" />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </>
  )
}
