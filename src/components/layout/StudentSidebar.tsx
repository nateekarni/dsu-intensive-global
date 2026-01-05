"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "โครงการ",
    href: "/student/feed",
    icon: LayoutGrid,
  },
  {
    title: "สถานะการสมัคร",
    href: "/student/dashboard",
    icon: FileText,
  },
  {
    title: "บัญชี",
    href: "/student/account",
    icon: User,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-white">
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center px-4 border-b">
        <Link href="/student/feed" className="text-xl font-bold text-primary text-center leading-tight">
          DSU Intensive Global
        </Link>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="text-sm text-slate-600 mb-2 px-4 truncate">
          {user?.email}
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
}

export function StudentBottomNav() {
  const pathname = usePathname();

  // ซ่อนเมนูล่างในหน้าสมัครเข้าร่วมโครงการ ใช้ปุ่ม ยกเลิก/ถัดไป แทน
  if (pathname.startsWith("/student/apply")) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="grid grid-cols-3 h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
