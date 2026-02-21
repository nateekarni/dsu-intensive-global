'use client'

import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { AdmissionType, Continent, ProgramStatus } from '@/data/mockPrograms'

// ── Types ──────────────────────────────────────────────────
export interface Filters {
  admission: AdmissionType | 'all'
  continent: Continent | 'all'
  status: ProgramStatus | 'all'
}

export const INITIAL_FILTERS: Filters = {
  admission: 'all',
  continent: 'all',
  status: 'all',
}

// ── Config ─────────────────────────────────────────────────
const ADMISSION_OPTIONS: { value: Filters['admission']; label: string; desc: string }[] = [
  { value: 'all', label: 'ทุกประเภท', desc: 'แสดงโปรแกรมทั้งหมด' },
  { value: 'first-come', label: 'มาก่อนได้ก่อน', desc: 'สมัครได้ทันทีตามลำดับ' },
  { value: 'interview', label: 'สอบสัมภาษณ์', desc: 'ผ่านการคัดเลือกก่อน' },
]

const CONTINENT_OPTIONS: { value: Filters['continent']; label: string; emoji: string }[] = [
  { value: 'all', label: 'ทุกทวีป', emoji: '🌍' },
  { value: 'เอเชีย', label: 'เอเชีย', emoji: '🌏' },
  { value: 'ยุโรป', label: 'ยุโรป', emoji: '🏰' },
  { value: 'อเมริกาเหนือ', label: 'อเมริกาเหนือ', emoji: '🗽' },
  { value: 'อเมริกาใต้', label: 'อเมริกาใต้', emoji: '🌿' },
  { value: 'โอเชียเนีย', label: 'โอเชียเนีย', emoji: '🦘' },
  { value: 'แอฟริกา', label: 'แอฟริกา', emoji: '🌅' },
]

const STATUS_OPTIONS: { value: Filters['status']; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'open', label: 'เปิดรับสมัคร' },
  { value: 'upcoming', label: 'เร็วๆ นี้' },
  { value: 'closed', label: 'ปิดรับแล้ว' },
]

// ── Component ──────────────────────────────────────────────
interface FilterDrawerProps {
  filters: Filters
  onChange: (f: Filters) => void
  activeCount: number
}

export function FilterDrawer({ filters, onChange, activeCount }: FilterDrawerProps) {
  const [draft, setDraft] = useState<Filters>(filters)

  function handleOpen() {
    setDraft(filters) // sync draft when drawer opens
  }

  function handleReset() {
    setDraft(INITIAL_FILTERS)
    onChange(INITIAL_FILTERS)
  }

  return (
    <Sheet onOpenChange={(open) => open && handleOpen()}>
      <SheetTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-all shrink-0',
            activeCount > 0
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted/50',
          )}
        >
          <SlidersHorizontal className="size-4" />
          <span>ตัวกรอง</span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center size-5 rounded-full bg-white/20 text-[11px] font-bold leading-none">
              {activeCount}
            </span>
          )}
          <ChevronDown className="size-3.5 opacity-50" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] flex flex-col pb-safe">
        {/* Handle bar */}
        <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/20 mb-2" />

        <SheetHeader className="text-left shrink-0 pb-0">
          <SheetTitle className="text-base">ตัวกรองโปรแกรม</SheetTitle>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-6 py-5">
          {/* Admission type */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">ประเภทการรับสมัคร</h3>
            <div className="space-y-2">
              {ADMISSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, admission: opt.value })}
                  className={cn(
                    'flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-2xl border transition-all',
                    draft.admission === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-primary/30 hover:bg-muted/40',
                  )}
                >
                  {/* Radio dot */}
                  <div
                    className={cn(
                      'size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      draft.admission === opt.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30',
                    )}
                  >
                    {draft.admission === opt.value && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Continent */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">ทวีป / ภูมิภาค</h3>
            <div className="grid grid-cols-2 gap-2">
              {CONTINENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, continent: opt.value })}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-sm font-medium transition-all',
                    draft.continent === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted/40',
                  )}
                >
                  <span className="text-lg leading-none">{opt.emoji}</span>
                  <span className="text-xs">{opt.label}</span>
                  {draft.continent === opt.value && (
                    <CheckCircle2 className="size-3.5 ml-auto shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Status */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">สถานะโปรแกรม</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDraft({ ...draft, status: opt.value })}
                  className={cn(
                    'h-9 px-4 rounded-full text-sm font-medium border transition-all',
                    draft.status === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <SheetFooter className="flex-row gap-3 shrink-0 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 h-11 rounded-xl"
          >
            รีเซ็ตทั้งหมด
          </Button>
          <SheetClose asChild>
            <Button size="sm" className="flex-1 h-11 rounded-xl" onClick={() => onChange(draft)}>
              แสดงผลลัพธ์
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ── Active filter chip helpers ─────────────────────────────
export function getActiveFilterLabels(filters: Filters): string[] {
  const labels: string[] = []
  if (filters.admission !== 'all') {
    labels.push(ADMISSION_OPTIONS.find((o) => o.value === filters.admission)?.label ?? '')
  }
  if (filters.continent !== 'all') {
    labels.push(filters.continent)
  }
  if (filters.status !== 'all') {
    labels.push(STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? '')
  }
  return labels.filter(Boolean)
}
