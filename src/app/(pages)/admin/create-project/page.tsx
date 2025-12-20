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
import { Loader2, Plus, Trash2, Upload, FileText, Image as ImageIcon, X, CheckCircle } from "lucide-react";

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
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [tempQual, setTempQual] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tempDocName, setTempDocName] = useState("");
  const [tempDocFile, setTempDocFile] = useState<File | null>(null);

  // --- 5. ค่าใช้จ่าย ---
  const [costAmount, setCostAmount] = useState("0");
  const [costIncluded, setCostIncluded] = useState<string[]>([]);
  const [costExcluded, setCostExcluded] = useState<string[]>([]);
  const [tempCostInput, setTempCostInput] = useState("");
  const [costType, setCostType] = useState<"inc" | "exc">("inc");


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
    if (!tempQual.trim()) return;
    setQualifications([...qualifications, tempQual]);
    setTempQual("");
  };

  const handleAddDocument = () => {
    if (!tempDocName.trim()) return alert("กรุณาระบุชื่อเอกสาร");
    const newDoc = { id: Date.now().toString(), name: tempDocName, file: tempDocFile };
    setDocuments([...documents, newDoc]);
    setTempDocName("");
    setTempDocFile(null);
    const fileInput = document.getElementById("template-upload") as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  };

  const handleAddCost = () => {
    if (!tempCostInput.trim()) return;
    if (costType === "inc") setCostIncluded([...costIncluded, tempCostInput]);
    else setCostExcluded([...costExcluded, tempCostInput]);
    setTempCostInput("");
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!title || !startDate || !closeDate) {
        alert("กรุณากรอกข้อมูลสำคัญให้ครบ (ชื่อ, วันที่)");
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
        createdAt: Timestamp.now()
      });

      alert("สร้างโครงการสำเร็จ!");
      router.push("/admin/projects");

    } catch (err: any) {
      console.error("Error creating project:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-32 md:pb-24">
      <h1 className="text-2xl font-bold mb-6 text-primary">สร้างโครงการใหม่</h1>

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
                <div className="space-y-1"><Label>วันที่เดินทางไป</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div className="space-y-1"><Label>วันที่เดินทางกลับ</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                <div className="space-y-1"><Label>วันปิดรับสมัคร</Label><Input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} /></div>
             </div>
        </Card>

        {/* 3. สถานที่ในโปรแกรม */}
        <Card className="p-4 space-y-4 shadow-sm">
             <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                <span className="bg-slate-100 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                สถานที่ในโปรแกรม
             </h3>
             <div className="space-y-2">
                <Label className="text-slate-500 text-sm">ระบุสถานที่สำคัญที่จะพาไป (สามารถเพิ่มได้หลายจุด)</Label>
                {locations.map((loc, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="flex items-center justify-center w-8 bg-slate-100 text-slate-500 rounded font-bold text-sm">{i+1}</span>
                        <Input value={loc} onChange={e => handleUpdateLocation(i, e.target.value)} placeholder={`ชื่อสถานที่...`} />
                        {locations.length > 1 && <Button variant="ghost" onClick={() => handleRemoveLocation(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>}
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddLocation} className="mt-2 text-slate-600 border-slate-200 hover:bg-slate-50"><Plus className="w-4 h-4 mr-2"/> เพิ่มสถานที่</Button>
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
                <Label className="font-bold flex items-center gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4" /> คุณสมบัติผู้สมัคร
                </Label>
                <div className="flex gap-2">
                    <Input value={tempQual} onChange={e => setTempQual(e.target.value)} placeholder="เช่น เกรดเฉลี่ย 2.50 ขึ้นไป" />
                    <Button onClick={handleAddQual} variant="secondary">เพิ่ม</Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {qualifications.map((q, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border shadow-sm">
                            <span>• {q}</span>
                            <button onClick={() => setQualifications(qualifications.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600"><X className="w-3 h-3"/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t my-2"></div>

            {/* เอกสารที่ใช้สมัคร */}
            <div className="space-y-3">
                <Label className="font-bold flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4" /> เอกสารที่ใช้สมัคร
                </Label>
                <div className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-3 rounded border">
                    <div className="flex-1 w-full space-y-1">
                        <Label className="text-xs text-slate-500">ชื่อเอกสาร</Label>
                        <Input value={tempDocName} onChange={e => setTempDocName(e.target.value)} placeholder="เช่น Transcript, ใบรับรอง" />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                        <Label className="text-xs text-slate-500">ไฟล์ Template (ถ้ามี)</Label>
                        <Input id="template-upload" type="file" accept=".pdf,.doc,.docx" onChange={e => setTempDocFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button onClick={handleAddDocument}><Plus className="w-4 h-4 mr-1"/> เพิ่ม</Button>
                </div>

                <div className="space-y-2">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-3 border rounded bg-white hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded text-slate-600"><FileText className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-medium text-sm">{doc.name}</p>
                                    {doc.file ? <p className="text-[10px] text-green-600 flex items-center gap-1"><Upload className="w-3 h-3"/> {doc.file.name}</p> : <p className="text-[10px] text-slate-400">ผู้สมัครจัดเตรียมเอง</p>}
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></Button>
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

           <div className="pt-4 space-y-3">
              <Label>เพิ่มรายการค่าใช้จ่าย</Label>
              <div className="flex gap-2">
                 <Select value={costType} onValueChange={(v: any) => setCostType(v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="inc">สิ่งที่รวม</SelectItem>
                       <SelectItem value="exc">สิ่งที่ไม่รวม</SelectItem>
                    </SelectContent>
                 </Select>
                 <Input value={tempCostInput} onChange={e => setTempCostInput(e.target.value)} placeholder="รายละเอียดค่าใช้จ่าย..." onKeyDown={(e) => e.key === 'Enter' && handleAddCost()} />
                 <Button onClick={handleAddCost}><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                 <div className="space-y-2">
                    <Label className="text-xs text-green-700 font-bold">สิ่งที่รวมในราคานี้ (Included)</Label>
                    {costIncluded.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-sm bg-green-50 text-green-900 border border-green-200 p-2 rounded">
                          <span>{item}</span>
                          <button onClick={() => setCostIncluded(costIncluded.filter((_, idx) => idx !== i))} className="text-green-600 hover:text-green-800"><X className="w-3 h-3"/></button>
                       </div>
                    ))}
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs text-red-700 font-bold">สิ่งที่ไม่รวม (Excluded)</Label>
                    {costExcluded.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-sm bg-red-50 text-red-900 border border-red-200 p-2 rounded">
                          <span>{item}</span>
                          <button onClick={() => setCostExcluded(costExcluded.filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-800"><X className="w-3 h-3"/></button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </Card>

        {/* ✅ Mobile Floating Bar (เปลี่ยนปุ่มเป็น ยกเลิก / สร้างโครงการ) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3 md:relative md:border-0 md:bg-transparent md:p-0 md:pb-20 z-40">
           <Button variant="outline" className="flex-1 md:flex-none md:w-40" size="lg" onClick={() => router.back()}>
               ยกเลิก
           </Button>
           <Button onClick={handleSubmit} disabled={loading} size="lg" className="flex-1 md:flex-none md:w-48 bg-primary shadow-lg hover:shadow-xl transition-all">
               {loading && <Loader2 className="animate-spin mr-2"/>} 
               สร้างโครงการ
           </Button>
        </div>
      </div>
    </div>
  );
}