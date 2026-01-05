"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx"; // Library Excel
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Users, Search, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudentListPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Grouping State
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);

    // ดึงข้อมูลโครงการ
    const projectDoc = await getDoc(doc(db, "projects", id as string));
    if (projectDoc.exists()) {
      setProject({ id: projectDoc.id, ...projectDoc.data() });
    }

    // ดึงใบสมัครทั้งหมดของโปรเจ็คนี้
    const q = query(collection(db, "applications"), where("projectId", "==", id));
    const snap = await getDocs(q);

    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      // Flatten ข้อมูลส่วนตัวออกมาให้ใช้ง่าย
      name: `${d.data().personalData.nameThai} ${d.data().personalData.surnameThai}`,
      studentId: d.data().personalData.studentId || "-",
      phone: d.data().personalData.phone,
      classroom: (d.data().personalData.gradeLevel && d.data().personalData.classroom)
        ? `${d.data().personalData.gradeLevel}/${d.data().personalData.classroom}`
        : (d.data().personalData.classroom || "-")
    }));
    setStudents(list);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  // ฟังก์ชัน Export Excel
  const handleExport = () => {
    const dataToExport = students.map(s => ({
      "ชื่อ-นามสกุล": s.name,
      "เบอร์โทรศัพท์": s.phone,
      "สถานะ": s.status,
      "กลุ่ม": s.groupName || "-",
      "วันที่สมัคร": s.createdAt?.toDate().toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_List.xlsx");
  };

  // ฟังก์ชันจัดกลุ่ม
  const handleAssignGroup = async () => {
    if (!groupNameInput) return;

    await Promise.all(selectedStudents.map(appId =>
      updateDoc(doc(db, "applications", appId), { groupName: groupNameInput })
    ));

    setAlertMessage("จัดกลุ่มเรียบร้อย");
    setAlertOpen(true);
    setShowGroupModal(false);
    setSelectedStudents([]);
    fetchData(); // Reload
  };

  // Checkbox Handler
  const toggleSelect = (appId: string) => {
    if (selectedStudents.includes(appId)) {
      setSelectedStudents(prev => prev.filter(id => id !== appId));
    } else {
      setSelectedStudents(prev => [...prev, appId]);
    }
  };

  const filteredStudents = students.filter(s => s.name.includes(searchTerm));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-6 py-6">
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-4 border-slate-200"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> กลับ
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">รายชื่อผู้สมัคร</h1>
          <p className="text-slate-500 mt-1">{project?.title || "กำลังโหลด..."}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 border rounded-md px-3 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อ..."
              className="border-0 shadow-none focus-visible:ring-0 w-48"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowGroupModal(true)} disabled={selectedStudents.length === 0}>
            <Users className="w-4 h-4 mr-1" /> จัดกลุ่ม ({selectedStudents.length})
          </Button>
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={handleExport}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"><input type="checkbox" /></TableHead>
              <TableHead className="w-[100px]">รหัสนักเรียน</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>ชั้นเรียน</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>กลุ่ม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-[120px] text-right pr-6">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="w-[60px]"><input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleSelect(s.id)} /></TableCell>
                <TableCell className="w-[100px]">{s.studentId}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.classroom}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell><Badge variant="outline">{s.groupName || "-"}</Badge></TableCell>
                <TableCell>
                  <Badge variant={s.status === 'approved' ? 'default' : 'secondary'}>{s.status}</Badge>
                </TableCell>
                <TableCell className="w-[120px] text-right pr-6">
                  <Link href={`/admin/reviews/${s.id}`}>
                    <Button size="sm" variant="ghost"><ArrowRight className="w-4 h-4" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Grouping Modal */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>จัดกลุ่มนักเรียน</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p>กำลังจัดกลุ่มให้รายการที่เลือกจำนวน: <strong>{selectedStudents.length} คน</strong></p>
            <div className="space-y-2">
              <label>ชื่อกลุ่ม (เช่น Group A, Bus 1)</label>
              <Input value={groupNameInput} onChange={e => setGroupNameInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignGroup}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>แจ้งเตือน</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}