'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { FileText, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockApplicants, Applicant } from '@/data/mockApplicants'
import { mockPrograms, Program } from '@/data/mockPrograms'
import { mockRequiredDocIds } from '@/data/mockApplicants'
import { Navbar } from '@/components/programs/Navbar'

// Mock logged-in student ID
const MOCK_STUDENT_ID = 'stu-001'

interface ApplicationView extends Applicant {
  program: Program
  status: {
    label: string
    color: 'default' | 'success' | 'destructive' | 'warning'
  }
}

function getApplicationStatus(app: Applicant, program: Program) {
  // Check documents completion
  const reqDocs = mockRequiredDocIds[program.id] || []
  const uploadedIds = app.documents.filter((d) => d.status === 'approved').map((d) => d.documentId)
  const isDocsComplete = reqDocs.every((id) => uploadedIds.includes(id))

  if (!isDocsComplete) return { label: 'รอเอกสาร', color: 'warning' as const }

  if (program.admissionType === 'interview') {
    if (!app.interview || app.interview.result === 'pending') {
      return { label: 'รอสัมภาษณ์', color: 'warning' as const }
    }
    if (app.interview.result === 'failed') {
      return { label: 'ไม่ผ่านการคัดเลือก', color: 'destructive' as const }
    }
    if (app.interview.result === 'passed') {
      return { label: 'ผ่านการคัดเลือก', color: 'success' as const }
    }
  } else {
    // First-come
    return { label: 'ผ่านการคัดเลือก', color: 'success' as const }
  }

  return { label: 'กำลังดำเนินการ', color: 'default' as const }
}

export default function StudentApplicationsPage() {
  const myApplications = useMemo<ApplicationView[]>(() => {
    return mockApplicants
      .filter((app) => app.student.id === MOCK_STUDENT_ID)
      .map((app) => {
        const program = mockPrograms.find((p) => p.id === app.projectId)!
        return {
          ...app,
          program,
          status: getApplicationStatus(app, program),
        }
      })
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <div className="bg-muted/30 border-b border-border min-h-screen pb-16">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">การสมัครของฉัน</h1>

          <div className="space-y-4">
            {myApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-background rounded-2xl border border-dashed border-border text-center">
                <FileText className="size-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">คุณยังไม่มีประวัติการสมัคร</p>
                <Link href="/programs" className="text-primary hover:underline mt-2 text-sm">
                  ดูโครงการที่กำลังเปิดรับสมัคร
                </Link>
              </div>
            ) : (
              myApplications.map((app) => (
                <Link key={app.id} href={`/student/applications/${app.id}`}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden group cursor-pointer border-border/60">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image Thumbnail (Hidden on very small screens, shown as block or left-aligned) */}
                        <div className="h-32 sm:h-auto sm:w-40 bg-muted shrink-0 relative overflow-hidden">
                          <Image
                            src={app.program.images.cover}
                            alt={app.program.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 160px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col pt-3 sm:pt-4">
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                              {app.program.title}
                            </h3>
                            <Badge
                              variant={
                                app.status.color === 'default'
                                  ? 'outline'
                                  : app.status.color === 'warning'
                                    ? 'secondary'
                                    : app.status.color === 'success'
                                      ? 'default'
                                      : app.status.color
                              }
                              className="shrink-0 whitespace-nowrap mt-0.5"
                            >
                              {app.status.label}
                            </Badge>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              <span>
                                สมัครเมื่อ:{' '}
                                {format(new Date(app.appliedAt), 'd MMM yyyy', { locale: th })}
                              </span>
                            </div>

                            <div className="flex items-center text-primary font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                              ดูรายละเอียด <ChevronRight className="size-4 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
