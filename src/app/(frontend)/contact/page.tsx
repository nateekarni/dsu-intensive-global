'use client'

import { useActionState } from 'react' // React 19 hook
import { motion } from 'framer-motion'
import { Navbar } from '@/components/programs/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { submitContactForm, type ContactState } from '@/app/actions/contact'

const initialState: ContactState = {
  message: '',
  errors: {},
}

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
            >
              ติดต่อเจ้าหน้าที่
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              หากพบปัญหาการใช้งานหรือมีข้อสงสัยเพิ่มเติม สามารถแจ้งรายละเอียดได้ที่นี่
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>แบบฟอร์มติดต่อ</CardTitle>
                  <CardDescription>กรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ</CardDescription>
                </CardHeader>
                <CardContent>
                  {state.success ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                    >
                      <div className="p-4 rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="size-12" />
                      </div>
                      <h3 className="text-xl font-semibold text-emerald-700">
                        ส่งข้อความเรียบร้อยแล้ว
                      </h3>
                      <p className="text-muted-foreground max-w-xs">
                        ขอบคุณสำหรับการติดต่อ
                        เจ้าหน้าที่จะดำเนินการตรวจสอบและติดต่อกลับโดยเร็วที่สุด
                      </p>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        ส่งข้อความใหม่
                      </Button>
                    </motion.div>
                  ) : (
                    <form action={formAction} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="ระบุชื่อจริง"
                            required
                            disabled={isPending}
                          />
                          {state.errors?.name && (
                            <p className="text-sm text-destructive">{state.errors.name[0]}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">อีเมลติดต่อกลับ</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            required
                            disabled={isPending}
                          />
                          {state.errors?.email && (
                            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">เรื่องที่ต้องการติดต่อ</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="เช่น พบปัญหาการใช้งาน, สอบถามข้อมูลเพิ่มเติม"
                          required
                          disabled={isPending}
                        />
                        {state.errors?.subject && (
                          <p className="text-sm text-destructive">{state.errors.subject[0]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">ข้อความ</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="รายละเอียดที่ต้องการแจ้ง..."
                          className="min-h-[150px]"
                          required
                          disabled={isPending}
                        />
                        {state.errors?.message && (
                          <p className="text-sm text-destructive">{state.errors.message[0]}</p>
                        )}
                      </div>

                      {state.message && !state.success && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                          {state.message}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังส่งข้อความ...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            ส่งข้อความ
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>ช่องทางอื่นๆ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">ที่อยู่ติดต่อ</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        โรงเรียนสาธิตมหาวิทยาลัยศิลปากร (มัธยม)
                        <br />
                        446 ถ.เพชรเกษม ต.สนามจันทร์
                        <br />
                        อ.เมือง จ.นครปฐม 73000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">โทรศัพท์</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        034-255-795 (ฝ่ายทะเบียน)
                        <br />
                        เวลาทำการ: 08.30 - 16.30 น.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">อีเมล</h4>
                      <p className="text-sm text-muted-foreground mt-1">registra@su.ac.th</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
