"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, User, FileText, Phone } from "lucide-react";
import type { PersonalInfoForm, UserProfile } from "@/types";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<PersonalInfoForm>({
    prefixThai: '',
    prefixEng: '',
    nameThai: '',
    nameEng: '',
    surnameThai: '',
    surnameEng: '',
    birthDate: '',
    weight: 0,
    height: 0,
    studentId: '',
    citizenId: '',
    passportNo: '',
    phone: '',
    parentPhone: '',
    email: '',
    lineId: '',
    diseases: '',
    allergies: '',
    gradeLevel: '',
    classroom: '',
    studyPlan: '',
    gpa: 0,
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (typeof id === 'string') {
        try {
          const docSnap = await getDoc(doc(db, "users", id));
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setStudent(data);
            
            // โหลดข้อมูล profile
            if (data.profile) {
              setProfile({
                prefixThai: data.profile.prefixThai || '',
                prefixEng: data.profile.prefixEng || '',
                nameThai: data.profile.nameThai || '',
                nameEng: data.profile.nameEng || '',
                surnameThai: data.profile.surnameThai || '',
                surnameEng: data.profile.surnameEng || '',
                birthDate: data.profile.birthDate || '',
                weight: data.profile.weight || 0,
                height: data.profile.height || 0,
                studentId: data.profile.studentId || '',
                citizenId: data.profile.citizenId || '',
                passportNo: data.profile.passportNo || '',
                phone: data.profile.phone || '',
                parentPhone: data.profile.parentPhone || '',
                email: data.profile.email || data.email || '',
                lineId: data.profile.lineId || '',
                diseases: data.profile.diseases || '',
                allergies: data.profile.allergies || '',
                gradeLevel: data.profile.gradeLevel || '',
                classroom: data.profile.classroom || '',
                studyPlan: data.profile.studyPlan || '',
                gpa: data.profile.gpa || 0,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching student:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudent();
  }, [id]);

  const handleSave = async () => {
    if (!id || typeof id !== 'string') return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", id), {
        profile: profile,
      });
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  function handleChange<K extends keyof PersonalInfoForm>(
    field: K,
    value: PersonalInfoForm[K]
  ) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">ไม่พบข้อมูลนักเรียน</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">ข้อมูลนักเรียน</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">แก้ไขและจัดการข้อมูลส่วนตัวของนักเรียน</p>
          </div>
        </div>
          <Button onClick={handleSave} disabled={saving} className="gap-1 ml-4">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึกการแก้ไข
        </Button>
      </div>

      <div className="space-y-6">
        {/* ข้อมูลบัญชี */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            ข้อมูลบัญชี
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>อีเมล</Label>
              <Input value={student.email} disabled className="bg-slate-50" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={student.role || 'student'} disabled className="bg-slate-50" />
            </div>
          </div>
        </Card>

        {/* ข้อมูลส่วนตัว (ไทย) */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            ข้อมูลส่วนตัว (ภาษาไทย)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>คำนำหน้า</Label>
              <Input
                value={profile.prefixThai}
                onChange={e => handleChange('prefixThai', e.target.value)}
                placeholder="เด็กชาย / เด็กหญิง / นาย / นางสาว"
              />
            </div>
            <div>
              <Label>ชื่อ</Label>
              <Input
                value={profile.nameThai}
                onChange={e => handleChange('nameThai', e.target.value)}
                placeholder="ชื่อภาษาไทย"
              />
            </div>
            <div>
              <Label>นามสกุล</Label>
              <Input
                value={profile.surnameThai}
                onChange={e => handleChange('surnameThai', e.target.value)}
                placeholder="นามสกุลภาษาไทย"
              />
            </div>
          </div>
        </Card>

        {/* ข้อมูลส่วนตัว (อังกฤษ) */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            ข้อมูลส่วนตัว (ภาษาอังกฤษ)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Prefix</Label>
              <Input
                value={profile.prefixEng}
                onChange={e => handleChange('prefixEng', e.target.value)}
                placeholder="Mr. / Ms. / Master"
              />
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={profile.nameEng}
                onChange={e => handleChange('nameEng', e.target.value)}
                placeholder="First Name"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={profile.surnameEng}
                onChange={e => handleChange('surnameEng', e.target.value)}
                placeholder="Last Name"
              />
            </div>
          </div>
        </Card>

        {/* ข้อมูลทั่วไป */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            ข้อมูลทั่วไป
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>วันเกิด (YYYY-MM-DD)</Label>
              <Input
                type="date"
                value={profile.birthDate}
                onChange={e => handleChange('birthDate', e.target.value)}
              />
            </div>
            <div>
              <Label>น้ำหนัก (กก.)</Label>
              <Input
                type="number"
                value={profile.weight}
                onChange={e => handleChange('weight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>ส่วนสูง (ซม.)</Label>
              <Input
                type="number"
                value={profile.height}
                onChange={e => handleChange('height', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>รหัสนักเรียน</Label>
              <Input
                value={profile.studentId}
                onChange={e => handleChange('studentId', e.target.value)}
                placeholder="รหัสนักเรียน"
              />
            </div>
            <div>
              <Label>เลขประจำตัวประชาชน</Label>
              <Input
                value={profile.citizenId}
                onChange={e => handleChange('citizenId', e.target.value)}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>
            <div>
              <Label>หมายเลขหนังสือเดินทาง</Label>
              <Input
                value={profile.passportNo}
                onChange={e => handleChange('passportNo', e.target.value)}
                placeholder="AB1234567"
              />
            </div>
          </div>
        </Card>

        {/* ข้อมูลติดต่อ */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" />
            ข้อมูลติดต่อ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>เบอร์โทรศัพท์นักเรียน</Label>
              <Input
                value={profile.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="0812345678"
              />
            </div>
            <div>
              <Label>เบอร์โทรศัพท์ผู้ปกครอง</Label>
              <Input
                value={profile.parentPhone}
                onChange={e => handleChange('parentPhone', e.target.value)}
                placeholder="0812345678"
              />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="student@example.com"
              />
            </div>
            <div>
              <Label>Line ID</Label>
              <Input
                value={profile.lineId}
                onChange={e => handleChange('lineId', e.target.value)}
                placeholder="@lineid"
              />
            </div>
          </div>
        </Card>

        {/* ข้อมูลสุขภาพ */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            ข้อมูลสุขภาพ
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>โรคประจำตัว</Label>
              <Textarea
                value={profile.diseases}
                onChange={e => handleChange('diseases', e.target.value)}
                placeholder="ระบุโรคประจำตัว (ถ้ามี)"
                rows={2}
              />
            </div>
            <div>
              <Label>ประวัติการแพ้ยา/อาหาร</Label>
              <Textarea
                value={profile.allergies}
                onChange={e => handleChange('allergies', e.target.value)}
                placeholder="ระบุประวัติการแพ้ยาหรืออาหาร (ถ้ามี)"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* ข้อมูลการศึกษา */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            ข้อมูลการศึกษา
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>ระดับชั้น</Label>
              <Input
                value={profile.gradeLevel}
                onChange={e => handleChange('gradeLevel', e.target.value)}
                placeholder="เช่น ม.4"
              />
            </div>
            <div>
              <Label>แผนการเรียน</Label>
              <Input
                value={profile.studyPlan}
                onChange={e => handleChange('studyPlan', e.target.value)}
                placeholder="เช่น วิทย์-คณิต"
              />
            </div>
            <div>
              <Label>เกรดเฉลี่ยสะสม (GPA)</Label>
              <Input
                type="number"
                step="0.01"
                value={profile.gpa}
                onChange={e => handleChange('gpa', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="sticky bottom-4 lg:hidden">
          <Button onClick={handleSave} disabled={saving} className="w-full gap-1 shadow-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึกการแก้ไข
          </Button>
        </div>
      </div>
    </div>
  );
}
