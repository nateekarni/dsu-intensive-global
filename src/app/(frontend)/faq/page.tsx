'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/programs/Navbar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle } from 'lucide-react'

const FAQS = [
  {
    question: 'ใครบ้างที่สามารถสมัครเข้าร่วมโครงการได้?',
    answer:
      'นักเรียนระดับชั้นมัธยมศึกษาปีที่ 1-6 ของโรงเรียนสาธิตมหาวิทยาลัยศิลปากร (หรือตามที่แต่ละโครงการระบุ) ที่มีคุณสมบัติตรงตามข้อกำหนดของโครงการนั้นๆ',
  },
  {
    question: 'ต้องใช้เอกสารอะไรบ้างในการสมัคร?',
    answer:
      'โดยทั่วไปประกอบด้วย 1. สำเนาพาสปอร์ต 2. ใบแสดงผลการเรียน (Transcript) 3. หนังสือรับรองจากผู้ปกครอง (Parent Consent Form) และเอกสารอื่นๆ ตามที่โครงการร้องขอ',
  },
  {
    question: 'มีทุนการศึกษาหรือส่วนลดค่าโครงการหรือไม่?',
    answer:
      'ทางโรงเรียนอาจมีทุนสนับสนุนสำหรับนักเรียนที่มีผลการเรียนดีเยี่ยมหรือมีความสามารถพิเศษ ทั้งนี้ขึ้นอยู่กับนโยบายของแต่ละปีการศึกษา โปรดติดตามประกาศอย่างเป็นทางการ',
  },
  {
    question: 'ถ้าสมัครแล้วสละสิทธิ์ จะได้รับเงินคืนหรือไม่?',
    answer:
      'การคืนเงินจะเป็นไปตามนโยบายของแต่ละโครงการ โดยปกติหากสละสิทธิ์หลังมีการยืนยันและชำระค่าใช้จ่ายบางส่วนไปแล้ว อาจไม่สามารถได้รับเงินคืนเต็มจำนวน',
  },
  {
    question: 'การสัมภาษณ์เป็นภาษาอะไร?',
    answer:
      'ส่วนใหญ่จะเป็นการสัมภาษณ์ภาษาอังกฤษ เพื่อประเมินทักษะการสื่อสารและความพร้อมในการเดินทางไปต่างประเทศ',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-6 md:px-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2"
            >
              <HelpCircle className="size-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              คำถามที่พบบ่อย (FAQ)
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              รวบรวมข้อสงสัยเกี่ยวกับการสมัครและรายละเอียดโครงการ
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl px-6 py-2 shadow-sm"
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
