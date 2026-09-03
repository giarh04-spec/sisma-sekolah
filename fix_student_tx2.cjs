const fs = require('fs');
let code = fs.readFileSync('src/components/KeuanganView.tsx', 'utf-8');
code = code.replace(/const\s+\[studentTransactions,\s*setStudentTransactions\]\s*=\s*useState<Array<\{[\s\S]*?\}>>\(\[\]\);/, 'const [studentTransactions, setStudentTransactions] = useState<any[]>([]);');
fs.writeFileSync('src/components/KeuanganView.tsx', code);
