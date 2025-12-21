"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  XCircle,
  FileText,
  ClipboardList
} from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (typeof id === 'string') {
        const docSnap = await getDoc(doc(db, "projects", id));
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        }
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleApply = () => {
    if (typeof id === "string") {
      router.push(`/student/apply/${id}`);
    }
  };

  const formatThaiDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-500">ไม่พบโครงการ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      {/* Page Header */}
      <div className="relative flex items-center justify-center mb-4 md:mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="absolute left-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          รายละเอียดโครงการ
        </h1>
      </div>

      {/* Hero Image */}
      <div className="rounded-xl overflow-hidden h-64 md:h-80 relative bg-slate-200 mb-6 shadow-lg">
        {project.coverImage && (
          <img 
            src={project.coverImage} 
            alt={project.title}
            className="w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
          <div className="w-full">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">{project.title}</h1>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4" />
              <span className="text-sm md:text-base">
                {formatThaiDate(project.startDate)} - {formatThaiDate(project.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 mb-6">
        {/* Description */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">รายละเอียดโครงการ</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {project.description}
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
          </div>
        </Card>

        {/* Qualifications */}
        {project.qualifications && project.qualifications.length > 0 && (
          <Card className="p-6">
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
          </Card>
        )}

        {/* Documents */}
        {project.documents && project.documents.length > 0 && (
          <Card className="p-6">
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
            <h3 className="font-bold text-lg mb-6 border-l-4 border-blue-500 pl-3">
              กำหนดการ (Agenda)
            </h3>
            <div className="space-y-6">
              {project.agenda.map((day: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center mr-2">
                    <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {day.day}
                    </div>
                    {index < project.agenda.length - 1 && (
                      <div className="w-px flex-1 bg-slate-300 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-slate-800 mb-1">
                      {day.title}
                    </h4>
                    {day.description && (
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{day.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
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
            onClick={handleApply} 
            className="px-6 h-10 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            สมัคร
          </Button>
        </div>
      </div>
    </div>
  );
}