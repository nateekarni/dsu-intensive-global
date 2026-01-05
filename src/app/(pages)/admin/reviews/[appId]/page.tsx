"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CheckCircle, XCircle, ArrowLeft, FileText, Upload, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ReviewPage() {
  const { appId } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; docId: string | null; reason: string }>({
    open: false,
    docId: null,
    reason: ""
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const rejectionReasons = [
    "เอกสารไม่ชัดเจน / อ่านยาก",
    "เอกสารหมดอายุ",
    "ชื่อ-นามสกุล ไม่ตรงกับผู้สมัคร",
    "เอกสารผิดประเภท",
    "ข้อมูลไม่ครบถ้วน",
    "อื่นๆ"
  ];

  useEffect(() => {
    const fetch = async () => {
      if (typeof appId === 'string') {
        const snap = await getDoc(doc(db, "applications", appId));
        if (snap.exists()) {
          const appData = { id: snap.id, ...snap.data() } as any;
          setApp(appData);

          // Fetch Project for requirements
          if (appData.projectId) {
            const pSnap = await getDoc(doc(db, "projects", appData.projectId));
            if (pSnap.exists()) {
              setProject({ id: pSnap.id, ...pSnap.data() });
            }
          }
        }
      }
    };
    fetch();
  }, [appId]);

  const calculateAppStatus = (uploadedDocs: any, projectDocs: any[]) => {
    const docs = Object.values(uploadedDocs || {});

    // 1. If any document is rejected -> Rejected
    if (docs.some((d: any) => d.status === 'rejected')) {
      return 'rejected';
    }

    // Check required documents presence
    const requiredDocIds = projectDocs?.map(d => d.id) || [];
    const uploadedDocIds = Object.keys(uploadedDocs || {});
    const isMissingDocs = requiredDocIds.some(id => !uploadedDocIds.includes(id));

    // 2. If missing requirements -> Incomplete
    if (isMissingDocs) {
      return 'incomplete'; // New status
    }

    // 3. If all present and all approved -> Approved
    if (docs.every((d: any) => d.status === 'approved')) {
      return 'approved';
    }

    // 4. Otherwise (All present, none rejected, but not all approved) -> Pending
    return 'pending';
  };

  const updateDocumentStatus = async (docId: string, status: 'approved' | 'rejected' | 'pending', reason?: string) => {
    if (!app) return;
    try {
      const updatedDocs = {
        ...app.uploadedDocuments,
        [docId]: {
          ...app.uploadedDocuments[docId],
          status,
          rejectionReason: reason || null
        }
      };

      const newAppStatus = calculateAppStatus(updatedDocs, project?.documents || []);

      await updateDoc(doc(db, "applications", app.id), {
        uploadedDocuments: updatedDocs,
        status: newAppStatus
      });

      setApp({ ...app, uploadedDocuments: updatedDocs, status: newAppStatus });

      if (status === 'rejected') {
        setRejectDialog({ open: false, docId: null, reason: "" });
      }
    } catch (e) {
      console.error(e);
      setAlertMessage("เกิดข้อผิดพลาดในการอัปเดตสถานะเอกสาร");
      setAlertOpen(true);
    }
  };

  const markAsPaidCash = async () => {
    if (!confirm("ยืนยันการรับเงินสด?")) return;
    await updateDoc(doc(db, "applications", app.id), {
      paymentStatus: 'paid_cash',
      paymentMethod: 'cash'
    });
    setApp({ ...app, paymentStatus: 'paid_cash' });
    setAlertMessage("บันทึกรับเงินสดเรียบร้อย");
    setAlertOpen(true);
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">อนุมัติ</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">ไม่ผ่าน</Badge>;
      default: return <Badge variant="secondary">รอตรวจสอบ</Badge>;
    }
  };

  if (!app) return <div>Loading...</div>;

  const p = app.personalData || {};

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับหน้ารายการ
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {p.nameThai} {p.surnameThai}
          <Badge className={
            app.status === 'approved' ? "bg-green-100 text-green-700" :
              app.status === 'rejected' ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
          }>
            {app.status === 'approved' ? "สมบูรณ์แล้ว" :
              app.status === 'rejected' ? "เอกสารไม่ผ่าน" :
                app.status === 'incomplete' ? "เอกสารไม่ครบ" :
                  "รอตรวจสอบ"}
          </Badge>
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-200 text-green-700 bg-green-50" onClick={markAsPaidCash}>
            <Banknote className="w-4 h-4 mr-2" /> รับเงินสด
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Info Column */}
        <div className="space-y-6">
          {/* Personal Info */}
          <Card className="p-4">
            <h3 className="font-bold border-b pb-2 mb-4 text-primary">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="col-span-2 md:col-span-1">
                <p className="text-slate-500 text-xs">ชื่อ-นามสกุล (ไทย)</p>
                <p className="font-medium">{p.prefixThai} {p.nameThai} {p.surnameThai}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-slate-500 text-xs">Name-Surname (Eng)</p>
                <p className="font-medium">{p.prefixEng} {p.nameEng} {p.surnameEng}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">วันเกิด</p>
                <p>{p.birthDate || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">เลขบัตรประชาชน</p>
                <p>{p.citizenId || "-"}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">น้ำหนัก / ส่วนสูง</p>
                <p>{p.weight || "-"} กก. / {p.height || "-"} ซม.</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Passport No.</p>
                <p>{p.passportNo || "-"}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">เบอร์โทรศัพท์</p>
                <p>{p.phone || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Line ID</p>
                <p>{p.lineId || "-"}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">Email</p>
                <p>{p.email || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">เบอร์ผู้ปกครอง</p>
                <p>{p.parentPhone || "-"}</p>
              </div>
            </div>
          </Card>

          {/* Health & Education */}
          <Card className="p-4">
            <h3 className="font-bold border-b pb-2 mb-4 text-primary">ข้อมูลการศึกษา & สุขภาพ</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">รหัสนักเรียน</p>
                <p>{p.studentId || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">ระดับชั้น / ห้อง</p>
                <p>{p.gradeLevel || "-"} / {p.classroom || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">แผนการเรียน</p>
                <p>{p.studyPlan || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">เกรดเฉลี่ย (GPA)</p>
                <p>{p.gpa || "-"}</p>
              </div>

              <div className="col-span-2 border-t pt-2 mt-1">
                <p className="text-slate-500 text-xs">โรคประจำตัว</p>
                <p className="text-red-600 font-medium">{p.diseases || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-xs">แพ้ยา / แพ้อาหาร</p>
                <p className="text-red-600 font-medium">{p.allergies || "-"}</p>
              </div>
            </div>
          </Card>

          {/* Additional Answers */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 text-primary">คำตอบเพิ่มเติม</h3>
            <div className="space-y-3 text-sm bg-slate-50 p-3 rounded border border-slate-100">
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">เหตุผลที่สนใจเข้าร่วมโครงการ</p>
                <p className="text-slate-700">{app.answers?.reason || app.consent?.whyJoin || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold mb-1">รู้จักโครงการผ่านช่องทางใด</p>
                <p className="text-slate-700">{app.answers?.channel || app.consent?.howKnow || "-"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Preview Column */}
        <div className="h-full flex flex-col gap-4">
          <Card className="p-4 bg-white shadow-sm border border-slate-200">
            <h3 className="font-bold border-b pb-2 mb-4 text-primary flex items-center justify-between">
              รายการเอกสาร
              <span className="text-xs font-normal text-slate-500">
                {Object.keys(app.uploadedDocuments || {}).length} รายการ
              </span>
            </h3>

            {/* Document List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {Object.entries(app.uploadedDocuments || {}).map(([key, doc]: [string, any]) => (
                <div
                  key={key}
                  onClick={() => setSelectedDocId(key)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all ${selectedDocId === key
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${doc.status === 'approved' ? 'bg-green-100 text-green-600' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={doc.name}>{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getDocStatusBadge(doc.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(app.uploadedDocuments || {}).length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-400">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>ไม่มีเอกสารที่อัปโหลด</p>
                </div>
              )}
            </div>

            {/* Preview & Actions */}
            {selectedDocId && app.uploadedDocuments?.[selectedDocId] ? (
              <div className="border-t pt-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    {app.uploadedDocuments[selectedDocId].name}
                    {app.uploadedDocuments[selectedDocId].status === 'rejected' && (
                      <span className="text-xs font-normal text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {app.uploadedDocuments[selectedDocId].rejectionReason}
                      </span>
                    )}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRejectDialog({ open: true, docId: selectedDocId, reason: "" })}
                      disabled={app.uploadedDocuments[selectedDocId].status === 'rejected'}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={() => updateDocumentStatus(selectedDocId, 'approved')}
                      disabled={app.uploadedDocuments[selectedDocId].status === 'approved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      อนุมัติ
                    </Button>
                    <a
                      href={app.uploadedDocuments[selectedDocId].url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        เปิดแท็บใหม่
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-lg border border-slate-200 overflow-hidden h-[600px] flex items-center justify-center relative">
                  {['jpg', 'jpeg', 'png', 'webp', 'gif'].some(ext => app.uploadedDocuments[selectedDocId].name?.toLowerCase().endsWith(ext)) ? (
                    <img
                      src={app.uploadedDocuments[selectedDocId].url}
                      className="w-full h-full object-contain"
                      alt="Document Preview"
                    />
                  ) : (
                    <iframe
                      src={app.uploadedDocuments[selectedDocId].url}
                      className="w-full h-full bg-white"
                      title="File Preview"
                    />
                  )}
                </div>
              </div>
            ) : Object.keys(app.uploadedDocuments || {}).length > 0 ? (
              <div className="border-t pt-12 pb-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>กรุณาเลือกเอกสารเพื่อตรวจสอบ</p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(val) => setRejectDialog(prev => ({ ...prev, open: val }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ระบุเหตุผลที่ปฏิเสธเอกสาร</DialogTitle>
            <DialogDescription>
              กรุณาเลือกหรือระบุเหตุผลที่ต้องการปฏิเสธเอกสารนี้ เพื่อแจ้งให้ผู้สมัครทราบและแก้ไข
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>เลือกเหตุผล</Label>
              <Select
                onValueChange={(val) => setRejectDialog(prev => ({ ...prev, reason: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเหตุผล..." />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>รายละเอียดเพิ่มเติม (ถ้ามี)</Label>
              <Textarea
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="ระบุรายละเอียด..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, docId: null, reason: "" })}>ยกเลิก</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectDialog.docId) {
                  updateDocumentStatus(rejectDialog.docId, 'rejected', rejectDialog.reason);
                }
              }}
              disabled={!rejectDialog.reason}
            >
              ยืนยันการปฏิเสธ
            </Button>
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