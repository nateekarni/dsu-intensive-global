// ============================================================
// Mock Program Data — ready to swap with Payload CMS API
// ============================================================

export type ProgramStatus = 'open' | 'upcoming' | 'closed' | 'archived'
export type AdmissionType = 'first-come' | 'interview'
export type Continent =
  | 'เอเชีย'
  | 'ยุโรป'
  | 'อเมริกาเหนือ'
  | 'อเมริกาใต้'
  | 'โอเชียเนีย'
  | 'แอฟริกา'

export interface DocumentReq {
  id: string
  name: string
  isRequired: boolean
  templateUrl?: string
}

export interface Program {
  id: string
  title: string
  shortDescription: string
  description: string
  highlights: string[]
  requirements: string[]
  status: ProgramStatus
  admissionType: AdmissionType
  continent: Continent
  location: {
    city: string
    country: string
    countryCode: string
  }
  dates: {
    start: string // ISO date string
    end: string
    applicationDeadline: string
    registrationOpen: string
  }
  maxParticipants: number
  currentParticipants: number
  price: {
    amount: number
    currency: string
    displayPrice: string
    includes: string[]
    excludes: string[]
  }
  images: {
    cover: string
    gallery?: string[]
  }
  tags: string[]
  coordinator: {
    name: string
    email: string
  }
  itinerary?: {
    day: number
    title: string
    description: string
  }[]
  documents?: DocumentReq[]
  eligibleGrades?: number[] // e.g. [4, 5, 6] = ม.4, ม.5, ม.6 only
  terms?: string[] // Consent conditions shown to the student during application
}

const UNSPLASH_CITIES: Record<string, string> = {
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  silicon_valley: 'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=800&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  seoul: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
}

export const mockPrograms: Program[] = [
  {
    id: 'prog-001',
    title: 'Silicon Valley Tech Immersion 2025',
    shortDescription:
      'Explore the heart of technology and innovation. Visit Google, Apple, and Stanford University.',
    description:
      'ดำดิ่งสู่ Silicon Valley — ศูนย์กลางของนวัตกรรมเทคโนโลยีระดับโลก นักเรียนจะได้เยี่ยมชม Google Campus, Apple Park, และ Stanford University พร้อมเวิร์กช็อปพิเศษจาก Tech Mentors ชั้นนำ และเรียนรู้กระบวนการคิดเชิง Design Thinking แบบ hands-on',
    highlights: [
      'เยี่ยมชม Google Campus & Apple Park',
      'Workshop: Design Thinking with Stanford Facilitators',
      'Networking กับ Thai Tech Alumni ใน Silicon Valley',
      'Startup Pitch Competition',
      'Coding Bootcamp เบื้องต้น',
    ],
    requirements: [
      'นักเรียนชั้น ม.4–ม.6',
      'GPA ≥ 3.00',
      'มีทักษะด้านภาษาอังกฤษ (CEFR B1 ขึ้นไป)',
      'ผ่านการสัมภาษณ์เบื้องต้น',
      'ได้รับความยินยอมจากผู้ปกครอง',
    ],
    status: 'open',
    admissionType: 'interview',
    continent: 'อเมริกาเหนือ',
    location: { city: 'San Francisco', country: 'United States', countryCode: 'US' },
    dates: {
      start: '2025-08-10',
      end: '2025-08-24',
      applicationDeadline: '2025-06-30',
      registrationOpen: '2025-04-01',
    },
    maxParticipants: 30,
    currentParticipants: 22,
    price: {
      amount: 185000,
      currency: 'THB',
      displayPrice: '185,000 ฿',
      includes: [
        'ตั๋วเครื่องบินไป-กลับ',
        'ที่พัก 14 คืน',
        'อาหาร 3 มื้อ/วัน',
        'ประกันการเดินทาง',
        'ค่าเข้าชมสถานที่',
      ],
      excludes: ['ค่าใช้จ่ายส่วนตัว', 'ค่า Visa (ถ้ามี)', 'ของที่ระลึก', 'ค่ากระเป๋าเดินทาง'],
    },
    images: { cover: UNSPLASH_CITIES.silicon_valley },
    tags: ['Technology', 'Innovation', 'STEM', 'USA'],
    coordinator: { name: 'ครูสมชาย วงศ์เจริญ', email: 'somchai@dsu.ac.th' },
    terms: [
      'โครงการนี้สมัครแล้วไม่สามารถขอคืนเงินได้ทุกกรณี',
      'นักเรียนต้องได้รับการอนุมัติจากผู้ปกครองก่อนสมัคร',
      'นักเรียนต้องเดินทางพร้อมคณะครู ไม่สามารถเดินทางแยกได้',
      'หากขาดการร่วมกิจกรรมโดยไม่มีเหตุผลอันสมควร ถือว่าสละสิทธิ์',
    ],
    itinerary: [
      {
        day: 1,
        title: 'เดินทางถึง San Francisco',
        description: 'รับสัมภาระ เช็คอินโรงแรม และปฐมนิเทศ',
      },
      {
        day: 2,
        title: 'Stanford University',
        description: 'Campus tour, d.school Design Thinking workshop',
      },
      {
        day: 3,
        title: 'Google Campus, Mountain View',
        description: 'Googleplex tour, Talk from Google engineers',
      },
    ],
  },
  {
    id: 'prog-002',
    title: 'London Cultural Leadership Program',
    shortDescription:
      'Discover leadership in a global city. Engage with museums, universities, and business leaders in London.',
    description:
      'โปรแกรมนี้มุ่งพัฒนาภาวะผู้นำของนักเรียนผ่านบริบทของ London เมืองหลวงแห่งวัฒนธรรมและธุรกิจระดับโลก จะได้เรียนรู้จาก UCL, LSE และเยี่ยมชมสถาบันชั้นนำพร้อม cultural immersion program เต็มรูปแบบ',
    highlights: [
      'Guest lecture ที่ UCL & London School of Economics',
      'British Museum & National Gallery',
      'Model United Nations simulation',
      "Corporate visit: Lloyd's of London",
      'Thames River cultural cruise',
    ],
    requirements: [
      'นักเรียนชั้น ม.4–ม.6',
      'GPA ≥ 2.75',
      'สนใจด้านนโยบายสาธารณะหรือธุรกิจ',
      'ผ่านการสัมภาษณ์เบื้องต้น',
    ],
    status: 'open',
    admissionType: 'interview',
    continent: 'ยุโรป',
    location: { city: 'London', country: 'United Kingdom', countryCode: 'GB' },
    dates: {
      start: '2025-07-05',
      end: '2025-07-19',
      applicationDeadline: '2025-05-31',
      registrationOpen: '2025-03-15',
    },
    maxParticipants: 25,
    currentParticipants: 18,
    price: {
      amount: 165000,
      currency: 'THB',
      displayPrice: '165,000 ฿',
      includes: ['ตั๋วเครื่องบินไป-กลับ', 'ที่พัก 14 คืน', 'อาหาร 2 มื้อ/วัน', 'ประกันการเดินทาง'],
      excludes: ['ค่าใช้จ่ายส่วนตัว', 'ค่า Visa (ถ้ามี)', 'อาหารมื้อเย็น', 'ของที่ระลึก'],
    },
    images: { cover: UNSPLASH_CITIES.london },
    tags: ['Leadership', 'Culture', 'Business', 'UK'],
    coordinator: { name: 'ครูวิมล รักไทย', email: 'wimon@dsu.ac.th' },
    terms: [
      'โครงการนี้สมัครแล้วไม่สามารถขอคืนเงินได้ทุกกรณี',
      'นักเรียนต้องเข้าร่วมกิจกรรมทุกวัน ตามกำหนดการที่วางไว้',
      'นักเรียนต้องรับผิดชอบการต่ออายุ Visa และเอกสารการเดินทางของตนเอง',
    ],
  },
  {
    id: 'prog-003',
    title: 'Tokyo Innovation & Anime Culture',
    shortDescription:
      'Blend technology and creativity in Japan. Experience cutting-edge robotics and iconic Japanese pop culture.',
    description:
      'Japan Edition ผสมผสานระหว่างนวัตกรรมเทคโนโลยีญี่ปุ่นกับวัฒนธรรมอนิเมะและมังงะ ตั้งแต่ JAXA Space Center, Miraikan Science Museum ไปจนถึง Akihabara และ Studio Ghibli Museum',
    highlights: [
      'JAXA Space Center Tour',
      'Miraikan — National Museum of Emerging Science',
      'Akihabara Tech & Culture Day',
      'Studio Ghibli Museum',
      'Robotics Workshop at Waseda University',
    ],
    requirements: ['นักเรียนชั้น ม.1–ม.6', 'GPA ≥ 2.50', 'ไม่เคยเดินทางต่างประเทศก็ได้'],
    status: 'upcoming',
    admissionType: 'first-come',
    continent: 'เอเชีย',
    location: { city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
    dates: {
      start: '2025-10-15',
      end: '2025-10-25',
      applicationDeadline: '2025-09-01',
      registrationOpen: '2025-07-01',
    },
    maxParticipants: 40,
    currentParticipants: 0,
    price: {
      amount: 98000,
      currency: 'THB',
      displayPrice: '98,000 ฿',
      includes: [
        'ตั๋วเครื่องบินไป-กลับ',
        'ที่พัก 10 คืน',
        'อาหาร 3 มื้อ/วัน',
        'ประกันการเดินทาง',
        'Japan Rail Pass 7 days',
      ],
      excludes: ['ค่าใช้จ่ายส่วนตัว', 'ค่า Visa ญี่ปุ่น', 'ของที่ระลึก', 'ค่าอาหารนอกเวลา'],
    },
    images: { cover: UNSPLASH_CITIES.tokyo },
    tags: ['Technology', 'Culture', 'Anime', 'Japan'],
    coordinator: { name: 'ครูปิยะ ใจสะอาด', email: 'piya@dsu.ac.th' },
    terms: [
      'โครงการนี้สมัครแล้วไม่สามารถขอคืนเงินได้ทุกกรณี',
      'นักเรียนต้องปฏิบัติตามกฎระเบียบของประเทศญี่ปุ่นอย่างเคร่งครัด',
    ],
  },
  {
    id: 'prog-004',
    title: 'Singapore Smart City Exploration',
    shortDescription:
      "Dive into Asia's smartest city. Learn urban planning, fintech, and sustainable development in Singapore.",
    description:
      'สิงคโปร์เป็นต้นแบบของ Smart City ระดับโลก โปรแกรมนี้นำนักเรียนไปสัมผัสกับระบบ Urban Planning, Fintech Ecosystem และ Sustainability Initiative ที่ทำให้สิงคโปร์เป็นผู้นำด้านนวัตกรรมของเอเชีย',
    highlights: [
      'NUS & NTU Campus Visit',
      'Marina Bay Financial Centre — Fintech Tour',
      'Gardens by the Bay — Sustainability talk',
      'Smart Nation initiatives showcase',
      'Hawker Centre cultural experience',
    ],
    requirements: ['นักเรียนชั้น ม.4–ม.6', 'GPA ≥ 3.20', 'สนใจด้าน Economics หรือ Urban Design'],
    status: 'open',
    admissionType: 'first-come',
    continent: 'เอเชีย',
    location: { city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
    dates: {
      start: '2025-09-20',
      end: '2025-09-28',
      applicationDeadline: '2025-08-15',
      registrationOpen: '2025-06-01',
    },
    maxParticipants: 35,
    currentParticipants: 35,
    price: {
      amount: 75000,
      currency: 'THB',
      displayPrice: '75,000 ฿',
      includes: ['ตั๋วเครื่องบินไป-กลับ', 'ที่พัก 8 คืน', 'อาหาร 2 มื้อ/วัน', 'ประกันการเดินทาง'],
      excludes: ['ค่าใช้จ่ายส่วนตัว', 'อาหารมื้อเย็น', 'ของที่ระลึก'],
    },
    images: { cover: UNSPLASH_CITIES.singapore },
    tags: ['Smart City', 'Fintech', 'Sustainability', 'Singapore'],
    coordinator: { name: 'ครูนิพนธ์ สุนทร', email: 'nipon@dsu.ac.th' },
  },
  {
    id: 'prog-005',
    title: 'Paris Art & Creative Industries',
    shortDescription:
      'Immerse yourself in Parisian art, fashion, and design. Perfect for creatively gifted students.',
    description:
      "Paris ศูนย์กลางศิลปะ แฟชั่น และการออกแบบระดับโลก นักเรียนที่มีความสนใจด้านศิลปะและ Creative Industries จะได้เรียนรู้จาก Louvre, Musée d'Orsay และเข้าชม Fashion House พร้อม Workshop กับนักออกแบบมืออาชีพ",
    highlights: [
      'Louvre Museum exclusive guided tour',
      "Musée d'Orsay & Pompidou Centre",
      'Fashion Week backstage visit',
      'Watercolor workshop at Montmartre',
      'LVMH Creative Industries panel',
    ],
    requirements: [
      'นักเรียนชั้น ม.1–ม.6',
      'Portfolio ผลงานศิลปะหรือออกแบบ',
      'ไม่ต้องมีพื้นฐานภาษาฝรั่งเศส',
    ],
    status: 'closed',
    admissionType: 'interview',
    continent: 'ยุโรป',
    location: { city: 'Paris', country: 'France', countryCode: 'FR' },
    dates: {
      start: '2025-04-10',
      end: '2025-04-20',
      applicationDeadline: '2025-02-28',
      registrationOpen: '2025-01-15',
    },
    maxParticipants: 20,
    currentParticipants: 20,
    price: {
      amount: 145000,
      currency: 'THB',
      displayPrice: '145,000 ฿',
      includes: ['ตั๋วเครื่องบินไป-กลับ', 'ที่พัก 10 คืน', 'อาหาร 2 มื้อ/วัน', 'ประกันการเดินทาง'],
      excludes: [
        'ค่าใช้จ่ายส่วนตัว',
        'ค่า Visa ฝรั่งเศส',
        'อาหารมื้อเย็น',
        'ค่าอุปกรณ์ศิลปะเพิ่มเติม',
      ],
    },
    images: { cover: UNSPLASH_CITIES.paris },
    tags: ['Art', 'Fashion', 'Design', 'France'],
    coordinator: { name: 'ครูอัญชลี มาลีวงศ์', email: 'anchalee@dsu.ac.th' },
  },
  {
    id: 'prog-006',
    title: 'Seoul K-Culture & Digital Media',
    shortDescription:
      "Experience Korea's digital content revolution. From K-Pop production studios to cutting-edge webtoon culture.",
    description:
      'เกาหลีใต้คือผู้นำด้าน Digital Content และ Soft Power ระดับโลก โปรแกรมนี้นำนักเรียนลงลึกสู่อุตสาหกรรม K-Pop, Webtoon, และ K-Drama production พร้อม visit startups ชั้นนำใน Seoul Tech Scene',
    highlights: [
      'SM Entertainment / HYBE label visit',
      'Naver Webtoon creator workshop',
      'Korea Creative Content Agency (KOCCA)',
      'Gangnam startup ecosystem tour',
      'Hanok Village cultural experience',
    ],
    requirements: [
      'นักเรียนชั้น ม.1–ม.6',
      'GPA ≥ 2.50',
      'สนใจด้าน Media, Content Creation หรือ Entertainment',
    ],
    status: 'upcoming',
    admissionType: 'first-come',
    continent: 'เอเชีย',
    location: { city: 'Seoul', country: 'South Korea', countryCode: 'KR' },
    dates: {
      start: '2025-12-20',
      end: '2025-12-30',
      applicationDeadline: '2025-11-15',
      registrationOpen: '2025-09-01',
    },
    maxParticipants: 30,
    currentParticipants: 0,
    price: {
      amount: 88000,
      currency: 'THB',
      displayPrice: '88,000 ฿',
      includes: ['ตั๋วเครื่องบินไป-กลับ', 'ที่พัก 10 คืน', 'อาหาร 3 มื้อ/วัน', 'ประกันการเดินทาง'],
      excludes: [
        'ค่าใช้จ่ายส่วนตัว',
        'ค่า Visa เกาหลี',
        'ของที่ระลึก K-Pop',
        'ค่า Merch เพิ่มเติม',
      ],
    },
    images: { cover: UNSPLASH_CITIES.seoul },
    tags: ['K-Culture', 'Digital Media', 'Entertainment', 'Korea'],
    coordinator: { name: 'ครูภาณุ วิชัยดิษฐ', email: 'phanu@dsu.ac.th' },
  },
]
