"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, FileText, User, Folder, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null; // ไม่ Login ไม่โชว์

  if (
    (pathname.includes("/student/projects/") && pathname !== "/student/projects") ||
    pathname.includes("/admin/create-project")
  ) {
    return null; // ไม่แสดงเมนู
  }

  // เมนูสำหรับนักเรียน
  const studentMenu = [
    { href: "/student/feed", label: "โครงการ", icon: LayoutGrid },
    { href: "/student/dashboard", label: "สถานะ", icon: FileText },
    { href: "/student/profile", label: "บัญชี", icon: User },
  ];

  // เมนูสำหรับเจ้าหน้าที่
  const adminMenu = [
    { href: "/admin/projects", label: "โครงการ", icon: Folder },
    { href: "/admin/reviews", label: "ตรวจเอกสาร", icon: FileCheck2 },
  ];

  const menuItems = user.role === "admin" ? adminMenu : studentMenu;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex md:hidden z-50">
      {menuItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center text-[10px] gap-1 transition-colors",
              isActive ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}