'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function DynamicItinerary() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itinerary',
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">กำหนดการ</Label>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-lg border p-4 bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute right-2 top-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid gap-4 pr-10">
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="space-y-2">
                  <Label>วันที่</Label>
                  <Input
                    type="number"
                    {...register(`itinerary.${index}.day`, { valueAsNumber: true })}
                    placeholder="e.g. 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>หัวข้อ</Label>
                  <Input
                    {...register(`itinerary.${index}.title`)}
                    placeholder="e.g. Arrival in Tokyo"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>รายละเอียดวันกิจกรรม</Label>
                <Textarea
                  {...register(`itinerary.${index}.description`)}
                  placeholder="Details of the day's activities..."
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ day: fields.length + 1, title: '', description: '' })}
      >
        <Plus className="mr-2 h-4 w-4" /> เพิ่มวันที่
      </Button>
    </div>
  )
}
