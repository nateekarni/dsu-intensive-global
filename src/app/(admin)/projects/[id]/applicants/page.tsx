import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockApplicants, mockRequiredDocIds, isComplete } from '@/data/mockApplicants'
import { mockPrograms } from '@/data/mockPrograms'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default async function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = mockPrograms.find((p) => p.id === id)
  const applicants = mockApplicants.filter((a) => a.projectId === id)
  const requiredDocIds = mockRequiredDocIds[id] ?? []

  return (
    <div className="w-full space-y-6 py-8 px-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2 mt-0.5 shrink-0">
          <Link href="/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">โครงการ</p>
          <h1 className="text-2xl font-bold truncate">{project?.title ?? id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project?.location.city}, {project?.location.country}
            {project?.dates.start && (
              <> &mdash; {format(new Date(project.dates.start), 'd MMM yyyy', { locale: th })}</>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold">{applicants.length}</p>
          <p className="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</p>
        </div>
      </div>

      {/* Stats bar */}
      {applicants.length > 0 && (
        <div className="grid grid-cols-3 gap-4 rounded-lg border bg-card p-4">
          <div className="text-center">
            <p className="text-2xl font-semibold" style={{ color: '#16a34a' }}>
              {applicants.filter((a) => isComplete(a.documents, requiredDocIds)).length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">สมัครสมบูรณ์</p>
          </div>
          <div className="text-center border-x">
            <p className="text-2xl font-semibold" style={{ color: '#d97706' }}>
              {applicants.filter((a) => !isComplete(a.documents, requiredDocIds)).length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">เอกสารไม่ครบ</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{project?.maxParticipants ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">รับสูงสุด</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {applicants.length === 0 ? (
        <div className="rounded-lg border bg-card flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">ยังไม่มีผู้สมัคร</p>
            <p className="text-sm text-muted-foreground mt-1">
              เมื่อนักเรียนสมัครโครงการนี้ รายชื่อจะปรากฏที่นี่
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 text-center">ลำดับ</TableHead>
                <TableHead>ชื่อนักเรียน</TableHead>
                <TableHead className="w-28 text-center">ชั้น/ห้อง</TableHead>
                <TableHead className="w-44">วันที่สมัคร</TableHead>
                <TableHead className="w-36 text-center">เอกสาร</TableHead>
                <TableHead className="w-32 text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant, index) => {
                const complete = isComplete(applicant.documents, requiredDocIds)
                const approvedCount = applicant.documents.filter(
                  (d) => d.status === 'approved',
                ).length
                const totalRequired = requiredDocIds.length
                return (
                  <TableRow key={applicant.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-center font-mono text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${id}/applicants/${applicant.id}`}
                        className="font-medium hover:underline"
                      >
                        {applicant.student.firstNameTh} {applicant.student.lastNameTh}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      ม.{applicant.student.grade}/{applicant.student.room}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(applicant.appliedAt), 'd MMM yy, HH:mm', { locale: th })}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {approvedCount}/{totalRequired} อนุมัติ
                    </TableCell>
                    <TableCell className="text-center">
                      {complete ? (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                        >
                          สมบูรณ์
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}
                        >
                          ไม่สมบูรณ์
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
