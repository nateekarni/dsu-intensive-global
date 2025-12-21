"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
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
        // ดึงใบสมัครของ User คนนี้
        const q = query(collection(db, "applications"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        
        const appsData = await Promise.all(snapshot.docs.map(async (appDoc) => {
          const data = appDoc.data();
          // ดึงชื่อโครงการมาแปะเพิ่ม
          const projSnap = await getDoc(doc(db, "projects", data.projectId));
          return {
            id: appDoc.id,
            ...data,
            projectTitle: projSnap.exists() ? projSnap.data().title : "ไม่ระบุโครงการ"
          };
        }));
        setApplications(appsData);
      }
      setLoading(false);
    };
    fetchApps();
  }, [user]);

  if (loading) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">สถานะการสมัครของฉัน</h1>
      
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center text-slate-500 py-10 bg-white rounded-xl border">ยังไม่มีการสมัครโครงการ</div>
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-primary">{app.projectTitle}</h3>
                <p className="text-xs text-slate-500">สมัครเมื่อ: {app.createdAt?.toDate().toLocaleDateString('th-TH')}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={app.status === 'approved' ? 'default' : 'secondary'}>
                    {app.status === 'checking' && 'รอตรวจสอบ'}
                    {app.status === 'approved' && 'ผ่านการคัดเลือก'}
                    {app.status === 'submitted' && 'ส่งใบสมัครแล้ว'}
                  </Badge>
                  {app.paymentStatus === 'pending' && <Badge variant="destructive">รอชำระเงิน</Badge>}
                </div>
              </div>

              <div className="w-full md:w-auto flex gap-2">
                 {/* ปุ่มดูรายละเอียด / แก้ไขเอกสาร (ถ้าโดนตีกลับ) */}
                 <Link href={`/student/apply/${app.projectId}`}>
                    <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" /> ดูรายละเอียด
                    </Button>
                 </Link>
                 
                 {/* ปุ่มแจ้งโอนเงิน */}
                 {app.status === 'approved' && app.paymentStatus === 'pending' && (
                    <Button size="sm">
                        <Upload className="w-4 h-4 mr-1" /> แจ้งโอนเงิน
                    </Button>
                 )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}