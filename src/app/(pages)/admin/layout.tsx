import { AdminSidebar, AdminBottomNav } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSidebar />
      <div className="lg:pl-64 min-h-screen bg-slate-50">
        <main className="pt-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <AdminBottomNav />
    </>
  );
}
