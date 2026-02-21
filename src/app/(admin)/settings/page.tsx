'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, FileText, UserCog, Users, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')
  }

  return (
    <div className="w-full px-2 sm:px-6 space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ตั้งค่าระบบ</h2>
        <p className="text-muted-foreground">จัดการข้อมูลพื้นฐานและสิทธิ์การใช้งานของระบบ</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] mb-8 lg:mb-0 h-auto">
          <TabsTrigger value="general" className="py-2.5">
            <Building2 className="h-4 w-4 mr-2 hidden sm:inline-block" />
            ทั่วไป
          </TabsTrigger>
          <TabsTrigger value="classrooms" className="py-2.5">
            <Users className="h-4 w-4 mr-2 hidden sm:inline-block" />
            ห้องเรียน
          </TabsTrigger>
          <TabsTrigger value="documents" className="py-2.5">
            <FileText className="h-4 w-4 mr-2 hidden sm:inline-block" />
            เอกสาร
          </TabsTrigger>
          <TabsTrigger value="admins" className="py-2.5">
            <UserCog className="h-4 w-4 mr-2 hidden sm:inline-block" />
            ผู้ดูแลระบบ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลโรงเรียน</CardTitle>
              <CardDescription>ข้อมูลที่จะแสดงผลในใบรับรองและหน้าเว็บ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ชื่อโรงเรียน (ภาษาไทย)</Label>
                  <Input defaultValue="โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน" />
                </div>
                <div className="space-y-2">
                  <Label>ชื่อโรงเรียน (ภาษาอังกฤษ)</Label>
                  <Input defaultValue="Patumwan Demonstration School" />
                </div>
                <div className="space-y-2">
                  <Label>ปีการศึกษาปัจจุบัน</Label>
                  <Input defaultValue="2567" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>โลโก้ (URL)</Label>
                  <Input defaultValue="/images/logo.png" />
                </div>
              </div>
              <Button onClick={handleSave} className="mt-4">
                <Save className="h-4 w-4 mr-2" /> บันทึกข้อมูล
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classrooms" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>การจัดการชั้นเรียนและห้อง</CardTitle>
                <CardDescription>
                  กำหนดระดับชั้นและจำนวนห้องเรียน สำหรับใช้ในระบบรับสมัคร
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ระดับชั้น</TableHead>
                      <TableHead>จำนวนห้องเรียน</TableHead>
                      <TableHead>สถานะการเปิดรับ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <TableRow key={grade}>
                        <TableCell className="font-medium">มัธยมศึกษาปีที่ {grade}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              defaultValue={grade <= 3 ? 10 : 8}
                              className="w-20 h-8"
                            />
                            <span className="text-sm text-muted-foreground">ห้อง</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            เปิดใช้งาน
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={handleSave}>
                            บันทึก
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>เทมเพลตเอกสารเริ่มต้น</CardTitle>
                <CardDescription>เอกสารที่สามารถดึงไปใช้บ่อยเวลาสร้างโครงการใหม่</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มเอกสาร
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อเอกสาร</TableHead>
                      <TableHead>บังคับ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">สำเนาบัตรประชาชนนักเรียน</TableCell>
                      <TableCell>ใช่</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">สำเนาทะเบียนบ้าน</TableCell>
                      <TableCell>ใช่</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ใบรับรองผลการเรียน (Transcript)</TableCell>
                      <TableCell>ไม่ใช่</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>ผู้ดูแลระบบ</CardTitle>
                <CardDescription>จัดการสิทธิ์การเข้าถึงหลังบ้าน</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> เพิ่มผู้ดูแล
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead>บทบาท</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">admin@dsuglobal.com</TableCell>
                      <TableCell>Super Admin</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Owner
                        </span>
                      </TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">teacher@dsuglobal.com</TableCell>
                      <TableCell>Teacher Staff</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          Editor
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-500">
                          ลบสิทธิ์
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
