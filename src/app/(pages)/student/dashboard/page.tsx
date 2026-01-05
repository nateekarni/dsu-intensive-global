"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Upload } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (user) {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            console.warn("No auth token available");
            return;
          }

          const res = await fetch('/api/student/applications', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            setApplications(data);
          } else {
            console.error("Failed to fetch applications");
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            สถานะการสมัครของฉัน
          </h1>
          <div className="text-sm text-slate-500">
            {applications.length} รายการ
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">ยังไม่มีการสมัครโครงการ</h3>
            <p className="text-slate-500 mb-6">คุณสามารถดูโครงการที่เปิดรับสมัครได้ที่หน้าหลัก</p>
            <Link href="/student/feed">
              <Button>ดูโครงการที่เปิดรับ</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-primary/50 hover:border-l-primary">
                <div className="p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                        {app.projectTitle}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        สมัครเมื่อ: {app.createdAt ? new Date(app.createdAt).toLocaleDateString('th-TH') : '-'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={app.status === 'draft' ? 'destructive' : (app.status === 'approved' ? 'default' : 'secondary')} className="capitalize">
                        {app.status === 'checking' && 'รอตรวจสอบ'}
                        {app.status === 'approved' && 'ผ่านการคัดเลือก'}
                        {app.status === 'submitted' && 'ส่งใบสมัครแล้ว'}
                        {app.status === 'draft' && 'ยังไม่สมบูรณ์'}
                      </Badge>

                      {app.payment?.status === 'pending' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                          รอชำระเงิน
                        </Badge>
                      )}
                      {app.payment?.status === 'verified' && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          ชำระเงินแล้ว
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 md:pt-0 md:pl-4 md:border-l border-slate-100">
                    <Link href={`/student/applications/${app.id}`}>
                      <Button variant="outline" size="sm" className="h-9">
                        ดูรายละเอียด
                      </Button>
                    </Link>

                    {app.status === 'approved' && app.payment?.status === 'pending' && (
                      <Button size="sm" className="h-9 bg-orange-500 hover:bg-orange-600">
                        <Upload className="w-4 h-4 mr-1" /> แจ้งโอนเงิน
                      </Button>
                    )}

                    {app.status === 'draft' && (
                      <Link href={`/student/apply/${app.projectId}`}>
                        <Button size="sm" className="h-9">
                          แก้ไขใบสมัคร
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}