"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const input = identifier.trim();

      let emailToLogin = input;
      // 1. ตรวจสอบรูปแบบ Input (Email หรือ Student ID)
      const isEmailInput = input.includes("@");

      if (!isEmailInput) {
        // ถ้าระบุเป็นรหัสนักเรียน -> เติมโดเมนจำลองต่อท้าย
        emailToLogin = `${input}@dsu.student`;
      }

      // 2. Login กับ Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
      const uid = userCredential.user.uid;

      // 3. ดึงข้อมูล Role จาก Firestore เพื่อตัดสินใจ Redirect
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role; // ค่า role ที่เก็บใน DB (admin / student)

        // ✅ เช็ค Role โดยตรง (Logic ใหม่)
        if (role === 'admin') {
          router.push("/admin/projects");
        } else {
          // ถ้าเป็น student หรือ role อื่นๆ ให้ไปหน้า Feed
          router.push("/student/feed");
        }

      } else {
        // กรณี Login ผ่าน Auth แต่ไม่มีข้อมูล User ใน DB (Fallback)
        // ให้ไปหน้า Feed เป็นค่าเริ่มต้น
        router.push("/student/feed");
      }

    } catch (err: any) {
      console.error(err);
      setError("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            DSU Intensive Global
          </h1>
          <p className="text-sm text-slate-500">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              รหัสนักเรียน
            </label>
            <Input
              type="text"
              placeholder="กรอกรหัสนักเรียน"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.trim())}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              วันเดือนปีเกิด (DDMMYY)
            </label>
            <Input
              type="password"
              placeholder="เช่น 210345"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              required
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">{error}</div>}

          <Button type="submit" className="w-full btn-primary h-11 text-base" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            เข้าสู่ระบบ
          </Button>
        </form>
      </Card>
    </div>
  );
}