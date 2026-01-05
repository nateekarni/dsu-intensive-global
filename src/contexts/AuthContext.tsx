"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  logout: async () => { },
});

// Timeout duration in milliseconds (e.g., 30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [sessionAlertOpen, setSessionAlertOpen] = useState(false);
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push("/"); // กลับหน้าแรกเมื่อ Logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [router]);

  // Session Timeout Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          setSessionAlertOpen(true);
        }, SESSION_TIMEOUT_MS);
      }
    };

    // Events to detect activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    if (user) {
      resetTimer(); // Start timer initially
      events.forEach(event => window.addEventListener(event, resetTimer));
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);

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

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}

      <AlertDialog open={sessionAlertOpen} onOpenChange={setSessionAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>แจ้งเตือน</AlertDialogTitle>
            <AlertDialogDescription>
              หมดเวลาการใช้งานระบบ กรุณาเข้าสู่ระบบใหม่
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setSessionAlertOpen(false);
              logout();
            }}>
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
}

// Hook สำหรับเรียกใช้ในหน้าอื่นๆ
export const useAuth = () => useContext(AuthContext);