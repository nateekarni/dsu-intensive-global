"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // applicationStats removed for now as public API doesn't expose it yet, 
  // or we need a simplified public status count if critical. 
  // Assuming strict privacy, we might hide stats or fetch simply.
  // For now, let's keep it simple and just show projects.

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        // Filter open status on client or server? Server is better but for now client matches old logic partially
        // Actually server code returns all projects. Let's filter here if needed, or assume server sends what's needed.
        // The previous code filtered where("status", "==", "open").
        // Let's filter here to be safe, or update API to filter.
        // Let's filter client side for now.
        // Fetch all projects and determine status client-side (including expired)
        // const openProjects = data.filter((p: any) => p.status === 'open'); 
        // We now show all projects but mark closed/expired ones
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          โครงการต่างประเทศ
        </h1>
        <p className="text-sm text-slate-500">โรงเรียนสาธิตมหาวิทยาลัยศิลปากร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          // Handle closeDate which might be ISO string (from API) or Timestamp (if cached/direct)
          let closeDateObj: Date | null = null;
          if (project.closeDate) {
            if (typeof project.closeDate === 'string') {
              closeDateObj = new Date(project.closeDate);
            } else if ((project.closeDate as any).toDate) {
              closeDateObj = (project.closeDate as any).toDate();
            }
          }

          const isExpired = closeDateObj ? closeDateObj < new Date() : false;
          const isClosed = project.status === 'closed' || isExpired;

          return (
            <Link key={project.id} href={`/student/projects/${project.id}`}>
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group h-full flex flex-col">
                <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                  <img
                    src={project.coverImage || "https://placehold.co/600x400"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className={cn(
                    "absolute top-2 right-2",
                    isClosed ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  )}>
                    {isClosed ? "ปิดรับสมัคร" : "เปิดรับสมัคร"}
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
                      {project.displayLocation || project.locations?.join(", ") || "-"}
                    </span>
                  </div>

                  <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-primary text-base">
                      ฿{project.costs?.amount?.toLocaleString() ?? "0"}
                    </span>
                    {/* Stats removed for privacy as requested, or can add back if API exposes count */}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
