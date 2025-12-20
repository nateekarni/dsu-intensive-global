"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// กำหนด Type ของ User เรา (รวมข้อมูลจาก Firestore)
interface UserProfile {
  uid: string;
  email: string | null;
  role: "student" | "admin" | null;
  profile?: any; // (ใส่ Type เต็มๆ ตาม Schema ข้างบนถ้าต้องการ)
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ฟังสถานะ Login จาก Firebase
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // ถ้า Login แล้ว -> ไปดึง Role จาก Firestore
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            role: userData.role || "student", // Default เป็นนักเรียน
            profile: userData.profile,
          });
        } else {
          // กรณีเพิ่ง Login ครั้งแรก (ยังไม่มีใน DB)
          setUser({ uid: fbUser.uid, email: fbUser.email, role: null });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    router.push("/"); // กลับหน้าแรกเมื่อ Logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook สำหรับเรียกใช้ในหน้าอื่นๆ
export const useAuth = () => useContext(AuthContext);