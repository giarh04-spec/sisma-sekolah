const fs = require('fs');
let code = fs.readFileSync('src/components/KeuanganView.tsx', 'utf-8');
const search = `  const [studentTransactions, setStudentTransactions] = useState<Array<{
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: "spp" | "bebas" | "ekskul" | "other" | string;
  }>>([]);`;
code = code.replace(search, `  const [studentTransactions, setStudentTransactions] = useState<any[]>([]);`);
fs.writeFileSync('src/components/KeuanganView.tsx', code);
