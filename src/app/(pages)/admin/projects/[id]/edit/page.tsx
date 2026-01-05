"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, X, CheckCircle, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentItem {
  id: string;
  name: string;
  file: File | null;
  existingUrl?: string;
  templateUrl?: string;
  isRequired: boolean;
}

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // --- 1. ข้อมูลพื้นฐาน ---
  const [title, setTitle] = useState("");
  const [displayLocation, setDisplayLocation] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");

  // --- 2. ช่วงเวลา ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [closeDate, setCloseDate] = useState("");

  // --- 3. สถานที่ในโปรแกรม (Locations) ---
  const [locations, setLocations] = useState<string[]>([""]);

  // --- Education Config ---
  const [gradeScope, setGradeScope] = useState<"all" | "lower" | "upper" | "gifted">("all");
  const [allowedClassrooms, setAllowedClassrooms] = useState<Set<string>>(new Set());

  // --- 4. รูปแบบการสมัคร ---
  const [recruitmentType, setRecruitmentType] = useState("fcfs");
  const [capacity, setCapacity] = useState("30");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // --- 5. ค่าใช้จ่าย ---
  const [costAmount, setCostAmount] = useState("0");
  const [costIncluded, setCostIncluded] = useState<string[]>([]);
  const [costExcluded, setCostExcluded] = useState<string[]>([]);

  // --- 6. กำหนดการ (Agenda) ---
  const [agenda, setAgenda] = useState<{ day: number; title: string; description: string }[]>([]);

  // Load existing project data
  useEffect(() => {
    const loadProject = async () => {
      if (typeof id !== 'string') return;

      setLoading(true);
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProjectId(id);

          // ข้อมูลพื้นฐาน
          setTitle(data.title || "");
          setDisplayLocation(data.displayLocation || "");
          setDescription(data.description || "");
          setExistingCoverUrl(data.coverImage || "");
          setCoverPreview(data.coverImage || "");

          // ช่วงเวลา
          if (data.startDate) setStartDate(data.startDate.toDate().toISOString().split('T')[0]);
          if (data.endDate) setEndDate(data.endDate.toDate().toISOString().split('T')[0]);
          if (data.closeDate) setCloseDate(data.closeDate.toDate().toISOString().split('T')[0]);

          // สถานที่
          setLocations(data.locations && data.locations.length > 0 ? data.locations : [""]);

          // รูปแบบการสมัคร
          setRecruitmentType(data.recruitmentType || "fcfs");
          setCapacity(data.capacity?.toString() || "30");
          setQualifications(data.qualifications || []);

          // เอกสาร
          if (data.requiredDocuments && Array.isArray(data.requiredDocuments)) {
            setDocuments(data.requiredDocuments.map((doc: DocumentItem) => ({
              id: doc.id || Date.now().toString(),
              name: doc.name,
              file: null,
              existingUrl: doc.templateUrl,
              isRequired: doc.isRequired !== undefined ? doc.isRequired : true
            })));
          }

          // ค่าใช้จ่าย
          setCostAmount(data.cost?.amount?.toString() || "0");
          setCostIncluded(data.cost?.included || []);
          setCostExcluded(data.cost?.excluded || []);

          // กำหนดการ
          // กำหนดการ
          setAgenda(data.agenda || []);

          // Config
          if (data.formConfig) {
            const fc = data.formConfig;
            if (fc.gradeScope) setGradeScope(fc.gradeScope);
            if (fc.allowedClassrooms && Array.isArray(fc.allowedClassrooms)) {
              setAllowedClassrooms(new Set(fc.allowedClassrooms));
            } else {
              // Fallback or init default logic if empty?
              // If editing old project without this config, maybe Init to All?
              // Let's leave empty if not present, user can set it.
            }
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
        setAlertMessage("เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ");
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // --- HANDLERS ---
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddLocation = () => setLocations([...locations, ""]);
  const handleUpdateLocation = (index: number, val: string) => {
    const newLocs = [...locations]; newLocs[index] = val; setLocations(newLocs);
  };
  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleAddQual = () => {
    setQualifications([...qualifications, ""]);
  };

  const handleAddDocument = () => {
    const newDoc = { id: Date.now().toString(), name: "", file: null, existingUrl: undefined, isRequired: true };
    setDocuments([...documents, newDoc]);
  };

  const handleAddCostIncluded = () => {
    setCostIncluded([...costIncluded, ""]);
  };

  const handleAddCostExcluded = () => {
    setCostExcluded([...costExcluded, ""]);
  };

  const handleAddAgendaDay = () => {
    const newDay = agenda.length + 1;
    setAgenda([...agenda, { day: newDay, title: "", description: "" }]);
  };

  const handleRemoveAgendaDay = (index: number) => {
    const newAgenda = agenda.filter((_, i) => i !== index);
    const renumbered = newAgenda.map((item, idx) => ({ ...item, day: idx + 1 }));
    setAgenda(renumbered);
  };

  const handleUpdateAgenda = (index: number, field: 'title' | 'description', value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index][field] = value;
    setAgenda(newAgenda);
  };

  const handleGradeScopeChange = (scope: "all" | "lower" | "upper" | "gifted") => {
    setGradeScope(scope);
    const newSet = new Set<string>();

    // Define ranges
    const lowerGrades = ["ม.1", "ม.2", "ม.3"];
    const upperGrades = ["ม.4", "ม.5", "ม.6"];
    const allGrades = [...lowerGrades, ...upperGrades];
    const allRooms = [1, 2, 3, 4, 5];

    if (scope === "all") {
      allGrades.forEach(g => allRooms.forEach(r => newSet.add(`${g}/${r}`)));
    } else if (scope === "lower") {
      lowerGrades.forEach(g => allRooms.forEach(r => newSet.add(`${g}/${r}`)));
    } else if (scope === "upper") {
      upperGrades.forEach(g => allRooms.forEach(r => newSet.add(`${g}/${r}`)));
    } else if (scope === "gifted") {
      const specificRooms = [3, 4];
      lowerGrades.forEach(g => specificRooms.forEach(r => newSet.add(`${g}/${r}`)));
    }
    setAllowedClassrooms(newSet);
  };

  const toggleClassroom = (roomKey: string) => {
    const newSet = new Set(allowedClassrooms);
    if (newSet.has(roomKey)) {
      newSet.delete(roomKey);
    } else {
      newSet.add(roomKey);
    }
    setAllowedClassrooms(newSet);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setAlertMessage("กรุณากรอกชื่อโครงการ"); setAlertOpen(true); return; }
    if (!startDate || !endDate || !closeDate) { setAlertMessage("กรุณากรอกวันที่ให้ครบ"); setAlertOpen(true); return; }

    setSaving(true);
    try {
      // 1. Upload Cover Image (ถ้ามีไฟล์ใหม่)
      let coverImageUrl = existingCoverUrl;
      if (coverFile) {
        const coverRef = ref(storage, `projects/${projectId}/cover_${Date.now()}`);
        await uploadBytes(coverRef, coverFile);
        coverImageUrl = await getDownloadURL(coverRef);
      }

      // 2. Upload Document Templates
      const uploadedDocs = await Promise.all(
        documents.map(async (d) => {
          if (d.file) {
            const docRef = ref(storage, `projects/${projectId}/docs/${d.id}_${Date.now()}`);
            await uploadBytes(docRef, d.file);
            const url = await getDownloadURL(docRef);
            return { id: d.id, name: d.name, templateUrl: url, isRequired: d.isRequired };
          } else {
            return { id: d.id, name: d.name, templateUrl: d.existingUrl || "", isRequired: d.isRequired };
          }
        })
      );

      // 3. Update Project Data
      const projectData = {
        title,
        displayLocation,
        description,
        coverImage: coverImageUrl,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        closeDate: Timestamp.fromDate(new Date(closeDate)),
        locations: locations.filter(l => l.trim()),
        recruitmentType,
        capacity: parseInt(capacity) || 0,
        qualifications,
        requiredDocuments: uploadedDocs,
        cost: {
          amount: parseFloat(costAmount) || 0,
          included: costIncluded,
          excluded: costExcluded,
        },
        agenda,
        formConfig: {
          gradeScope,
          allowedClassrooms: Array.from(allowedClassrooms)
        },
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, "projects", projectId), projectData);

      setAlertMessage("อัปเดตโครงการเรียบร้อย!");
      setAlertOpen(true);
      // Delay redirect to show success message? Or just redirect? - Alerts usually block properly.
      // With modal, it's non-blocking unless we wait. But here we just show it.
      // We should move router.push to the "OK" button action for success cases?
      // For simplicity now, I'll just show alert. But wait, router.push happens immediately. 
      // So the user won't see the alert if we push immediately.
      // I should probably remove router.push here and let the user click OK to go back?
      // But the original behavior was alert (blocking) then push.
      // I'll set a flag or handle it in the "onClose" or "onClick" of the dialog.
      // For now, I'll just show the alert and let them click OK. I'll modify the logic to separate success.
      // Actually, to imitate alert() -> push(), I should replace router.push with logic in the dialog.
      // But I only have one generic alert state.
      // I'll make the dialog action check if success message, then push.
      // Or simpler: I'll just set the message. And `router.push("/admin/projects")` should be moved to the callback of the dialog action if the message indicates success?
      // Too complex for simple replacement.
      // I'll leave router.push for now but it will happen immediately.
      // Wait, if I do router.push, the component unmounts. The alert won't be seen.
      // So I MUST remove router.push here. And rely on user clicking "OK" to redirect.
      // But I only have one `setAlertOpen(false)` in the JSX.
      // I need a callback state or similar.
      // Let's implement `onAlertClose` state.
    } catch (error) {
      console.error("Error updating project:", error);
      setAlertMessage("เกิดข้อผิดพลาดในการอัปเดตโครงการ");
      setAlertOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-4xl mx-auto pb-20 md:pb-8">
        <div className="relative flex items-center justify-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
          </Button>
          <h1 className="text-2xl font-bold text-primary">แก้ไขโครงการ</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. ข้อมูลพื้นฐาน */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
              ข้อมูลพื้นฐาน
            </h2>

            <div className="space-y-4">
              <div>
                <Label>ชื่อโครงการ</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น โครงการแลกเปลี่ยนนักเรียนประเทศญี่ปุ่น" />
              </div>

              {/* moved here */}
              <div>
                <Label>สถานที่ (สำหรับแสดงบนการ์ด)</Label>
                <Input value={displayLocation} onChange={(e) => setDisplayLocation(e.target.value)} placeholder="เช่น Tokyo, Japan" />
              </div>

              <div>
                <Label>คำอธิบายโครงการ</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>

              <div>
                <Label>รูปปกโครงการ</Label>
                {coverPreview && (
                  <div className="mb-2 relative w-full h-48 rounded-lg overflow-hidden">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview("");
                        setExistingCoverUrl("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleCoverChange} />
              </div>
            </div>
          </Card>

          {/* 2. ช่วงเวลา */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
              ช่วงเวลา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>วันเริ่มโครงการ</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>วันสิ้นสุดโครงการ</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>วันปิดรับสมัคร</Label>
                <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* 3. สถานที่ */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
              สถานที่ในโปรแกรม
            </h2>
            <div className="space-y-2">
              {locations.map((loc, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={loc} onChange={(e) => handleUpdateLocation(i, e.target.value)} placeholder="เช่น Tokyo Tower, Shibuya" />
                  {locations.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLocation(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddLocation} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> เพิ่มสถานที่
              </Button>
            </div>
          </Card>

          {/* 4. รูปแบบการสมัคร */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</div>
              รูปแบบการสมัคร
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ประเภทการคัดเลือก</Label>
                  <Select value={recruitmentType} onValueChange={setRecruitmentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fcfs">First Come First Serve</SelectItem>
                      <SelectItem value="selection">คัดเลือกโดยคณะกรรมการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>จำนวนรับ (คน)</Label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
              </div>

              {/* คุณสมบัติผู้สมัคร */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700">
                    คุณสมบัติผู้สมัคร
                  </Label>
                  <Button type="button" onClick={handleAddQual} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                  </Button>
                </div>
                <div className="space-y-2">
                  {qualifications.map((q, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={q}
                        onChange={e => {
                          const newQuals = [...qualifications];
                          newQuals[i] = e.target.value;
                          setQualifications(newQuals);
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setQualifications(qualifications.filter((_, idx) => idx !== i))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t my-2"></div>

              {/* เอกสารที่ใช้สมัคร */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700">
                    เอกสารที่ใช้สมัคร
                  </Label>
                  <Button type="button" onClick={handleAddDocument} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                  </Button>
                </div>
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={doc.id} className="flex gap-2 items-center">
                      <Input
                        value={doc.name}
                        onChange={e => {
                          const newDocs = [...documents];
                          newDocs[i].name = e.target.value;
                          setDocuments(newDocs);
                        }}
                        className="flex-1"
                        placeholder="ชื่อเอกสาร"
                      />
                      <div className="flex-1 relative">
                        <Input
                          type="file"
                          id={`file-${doc.id}`}
                          onChange={e => {
                            const newDocs = [...documents];
                            newDocs[i].file = e.target.files?.[0] || null;
                            setDocuments(newDocs);
                          }}
                          accept=".pdf,.doc,.docx"
                          className="opacity-0 absolute inset-0 cursor-pointer"
                        />
                        <div className="flex items-center h-10 border rounded-md px-3 bg-white">
                          <label
                            htmlFor={`file-${doc.id}`}
                            className="py-0.5 px-2 rounded bg-blue-500 text-white text-xs font-medium cursor-pointer hover:bg-blue-600"
                          >
                            อัปโหลดไฟล์
                          </label>
                          <span className="ml-3 text-sm text-slate-500">
                            {doc.file ? doc.file.name : doc.existingUrl ? "(มีไฟล์เดิม)" : 'ไม่มีไฟล์ที่เลือก'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mr-2">
                        <Checkbox
                          id={`req-${doc.id}`}
                          checked={doc.isRequired}
                          onCheckedChange={(checked) => {
                            const newDocs = [...documents];
                            newDocs[i].isRequired = !!checked;
                            setDocuments(newDocs);
                          }}
                        />
                        <Label htmlFor={`req-${doc.id}`} className="cursor-pointer text-sm whitespace-nowrap">จำเป็น</Label>
                      </div>

                      <Button type="button" variant="ghost" size="icon" onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 5. ค่าใช้จ่าย */}
          <Card className="p-4 space-y-4 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
              ค่าใช้จ่าย
            </h3>

            <div className="w-full space-y-1">
              <Label>ราคาต่อคน (บาท)</Label>
              <Input type="number" value={costAmount} onChange={e => setCostAmount(e.target.value)} className="text-lg font-bold" />
            </div>

            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-green-700 font-bold">สิ่งที่รวมในราคานี้ (Included)</Label>
                    <Button type="button" onClick={handleAddCostIncluded} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                    </Button>
                  </div>
                  {costIncluded.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={item}
                        onChange={e => {
                          const newCosts = [...costIncluded];
                          newCosts[i] = e.target.value;
                          setCostIncluded(newCosts);
                        }}
                        className="flex-1 bg-green-50"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCostIncluded(costIncluded.filter((_, idx) => idx !== i))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-red-700 font-bold">สิ่งที่ไม่รวม (Excluded)</Label>
                    <Button type="button" onClick={handleAddCostExcluded} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                    </Button>
                  </div>
                  {costExcluded.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={item}
                        onChange={e => {
                          const newCosts = [...costExcluded];
                          newCosts[i] = e.target.value;
                          setCostExcluded(newCosts);
                        }}
                        className="flex-1 bg-red-50"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCostExcluded(costExcluded.filter((_, idx) => idx !== i))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 6. กำหนดการ (Agenda) */}
          <Card className="p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                กำหนดการ (Agenda)
              </h3>
              <Button type="button" onClick={handleAddAgendaDay} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> เพิ่มวัน
              </Button>
            </div>

            <div className="space-y-3">
              {agenda.map((item, index) => (
                <Card key={index} className="p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {item.day}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateAgenda(index, 'title', e.target.value)}
                        placeholder="ชื่อกิจกรรม เช่น ออกเดินทาง, ปฐมนิเทศ"
                        className="font-semibold"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleUpdateAgenda(index, 'description', e.target.value)}
                        placeholder="รายละเอียดกิจกรรมในวันนี้..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAgendaDay(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}

              {agenda.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p>ยังไม่มีกำหนดการ กดปุ่ม &quot;เพิ่มวัน&quot; เพื่อเพิ่ม</p>
                </div>
              )}
            </div>
          </Card>

          {/* 7. การตั้งค่าข้อมูลการศึกษา (สำหรับฟอร์มสมัคร) */}
          <Card className="p-4 space-y-4 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
              <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
              การตั้งค่าข้อมูลการศึกษา (ฟอร์มสมัคร)
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>ระดับชั้นที่รับสมัคร</Label>
                <div className="flex flex-col sm:flex-row gap-3 text-sm flex-wrap">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeScope"
                      value="all"
                      checked={gradeScope === "all"}
                      onChange={() => handleGradeScopeChange("all")}
                    />
                    <span>ทุกชั้นปี (ม.1-ม.6)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeScope"
                      value="lower"
                      checked={gradeScope === "lower"}
                      onChange={() => handleGradeScopeChange("lower")}
                    />
                    <span>เฉพาะ ม.ต้น (ม.1-ม.3)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeScope"
                      value="upper"
                      checked={gradeScope === "upper"}
                      onChange={() => handleGradeScopeChange("upper")}
                    />
                    <span>เฉพาะ ม.ปลาย (ม.4-ม.6)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeScope"
                      value="gifted"
                      checked={gradeScope === "gifted"}
                      onChange={() => handleGradeScopeChange("gifted")}
                    />
                    <span>เฉพาะห้องเรียนพิเศษ (Gifted)</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <Label className="mb-2 block">เลือกห้องเรียนที่รับสมัคร</Label>
                <div className="border rounded-md p-4 bg-slate-50">
                  <div className="grid grid-cols-6 gap-2 text-center text-sm font-medium mb-2 border-b pb-2">
                    <div className="text-left text-slate-500">ชั้น</div>
                    {[1, 2, 3, 4, 5].map(r => <div key={r}>ห้อง {r}</div>)}
                  </div>
                  {["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"].map((grade) => (
                    <div key={grade} className="grid grid-cols-6 gap-2 items-center py-1">
                      <div className="text-left font-semibold text-slate-700 text-sm">{grade}</div>
                      {[1, 2, 3, 4, 5].map(room => {
                        const roomKey = `${grade}/${room}`;
                        const isChecked = allowedClassrooms.has(roomKey);
                        return (
                          <div key={room} className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleClassroom(roomKey)}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  ℹ️ ติ๊กเลือกห้องเรียนที่ต้องการให้สมัครได้ (ค่าเริ่มต้นจะถูกเลือกตามระดับชั้นที่เลือกด้านบน)
                </p>
              </div>
            </div>
          </Card>
          {/* Submit Buttons - Fixed Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
            <div className="container mx-auto max-w-4xl flex gap-4 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1 h-10"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 h-10 bg-primary shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-1" />
                    บันทึกการแก้ไข
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>แจ้งเตือน</AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setAlertOpen(false);
              if (alertMessage === "อัปเดตโครงการเรียบร้อย!") {
                router.push("/admin/projects");
              }
            }}>ตกลง</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
