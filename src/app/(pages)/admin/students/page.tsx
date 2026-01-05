"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Eye, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProfile {
  prefixThai?: string;
  nameThai?: string;
  surnameThai?: string;
  prefixEng?: string;
  nameEng?: string;
  surnameEng?: string;
  studentId?: string;
  classroom?: string;
  phone?: string;
}

interface StudentDoc {
  id: string;
  profile?: StudentProfile;
  email?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "byClassroom">("all");

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // ดึง users ที่มี role = student
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);

        const studentsData: StudentDoc[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as StudentDoc),
          id: doc.id,
        }));

        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const classroomGroups: Record<string, StudentDoc[]> = {};
  students.forEach((student) => {
    const profile = student.profile || {};
    const classroom = profile.classroom || "ไม่ระบุ";
    if (!classroomGroups[classroom]) {
      classroomGroups[classroom] = [];
    }
    classroomGroups[classroom].push(student);
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">ข้อมูลนักเรียน</h1>
        <p className="text-slate-500 mt-1">จัดการและแก้ไขข้อมูลนักเรียนที่ลงทะเบียนในระบบ</p>
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">นักเรียนทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">มีข้อมูลครบถ้วน</p>
              <p className="text-2xl font-bold text-slate-800">
                {students.filter(s => s.profile?.nameThai && s.profile?.studentId).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ข้อมูลไม่ครบ</p>
              <p className="text-2xl font-bold text-slate-800">
                {students.filter(s => !s.profile?.nameThai || !s.profile?.studentId).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Mode Switch */}
      <div className="flex justify-end mb-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-sm text-slate-500">มุมมอง</span>
          <div className="inline-flex rounded-md border bg-white p-0.5">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "all" ? "default" : "ghost"}
              className="px-3"
              onClick={() => setViewMode("all")}
            >
              ทั้งหมด
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "byClassroom" ? "default" : "ghost"}
              className="px-3"
              onClick={() => setViewMode("byClassroom")}
            >
              ตามห้องเรียน
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          {viewMode === "all" ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[120px]">รหัสนักเรียน</TableHead>
                  <TableHead className="w-[250px]">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="w-[100px]">ชั้นเรียน</TableHead>
                  <TableHead className="w-[200px]">อีเมล</TableHead>
                  <TableHead className="w-[120px]">เบอร์โทร</TableHead>
                  <TableHead className="w-[80px] text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      ยังไม่มีนักเรียนในระบบ
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => {
                    const profile = student.profile || {};

                    const nameThai =
                      profile.nameThai && profile.surnameThai
                        ? `${profile.prefixThai || ""} ${profile.nameThai} ${profile.surnameThai}`.trim()
                        : "ไม่ระบุ";

                    const nameEng =
                      profile.nameEng && profile.surnameEng
                        ? `${profile.prefixEng || ""} ${profile.nameEng} ${profile.surnameEng}`.trim()
                        : "ไม่ระบุ";

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          {profile.studentId || <span className="text-slate-400">ไม่ระบุ</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{nameThai}</span>
                            <span className="text-xs text-slate-400">{nameEng}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {profile.classroom || <span className="text-slate-400">ไม่ระบุ</span>}
                        </TableCell>
                        <TableCell className="text-sm">{student.email}</TableCell>
                        <TableCell>
                          {profile.phone || <span className="text-slate-400">ไม่ระบุ</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/admin/students/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          ) : (
            Object.keys(classroomGroups)
              .sort()
              .map((classroom) => (
                <div key={classroom} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50">
                    <span className="font-semibold text-slate-700">ห้อง {classroom}</span>
                    <span className="text-sm text-slate-500">{classroomGroups[classroom].length} คน</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white">
                        <TableHead className="w-[120px]">รหัสนักเรียน</TableHead>
                        <TableHead className="w-[250px]">ชื่อ-นามสกุล</TableHead>
                        <TableHead className="w-[200px]">อีเมล</TableHead>
                        <TableHead className="w-[120px]">เบอร์โทร</TableHead>
                        <TableHead className="w-[80px] text-center">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classroomGroups[classroom].map((student) => {
                        const profile = student.profile || {};

                        const nameThai =
                          profile.nameThai && profile.surnameThai
                            ? `${profile.prefixThai || ""} ${profile.nameThai} ${profile.surnameThai}`.trim()
                            : "ไม่ระบุ";

                        const nameEng =
                          profile.nameEng && profile.surnameEng
                            ? `${profile.prefixEng || ""} ${profile.nameEng} ${profile.surnameEng}`.trim()
                            : "ไม่ระบุ";

                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              {profile.studentId || <span className="text-slate-400">ไม่ระบุ</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{nameThai}</span>
                                <span className="text-xs text-slate-400">{nameEng}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{student.email}</TableCell>
                            <TableCell>
                              {profile.phone || <span className="text-slate-400">ไม่ระบุ</span>}
                            </TableCell>
                            <TableCell className="text-center">
                              <Link href={`/admin/students/${student.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}
