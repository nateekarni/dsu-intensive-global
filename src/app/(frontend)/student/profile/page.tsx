'use client'

import { useState } from 'react'
import { User, FileText, Upload, Save, AlertCircle, Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Navbar } from '@/components/programs/Navbar'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

// Mock Data
const mockStudent = {
  id: 'stu-001',
  prefixTh: 'นาย',
  firstNameTh: 'ณัฐวงศ์',
  lastNameTh: 'สิทธิ์มงคล',
  prefixEn: 'Mr.',
  firstNameEn: 'Nathawong',
  lastNameEn: 'Sittimongkol',
  birthDate: '2009-03-15',
  weight: 65,
  height: 172,
  nationalId: '1-1020-12345-67-8',
  medicalCondition: '-',
  allergies: 'อาหารทะเล',
  passportNumber: 'AA1234567',
  passportExpiry: '2030-01-01',
  phone: '081-234-5678',
  email: 'nathawong@student.dsu.ac.th',
  lineId: 'nath_wx',
  grade: 10, // ม.4
  room: 1,
  gpa: 3.85,
  parentName: 'นางสุมาลี สิทธิ์มงคล',
  parentPhone: '089-876-5432',
  profilePhoto: null as File | string | null,
}

const mockWalletDocs = [
  {
    id: 'wd-1',
    name: 'สำเนาบัตรประจำตัวประชาชน',
    uploadedAt: '2025-08-10T10:00:00Z',
    size: '1.2 MB',
  },
  { id: 'wd-2', name: 'สำเนาทะเบียนบ้าน', uploadedAt: '2025-08-10T10:05:00Z', size: '2.5 MB' },
]

// Mock configuration options from Admin
const mockGradeOptions = [
  { value: '1', label: 'ม.1' },
  { value: '2', label: 'ม.2' },
  { value: '3', label: 'ม.3' },
  { value: '4', label: 'ม.4' },
  { value: '5', label: 'ม.5' },
  { value: '6', label: 'ม.6' },
]

const mockRoomOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `ห้อง ${i + 1}`,
}))

export default function StudentProfilePage() {
  const [formData, setFormData] = useState(mockStudent)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleProfilePhotoSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]
      if (f) {
        setIsCompressing(true)
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/webp',
          }
          const compressedFile = await imageCompression(f, options)
          setFormData({ ...formData, profilePhoto: compressedFile })
        } catch (error) {
          console.error('Error compressing image:', error)
          alert('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ')
        } finally {
          setIsCompressing(false)
        }
      }
    }
    input.click()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let finalPhotoUrl = formData.profilePhoto

      // If it's a new File, upload it first
      if (formData.profilePhoto instanceof File) {
        const uploadData = new FormData()
        uploadData.append('file', formData.profilePhoto)

        const res = await fetch('/api/upload/profile', {
          method: 'POST',
          body: uploadData,
        })

        if (!res.ok) throw new Error('Failed to upload image')
        const data = await res.json()
        finalPhotoUrl = data.url
      }

      // TODO: Save the rest of formData plus finalPhotoUrl to the database
      // await saveProfileData({ ...formData, profilePhoto: finalPhotoUrl })

      setFormData({ ...formData, profilePhoto: finalPhotoUrl })
      alert('บันทึกข้อมูลเรียบร้อยแล้ว (Mock)')
    } catch (error) {
      console.error('Save error:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      {/* ── Header ── */}
      <div className="bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">ข้อมูลส่วนตัว</h1>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="personal"
                className="rounded-lg text-sm bg-transparent data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
              >
                <User className="size-4" />
                ข้อมูลทั่วไป
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-lg text-sm bg-transparent data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
              >
                <FileText className="size-4" />
                กระเป๋าเอกสาร
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="shadow-sm border-border/60">
                <form onSubmit={handleSave}>
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle>แก้ไขข้อมูลส่วนตัว</CardTitle>
                    <CardDescription>
                      ข้อมูลนี้จะถูกนำไปใช้อัตโนมัติเมื่อคุณสมัครโครงการใหม่
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    {/* รูปโปรไฟล์ */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        รูปโปรไฟล์ (Profile Photo)
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                        <div className="relative shrink-0">
                          {formData.profilePhoto ? (
                            <Image
                              src={
                                typeof formData.profilePhoto === 'string'
                                  ? formData.profilePhoto
                                  : URL.createObjectURL(formData.profilePhoto)
                              }
                              alt="profile"
                              width={96}
                              height={96}
                              className="size-24 rounded-full object-cover border-4 border-border"
                              unoptimized={typeof formData.profilePhoto !== 'string'}
                            />
                          ) : (
                            <div className="size-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                              <User className="size-10 text-muted-foreground/40" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleProfilePhotoSelect}
                            disabled={isCompressing}
                            className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isCompressing ? (
                              <div className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Upload className="size-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-sm font-medium">อัปโหลดรูปภาพถ่าย</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ไฟล์ JPG หรือ PNG แนะนำให้ใช้รูปตรง ไม่เกิน 2MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={handleProfilePhotoSelect}
                            disabled={isCompressing}
                          >
                            {isCompressing ? (
                              <>
                                <div className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1.5" />
                                กำลังจัดการ...
                              </>
                            ) : (
                              <>
                                <Upload className="size-3.5 mr-1.5" />
                                เลือกรูปภาพ
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลส่วนตัวพื้นฐาน (Personal Info) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลส่วนตัวพื้นฐาน (Personal Information)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>คำนำหน้า (TH)</Label>
                          <Select
                            value={formData.prefixTh}
                            onValueChange={(v) => setFormData({ ...formData, prefixTh: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกคำนำหน้า" />
                            </SelectTrigger>
                            <SelectContent>
                              {['เด็กชาย', 'เด็กหญิง', 'นาย', 'นาง', 'นางสาว'].map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>ชื่อ (TH)</Label>
                          <Input
                            value={formData.firstNameTh}
                            onChange={(e) =>
                              setFormData({ ...formData, firstNameTh: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>นามสกุล (TH)</Label>
                          <Input
                            value={formData.lastNameTh}
                            onChange={(e) =>
                              setFormData({ ...formData, lastNameTh: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>Prefix (EN)</Label>
                          <Select
                            value={formData.prefixEn}
                            onValueChange={(v) => setFormData({ ...formData, prefixEn: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือก Prefix" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Master', 'Miss', 'Mr.', 'Mrs.', 'Ms.'].map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>First Name (EN)</Label>
                          <Input
                            value={formData.firstNameEn}
                            onChange={(e) =>
                              setFormData({ ...formData, firstNameEn: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Last Name (EN)</Label>
                          <Input
                            value={formData.lastNameEn}
                            onChange={(e) =>
                              setFormData({ ...formData, lastNameEn: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>วันเดือนปีเกิด (พ.ศ.)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !formData.birthDate && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.birthDate ? (
                                  `${format(new Date(formData.birthDate), 'd MMMM yyyy', {
                                    locale: th,
                                  }).replace(/(\d{4})$/, (year) =>
                                    (parseInt(year) + 543).toString(),
                                  )}`
                                ) : (
                                  <span>เลือกวันเกิด</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                startMonth={new Date(1990, 0)}
                                endMonth={new Date()}
                                selected={
                                  formData.birthDate ? new Date(formData.birthDate) : undefined
                                }
                                onSelect={(date) =>
                                  setFormData({
                                    ...formData,
                                    birthDate: date ? format(date, 'yyyy-MM-dd') : '',
                                  })
                                }
                                defaultMonth={
                                  formData.birthDate
                                    ? new Date(formData.birthDate)
                                    : new Date(2005, 0)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-1.5">
                          <Label>เลขประจำตัวประชาชน</Label>
                          <Input
                            value={formData.nationalId}
                            onChange={(e) =>
                              setFormData({ ...formData, nationalId: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลสุขภาพและร่างกาย (Physical & Health) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลสุขภาพและร่างกาย (Health & Physical)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label>ส่วนสูง (cm)</Label>
                          <Input
                            type="number"
                            value={formData.height}
                            onChange={(e) =>
                              setFormData({ ...formData, height: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>น้ำหนัก (kg)</Label>
                          <Input
                            type="number"
                            value={formData.weight}
                            onChange={(e) =>
                              setFormData({ ...formData, weight: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label>โรคประจำตัว</Label>
                          <Input
                            value={formData.medicalCondition}
                            onChange={(e) =>
                              setFormData({ ...formData, medicalCondition: e.target.value })
                            }
                            placeholder="ระบุ '-' หากไม่มี"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-4">
                          <Label>การแพ้อาการ (แพ้ยา/แพ้อาหาร)</Label>
                          <Input
                            value={formData.allergies}
                            onChange={(e) =>
                              setFormData({ ...formData, allergies: e.target.value })
                            }
                            placeholder="ระบุ '-' หากไม่มี"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลการศึกษา (Academic Info) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลการศึกษา (Academic Information)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>ชั้นเรียน</Label>
                          <Select
                            value={String(formData.grade)}
                            onValueChange={(val) =>
                              setFormData({ ...formData, grade: Number(val) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกชั้นปี" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockGradeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>ห้องเรียน</Label>
                          <Select
                            value={String(formData.room)}
                            onValueChange={(val) => setFormData({ ...formData, room: Number(val) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกห้อง" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockRoomOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>เกรดเฉลี่ย (GPA)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            max={4}
                            value={formData.gpa}
                            onChange={(e) =>
                              setFormData({ ...formData, gpa: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลพาสปอร์ต (Travel Info) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลการเดินทาง (Travel Information)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>เลขพาสปอร์ต (Passport No.)</Label>
                          <Input
                            value={formData.passportNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, passportNumber: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <Label>วันหมดอายุพาสปอร์ต</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !formData.passportExpiry && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.passportExpiry ? (
                                  `${format(new Date(formData.passportExpiry), 'd MMMM yyyy', {
                                    locale: th,
                                  }).replace(/(\d{4})$/, (year) =>
                                    (parseInt(year) + 543).toString(),
                                  )}`
                                ) : (
                                  <span>เลือกวันหมดอายุ</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                startMonth={new Date(2020, 0)}
                                endMonth={new Date(2040, 11)}
                                selected={
                                  formData.passportExpiry
                                    ? new Date(formData.passportExpiry)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  setFormData({
                                    ...formData,
                                    passportExpiry: date ? format(date, 'yyyy-MM-dd') : '',
                                  })
                                }
                                defaultMonth={
                                  formData.passportExpiry
                                    ? new Date(formData.passportExpiry)
                                    : new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลการติดต่อ (Contact Info) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลการติดต่อผู้สมัคร (Student Contact)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label>อีเมล</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>เบอร์โทรติดต่อ</Label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>LINE ID</Label>
                          <Input
                            value={formData.lineId}
                            onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลผู้ปกครอง (Parent Info) */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                        ข้อมูลผู้ติดตาม/ผู้ปกครอง (Parent / Guardian)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>ชื่อ-นามสกุลผู้ปกครอง</Label>
                          <Input
                            value={formData.parentName}
                            onChange={(e) =>
                              setFormData({ ...formData, parentName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>เบอร์โทรผู้ปกครอง</Label>
                          <Input
                            type="tel"
                            value={formData.parentPhone}
                            onChange={(e) =>
                              setFormData({ ...formData, parentPhone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <Button type="submit" className="min-w-[120px]" disabled={isSaving}>
                        {isSaving ? (
                          'กำลังบันทึก...'
                        ) : (
                          <>
                            <Save className="size-4 mr-2" /> บันทึกข้อมูล
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle>กระเป๋าเอกสาร (My Documents)</CardTitle>
                  <CardDescription>
                    ไฟล์ที่คุณอัปโหลดเก็บไว้ที่นี่ สามารถเลือกดึงไปใช้ประกอบการสมัครโครงการต่างๆ
                    ได้ทันที
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-xl p-8 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="size-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-base mb-1">
                      คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      รองรับ PDF, JPG, PNG ขนาดไม่เกิน 5MB
                    </p>
                    <Button variant="outline" size="sm">
                      เลือกไฟล์จากเครื่อง
                    </Button>
                  </div>

                  {/* File List */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">เอกสารที่บันทึกไว้</h3>
                    {mockWalletDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border bg-background shadow-sm group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Upload className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-lg flex gap-3 text-sm mt-6">
                    <AlertCircle className="size-5 shrink-0" />
                    <p>
                      ข้อแนะนำ: ควรตั้งชื่อไฟล์ให้อ่านง่าย เช่น{' '}
                      <i>&quot;สำเนาบัตรประชาชน_สมชาย&quot;</i>{' '}
                      เพื่อให้สะดวกต่อการค้นหาและนำไปใช้สมัครโครงการ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
