'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Turnstile } from '@marsidev/react-turnstile'

type AuthMode = 'login' | 'register'
type LoginMethod = 'password' | 'otp'

export function AuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Mock Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!turnstileToken) {
      alert('กรุณายืนยันตัวตนว่าคุณไม่ใช่บอท')
      return
    }

    setIsLoading(true)

    try {
      // 1. Verify Turnstile token first
      const verifyRes = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        throw new Error('การยืนยันตัวตนล้มเหลว (Captcha invalid)')
      }

      // 2. Proceed with login/register
      const form = e.currentTarget as HTMLFormElement

      if (authMode === 'login') {
        // Login Flow
        const res = await fetch('/api/dsu-users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.value, password: form.password.value }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.errors?.[0]?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        }

        // Check Role & Redirect
        if (data.user?.role === 'admin') {
          router.push('/payload-admin')
        } else {
          const callbackUrl = searchParams.get('callbackUrl') || '/student/profile' // Default to student profile
          router.push(callbackUrl)
        }
      } else {
        // Register Flow
        const res = await fetch('/api/dsu-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             email: form.email.value, 
             password: form.password.value,
             // firstName and lastName would be saved to user profile if we add those fields later
             firstName: form.firstName.value,
             lastName: form.lastName.value,
          }),
        })
        
        const data = await res.json()

        if (!res.ok) {
           throw new Error(data.errors?.[0]?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
        }
        
        // Auto-login after registration
        await fetch('/api/dsu-users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email.value, password: form.password.value }),
        })
        
        const callbackUrl = searchParams.get('callbackUrl') || '/student/profile'
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error(error)
      const err = error as Error
      alert(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[400px] mx-auto p-6 sm:p-8 bg-background/80 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {authMode === 'login' ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีใหม่'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          {authMode === 'login'
            ? 'เข้าสู่ระบบเพื่อจัดการใบสมัครของคุณ'
            : 'ลงทะเบียนเพื่อเริ่มต้นสมัครเข้าร่วมโครงการ'}
        </p>
      </div>

      <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as AuthMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger
            value="login"
            className="rounded-lg text-sm bg-transparent data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            เข้าสู่ระบบ
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="rounded-lg text-sm bg-transparent data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            สร้างบัญชี
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            {authMode === 'register' && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      required
                      placeholder="สมชาย"
                      className="pl-9 h-11 rounded-xl bg-background border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    required
                    placeholder="ใจดี"
                    className="h-11 rounded-xl bg-background border-border/50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="email">อีเมล</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                className="pl-9 h-11 rounded-xl bg-background border-border/50"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(authMode === 'register' || loginMethod === 'password') && (
              <motion.div
                key="password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between mt-1">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required={authMode === 'register' || loginMethod === 'password'}
                    placeholder="••••••••"
                    className="pl-9 h-11 rounded-xl bg-background border-border/50"
                  />
                </div>
              </motion.div>
            )}

            {authMode === 'login' && loginMethod === 'otp' && (
              <motion.div
                key="otp-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-2 text-sm text-center text-muted-foreground"
              >
                เราจะส่งรหัสผ่านชั่วคราว (OTP) ไปยังอีเมลของคุณ
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            {/* Turnstile Widget */}
            <div className="flex justify-center mb-4">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{
                  theme: 'light',
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-medium text-[15px] group"
              disabled={isLoading || !turnstileToken}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  กำลังโหลด...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {authMode === 'login'
                    ? loginMethod === 'otp'
                      ? 'รับรหัส OTP'
                      : 'เข้าสู่ระบบ'
                    : 'สมัครสมาชิก'}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </div>
        </form>

        {authMode === 'login' && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  หรือเข้าสู่ระบบด้วย
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-xl text-sm border-border/60 hover:bg-muted/50 transition-colors gap-2"
              onClick={() => setLoginMethod(loginMethod === 'password' ? 'otp' : 'password')}
            >
              <ShieldCheck className="size-4 text-primary" />
              {loginMethod === 'password'
                ? 'ใช้รหัสผ่านชั่วคราว (OTP / Magic Link)'
                : 'ใช้รหัสผ่านปกติ (Password)'}
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  )
}
