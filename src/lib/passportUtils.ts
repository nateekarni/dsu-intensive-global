import Tesseract from 'tesseract.js';

// Regex สำหรับเลข Passport ไทย (ตัวอักษร 1-2 ตัว ตามด้วยเลข 6-7 ตัว)
const PASSPORT_REGEX = /[A-Z]{1,2}[0-9]{6,9}/;
// Regex สำหรับวันที่ (Format: 22 AUG 2025)
const DATE_REGEX = /[0-9]{1,2}\s[A-Z]{3,4}\s[0-9]{4}/g;

interface OCRResult {
  passportNo: string | null;
  expiryDate: string | null;
  annotatedImageBlob: Blob | null; // รูปที่มีวงรีแดงแล้ว
  error?: string;
}

export const processPassportImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    // 1. Run Tesseract OCR
    const result = await Tesseract.recognize(imageFile, 'eng');
    const words = result.data.words;

    // 2. ค้นหาข้อมูลจากข้อความที่อ่านได้
    let passportNo = null;
    let expiryDate = null;
    let passportBbox = null;

    // หาเลข Passport และ Expiry Date
    for (const word of words) {
      const text = word.text.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // หาเลข Passport
      if (!passportNo && PASSPORT_REGEX.test(text) && text.length >= 7) {
        passportNo = text;
        passportBbox = word.bbox; // เก็บตำแหน่ง (x, y, width, height)
      }
    }

    // หา Expiry Date (ต้องหาจาก text เต็มๆ เพราะวันที่อาจมีเว้นวรรค)
    const fullText = result.data.text;
    const dates = fullText.match(DATE_REGEX);
    if (dates && dates.length > 0) {
      // มักจะเป็นวันที่หลังสุดในเอกสาร (Date of expiry)
      // *ในระบบจริงอาจต้องใช้ Logic ที่ซับซ้อนกว่านี้เพื่อระบุตำแหน่ง Expiry ให้แม่นยำ
      expiryDate = dates[dates.length - 1]; 
    }

    // 3. ตรวจสอบอายุ Passport (ต้อง > 6 เดือน)
    if (expiryDate) {
      const exp = new Date(expiryDate);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (exp < sixMonthsFromNow) {
        return { 
          passportNo, 
          expiryDate, 
          annotatedImageBlob: null, 
          error: "Passport หมดอายุหรือเหลือน้อยกว่า 6 เดือน (" + expiryDate + ")" 
        };
      }
    }

    // 4. วาดวงรีครอบเลข Passport (Annotation)
    let annotatedBlob = null;
    if (passportBbox) {
      annotatedBlob = await drawEllipseOnImage(imageFile, passportBbox);
    } else {
      // ถ้าหาเลขไม่เจอ ก็คืนรูปเดิมไป
      annotatedBlob = imageFile; 
    }

    return { passportNo, expiryDate, annotatedImageBlob: annotatedBlob };

  } catch (err) {
    console.error(err);
    return { passportNo: null, expiryDate: null, annotatedImageBlob: null, error: "อ่านไฟล์ล้มเหลว" };
  }
};

// ฟังก์ชันวาดวงรีลงบน Canvas
const drawEllipseOnImage = async (file: File, bbox: Tesseract.Bbox): Promise<Blob | null> => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise(r => img.onload = r);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // วาดรูปเดิม
  ctx.drawImage(img, 0, 0);

  // คำนวณตำแหน่งวงรี
  const centerX = (bbox.x0 + bbox.x1) / 2;
  const centerY = (bbox.y0 + bbox.y1) / 2;
  const radiusX = (bbox.x1 - bbox.x0) * 0.7; // ขยายเล็กน้อย
  const radiusY = (bbox.y1 - bbox.y0) * 1.2;

  // วาดวงรี
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'red';
  ctx.stroke();

  return new Promise(resolve => canvas.toBlob(resolve));
};