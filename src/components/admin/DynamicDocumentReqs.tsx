'use client'

import { useFieldArray, useFormContext, Controller } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function DynamicDocumentReqs() {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">รายการเอกสารที่ต้องอัปโหลด</Label>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-lg border p-4 bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="space-y-2 md:col-span-2 pr-8">
                <Label>ชื่อเอกสาร</Label>
                <Input
                  {...register(`documents.${index}.name`)}
                  placeholder="e.g. สำเนาพาสปอร์ต"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>ลิงก์ไฟล์เทมเพลต</Label>
                <Input
                  {...register(`documents.${index}.templateUrl`)}
                  placeholder="https://... (เว้นว่างได้ถ้าไม่มีเทมเพลต)"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 md:col-span-2">
                <Controller
                  control={control}
                  name={`documents.${index}.isRequired`}
                  defaultValue={true}
                  render={({ field: switchField }) => (
                    <Switch checked={switchField.value} onCheckedChange={switchField.onChange} />
                  )}
                />
                <Label className="font-normal mb-0">บังคับให้อัปโหลด</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: crypto.randomUUID(), name: '', isRequired: true, templateUrl: '' })
        }
      >
        <Plus className="mr-2 h-4 w-4" /> เพิ่มเอกสาร
      </Button>
    </div>
  )
}
