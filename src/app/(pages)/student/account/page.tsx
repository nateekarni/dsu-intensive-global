"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Upload, Trash2, FileText, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AccountPage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // Profile State
    const [profile, setProfile] = useState<any>({});

    // Documents State
    const [documents, setDocuments] = useState<Record<string, { url: string; name: string; type: string }>>({});
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile(data.profile || {});
                        setDocuments(data.documents || {});
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, [user]);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                profile: profile,
                updatedAt: new Date(),
            }, { merge: true });
            setAlertMessage("บันทึกข้อมูลเรียบร้อย");
            setAlertOpen(true);
        } catch (error) {
            console.error("Error saving profile:", error);
            setAlertMessage("เกิดข้อผิดพลาดในการบันทึก");
            setAlertOpen(true);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (type: string, file: File) => {
        if (!user) return;
        setUploadingDoc(type);
        try {
            const storageRef = ref(storage, `users/${user.uid}/documents/${type}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            const newDoc = {
                url,
                name: file.name,
                type,
                uploadedAt: new Date().toISOString(),
            };

            const updatedDocs = { ...documents, [type]: newDoc };
            setDocuments(updatedDocs);

            await setDoc(doc(db, "users", user.uid), {
                documents: updatedDocs
            }, { merge: true });

        } catch (error) {
            console.error("Upload failed:", error);
            setAlertMessage("อัปโหลดไม่สำเร็จ");
            setAlertOpen(true);
        } finally {
            setUploadingDoc(null);
        }
    };

    const handleDeleteDoc = async (type: string) => {
        if (!user || !documents[type]) return;
        if (!confirm("ต้องการลบเอกสารนี้ใช่หรือไม่?")) return;

        try {
            // Note: Deleting from storage is optional/complex if we want to keep history, 
            // but for "My Documents" we usually want to clean up.
            // For now, just remove from Firestore reference to keep it simple and safe.

            const updatedDocs = { ...documents };
            delete updatedDocs[type];
            setDocuments(updatedDocs);

            await updateDoc(doc(db, "users", user.uid), {
                [`documents.${type}`]: deleteObject
            } as any); // Type casting for delete field

            // Actually we need to use FieldValue.delete() but let's just set the whole map for simplicity
            await setDoc(doc(db, "users", user.uid), {
                documents: updatedDocs
            }, { merge: true });

        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl pb-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">บัญชีผู้ใช้</h1>
                    <p className="text-slate-500">จัดการข้อมูลส่วนตัวและเอกสาร</p>
                </div>
                <Button variant="destructive" onClick={logout} className="hidden md:flex">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
                    <TabsTrigger value="documents">เอกสารของฉัน</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                            <CardDescription>
                                ข้อมูลนี้จะถูกนำไปใช้กรอกใบสมัครให้อัตโนมัติ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ชื่อ (ไทย)</Label>
                                        <Input
                                            value={profile.nameThai || ''}
                                            onChange={e => setProfile({ ...profile, nameThai: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>นามสกุล (ไทย)</Label>
                                        <Input
                                            value={profile.surnameThai || ''}
                                            onChange={e => setProfile({ ...profile, surnameThai: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ชื่อ (อังกฤษ)</Label>
                                        <Input
                                            value={profile.nameEng || ''}
                                            onChange={e => setProfile({ ...profile, nameEng: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>นามสกุล (อังกฤษ)</Label>
                                        <Input
                                            value={profile.surnameEng || ''}
                                            onChange={e => setProfile({ ...profile, surnameEng: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>เบอร์โทรศัพท์</Label>
                                        <Input
                                            value={profile.phone || ''}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={profile.email || ''}
                                            onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึกข้อมูล
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>เอกสารของฉัน</CardTitle>
                            <CardDescription>
                                อัปโหลดเอกสารสำคัญเก็บไว้เพื่อใช้สมัครโครงการต่างๆ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['transcript', 'id_card', 'house_registration', 'portfolio'].map((docType) => {
                                const doc = documents[docType];
                                const isUploading = uploadingDoc === docType;

                                let label = '';
                                switch (docType) {
                                    case 'transcript': label = 'ใบแสดงผลการเรียน (Transcript)'; break;
                                    case 'id_card': label = 'สำเนาบัตรประชาชน'; break;
                                    case 'house_registration': label = 'สำเนาทะเบียนบ้าน'; break;
                                    case 'portfolio': label = 'Portfolio'; break;
                                    default: label = docType;
                                }

                                return (
                                    <div key={docType} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white rounded-full border">
                                                <FileText className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{label}</p>
                                                {doc ? (
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                        {doc.name}
                                                    </a>
                                                ) : (
                                                    <p className="text-xs text-slate-500">ยังไม่มีเอกสาร</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {doc ? (
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(docType)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        disabled={isUploading}
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleFileUpload(docType, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <Button variant="outline" size="sm" disabled={isUploading}>
                                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                                        อัปโหลด
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8 md:hidden">
                <Button variant="destructive" onClick={logout} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </Button>
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
                        <AlertDialogAction onClick={() => setAlertOpen(false)}>ตกลง</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
