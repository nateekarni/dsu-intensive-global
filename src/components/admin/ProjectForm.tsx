'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Program } from '@/data/mockPrograms'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Controller } from 'react-hook-form'
import { DynamicStringArray } from './DynamicStringArray'
import { DynamicItinerary } from './DynamicItinerary'
import { DynamicDocumentReqs } from './DynamicDocumentReqs'
import { LocationAutocomplete } from './LocationAutocomplete'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProjectFormProps {
  initialData?: Partial<Program>
  isEditing?: boolean
}

export function ProjectForm({ initialData, isEditing }: ProjectFormProps) {
  const router = useRouter()

  // Transform string arrays into object arrays for react-hook-form useFieldArray
  const defaultValues = {
    ...initialData,
    highlights: initialData?.highlights?.map((v) => ({ value: v })) || [],
    requirements: initialData?.requirements?.map((v) => ({ value: v })) || [],
    tags: initialData?.tags?.map((v) => ({ value: v })) || [],
    price: {
      ...initialData?.price,
      includes: initialData?.price?.includes?.map((v) => ({ value: v })) || [],
      excludes: initialData?.price?.excludes?.map((v) => ({ value: v })) || [],
    },
    itinerary: initialData?.itinerary || [],
    documents: initialData?.documents || [],
  }

  const methods = useForm({ defaultValues })
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods

  // Watch cover image url for preview
  const coverUrl = watch('images.cover')

  const onSubmit = async (data: {
    highlights: { value: string }[]
    requirements: { value: string }[]
    tags: { value: string }[]
    price: { includes: { value: string }[]; excludes: { value: string }[] }
    [key: string]: unknown
  }) => {
    // Transform object arrays back to string arrays
    const formattedData = {
      ...data,
      highlights: data.highlights.map((h) => h.value),
      requirements: data.requirements.map((r) => r.value),
      tags: data.tags.map((t) => t.value),
      price: {
        ...(data.price as object),
        includes: data.price.includes.map((i) => i.value),
        excludes: data.price.excludes.map((e) => e.value),
      },
      // documents is already an array of objects ({id, name, isRequired, templateUrl}) which matches our schema
    }

    console.log('Submitting:', formattedData)
    // Here we would call API to save
    toast.success('บันทึกข้อมูลโครงการสำเร็จ!')
    router.push('/projects')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">ข้อมูลทั่วไป</TabsTrigger>
            <TabsTrigger value="details">รายละเอียดเพิ่มเติม</TabsTrigger>
            <TabsTrigger value="requirements">คุณสมบัติและเอกสาร</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-8 pt-6">
            <div className="space-y-2">
              <Label>รูปหน้าปก</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input {...register('images.cover')} placeholder="https://..." />
                </div>
                {coverUrl && (
                  <div className="relative h-24 w-36 overflow-hidden rounded-md border bg-muted shrink-0">
                    <Image
                      src={coverUrl}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>ชื่อโครงการ</Label>
                <Input {...register('title')} placeholder="กรอกชื่อโครงการ..." required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>รายละเอียดโครงการ</Label>
                <Textarea
                  {...register('description')}
                  rows={5}
                  placeholder="รายละเอียดแบบเจาะลึก..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="space-y-2 flex flex-col">
                <Label>วันเริ่มต้นโครงการ</Label>
                <Controller
                  control={methods.control}
                  name="dates.start"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>ระบุวันเริ่มต้น...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>วันสิ้นสุดโครงการ</Label>
                <Controller
                  control={methods.control}
                  name="dates.end"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>ระบุวันสิ้นสุด...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>สถานที่</Label>
                <Controller
                  control={methods.control}
                  name="location"
                  render={({ field }) => (
                    <LocationAutocomplete
                      value={field.value}
                      onChange={(newLoc) => {
                        field.onChange({ ...field.value, ...newLoc })
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>เปิดรับสมัคร</Label>
                <Controller
                  control={methods.control}
                  name="dates.registrationOpen"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>กำหนดวันเปิดรับสมัคร...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>ปิดรับสมัคร</Label>
                <Controller
                  control={methods.control}
                  name="dates.applicationDeadline"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>กำหนดวันปิดรับสมัคร...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>จำนวนรับสมัครสูงสุด</Label>
                <Input {...register('maxParticipants', { valueAsNumber: true })} type="number" />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Label>สกุลเงิน</Label>
                <Controller
                  control={methods.control}
                  name="price.currency"
                  defaultValue="THB"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสกุลเงิน" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THB">THB - Thai Baht</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>ค่าใช้จ่ายโครงการ</Label>
                <Input {...register('price.amount', { valueAsNumber: true })} type="number" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <DynamicStringArray name="tags" label="แท็ก / หมวดหมู่" />
            </div>
          </TabsContent>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-8 pt-6">
            <div className="space-y-2">
              <DynamicItinerary />
            </div>

            <div className="pt-4 border-t">
              <DynamicStringArray name="highlights" label="จุดเด่นของโครงการ" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
              <DynamicStringArray name="price.includes" label="ราคานี้รวม" />
              <DynamicStringArray name="price.excludes" label="ราคานี้ไม่รวม" />
            </div>
          </TabsContent>

          {/* REQUIREMENT TAB */}
          <TabsContent value="requirements" className="space-y-8 pt-6">
            {/* Eligible Grades */}
            <div className="space-y-3">
              <Label>ชั้นเรียนที่สมัครได้ (ไม่เลือก = ทุกชั้น)</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <Controller
                    key={grade}
                    control={methods.control}
                    name="eligibleGrades"
                    render={({ field }) => {
                      const current: number[] = (field.value as number[]) ?? []
                      const checked = current.includes(grade)
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(
                              checked
                                ? current.filter((g) => g !== grade)
                                : [...current, grade].sort((a, b) => a - b),
                            )
                          }}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            checked
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          ม.{grade}
                        </button>
                      )
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <DynamicStringArray name="requirements" label="คุณสมบัติผู้สมัคร" />
            </div>

            <div className="pt-4 border-t">
              <DynamicDocumentReqs />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-8 border-t">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="px-6 rounded-full"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            {isSubmitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างโครงการ'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
