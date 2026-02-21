'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/programs/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, School, Code2 } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-6 md:px-10">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"
            >
              เกี่ยวกับเรา
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              แพลตฟอร์มรับสมัครและบริหารจัดการโครงการแลกเปลี่ยนนานาชาติ
            </motion.p>
          </div>

          {/* Content sections */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Origin & Purpose */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BookOpen className="size-6 text-primary" />
                    ที่มาและวัตถุประสงค์
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    เว็บไซต์นี้จัดทำขึ้นเพื่อยกระดับกระบวนการรับสมัครนักเรียนเข้าร่วมโครงการแลกเปลี่ยนและกิจกรรมวิชาการนานาชาติ
                    ให้มีความทันสมัย โปร่งใส และมีประสิทธิภาพสูงสุด
                  </p>
                  <p>
                    ระบบช่วยลดขั้นตอนด้านเอกสาร เพิ่มความสะดวกในการตรวจสอบข้อมูล
                    และทำให้นักเรียนสามารถติดตามสถานะการสมัครได้แบบ Real-time
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Development Team */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Users className="size-6 text-indigo-500" />
                    ผู้จัดทำ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                      <School className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">ฝ่ายทะเบียนและวัดผล</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        โรงเรียนสาธิตมหาวิทยาลัยศิลปากร (มัธยม)
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1">
                        รับผิดชอบข้อมูลและกระบวนการคัดเลือก
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Code2 className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">ทีมพัฒนาระบบสารสนเทศ</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        ดูแลและปรับปรุงระบบ Technical Support
                      </p>
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
