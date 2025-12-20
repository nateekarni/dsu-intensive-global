"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { processPassportImage } from "@/lib/passportUtils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function ApplicationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Form Data (รวมทุกอย่างไว้ที่นี่)
  const [formData, setFormData] = useState<any>({
    // ส่วนที่ 1: ข้อมูลส่วนตัว
    prefixThai: "นาย",
    nameThai: "",
    surnameThai: "",
    nameEng: "",
    surnameEng: "",
    birthDate: "",
    weight: "",
    height: "",
    idCard: "",
    phone: "",
    parentPhone: "",
    email: "",
    lineId: "",
    diseases: "-",
    allergies: "-",
    // ส่วนที่ 1.1: การศึกษา
    gradeLevel: "",
    studyPlan: "",
    gpa: "",
    
    // ส่วนที่ 2: Passport
    passportNo: "",
    passportExpiry: "",
    passportFile: null as File | null, // ไฟล์ที่จะอัปโหลด (Blob ที่มีวงรี)
    passportPreview: "", // URL ไว้โชว์รูป
    
    // ส่วนที่ 3: คำถามและยินยอม
    reason: "", // ทำไมถึงสนใจ
    source: "", // รู้จักจากไหน
    consents: {
      ticket: false,
      refund: false,
      capacity: false
    }
  });

  // 1. ดึงข้อมูล User Profile เดิมมา Auto-fill
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data().profile || {};
          // Merge ข้อมูลเดิมเข้า Form (เฉพาะส่วนข้อมูลส่วนตัว)
          setFormData(prev => ({
            ...prev,
            ...profile,
            // Reset ส่วนคำถามเสมอ (ไม่ Auto-fill)
            reason: "", 
            source: "",
            consents: { ticket: false, refund: false, capacity: false }
          }));
        }
      }
    };
    loadProfile();
  }, [user]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Passport Upload & OCR
  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrLoading(true);
      
      // เรียกใช้ Utility ที่เราทำไว้
      const result = await processPassportImage(file);
      
      setOcrLoading(false);

      if (result.error) {
        alert("แจ้งเตือน: " + result.error);
        return; // ถ้าไม่ผ่านเงื่อนไข (เช่น หมดอายุ) ให้หยุด
      }

      // ถ้าผ่าน -> อัปเดต State
      if (result.annotatedImageBlob) {
        const previewUrl = URL.createObjectURL(result.annotatedImageBlob);
        setFormData(prev => ({
          ...prev,
          passportNo: result.passportNo || prev.passportNo,
          passportExpiry: result.expiryDate || prev.passportExpiry,
          passportFile: result.annotatedImageBlob,
          passportPreview: previewUrl
        }));
      }
    }
  };

  // Handle Submit Final
  const handleSubmit = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      // 1. Upload Passport Image (ถ้ามี)
      let passportUrl = formData.passportUrl || "";
      if (formData.passportFile) {
        const storageRef = ref(storage, `passports/${user.uid}_${Date.now()}.jpg`);
        const snapshot = await uploadBytes(storageRef, formData.passportFile);
        passportUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Save/Update User Profile (เก็บข้อมูลล่าสุดไว้ใช้ครั้งหน้า)
      await updateDoc(doc(db, "users", user.uid), {
        profile: {
          prefixThai: formData.prefixThai,
          nameThai: formData.nameThai,
          surnameThai: formData.surnameThai,
          nameEng: formData.nameEng,
          surnameEng: formData.surnameEng,
          birthDate: formData.birthDate,
          weight: formData.weight,
          height: formData.height,
          idCard: formData.idCard,
          phone: formData.phone,
          parentPhone: formData.parentPhone,
          email: formData.email,
          lineId: formData.lineId,
          diseases: formData.diseases,
          allergies: formData.allergies,
          gradeLevel: formData.gradeLevel,
          studyPlan: formData.studyPlan,
          gpa: formData.gpa,
          passportNo: formData.passportNo,
          passportExpiry: formData.passportExpiry,
          passportUrl: passportUrl // เก็บ URL รูปเดิมไว้ด้วย
        }
      });

      // 3. Create Application
      await addDoc(collection(db, "applications"), {
        projectId: id,
        userId: user.uid,
        status: "submitted",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        personalData: formData, // Snapshot ข้อมูล ณ วันที่สมัคร
        answers: {
          reason: formData.reason,
          source: formData.source
        },
        documents: {
          passport: passportUrl
        }
      });

      alert("สมัครโครงการเรียบร้อยแล้ว!");
      router.push("/student/dashboard"); // ไปหน้าสถานะ (EP ต่อไป)

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสมัคร");
    } finally {
      setLoading(false);
      setShowReviewModal(false);
    }
  };

  // --- RENDER PARTS ---
  
  // Part 1: ข้อมูลส่วนตัว
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
        ข้อมูลส่วนตัว
      </h2>
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label>คำนำหน้า (ไทย)</Label>
                <select name="prefixThai" className="input" value={formData.prefixThai} onChange={handleChange}>
                    <option>นาย</option><option>นางสาว</option><option>เด็กชาย</option><option>เด็กหญิง</option>
                </select>
            </div>
            {/* ... เพิ่ม Input อื่นๆ ตามรายการที่ขอ ... */}
            <div className="space-y-1"><Label>ชื่อ (ไทย)</Label><Input name="nameThai" value={formData.nameThai} onChange={handleChange} /></div>
            <div className="space-y-1"><Label>นามสกุล (ไทย)</Label><Input name="surnameThai" value={formData.surnameThai} onChange={handleChange} /></div>
            <div className="space-y-1"><Label>Email</Label><Input name="email" value={formData.email} onChange={handleChange} /></div>
            <div className="space-y-1"><Label>เบอร์โทรศัพท์</Label><Input name="phone" value={formData.phone} onChange={handleChange} /></div>
        </div>
        
        <div className="border-t pt-4 mt-4">
           <h3 className="font-bold mb-3">ข้อมูลการศึกษา</h3>
           <div className="grid grid-cols-3 gap-4">
               <div className="space-y-1"><Label>ระดับชั้น</Label><Input name="gradeLevel" placeholder="ม.4" value={formData.gradeLevel} onChange={handleChange} /></div>
               <div className="space-y-1"><Label>แผนการเรียน</Label><Input name="studyPlan" placeholder="วิทย์-คณิต" value={formData.studyPlan} onChange={handleChange} /></div>
               <div className="space-y-1"><Label>เกรดเฉลี่ย</Label><Input name="gpa" placeholder="3.50" value={formData.gpa} onChange={handleChange} /></div>
           </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => setStep(2)}>ถัดไป &gt;</Button>
      </div>
    </div>
  );

  // Part 2: Passport & Documents
  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
        เอกสารเดินทาง
      </h2>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
            <Label>อัปโหลด Passport (ระบบจะตรวจสอบอัตโนมัติ)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handlePassportUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                {ocrLoading ? (
                    <div className="flex flex-col items-center text-primary"><Loader2 className="animate-spin w-8 h-8" /><span className="text-sm mt-2">กำลังสแกนข้อมูล...</span></div>
                ) : formData.passportPreview ? (
                    <div className="flex flex-col items-center">
                        <img src={formData.passportPreview} className="max-h-48 mb-2 border shadow-sm" />
                        <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> ตรวจสอบแล้ว</span>
                        <p className="text-xs text-slate-500 mt-1">เลขที่: {formData.passportNo} | หมดอายุ: {formData.passportExpiry}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span>คลิกเพื่ออัปโหลดรูปภาพ</span>
                    </div>
                )}
            </div>
        </div>

        {/* Template Document Section */}
        <div className="pt-4 border-t space-y-4">
            <h3 className="font-bold">เอกสารอื่นๆ</h3>
            {/* Example: ใบขออนุญาต */}
            <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <div className="text-sm">
                        <p className="font-medium">หนังสือยินยอมจากผู้ปกครอง</p>
                        <a href="#" className="text-primary text-xs hover:underline flex items-center gap-1">[ดาวน์โหลดแบบฟอร์ม PDF]</a>
                    </div>
                </div>
                <Button variant="outline" size="sm">อัปโหลด</Button>
            </div>
        </div>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>&lt; ย้อนกลับ</Button>
        <Button onClick={() => setStep(3)}>ถัดไป &gt;</Button>
      </div>
    </div>
  );

  // Part 3: Consents & Questions
  const renderStep3 = () => (
    <div className="space-y-4">
       <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
        คำถามและข้อตกลง
      </h2>
      <Card className="p-6 space-y-6">
          <div className="space-y-3">
              <Label>ทำไมถึงสนใจเข้าร่วมกิจกรรมนี้?</Label>
              <textarea 
                  className="input h-24 pt-2" 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleChange} 
                  placeholder="เขียนเหตุผลของคุณ..."
              />
          </div>
          
          <div className="space-y-3 border-t pt-4">
              <h3 className="font-bold text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> ข้อตกลงสำคัญ</h3>
              <div className="flex items-start gap-2">
                  <Checkbox 
                    id="c1" 
                    checked={formData.consents.ticket} 
                    onCheckedChange={(c) => setFormData(prev => ({...prev, consents: {...prev.consents, ticket: c}}))}
                  />
                  <label htmlFor="c1" className="text-sm leading-none pt-0.5">ข้าพเจ้ารับทราบว่า จะต้องรับผิดชอบค่าตั๋วเครื่องบินไป-กลับ</label>
              </div>
              <div className="flex items-start gap-2">
                  <Checkbox 
                    id="c2" 
                    checked={formData.consents.refund} 
                    onCheckedChange={(c) => setFormData(prev => ({...prev, consents: {...prev.consents, refund: c}}))}
                  />
                  <label htmlFor="c2" className="text-sm leading-none pt-0.5">ข้าพเจ้ารับทราบว่า หากชำระเงินแล้ว จะไม่สามารถขอคืนเงินได้ทุกกรณี</label>
              </div>
          </div>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>&lt; ย้อนกลับ</Button>
        <Button 
            onClick={() => setShowReviewModal(true)} 
            disabled={!formData.consents.ticket || !formData.consents.refund}
        >
            ตรวจสอบข้อมูล &gt;
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl pb-24">
        {/* Header */}
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> ยกเลิกการสมัคร
        </Button>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>ยืนยันข้อมูลการสมัคร</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm text-slate-600">
                    <p>กรุณาตรวจสอบข้อมูลอีกครั้ง หากยืนยันแล้วจะไม่สามารถแก้ไขข้อมูลส่วนตัวได้</p>
                    <div className="bg-slate-50 p-4 rounded border">
                        <p><strong>ชื่อ-สกุล:</strong> {formData.nameThai} {formData.surnameThai}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Passport:</strong> {formData.passportNo || "-"}</p>
                        <p className="text-xs text-slate-400 mt-2">* ข้อมูลจะถูกบันทึกลงในระบบเพื่อใช้สมัครครั้งถัดไปอัตโนมัติ</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowReviewModal(false)}>แก้ไข</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        ยืนยันและสมัคร
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}