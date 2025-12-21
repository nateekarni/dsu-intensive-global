// src/types/index.ts
import { Timestamp } from "firebase/firestore";

// 1. ข้อมูลผู้ใช้งาน (นักเรียน/แอดมิน)
export interface UserProfile {
  uid: string;
  role: 'student' | 'admin';
  email: string;
  profile?: {
    // ข้อมูลส่วนตัว
    prefixThai: string; // เด็กชาย, เด็กหญิง, นาย, นางสาว
    prefixEng: string; // Miss, Master, Mr.
    nameThai: string;
    nameEng: string;
    surnameThai: string;
    surnameEng: string;
    birthDate: string; // วันเดือนปีเกิด
    citizenId: string;
    passportNo: string;
    passportExpiry?: string;
    passportUrl?: string;
    
    // ข้อมูลสุขภาพ
    weight?: number;
    height?: number;
    bloodType?: string;
    diseases?: string; // โรคประจำตัว
    allergies?: string; // ข้อมูลการแพ้อาหาร

    // การเรียน
    studentId?: string; // รหัสนักเรียน
    gradeLevel?: string; // ระดับชั้นการเรียน
    classroom?: string; // ห้องเรียน (เช่น ม.4/1)
    studyPlan?: string; // แผนการเรียน
    gpa?: number; // เกรดเฉลี่ย

    // การติดต่อ
    phone?: string; // เบอร์โทรศัพท์ (นักเรียน)
    parentPhone?: string; // เบอร์โทรศัพท์ (ผู้ปกครอง)
    email?: string; // Email (ที่ติดต่อได้)
    lineId?: string; // LINE ID
  };
  createdAt: Timestamp;
}

// ข้อมูลฟอร์มกรอกข้อมูลส่วนตัวสำหรับการสมัคร
export interface PersonalInfoForm {
  // ข้อมูลส่วนตัว
  prefixThai: string;
  prefixEng: string;
  nameThai: string;
  nameEng: string;
  surnameThai: string;
  surnameEng: string;
  birthDate: string;
  weight: number;
  height: number;
  
  // เอกสาร
  studentId: string;
  citizenId: string;
  passportNo: string;
  
  // การติดต่อ
  phone: string;
  parentPhone: string;
  email: string;
  lineId: string;
  
  // สุขภาพ
  diseases: string;
  allergies: string;
  
  // การเรียน
  gradeLevel: string;
  classroom: string;
  studyPlan: string;
  gpa: number;
}

// ข้อมูลข้อตกลงและความยินยอม
export interface ConsentForm {
  agreeFlightCost: boolean; // ข้าพเจ้ารับทราบว่า จะต้องรับผิดชอบค่าตั๋วเครื่องบินไป-กลับ
  agreeNoRefund: boolean; // ข้าพเจ้ารับทราบว่า หากผ่านการคัดเลือก จะไม่มีการคืนเงินในทุกกรณี
  agreeLimitedSeats: boolean; // ข้าพเจ้าทราบว่ามีจำนวนรับจำกัด 20 คน
  whyJoin: string; // ทำไมถึงสนใจเข้าร่วมกิจกรรมนี้
  howKnow: string; // ช่องทางที่รู้จักกิจกรรมนี้
}

// 2. ข้อมูลโครงการ
export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: 'open' | 'closed' | 'draft';
  
  // ช่วงเวลา
  startDate: Timestamp;
  endDate: Timestamp;
  closeDate: Timestamp;
  
  // สถานที่
  locations: string[];
  
  // รูปแบบการรับสมัคร
  recruitmentType: 'selection' | 'fcfs';
  capacity: number;
  qualifications: string[]; // ✅ เพิ่มตรงนี้ (คุณสมบัติผู้สมัคร)

  // ค่าใช้จ่าย
  costs: {
    amount: number;
    included: string[];
    excluded: string[];
  };

  // เอกสาร
  documents: {
    id: string;
    name: string;
    templateUrl?: string;
  }[];

  // กำหนดการ (Agenda)
  agenda?: {
    day: number;
    title: string;
    description: string;
  }[];

  // การตั้งค่า Dynamic Form
  formConfig: {
    personalInfoFields: string[]; // field ไหนบ้างที่ต้องกรอก
    customQuestions: {
      id: string;
      question: string;
      type: 'text' | 'choice';
    }[];
    consents: string[];

    // การตั้งค่าข้อมูลการศึกษาแบบ Dynamic สำหรับฟอร์มสมัคร
    gradeScope?: 'all' | 'lower' | 'upper'; // ทุกชั้นปี / ม.ต้น / ม.ปลาย
    gradeLevelOptions?: string[]; // รายการระดับชั้นที่ให้เลือก
    classroomOptions?: string[]; // ห้องเรียนที่ให้เลือก เช่น ["1","2","3"]
    studyPlanOptions?: string[]; // แผนการเรียนที่ให้เลือก
  };
}

// 3. ข้อมูลใบสมัคร
export interface Application {
  id: string;
  projectId: string;
  userId: string;
  
  personalData: any; // Snapshot ข้อมูลตอนสมัคร
  answers: { [key: string]: string }; // คำตอบเพิ่มเติม

  status: 'draft' | 'submitted' | 'checking' | 'approved' | 'rejected';
  
  payment: {
    method: 'transfer' | 'cash';
    status: 'pending' | 'verified' | 'failed';
    slipUrl?: string;
    amount: number;
    paidAt?: Timestamp;
  };

  uploadedDocuments: {
    [docId: string]: {
      url: string;
      status: 'pending' | 'passed' | 'failed';
      feedback?: string;
    };
  };

  groupName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}