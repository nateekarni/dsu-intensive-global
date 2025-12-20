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

  useEffect(() => {
    const fetchProjects = async () => {
      // ดึงเฉพาะโครงการที่สถานะเป็น 'open'
      const q = query(collection(db, "projects"), where("status", "==", "open"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)); // as any ชั่วคราวเพื่อให้ผ่าน type check
      setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
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
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                  {project.description}
                </p>
                
                <div className="space-y-2 text-xs text-slate-500 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> 
                    {project.locations?.join(", ")}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-base">
                      ฿{project.costs?.amount?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Users className="w-3 h-3" /> {project.capacity} ที่นั่ง
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}