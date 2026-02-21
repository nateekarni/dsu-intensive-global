import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FolderKanban,
  Users,
  FileClock,
  UserRoundCheck,
  ArrowRight,
  ClockAlert,
} from 'lucide-react'
import { mockPrograms } from '@/data/mockPrograms'
import { mockApplicants, isComplete, mockRequiredDocIds } from '@/data/mockApplicants'
import { Button } from '@/components/ui/button'
import { format, differenceInDays } from 'date-fns'
import { th } from 'date-fns/locale'

export const metadata = {
  title: 'Dashboard - Admin',
}

export default function AdminDashboardPage() {
  const openProjects = mockPrograms.filter((p) => p.status === 'open')
  const totalApplicants = mockApplicants.length

  // Calculate pending docs
  let pendingDocsCount = 0
  mockApplicants.forEach((app) => {
    const hasPendingDoc = app.documents.some((d) => d.status === 'pending')
    if (hasPendingDoc) pendingDocsCount++
  })

  // Calculate pending interviews
  let pendingInterviewsCount = 0
  mockApplicants.forEach((app) => {
    const project = mockPrograms.find((p) => p.id === app.projectId)
    if (project?.admissionType === 'interview') {
      if (!app.interview?.result || app.interview.result === 'pending') {
        pendingInterviewsCount++
      }
    }
  })

  // Recent 5 applications
  const recentApps = [...mockApplicants]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  // Projects deadline soon (<= 14 days)
  const today = new Date()
  const deadlineSoonProjects = mockPrograms
    .filter((p) => p.status === 'open')
    .map((p) => {
      const deadline = new Date(p.dates.applicationDeadline)
      const daysLeft = differenceInDays(deadline, today)
      return { ...p, daysLeft }
    })
    .filter((p) => p.daysLeft >= 0 && p.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div className="w-full px-2 sm:px-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ภาพรวม (Dashboard)</h2>
        <p className="text-muted-foreground">สรุปข้อมูลโครงการและการสมัครเข้าโครงการ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โครงการที่เปิดรับ</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openProjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">โครงการ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้สมัครทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants}</div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอตรวจเอกสาร</CardTitle>
            <FileClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDocsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">ใบสมัคร</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอสัมภาษณ์ / รอผล</CardTitle>
            <UserRoundCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInterviewsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">ใบสมัคร</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Apps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การสมัครล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentApps.map((app) => {
                const project = mockPrograms.find((p) => p.id === app.projectId)
                const reqDocs = project ? mockRequiredDocIds[project.id] : []
                const complete = isComplete(app.documents, reqDocs ?? [])

                return (
                  <div key={app.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {app.student.prefixTh}
                        {app.student.firstNameTh} {app.student.lastNameTh}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                        {project?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(app.appliedAt), 'd MMM yy, HH:mm', { locale: th })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {complete ? 'สมบูรณ์' : 'รอตรวจสอบ'}
                      </span>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={`/projects/${app.projectId}/applicants/${app.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 border-t pt-4">
              <Button variant="ghost" className="w-full text-sm text-primary" asChild>
                <Link href="/projects">ดูโครงการทั้งหมด</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deadline Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">โครงการใกล้ปิดรับสมัคร</CardTitle>
          </CardHeader>
          <CardContent>
            {deadlineSoonProjects.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                ไม่มีโครงการที่ใกล้ปิดรับสมัคร (ภายใน 14 วัน)
              </div>
            ) : (
              <div className="space-y-5">
                {deadlineSoonProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[200px] sm:max-w-[300px]">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ClockAlert className="h-3 w-3" />
                        ปิดรับสมัคร:{' '}
                        {format(new Date(p.dates.applicationDeadline), 'd MMM yy', {
                          locale: th,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {p.daysLeft === 0 ? 'วันนี้' : `อีก ${p.daysLeft} วัน`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        สมัครแล้ว {p.currentParticipants}/{p.maxParticipants}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
