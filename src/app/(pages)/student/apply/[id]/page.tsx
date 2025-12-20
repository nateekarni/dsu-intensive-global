"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage, auth } from "@/lib/firebase"; // เพิ่ม auth
import { doc, getDoc, addDoc, collection, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; // เพิ่ม create user
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, FileText, Upload, User, LogIn } from "lucide-react";

export default function ApplyPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State หลัก
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State สำหรับ Flow การสมัคร
  const [step, setStep] = useState(1); // 1: Personal, 2: Docs, 3: Confirm
  const [authSelectionMode, setAuthSelectionMode] = useState(false); // true = แสดงหน้าเลือก (เก่า/ใหม่)

  // Form Data
  const [personalInfo, setPersonalInfo] = useState({
    studentId: "", // ✅ เพิ่มรหัสนักเรียน
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "", // ใช้สำหรับสร้าง Password (YYYY-MM-DD)
    parentPhone: "",
    diseases: "",
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});

  // 1. Load Project & Check User Status
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", params.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setProject({ id: snapshot.id, ...snapshot.data() });
        } else {
          router.push("/student/feed");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        // ถ้ายังไม่ล็อกอิน ให้เข้าโหมดเลือกบัญชี
        setAuthSelectionMode(true);
      } 
      // ถ้าล็อกอินแล้ว ให้ข้ามไปกรอกข้อมูลได้เลย (หรือจะดึงข้อมูลเก่ามาเติมก็ได้)
      fetchProject();
    }
  }, [params.id, user, authLoading, router]);


  // Helper: แปลงวันที่เป็นรหัสผ่าน (DDMMYY)
  const getDatePassword = (dateString: string) => {
    if (!dateString) return "";
    // input type="date" returns YYYY-MM-DD
    const [year, month, day] = dateString.split("-"); 
    // แปลงปี ค.ศ. เป็น 2 หลักท้าย (เช่น 2005 -> 05)
    const shortYear = year.slice(-2);
    return `${day}${month}${shortYear}`; // format: 210305
  };


  // --- HANDLER: กดถัดไปจาก Step 1 -> 2 (จุดสำคัญ!) ---
  const handleNextStep = async () => {
    if (step === 1) {
      // Validation เบื้องต้น
      if (!personalInfo.studentId || !personalInfo.firstName || !personalInfo.lastName || !personalInfo.birthDate || !personalInfo.phone) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      setSubmitting(true);
      
      try {
        // 🚀 CASE: สมัครครั้งแรก (ยังไม่มี User) -> ต้องสร้างบัญชีให้ก่อน
        if (!user) {
          const fakeEmail = `${personalInfo.studentId}@dsu.student`;
          const password = getDatePassword(personalInfo.birthDate); // ใช้ DDMMYY เป็นรหัสผ่าน

          // 1. สร้าง Auth User
          const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
          const newUser = userCredential.user;

          // 2. บันทึก User Profile ลง Firestore
          await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            email: fakeEmail,
            role: "student", // ✅ บังคับเป็น Student
            profile: {
              studentId: personalInfo.studentId,
              nameThai: personalInfo.firstName,
              surnameThai: personalInfo.lastName,
              phone: personalInfo.phone,
              birthDatePasscode: password // เก็บไว้ดูเป็น Reference (option)
            },
            createdAt: serverTimestamp(),
          });

          // *หมายเหตุ: เมื่อ createUser สำเร็จ Firebase จะ login ให้อัตโนมัติ state 'user' จะเปลี่ยนเอง
        }
        
        // ถ้าผ่านทุกอย่าง -> ไป Step 2
        setStep(2);

      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          alert(`รหัสนักเรียน ${personalInfo.studentId} นี้มีบัญชีอยู่แล้ว กรุณากลับไปเลือก "เคยสมัครเข้าร่วมโครงการแล้ว" เพื่อเข้าสู่ระบบ`);
        } else if (err.code === 'auth/weak-password') {
            alert("รหัสผ่าน (วันเดือนปีเกิด) ไม่ถูกต้อง หรือสั้นเกินไป");
        } else {
          alert("เกิดข้อผิดพลาดในการสร้างบัญชี: " + err.message);
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    // ... (Code เดิมสำหรับการอัปโหลด)
    try {
        const storageRef = ref(storage, `applications/${user?.uid}/${params.id}/${docId}_${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        setUploadedDocs(prev => ({ ...prev, [docId]: url }));
    } catch (err) {
        console.error(err);
        alert("อัปโหลดไฟล์ไม่สำเร็จ");
    }
  };

  const handleSubmitApplication = async () => {
    if (!user || !project) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        projectId: project.id,
        userId: user.uid,
        personalInfo,
        documents: uploadedDocs,
        status: "pending",
        submittedAt: Timestamp.now()
      });
      router.push("/student/dashboard"); // ส่งไปหน้า Dashboard
    } catch (err) {
      console.error(err);
      alert("ส่งใบสมัครไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>;

  // ------------------------------------------------
  // VIEW 1: หน้าเลือกประเภทผู้สมัคร (ถ้ายังไม่ Login)
  // ------------------------------------------------
  if (authSelectionMode && !user) {
    return (
      <div className="container mx-auto p-4 max-w-md min-h-[80vh] flex flex-col justify-center">
        <Card className="p-8 space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">ลงทะเบียนเข้าร่วมโครงการ</h1>
            <p className="text-slate-500 text-sm">กรุณาเลือกสถานะของคุณเพื่อดำเนินการต่อ</p>
          </div>
          
          <div className="space-y-3">
             {/* ปุ่มสำหรับคนใหม่ */}
             <Button 
                onClick={() => setAuthSelectionMode(false)} // ปิดหน้านี้ -> ไปเจอ Form Step 1
                className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
             >
                <User className="mr-2 w-5 h-5"/> สมัครเข้าร่วมครั้งแรก
             </Button>

             {/* ปุ่มสำหรับคนเก่า */}
             <Button 
                variant="outline"
                onClick={() => router.push("/auth/login")} // ไปหน้า Login ปกติ
                className="w-full h-12 text-lg border-slate-300"
             >
                <LogIn className="mr-2 w-5 h-5"/> เคยสมัครแล้ว (มีบัญชี)
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------
  // VIEW 2: แบบฟอร์มใบสมัคร (Step 1, 2, 3)
  // ------------------------------------------------
  return (
    <div className="container mx-auto p-4 max-w-2xl pb-24">
      <div className="mb-6">
         <h1 className="text-xl font-bold">สมัคร: {project?.title}</h1>
         {/* Progress Bar */}
         <div className="flex gap-2 mt-2">
            <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
         </div>
      </div>

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-lg border-b pb-2">ข้อมูลส่วนตัว (Step 1/3)</h2>
          {!user && (
             <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm mb-4">
                ℹ️ เนื่องจากเป็นการสมัครครั้งแรก ระบบจะใช้ <b>รหัสนักเรียน</b> เป็น Username และ <b>วันเกิด (DDMMYY)</b> เป็นรหัสผ่านสำหรับเข้าสู่ระบบให้อัตโนมัติ
             </div>
          )}
          
          <div className="space-y-3">
            {/* ✅ เพิ่มรหัสนักเรียน */}
            <div className="space-y-1">
                <Label>รหัสนักเรียน <span className="text-red-500">*</span></Label>
                <Input 
                  value={personalInfo.studentId} 
                  onChange={e => setPersonalInfo({...personalInfo, studentId: e.target.value})} 
                  placeholder="เช่น 650123"
                  disabled={!!user} // ถ้า Login แล้วห้ามแก้ (หรือจะให้แก้ได้ถ้ายังไม่มีใน profile ก็ได้)
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <Label>ชื่อจริง (ไทย)</Label>
                  <Input value={personalInfo.firstName} onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <Label>นามสกุล (ไทย)</Label>
                  <Input value={personalInfo.lastName} onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})} />
               </div>
            </div>

            <div className="space-y-1">
               <Label>วันเดือนปีเกิด <span className="text-red-500">*</span></Label>
               <Input 
                  type="date" 
                  value={personalInfo.birthDate} 
                  onChange={e => setPersonalInfo({...personalInfo, birthDate: e.target.value})} 
               />
               {!user && <p className="text-xs text-slate-400">จะถูกใช้เป็นรหัสผ่าน (เช่นเกิด 21 มี.ค. 2005 รหัสคือ 210305)</p>}
            </div>

            <div className="space-y-1">
               <Label>เบอร์โทรศัพท์</Label>
               <Input type="tel" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} />
            </div>
            
            <div className="space-y-1">
               <Label>เบอร์ผู้ปกครอง</Label>
               <Input type="tel" value={personalInfo.parentPhone} onChange={e => setPersonalInfo({...personalInfo, parentPhone: e.target.value})} />
            </div>

             <div className="space-y-1">
               <Label>โรคประจำตัว / การแพ้อาหาร</Label>
               <Textarea value={personalInfo.diseases} onChange={e => setPersonalInfo({...personalInfo, diseases: e.target.value})} placeholder="ถ้าไม่มีให้ระบุว่า -" />
            </div>
          </div>
          
          <Button className="w-full mt-4" onClick={handleNextStep} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin"/> : "ถัดไป (อัปโหลดเอกสาร)"}
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
           <h2 className="font-bold text-lg border-b pb-2">อัปโหลดเอกสาร (Step 2/3)</h2>
           <div className="space-y-4">
              {project?.documents?.map((doc: any, i: number) => (
                 <div key={i} className="border p-3 rounded-lg bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                       <Label className="font-medium">{doc.name}</Label>
                       {uploadedDocs[doc.name] && <CheckCircle className="w-5 h-5 text-green-500"/>}
                    </div>
                    <Input 
                       type="file" 
                       onChange={(e) => {
                          if(e.target.files?.[0]) handleFileUpload(doc.name, e.target.files[0]);
                       }}
                    />
                 </div>
              ))}
           </div>
           <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">ย้อนกลับ</Button>
              <Button onClick={() => setStep(3)} className="flex-1">ถัดไป</Button>
           </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4 text-center">
            <h2 className="font-bold text-lg border-b pb-2">ยืนยันการสมัคร (Step 3/3)</h2>
            <div className="py-6">
               <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4"/>
               <p className="text-lg">ตรวจสอบข้อมูลเรียบร้อยแล้ว?</p>
               <p className="text-slate-500 text-sm">เมื่อกดยืนยันแล้ว เจ้าหน้าที่จะทำการตรวจสอบและแจ้งผลผ่านระบบ</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">ย้อนกลับ</Button>
              <Button onClick={handleSubmitApplication} disabled={submitting} className="flex-1">
                 {submitting ? <Loader2 className="animate-spin mr-2"/> : null}
                 ยืนยันการสมัคร
              </Button>
           </div>
        </Card>
      )}
    </div>
  );
}