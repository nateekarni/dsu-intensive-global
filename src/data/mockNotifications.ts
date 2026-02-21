import { Applicant } from './mockApplicants'
import { Program } from './mockPrograms'

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'message'

export interface SiteNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string // ISO string
  link?: string // Optional internal link
}

// ==========================================
// 🧑‍🎓 Mock Student Notifications
// ==========================================
export const mockStudentNotifications: SiteNotification[] = [
  {
    id: 'n-stu-1',
    title: 'ผ่านการคัดเลือก!',
    message: 'ยินดีด้วย คุณผ่านการคัดเลือกโครงการ DSU Tech Camp 2024 กรุณาคลิกเพื่อชำระเงิน',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    link: '/student/applications/app-001',
  },
  {
    id: 'n-stu-2',
    title: 'แจ้งเตือนวันสัมภาษณ์',
    message: 'คุณมีนัดสัมภาษณ์โครงการ Global Exchange Program พรุ่งนี้เวลา 10:00 น. ผ่าน Zoom',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    link: '/student/applications/app-002',
  },
  {
    id: 'n-stu-3',
    title: 'แก้ไขเอกสารด่วน',
    message: 'สำเนาบัตรประชาชนของคุณไม่ชัดเจน กรุณาอัปโหลดใหม่สำหรับโครงการ DSU Tech Camp 2024',
    type: 'error',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    link: '/student/applications/app-001',
  },
  {
    id: 'n-stu-4',
    title: 'โครงการใหม่เปิดรับสมัคร!',
    message: 'โครงการแลกเปลี่ยนฤดูร้อนที่ประเทศญี่ปุ่นเปิดรับสมัครแล้ววันนี้',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    link: '/programs',
  },
]

// ==========================================
// 👨‍💼 Mock Admin Notifications
// ==========================================
export const mockAdminNotifications: SiteNotification[] = [
  {
    id: 'n-adm-1',
    title: 'เอกสารใหม่รอตรวจสอบ',
    message: 'นักเรียน สมชาย ใจดี อัปโหลดเอกสารใบรับรองแพทย์ใหม่ กรุณาตรวจสอบ',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    link: '/admin/students/stu-001',
  },
  {
    id: 'n-adm-2',
    title: 'แนบสลิปชำระเงินสำเร็จ',
    message: 'ผู้สมัคร app-001 แนบหลักฐานการชำระเงินค่าโครงการแล้ว',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    link: '/admin/applications/app-001',
  },
  {
    id: 'n-adm-3',
    title: 'โครงการมีผู้สมัครเต็มจำนวน',
    message: 'โครงการ Global Exchange Program มีผู้สมัครเต็มจำนวน 50 คนแล้ว',
    type: 'warning',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    link: '/admin/projects/proj-002',
  },
  {
    id: 'n-adm-4',
    title: 'สรุปยอดผู้สมัครประจำวัน',
    message: 'วันนี้มีผู้ส่งใบสมัครใหม่ทั้งหมด 12 รายการ',
    type: 'message',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hrs ago
    link: '/admin/dashboard',
  },
]
