import React, { useRef, useState, useEffect } from 'react';
import { Siswa, Guru, Staf } from '../types/school';
import { X, Printer, QrCode, Building2, GraduationCap, User, Phone } from 'lucide-react';
import { INITIAL_SCHOOL_SETTINGS } from '../data/mockData';

interface KartuDigitalModalProps {
  type: 'siswa' | 'guru' | 'staf';
  data: Siswa | Guru | Staf;
  onClose: () => void;
}

export const KartuDigitalModal: React.FC<KartuDigitalModalProps> = ({ type, data, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [schoolSettings, setSchoolSettings] = useState(INITIAL_SCHOOL_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edu_schoolSettings');
      if (saved) {
        setSchoolSettings(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Absen Siswa - ${data.nama}</title>
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

  const siswaData = type === 'siswa' ? (data as Siswa) : null;
  const guruData = type === 'guru' ? (data as Guru) : null;
  const stafData = type === 'staf' ? (data as Staf) : null;

  // Format QR string based on requested pattern: Nama: [Name] | ID: [Identifier]
  // We use GUR-, STF-, SIS- prefixes to help the scanner automatically identify the category
  const qrString = type === 'siswa' 
    ? `Nama: ${data.nama} | ID: SIS-${(data as Siswa).nisn || (data as Siswa).nis || data.id}` 
    : type === 'guru'
      ? `Nama: ${data.nama} | ID: GUR-${(data as Guru).nik || (data as Guru).nip || data.id}`
      : `Nama: ${data.nama} | ID: STF-${(data as Staf).nik || data.id}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrString)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                Kartu Absen {type}
              </h3>
              <p className="text-xs text-slate-400">
                Sesuai standar absensi digital sekolah & QR Code {type}
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
        <div ref={printRef} className="flex justify-center items-center py-2">
          
          {/* ID CARD */}
          <div className="w-[340px] h-[520px] bg-white text-slate-900 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden border border-slate-200">
            
            {/* Top Teal/Emerald Curved Header matching Logo */}
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-[#042f2e] via-[#0f766e] to-[#115e59] rounded-b-[40%] flex flex-col items-center pt-3 text-white shadow-md">
              {/* School Logo stacked above School Name */}
              <div className="flex flex-col items-center gap-1 px-4 text-center">
                {schoolSettings.logoUrl ? (
                  <img src={schoolSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-white/15 rounded-full p-1 border border-white/30 shadow-lg" />
                ) : (
                  <Building2 className="w-8 h-8 text-white" />
                )}
                <span className="text-[10px] font-black tracking-wider uppercase text-teal-100 max-w-[260px] leading-tight">
                  {schoolSettings.namaSekolah || "SMP ISLAM MODERN AL FAKHİR"}
                </span>
              </div>
            </div>

            {/* Circular User Photo */}
            <div className="relative z-10 flex flex-col items-center mt-24">
              <div className="w-24 h-24 rounded-full p-1 bg-white shadow-xl border-2 border-teal-600 overflow-hidden">
                <img
                  src={data.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={data.nama}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* User Name */}
              <h3 className="text-sm font-black text-slate-900 mt-3 text-center px-4 uppercase tracking-tight line-clamp-1">
                {data.nama}
              </h3>

              {/* Teal/Amber Divider dot */}
              <div className="flex items-center gap-1.5 my-1">
                <div className="w-12 h-0.5 bg-teal-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <div className="w-12 h-0.5 bg-teal-300 rounded-full" />
              </div>

              {/* Identifier Badge (NISN/NIK/NIP) */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-1">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-mono">
                  {type === 'siswa' 
                    ? ((data as Siswa).nisn || (data as Siswa).nis || '-') 
                    : type === 'guru'
                      ? ((data as Guru).nik || (data as Guru).nip || '-')
                      : ((data as Staf).nik || (data as Staf).id || '-')
                  }
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="relative z-10 flex justify-center my-auto px-6">
              <div className="p-2 bg-white border-2 border-teal-200 rounded-2xl shadow-md">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>

            {/* Bottom Teal/Emerald Curved Footer */}
            <div className="h-12 bg-gradient-to-r from-[#042f2e] via-[#0f766e] to-[#115e59] rounded-t-[35%] flex items-center justify-center gap-2 text-white px-4">
              <QrCode className="w-4 h-4 text-teal-200" />
              <span className="text-[10px] font-bold tracking-wide uppercase">Scan untuk absensi {type}</span>
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
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-teal-600/30"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu Absen
          </button>
        </div>

      </div>
    </div>
  );
};
