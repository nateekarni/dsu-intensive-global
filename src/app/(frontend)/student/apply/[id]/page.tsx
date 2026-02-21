'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CalendarIcon,
  User,
  Plane,
  Heart,
  BookOpen,
  Phone,
  Users,
  FileText,
  Upload,
  Trash2,
  BanknoteIcon,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { mockPrograms } from '@/data/mockPrograms'
import { Navbar } from '@/components/programs/Navbar'

// ─── Mock data (will come from API/Backend) ──────────────────────────────────────
const mockStudentProfile = {
  prefixTh: 'นาย',
  firstNameTh: 'ณัฐวงศ์',
  lastNameTh: 'สิทธิ์มงคล',
  prefixEn: 'Mr.',
  firstNameEn: 'Nathawong',
  lastNameEn: 'Sittimongkol',
  birthDate: '2009-03-15',
  nationalId: '1-1020-12345-67-8',
  height: 172,
  weight: 65,
  medicalCondition: '-',
  allergies: 'อาหารทะเล',
  passportNumber: 'AA1234567',
  passportExpiry: '2030-01-01',
  phone: '081-234-5678',
  email: 'nathawong@student.dsu.ac.th',
  lineId: 'nath_wx',
  grade: 4, // ม.4
  room: 1,
  gpa: 3.85,
  parentName: 'นางสุมาลี สิทธิ์มงคล',
  parentPhone: '089-876-5432',
}

const gradeOptions = [
  { value: '1', label: 'ม.1' },
  { value: '2', label: 'ม.2' },
  { value: '3', label: 'ม.3' },
  { value: '4', label: 'ม.4' },
  { value: '5', label: 'ม.5' },
  { value: '6', label: 'ม.6' },
]
const roomOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `ห้อง ${i + 1}`,
}))

const REFERRAL_OPTIONS = [
  'เพื่อน/รุ่นพี่แนะนำ',
  'ครู/อาจารย์แนะนำ',
  'เว็บไซต์โรงเรียน',
  'Facebook / Instagram',
  'โปสเตอร์/จุลสาร',
  'อื่นๆ',
]

// ─── Stepper Icons & Config ───────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'ข้อมูลส่วนตัว', icon: User },
  { id: 2, title: 'เงื่อนไขและความสนใจ', icon: CheckCircle2 },
  { id: 3, title: 'เอกสาร & ชำระเงิน', icon: FileText },
]

// ─── DatePicker helper ────────────────────────────────────────────────────────
function formatBE(isoDate: string) {
  return format(new Date(isoDate), 'd MMMM yyyy', { locale: th }).replace(/(\d{4})$/, (y) =>
    (parseInt(y) + 543).toString(),
  )
}

function DatePickerField({
  label,
  value,
  onChange,
  startYear = 1990,
  endYear = 2040,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  startYear?: number
  endYear?: number
}) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {value ? formatBE(value) : <span>เลือกวันที่</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(startYear, 0)}
            endMonth={new Date(endYear, 11)}
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
            defaultMonth={value ? new Date(value) : new Date(2005, 0)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="size-3.5" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
    </div>
  )
}

// ─── Upload Area ───────────────────────────────────────────────────────────────
function UploadRow({
  name,
  isRequired,
  file,
  onUpload,
  onRemove,
}: {
  name: string
  isRequired: boolean
  file?: File | null
  onUpload: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{name}</span>
          {isRequired && (
            <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded uppercase font-semibold shrink-0">
              จำเป็น
            </span>
          )}
        </div>
        {file && (
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {file ? (
          <>
            <Badge
              variant="outline"
              className="text-xs bg-success/10 text-success border-success/20"
            >
              อัปโหลดแล้ว
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="size-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUpload}
            className="text-xs h-8"
          >
            <Upload className="size-3.5 mr-1.5" />
            อัปโหลด
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const program = mockPrograms.find((p) => p.id === id)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Step 1: Personal Info
  const [personal, setPersonal] = useState<typeof mockStudentProfile>({
    ...mockStudentProfile,
  })

  // Step 2: Consent & Motivation
  const [checkedTerms, setCheckedTerms] = useState<Record<string, boolean>>({})
  const [referral, setReferral] = useState('')
  const [motivation, setMotivation] = useState('')

  // Step 3: Documents & Payment
  type DocFiles = Record<string, File | null>
  const [docFiles, setDocFiles] = useState<DocFiles>({})
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash' | ''>('')

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">ไม่พบโครงการ</p>
      </div>
    )
  }

  const terms: string[] = program.terms ?? []
  const docs = program.documents ?? []

  const allTermsChecked = terms.length === 0 || terms.every((t) => checkedTerms[t])
  const step2Valid = allTermsChecked && referral && motivation.trim().length >= 20
  const step3Valid = paymentMethod !== ''

  const canProceed = step === 1 || (step === 2 && step2Valid) || (step === 3 && step3Valid)

  function handleNext() {
    if (step < 3) setStep((s) => s + 1)
    else handleSubmit()
  }

  function handleSubmit() {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  function setP(field: string, value: unknown) {
    setPersonal((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center gap-6">
          <div className="size-20 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">ส่งใบสมัครเรียบร้อยแล้ว!</h1>
            <p className="text-muted-foreground max-w-sm">
              ระบบได้บันทึกการสมัครของคุณแล้ว แอดมินจะดำเนินการตรวจสอบและติดต่อกลับ
            </p>
          </div>
          <Button onClick={() => router.push('/student/applications')}>ดูสถานะการสมัคร</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <div className="bg-muted/30 border-b border-border min-h-screen pb-24 sm:pb-16">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full size-9 bg-background shadow-sm border border-border shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                สมัครเข้าร่วม: {program.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {program.location.city}, {program.location.country}
              </p>
            </div>
          </div>

          {/* ── Stepper ── */}
          <div className="hidden md:flex items-center mb-8">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center border-2 transition-all',
                      step > s.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : step === s.id
                          ? 'bg-background border-primary text-primary'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground/50',
                    )}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <s.icon className="size-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium whitespace-nowrap hidden sm:block',
                      step === s.id
                        ? 'text-primary'
                        : step > s.id
                          ? 'text-foreground'
                          : 'text-muted-foreground/50',
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all',
                      'hidden sm:block', // hide pipeline on mobile — step info is in bottom nav
                      step > s.id ? 'bg-primary' : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Personal Info */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <User className="size-3.5" />
                    </div>
                    ข้อมูลส่วนตัวพื้นฐาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>คำนำหน้า</Label>
                      <Select value={personal.prefixTh} onValueChange={(v) => setP('prefixTh', v)}>
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
                    {[
                      { label: 'ชื่อ', key: 'firstNameTh' },
                      { label: 'นามสกุล', key: 'lastNameTh' },
                    ].map(({ label, key }) => (
                      <div key={key} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input
                          value={(personal as Record<string, unknown>)[key] as string}
                          onChange={(e) => setP(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Prefix</Label>
                      <Select value={personal.prefixEn} onValueChange={(v) => setP('prefixEn', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก Prefix" />
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
                    {[
                      { label: 'First Name', key: 'firstNameEn' },
                      { label: 'Last Name', key: 'lastNameEn' },
                    ].map(({ label, key }) => (
                      <div key={key} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input
                          value={(personal as Record<string, unknown>)[key] as string}
                          onChange={(e) => setP(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePickerField
                      label="วันเดือนปีเกิด (พ.ศ.)"
                      value={personal.birthDate}
                      onChange={(v) => setP('birthDate', v)}
                      startYear={1990}
                      endYear={2015}
                    />
                    <div className="space-y-1.5">
                      <Label>เลขประจำตัวประชาชน</Label>
                      <Input
                        value={personal.nationalId}
                        onChange={(e) => setP('nationalId', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Heart className="size-3.5" />
                    </div>
                    ข้อมูลสุขภาพและร่างกาย
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>ส่วนสูง (cm)</Label>
                      <Input
                        type="number"
                        value={personal.height}
                        onChange={(e) => setP('height', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>น้ำหนัก (kg)</Label>
                      <Input
                        type="number"
                        value={personal.weight}
                        onChange={(e) => setP('weight', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>โรคประจำตัว</Label>
                    <Input
                      value={personal.medicalCondition}
                      onChange={(e) => setP('medicalCondition', e.target.value)}
                      placeholder="ระบุ '-' หากไม่มี"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>การแพ้อาการ (แพ้ยา/แพ้อาหาร)</Label>
                    <Input
                      value={personal.allergies}
                      onChange={(e) => setP('allergies', e.target.value)}
                      placeholder="ระบุ '-' หากไม่มี"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="size-3.5" />
                    </div>
                    ข้อมูลการศึกษา
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>ชั้นเรียน</Label>
                      <Select
                        value={String(personal.grade)}
                        onValueChange={(v) => setP('grade', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกชั้น" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>ห้องเรียน</Label>
                      <Select
                        value={String(personal.room)}
                        onValueChange={(v) => setP('room', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกห้อง" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* GPA: full-width row on mobile, 3rd col on sm+ */}
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label>เกรดเฉลี่ย (GPA)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={4}
                        value={personal.gpa}
                        onChange={(e) => setP('gpa', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Travel */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Plane className="size-3.5" />
                    </div>
                    ข้อมูลการเดินทาง
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>เลขพาสปอร์ต</Label>
                      <Input
                        value={personal.passportNumber}
                        onChange={(e) => setP('passportNumber', e.target.value)}
                      />
                    </div>
                    <DatePickerField
                      label="วันหมดอายุพาสปอร์ต (พ.ศ.)"
                      value={personal.passportExpiry}
                      onChange={(v) => setP('passportExpiry', v)}
                      startYear={2020}
                      endYear={2040}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Phone className="size-3.5" />
                    </div>
                    ข้อมูลการติดต่อผู้สมัคร
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>อีเมล</Label>
                      <Input
                        type="email"
                        value={personal.email}
                        onChange={(e) => setP('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>เบอร์โทรศัพท์</Label>
                      <Input
                        type="tel"
                        value={personal.phone}
                        onChange={(e) => setP('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>LINE ID</Label>
                      <Input
                        value={personal.lineId}
                        onChange={(e) => setP('lineId', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="size-3.5" />
                    </div>
                    ข้อมูลผู้ปกครอง
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>ชื่อ-นามสกุลผู้ปกครอง</Label>
                      <Input
                        value={personal.parentName}
                        onChange={(e) => setP('parentName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>เบอร์โทรผู้ปกครอง</Label>
                      <Input
                        type="tel"
                        value={personal.parentPhone}
                        onChange={(e) => setP('parentPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Step 2: Terms & Motivation ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Terms */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle>เงื่อนไขการเข้าร่วมโครงการ</CardTitle>
                  <CardDescription>
                    กรุณาอ่านและยืนยันว่าคุณเข้าใจและยอมรับเงื่อนไขทุกข้อ
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  {terms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      โครงการนี้ไม่มีเงื่อนไขเพิ่มเติม
                    </p>
                  ) : (
                    terms.map((term) => (
                      <div
                        key={term}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                          checkedTerms[term]
                            ? 'bg-primary/5 border-primary/30'
                            : 'bg-muted/20 border-border hover:bg-muted/40',
                        )}
                        onClick={() =>
                          setCheckedTerms((prev) => ({ ...prev, [term]: !prev[term] }))
                        }
                      >
                        <Checkbox
                          id={term}
                          checked={!!checkedTerms[term]}
                          onCheckedChange={(checked) =>
                            setCheckedTerms((prev) => ({ ...prev, [term]: !!checked }))
                          }
                          className="mt-0.5 shrink-0"
                        />
                        <label
                          htmlFor={term}
                          className="text-sm leading-relaxed cursor-pointer select-none"
                        >
                          {term}
                        </label>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Referral + Motivation (merged card) */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-base">ความสนใจในโครงการนี้</CardTitle>
                  <CardDescription>กรอกข้อมูลเพื่อประกอบการพิจารณาใบสมัคร</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  {/* Referral — now a Select */}
                  <div className="space-y-1.5">
                    <Label htmlFor="referral">คุณรู้จักโครงการนี้จากช่องทางไหน?</Label>
                    <Select value={referral} onValueChange={setReferral}>
                      <SelectTrigger id="referral">
                        <SelectValue placeholder="เลือกช่องทางที่รู้จัก" />
                      </SelectTrigger>
                      <SelectContent>
                        {REFERRAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Motivation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="motivation">เหตุผลที่สนใจสมัครโครงการนี้</Label>
                    <Textarea
                      id="motivation"
                      placeholder="อธิบายเหตุผลที่คุณต้องการเข้าร่วมโครงการนี้..."
                      rows={5}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      className="resize-none"
                    />
                    <p
                      className={cn(
                        'text-xs text-right',
                        motivation.length >= 20 ? 'text-success' : 'text-muted-foreground',
                      )}
                    >
                      {motivation.length} / 20+ ตัวอักษร
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Step 3: Documents & Payment ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Documents */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/20">
                  <CardTitle>เอกสารประกอบการสมัคร</CardTitle>
                  <CardDescription>อัปโหลดไฟล์ PDF, JPG, หรือ PNG ขนาดไม่เกิน 5 MB</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  {docs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      โครงการนี้ไม่ต้องการเอกสารเพิ่มเติม
                    </p>
                  ) : (
                    docs.map((doc) => (
                      <UploadRow
                        key={doc.id}
                        name={doc.name}
                        isRequired={doc.isRequired}
                        file={docFiles[doc.id]}
                        onUpload={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'application/pdf,image/*'
                          input.onchange = (e) => {
                            const f = (e.target as HTMLInputElement).files?.[0]
                            if (f) setDocFiles((prev) => ({ ...prev, [doc.id]: f }))
                          }
                          input.click()
                        }}
                        onRemove={() => setDocFiles((prev) => ({ ...prev, [doc.id]: null }))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="shadow-sm border-border/60 border-primary/20">
                <CardHeader className="border-b border-border/40 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>การชำระเงิน</CardTitle>
                      <CardDescription className="mt-1">
                        ค่าเข้าร่วมโครงการ:{' '}
                        <span className="font-bold text-foreground">
                          {typeof program.price === 'object'
                            ? program.price.displayPrice
                            : `฿${(program.price as number).toLocaleString()}`}
                        </span>
                      </CardDescription>
                    </div>
                    <BanknoteIcon className="size-6 text-primary opacity-70" />
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {/* Payment method */}
                  <div className="space-y-2">
                    <Label>ช่องทางการชำระเงิน</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        [
                          {
                            value: 'transfer',
                            label: 'โอนเงินผ่านธนาคาร',
                            desc: 'อัปโหลดสลิปการโอน',
                          },
                          {
                            value: 'cash',
                            label: 'ชำระเงินสดที่โรงเรียน',
                            desc: 'นัดหมายกับครูผู้ดูแล',
                          },
                        ] as const
                      ).map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          className={cn(
                            'flex flex-col items-start gap-0.5 p-4 rounded-xl border-2 transition-all text-left',
                            paymentMethod === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-muted/20 hover:bg-muted/40',
                          )}
                        >
                          <span className="text-sm font-semibold">{method.label}</span>
                          <span className="text-xs text-muted-foreground">{method.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slip upload — only for transfer */}
                  {paymentMethod === 'transfer' && (
                    <div className="space-y-2">
                      <Label>หลักฐานการโอนเงิน (สลิป)</Label>
                      {paymentSlip ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                          <FileText className="size-4 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{paymentSlip.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setPaymentSlip(null)}
                            className="size-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-border rounded-xl p-6 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center text-center cursor-pointer gap-3"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*,application/pdf'
                            input.onchange = (e) => {
                              const f = (e.target as HTMLInputElement).files?.[0]
                              if (f) setPaymentSlip(f)
                            }
                            input.click()
                          }}
                        >
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">คลิกเพื่ออัปโหลดสลิป</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              JPG, PNG, PDF ขนาดไม่เกิน 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                      <p className="font-medium mb-1">📌 สำหรับการชำระเงินสด</p>
                      <p>
                        กรุณาติดต่อ <strong>{program.coordinator.name}</strong> (
                        {program.coordinator.email}) เพื่อนัดหมายชำระเงิน หลังจากส่งใบสมัครแล้ว
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Navigation: Inline on desktop, sticky bottom bar on mobile ── */}

          {/* Desktop inline nav (hidden on mobile) */}
          <div className="hidden sm:flex mt-6 items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                'กำลังส่ง...'
              ) : step === 3 ? (
                <>
                  ส่งใบสมัคร <ChevronRight className="size-4" />
                </>
              ) : (
                <>
                  ถัดไป <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* Step indicator — desktop only */}
          <p className="hidden sm:block text-center text-xs text-muted-foreground mt-4">
            ขั้นตอน {step} / {STEPS.length}
          </p>
        </div>
      </div>

      {/* Mobile sticky bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex items-center gap-3 safe-area-inset-bottom">
        <div className="flex flex-col items-start flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">
            ขั้นตอน {step} / {STEPS.length}
          </p>
          <p className="text-xs font-medium text-foreground truncate">{STEPS[step - 1].title}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          className="gap-1.5 shrink-0"
        >
          <ArrowLeft className="size-3.5" />
          {step === 1 ? 'ยกเลิก' : 'ย้อน'}
        </Button>
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="gap-1.5 shrink-0 min-w-[100px]"
        >
          {isSubmitting ? (
            'กำลังส่ง...'
          ) : step === 3 ? (
            <>
              ส่งใบสมัคร <ChevronRight className="size-3.5" />
            </>
          ) : (
            <>
              ถัดไป <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
