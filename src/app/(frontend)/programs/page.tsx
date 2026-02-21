'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/programs/Navbar'
import { HeroSection } from '@/components/programs/HeroSection'
import {
  FilterDrawer,
  INITIAL_FILTERS,
  getActiveFilterLabels,
} from '@/components/programs/FilterDrawer'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { mockPrograms } from '@/data/mockPrograms'
import type { Filters } from '@/components/programs/FilterDrawer'

export default function ProgramsPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)

  const openCount = useMemo(() => mockPrograms.filter((p) => p.status === 'open').length, [])

  const activeCount = [
    filters.admission !== 'all',
    filters.continent !== 'all',
    filters.status !== 'all',
  ].filter(Boolean).length

  const activeLabels = getActiveFilterLabels(filters)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return mockPrograms.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.location.country.toLowerCase().includes(q) ||
        p.location.city.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      const matchAdmission = filters.admission === 'all' || p.admissionType === filters.admission
      const matchContinent = filters.continent === 'all' || p.continent === filters.continent
      const matchStatus = filters.status === 'all' || p.status === filters.status
      return matchSearch && matchAdmission && matchContinent && matchStatus
    })
  }, [query, filters])

  const hasActiveFilter = activeCount > 0 || query.length > 0

  function clearAll() {
    setQuery('')
    setFilters(INITIAL_FILTERS)
  }

  return (
    <div className="bg-background text-foreground antialiased">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <HeroSection openCount={openCount} />

      {/* Sticky search + filter bar — offset by navbar height (h-14 = 56px) */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-3">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ค้นหาโปรแกรม, ประเทศ, หัวข้อ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10 w-full rounded-xl"
              />
            </div>

            {/* Filter drawer trigger */}
            <FilterDrawer filters={filters} onChange={setFilters} activeCount={activeCount} />

            {/* Clear — desktop only */}
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-10 px-3 text-xs text-muted-foreground shrink-0 hidden sm:flex"
              >
                <X className="size-3.5 mr-1" />
                ล้างทั้งหมด
              </Button>
            )}
          </div>

          {/* Active filter chips */}
          {activeLabels.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {activeLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full"
                >
                  {label}
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive ml-1 transition-colors sm:hidden"
              >
                ล้างทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Programs grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-8">
        {/* Result count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length > 0
            ? `แสดง ${filtered.length} จาก ${mockPrograms.length} โปรแกรม`
            : 'ไม่พบโปรแกรมที่ตรงกับเงื่อนไข'}
        </p>

        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((program, i) => (
                <ProgramCard key={program.id} program={program} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <p className="text-5xl mb-5">🔍</p>
              <p className="text-lg font-semibold text-foreground mb-1">ไม่พบโปรแกรม</p>
              <p className="text-sm text-muted-foreground mb-6">
                ลองปรับเงื่อนไขการค้นหาหรือตัวกรองใหม่
              </p>
              <Button variant="outline" onClick={clearAll}>
                ล้างตัวกรองทั้งหมด
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
