"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, Eye, Calendar, User, LayoutGrid, List } from "lucide-react";

export default function ReviewsListPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [groupByProject, setGroupByProject] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">รอตรวจสอบ</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-700">อนุมัติ</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">ตีกลับ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  // Group applications by project
  const groupedApplications = filteredApplications.reduce((acc, app) => {
    const projectId = app.projectId || "unknown";
    if (!acc[projectId]) {
      acc[projectId] = {
        projectTitle: app.projectTitle || "ไม่ระบุโครงการ",
        applications: []
      };
    }
    acc[projectId].applications.push(app);
    return acc;
  }, {} as Record<string, { projectTitle: string; applications: any[] }>);

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">ตรวจเอกสาร</h1>
        <p className="text-slate-500 mt-1">ตรวจสอบและอนุมัติเอกสารการสมัคร</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800">{applications.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">รอตรวจสอบ</p>
              <p className="text-2xl font-bold text-slate-800">
                {applications.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">อนุมัติแล้ว</p>
              <p className="text-2xl font-bold text-slate-800">
                {applications.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ตีกลับ</p>
              <p className="text-2xl font-bold text-slate-800">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs and View Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            ทั้งหมด
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("pending")}
          >
            รอตรวจสอบ
          </Button>
          <Button 
            variant={filter === "approved" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("approved")}
          >
            อนุมัติแล้ว
          </Button>
          <Button 
            variant={filter === "rejected" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("rejected")}
          >
            ตีกลับ
          </Button>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!groupByProject ? "default" : "outline"}
            size="sm"
            onClick={() => setGroupByProject(false)}
          >
            <List className="w-4 h-4 mr-2" />
            รายการ
          </Button>
          <Button
            variant={groupByProject ? "default" : "outline"}
            size="sm"
            onClick={() => setGroupByProject(true)}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            จัดกลุ่มตามโครงการ
          </Button>
        </div>
      </div>

      {/* Applications Display */}
      {groupByProject ? (
        /* Grouped View */
        <div className="space-y-4">
          {Object.entries(groupedApplications).map(([projectId, group]) => (
            <Card key={projectId} className="shadow-sm">
              <div className="p-4 border-b bg-slate-50">
                <h3 className="font-semibold text-lg text-slate-800">{group.projectTitle}</h3>
                <p className="text-sm text-slate-500">{group.applications.length} ใบสมัคร</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[200px]">ชื่อ-นามสกุล</TableHead>
                      <TableHead className="w-[150px]">วันที่สมัคร</TableHead>
                      <TableHead className="w-[120px]">เบอร์โทร</TableHead>
                      <TableHead className="w-[120px] text-center">สถานะ</TableHead>
                      <TableHead className="w-[100px] text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.applications.map((app, index) => (
                      <TableRow key={app.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-500">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="font-semibold text-slate-800">
                                {app.personalData?.nameThai} {app.personalData?.surnameThai}
                              </p>
                              <p className="text-xs text-slate-500">
                                {app.personalData?.nameEng} {app.personalData?.surnameEng}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(app.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-600">
                            {app.personalData?.phone || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(app.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/admin/reviews/${app.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              ตรวจสอบ
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}
          {Object.keys(groupedApplications).length === 0 && (
            <Card className="p-8 text-center text-slate-500">
              ไม่มีเอกสารที่ต้องตรวจสอบ
            </Card>
          )}
        </div>
      ) : (
        /* List View */
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[200px]">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="min-w-[150px]">โครงการ</TableHead>
                  <TableHead className="w-[150px]">วันที่สมัคร</TableHead>
                  <TableHead className="w-[120px]">เบอร์โทร</TableHead>
                  <TableHead className="w-[120px] text-center">สถานะ</TableHead>
                  <TableHead className="w-[100px] text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      กำลังโหลด...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      ไม่มีเอกสารที่ต้องตรวจสอบ
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app, index) => (
                  <TableRow key={app.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-slate-800">
                            {app.personalData?.nameThai} {app.personalData?.surnameThai}
                          </p>
                          <p className="text-xs text-slate-500">
                            {app.personalData?.nameEng} {app.personalData?.surnameEng}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600">{app.projectTitle || "-"}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600">
                        {app.personalData?.phone || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/admin/reviews/${app.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          ตรวจสอบ
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      )}
    </div>
  );
}
