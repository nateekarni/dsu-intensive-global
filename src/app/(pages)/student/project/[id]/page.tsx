"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext"; // เอาไว้เช็ค Login
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); // ดึง User ปัจจุบัน
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
    router.push(`/student/apply/${params.id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>ไม่พบโครงการ</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-24">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับหน้ารายการ
      </Button>

      {/* Hero Image */}
      <div className="rounded-xl overflow-hidden h-64 md:h-80 relative bg-slate-200 mb-6">
        <img src={project.coverImage} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.title}</h1>
            <div className="flex gap-2">
               <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                 <Calendar className="w-3 h-3 mr-1" /> เปิดรับสมัคร
               </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">รายละเอียดโครงการ</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">สถานที่</h3>
            <div className="flex flex-wrap gap-2">
                {project.locations?.map((loc: string) => (
                    <Badge key={loc} variant="outline" className="text-slate-600">
                        <MapPin className="w-3 h-3 mr-1" /> {loc}
                    </Badge>
                ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar (Sticky on Desktop) */}
        <div className="md:col-span-1">
            <Card className="p-6 sticky top-20">
                <div className="text-center mb-6">
                    <p className="text-slate-500 text-sm">ค่าเข้าร่วมโครงการ</p>
                    <h2 className="text-3xl font-bold text-primary">฿{project.costs?.amount?.toLocaleString()}</h2>
                </div>
                
                <Button onClick={handleApply} className="w-full btn-primary h-12 text-lg shadow-lg shadow-blue-200/50">
                    สมัครเข้าร่วม
                </Button>

                <p className="text-xs text-center text-slate-400 mt-4">
                    {user ? `ล็อกอินแล้ว: ${user.email}` : "กรุณาเข้าสู่ระบบก่อนสมัคร"}
                </p>
            </Card>
        </div>
      </div>
    </div>
  );
}