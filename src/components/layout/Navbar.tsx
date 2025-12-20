"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button"; // Shadcn Button

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white hidden md:block">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Exchange Program
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-slate-600">
                {user.role === "admin" ? "เจ้าหน้าที่" : "นักเรียน"}: {user.email}
              </span>
              <Button variant="outline" onClick={logout}>ออกจากระบบ</Button>
            </>
          ) : (
            <Link href="/login">
              <Button>เข้าสู่ระบบ</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}