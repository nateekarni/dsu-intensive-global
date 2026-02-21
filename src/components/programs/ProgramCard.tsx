'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Program, ProgramStatus } from '@/data/mockPrograms'

// ── Helpers ─────────────────────────────────────────────────
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('th-TH', opts)} – ${e.toLocaleDateString('th-TH', { ...opts, year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('th-TH', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('th-TH', { ...opts, year: 'numeric' })}`
}

export function getDaysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000))
}

// ── Status config ────────────────────────────────────────────
const STATUS_CONFIG: Record<ProgramStatus, { label: string; dot: string; cls: string }> = {
  open: {
    label: 'เปิดรับสมัคร',
    dot: 'bg-emerald-500',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  upcoming: { label: 'เร็วๆ นี้', dot: 'bg-sky-500', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  closed: {
    label: 'ปิดรับสมัคร',
    dot: 'bg-zinc-400',
    cls: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
  archived: {
    label: 'เก็บถาวร',
    dot: 'bg-zinc-300',
    cls: 'bg-zinc-50 text-zinc-400 border-zinc-200',
  },
}

const ADMISSION_LABEL: Record<string, string> = {
  'first-come': 'มาก่อนได้ก่อน',
  interview: 'สอบสัมภาษณ์',
}

// ── Component ────────────────────────────────────────────────
interface ProgramCardProps {
  program: Program
  index: number
}

export function ProgramCard({ program, index }: ProgramCardProps) {
  const cfg = STATUS_CONFIG[program.status]
  const isFull = program.currentParticipants >= program.maxParticipants
  const daysLeft = program.status === 'open' ? getDaysLeft(program.dates.applicationDeadline) : null
  const fillPct = Math.round((program.currentParticipants / program.maxParticipants) * 100)

  const formattedDeadline = new Date(program.dates.applicationDeadline).toLocaleDateString(
    'th-TH',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Link
        href={`/programs/${program.id}`}
        aria-label={`ดูรายละเอียด ${program.title}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        {/* Reset link color — children must not inherit blue anchor color */}
        <div className="h-full overflow-hidden rounded-2xl border border-border bg-card text-foreground hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          {/* ── Cover image ── */}
          <div className="relative h-48 sm:h-52 overflow-hidden">
            <Image
              src={program.images.cover}
              alt={program.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            {/* Status + admission badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-white/90 backdrop-blur-sm border shrink-0',
                  cfg.cls,
                )}
              >
                <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
                {cfg.label}
              </Badge>
              <Badge
                variant="outline"
                className="text-[11px] px-2.5 py-1 bg-white/90 backdrop-blur-sm text-zinc-700 border-zinc-200 shrink-0"
              >
                {ADMISSION_LABEL[program.admissionType]}
              </Badge>
            </div>

            {/* Location + title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                <MapPin className="size-3 shrink-0" />
                {program.location.city}, {program.location.country}
                <span className="ml-1 text-zinc-400 text-[10px]">· {program.continent}</span>
              </p>
              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-primary/80 transition-colors">
                {program.title}
              </h3>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-4 space-y-3.5">
            {/* Short description */}
            <p className="text-xs leading-relaxed line-clamp-2 text-muted-foreground">
              {program.shortDescription}
            </p>

            <Separator />

            <div className="space-y-2.5">
              {/* Date range */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground/60" />
                <span>{formatDateRange(program.dates.start, program.dates.end)}</span>
              </div>

              {/* Capacity progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5 shrink-0 text-muted-foreground/60" />
                    <span>
                      {program.currentParticipants}/{program.maxParticipants} ที่นั่ง
                    </span>
                  </span>
                  {isFull && (
                    <span className="text-[11px] font-semibold text-destructive">เต็มแล้ว</span>
                  )}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
              </div>

              {/* Deadline countdown */}
              {daysLeft !== null && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] font-medium',
                    daysLeft <= 7 ? 'text-destructive' : 'text-amber-600',
                  )}
                >
                  <Clock className="size-3.5 shrink-0" />
                  {daysLeft > 0 ? `ปิดรับสมัครใน ${daysLeft} วัน` : 'วันสุดท้ายวันนี้!'}
                </div>
              )}
            </div>

            <Separator />

            {/* ── Footer: price (left) + deadline (right) ── */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                  ค่าโครงการ
                </p>
                <p className="text-base font-bold text-foreground leading-none">
                  {program.price.displayPrice}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                  ปิดรับสมัคร
                </p>
                <p className="text-sm font-semibold text-foreground leading-none">
                  {formattedDeadline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
