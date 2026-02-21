'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  Banknote,
  ExternalLink,
  PhoneCall,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  mockApplicants,
  mockRequiredDocIds,
  isComplete,
  DocumentStatus,
} from '@/data/mockApplicants'
import { mockPrograms } from '@/data/mockPrograms'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { toast } from 'sonner'

function isImageUrl(url: string) {
  return (
    /\.(jpe?g|png|gif|webp|avif|svg)($|\?)/i.test(url) ||
    url.includes('unsplash.com') ||
    url.includes('picsum')
  )
}

function DocStatusPill({ status }: { status: DocumentStatus }) {
  if (status === 'approved')
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#dcfce7', color: '#166534' }}
      >
        <Check className="h-3 w-3" /> อนุมัติแล้ว
      </span>
    )
  if (status === 'rejected')
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
      >
        <X className="h-3 w-3" /> ปฏิเสธ
      </span>
    )
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}
    >
      รอตรวจสอบ
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
      <p className="font-medium text-sm">{value ?? '—'}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  )
}

function toBEYear(dateStr: string) {
  return format(new Date(dateStr), 'd MMMM yyyy', { locale: th }).replace(/\d{4}$/, (y) =>
    String(Number(y) + 543),
  )
}

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicantId: string }>
}) {
  const { id, applicantId } = use(params)
  const project = mockPrograms.find((p) => p.id === id)
  const initialApplicant = mockApplicants.find((a) => a.id === applicantId)

  const [docs, setDocs] = useState(initialApplicant?.documents ?? [])
  const [payment, setPayment] = useState(initialApplicant?.payment ?? { method: null })
  const [interview, setInterview] = useState(initialApplicant?.interview ?? {})
  const [scoreInput, setScoreInput] = useState(String(initialApplicant?.interview?.score ?? ''))
  const [notesInput, setNotesInput] = useState(initialApplicant?.interview?.notes ?? '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!initialApplicant) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        ไม่พบข้อมูลผู้สมัครนี้
      </div>
    )
  }

  const s = initialApplicant.student
  const requiredDocIds = mockRequiredDocIds[id] ?? []
  const complete = isComplete(docs, requiredDocIds)

  const handleDocAction = (docId: string, action: DocumentStatus) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.documentId === docId ? { ...d, status: action, reviewedAt: new Date().toISOString() } : d,
      ),
    )
    toast.success(action === 'approved' ? 'อนุมัติเอกสารแล้ว' : 'ปฏิเสธเอกสารแล้ว')
  }

  const handleCashPayment = () => {
    setPayment({ method: 'cash', paidAt: new Date().toISOString(), amount: project?.price.amount })
    toast.success('บันทึกการชำระเงินสดเรียบร้อยแล้ว')
  }

  const handleInterviewResult = (result: 'passed' | 'failed') => {
    const score = Number(scoreInput)
    if (isNaN(score) || score < 0 || score > (interview.maxScore ?? 100)) {
      toast.error('กรุณากรอกคะแนนให้ถูกต้อง')
      return
    }
    setInterview((prev) => ({
      ...prev,
      score,
      maxScore: prev.maxScore ?? 100,
      result,
      notes: notesInput,
      interviewDate: prev.interviewDate ?? new Date().toISOString(),
    }))
    toast.success(result === 'passed' ? 'ผ่านการคัดเลือก' : 'ไม่ผ่านการคัดเลือก')
  }

  return (
    <div className="w-full space-y-5 py-8 px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
          <Link href={`/projects/${id}/applicants`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            <Link href={`/projects/${id}/applicants`} className="hover:underline">
              ผู้สมัคร
            </Link>
            {' / '}
            {s.prefixTh}
            {s.firstNameTh} {s.lastNameTh}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="text-2xl font-bold">
              {s.prefixTh}
              {s.firstNameTh} {s.lastNameTh}
            </h1>
            {complete ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: '#dcfce7', color: '#166534' }}
              >
                <Check className="h-3 w-3" /> สมบูรณ์
              </span>
            ) : (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}
              >
                ไม่สมบูรณ์
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ════════════ Left: Student Info ════════════ */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">ข้อมูลนักเรียน</h2>

          <SectionCard title="ชื่อ">
            <InfoRow label="คำนำหน้า (ไทย)" value={s.prefixTh} />
            <InfoRow label="คำนำหน้า (Eng)" value={s.prefixEn} />
            <InfoRow label="ชื่อ (ไทย)" value={s.firstNameTh} />
            <InfoRow label="ชื่อ (Eng)" value={s.firstNameEn} />
            <InfoRow label="นามสกุล (ไทย)" value={s.lastNameTh} />
            <InfoRow label="นามสกุล (Eng)" value={s.lastNameEn} />
          </SectionCard>

          <SectionCard title="ข้อมูลส่วนตัว">
            <InfoRow label="วันเดือนปีเกิด (พ.ศ.)" value={toBEYear(s.birthDate)} />
            <InfoRow label="ชั้นเรียน" value={`ม.${s.grade}/${s.room}`} />
            <InfoRow label="น้ำหนัก" value={`${s.weight} กก.`} />
            <InfoRow label="ส่วนสูง" value={`${s.height} ซม.`} />
            <InfoRow label="เกรดเฉลี่ย" value={s.gpa?.toFixed(2)} />
          </SectionCard>

          <SectionCard title="เอกสารประจำตัว">
            <InfoRow label="เลขประจำตัวประชาชน" value={s.nationalId} />
            <InfoRow label="เลขพาสปอร์ต" value={s.passportNumber} />
          </SectionCard>

          <SectionCard title="ข้อมูลติดต่อ">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">เบอร์โทรติดต่อ</p>
              <p className="font-medium text-sm flex items-center gap-1.5">
                {s.phone}
                <a href={`tel:${s.phone}`} className="text-primary">
                  <PhoneCall className="h-3.5 w-3.5" />
                </a>
              </p>
            </div>
            <InfoRow label="Email" value={s.email} />
            <InfoRow label="Line ID" value={s.lineId} />
          </SectionCard>

          <SectionCard title="ข้อมูลสุขภาพ">
            <InfoRow label="การแพ้อาหาร" value={s.allergies || 'ไม่มี'} />
            <InfoRow label="โรคประจำตัว" value={s.medicalConditions || 'ไม่มี'} />
          </SectionCard>

          <SectionCard title="ข้อมูลผู้ปกครอง">
            <InfoRow label="ชื่อ-นามสกุลผู้ปกครอง" value={s.parentName} />
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">เบอร์โทรผู้ปกครอง</p>
              <p className="font-medium text-sm flex items-center gap-1.5">
                {s.parentPhone}
                <a href={`tel:${s.parentPhone}`} className="text-primary">
                  <PhoneCall className="h-3.5 w-3.5" />
                </a>
              </p>
            </div>
          </SectionCard>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-muted-foreground text-xs mb-0.5">วันที่สมัคร</p>
            <p className="font-medium text-sm">
              {format(new Date(initialApplicant.appliedAt), "d MMMM yyyy, HH:mm 'น.'", {
                locale: th,
              })}
            </p>
          </div>
        </div>

        {/* ════════════ Right: Documents & Payment ════════════ */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">เอกสาร &amp; การชำระเงิน</h2>

          {/* Documents */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              เอกสารที่อัปโหลด
            </p>

            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">ยังไม่มีการอัปโหลดเอกสาร</p>
            ) : (
              <div className="divide-y">
                {docs.map((doc) => (
                  <div key={doc.documentId} className="py-3 flex items-start gap-3">
                    {/* Thumbnail */}
                    {isImageUrl(doc.fileUrl) ? (
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(doc.fileUrl)}
                        className="relative shrink-0 w-14 h-14 rounded-md overflow-hidden border hover:opacity-80 transition-opacity group"
                      >
                        <Image
                          src={doc.fileUrl}
                          alt={doc.documentName}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ) : (
                      <div className="shrink-0 w-14 h-14 rounded-md border bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{doc.documentName}</p>
                        <DocStatusPill status={doc.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(doc.uploadedAt), 'd MMM yy, HH:mm', { locale: th })}
                      </p>
                      {doc.reviewNote && (
                        <p
                          className="text-xs mt-1 rounded p-1.5"
                          style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                        >
                          {doc.reviewNote}
                        </p>
                      )}
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                      >
                        <ExternalLink className="h-3 w-3" /> เปิดไฟล์
                      </a>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-green-500 text-green-700 hover:bg-green-50"
                        disabled={doc.status === 'approved'}
                        onClick={() => handleDocAction(doc.documentId, 'approved')}
                      >
                        <Check className="h-3 w-3" /> อนุมัติ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-red-400 text-red-600 hover:bg-red-50"
                        disabled={doc.status === 'rejected'}
                        onClick={() => handleDocAction(doc.documentId, 'rejected')}
                      >
                        <X className="h-3 w-3" /> ปฏิเสธ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              การชำระเงิน
            </p>

            {payment.method === 'cash' && (
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                  style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                >
                  <Check className="h-4 w-4" /> ชำระเงินสดแล้ว
                </span>
                {payment.paidAt && (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(payment.paidAt), 'd MMM yy, HH:mm', { locale: th })}
                  </span>
                )}
                {payment.amount && (
                  <span className="text-sm font-semibold">฿{payment.amount.toLocaleString()}</span>
                )}
              </div>
            )}

            {payment.method === 'transfer' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                    style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
                  >
                    <Check className="h-4 w-4" /> โอนเงินแล้ว
                  </span>
                  {payment.paidAt && (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(payment.paidAt), 'd MMM yy, HH:mm', { locale: th })}
                    </span>
                  )}
                  {payment.amount && (
                    <span className="text-sm font-semibold">
                      ฿{payment.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                {payment.slipUrl && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">สลิปโอนเงิน</p>
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(payment.slipUrl!)}
                      className="relative w-36 h-48 rounded-md overflow-hidden border hover:opacity-80 transition-opacity group"
                    >
                      <Image
                        src={payment.slipUrl}
                        alt="สลิปโอนเงิน"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!payment.method && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ยังไม่ได้รับการชำระเงิน</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-green-500 text-green-700 hover:bg-green-50"
                  onClick={handleCashPayment}
                >
                  <Banknote className="h-4 w-4" />
                  บันทึกชำระเงินสด (ที่ห้องทำงาน)
                </Button>
              </div>
            )}
          </div>

          {/* Interview — only shown for interview-type projects */}
          {project?.admissionType === 'interview' && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ผลการสัมภาษณ์
              </p>

              {/* No interview scheduled */}
              {!interview.interviewDate && !interview.result && (
                <p className="text-sm text-muted-foreground">ยังไม่ได้นัดสัมภาษณ์</p>
              )}

              {/* Scheduled but result not yet recorded — show input form */}
              {interview.interviewDate && interview.result === 'pending' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>วันสัมภาษณ์:</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(interview.interviewDate), "d MMM yy, HH:mm 'น.'", {
                        locale: th,
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        คะแนนสัมภาษณ์ (เต็ม {interview.maxScore ?? 100})
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={interview.maxScore ?? 100}
                        placeholder={`0 – ${interview.maxScore ?? 100}`}
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">หมายเหตุ (ถ้ามี)</label>
                      <Textarea
                        rows={1}
                        placeholder="บันทึกผลการสัมภาษณ์..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleInterviewResult('passed')}
                    >
                      <Check className="h-3.5 w-3.5" /> ผ่านการคัดเลือก
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-400 text-red-600 hover:bg-red-50"
                      onClick={() => handleInterviewResult('failed')}
                    >
                      <X className="h-3.5 w-3.5" /> ไม่ผ่าน
                    </Button>
                  </div>
                </div>
              )}

              {/* Result already recorded */}
              {interview.result && interview.result !== 'pending' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {interview.result === 'passed' ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                        style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                      >
                        <Check className="h-4 w-4" /> ผ่านการคัดเลือก
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                      >
                        <X className="h-4 w-4" /> ไม่ผ่านการคัดเลือก
                      </span>
                    )}
                    {interview.score !== undefined && (
                      <span className="text-sm font-semibold">
                        {interview.score} / {interview.maxScore ?? 100} คะแนน
                      </span>
                    )}
                  </div>
                  {interview.interviewDate && (
                    <p className="text-xs text-muted-foreground">
                      สัมภาษณ์เมื่อ{' '}
                      {format(new Date(interview.interviewDate), 'd MMM yy', { locale: th })}
                    </p>
                  )}
                  {interview.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      &ldquo;{interview.notes}&rdquo;
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground px-2"
                    onClick={() => setInterview((p) => ({ ...p, result: 'pending' }))}
                  >
                    แก้ไขคะแนน
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Completion banner */}
          <div
            className={`rounded-lg border p-4 text-sm ${complete ? 'border-green-200 bg-green-50/60' : 'border-amber-200 bg-amber-50/60'}`}
          >
            {complete ? (
              <p style={{ color: '#166534' }} className="font-medium">
                ✅ การสมัครสมบูรณ์แล้ว — เอกสารทุกรายการได้รับการอนุมัติ
              </p>
            ) : (
              <p style={{ color: '#854d0e' }}>
                ⚠️ ยังไม่สมบูรณ์ — กรุณาอนุมัติเอกสารบังคับทุกรายการ
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl p-2 bg-black border-0">
          <DialogTitle className="sr-only">ดูเอกสาร</DialogTitle>
          <DialogDescription className="sr-only">รูปเอกสารหรือสลิปโอนเงิน</DialogDescription>
          {previewUrl && (
            <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
              <Image
                src={previewUrl}
                alt="เอกสารที่อัปโหลด"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
