"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, XCircle, Upload, FileText, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApplicationStatusPage() {
    const { id } = useParams(); // Application ID
    const { user } = useAuth();
    const router = useRouter();

    const [application, setApplication] = useState<any>(null);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!user || typeof id !== 'string') return;

            try {
                // Fetch Application
                const appRef = doc(db, "applications", id);
                const appSnap = await getDoc(appRef);

                if (appSnap.exists()) {
                    const appData = appSnap.data();
                    setApplication({ id: appSnap.id, ...appData });

                    // Fetch Project
                    const projRef = doc(db, "projects", appData.projectId);
                    const projSnap = await getDoc(projRef);
                    if (projSnap.exists()) {
                        setProject({ id: projSnap.id, ...projSnap.data() });
                    }
                } else {
                    // Application not found
                    setAlertMessage("ไม่พบข้อมูลใบสมัคร");
                    setAlertOpen(true);
                    router.push("/student/dashboard");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!application || !project) return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.title}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">สถานะ:</span>
                        <Badge variant={application.status === 'approved' ? 'default' : 'secondary'} className="text-base px-3 py-1">
                            {application.status === 'draft' && 'แบบร่าง'}
                            {application.status === 'submitted' && 'ส่งใบสมัครแล้ว'}
                            {application.status === 'checking' && 'กำลังตรวจสอบ'}
                            {application.status === 'approved' && 'ผ่านการคัดเลือก'}
                            {application.status === 'rejected' && 'ไม่ผ่านการคัดเลือก'}
                        </Badge>
                    </div>
                </div>
                {/* Payment Status Badge if Approved */}
                {application.status === 'approved' && (
                    <Card className="p-4 bg-slate-50 border-slate-200">
                        <div className="text-sm text-slate-500 mb-1">สถานะการชำระเงิน</div>
                        <div className="flex items-center gap-2">
                            {application.payment?.status === 'verified' ? (
                                <Badge className="bg-green-600 hover:bg-green-700">ชำระเงินแล้ว</Badge>
                            ) : application.payment?.status === 'pending' ? (
                                <Badge variant="destructive">รอชำระเงิน</Badge>
                            ) : (
                                <Badge variant="outline">ยังไม่ดำเนินการ</Badge>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            {/* Document Status Section */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    รายการเอกสาร
                </h2>

                <div className="space-y-4">
                    {/* Mocking document list for now, ideally this comes from application.uploadedDocuments */}
                    {project.documents?.map((doc: any, index: number) => {
                        const uploadedDoc = application.uploadedDocuments?.[doc.id] || application.uploadedDocuments?.[doc.name]; // Fallback logic
                        const status = uploadedDoc?.status || 'pending';

                        return (
                            <div key={index} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border">
                                <div>
                                    <p className="font-medium text-slate-800">{doc.name}</p>
                                    {status === 'failed' && uploadedDoc?.feedback && (
                                        <p className="text-sm text-red-600 mt-1 flex items-start gap-1">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            แก้ไข: {uploadedDoc.feedback}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {status === 'passed' && <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> ผ่าน</Badge>}
                                    {status === 'failed' && <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> ตีกลับ</Badge>}
                                    {status === 'pending' && <Badge variant="secondary">รอตรวจสอบ</Badge>}
                                    {!uploadedDoc && <Badge variant="outline">ยังไม่อัปโหลด</Badge>}
                                </div>
                            </div>
                        );
                    })}
                    {(!project.documents || project.documents.length === 0) && (
                        <p className="text-slate-500 text-center py-4">ไม่ต้องส่งเอกสารเพิ่มเติม</p>
                    )}
                </div>
            </Card>

            {/* Payment Upload Section (Only if Approved) */}
            {application.status === 'approved' && application.payment?.status !== 'verified' && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        แจ้งโอนเงิน
                    </h2>

                    <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>กรุณาชำระเงินค่าเข้าร่วมโครงการ</AlertTitle>
                        <AlertDescription>
                            ยอดชำระ: <span className="font-bold">฿{project.costs?.amount?.toLocaleString() || '-'}</span>
                            <br />
                            ธนาคาร: ... เลขที่บัญชี: ...
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 font-medium">อัปโหลดหลักฐานการโอนเงิน</p>
                        <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ JPG, PNG, PDF</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button disabled>แจ้งโอนเงิน</Button>
                    </div>
                </Card>
            )}

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
