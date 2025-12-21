"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CheckCircle, XCircle } from "lucide-react";

export default function ReviewPage() {
  const { appId } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
        if (typeof appId === 'string') {
            const snap = await getDoc(doc(db, "applications", appId));
            if (snap.exists()) setApp({ id: snap.id, ...snap.data() });
        }
    };
    fetch();
  }, [appId]);

  const updateStatus = async (status: string) => {
    if (!app) return;
    await updateDoc(doc(db, "applications", app.id), { status });
    setApp({ ...app, status }); // Update Local
    alert(`อัปเดตสถานะเป็น ${status} แล้ว`);
  };

  const markAsPaidCash = async () => {
    if (!confirm("ยืนยันการรับเงินสด?")) return;
    await updateDoc(doc(db, "applications", app.id), { 
        paymentStatus: 'paid_cash',
        paymentMethod: 'cash'
    });
    setApp({ ...app, paymentStatus: 'paid_cash' });
    alert("บันทึกรับเงินสดเรียบร้อย");
  };

  if (!app) return <div>Loading...</div>;

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold flex items-center gap-2">
            {app.personalData.nameThai} {app.personalData.surnameThai}
            <Badge>{app.status}</Badge>
         </h1>
         <div className="flex gap-2">
            {/* ปุ่มรับเงินสด */}
            <Button variant="outline" className="border-green-200 text-green-700 bg-green-50" onClick={markAsPaidCash}>
                <Banknote className="w-4 h-4 mr-2" /> รับเงินสด
            </Button>
            
            <Button variant="destructive" onClick={() => updateStatus('rejected')}>
                <XCircle className="w-4 h-4 mr-2" /> ตีกลับเอกสาร
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus('approved')}>
                <CheckCircle className="w-4 h-4 mr-2" /> อนุมัติ / ผ่าน
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
         {/* Info Column */}
         <Card className="p-4 overflow-y-auto">
            <h3 className="font-bold border-b pb-2 mb-4">ข้อมูลส่วนตัว</h3>
            <div className="space-y-2 text-sm">
                <p><strong>เลขบัตร ปชช:</strong> {app.personalData.idCard}</p>
                <p><strong>Passport:</strong> {app.personalData.passportNo}</p>
                <p><strong>เบอร์โทร:</strong> {app.personalData.phone}</p>
                <p><strong>โรคประจำตัว:</strong> {app.personalData.diseases}</p>
            </div>
            
            <h3 className="font-bold border-b pb-2 mb-4 mt-6">คำตอบเพิ่มเติม</h3>
            <div className="space-y-2 text-sm bg-slate-50 p-3 rounded">
                <p><strong>เหตุผลที่สนใจ:</strong> {app.answers.reason}</p>
            </div>
         </Card>

         {/* Document Preview Column */}
         <Card className="p-4 bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed">
             {app.documents?.passport ? (
                <div className="relative w-full h-full">
                    <iframe src={app.documents.passport} className="w-full h-full rounded bg-white" />
                </div>
             ) : (
                <p className="text-slate-400">ไม่มีไฟล์เอกสาร</p>
             )}
         </Card>
      </div>
    </div>
  );
}