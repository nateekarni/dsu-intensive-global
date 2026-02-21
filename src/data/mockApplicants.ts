// ============================================================
// Mock Applicants Data
// ============================================================

export type DocumentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'cash' | 'transfer' | null

export interface DocumentUpload {
  documentId: string // references DocumentReq.id
  documentName: string
  uploadedAt: string // ISO date string
  fileUrl: string
  status: DocumentStatus
  reviewedAt?: string
  reviewNote?: string
}

export interface Applicant {
  id: string
  projectId: string
  student: {
    id: string
    // Name (Thai)
    prefixTh: string // นาย / นางสาว / เด็กชาย / เด็กหญิง
    firstNameTh: string
    lastNameTh: string
    // Name (English)
    prefixEn: string // Mr. / Miss / Master
    firstNameEn: string
    lastNameEn: string
    // Bio
    birthDate: string // ISO date (YYYY-MM-DD)
    weight: number // kg
    height: number // cm
    // IDs
    nationalId: string
    passportNumber?: string
    // Contact
    phone: string
    email?: string
    lineId?: string
    // Academic
    grade: number // ม.grade, e.g. 4, 5, 6
    room: number // e.g. 1, 2, 3
    gpa?: number
    // Health
    allergies?: string
    medicalConditions?: string
    // Parent
    parentName: string
    parentPhone: string
  }
  appliedAt: string
  documents: DocumentUpload[]
  payment: {
    method: PaymentMethod
    paidAt?: string
    amount?: number
    note?: string
    slipUrl?: string
  }
  interview?: {
    score?: number // 0-100
    maxScore?: number // default 100
    result?: 'passed' | 'failed' | 'pending'
    interviewDate?: string
    notes?: string
  }
}

export const mockApplicants: Applicant[] = [
  {
    id: 'app-001',
    projectId: 'prog-001',
    student: {
      id: 'stu-001',
      prefixTh: 'นาย',
      firstNameTh: 'ณัฐวงศ์',
      lastNameTh: 'สิทธิ์มงคล',
      prefixEn: 'Mr.',
      firstNameEn: 'Nathawong',
      lastNameEn: 'Sittimongkol',
      birthDate: '2009-03-15',
      weight: 65,
      height: 172,
      nationalId: '1-1020-12345-67-8',
      passportNumber: 'AA123456',
      phone: '081-234-5678',
      email: 'nathawong@student.dsu.ac.th',
      lineId: 'nath_wx',
      grade: 10,
      room: 1,
      gpa: 3.75,
      allergies: 'ไม่มี',
      medicalConditions: 'ไม่มี',
      parentName: 'นางสุมาลี สิทธิ์มงคล',
      parentPhone: '089-876-5432',
    },
    appliedAt: '2025-09-01T09:15:00Z',
    documents: [
      {
        documentId: 'doc-a',
        documentName: 'สำเนาพาสปอร์ต',
        uploadedAt: '2025-09-01T09:20:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
        status: 'approved',
        reviewedAt: '2025-09-02T10:00:00Z',
      },
      {
        documentId: 'doc-b',
        documentName: 'หนังสือยินยอมผู้ปกครอง',
        uploadedAt: '2025-09-01T09:25:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80',
        status: 'approved',
        reviewedAt: '2025-09-02T10:05:00Z',
      },
    ],
    payment: { method: 'cash', paidAt: '2025-09-03T11:00:00Z', amount: 150000 },
    interview: {
      score: 88,
      maxScore: 100,
      result: 'passed',
      interviewDate: '2025-09-05T09:00:00Z',
      notes: 'สื่อสารดี มีความตั้งใจชัดเจน',
    },
  },
  {
    id: 'app-002',
    projectId: 'prog-001',
    student: {
      id: 'stu-002',
      prefixTh: 'นางสาว',
      firstNameTh: 'พิมพ์ลดา',
      lastNameTh: 'ทองดี',
      prefixEn: 'Miss',
      firstNameEn: 'Pimlada',
      lastNameEn: 'Thongdee',
      birthDate: '2008-07-22',
      weight: 52,
      height: 163,
      nationalId: '1-2030-23456-78-9',
      passportNumber: 'BB234567',
      phone: '082-345-6789',
      email: 'pimlada@student.dsu.ac.th',
      lineId: 'pimlada_td',
      grade: 11,
      room: 3,
      gpa: 3.42,
      allergies: 'แพ้อาหารทะเล',
      medicalConditions: 'ไม่มี',
      parentName: 'นายวิชัย ทองดี',
      parentPhone: '086-543-2109',
    },
    appliedAt: '2025-09-01T10:05:00Z',
    documents: [
      {
        documentId: 'doc-a',
        documentName: 'สำเนาพาสปอร์ต',
        uploadedAt: '2025-09-01T10:10:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
        status: 'approved',
        reviewedAt: '2025-09-02T14:00:00Z',
      },
      {
        documentId: 'doc-b',
        documentName: 'หนังสือยินยอมผู้ปกครอง',
        uploadedAt: '2025-09-01T10:15:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
        status: 'rejected',
        reviewedAt: '2025-09-02T14:10:00Z',
        reviewNote: 'ลายเซ็นผู้ปกครองไม่ครบ กรุณาอัปโหลดใหม่',
      },
    ],
    payment: { method: null },
    interview: {
      score: 45,
      maxScore: 100,
      result: 'failed',
      interviewDate: '2025-09-05T10:00:00Z',
      notes: 'ตอบคำถามไม่ตรงประเด็น ควรเตรียมตัวเพิ่มเติม',
    },
  },
  {
    id: 'app-003',
    projectId: 'prog-001',
    student: {
      id: 'stu-003',
      prefixTh: 'นาย',
      firstNameTh: 'ภัทรพล',
      lastNameTh: 'ชัยวัฒน์',
      prefixEn: 'Mr.',
      firstNameEn: 'Phattaraphon',
      lastNameEn: 'Chaiwat',
      birthDate: '2007-11-05',
      weight: 70,
      height: 178,
      nationalId: '1-3040-34567-89-0',
      passportNumber: 'CC345678',
      phone: '083-456-7890',
      email: 'phattaphon@student.dsu.ac.th',
      lineId: 'phat_cw',
      grade: 12,
      room: 2,
      gpa: 3.1,
      allergies: 'ไม่มี',
      medicalConditions: 'เป็นโรคหืด ใช้ยาพ่น',
      parentName: 'นางสาววิภา ชัยวัฒน์',
      parentPhone: '085-432-1098',
    },
    appliedAt: '2025-09-02T08:30:00Z',
    documents: [],
    payment: { method: null },
  },
  {
    id: 'app-004',
    projectId: 'prog-001',
    student: {
      id: 'stu-004',
      prefixTh: 'นางสาว',
      firstNameTh: 'อภิญญา',
      lastNameTh: 'รัตนวงศ์',
      prefixEn: 'Miss',
      firstNameEn: 'Apinya',
      lastNameEn: 'Rattanawong',
      birthDate: '2009-01-18',
      weight: 49,
      height: 158,
      nationalId: '1-4050-45678-90-1',
      passportNumber: 'DD456789',
      phone: '084-567-8901',
      email: 'apinya@student.dsu.ac.th',
      lineId: 'apinya_rt',
      grade: 10,
      room: 2,
      gpa: 3.88,
      allergies: 'ไม่มี',
      medicalConditions: 'ไม่มี',
      parentName: 'นายอนันต์ รัตนวงศ์',
      parentPhone: '087-321-0987',
    },
    appliedAt: '2025-09-02T11:45:00Z',
    documents: [
      {
        documentId: 'doc-a',
        documentName: 'สำเนาพาสปอร์ต',
        uploadedAt: '2025-09-02T11:50:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
        status: 'pending',
      },
      {
        documentId: 'doc-b',
        documentName: 'หนังสือยินยอมผู้ปกครอง',
        uploadedAt: '2025-09-02T12:00:00Z',
        fileUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80',
        status: 'pending',
      },
    ],
    payment: {
      method: 'transfer',
      paidAt: '2025-09-03T09:30:00Z',
      amount: 150000,
      slipUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    },
    interview: { result: 'pending', interviewDate: '2025-09-10T09:00:00Z' },
  },
]

export const mockRequiredDocIds: Record<string, string[]> = {
  'prog-001': ['doc-a', 'doc-b'],
}

export function isComplete(applicantDocs: DocumentUpload[], requiredDocIds: string[]): boolean {
  return requiredDocIds.every((id) =>
    applicantDocs.some((d) => d.documentId === id && d.status === 'approved'),
  )
}
