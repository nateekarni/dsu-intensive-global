'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Plane,
  Mail,
  Star,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/programs/Navbar'
import { mockPrograms, type ProgramStatus } from '@/data/mockPrograms'
import { cn } from '@/lib/utils'

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getDaysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000))
}

const STATUS_CONFIG: Record<ProgramStatus, { label: string; dot: string; badge: string }> = {
  open: {
    label: 'เปิดรับสมัคร',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  upcoming: {
    label: 'เร็วๆ นี้',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  closed: {
    label: 'ปิดรับสมัคร',
    dot: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
  archived: {
    label: 'เก็บถาวร',
    dot: 'bg-zinc-300',
    badge: 'bg-zinc-50 text-zinc-400 border-zinc-200',
  },
}

// ───────────────────────────────────────────────────────────
// Section helper
// ───────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
        {title}
      </h2>
      {children}
    </div>
  )
}

// ───────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────
export default function ProgramDetailPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  React.useEffect(() => {
    setIsLoggedIn(localStorage.getItem('dsu_mock_auth') === 'true')
  }, [])

  const params = useParams()
  const id = params?.id as string
  const program = useMemo(() => mockPrograms.find((p) => p.id === id), [id])

  if (!program) notFound()

  const cfg = STATUS_CONFIG[program.status]
  const isOpen = program.status === 'open'
  const isFull = program.currentParticipants >= program.maxParticipants
  const canApply = isOpen && !isFull
  const daysLeft = isOpen ? getDaysLeft(program.dates.applicationDeadline) : null
  const spotsLeft = program.maxParticipants - program.currentParticipants
  const fillPct = Math.round((program.currentParticipants / program.maxParticipants) * 100)

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />

      {/* ── Hero ───────────────────────────────────── */}
      <div className="w-full md:max-w-7xl md:mx-auto md:px-10 md:pt-6">
        <div className="relative h-[50vh] min-h-[320px] max-h-[480px] overflow-hidden md:rounded-2xl">
          {/* Cover image */}
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            src={program.images.cover}
            alt={program.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Black gradient from bottom to top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

          {/* Back button */}
          <div className="absolute top-6 left-0 right-0 px-6 md:px-10 z-10">
            <Link href="/programs">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <ArrowLeft className="size-4" />
                โปรแกรมทั้งหมด
              </Button>
            </Link>
          </div>

          {/* Hero content at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8 space-y-3"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {program.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-xs text-white/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
              {program.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-zinc-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-white/60" />
                {program.location.city}, {program.location.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-white/60" />
                {formatDate(program.dates.start)} – {formatDate(program.dates.end)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'flex items-center gap-1.5 border bg-white/90 backdrop-blur-sm',
                  cfg.badge,
                )}
              >
                <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                {cfg.label}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
          {/* ── Left: Main content ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Description */}
            <Section title="เกี่ยวกับโปรแกรม" icon={Globe}>
              <p className="text-muted-foreground text-sm leading-relaxed">{program.description}</p>
            </Section>

            <Separator />

            {/* Highlights */}
            <Section title="ไฮไลต์กิจกรรม" icon={Star}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {program.highlights.map((h) => (
                  <Card key={h} className="p-0">
                    <CardContent className="flex items-start gap-3 p-4">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{h}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>

            <Separator />

            {/* Requirements */}
            <Section title="คุณสมบัติผู้สมัคร" icon={AlertCircle}>
              <Card>
                <CardContent className="p-4 space-y-2">
                  {program.requirements.map((r) => (
                    <div key={r} className="flex items-start gap-3 text-sm text-foreground">
                      <ChevronRight className="size-4 text-primary shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Section>

            {/* Itinerary */}
            {program.itinerary && program.itinerary.length > 0 && (
              <>
                <Separator />
                <Section title="กำหนดการเบื้องต้น" icon={Plane}>
                  <div className="space-y-2">
                    {program.itinerary.map((day, i) => (
                      <div key={day.day} className="flex gap-4 group">
                        {/* Day number + connecting line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                            {day.day}
                          </div>
                          {i < program.itinerary!.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[1.5rem]" />
                          )}
                        </div>

                        {/* Card */}
                        <div
                          className={cn(
                            'flex-1 mb-2 rounded-xl border border-border bg-muted/30 px-4 py-3.5',
                            'transition-all duration-200',
                            'group-hover:bg-muted/60 group-hover:border-primary/20 group-hover:shadow-sm',
                          )}
                        >
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {day.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {day.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground/70 italic mt-1">
                    * กำหนดการฉบับเต็มจะแจ้งให้ทราบหลังผ่านการคัดเลือก
                  </p>
                </Section>
              </>
            )}

            <Separator />

            {/* Includes / Excludes */}
            <Section title="ค่าโครงการ รวม/ไม่รวม" icon={CheckCircle2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* รวม */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                    ✓ รวมในค่าโครงการ
                  </p>
                  <ul className="space-y-2">
                    {program.price.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ไม่รวม */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3">
                    ✕ ไม่รวมในค่าโครงการ
                  </p>
                  <ul className="space-y-2">
                    {program.price.excludes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <XCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <Separator />

            {/* Coordinator */}
            <Section title="ผู้ประสานงานโครงการ" icon={Mail}>
              <Card className="w-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="size-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                    {program.coordinator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {program.coordinator.name}
                    </p>
                    <a
                      href={`mailto:${program.coordinator.email}`}
                      className="text-xs text-primary hover:underline underline-offset-4"
                    >
                      {program.coordinator.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </Section>
          </motion.div>

          {/* ── Right: Sticky Sidebar ─────────────── */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="lg:sticky lg:top-6 h-fit"
          >
            <Card>
              <CardHeader className="pb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  ค่าโครงการ
                </p>
                <CardTitle className="text-3xl font-bold">{program.price.displayPrice}</CardTitle>
              </CardHeader>

              <Separator />

              <CardContent className="pt-4 space-y-4 pb-4">
                {/* Deadline */}
                <div className="flex items-start justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    ปิดรับสมัคร
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-foreground text-xs">
                      {formatDate(program.dates.applicationDeadline)}
                    </p>
                    {daysLeft !== null && (
                      <p
                        className={cn(
                          'text-xs',
                          daysLeft <= 7 ? 'text-destructive font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {daysLeft > 0 ? `อีก ${daysLeft} วัน` : 'วันนี้เป็นวันสุดท้าย'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-start justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4 shrink-0" />
                    ช่วงเวลา
                  </span>
                  <div className="text-right">
                    <p className="font-medium text-foreground text-xs">
                      {formatDate(program.dates.start)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ถึง {formatDate(program.dates.end)}
                    </p>
                  </div>
                </div>

                {/* Spots */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-4 shrink-0" />
                      ที่นั่งคงเหลือ
                    </span>
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        isFull ? 'text-destructive' : 'text-foreground',
                      )}
                    >
                      {isFull ? 'เต็มแล้ว' : `${spotsLeft} ที่นั่ง`}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        fillPct >= 100
                          ? 'bg-destructive'
                          : fillPct >= 80
                            ? 'bg-amber-500'
                            : 'bg-primary',
                      )}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-muted-foreground">
                    {program.currentParticipants}/{program.maxParticipants} ที่นั่ง
                  </p>
                </div>
              </CardContent>

              <Separator />

              <CardContent className="pt-4 space-y-3">
                {/* CTA button */}
                {canApply ? (
                  isLoggedIn ? (
                    <Link href={`/student/apply/${program.id}`} className="block w-full">
                      <Button size="lg" className="w-full gap-2 h-12">
                        สมัครโครงการนี้
                        <ArrowLeft className="size-4 rotate-180" />
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=/student/apply/${program.id}`}
                      className="block w-full"
                    >
                      <Button size="lg" className="w-full gap-2 h-12">
                        เข้าสู่ระบบเพื่อสมัคร
                        <ArrowLeft className="size-4 rotate-180" />
                      </Button>
                    </Link>
                  )
                ) : program.status === 'upcoming' ? (
                  <Button
                    size="lg"
                    disabled
                    className="w-full h-12 bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-50"
                  >
                    เปิดรับสมัครเร็วๆ นี้
                  </Button>
                ) : (
                  <Button size="lg" disabled variant="secondary" className="w-full h-12">
                    {isFull ? 'ที่นั่งเต็มแล้ว' : 'ปิดรับสมัครแล้ว'}
                  </Button>
                )}

                {/* Contact button */}
                <a href={`mailto:${program.coordinator.email}`} className="block w-full">
                  <Button variant="outline" className="w-full gap-2 h-10">
                    <Mail className="size-4" />
                    สอบถามข้อมูลเพิ่มเติม
                  </Button>
                </a>

                {/* Urgency note */}
                {canApply && daysLeft !== null && daysLeft <= 14 && (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-destructive text-center font-medium">
                    <Clock className="size-3.5" />
                    รีบสมัคร! เหลือเวลาอีก {daysLeft} วัน
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
