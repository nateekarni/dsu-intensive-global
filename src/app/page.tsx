"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/admin/projects");
    } else {
      router.push("/student/feed");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}