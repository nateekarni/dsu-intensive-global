const fs = require('fs');
const path = 'src/app/(pages)/student/apply/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: checkExistingApp
content = content.replace(
    'if (!authLoading && !loading) {',
    'if (!authLoading && !loading && !submitting) {'
);

// Fix 2: Diseases Label
content = content.replace(
    '<Label>โรคประจำตัว (ถ้ามี)</Label>',
    '<Label>โรคประจำตัว (ไม่มีกรอก -)</Label>'
);

// Fix 3: Allergies Label
content = content.replace(
    '<Label>ข้อมูลการแพ้อาหาร (ถ้ามี)</Label>',
    '<Label>ข้อมูลการแพ้อาหาร (ไม่มีกรอก -)</Label>'
);

// Fix 4: Diseases Required (using placeholder as anchor)
content = content.replace(
    'placeholder="ระบุโรคประจำตัว"',
    'placeholder="ระบุโรคประจำตัว"\n                  required'
);

// Fix 5: Allergies Required
content = content.replace(
    'placeholder="ระบุการแพ้อาหาร"',
    'placeholder="ระบุการแพ้อาหาร"\n                  required'
);

fs.writeFileSync(path, content);
console.log('Fixed apply page');
