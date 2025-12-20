"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export default function AdminProjectList() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "projects"));
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">จัดการโครงการ</h1>
        <Link href="/admin/create-project">
            <Button><Plus className="w-4 h-4 mr-2" /> สร้างโครงการใหม่</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={p.status === 'open' ? 'default' : 'secondary'}>{p.status}</Badge>
                    <span className="text-xs text-slate-400">ID: {p.id.substring(0,6)}...</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{p.description}</p>
            </div>
            
            <Link href={`/admin/projects/${p.id}/students`}>
                <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" /> ดูรายชื่อผู้สมัคร
                </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}