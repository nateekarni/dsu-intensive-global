'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface GeoResult {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

interface LocationValue {
  city?: string
  country?: string
  countryCode?: string
}

interface LocationAutocompleteProps {
  value?: LocationValue
  onChange: (value: { city: string; country: string; countryCode: string }) => void
}

export function LocationAutocomplete({ value, onChange }: LocationAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<GeoResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedLabel = React.useMemo(() => {
    if (value?.city && value?.country) return `${value.city}, ${value.country}`
    if (value?.city) return value.city
    if (value?.country) return value.country
    return ''
  }, [value])

  const search = React.useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`
      const res = await fetch(url)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce API calls
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel ? (
            selectedLabel
          ) : (
            <span className="text-muted-foreground">ค้นหาสถานที่...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="พิมพ์ชื่อเมือง หรือประเทศ..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังค้นหา...</span>
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <CommandEmpty>ไม่พบสถานที่นี้</CommandEmpty>
            ) : query.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
              </div>
            ) : (
              <CommandGroup>
                {results.map((loc) => {
                  const label = loc.admin1
                    ? `${loc.name}, ${loc.admin1}, ${loc.country}`
                    : `${loc.name}, ${loc.country}`
                  const isSelected = value?.city === loc.name && value?.country === loc.country
                  return (
                    <CommandItem
                      key={loc.id}
                      value={String(loc.id)}
                      onSelect={() => {
                        onChange({
                          city: loc.name,
                          country: loc.country,
                          countryCode: '',
                        })
                        setOpen(false)
                        setQuery('')
                      }}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      <span>{label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
