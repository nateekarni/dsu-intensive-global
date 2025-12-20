// src/types/index.ts
import { Timestamp } from "firebase/firestore";

// 1. ข้อมูลผู้ใช้งาน (นักเรียน/แอดมิน)
export interface UserProfile {
  uid: string;
  role: 'student' | 'admin';
  email: string;
  profile?: {
    // ข้อมูลส่วนตัว
    prefixThai: string;
    nameThai: string;
    surnameThai: string;
    nameEng: string;
    surnameEng: string;
    birthDate: string;
    citizenId: string;
    passportNo: string;
    passportExpiry: string;
    passportUrl: string;
    
    // ข้อมูลสุขภาพ
    weight?: number;
    height?: number;
    bloodType?: string;
    diseases?: string;
    allergies?: string;

    // การเรียน
    studentId?: string;
    gradeLevel?: string;
    studyPlan?: string;
    gpa?: number;

    // การติดต่อ
    phone?: string;
    parentPhone?: string;
    lineId?: string;
  };
  createdAt: Timestamp;
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

  // การตั้งค่า Dynamic Form
  formConfig: {
    personalInfoFields: string[]; // field ไหนบ้างที่ต้องกรอก
    customQuestions: {
      id: string;
      question: string;
      type: 'text' | 'choice';
    }[];
    consents: string[];
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