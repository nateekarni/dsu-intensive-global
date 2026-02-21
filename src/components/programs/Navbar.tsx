'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Menu, X, ChevronRight, LogOut, User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NotificationList } from '@/components/shared/NotificationList'
import { mockStudentNotifications } from '@/data/mockNotifications'
import Image from 'next/image'

// Mock User State
const MOCK_USER = {
  name: 'สมชาย ใจดี',
  role: 'student',
  avatar: 'https://ui.shadcn.com/avatars/01.png',
}

const PUBLIC_LINKS = [
  { href: '/programs', label: 'โครงการ' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
  { href: '/faq', label: 'คำถามที่พบบ่อย' },
  { href: '/contact', label: 'ติดต่อเจ้าหน้าที่' },
]

const STUDENT_LINKS = [
  { href: '/programs', label: 'โครงการ' },
  { href: '/student/applications', label: 'การสมัครของฉัน' },
  { href: '/student/profile', label: 'ข้อมูลส่วนตัว' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  const links = isLoggedIn ? STUDENT_LINKS : PUBLIC_LINKS

  // Sync mock auth state
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem('dsu_mock_auth') === 'true')
    }
    checkAuth()

    window.addEventListener('mock-auth-changed', checkAuth)
    return () => window.removeEventListener('mock-auth-changed', checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('dsu_mock_auth')
    window.dispatchEvent(new Event('mock-auth-changed'))
    setOpen(false)
  }

  // Close on route change
  useEffect(() => {
    setOpen(false)
    setIsMobileNotifOpen(false)
  }, [pathname])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open || isMobileNotifOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, isMobileNotifOpen])

  const unreadCount = mockStudentNotifications.filter((n) => !n.isRead).length

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Globe className="size-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[13px] font-bold text-foreground leading-none">DSU Intensive</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Global Programs</p>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                  pathname === link.href
                    ? 'text-foreground font-medium bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right: desktop CTA + hamburger ── */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="relative size-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors mr-1">
                        <Bell className="size-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-80 p-0 overflow-hidden shadow-xl"
                      sideOffset={8}
                    >
                      <div className="h-[400px]">
                        <NotificationList
                          notifications={mockStudentNotifications}
                          userRole="student"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-2 text-sm font-medium pr-3 border-r border-border">
                    {MOCK_USER.avatar ? (
                      <Image
                        src={MOCK_USER.avatar}
                        alt={MOCK_USER.name}
                        width={28}
                        height={28}
                        className="size-7 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-4" />
                      </div>
                    )}
                    {MOCK_USER.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="size-3.5 mr-1.5" /> ออกจากระบบ
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild className="h-8 px-4 text-xs rounded-full">
                  <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                    เข้าสู่ระบบ
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Actions Container */}
            <div className="flex items-center gap-1.5 md:hidden">
              {isLoggedIn && (
                <Sheet open={isMobileNotifOpen} onOpenChange={setIsMobileNotifOpen}>
                  <SheetTrigger asChild>
                    <button className="relative flex items-center justify-center size-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Bell className="size-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:w-[400px] p-0 flex flex-col border-none sm:border-l"
                  >
                    <SheetHeader className="px-4 py-3 border-b border-border/50 sr-only">
                      <SheetTitle>การแจ้งเตือน</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-hidden">
                      <NotificationList
                        notifications={mockStudentNotifications}
                        onClose={() => setIsMobileNotifOpen(false)}
                        userRole="student"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={open}
                className="relative flex flex-col items-center justify-center size-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="absolute"
                    >
                      <X className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 45, opacity: 0, scale: 0.7 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -45, opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="absolute"
                    >
                      <Menu className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown overlay (absolute, floats over content) ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-14 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 z-50 md:hidden bg-background border-b border-border shadow-xl"
            >
              <div className="mx-auto max-w-7xl px-4 py-3 space-y-0.5">
                {isLoggedIn && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-muted/50 border border-border/50">
                    {MOCK_USER.avatar ? (
                      <Image
                        src={MOCK_USER.avatar}
                        alt={MOCK_USER.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{MOCK_USER.name}</p>
                      <p className="text-xs text-muted-foreground">{MOCK_USER.role}</p>
                    </div>
                  </div>
                )}

                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition-all',
                        pathname === link.href
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      {link.label}
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-2 pb-1 border-t border-border mt-3">
                  {isLoggedIn ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      onClick={handleLogout}
                    >
                      ออกจากระบบ
                    </Button>
                  ) : (
                    <Button asChild className="w-full h-10 text-sm" onClick={() => setOpen(false)}>
                      <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                        เข้าสู่ระบบ
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
