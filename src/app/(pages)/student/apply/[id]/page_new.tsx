"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  CheckCircle,
  User,
  LogIn,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { PersonalInfoForm, ConsentForm } from "@/types";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projectId, setProjectId] = useState<string>("");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Flow Control
  const [currentView, setCurrentView] = useState<'auth-select' | 'personal-form' | 'consent-form'>('auth-select');

  // Form Data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>({
    prefixThai: '',
    prefixEng: '',
    nameThai: '',
    nameEng: '',
    surnameThai: '',
    surnameEng: '',
    birthDate: '',
    weight: 0,
    height: 0,
    studentId: '',
    citizenId: '',
    passportNo: '',
    phone: '',
    parentPhone: '',
    email: '',
    lineId: '',
    diseases: '',
    allergies: '',
    gradeLevel: '',
    classroom: '',
    studyPlan: '',
    gpa: 0,
  });

  const [consentInfo, setConsentInfo] = useState<ConsentForm>({
    agreeFlightCost: false,
    agreeNoRefund: false,
    agreeLimitedSeats: false,
    whyJoin: '',
    howKnow: '',
  });

  // Load Project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const resolvedParams = await params;
        setProjectId(resolvedParams.id);
        const docRef = doc(db, "projects", resolvedParams.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setProject({ id: snapshot.id, ...snapshot.data() });
        } else {
          alert("ไม่พบโครงการ");
          router.push("/student/feed");
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchProject();
  }, [params]);

  // Check Auth Status
  useEffect(() => {
    if (!authLoading && !loading) {
      if (user) {
        // ถ้า login แล้ว ไปหน้ากรอกฟอร์มเลย (ถ้ามี profile ให้ pre-fill)
        if (user.profile) {
          setPersonalInfo({
            prefixThai: user.profile.prefixThai || '',
            prefixEng: user.profile.prefixEng || '',
            nameThai: user.profile.nameThai || '',
            nameEng: user.profile.nameEng || '',
            surnameThai: user.profile.surnameThai || '',
            surnameEng: user.profile.surnameEng || '',
            birthDate: user.profile.birthDate || '',
            weight: user.profile.weight || 0,
            height: user.profile.height || 0,
            studentId: user.profile.studentId || '',
            citizenId: user.profile.citizenId || '',
            passportNo: user.profile.passportNo || '',
            phone: user.profile.phone || '',
            parentPhone: user.profile.parentPhone || '',
            email: user.profile.email || user.email || '',
            lineId: user.profile.lineId || '',
            diseases: user.profile.diseases || '',
            allergies: user.profile.allergies || '',
            gradeLevel: user.profile.gradeLevel || '',
            classroom: user.profile.classroom || '',
            studyPlan: user.profile.studyPlan || '',
            gpa: user.profile.gpa || 0,
          });
        }
        setCurrentView('personal-form');
      } else {
        // ไม่ได้ login -> แสดงหน้าเลือก
        setCurrentView('auth-select');
      }
    }
  }, [user, authLoading, loading]);

  // Handle Auth Selection
  const handleAuthSelection = (type: 'login' | 'register') => {
    if (type === 'login') {
      // Redirect to login with return URL
      router.push(`/auth/login?redirect=/student/apply/${projectId}`);
    } else {
      // ไปหน้ากรอกข้อมูลเลย
      setCurrentView('personal-form');
    }
  };

  // Handle Personal Form Submit
  const handlePersonalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!personalInfo.prefixThai || !personalInfo.nameThai || !personalInfo.surnameThai) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // Move to consent form
    setCurrentView('consent-form');
  };

  // Handle Final Submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate consent
    if (!consentInfo.agreeFlightCost || !consentInfo.agreeNoRefund || !consentInfo.agreeLimitedSeats) {
      alert('กรุณายอมรับข้อตกลงทั้งหมด');
      return;
    }

    if (!consentInfo.whyJoin || !consentInfo.howKnow) {
      alert('กรุณาตอบคำถามให้ครบถ้วน');
      return;
    }

    setSubmitting(true);

    try {
      let userId = user?.uid;

      // ถ้ายังไม่ได้ login (สมัครครั้งแรก) -> สร้าง account ใหม่
      if (!user) {
        const tempPassword = personalInfo.birthDate.replace(/-/g, ''); // YYYYMMDD
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          personalInfo.email,
          tempPassword
        );
        userId = userCredential.user.uid;

        // สร้าง user profile
        await setDoc(doc(db, 'users', userId), {
          role: 'student',
          email: personalInfo.email,
          profile: {
            prefixThai: personalInfo.prefixThai,
            prefixEng: personalInfo.prefixEng,
            nameThai: personalInfo.nameThai,
            nameEng: personalInfo.nameEng,
            surnameThai: personalInfo.surnameThai,
            surnameEng: personalInfo.surnameEng,
            birthDate: personalInfo.birthDate,
            weight: personalInfo.weight,
            height: personalInfo.height,
            studentId: personalInfo.studentId,
            citizenId: personalInfo.citizenId,
            passportNo: personalInfo.passportNo,
            phone: personalInfo.phone,
            parentPhone: personalInfo.parentPhone,
            email: personalInfo.email,
            lineId: personalInfo.lineId,
            diseases: personalInfo.diseases,
            allergies: personalInfo.allergies,
            gradeLevel: personalInfo.gradeLevel,
            studyPlan: personalInfo.studyPlan,
            gpa: personalInfo.gpa,
          },
          createdAt: serverTimestamp(),
        });
      } else {
        // อัปเดต profile ของ user ที่มีอยู่แล้ว
        await setDoc(doc(db, 'users', userId!), {
          profile: {
            prefixThai: personalInfo.prefixThai,
            prefixEng: personalInfo.prefixEng,
            nameThai: personalInfo.nameThai,
            nameEng: personalInfo.nameEng,
            surnameThai: personalInfo.surnameThai,
            surnameEng: personalInfo.surnameEng,
            birthDate: personalInfo.birthDate,
            weight: personalInfo.weight,
            height: personalInfo.height,
            studentId: personalInfo.studentId,
            citizenId: personalInfo.citizenId,
            passportNo: personalInfo.passportNo,
            phone: personalInfo.phone,
            parentPhone: personalInfo.parentPhone,
            email: personalInfo.email,
            lineId: personalInfo.lineId,
            diseases: personalInfo.diseases,
            allergies: personalInfo.allergies,
            gradeLevel: personalInfo.gradeLevel,
            studyPlan: personalInfo.studyPlan,
            gpa: personalInfo.gpa,
          },
        }, { merge: true });
      }

      // สร้างใบสมัคร
      await addDoc(collection(db, 'applications'), {
        projectId: projectId,
        userId: userId,
        personalData: personalInfo,
        consent: consentInfo,
        status: 'submitted',
        createdAt: serverTimestamp(),
      });

      alert('สมัครเข้าร่วมโครงการสำเร็จ!');
      router.push('/student/dashboard');
    } catch (error: any) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  // ============ Auth Selection View ============
  if (currentView === 'auth-select') {
    return (
      <div className="container mx-auto p-4 max-w-md min-h-screen flex items-center justify-center">
        <Card className="p-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">สมัครเข้าร่วมโครงการ</h1>
            <p className="text-slate-600">{project.title}</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleAuthSelection('login')}
              variant="outline"
              className="w-full h-16 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">มีบัญชีอยู่แล้ว</p>
                  <p className="text-xs text-slate-500">เข้าสู่ระบบเพื่อสมัคร</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => handleAuthSelection('register')}
              className="w-full h-16 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">สมัครครั้งแรก</p>
                  <p className="text-xs opacity-90">กรอกข้อมูลส่วนตัวเพื่อสมัคร</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ============ Personal Info Form View ============
  if (currentView === 'personal-form') {
    return (
      <div className="container mx-auto p-4 max-w-3xl pb-24">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => !user ? setCurrentView('auth-select') : router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> ย้อนกลับ
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">กรอกข้อมูลส่วนตัว</h1>
          <p className="text-slate-600 mb-6">{project.title}</p>

          <form onSubmit={handlePersonalFormSubmit} className="space-y-6">
            {/* คำนำหน้า */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>คำนำหน้า (ไทย) *</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={personalInfo.prefixThai}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, prefixThai: e.target.value })}
                  required
                >
                  <option value="">เลือก</option>
                  <option value="เด็กชาย">เด็กชาย</option>
                  <option value="เด็กหญิง">เด็กหญิง</option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div>
                <Label>คำนำหน้า (อังกฤษ) *</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={personalInfo.prefixEng}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, prefixEng: e.target.value })}
                  required
                >
                  <option value="">Select</option>
                  <option value="Master">Master</option>
                  <option value="Miss">Miss</option>
                  <option value="Mr.">Mr.</option>
                </select>
              </div>
            </div>

            {/* ชื่อ-นามสกุล (ไทย) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ชื่อ (ไทย) *</Label>
                <Input
                  value={personalInfo.nameThai}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nameThai: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>นามสกุล (ไทย) *</Label>
                <Input
                  value={personalInfo.surnameThai}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, surnameThai: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* ชื่อ-นามสกุล (อังกฤษ) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ชื่อ (อังกฤษ) *</Label>
                <Input
                  value={personalInfo.nameEng}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nameEng: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>นามสกุล (อังกฤษ) *</Label>
                <Input
                  value={personalInfo.surnameEng}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, surnameEng: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* วันเกิด น้ำหนัก ส่วนสูง */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>วันเดือนปีเกิด *</Label>
                <Input
                  type="date"
                  value={personalInfo.birthDate}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, birthDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>น้ำหนัก (kg) *</Label>
                <Input
                  type="number"
                  value={personalInfo.weight || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, weight: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>ส่วนสูง (cm) *</Label>
                <Input
                  type="number"
                  value={personalInfo.height || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, height: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* เอกสาร */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>รหัสนักเรียน *</Label>
                <Input
                  value={personalInfo.studentId}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, studentId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>เลขบัตรประชาชน *</Label>
                <Input
                  value={personalInfo.citizenId}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, citizenId: e.target.value })}
                  maxLength={13}
                  required
                />
              </div>
              <div>
                <Label>เลขที่หนังสือเดินทาง *</Label>
                <Input
                  value={personalInfo.passportNo}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, passportNo: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* ติดต่อ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>เบอร์โทรศัพท์ (นักเรียน) *</Label>
                <Input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>เบอร์โทรศัพท์ (ผู้ปกครอง) *</Label>
                <Input
                  type="tel"
                  value={personalInfo.parentPhone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, parentPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email (ที่ติดต่อได้) *</Label>
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>LINE ID *</Label>
                <Input
                  value={personalInfo.lineId}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lineId: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* สุขภาพ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>โรคประจำตัว</Label>
                <Textarea
                  value={personalInfo.diseases}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, diseases: e.target.value })}
                  placeholder="ระบุโรคประจำตัว (ถ้ามี)"
                />
              </div>
              <div>
                <Label>ข้อมูลการแพ้อาหาร</Label>
                <Textarea
                  value={personalInfo.allergies}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, allergies: e.target.value })}
                  placeholder="ระบุการแพ้อาหาร (ถ้ามี)"
                />
              </div>
            </div>

            {/* การเรียน */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>ระดับชั้นการเรียน *</Label>
                <Input
                  value={personalInfo.gradeLevel}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gradeLevel: e.target.value })}
                  placeholder="เช่น ม.4"
                  required
                />
              </div>
              <div>
                <Label>แผนการเรียน *</Label>
                <Input
                  value={personalInfo.studyPlan}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, studyPlan: e.target.value })}
                  placeholder="เช่น วิทย์-คณิต"
                  required
                />
              </div>
              <div>
                <Label>เกรดเฉลี่ย *</Label>
                <Input
                  type="number"
                  step="0.01"
                  max="4.00"
                  value={personalInfo.gpa || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, gpa: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12">
              ถัดไป <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ============ Consent Form View ============
  if (currentView === 'consent-form') {
    return (
      <div className="container mx-auto p-4 max-w-3xl pb-24">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setCurrentView('personal-form')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> ย้อนกลับ
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">ข้อตกลงและความยินยอม</h1>
          <p className="text-slate-600 mb-6">{project.title}</p>

          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* ข้อตกลง */}
            <div className="space-y-4 border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-lg">ข้อตกลง</h3>

              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consentInfo.agreeFlightCost}
                  onCheckedChange={(checked) =>
                    setConsentInfo({ ...consentInfo, agreeFlightCost: checked as boolean })
                  }
                  required
                />
                <label className="text-sm leading-relaxed">
                  ข้าพเจ้ารับทราบว่า จะต้องรับผิดชอบค่าตั๋วเครื่องบินไป-กลับ
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consentInfo.agreeNoRefund}
                  onCheckedChange={(checked) =>
                    setConsentInfo({ ...consentInfo, agreeNoRefund: checked as boolean })
                  }
                  required
                />
                <label className="text-sm leading-relaxed">
                  ข้าพเจ้ารับทราบว่า หากผ่านการคัดเลือกเข้าร่วมโครงการแล้ว และชำระเงินค่าตั๋วเครื่องบินเรียบร้อยแล้ว
                  จะไม่สามารถยกเลิกได้ในภายหลัง และจะไม่มีการคืนเงินในทุกกรณี
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  checked={consentInfo.agreeLimitedSeats}
                  onCheckedChange={(checked) =>
                    setConsentInfo({ ...consentInfo, agreeLimitedSeats: checked as boolean })
                  }
                  required
                />
                <label className="text-sm leading-relaxed">
                  ข้าพเจ้าทราบว่ามีจำนวนรับจำกัด 20 คน และจะพิจารณาตามการสอบ/สัมภาษณ์
                </label>
              </div>
            </div>

            {/* คำถามเพิ่มเติม */}
            <div className="space-y-4">
              <div>
                <Label>ทำไมถึงสนใจเข้าร่วมกิจกรรมนี้? *</Label>
                <Textarea
                  value={consentInfo.whyJoin}
                  onChange={(e) => setConsentInfo({ ...consentInfo, whyJoin: e.target.value })}
                  placeholder="กรุณาระบุเหตุผล..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>ช่องทางที่รู้จักกิจกรรมนี้? *</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={consentInfo.howKnow}
                  onChange={(e) => setConsentInfo({ ...consentInfo, howKnow: e.target.value })}
                  required
                >
                  <option value="">เลือก</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Line">Line</option>
                  <option value="เพื่อน">เพื่อนแนะนำ</option>
                  <option value="โรงเรียน">โรงเรียน</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังส่งข้อมูล...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  ยืนยันการสมัคร
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return null;
}
