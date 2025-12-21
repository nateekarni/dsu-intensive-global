"use client";
import { useAuth } from "@/contexts/AuthContext";
import { StudentSidebar, StudentBottomNav } from "@/components/layout/StudentSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // หากยังไม่ login ให้แสดง Navbar แบบปกติ
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pb-20 md:pb-0 bg-slate-50">
          {children}
        </main>
      </>
    );
  }

  // หาก login แล้ว ให้แสดง Sidebar + Bottom Nav
  return (
    <>
      <StudentSidebar />
      <main className="min-h-screen lg:pl-64 pb-20 lg:pb-0 bg-slate-50">
        {children}
      </main>
      <StudentBottomNav />
    </>
  );
}
