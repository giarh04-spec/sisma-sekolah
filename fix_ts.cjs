const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');
if (!code.includes('FileSignature')) {
  code = code.replace("lucide-react';", "FileSignature,\n} from 'lucide-react';");
  fs.writeFileSync('src/components/Sidebar.tsx', code);
} else if (!code.match(/import\s+\{.*FileSignature.*\}\s+from\s+'lucide-react'/s)) {
  code = code.replace("MessageSquare,", "MessageSquare,\n  FileSignature,");
  fs.writeFileSync('src/components/Sidebar.tsx', code);
}

let pcode = fs.readFileSync('src/components/PerizinanView.tsx', 'utf-8');
pcode = pcode.replace(/r\.namaKelas/g, 'r.nama');
fs.writeFileSync('src/components/PerizinanView.tsx', pcode);

console.log('Fixed simple TS errors');
