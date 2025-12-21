"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Upload, FileText, Image as ImageIcon, X, ArrowLeft, CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

interface DocumentItem {
  id: string;
  name: string;
  file: File | null;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- 1. ข้อมูลพื้นฐาน ---
  const [title, setTitle] = useState("");
  const [displayLocation, setDisplayLocation] = useState(""); // ✅ เพิ่มสถานที่สำหรับแสดงบนการ์ด
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  
  // --- 2. ช่วงเวลา ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [closeDate, setCloseDate] = useState("");

  // --- 3. สถานที่ในโปรแกรม (Locations) ---
  const [locations, setLocations] = useState<string[]>([""]);

  // --- 4. รูปแบบการสมัคร ---
  const [recruitmentType, setRecruitmentType] = useState("fcfs");
  const [capacity, setCapacity] = useState("30");
  const [qualifications, setQualifications] = useState<string[]>([
    "นักเรียนชั้นมัธยมศึกษาปีที่ 4-6 ห้องเรียนพิเศษ",
    "เกรดเฉลี่ยสะสม 2.75 ขึ้นไป",
    "สุขภาพแข็งแรง ไม่มีโรคติดต่อ"
  ]);
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "1", name: "สำเนาหนังสือเดินทาง (Passport)", file: null },
    { id: "2", name: "หนังสือยินยอมจากผู้ปกครอง", file: null },
    { id: "3", name: "ใบแสดงผลการเรียน (Transcript)", file: null }
  ]);

  // --- 5. ค่าใช้จ่าย ---
  const [costAmount, setCostAmount] = useState("0");
  const [costIncluded, setCostIncluded] = useState<string[]>([
    "ค่าตั๋วเครื่องบินไป-กลับ",
    "ค่าที่พัก และอาหาร 3 มื้อ"
  ]);
  const [costExcluded, setCostExcluded] = useState<string[]>([
    "ค่าทำหนังสือเดินทาง (Passport)",
    "ค่าใช้จ่ายส่วนตัว"
  ]);

  // --- 6. กำหนดการ (Agenda) ---
  const [agenda, setAgenda] = useState<{ day: number; title: string; description: string }[]>([
    { day: 1, title: "", description: "" },
    { day: 2, title: "", description: "" },
    { day: 3, title: "", description: "" }
  ]);

  // --- 7. การตั้งค่าข้อมูลการศึกษา (สำหรับฟอร์มสมัคร) ---
  const [gradeScope, setGradeScope] = useState<"all" | "lower" | "upper">("all");
  const [classroomCount, setClassroomCount] = useState("3");
  const [studyPlanOptionsText, setStudyPlanOptionsText] = useState("วิทย์-คณิต, ศิลป์-ภาษา");

  // Alert Dialog State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAction, setAlertAction] = useState<(() => void) | null>(null);

  const showAlert = (title: string, message: string, action?: () => void) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertAction(() => action);
    setAlertOpen(true);
  };


  // --- HANDLERS ---
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const originalFile = e.target.files[0];
      
      try {
        // ตั้งค่า compression
        const options = {
          maxSizeMB: 1, // ขนาดไฟล์สูงสุดไม่เกิน 1MB
          maxWidthOrHeight: 1920, // ความกว้าง/สูงสูงสุดไม่เกิน 1920px
          useWebWorker: true,
          fileType: 'image/jpeg' as const // แปลงเป็น JPEG เพื่อลดขนาด
        };
        
        // Compress รูป
        const compressedFile = await imageCompression(originalFile, options);
        
        console.log(`ขนาดต้นฉบับ: ${(originalFile.size / 1024 / 1024).toFixed(2)}MB`);
        console.log(`ขนาดหลัง compress: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
        setCoverFile(compressedFile);
        setCoverPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการ compress รูป:', error);
        // ถ้า compress ไม่ได้ ใช้ไฟล์ต้นฉบับแทน
        setCoverFile(originalFile);
        setCoverPreview(URL.createObjectURL(originalFile));
      }
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
    const newDoc = { id: Date.now().toString(), name: "", file: null };
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
    // Re-number days after removal
    const renumbered = newAgenda.map((item, idx) => ({ ...item, day: idx + 1 }));
    setAgenda(renumbered);
  };

  const handleUpdateAgenda = (index: number, field: 'title' | 'description', value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index][field] = value;
    setAgenda(newAgenda);
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!title || !startDate || !closeDate) {
        showAlert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลสำคัญให้ครบ (ชื่อ, วันที่)");
        return;
    }
    setLoading(true);

    try {
      // 1. Upload Cover
      let coverUrl = "";
      if (coverFile) {
        const ext = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `cover_${Date.now()}.${ext}`;
        const storageRef = ref(storage, `projects/covers/${newFileName}`);
        const metadata = { contentType: coverFile.type || 'image/jpeg' };
        const snap = await uploadBytes(storageRef, coverFile, metadata);
        coverUrl = await getDownloadURL(snap.ref);
      }

      // 2. Upload Templates (แก้ตรงนี้!)
      const finalDocuments = await Promise.all(documents.map(async (doc) => {
        let templateUrl = null; // ✅ ตั้งค่าเริ่มต้นเป็น null (อย่าใช้ undefined)
        
        if (doc.file) {
          const ext = doc.file.name.split('.').pop()?.toLowerCase() || 'dat';
          const newFileName = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
          const storageRef = ref(storage, `projects/templates/${newFileName}`);
          const metadata = { contentType: doc.file.type };
          const snap = await uploadBytes(storageRef, doc.file, metadata);
          templateUrl = await getDownloadURL(snap.ref);
        }
        
        return { 
          name: doc.name, 
          templateUrl: templateUrl // ✅ ส่งค่า null ถ้าไม่มีไฟล์ (Firestore รับได้)
        };
      }));

      // 3. Save to Firestore
      await addDoc(collection(db, "projects"), {
        title,
        displayLocation: displayLocation || "", // ✅ กันไว้เผื่อเป็น undefined ให้ใส่ string ว่างแทน
        description: description || "",
        coverImage: coverUrl,
        status: "open",
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        closeDate: Timestamp.fromDate(new Date(closeDate)),
        
        locations: locations.filter(l => l.trim() !== ""),
        
        recruitmentType,
        capacity: parseInt(capacity) || 0, // ✅ กันพลาดแปลงเลขไม่ได้
        qualifications: qualifications || [],
        documents: finalDocuments,

        costs: {
          amount: parseInt(costAmount) || 0,
          included: costIncluded || [],
          excluded: costExcluded || []
        },
        agenda: agenda.length > 0 ? agenda : undefined,

        // การตั้งค่าฟอร์มสมัคร (ข้อมูลการศึกษาแบบ Dynamic)
        formConfig: {
          personalInfoFields: [],
          customQuestions: [],
          consents: [],
          gradeScope,
          gradeLevelOptions:
            gradeScope === "lower"
              ? ["ม.1", "ม.2", "ม.3"]
              : gradeScope === "upper"
              ? ["ม.4", "ม.5", "ม.6"]
              : ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"],
          classroomOptions: Array.from(
            { length: Math.max(parseInt(classroomCount) || 0, 0) },
            (_, idx) => `${idx + 1}`
          ),
          studyPlanOptions: studyPlanOptionsText
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        },
        createdAt: Timestamp.now()
      });

      showAlert("สำเร็จ", "สร้างโครงการสำเร็จ!", () => {
        router.push("/admin/projects");
      });

    } catch (err: any) {
      console.error("Error creating project:", err);
      showAlert("เกิดข้อผิดพลาด", err.message || "ไม่สามารถสร้างโครงการได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="max-w-4xl mx-auto pb-20 md:pb-8">
        <div className="relative flex items-center justify-center mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="absolute left-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
          </Button>
          <h1 className="text-2xl font-bold text-primary">เพิ่มโครงการ</h1>
        </div>

        <div className="space-y-6">
        
        {/* 1. ข้อมูลพื้นฐาน */}
        {/* ✅ ปรับ Padding เป็น p-4 */}
        <Card className="p-4 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
            <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            ข้อมูลพื้นฐาน
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-2">
              <Label>รูปปกโครงการ</Label>
              <div className="border-2 border-dashed rounded-lg aspect-video flex items-center justify-center bg-slate-50 relative overflow-hidden group hover:border-slate-400 transition-colors">
                {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto mb-1"/><span>อัปโหลดรูป</span></div>}
                <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="space-y-1"><Label>ชื่อโครงการ</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น Summer Camp 2025..." /></div>
              
              {/* ✅ เพิ่มช่องกรอกสถานที่สำหรับแสดงบนการ์ด */}
              <div className="space-y-1"><Label>สถานที่ (แสดงบนการ์ด)</Label><Input value={displayLocation} onChange={e => setDisplayLocation(e.target.value)} placeholder="เช่น Tokyo, Japan" /></div>
              
              <div className="space-y-1"><Label>รายละเอียด</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} className="h-24" placeholder="รายละเอียดไฮไลท์..." /></div>
            </div>
          </div>
        </Card>

        {/* 2. ช่วงเวลา */}
        <Card className="p-4 space-y-4 shadow-sm">
             <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                ช่วงเวลา (Duration)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>วันที่เดินทางไป</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {startDate ? format(new Date(startDate), "PPP", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>วันที่เดินทางกลับ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {endDate ? format(new Date(endDate), "PPP", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>วันปิดรับสมัคร</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !closeDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {closeDate ? format(new Date(closeDate), "PPP", { locale: th }) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={closeDate ? new Date(closeDate) : undefined}
                        onSelect={(date) => setCloseDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
             </div>
        </Card>

        {/* 3. สถานที่ในโปรแกรม */}
        <Card className="p-4 space-y-4 shadow-sm">
             <div className="flex items-center justify-between border-b pb-2">
               <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  สถานที่ในโปรแกรม
               </h3>
               <Button type="button" variant="outline" size="sm" onClick={handleAddLocation} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                 <Plus className="w-4 h-4 mr-1"/> เพิ่ม
               </Button>
             </div>
             <div className="space-y-2">
                <Label className="text-slate-500 text-sm">ระบุสถานที่สำคัญที่จะพาไป (สามารถเพิ่มได้หลายจุด)</Label>
                {locations.map((loc, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <Input value={loc} onChange={e => handleUpdateLocation(i, e.target.value)} placeholder="ชื่อสถานที่..." className="flex-1" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLocation(i)}>
                          <Trash2 className="w-4 h-4 text-red-500"/>
                        </Button>
                    </div>
                ))}
             </div>
        </Card>

        {/* 4. รูปแบบการสมัคร */}
        <Card className="p-4 space-y-6 shadow-sm">
            <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                รูปแบบการสมัคร
            </h3>
            
            {/* ✅ แยกบรรทัด ไม่ใช้ grid-cols-2 */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <Label>วิธีการคัดเลือก</Label>
                    <Select value={recruitmentType} onValueChange={setRecruitmentType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fcfs">มาก่อนได้ก่อน (First Come First Serve)</SelectItem>
                            <SelectItem value="selection">คัดเลือกตามคุณสมบัติ (Selection)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>จำนวนที่รับ (คน)</Label>
                    <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />
                </div>
            </div>

            {/* คุณสมบัติผู้สมัคร */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700">
                      คุณสมบัติผู้สมัคร
                  </Label>
                  <Button type="button" onClick={handleAddQual} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1"/> เพิ่ม
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
                    <Plus className="w-4 h-4 mr-1"/> เพิ่ม
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
                                  {doc.file ? doc.file.name : 'ไม่มีไฟล์ที่เลือก'}
                                </span>
                              </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

        {/* 5. ค่าใช้จ่าย */}
        <Card className="p-4 space-y-4 shadow-sm">
           <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                ค่าใช้จ่าย
           </h3>
           
           {/* ✅ เอา Card ย่อยออก ให้เนื้อหามาอยู่ตรงนี้เลย */}
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
                  <p>ยังไม่มีกำหนดการ</p>
                  <p className="text-sm">กดปุ่ม "เพิ่มวัน" เพื่อเพิ่มกำหนดการ</p>
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
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="gradeScope"
                    value="all"
                    checked={gradeScope === "all"}
                    onChange={() => setGradeScope("all")}
                  />
                  <span>ทุกชั้นปี (ม.1-ม.6)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="gradeScope"
                    value="lower"
                    checked={gradeScope === "lower"}
                    onChange={() => setGradeScope("lower")}
                  />
                  <span>เฉพาะ ม.ต้น (ม.1-ม.3)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="gradeScope"
                    value="upper"
                    checked={gradeScope === "upper"}
                    onChange={() => setGradeScope("upper")}
                  />
                  <span>เฉพาะ ม.ปลาย (ม.4-ม.6)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>จำนวนห้องเรียนที่เปิดรับ</Label>
                <Input
                  type="number"
                  min={0}
                  value={classroomCount}
                  onChange={(e) => setClassroomCount(e.target.value)}
                  placeholder="เช่น 3 จะได้ห้อง 1, 2, 3"
                />
              </div>
              <div className="space-y-1">
                <Label>แผนการเรียนที่ให้เลือก</Label>
                <Input
                  value={studyPlanOptionsText}
                  onChange={(e) => setStudyPlanOptionsText(e.target.value)}
                  placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น วิทย์-คณิต, ศิลป์-ภาษา"
                />
                <p className="text-xs text-slate-400 mt-1">
                  ระบบจะแปลงเป็นตัวเลือกในฟอร์มสมัครอัตโนมัติ
                </p>
              </div>
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
              disabled={loading}
              className="flex-1 h-10"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-10 bg-primary shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>                
                  เพิ่มโครงการ
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ปิด</AlertDialogCancel>
            {alertAction && (
              <AlertDialogAction onClick={() => {
                alertAction();
                setAlertOpen(false);
              }}>
                ยืนยัน
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}