'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DynamicStringArrayProps {
  name: string
  label: string
  placeholder?: string
}

export function DynamicStringArray({ name, label, placeholder }: DynamicStringArrayProps) {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    // The field array expects an array of objects. Since our schema maps to string[],
    // we use a workaround where we store { value: string } and map it back on submit,
    // OR just use it directly if hookform allows it. In react-hook-form v7, useFieldArray requires objects.
    name: name,
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            {...register(`${name}.${index}.value`)}
            placeholder={placeholder || `Item ${index + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
        <Plus className="mr-2 h-4 w-4" /> เพิ่ม {label}
      </Button>
    </div>
  )
}
