import { AuthForm } from '@/components/auth/AuthForm'
import { Globe, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden antialiased">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8 mx-auto flex flex-col min-h-screen sm:min-h-0 sm:justify-center">
        {/* Mobile Header / Back Button */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <Link
            href="/"
            className="inline-flex flex-shrink-0 items-center justify-center size-10 rounded-full bg-background/50 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all backdrop-blur-md"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Globe className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">DSU Intensive</span>
          </div>
        </div>

        {/* Auth Form Container */}
        <div className="flex-1 flex flex-col justify-center sm:flex-none">
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center animate-pulse bg-muted rounded-xl" />
            }
          >
            <AuthForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 sm:mt-10">
          &copy; {new Date().getFullYear()} DSU Intensive Global Programs.
          <br className="sm:hidden" /> All rights reserved.
        </p>
      </div>
    </div>
  )
}
