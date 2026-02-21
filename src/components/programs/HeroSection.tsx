'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { mockPrograms } from '@/data/mockPrograms'

interface HeroSectionProps {
  openCount: number
}

export function HeroSection({ openCount }: HeroSectionProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <div className="py-10 sm:py-14 md:py-16 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-3 max-w-xl"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              โรงเรียนสาธิตมหาวิทยาลัยศิลปากร · DSU Global
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
              โครงการนานาชาติ
              <br />
              <span className="text-primary">เปิดโลก สร้างอนาคต</span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              ค้นพบโปรแกรมแลกเปลี่ยนระดับนานาชาติที่ออกแบบมาเพื่อนักเรียนโดยเฉพาะ พัฒนาทักษะ
              เปิดมุมมอง และสร้างประสบการณ์ที่จะจำไปตลอดชีวิต
            </p>
          </motion.div>

          {/* Right: Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="hidden md:flex flex-col gap-0 rounded-2xl border border-border bg-muted/40 overflow-hidden shrink-0"
          >
            {[
              { value: mockPrograms.length, label: 'โปรแกรมทั้งหมด', icon: '🌍' },
              { value: openCount, label: 'เปิดรับสมัคร', icon: '✅' },
              { value: 6, label: 'ประเทศปลายทาง', icon: '📍' },
            ].map(({ value, label, icon }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className="h-px bg-border mx-4" />}
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-none tabular-nums">
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* Mobile stats row */}
        <div className="flex items-center divide-x divide-border border-t border-border md:hidden">
          {[
            { value: mockPrograms.length, label: 'โปรแกรม' },
            { value: openCount, label: 'เปิดรับ' },
            { value: 6, label: 'ประเทศ' },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 py-3 text-center">
              <p className="text-lg font-bold text-foreground leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
