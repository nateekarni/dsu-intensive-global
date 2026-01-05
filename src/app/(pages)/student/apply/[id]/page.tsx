"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { auth, storage, db } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  Loader2,
  CheckCircle,
  User,
  LogIn,
  ArrowRight,
  ChevronLeft,
  MapPin,
  Calendar as CalendarIcon,
  Upload,
  FileText,
  IdCard,
  Phone,
  HeartPulse,
  GraduationCap,
  Mail,
  CheckCircle2,
  XCircle,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { PersonalInfoForm, ConsentForm } from "@/types";

interface ProjectDoc {
  id: string;
  title: string;
  coverImage?: string;
  displayLocation?: string;
  startDate?: string;
  endDate?: string;
  closeDate?: string;
  capacity?: number;
  description?: string;
  locations?: string[];
  qualifications?: string[];
  documents?: { id: string; name: string }[];
  costs?: {
    amount?: number;
    included?: string[];
    excluded?: string[];
  };
  agenda?: { day: number; title: string; description?: string }[];
  formConfig?: {
    gradeScope?: "all" | "lower" | "upper" | "gifted";
    allowedClassrooms?: string[];
  };
}

const prefixThaiToEng: Record<string, string> = {
  "เด็กชาย": "Master",
  "เด็กหญิง": "Miss",
  "นาย": "Mr.",
  "นางสาว": "Miss",
};

const gradeOptions = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
// Study Plan removed

// Helper
const formatThaiDate = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const StepIndicator = ({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) => {
  const steps = [
    { num: 1, label: "ข้อมูลผู้สมัคร", view: "personal-form" },
    { num: 2, label: "คำยินยอม", view: "consent-form" },
    { num: 3, label: "เอกสาร", view: "upload-docs" }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[600px] mx-auto bg-white/95 backdrop-blur-sm border-b shadow-sm px-4 pt-4 pb-4">
        <div className="flex justify-between items-start relative px-4">
          {/* Connecting Line Container - positioned relative to the numbers */}
          <div className="absolute top-4 left-0 w-full px-8 flex items-center justify-between pointer-events-none z-0">
            {/* We can use a single line background and color it dynamically or clear segments */}
            {/* Simplified approach: A gray line running through, and colored segments based on step */}
          </div>

          {steps.map((step, index) => {
            const isActive = step.num <= currentStep;
            const isCompleted = step.num < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.num} className="flex-1 flex flex-col items-center relative group">
                {/* Connecting Lines */}
                {index !== 0 && (
                  <div className={cn(
                    "absolute top-4 -left-[50%] right-[50%] h-[2px] -z-10",
                    isActive ? "bg-primary" : "bg-slate-200"
                  )} />
                )}

                {/* Step Button */}
                <button
                  onClick={() => onStepClick(step.num)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10",
                    isActive
                      ? "bg-primary border-primary text-white shadow-md scale-110"
                      : "bg-white border-slate-300 text-slate-400 group-hover:border-primary/50"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                </button>

                {/* Label */}
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium mt-1 transition-colors text-center w-16 sm:w-20 leading-tight",
                  isActive ? "text-primary" : "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

  );
};

const ProjectSummaryCard = ({ project }: { project: any }) => {
  if (!project) return null;
  return (
    <Card className="mb-8 overflow-hidden flex flex-col sm:flex-row bg-white shadow-sm border-slate-100">
      <div className="w-full sm:w-48 h-32 sm:h-auto relative shrink-0 bg-slate-100">
        {project.coverImage ? (
          <img src={project.coverImage} className="w-full h-full object-cover" alt={project.title} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400"><FileText className="w-8 h-8" /></div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-center">
        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description || "No description available"}</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            {formatThaiDate(project.startDate)} - {formatThaiDate(project.endDate)}
          </div>
          {project.locations && project.locations.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {project.locations.join(", ")}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Fixed Bottom Bar Component (Enhanced)
const FixedBottomBar = ({
  onBack,
  onNext,
  nextLabel = "ดำเนินการต่อ",
  backLabel = "ย้อนกลับ",
  backVariant = "outline",
  disableNext = false,
  loading = false,
  hideBack = false,
  customNextIcon
}: {
  onBack?: () => void,
  onNext?: () => void,
  nextLabel?: string,
  backLabel?: string,
  backVariant?: "outline" | "ghost",
  disableNext?: boolean,
  loading?: boolean,
  hideBack?: boolean,
  customNextIcon?: React.ReactNode
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[600px] mx-auto bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-4">
        {!hideBack && (
          <Button
            type="button"
            variant={backVariant}
            onClick={onBack}
            className={cn(
              "w-1/3 rounded-md h-11",
              backVariant === 'outline' ? "border-slate-300 text-slate-600 hover:bg-slate-50" : "text-slate-500 hover:text-slate-900 hover:bg-transparent"
            )}
          >
            {backLabel}
          </Button>
        )}
        <Button
          type={onNext ? "button" : "submit"}
          onClick={onNext}
          disabled={disableNext || loading}
          className="flex-1 rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/40 text-base h-11 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : customNextIcon}
          {(!loading && !customNextIcon) && <ArrowRight className="w-5 h-5 ml-2" />}
          {(!loading) && <span className={customNextIcon ? "ml-2" : ""}>{nextLabel}</span>}
        </Button>
      </div>
    </div>
  );
};

export default function ApplyPage() {
  const totalSteps = 3;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingAppId, setExistingAppId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Flow Control: 'project-detail' is now the first page
  const [currentView, setCurrentView] = useState<'project-detail' | 'personal-form' | 'consent-form' | 'upload-docs'>('project-detail');

  // Form Data with Test Defaults
  // Form Data with Test Defaults - CLEARED
  const initialPersonalInfo: PersonalInfoForm = {
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
  };

  // Form Data with Test Defaults
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>(initialPersonalInfo);

  const [consentInfo, setConsentInfo] = useState<ConsentForm>({
    agreeFlightCost: false,
    agreeNoRefund: false,
    agreeLimitedSeats: false,
    whyJoin: '',
    howKnow: '',
  });

  const [consentError, setConsentError] = useState(false);
  const [docConfirmModalOpen, setDocConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { url: string; path: string; status: string; name: string }>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({});  // Derived Options
  const [availableClassrooms, setAvailableClassrooms] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);

  // Fetch Project Data
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "projects", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as ProjectDoc);
        } else {
          console.error("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Handle AutoStart
  useEffect(() => {
    if (searchParams.get("autoStart") === "true") {
      setCurrentView("personal-form");
    }
  }, [searchParams]);

  // 1. Determine Available Grades from Config
  useEffect(() => {
    if (project) {
      const allowed = project.formConfig?.allowedClassrooms || [];
      if (allowed.length > 0) {
        // Extract unique grades (e.g., "ม.1" from "ม.1/1")
        const grades = Array.from(new Set(allowed.map(c => c.split('/')[0])));
        // Sort grades (simple sort works for Thai strings usually, or custom logic)
        // Custom sort to ensure M.1 < M.2 ...
        const gradeOrder = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6", "ปวช.1", "ปวช.2", "ปวช.3"];
        grades.sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));
        setAvailableGrades(grades);
      } else {
        // Fallback (e.g. all grades)
        setAvailableGrades(gradeOptions);
      }
    }
  }, [project]);

  // 2. Determine Available Classrooms based on selected Grade
  useEffect(() => {
    if (project && personalInfo.gradeLevel) {
      const allowed = project.formConfig?.allowedClassrooms || [];
      if (allowed.length > 0) {
        const filtered = allowed
          .filter(c => c.startsWith(personalInfo.gradeLevel + '/'))
          .map(c => c.split('/')[1]); // get room number
        setAvailableClassrooms(filtered.sort((a, b) => parseInt(a) - parseInt(b)));
      } else {
        // Fallback
        setAvailableClassrooms(Array.from({ length: 15 }, (_, i) => String(i + 1)));
      }
    } else {
      setAvailableClassrooms([]);
    }
  }, [project, personalInfo.gradeLevel]);

  // Auto Prefix Thai -> Eng
  useEffect(() => {
    if (personalInfo.prefixThai && prefixThaiToEng[personalInfo.prefixThai]) {
      setPersonalInfo(prev => ({ ...prev, prefixEng: prefixThaiToEng[prev.prefixThai] }));
    }
  }, [personalInfo.prefixThai]);

  // Handle Start Application Click
  const handleStartApplication = () => {
    if (user) {
      // If logged in, check existing app logic will kick in or move to form
      checkExistingApp();
    } else {
      setShowAuthModal(true);
    }
  };

  const checkExistingApp = async () => {
    if (!user) {
      // Should not happen if called correctly, but safety check
      return;
    }

    // Check existing app logic (moved from useEffect to function to be called on demand)
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/student/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const apps = await res.json();
        const foundApp = apps.find((app: any) => app.projectId === id);

        if (foundApp) {
          setExistingAppId(foundApp.id);
          if (foundApp.status !== 'draft') {
            router.push(`/student/applications/${foundApp.id}`);
            return;
          }
          if (foundApp.personalData) setPersonalInfo(prev => ({ ...prev, ...foundApp.personalData }));
          if (foundApp.uploadedDocuments) setUploadedDocs(foundApp.uploadedDocuments);

          if (foundApp.currentStep === 3) setCurrentView('upload-docs');
          else if (foundApp.currentStep === 2) setCurrentView('consent-form');
          else setCurrentView('personal-form');
        } else {
          // No existing app, prefill profile if exists
          if (user.profile) {
            setPersonalInfo(prev => ({ ...prev, ...user.profile }));
          }
          setCurrentView('personal-form');
        }
      }
    } catch (err) {
      console.error("Error checking existing app:", err);
    }
  };


  // Handle Personal Form Submit
  const handlePersonalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!personalInfo.prefixThai || !personalInfo.nameThai || !personalInfo.surnameThai) {
      setAlertMessage('กรุณากรอกข้อมูลให้ครบถ้วน'); setAlertOpen(true); return;
    }
    if (!personalInfo.gradeLevel || !personalInfo.classroom) {
      setAlertMessage('กรุณาเลือกระดับชั้นและห้องเรียน'); setAlertOpen(true); return;
    }

    setSubmitting(true);
    try {
      let currentUser = user;
      let token = "";

      // 1. Register & Login if needed
      if (!currentUser) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personalInfo)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Registration failed');
        }
        const { customToken } = await res.json();
        const userCredential = await signInWithCustomToken(auth, customToken);
        currentUser = userCredential.user as any;
        // Wait a bit for auth state to propagate if needed, but we have the user obj now
        token = await userCredential.user.getIdToken();
      } else {
        const token = await auth.currentUser?.getIdToken();
      }

      if (!token) throw new Error("No access token");

      // 2. Submit Draft
      const res = await fetch('/api/student/applications/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: id,
          personalData: personalInfo,
          status: 'draft',
          currentStep: 2
        })
      });

      if (!res.ok) throw new Error("Failed to save application");
      const { appId } = await res.json();
      setExistingAppId(appId);
      setCurrentView('consent-form');

    } catch (error: any) {
      console.error(error);
      setAlertMessage('เกิดข้อผิดพลาด: ' + error.message);
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/student/applications/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: existingAppId,
          projectId: id,
          consent: consentInfo,
          status: 'draft',
          currentStep: 3
        })
      });
      if (!res.ok) throw new Error("Failed to save consent");
      setCurrentView('upload-docs');
    } catch (error: any) {
      setAlertMessage('เกิดข้อผิดพลาด: ' + error.message);
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    // If we have an existing app ID, upload immediately (Resume flow or Mobile flow)
    if (existingAppId) {
      setUploadingDocId(docId);
      try {
        const storageRef = ref(storage, `applications/${existingAppId}/${docId}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const newDocData = {
          url,
          path: storageRef.fullPath,
          name: file.name,
          status: 'pending',
          uploadedAt: new Date().toISOString()
        };
        const updatedDocs = { ...uploadedDocs, [docId]: newDocData };
        setUploadedDocs(updatedDocs);

        const token = await auth.currentUser?.getIdToken();
        await fetch('/api/student/applications/submit', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appId: existingAppId,
            projectId: id,
            uploadedDocuments: updatedDocs
          })
        });
      } catch (error) {
        setAlertMessage("อัปโหลดไฟล์ไม่สำเร็จ");
        setAlertOpen(true);
      } finally {
        setUploadingDocId(null);
      }
    } else {
      // Lazy flow: Store file in memory to upload later
      setFilesToUpload(prev => ({ ...prev, [docId]: file }));
      // Create a fake "uploaded" state for UI preview
      const fakeUrl = URL.createObjectURL(file);
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: {
          url: fakeUrl,
          path: '',
          status: 'pending',
          name: file.name
        }
      }));
    }
  };

  const handleFullSubmit = async () => {
    // 1. Validate All
    if (!personalInfo.prefixThai || !personalInfo.nameThai || !personalInfo.surnameThai) {
      setAlertMessage('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน');
      setAlertOpen(true);
      return;
    }

    // Check missing docs using shared logic
    const requiredDocs = project?.documents || [];
    const uploadedCount = Object.keys(uploadedDocs).length;
    const isMissing = uploadedCount < requiredDocs.length;

    if (isMissing) {
      setDocConfirmModalOpen(true);
    } else {
      if (!confirm('ยืนยันการสมัครเข้าร่วมโครงการ?')) return;
      await submitApplication();
    }
  };


  const submitApplication = async () => {
    setSubmitting(true);
    try {
      let currentUser = user;

      // 1. Register & Login if needed (though usually logged in by this step)
      if (!currentUser) {
        // Should have been handled earlier
        setAlertMessage("Please login first");
        setAlertOpen(true);
        setSubmitting(false);
        return;
      }

      // 2. Create Application
      const requiredDocsCount = project?.documents?.length || 0;
      const uploadedCount = Object.keys(uploadedDocs).length;
      const initialStatus = uploadedCount < requiredDocsCount ? 'incomplete' : 'pending';

      const appData = {
        projectId: project?.id,
        projectTitle: project?.title,
        userId: currentUser.uid,
        status: initialStatus,
        personalData: personalInfo,
        consent: consentInfo,
        uploadedDocuments: uploadedDocs,
        submittedAt: new Date(),
        paymentStatus: 'pending',
        answers: {
          reason: consentInfo.whyJoin,
          channel: consentInfo.howKnow
        }
      };

      await addDoc(collection(db, "applications"), appData);

      setSuccessModalOpen(true);

    } catch (error: any) {
      console.error(error);
      setAlertMessage(`การสมัครล้มเหลว: ${error.message}`);
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalApplicationSubmit = async () => {
    // Check missing docs
    const requiredDocs = project?.documents || [];
    const uploadedCount = Object.keys(uploadedDocs).length;
    const isMissing = uploadedCount < requiredDocs.length;

    if (isMissing) {
      setDocConfirmModalOpen(true);
    } else {
      await submitApplication();
    }
  };

  const handleFinishAndRedirect = () => {
    if (existingAppId) {
      router.push(`/student/applications/${existingAppId}`);
    } else {
      router.push('/student/feed');
    }
  };

  if (loading || authLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" />กำลังโหลด...</div>;
  if (!project) return null;

  if (currentView === 'project-detail') {
    return (
      <>
        <div className="container mx-auto p-4 max-w-4xl pb-24">
          {/* Navigation Header */}
          <div className="flex items-center justify-center relative mb-4 h-12">
            <Link href="/student/feed">
              <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2">
                <ChevronLeft className="w-6 h-6 text-slate-500" />
              </Button>
            </Link>
            <span className="text-lg font-bold text-slate-900">รายละเอียดโครงการ</span>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-lg mb-8 bg-white">
            <div className="h-64 md:h-80 bg-slate-200 relative">
              {project.coverImage ? (
                <img src={project.coverImage} className="w-full h-full object-cover" alt={project.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="w-full">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{project.title}</h1>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm md:text-base">
                      {formatThaiDate(project.startDate)} - {formatThaiDate(project.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Closed Hero Section */}

          {/* Main Content */}
          <div className="space-y-6 mb-6">
            {/* Description */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">รายละเอียดโครงการ</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {project.description || "ไม่มีรายละเอียด"}
              </p>
            </Card>

            {/* Locations */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                สถานที่ในโปรแกรม
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.locations?.map((loc: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-slate-600 px-3 py-1">
                    <MapPin className="w-3 h-3 mr-1" /> {loc}
                  </Badge>
                ))}
                {!project.locations?.length && "-"}
              </div>
            </Card>

            {/* Qualifications & Documents */}
            {((project.qualifications?.length || 0) > 0 || (project.documents?.length || 0) > 0) && (
              <Card className="p-6">
                {/* Qualifications */}
                {project.qualifications && project.qualifications.length > 0 && (
                  <>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      คุณสมบัติผู้สมัคร
                    </h3>
                    <ul className="space-y-2">
                      {project.qualifications.map((qual: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Divider */}
                {(project.qualifications?.length || 0) > 0 && (project.documents?.length || 0) > 0 && (
                  <div className="my-6 border-b border-dashed border-slate-200" />
                )}

                {/* Documents */}
                {project.documents && project.documents.length > 0 && (
                  <>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      เอกสารที่ต้องใช้
                    </h3>
                    <ul className="space-y-2">
                      {project.documents.map((doc: any, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                          <span>{doc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            )}

            {/* Costs */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2 border-l-4 border-blue-500 pl-3">รายละเอียดค่าใช้จ่าย</h3>
              {typeof project.costs?.amount === "number" && (
                <p className="text-xl font-semibold text-primary mb-4">
                  ค่าเข้าร่วมโครงการ: ฿{project.costs.amount.toLocaleString()}
                </p>
              )}

              {/* Included */}
              {project.costs?.included && project.costs.included.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-green-700 mb-2">
                    รวมในค่าใช้จ่าย
                  </p>
                  <ul className="space-y-2">
                    {project.costs.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Excluded */}
              {project.costs?.excluded && project.costs.excluded.length > 0 && (
                <div>
                  <p className="font-semibold text-red-700 mb-2">
                    ไม่รวมในค่าใช้จ่าย
                  </p>
                  <ul className="space-y-2">
                    {project.costs.excluded.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Agenda/Schedule */}
            {project.agenda && project.agenda.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  กำหนดการ (Agenda)
                </h3>
                <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {project.agenda?.map((day: any, index: number) => (
                    <div key={index} className="relative pl-16">
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-0 w-10 h-10 bg-white border-4 border-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                        {day.day}
                      </div>

                      {/* Content Card */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/60 hover:border-blue-200 transition-colors">
                        <h4 className="font-bold text-slate-800 text-base mb-1">
                          {day.title}
                        </h4>
                        {day.description && (
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {day.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        </div>
        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10 w-full">
          <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">ค่าเข้าร่วมโครงการ</p>
              <p className="text-2xl font-bold text-primary">
                {typeof project.costs?.amount === "number"
                  ? `฿${project.costs.amount.toLocaleString()}`
                  : "-"}
              </p>
              <p className="text-xs text-slate-400">
                ปิดรับสมัคร: {formatThaiDate(project.closeDate)}
              </p>
            </div>
            <Button
              onClick={handleStartApplication}
              className="px-6 h-10 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              สมัคร
            </Button>
          </div>
        </div>
        {/* Auth Modal */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="w-[90%] sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">ลงทะเบียนสมัครโครงการ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-center text-slate-500 text-sm">
                กรุณาเลือกวิธีการเข้าสู่ระบบเพื่อดำเนินการต่อ
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push(`/auth/login?redirect=/student/apply/${id}`)}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  เข้าสู่ระบบ (มีบัญชีแล้ว)
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">หรือ</span></div>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-11 text-base border-slate-300 hover:bg-slate-50"
                  onClick={() => {
                    setShowAuthModal(false);
                    setPersonalInfo(initialPersonalInfo);
                    setCurrentView('personal-form');
                  }}
                >
                  <User className="mr-2 h-5 w-5" />
                  สมัครใหม่ (ยังไม่มีบัญชี)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }



  const handleStepClick = (step: number) => {
    if (step === 1) setCurrentView('personal-form');
    if (step === 2) setCurrentView('consent-form');
    if (step === 3) setCurrentView('upload-docs');
  };



  return (
    <div className="min-h-screen bg-slate-50 relative pb-20 md:pb-0">

      {/* ================= DESKTOP HEADER ================= */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-primary border-b border-blue-700 h-16 shadow-sm">
        <div className="w-full h-full md:container md:mx-auto md:max-w-7xl md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/student/feed')} className="text-white hover:bg-white/10 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-xs text-blue-100">สมัครเข้าร่วมโครงการ</span>
              <h1 className="font-bold text-white leading-tight">{project.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => router.push('/student/feed')}>ยกเลิก</Button>
            <Button onClick={handleFullSubmit} disabled={submitting} className="bg-white text-primary hover:bg-blue-50 font-semibold min-w-[140px]">
              {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              ยืนยันการสมัคร
            </Button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE STEP INDICATOR ================= */}
      <div className="md:hidden">
        <StepIndicator currentStep={currentView === 'personal-form' ? 1 : currentView === 'consent-form' ? 2 : 3} onStepClick={handleStepClick} />
        {/* Mobile Spacer for Fixed Header */}
        <div className="h-28"></div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="md:container md:mx-auto md:max-w-7xl md:pt-24 md:px-6 md:grid md:grid-cols-12 md:gap-8">

        {/* ================= LEFT COLUMN: PERSONAL INFO ================= */}
        <div className={cn("md:col-span-8", currentView !== 'personal-form' && 'hidden md:block')}>
          <div className="md:hidden flex flex-col items-center mb-6 px-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">กรอกข้อมูลผู้สมัคร</h1>
            <p className="text-slate-500 text-sm mt-1">กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
          </div>

          {/* Personal Form Content */}
          <form onSubmit={handlePersonalFormSubmit} className="space-y-6 px-4 md:px-0">
            <Card className="p-6 md:p-8 space-y-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-5 h-5" /></div>
                <h3 className="font-semibold text-lg">ข้อมูลส่วนตัว (Personal Information)</h3>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ภาษาไทย (Thai)</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <Label>คำนำหน้า</Label>
                    <Select
                      value={personalInfo.prefixThai}
                      onValueChange={(val) => {
                        const newEng = prefixThaiToEng[val] || personalInfo.prefixEng;
                        setPersonalInfo(prev => ({ ...prev, prefixThai: val, prefixEng: newEng }));
                      }}
                    >
                      <SelectTrigger className="bg-slate-50/50 h-10"><SelectValue placeholder="เลือก" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="เด็กชาย">เด็กชาย</SelectItem>
                        <SelectItem value="เด็กหญิง">เด็กหญิง</SelectItem>
                        <SelectItem value="นาย">นาย</SelectItem>
                        <SelectItem value="นางสาว">นางสาว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4">
                    <Label>ชื่อ</Label>
                    <Input value={personalInfo.nameThai} onChange={e => setPersonalInfo(p => ({ ...p, nameThai: e.target.value }))} required className="bg-slate-50/50 h-10" />
                  </div>
                  <div className="md:col-span-5">
                    <Label>นามสกุล</Label>
                    <Input value={personalInfo.surnameThai} onChange={e => setPersonalInfo(p => ({ ...p, surnameThai: e.target.value }))} required className="bg-slate-50/50 h-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ภาษาอังกฤษ (English)</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <Label>Prefix</Label>
                    <Select
                      value={personalInfo.prefixEng}
                      onValueChange={(val) => setPersonalInfo(p => ({ ...p, prefixEng: val }))}
                    >
                      <SelectTrigger className="bg-slate-50/50 h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Mr.">Mr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4">
                    <Label>First Name</Label>
                    <Input value={personalInfo.nameEng} onChange={e => setPersonalInfo(p => ({ ...p, nameEng: e.target.value }))} required className="bg-slate-50/50 h-10" />
                  </div>
                  <div className="md:col-span-5">
                    <Label>Last Name</Label>
                    <Input value={personalInfo.surnameEng} onChange={e => setPersonalInfo(p => ({ ...p, surnameEng: e.target.value }))} required className="bg-slate-50/50 h-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-50 mt-4">
                <div className="flex flex-col gap-2">
                  <Label>วันเกิด (Date of Birth)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal bg-slate-50/50 border-input",
                          !personalInfo.birthDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {personalInfo.birthDate ? format(new Date(personalInfo.birthDate), "PPP", { locale: th }) : <span>เลือกวันเกิด</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={personalInfo.birthDate ? new Date(personalInfo.birthDate) : undefined}
                        onSelect={(date) => setPersonalInfo(p => ({ ...p, birthDate: date ? format(date, "yyyy-MM-dd") : '' }))}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>น้ำหนัก (kg)</Label>
                  <Input type="number" value={personalInfo.weight} onChange={e => setPersonalInfo(p => ({ ...p, weight: Number(e.target.value) }))} required className="bg-slate-50/50 h-10" />
                </div>
                <div>
                  <Label>ส่วนสูง (cm)</Label>
                  <Input type="number" value={personalInfo.height} onChange={e => setPersonalInfo(p => ({ ...p, height: Number(e.target.value) }))} required className="bg-slate-50/50 h-10" />
                </div>
              </div>
            </Card>

            {/* IDs */}
            <Card className="p-6 md:p-8 space-y-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><IdCard className="w-5 h-5" /></div>
                <h3 className="font-semibold text-lg">เอกสารยืนยันตัวตน</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>รหัสนักเรียน</Label>
                  <Input value={personalInfo.studentId} onChange={e => setPersonalInfo(p => ({ ...p, studentId: e.target.value }))} required className="bg-slate-50/50 h-10" />
                </div>
                <div>
                  <Label>เลขบัตรประชาชน (13 หลัก)</Label>
                  <Input value={personalInfo.citizenId} onChange={e => setPersonalInfo(p => ({ ...p, citizenId: e.target.value }))} required className="bg-slate-50/50 h-10" maxLength={13} />
                </div>
                <div>
                  <Label>Passport No</Label>
                  <Input value={personalInfo.passportNo} onChange={e => setPersonalInfo(p => ({ ...p, passportNo: e.target.value }))} required className="bg-slate-50/50 h-10" />
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6 md:p-8 space-y-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Phone className="w-5 h-5" /></div>
                <h3 className="font-semibold text-lg">ช่องทางการติดต่อ</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>เบอร์โทรศัพท์มือถือ (นักเรียน)</Label>
                  <Input value={personalInfo.phone} onChange={e => setPersonalInfo(p => ({ ...p, phone: e.target.value }))} required className="bg-slate-50/50 h-10" />
                </div>
                <div>
                  <Label>เบอร์โทรศัพท์ผู้ปกครอง</Label>
                  <Input value={personalInfo.parentPhone} onChange={e => setPersonalInfo(p => ({ ...p, parentPhone: e.target.value }))} required className="bg-slate-50/50 h-10" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input type="email" value={personalInfo.email} onChange={e => setPersonalInfo(p => ({ ...p, email: e.target.value }))} required className="pl-9 bg-slate-50/50 h-10" />
                  </div>
                </div>
                <div>
                  <Label>Line ID</Label>
                  <Input value={personalInfo.lineId} onChange={e => setPersonalInfo(p => ({ ...p, lineId: e.target.value }))} required className="bg-slate-50/50 h-10" />
                </div>
              </div>
            </Card>

            {/* Health & Education */}
            <div className="space-y-6">
              <Card className="p-6 space-y-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><HeartPulse className="w-5 h-5" /></div>
                  <h3 className="font-semibold text-lg">ข้อมูลสุขภาพ</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>โรคประจำตัว (ถ้าไม่มีใส่ -)</Label>
                    <Input value={personalInfo.diseases || ''} onChange={e => setPersonalInfo(p => ({ ...p, diseases: e.target.value }))} className="bg-slate-50/50 h-10" placeholder="กรอกข้อมูลโรคประจำตัว" />
                  </div>
                  <div>
                    <Label>การแพ้อาหาร (ถ้าไม่มีใส่ -)</Label>
                    <Input value={personalInfo.allergies || ''} onChange={e => setPersonalInfo(p => ({ ...p, allergies: e.target.value }))} className="bg-slate-50/50 h-10" placeholder="กรอกข้อมูลการแพ้อาหาร" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><GraduationCap className="w-5 h-5" /></div>
                  <h3 className="font-semibold text-lg">ข้อมูลการศึกษา</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>ระดับชั้น</Label>
                    <Select value={personalInfo.gradeLevel} onValueChange={v => setPersonalInfo(p => ({ ...p, gradeLevel: v, classroom: '' }))}>
                      <SelectTrigger className="bg-slate-50/50 h-10"><SelectValue placeholder="เลือก..." /></SelectTrigger>
                      <SelectContent>
                        {availableGrades.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ห้อง</Label>
                    <Select
                      value={personalInfo.classroom}
                      onValueChange={v => setPersonalInfo(p => ({ ...p, classroom: v }))}
                      disabled={!personalInfo.gradeLevel}
                    >
                      <SelectTrigger className="bg-slate-50/50 h-10"><SelectValue placeholder="เลือก..." /></SelectTrigger>
                      <SelectContent>
                        {availableClassrooms.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>เกรดเฉลี่ย</Label>
                    <Input type="number" step="0.01" value={personalInfo.gpa || ''} onChange={e => setPersonalInfo(p => ({ ...p, gpa: Number(e.target.value) }))} required className="bg-slate-50/50 h-10" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Mobile Navigation for Personal Form */}
            <div className="md:hidden">
              <FixedBottomBar
                onBack={() => setCurrentView('project-detail')}
                nextLabel="ดำเนินการต่อ"
                backLabel="ยกเลิก"
                backVariant="ghost"
              />
            </div>
          </form>
        </div>

        {/* ================= RIGHT COLUMN: CONSENT & UPLOAD ================= */}
        <div className="md:col-span-4 space-y-6">

          {/* CONSENT SECTION */}
          <div className={cn("md:block", currentView !== 'consent-form' && 'hidden')}>
            <div className="md:hidden flex flex-col items-center mb-6 px-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">ข้อตกลงและเงื่อนไข</h1>
              <p className="text-slate-500 text-sm mt-1">รายละเอียดเงื่อนไขการเข้าร่วมโครงการ</p>
            </div>
            <form onSubmit={handleConsentSubmit} className="space-y-6 px-4 md:px-0">
              <Card className="p-6 space-y-4 shadow-md border border-slate-100 bg-white">
                <div className="pb-2 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><FileText className="w-5 h-5" /></div>
                  <h3 className="text-lg font-bold text-slate-800">ข้อตกลงในการเข้าร่วมโครงการ</h3>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg border ${consentError && !consentInfo.agreeFlightCost ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}>
                    <Checkbox id="c1" checked={consentInfo.agreeFlightCost} onCheckedChange={(c) => setConsentInfo({ ...consentInfo, agreeFlightCost: !!c })} required className="mt-1 translate-y-0.5" />
                    <label htmlFor="c1" className="text-sm cursor-pointer leading-6 text-slate-700">
                      ข้าพเจ้ารับทราบว่าค่าใช้จ่ายในโครงการ <strong>ยังไม่รวมค่าตั๋วเครื่องบินไป-กลับ</strong> และข้าพเจ้าต้องรับผิดชอบค่าใช้จ่ายส่วนนี้เอง
                    </label>
                  </div>
                  <div className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg border ${consentError && !consentInfo.agreeNoRefund ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}>
                    <Checkbox id="c2" checked={consentInfo.agreeNoRefund} onCheckedChange={(c) => setConsentInfo({ ...consentInfo, agreeNoRefund: !!c })} required className="mt-1 translate-y-0.5" />
                    <label htmlFor="c2" className="text-sm cursor-pointer leading-6 text-slate-700">
                      ข้าพเจ้ารับทราบเงื่อนไขการ <strong>ไม่คืนเงิน (Non-refundable)</strong> หากข้าพเจ้าสละสิทธิ์หลังจากชำระเงินไม่ว่ากรณีใดๆ
                    </label>
                  </div>
                  <div className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg border ${consentError && !consentInfo.agreeLimitedSeats ? 'border-red-500 bg-red-50/50' : 'border-slate-100'}`}>
                    <Checkbox id="c3" checked={consentInfo.agreeLimitedSeats} onCheckedChange={(c) => setConsentInfo({ ...consentInfo, agreeLimitedSeats: !!c })} required className="mt-1 translate-y-0.5" />
                    <label htmlFor="c3" className="text-sm cursor-pointer leading-6 text-slate-700">
                      ข้าพเจ้ารับทราบว่าโครงการรับจำนวนจำกัด และจะพิจารณาสิทธิ์ตามลำดับการชำระเงิน (First Come First Serve)
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div>
                    <Label className="text-base">ทำไมถึงสนใจเข้าร่วมโครงการนี้?</Label>
                    <Textarea
                      value={consentInfo.whyJoin}
                      onChange={e => setConsentInfo({ ...consentInfo, whyJoin: e.target.value })}
                      required
                      className="bg-slate-50/50 mt-2 min-h-[100px]"
                      placeholder="เหตุผลความสนใจ..."
                    />
                  </div>
                  <div>
                    <Label className="text-base">รู้จักโครงการจากช่องทางใด?</Label>
                    <Input
                      value={consentInfo.howKnow}
                      onChange={e => setConsentInfo({ ...consentInfo, howKnow: e.target.value })}
                      required
                      className="bg-slate-50/50 mt-2"
                      placeholder="Facebook, เพื่อนแนะนำ, เว็บไซต์..."
                    />
                  </div>
                </div>
              </Card>

              {/* Mobile Nav Consent */}
              <div className="md:hidden">
                <FixedBottomBar onBack={() => setCurrentView('personal-form')} nextLabel="บันทึกและถัดไป" />
              </div>
            </form>
          </div>

          {/* UPLOAD SECTION */}
          <div className={cn("md:block", currentView !== 'upload-docs' && 'hidden')}>
            <div className="md:hidden flex flex-col items-center mb-6 px-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">รายการเอกสาร</h1>
              <p className="text-slate-500 text-sm mt-1">เอกสารที่จำเป็นในการสมัครเข้าร่วมโครงการ</p>
            </div>

            {/* Unified Card for Documents */}
            <Card className="p-6 shadow-md border border-slate-100 bg-white space-y-4 mb-8">
              <div className="pb-2 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><ClipboardList className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-800">เอกสารประกอบการสมัคร</h3>
              </div>

              <div className="space-y-3">
                {project.documents?.map((doc, idx) => (
                  <div key={idx} className={cn(
                    "p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all border rounded-xl",
                    uploadedDocs[doc.id] ? "border-green-200 bg-green-50/30" : "border-slate-200 hover:border-primary/50"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        uploadedDocs[doc.id] ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {uploadedDocs[doc.id] ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{doc.name}</h4>
                        <p className={cn("text-xs mt-1 font-medium", uploadedDocs[doc.id] ? "text-green-600" : "text-amber-600")}>
                          {uploadedDocs[doc.id] ? "อัปโหลดเรียบร้อยแล้ว" : "จำเป็นต้องอัปโหลด"}
                        </p>
                        {uploadedDocs[doc.id] && (
                          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">{uploadedDocs[doc.id].name}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto mt-2 sm:mt-0 relative">
                      <Button variant={uploadedDocs[doc.id] ? "outline" : "default"} className={cn(
                        "w-full sm:w-auto relative overflow-hidden h-10", // h-10 = 40px
                        !uploadedDocs[doc.id] && "bg-blue-600 hover:bg-blue-700" // Blue color
                      )} disabled={uploadingDocId === doc.id}>
                        {uploadingDocId === doc.id ? (
                          <><Loader2 className="animate-spin mr-2 w-4 h-4" /> กำลังอัปโหลด...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadedDocs[doc.id] ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์'}
                          </>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.id, file);
                          }}
                          accept="image/*,.pdf"
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mobile Nav Upload */}
            <div className="md:hidden">
              <FixedBottomBar
                onBack={() => setCurrentView('consent-form')}
                onNext={handleFinalApplicationSubmit}
                disableNext={submitting}
                loading={submitting}
                nextLabel="ยืนยันการสมัคร"
                customNextIcon={<CheckCircle className="w-5 h-5 mr-2" />}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Missing Docs Confirmation Modal */}
      <Dialog open={docConfirmModalOpen} onOpenChange={setDocConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              เอกสารไม่ครบถ้วน
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-700">
              ตอนนี้เอกสารยังไม่ครบ สามารถยื่นทีหลังได้แต่ถ้าเลยกำหนดสมัครจะถือว่าเป็นการสมัครที่ไม่สมบูรณ์ <br /><br />
              ต้องการยืนยันการสมัครเพื่อดำเนินการต่อหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDocConfirmModalOpen(false)}>ยกเลิก / กลับไปแก้ไข</Button>
            <Button onClick={() => { setDocConfirmModalOpen(false); submitApplication(); }}>ยืนยันดำเนินการต่อ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-xl">สมัครเข้าร่วมโครงการสำเร็จ!</DialogTitle>
            <p className="text-slate-500">
              ระบบได้รับข้อมูลการสมัครของท่านเรียบร้อยแล้ว<br />
              กรุณาติดตามสถานะการตรวจสอบเอกสาร
            </p>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push('/student/feed')}>
              ตกลง / ไปที่หน้าหลัก
            </Button>
          </div>
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

    </div>
  );
}