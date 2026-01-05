"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StudentSidebar, StudentBottomNav } from "@/components/layout/StudentSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StudentTopNav() {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-primary z-40 shadow-md">
      <div className={cn("h-full flex items-center px-4", user && "lg:pl-64")}>
        <div className="container max-w-6xl mx-auto flex items-center justify-between w-full gap-2">
          <Link href="/student/feed" className="text-base sm:text-lg font-bold text-white truncate">
            DSU Intensive Global
          </Link>
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-white text-sm font-medium">
                {user.profile?.nameThai || user.email?.split('@')[0]}
              </span>
            </div>
          ) : (
            <Link href="/auth/login" className="shrink-0">
              <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-slate-100 font-semibold">
                เข้าสู่ระบบ
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isApplyPage = pathname?.startsWith('/student/apply/');

  // หากยังไม่ login ให้แสดง Navbar แบบปกติ (Guest)
  if (!user) {
    return (
      <>
        {!isApplyPage && <StudentTopNav />}
        <main className={cn(
          "min-h-screen pb-20 md:pb-0 bg-slate-50",
          !isApplyPage ? "pt-16" : "pt-0"
        )}>
          {children}
        </main>
      </>
    );
  }

  // หาก login แล้ว ให้แสดง Sidebar + Bottom Nav + Top Nav (Mobile & Desktop now unified)
  return (
    <>
      {!isApplyPage && <StudentTopNav />}
      {!isApplyPage && <StudentSidebar />}
      <main className={cn(
        "min-h-screen pb-20 lg:pb-0 bg-slate-50",
        !isApplyPage && "lg:pl-64",
        !isApplyPage ? "pt-16" : "pt-0"
      )}>
        {children}
      </main>
      {!isApplyPage && <StudentBottomNav />}
    </>
  );
}
