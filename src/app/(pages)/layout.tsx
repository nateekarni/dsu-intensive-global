import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0 bg-slate-50">
        {children}
      </main>
      <BottomNav />
    </>
  );
}