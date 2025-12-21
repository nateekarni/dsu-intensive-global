"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  CheckCircle, 
  User, 
  LogIn,
  ArrowRight,
  MapPin,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { PersonalInfoForm, ConsentForm } from "@/types";

interface ProjectDoc {
  id: string;
  title: string;
  coverImage?: string;
  displayLocation?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  closeDate?: Timestamp;
  capacity?: number;
  description?: string;
  locations?: string[];
  qualifications?: string[];
  documents?: { name: string }[];
  costs?: {
    amount?: number;
    included?: string[];
    excluded?: string[];
  };
  agenda?: { day: number; title: string; description?: string }[];
  formConfig?: {
    gradeScope?: "all" | "lower" | "upper";
    gradeLevelOptions?: string[];
    classroomOptions?: string[];
    studyPlanOptions?: string[];
  };
}

const prefixThaiToEng: Record<string, string> = {
  "เด็กชาย": "Master",
  "เด็กหญิง": "Miss",
  "นาย": "Mr.",
  "นางสาว": "Miss",
};

export default function ApplyPage() {
  const totalSteps = 3;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  
  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Flow Control
  const [currentView, setCurrentView] = useState<'auth-select' | 'personal-form' | 'consent-form' | 'upload-docs'>('auth-select');
  
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

  const formatThaiDate = (timestamp?: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Load Project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (typeof id !== "string") {
          throw new Error("ไม่พบรหัสโครงการที่ถูกต้อง");
        }

        const docRef = doc(db, "projects", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as ProjectDoc;
          setProject({ ...data, id: snapshot.id });
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
  }, [id, router]);

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
      if (typeof id === "string") {
        router.push(`/auth/login?redirect=/student/apply/${id}`);
      } else {
        router.push("/auth/login");
      }
    } else {
      // ไปหน้ากรอกข้อมูลเลย
      setCurrentView('personal-form');
    }
  };

  // Handle Personal Form Submit
  const handlePersonalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields (manual because shadcn Select doesn't use native required)
    if (!personalInfo.prefixThai || !personalInfo.nameThai || !personalInfo.surnameThai) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (!personalInfo.prefixEng || !personalInfo.nameEng || !personalInfo.surnameEng) {
      alert('กรุณากรอกชื่อภาษาอังกฤษให้ครบถ้วน');
      return;
    }
    if (!personalInfo.birthDate) {
      alert('กรุณาเลือกวันเดือนปีเกิด');
      return;
    }
    if (!personalInfo.gradeLevel || !personalInfo.classroom || !personalInfo.studyPlan) {
      alert('กรุณากรอกข้อมูลการศึกษาให้ครบถ้วน');
      return;
    }
    
    // Move to consent form
    setCurrentView('consent-form');
    // Move to upload documents view
    setCurrentView('upload-docs');
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
    // Move to upload documents view
    setCurrentView('upload-docs');

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
            classroom: personalInfo.classroom,
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
            classroom: personalInfo.classroom,
            studyPlan: personalInfo.studyPlan,
            gpa: personalInfo.gpa,
          },
        }, { merge: true });
      }

      // สร้างใบสมัคร
      await addDoc(collection(db, 'applications'), {
        projectId: id,
        userId: userId,
        personalData: personalInfo,
        consent: consentInfo,
        status: 'submitted',
        createdAt: serverTimestamp(),
      });

      alert('สมัครเข้าร่วมโครงการสำเร็จ!');
      router.push('/student/dashboard');
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';
      alert('เกิดข้อผิดพลาด: ' + message);
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

  // Auth Selection View
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
              <div className="flex items-center gap-1">
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
              <div className="flex items-center gap-1">
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

  // Personal Info Form View
  if (currentView === 'personal-form') {
    const gradeOptions = project.formConfig?.gradeLevelOptions || [];
    const classroomOptions = project.formConfig?.classroomOptions || [];
    const studyPlanOptions = project.formConfig?.studyPlanOptions || [];

    const totalSteps = 2;
    const currentStep = 1;

    return (
      <div className="container mx-auto p-4 max-w-3xl pb-24">
        <div className="relative flex items-center justify-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            สมัครเข้าร่วมโครงการ
          </h1>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-700">
              ขั้นตอนที่ {currentStep} จาก {totalSteps}
            </span>
            <span className="text-xs text-slate-500">
              ข้อมูลส่วนตัว
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <form onSubmit={handlePersonalFormSubmit} className="space-y-4">
          {/* Card 1: ข้อมูลโครงการ */}
          <Card className="p-0 overflow-hidden">
            {project.coverImage && (
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <p className="text-lg font-bold text-slate-900">{project.title}</p>
              {(
                project.displayLocation || project.locations?.[0]
              ) && (
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.displayLocation || project.locations?.[0]}</span>
                </div>
              )}
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {formatThaiDate(project.startDate)}
                    {project.endDate ? ` - ${formatThaiDate(project.endDate)}` : ''}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Section: ข้อมูลส่วนตัว */}
          <div className="p-2 space-y-3">
            <div className="space-y-2">
              <h2 className="font-semibold text-slate-800">ข้อมูลส่วนตัว</h2>
              <p className="text-xs text-slate-500">ข้อมูลนักเรียนสำหรับจัดเตรียมความพร้อมโครงการ</p>
            </div>

            {/* คำนำหน้า */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>คำนำหน้า (ไทย)</Label>
                <Select
                  value={personalInfo.prefixThai}
                  onValueChange={(value) =>
                    setPersonalInfo({
                      ...personalInfo,
                      prefixThai: value,
                      prefixEng: prefixThaiToEng[value] || personalInfo.prefixEng,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue placeholder="เลือก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="เด็กชาย">เด็กชาย</SelectItem>
                    <SelectItem value="เด็กหญิง">เด็กหญิง</SelectItem>
                    <SelectItem value="นาย">นาย</SelectItem>
                    <SelectItem value="นางสาว">นางสาว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ชื่อ-นามสกุล (ไทย) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>ชื่อ (ไทย)</Label>
                <Input
                  value={personalInfo.nameThai}
                  onChange={(e) => setPersonalInfo({...personalInfo, nameThai: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>นามสกุล (ไทย)</Label>
                <Input
                  value={personalInfo.surnameThai}
                  onChange={(e) => setPersonalInfo({...personalInfo, surnameThai: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* ชื่อ-นามสกุล (อังกฤษ) + คำนำหน้า */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>คำนำหน้า (อังกฤษ)</Label>
                <Select
                  value={personalInfo.prefixEng}
                  onValueChange={(value) =>
                    setPersonalInfo({
                      ...personalInfo,
                      prefixEng: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ชื่อ (อังกฤษ)</Label>
                <Input
                  value={personalInfo.nameEng}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nameEng: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>นามสกุล (อังกฤษ)</Label>
                <Input
                  value={personalInfo.surnameEng}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, surnameEng: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* วันเกิด น้ำหนัก ส่วนสูง */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>วันเดือนปีเกิด</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !personalInfo.birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {personalInfo.birthDate
                        ? format(new Date(personalInfo.birthDate), "PPP", { locale: th })
                        : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                      selected={personalInfo.birthDate ? new Date(personalInfo.birthDate) : undefined}
                      onSelect={(date) =>
                        setPersonalInfo({
                          ...personalInfo,
                          birthDate: date ? format(date, "yyyy-MM-dd") : "",
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>น้ำหนัก (kg)</Label>
                <Input
                  type="number"
                  value={personalInfo.weight || ''}
                  onChange={(e) => setPersonalInfo({...personalInfo, weight: Number(e.target.value)})}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>ส่วนสูง (cm)</Label>
                <Input
                  type="number"
                  value={personalInfo.height || ''}
                  onChange={(e) => setPersonalInfo({...personalInfo, height: Number(e.target.value)})}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* เอกสาร */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>รหัสนักเรียน</Label>
                <Input
                  value={personalInfo.studentId}
                  onChange={(e) => setPersonalInfo({...personalInfo, studentId: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>เลขบัตรประชาชน</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={personalInfo.citizenId}
                  onChange={(e) => setPersonalInfo({...personalInfo, citizenId: e.target.value})}
                  maxLength={13}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>เลขที่หนังสือเดินทาง</Label>
                <Input
                  value={personalInfo.passportNo}
                  onChange={(e) => setPersonalInfo({...personalInfo, passportNo: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* ติดต่อ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>เบอร์โทรศัพท์ (นักเรียน)</Label>
                <Input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>เบอร์โทรศัพท์ (ผู้ปกครอง)</Label>
                <Input
                  type="tel"
                  value={personalInfo.parentPhone}
                  onChange={(e) => setPersonalInfo({...personalInfo, parentPhone: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Email (ที่ติดต่อได้)</Label>
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label>LINE ID</Label>
                <Input
                  value={personalInfo.lineId}
                  onChange={(e) => setPersonalInfo({...personalInfo, lineId: e.target.value})}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            {/* สุขภาพ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>โรคประจำตัว (ถ้ามี)</Label>
                <Textarea
                  value={personalInfo.diseases}
                  onChange={(e) => setPersonalInfo({...personalInfo, diseases: e.target.value})}
                  placeholder="ระบุโรคประจำตัว"
                  className="bg-white text-sm placeholder:text-sm"
                />
              </div>
              <div>
                <Label>ข้อมูลการแพ้อาหาร (ถ้ามี)</Label>
                <Textarea
                  value={personalInfo.allergies}
                  onChange={(e) => setPersonalInfo({...personalInfo, allergies: e.target.value})}
                  placeholder="ระบุการแพ้อาหาร"
                  className="bg-white text-sm placeholder:text-sm"
                />
              </div>
            </div>

          </div>

          <div className="my-4 h-px bg-slate-200" />

          {/* Section: ข้อมูลการศึกษา */}
          <div className="p-2 space-y-2">
            <div className="space-y-2">
              <h2 className="font-semibold text-slate-800">ข้อมูลการศึกษา</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ระดับชั้นการเรียน</Label>
                <Select
                  value={personalInfo.gradeLevel}
                  onValueChange={(value) =>
                    setPersonalInfo({
                      ...personalInfo,
                      gradeLevel: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue placeholder="เลือกระดับชั้น" />
                  </SelectTrigger>
                  <SelectContent>
                    {(gradeOptions.length > 0
                      ? gradeOptions
                      : ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"]
                    ).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ห้องเรียน</Label>
                <Select
                  value={personalInfo.classroom}
                  onValueChange={(value) =>
                    setPersonalInfo({
                      ...personalInfo,
                      classroom: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue placeholder="เลือกห้องเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classroomOptions.length > 0
                      ? classroomOptions
                      : ["1", "2", "3", "4", "5", "6"]
                    ).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>แผนการเรียน</Label>
                <Select
                  value={personalInfo.studyPlan}
                  onValueChange={(value) =>
                    setPersonalInfo({
                      ...personalInfo,
                      studyPlan: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-10 bg-white">
                    <SelectValue placeholder="เลือกแผนการเรียน" />
                  </SelectTrigger>
                  <SelectContent>
                    {(studyPlanOptions.length > 0
                      ? studyPlanOptions
                      : ["วิทย์-คณิต", "ศิลป์-ภาษา", "ศิลป์-ทั่วไป"]
                    ).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>เกรดเฉลี่ย</Label>
                <Input
                  type="number"
                  step="0.01"
                  max="4.00"
                  value={personalInfo.gpa || ''}
                  onChange={(e) => setPersonalInfo({
                    ...personalInfo,
                    gpa: Number(e.target.value),
                  })}
                  required
                  className="mt-1 h-10 bg-white"
                />
              </div>
            </div>

          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
            <div className="container mx-auto max-w-3xl flex gap-4 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => (!user ? setCurrentView('auth-select') : router.back())}
                className="flex-1 h-10"
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="flex-1 h-10 bg-primary shadow-lg hover:shadow-xl">
                ถัดไป <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Consent Form View
  if (currentView === 'consent-form') {
    const currentStep = 2;
    return (
      <div className="container mx-auto p-4 max-w-3xl pb-24">
        <div className="relative flex items-center justify-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            สมัครเข้าร่วมโครงการ
          </h1>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-700">
              ขั้นตอนที่ {currentStep} จาก {totalSteps}
            </span>
            <span className="text-xs text-slate-500">
              การยินยอม
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        {/* Project Card (same as personal info step) */}
        <Card className="p-0 overflow-hidden mb-4">
          {project.coverImage && (
            <div className="h-40 w-full overflow-hidden">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <p className="text-lg font-bold text-slate-900">{project.title}</p>
            {(project.displayLocation || project.locations?.[0]) && (
              <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{project.displayLocation || project.locations?.[0]}</span>
              </div>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {formatThaiDate(project.startDate)}
                  {project.endDate ? ` - ${formatThaiDate(project.endDate)}` : ''}
                </span>
              </div>
            )}
          </div>
        </Card>
        <form onSubmit={handleFinalSubmit} className="space-y-6 pb-24">
          {/* Consent Items: separate rows, no blue bg/border */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consentInfo.agreeFlightCost}
                onCheckedChange={(checked) => setConsentInfo({...consentInfo, agreeFlightCost: checked as boolean})}
                required
              />
              <label className="text-sm leading-relaxed">
                ข้าพเจ้ารับทราบว่า จะต้องรับผิดชอบค่าตั๋วเครื่องบินไป-กลับ
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consentInfo.agreeNoRefund}
                onCheckedChange={(checked) => setConsentInfo({...consentInfo, agreeNoRefund: checked as boolean})}
                required
              />
              <label className="text-sm leading-relaxed">
                ข้าพเจ้ารับทราบว่า หากผ่านการคัดเลือกแล้ว จะไม่มีการคืนเงินในทุกกรณี
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consentInfo.agreeLimitedSeats}
                onCheckedChange={(checked) => setConsentInfo({...consentInfo, agreeLimitedSeats: checked as boolean})}
                required
              />
              <label className="text-sm leading-relaxed">
                ข้าพเจ้าทราบว่ามีจำนวนรับจำกัด 20 คน และจะพิจารณาตามการสอบ/สัมภาษณ์
              </label>
            </div>
          </div>
          {/* Reason & Channel */}
          <div className="space-y-4">
            <div>
              <Label>ทำไมถึงสนใจเข้าร่วมกิจกรรมนี้?</Label>
              <Textarea
                value={consentInfo.whyJoin}
                onChange={(e) => setConsentInfo({...consentInfo, whyJoin: e.target.value})}
                placeholder="กรุณาระบุเหตุผล..."
                rows={4}
                required
                className="bg-white"
              />
            </div>
            <div>
              <Label>ช่องทางที่รู้จักกิจกรรมนี้?</Label>
              <Select
                value={consentInfo.howKnow}
                onValueChange={(value) =>
                  setConsentInfo({
                    ...consentInfo,
                    howKnow: value,
                  })
                }
              >
                <SelectTrigger className="mt-1 h-10 bg-white">
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Line">Line</SelectItem>
                  <SelectItem value="เพื่อน">เพื่อนแนะนำ</SelectItem>
                  <SelectItem value="โรงเรียน">โรงเรียน</SelectItem>
                  <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
            <div className="container mx-auto max-w-3xl flex gap-4 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentView('personal-form')}
                className="flex-1 h-10"
              >
                ย้อนกลับ
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 bg-primary shadow-lg hover:shadow-xl"
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

}