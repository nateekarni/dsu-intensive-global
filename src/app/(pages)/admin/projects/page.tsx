"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [applicationStats, setApplicationStats] = useState<Record<string, { applied: number; approved: number }>>({});
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [projectToToggle, setProjectToToggle] = useState<any | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "projects"));
    const projectList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProjects(projectList);

    // นับจำนวนผู้สมัคร และจำนวนที่ผ่านการคัดเลือกของแต่ละโครงการ
    const stats: Record<string, { applied: number; approved: number }> = {};
    await Promise.all(
      projectList.map(async (p: any) => {
        const appsSnap = await getDocs(
          query(
            collection(db, "applications"),
            where("projectId", "==", p.id)
          )
        );

        let applied = 0;
        let approved = 0;
        appsSnap.forEach(appDoc => {
          const data = appDoc.data() as any;
          applied += 1;
          if (data.status === "approved") approved += 1;
        });

        stats[p.id] = { applied, approved };
      })
    );
    setApplicationStats(stats);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleStatus = async (projectId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      await updateDoc(doc(db, "projects", projectId), {
        status: newStatus
      });
      await fetchProjects();
    } catch (error) {
      console.error("Error updating status:", error);
      setAlertMessage("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      setAlertOpen(true);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!projectToToggle) return;
    await handleToggleStatus(projectToToggle.id, projectToToggle.status);
    setStatusDialogOpen(false);
    setProjectToToggle(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // ลบรูปภาพและไฟล์ใน Storage
      try {
        const projectFolderRef = ref(storage, `projects/${projectToDelete.id}`);
        const fileList = await listAll(projectFolderRef);

        // ลบไฟล์ทั้งหมดในโฟลเดอร์โครงการ
        await Promise.all(
          fileList.items.map((itemRef) => deleteObject(itemRef))
        );

        // ลบไฟล์ใน subfolder (เช่น docs)
        for (const folder of fileList.prefixes) {
          const subFileList = await listAll(folder);
          await Promise.all(
            subFileList.items.map((itemRef) => deleteObject(itemRef))
          );
        }
      } catch (storageError) {
        console.warn("Error deleting storage files:", storageError);
        // ถ้าลบไฟล์ไม่ได้ ให้ลบ document ต่อ
      }

      // ลบ document จาก Firestore
      await deleteDoc(doc(db, "projects", projectToDelete.id));
      await fetchProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      setAlertMessage("เกิดข้อผิดพลาดในการลบโครงการ");
      setAlertOpen(true);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (startTimestamp: any, endTimestamp: any) => {
    if (!startTimestamp || !endTimestamp) return "-";

    const startDate = startTimestamp.toDate();
    const endDate = endTimestamp.toDate();

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const startMonth = startDate.toLocaleDateString("th-TH", { month: "short" });
    const endMonth = endDate.toLocaleDateString("th-TH", { month: "short" });

    // ใช้ getFullYear() แทน เพื่อไม่ให้มีคำว่า พ.ศ.
    const startYear = startDate.getFullYear() + 543; // แปลงเป็นปี พ.ศ.
    const endYear = endDate.getFullYear() + 543;

    // ถ้าเดือนและปีเหมือนกัน
    if (startMonth === endMonth && startYear === endYear) {
      return `${startDay}-${endDay} ${startMonth} ${startYear}`;
    }

    // ถ้าข้ามเดือนแต่ปีเดียวกัน
    if (startYear === endYear) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
    }

    // ถ้าข้ามปี
    return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">จัดการโครงการ</h1>
          <p className="text-slate-500 mt-1">จัดการและติดตามโครงการทั้งหมด</p>
        </div>
        <Link href="/admin/create-project">
          <Button className="shadow-md">
            <Plus className="w-4 h-4 mr-1" /> เพิ่มโครงการ
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">โครงการทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800">{projects.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Unlock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">เปิดรับสมัคร</p>
              <p className="text-2xl font-bold text-slate-800">
                {projects.filter(p => p.status === 'open').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ปิดรับสมัคร</p>
              <p className="text-2xl font-bold text-slate-800">
                {projects.filter(p => p.status === 'closed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Table */}
      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[30px]">#</TableHead>
                <TableHead className="w-[250px]">ชื่อโครงการ</TableHead>
                <TableHead className="w-[150px]">สถานที่</TableHead>
                <TableHead className="w-[200px]">วันที่จัด (ไป-กลับ)</TableHead>
                <TableHead className="w-[120px]">วันปิดรับสมัคร</TableHead>
                <TableHead className="w-[100px]">จำนวนรับ</TableHead>
                <TableHead className="w-[120px] text-center">สถานะ</TableHead>
                <TableHead className="w-[80px] text-center">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    กำลังโหลด...
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    ยังไม่มีโครงการ
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project, index) => (
                  <TableRow key={project.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {project.coverImage && (
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 mb-1">
                            {project.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {project.locations?.[0] || project.displayLocation || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        <span>{formatDateRange(project.startDate, project.endDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        <span>{formatDate(project.closeDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const stats = applicationStats[project.id] || { applied: 0, approved: 0 };
                        const capacity = project.capacity || 0;
                        const remaining = Math.max(capacity - (stats.approved || 0), 0);
                        return (
                          <div className="text-left text-sm">
                            <div className="font-semibold text-slate-700">
                              {stats.applied}/{capacity} คน
                            </div>
                            <div className="text-xs text-slate-500">
                              เหลือ {remaining} ที่นั่ง
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {project.status === 'open' ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                          เปิดรับสมัคร
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          ปิดรับสมัคร
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`/student/projects/${project.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/projects/${project.id}/students`)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            รายชื่อผู้สมัคร
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/projects/${project.id}/edit`)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไขข้อมูลโครงการ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setProjectToToggle(project);
                              setStatusDialogOpen(true);
                            }}
                          >
                            {project.status === 'open' ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                ปิดรับสมัคร
                              </>
                            ) : (
                              <>
                                <Unlock className="w-4 h-4 mr-2" />
                                เปิดรับสมัคร
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setProjectToDelete(project);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบโครงการ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโครงการ</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบโครงการ "{projectToDelete?.title}"?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
            >
              ลบโครงการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {projectToToggle?.status === "open" ? "ยืนยันการปิดรับสมัคร" : "ยืนยันการเปิดรับสมัคร"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {projectToToggle?.status === "open"
                ? `คุณต้องการปิดรับสมัครสำหรับโครงการ "${projectToToggle?.title}" ใช่หรือไม่?`
                : `คุณต้องการเปิดรับสมัครสำหรับโครงการ "${projectToToggle?.title}" ใช่หรือไม่?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setStatusDialogOpen(false);
                setProjectToToggle(null);
              }}
            >
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generic Alert Dialog */}
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
    </div>
  );
}