'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileUp,
  CreditCard,
  Users,
  AlertCircle,
  Upload,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockApplicants } from '@/data/mockApplicants'
import { mockPrograms } from '@/data/mockPrograms'
import { mockRequiredDocIds } from '@/data/mockApplicants'
import { Navbar } from '@/components/programs/Navbar'

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  const data = useMemo(() => {
    const app = mockApplicants.find((a) => a.id === id)
    if (!app) return null
    const program = mockPrograms.find((p) => p.id === app.projectId)
    if (!program) return null
    return { app, program }
  }, [id])

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ไม่พบข้อมูลการสมัคร</h2>
        <p className="text-muted-foreground mb-6">ไม่พบรหัสการสมัครนี้ หรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <Button onClick={() => router.back()}>กลับไปหน้าก่อนหน้า</Button>
      </div>
    )
  }

  const { app, program } = data
  const reqDocs = mockRequiredDocIds[program.id] || []
  const uploadedIds = app.documents.filter((d) => d.status === 'approved').map((d) => d.documentId)
  const isDocsComplete = reqDocs.every((docId) => uploadedIds.includes(docId))
  const isInterviewPassed =
    program.admissionType !== 'interview' || app.interview?.result === 'passed'
  const isPaid = app.payment?.method && app.payment?.slipUrl
  const isAllComplete = isDocsComplete && isInterviewPassed && isPaid

  // Stepper logic
  const steps = [
    {
      id: 'apply',
      title: 'ส่งใบสมัคร',
      desc: format(new Date(app.appliedAt), 'd MMM yyyy HH:mm', { locale: th }),
      status: 'complete',
    },
    {
      id: 'docs',
      title: 'ตรวจสอบเอกสาร',
      desc: isDocsComplete ? 'เอกสารครบถ้วน' : 'กำลังรอเอกสารเพิ่มเติม',
      status: isDocsComplete ? 'complete' : 'current',
    },
    ...(program.admissionType === 'interview'
      ? [
          {
            id: 'interview',
            title: 'สอบสัมภาษณ์',
            desc:
              app.interview?.result === 'passed'
                ? 'ผ่านเกณฑ์'
                : app.interview?.result === 'failed'
                  ? 'ไม่ผ่านเกณฑ์'
                  : app.interview?.interviewDate
                    ? `นัดหมาย: ${format(new Date(app.interview.interviewDate), 'd MMM yyyy HH:mm', { locale: th })}`
                    : 'รอประกาศผล/นัดหมาย',
            status:
              app.interview?.result === 'passed'
                ? 'complete'
                : app.interview?.result === 'failed'
                  ? 'error'
                  : isDocsComplete
                    ? 'current'
                    : 'upcoming',
          },
        ]
      : []),
    {
      id: 'payment',
      title: 'ชำระค่าเข้าร่วม',
      desc: isPaid ? 'ชำระเงินแล้ว' : 'รอการชำระเงิน',
      status: isPaid ? 'complete' : isDocsComplete && isInterviewPassed ? 'current' : 'upcoming',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <div className="bg-muted/30 border-b border-border min-h-screen pb-16">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full size-9 bg-background shadow-sm border border-border shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
                {program.title}
              </h1>
              <p className="text-sm text-muted-foreground">รหัสการสมัคร: {app.id}</p>
            </div>
          </div>

          {isAllComplete && (
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-4 text-success-foreground">
              <CheckCircle2 className="size-6 text-success shrink-0" />
              <div>
                <h3 className="font-semibold text-success">การสมัครสำเร็จสมบูรณ์</h3>
                <p className="text-sm mt-1 opacity-90">
                  ยินดีด้วย! คุณผ่านการคัดเลือกและชำระเงินเรียบร้อยแล้ว
                  โปรดติดตามกำหนดการเข้าร่วมโครงการต่อไป
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline / Stepper Column (Left on Desktop) */}
            <div className="md:col-span-1 space-y-6">
              <Card className="bg-background/60 backdrop-blur shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">สถานะดำเนินการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
                    {steps.map((step) => (
                      <div key={step.id} className="relative pl-6">
                        <span
                          className={`absolute -left-[11px] top-0.5 flex size-5 items-center justify-center rounded-full ring-4 ring-background ${
                            step.status === 'complete'
                              ? 'bg-primary text-primary-foreground'
                              : step.status === 'current'
                                ? 'bg-primary/20 text-primary animate-pulse'
                                : step.status === 'error'
                                  ? 'bg-destructive text-destructive-foreground'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step.status === 'complete' ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : step.status === 'error' ? (
                            <XCircle className="size-3.5" />
                          ) : (
                            <div
                              className={`size-2 rounded-full ${step.status === 'current' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            />
                          )}
                        </span>
                        <h4
                          className={`text-sm font-semibold ${step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Column (Right on Desktop) */}
            <div className="md:col-span-2 space-y-6">
              {/* Documents Section */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileUp className="size-5 text-primary" />
                      <CardTitle className="text-lg">เอกสารประกอบการสมัคร</CardTitle>
                    </div>
                    {isDocsComplete ? (
                      <Badge
                        variant="outline"
                        className="bg-success text-success-foreground hover:bg-success"
                      >
                        ครบถ้วน
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-warning text-warning-foreground hover:bg-warning"
                      >
                        รอดำเนินการ
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {program.documents?.map((docDef) => {
                    const uploaded = app.documents.find((d) => d.documentId === docDef.id)

                    return (
                      <div
                        key={docDef.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{docDef.name}</p>
                            {docDef.isRequired && (
                              <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded uppercase font-semibold">
                                จำเป็น
                              </span>
                            )}
                          </div>
                          {uploaded && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ส่งเมื่อ:{' '}
                              {format(new Date(uploaded.uploadedAt), 'd MMM yyyy HH:mm', {
                                locale: th,
                              })}
                            </p>
                          )}
                          {uploaded?.status === 'rejected' && uploaded.reviewNote && (
                            <p className="text-xs text-destructive mt-1 break-words">
                              หมายเหตุ: {uploaded.reviewNote}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {uploaded?.status === 'approved' ? (
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20"
                            >
                              ตรวจสอบผ่าน
                            </Badge>
                          ) : uploaded?.status === 'pending' ? (
                            <Badge variant="secondary" className="bg-secondary/50">
                              รอตรวจสอบ
                            </Badge>
                          ) : (
                            <Button
                              variant={uploaded?.status === 'rejected' ? 'destructive' : 'outline'}
                              size="sm"
                              className="h-8 text-xs w-full sm:w-auto"
                            >
                              <Upload className="size-3.5 mr-1.5" />
                              {uploaded?.status === 'rejected' ? 'อัปโหลดแก้ไข' : 'อัปโหลด'}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Interview Section */}
              {program.admissionType === 'interview' && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-primary" />
                      <CardTitle className="text-lg">สอบสัมภาษณ์</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {!app.interview?.interviewDate ? (
                      <div className="text-center py-6">
                        <Clock className="size-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          รอประกาศกำหนดการและลิงก์สัมภาษณ์
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">วัน-เวลาสัมภาษณ์</p>
                            <p className="text-sm font-medium">
                              {format(new Date(app.interview.interviewDate), 'd MMMM yyyy HH:mm', {
                                locale: th,
                              })}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">ผลการคัดเลือก</p>
                            {app.interview.result === 'passed' ? (
                              <span className="text-sm font-semibold text-success flex items-center gap-1">
                                <CheckCircle2 className="size-4" /> ผ่านเกณฑ์
                              </span>
                            ) : app.interview.result === 'failed' ? (
                              <span className="text-sm font-semibold text-destructive flex items-center gap-1">
                                <XCircle className="size-4" /> ไม่ผ่านเกณฑ์
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-warning">รอประกาศผล</span>
                            )}
                          </div>
                        </div>

                        {app.interview.result === 'pending' && (
                          <Button className="w-full">
                            เข้าร่วมห้องสัมภาษณ์ (Zoom / Google Meet)
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Section */}
              {isDocsComplete && isInterviewPassed && (
                <Card className="shadow-sm border-primary/20">
                  <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-5 text-primary" />
                      <CardTitle className="text-lg">การชำระเงิน</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {isPaid ? (
                      <div className="flex items-center gap-4 p-4 bg-success/10 rounded-lg border border-success/20">
                        <div className="size-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-5 text-success" />
                        </div>
                        <div>
                          <p className="font-semibold text-success">ชำระเงินเรียบร้อยแล้ว</p>
                          {app.payment?.paidAt && (
                            <p className="text-xs text-success/80 mt-0.5">
                              เมื่อ:{' '}
                              {format(new Date(app.payment.paidAt), 'd MMM yyyy HH:mm', {
                                locale: th,
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          คุณผ่านการคัดเลือกแล้ว กรุณาชำระเงินเพื่อยืนยันสิทธิ์เข้าร่วมโครงการ
                        </p>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                            <span className="text-sm font-medium">ค่าเข้าร่วมโครงการ</span>
                            <span className="text-lg font-bold">
                              ฿{program.price.toLocaleString()}
                            </span>
                          </div>
                          <Button className="w-full h-11">ดำเนินการชำระเงิน</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
