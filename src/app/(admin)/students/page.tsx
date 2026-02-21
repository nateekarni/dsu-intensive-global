'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'

import { Search } from 'lucide-react'
import { mockApplicants, mockRequiredDocIds, isComplete, Applicant } from '@/data/mockApplicants'
import { mockPrograms } from '@/data/mockPrograms'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

// Build a unique list of students from all applications
type StudentRow = {
  id: string
  student: Applicant['student']
  applications: {
    projectId: string
    appliedAt: string
    complete: boolean
  }[]
  latestAppliedAt: string
}

const studentsMap = new Map<string, StudentRow>()
mockApplicants.forEach((app) => {
  const sid = app.student.id
  if (!studentsMap.has(sid)) {
    studentsMap.set(sid, {
      id: sid,
      student: app.student,
      applications: [],
      latestAppliedAt: app.appliedAt,
    })
  }
  const row = studentsMap.get(sid)!
  row.applications.push({
    projectId: app.projectId,
    appliedAt: app.appliedAt,
    complete: isComplete(app.documents, mockRequiredDocIds[app.projectId] || []),
  })
  if (new Date(app.appliedAt) > new Date(row.latestAppliedAt)) {
    row.latestAppliedAt = app.appliedAt
  }
})

const uniqueStudents = Array.from(studentsMap.values()).sort(
  (a, b) => new Date(b.latestAppliedAt).getTime() - new Date(a.latestAppliedAt).getTime(),
)

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = uniqueStudents.filter((row) => {
    const s = row.student
    const fullNameTh = `${s.firstNameTh} ${s.lastNameTh}`.toLowerCase()
    const fullNameEn = `${s.firstNameEn} ${s.lastNameEn}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return (
      fullNameTh.includes(search) || fullNameEn.includes(search) || s.nationalId.includes(search)
    )
  })

  return (
    <div className="w-full px-2 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการนักเรียน</h2>
          <p className="text-muted-foreground">รายชื่อนักเรียนทั้งหมดที่เคยสมัครเข้าร่วมโครงการ</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, นามสกุล, หรือเลข ปชช..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">ชื่อ-สกุล</TableHead>
              <TableHead className="text-center">ชั้น/ห้อง</TableHead>
              <TableHead>ข้อมูลติดต่อ</TableHead>
              <TableHead>โครงการที่สมัคร</TableHead>
              <TableHead>สมัครล่าสุดเมื่อ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  ไม่มีข้อมูลนักเรียน
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">
                      {row.student.prefixTh}
                      {row.student.firstNameTh} {row.student.lastNameTh}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.student.prefixEn} {row.student.firstNameEn} {row.student.lastNameEn}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    ม.{row.student.grade}/{row.student.room}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{row.student.phone}</div>
                    <div className="text-xs text-muted-foreground">{row.student.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.applications.map((app, idx) => {
                        const project = mockPrograms.find((p) => p.id === app.projectId)
                        return (
                          <span
                            key={idx}
                            title={project?.title}
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                              app.complete
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {project?.title.substring(0, 15)}...
                          </span>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(row.latestAppliedAt), 'd MMM yy', { locale: th })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
