"use client";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "./ui/button";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function DebugSeeder() {
  const [open, setOpen] = useState(false);

  const seedProject = async () => {
    await addDoc(collection(db, "projects"), {
      title: "Summer Camp in Tokyo 2025",
      description: "โครงการแลกเปลี่ยนระยะสั้น 3 สัปดาห์ เรียนรู้วัฒนธรรมญี่ปุ่น",
      coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800",
      status: "open",
      recruitmentType: "fcfs",
      capacity: 30,
      startDate: serverTimestamp(), // วันที่สมมติ
      endDate: serverTimestamp(),
      closeDate: serverTimestamp(),
      locations: ["Tokyo", "Disneyland"],
      costs: {
        amount: 55000,
        included: ["ค่าตั๋ว", "ที่พัก"],
        excluded: ["Passport"]
      }
    });
    setOpen(true);
  };

  // ปุ่มนี้จะแสดงเฉพาะตอน Dev (localhost)
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <Button onClick={seedProject} variant="destructive" className="fixed bottom-20 right-4 z-50 opacity-50 hover:opacity-100">
        Seed Project
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seeder</AlertDialogTitle>
            <AlertDialogDescription>
              สร้างข้อมูลตัวอย่างเสร็จแล้ว! กด Refresh หน้าจอ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpen(false)}>ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}