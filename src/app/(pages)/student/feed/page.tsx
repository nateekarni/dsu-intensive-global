"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types"; // Import Type ที่เราทำไว้ EP.2
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

export default function FeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationStats, setApplicationStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      // ดึงเฉพาะโครงการที่สถานะเป็น 'open'
      const q = query(collection(db, "projects"), where("status", "==", "open"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)); // as any ชั่วคราวเพื่อให้ผ่าน type check
      setProjects(data);

      // นับจำนวนผู้สมัครที่ผ่านการคัดเลือก (approved) ของแต่ละโครงการ
      const stats: Record<string, number> = {};
      await Promise.all(
        data.map(async (p: any) => {
          const appsSnap = await getDocs(
            query(
              collection(db, "applications"),
              where("projectId", "==", p.id),
              where("status", "==", "approved")
            )
          );
          stats[p.id] = appsSnap.size;
        })
      );
      setApplicationStats(stats);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">โครงการต่างประเทศ</h1>
        <p className="text-sm text-slate-500">โรงเรียนสาธิตมหาวิทยาลัยศิลปากร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/student/projects/${project.id}`}>
            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group h-full flex flex-col">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                <img 
                  src={project.coverImage || "https://placehold.co/600x400"} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                  เปิดรับสมัคร
                </Badge>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {project.locations?.join(", ") || project.displayLocation || "-"}
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-primary text-base">
                    ฿{project.costs?.amount?.toLocaleString() ?? "0"}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                    <Users className="w-3 h-3" />
                    {applicationStats[project.id] || 0}/{project.capacity || 0} คน
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}