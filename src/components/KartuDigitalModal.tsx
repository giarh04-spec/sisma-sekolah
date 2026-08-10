import React, { useRef } from 'react';
import { Siswa, Guru, Staf } from '../types/school';
import { X, Printer, QrCode, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface KartuDigitalModalProps {
  type: 'siswa' | 'guru' | 'staf';
  data: Siswa | Guru | Staf;
  onClose: () => void;
}

export const KartuDigitalModal: React.FC<KartuDigitalModalProps> = ({ type, data, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Digital - ${data.nama}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; background: white; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen bg-slate-100 p-8">
          <div>${printContent.innerHTML}</div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  const getBarcodeCode = () => {
    if (type === 'siswa') {
      const s = data as Siswa;
      return s.kodeBarcode || `SIS-${s.nisn || s.nis}`;
    } else if (type === 'guru') {
      const g = data as Guru;
      return g.kodeBarcode || `GUR-${g.nip}`;
    } else {
      const st = data as Staf;
      return st.kodeBarcode || `STF-${st.nik}`;
    }
  };

  const barcodeCode = getBarcodeCode();

  // Simple SVG Barcode Generator based on string hash
  const renderBarcodeSVG = (code: string) => {
    const bars = [];
    let x = 10;
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const width1 = (charCode % 3) + 2;
      const width2 = ((charCode * 2) % 3) + 1;
      bars.push(<rect key={`b1-${i}`} x={x} y="5" width={width1} height="40" fill="#0f172a" />);
      x += width1 + 2;
      bars.push(<rect key={`b2-${i}`} x={x} y="5" width={width2} height="40" fill="#0f172a" />);
      x += width2 + 2;
    }
    return (
      <svg viewBox={`0 0 ${x + 10} 60`} className="w-full h-12 bg-white rounded p-1 border border-slate-300">
        <rect width="100%" height="100%" fill="white" />
        {bars}
        <text x="50%" y="55" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
          {code}
        </text>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Kartu Identitas Digital & Barcode Presensi
              </h3>
              <p className="text-xs text-slate-400">
                Kartu resmi {type.toUpperCase()} lengkap dengan Barcode untuk Presensi / Absensi Otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Container */}
        <div ref={printRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center py-2">
          
          {/* FRONT CARD */}
          <div className="w-[340px] h-[520px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl border-2 border-slate-700/80 shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden text-slate-100">
            {/* Background Decorative Accent */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* School Brand Header */}
            <div className="border-b border-slate-700/80 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black tracking-wider uppercase text-blue-400">SMA NEGERI 1 EDUSMART</h4>
                <p className="text-[9px] text-slate-300 font-medium leading-tight">
                  KARTU IDENTITAS RESMI SEKOAH - TA 2026/2027
                </p>
              </div>
            </div>

            {/* Photo & Role Badge */}
            <div className="flex flex-col items-center mt-3 text-center">
              <div className="relative">
                <img
                  src={data.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={data.nama}
                  className="w-24 h-28 object-cover rounded-xl border-2 border-blue-500 shadow-md"
                />
                <span className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-slate-900 whitespace-nowrap">
                  KARTU {type.toUpperCase()}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-white mt-4 line-clamp-1">{data.nama}</h3>
              <p className="text-[11px] text-blue-300 font-semibold mt-0.5">
                {type === 'siswa' && `Kelas: ${(data as Siswa).kelas}`}
                {type === 'guru' && `Mata Pelajaran: ${(data as Guru).mataPelajaran}`}
                {type === 'staf' && `Bagian: ${(data as Staf).bagian}`}
              </p>
            </div>

            {/* Details Grid */}
            <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 text-[10px] space-y-1.5 my-2">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400 font-medium">
                  {type === 'siswa' ? 'NISN / NIS' : type === 'guru' ? 'NIP / NIK' : 'NIK / ID'}
                </span>
                <span className="font-mono font-bold text-white">
                  {type === 'siswa' ? `${(data as Siswa).nisn} / ${(data as Siswa).nis}` : type === 'guru' ? (data as Guru).nip : (data as Staf).nik}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400 font-medium">TTL</span>
                <span className="font-semibold text-slate-200">
                  {data.tempatLahir}, {data.tanggalLahir}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400 font-medium">Agama / Gender</span>
                <span className="font-semibold text-slate-200">
                  {data.agama || 'Islam'} / {data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Status Pegawai/Siswa</span>
                <span className="font-bold text-emerald-400">
                  {type === 'siswa' ? (data as Siswa).status : type === 'guru' ? (data as Guru).status : (data as Staf).status}
                </span>
              </div>
            </div>

            {/* Barcode & QR Code SVG Container */}
            <div className="mt-auto pt-1 flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700/60">
              <div className="flex-1">
                {renderBarcodeSVG(barcodeCode)}
              </div>
              <div className="w-14 h-14 bg-white p-1 rounded border border-slate-300 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(barcodeCode)}`}
                  alt="QR Presensi"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="text-[8px] text-center text-slate-400 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Scan Barcode atau QR Code pada kamera mesin absensi
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu Digital
          </button>
        </div>

      </div>
    </div>
  );
};
