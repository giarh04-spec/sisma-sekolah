import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Building2, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Search, 
  Receipt, 
  ChevronRight,
  User,
  CreditCard
} from 'lucide-react';
import { GajiPembayaran, SchoolSettings, Staf, Guru } from '../types/school';
import { terbilang, downloadElementAsImage, copyElementImageToClipboard } from '../lib/exportUtils';
import { dbFetchCollection } from '../lib/firebaseSync';
import { INITIAL_SCHOOL_SETTINGS } from '../data/mockData';

interface PublicSlipGajiViewProps {
  slipId: string;
  onBackToApp?: () => void;
  schoolSettings?: SchoolSettings;
  gajiList?: GajiPembayaran[];
  stafList?: Staf[];
  guruList?: Guru[];
}

export const PublicSlipGajiView: React.FC<PublicSlipGajiViewProps> = ({
  slipId,
  onBackToApp,
  schoolSettings: initialSettings,
  gajiList: initialGajiList = [],
  stafList = [],
  guruList = []
}) => {
  const [allGajiList, setAllGajiList] = useState<GajiPembayaran[]>(() => {
    if (initialGajiList && initialGajiList.length > 0) return initialGajiList;
    try {
      const saved = localStorage.getItem('edu_gajiList');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(() => {
    if (slipId && slipId !== 'portal' && slipId !== 'lookup' && slipId !== 'all') {
      return slipId;
    }
    return null;
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    if (initialSettings) return initialSettings;
    try {
      const saved = localStorage.getItem('edu_schoolSettings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SCHOOL_SETTINGS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('semua');
  const [filterTahun, setFilterTahun] = useState<string>('2025');
  const [filterTipe, setFilterTipe] = useState<'semua' | 'guru' | 'staf'>('semua');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const slipRef = useRef<HTMLDivElement>(null);

  // Sync / Load data from Firestore
  useEffect(() => {
    const loadSlipData = async () => {
      try {
        setIsLoading(true);
        const remoteGaji = await dbFetchCollection<GajiPembayaran>('edu_gajiList');
        if (remoteGaji && remoteGaji.length > 0) {
          setAllGajiList(remoteGaji);
        }

        const remoteSettings = await dbFetchCollection<SchoolSettings>('edu_schoolSettings');
        if (remoteSettings && remoteSettings.length > 0) {
          const s = remoteSettings.find(item => item.namaSekolah);
          if (s) setSchoolSettings(s);
        }
      } catch (err) {
        console.error('Error fetching slip from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlipData();
  }, []);

  // Update selectedSlipId when prop changes
  useEffect(() => {
    if (slipId && slipId !== 'portal' && slipId !== 'lookup' && slipId !== 'all') {
      setSelectedSlipId(slipId);
    }
  }, [slipId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find currently active slip object
  const slipData = useMemo(() => {
    if (!selectedSlipId) return null;
    return allGajiList.find(g => g.id === selectedSlipId) || null;
  }, [selectedSlipId, allGajiList]);

  // Filtered List for Public Search Portal
  const filteredSlips = useMemo(() => {
    return allGajiList.filter(item => {
      const matchSearch = 
        !searchQuery.trim() ||
        item.penerimaNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.penerimaNipNik && item.penerimaNipNik.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.jabatan && item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchBulan = filterBulan === 'semua' || item.bulan.toLowerCase() === filterBulan.toLowerCase();
      const matchTahun = !filterTahun || filterTahun === 'semua' || item.tahun.toString() === filterTahun;
      const matchTipe = filterTipe === 'semua' || item.penerimaTipe === filterTipe;

      return matchSearch && matchBulan && matchTahun && matchTipe;
    });
  }, [allGajiList, searchQuery, filterBulan, filterTahun, filterTipe]);

  // Find Bendahara & Kepala Sekolah info
  const bendaharaStaf = stafList.find(s => 
    s.bagian === 'Bendahara / Keuangan' || 
    (s.bagian && s.bagian.toLowerCase().includes('bendahara')) ||
    (s.bagian && s.bagian.toLowerCase().includes('keuangan'))
  );

  const bendaharaNama = bendaharaStaf?.nama || schoolSettings?.namaKasir || 'Nurhidayati, S.Pd';
  const bendaharaNik = bendaharaStaf?.nik || '-';
  const kepalaSekolahNama = schoolSettings?.kepalaSekolah || schoolSettings?.kepalaSekolah || 'Dr. H. Ahmad Fauzi, M.Pd';
  const kepalaSekolahNip = schoolSettings?.nipKepalaSekolah || '19750814 200212 1 003';

  // Handle PNG Download
  const handleDownloadPng = async () => {
    if (!slipRef.current || !slipData) return;
    setIsGeneratingImage(true);
    showToast('Sedang membuat file gambar slip gaji...');

    const safeName = (slipData.penerimaNama || 'Penerima').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Slip_Gaji_${safeName}_${slipData.bulan}_${slipData.tahun}`;

    const success = await downloadElementAsImage(slipRef.current, filename);
    setIsGeneratingImage(false);
    if (success) {
      showToast('✅ Slip Gaji berhasil diunduh dalam format PNG!');
    } else {
      showToast('❌ Gagal mengunduh gambar slip.');
    }
  };

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!slipRef.current) return;
    showToast('Menyalin gambar slip ke clipboard...');
    const success = await copyElementImageToClipboard(slipRef.current);
    if (success) {
      showToast('📋 Gambar Slip Gaji berhasil disalin ke Clipboard!');
    } else {
      showToast('Fitur salin gambar tidak didukung oleh browser ini. Silakan gunakan tombol Unduh PNG.');
    }
  };

  // Copy Public Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && slipData) {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('slip', slipData.id);
      navigator.clipboard.writeText(url.toString());
      setCopiedText(true);
      showToast('🔗 Link tautan slip berhasil disalin!');
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  // Calculations for current slip
  const tJabatan = slipData?.tunjangan || 0;
  const tWalas = slipData?.tunjanganWalas || 0;
  const tKetepatan = slipData?.tunjanganKetepatanWaktu || 0;
  const tHadir = slipData?.tunjanganKehadiran || 0;
  const tPiket = slipData?.tunjanganPiket || 0;
  const tExcess = slipData?.tunjanganExcessTime || 0;

  const pAbsensi = slipData?.potongan || 0;
  const pTerlambat = slipData?.potonganDendaTerlambat || 0;
  const pFinger = slipData?.potonganDendaLupaFinger || 0;
  const pKoperasi = slipData?.potonganKoperasi || 0;
  const pKasBon = slipData?.potonganKasBon || 0;

  const totalTunjangan = tJabatan + tWalas + tKetepatan + tHadir + tPiket + tExcess;
  const totalPotongan = pAbsensi + pTerlambat + pFinger + pKoperasi + pKasBon;
  const subtotalPenghasilan = (slipData?.gajiPokok || 0) + totalTunjangan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-6 px-3 sm:px-6 font-sans print:p-0 print:bg-white print:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 text-xs font-bold print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          {onBackToApp ? (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Kembali ke Halaman Login</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                window.location.href = window.location.origin + window.location.pathname;
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Kembali ke Login</span>
            </button>
          )}

          {selectedSlipId && (
            <button
              type="button"
              onClick={() => {
                setSelectedSlipId(null);
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('slip');
                  url.searchParams.delete('view');
                  url.searchParams.delete('id');
                  window.history.pushState({}, '', url.pathname);
                } catch {}
              }}
              className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Slip Lain</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portal Slip Gaji Digital Resmi
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: DETAIL SLIP GAJI (IF SELECTED) */}
      {slipData ? (
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Action Bar (Download, Print, Copy) */}
          <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden backdrop-blur-md">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Slip Gaji: <span className="text-emerald-400">{slipData.penerimaNama}</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Periode {slipData.bulan} {slipData.tahun} • No. Slip: <span className="font-mono text-slate-300">{slipData.id}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isGeneratingImage}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Unduh file gambar slip beresolusi tinggi (PNG)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PNG</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
                title="Cetak slip atau simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Salin gambar ke papan klip (Clipboard)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin Gambar</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Salin tautan online slip ini"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{copiedText ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* DOCUMENT PAPER DISPLAY (PRINTABLE SLIP GAJI) */}
          <div className="bg-slate-900/40 p-1 sm:p-4 rounded-3xl border border-slate-800/80 shadow-2xl flex justify-center overflow-x-auto print:p-0 print:border-none print:shadow-none print:bg-transparent">
            <div 
              ref={slipRef}
              id="printable-slip-gaji"
              className="w-full max-w-2xl bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 font-sans print:shadow-none print:border-none print:m-0 print:p-4"
            >
              {/* KOP SURAT SEKOLAH */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-300 p-2 flex items-center justify-center shrink-0">
                    <img 
                      src={schoolSettings?.logoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563eb"/></svg>'} 
                      alt="Logo Sekolah" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight leading-tight">
                      {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}
                    </h1>
                    <p className="text-[10px] text-slate-600 leading-normal mt-0.5">
                      {schoolSettings?.alamat || 'Jl. Raya Pendidikan No. 45'} • NPSN: {schoolSettings?.npsn || '70048660'}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium">
                      Akreditasi: {schoolSettings?.akreditasi || 'A (Unggul)'} • Telp: {schoolSettings?.telepon || '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-950 font-black text-[9px] uppercase tracking-wider rounded">
                    SLIP GAJI RESMI
                  </span>
                  <div className="text-[10px] font-mono font-bold text-slate-700 mt-1">
                    {slipData.bulan.toUpperCase()} {slipData.tahun}
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono">
                    ID: {slipData.id}
                  </div>
                </div>
              </div>

              {/* IDENTITAS PENERIMA */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-5 text-xs text-slate-800">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Nama Pegawai</span>
                    <strong className="text-slate-950 text-xs">{slipData.penerimaNama}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">NIP / NIK</span>
                    <strong className="font-mono text-slate-900">{slipData.penerimaNipNik || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Jabatan / Bagian</span>
                    <span className="font-semibold text-slate-900">{slipData.jabatan || 'Guru Mata Pelajaran'} ({slipData.penerimaTipe.toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Rekening / Pembayaran</span>
                    <span className="font-mono text-slate-900">{slipData.penerimaRekening || 'Transfer Bank'}</span>
                  </div>
                </div>
              </div>

              {/* RINCIAN PENGHASILAN & POTONGAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
                
                {/* KOLOM A: PENGHASILAN (EARNINGS) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 text-emerald-950 px-3 py-2 font-bold text-[11px] border-b border-emerald-200 flex justify-between">
                    <span>A. RINCIAN PENGHASILAN</span>
                    <span>JUMLAH</span>
                  </div>
                  <div className="p-3 space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                      <span className="text-slate-700">• Gaji Pokok</span>
                      <span className="font-mono font-bold text-slate-950">Rp {slipData.gajiPokok.toLocaleString('id-ID')}</span>
                    </div>
                    {tJabatan > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Jabatan</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tJabatan.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {tWalas > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Wali Kelas</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tWalas.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {tKetepatan > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Ketepatan Waktu</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tKetepatan.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {tHadir > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Kehadiran</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tHadir.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {tPiket > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Piket</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tPiket.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {tExcess > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Tunjangan Excess Time</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tExcess.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex justify-between font-bold text-[11px] text-emerald-950">
                    <span>Total Penghasilan Kotor</span>
                    <span className="font-mono font-black">Rp {subtotalPenghasilan.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* KOLOM B: POTONGAN (DEDUCTIONS) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 text-rose-950 px-3 py-2 font-bold text-[11px] border-b border-rose-200 flex justify-between">
                    <span>B. RINCIAN POTONGAN</span>
                    <span>JUMLAH</span>
                  </div>
                  <div className="p-3 space-y-1.5 text-[10.5px]">
                    {pAbsensi > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Potongan Absensi / Izin</span>
                        <span className="font-mono font-bold text-rose-700">Rp {pAbsensi.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pTerlambat > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Denda Keterlambatan</span>
                        <span className="font-mono font-bold text-rose-700">Rp {pTerlambat.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pFinger > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Denda Lupa Finger/Presensi</span>
                        <span className="font-mono font-bold text-rose-700">Rp {pFinger.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pKoperasi > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Iuran Koperasi Pegawai</span>
                        <span className="font-mono font-bold text-rose-700">Rp {pKoperasi.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pKasBon > 0 && (
                      <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200">
                        <span className="text-slate-700">• Kasbon / Cicilan Pinjaman</span>
                        <span className="font-mono font-bold text-rose-700">Rp {pKasBon.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {totalPotongan === 0 && (
                      <div className="py-4 text-center text-slate-400 text-[10px] italic">
                        Tidak ada potongan gaji pada periode ini.
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex justify-between font-bold text-[11px] text-rose-950">
                    <span>Total Seluruh Potongan</span>
                    <span className="font-mono font-black">Rp {totalPotongan.toLocaleString('id-ID')}</span>
                  </div>
                </div>

              </div>

              {/* TOTAL BERSIH DITERIMA (NET SALARY) */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 mb-4 text-slate-900">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                      TOTAL DITERIMA BERSIH (TAKE HOME PAY)
                    </span>
                    <p className="text-[11px] font-semibold text-emerald-950 italic mt-0.5">
                      Terbilang: <em>"{terbilang(slipData.totalDiterima)} Rupiah"</em>
                    </p>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-800 tracking-tight shrink-0">
                    Rp {slipData.totalDiterima.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* CATATAN */}
              {slipData.catatan && (
                <div className="text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 mb-4">
                  <strong>Catatan Bendahara:</strong> {slipData.catatan}
                </div>
              )}

              {/* BLOK TANDA TANGAN */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 text-slate-800">
                <div>
                  <p className="font-medium text-slate-500">Penerima Gaji,</p>
                  <div className="h-14 flex items-end justify-center">
                    <span className="text-[9px] text-slate-400 italic font-mono">[Tanda Tangan Digital]</span>
                  </div>
                  <p className="font-bold text-slate-950 underline">{slipData.penerimaNama}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-500">Bendahara Keuangan,</p>
                  <div className="h-14 flex items-end justify-center">
                    <span className="text-[9px] text-emerald-600 font-bold font-mono">✓ TERVERIFIKASI</span>
                  </div>
                  <p className="font-bold text-slate-950 underline">{bendaharaNama}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-500">Kepala Sekolah,</p>
                  <div className="h-14 flex items-end justify-center">
                    <span className="text-[9px] text-emerald-600 font-bold font-mono">✓ MENGETAHUI</span>
                  </div>
                  <p className="font-bold text-slate-950 underline">{kepalaSekolahNama}</p>
                </div>
              </div>

              {/* FOOTER VERIFIKASI SISTEM */}
              <div className="mt-6 pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
                <span>Dokumen ini dicetak secara otomatis melalui Sistem Keuangan Digital Sekolah.</span>
                <span>ID Dokumen: {slipData.id}</span>
              </div>

            </div>

          </div>

          {/* Bottom Callout / Help Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-3 print:hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">{schoolSettings?.namaSekolah || 'Sistem Informasi Sekolah'}</h4>
              <p className="text-[11px] text-slate-400">
                Untuk konfirmasi perbaikan atau pertanyaan payroll, hubungi Bendahara Tata Usaha.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* VIEW MODE 2: PORTAL PENCARIAN SLIP GAJI PUBLIK (TANPA LOGIN) */
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Header Card */}
          <div className="bg-[#121215]/90 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700/60 p-2.5 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                  <img 
                    src={schoolSettings.logoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563eb"/></svg>'} 
                    alt={schoolSettings.namaSekolah} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Portal Penggajian Digital (Akses Publik)
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Cek & Unduh Slip Gaji Guru / Staf
                  </h1>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {schoolSettings.namaSekolah} • NPSN: {schoolSettings.npsn}
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shrink-0">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>{allGajiList.length} Slip Tersedia</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik Nama Guru/Staf, NIP, NIK, atau No. Slip..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="semua">Semua Bulan</option>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterTipe}
                  onChange={(e) => setFilterTipe(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                >
                  <option value="semua">Semua Tenaga Pendidik</option>
                  <option value="guru">Guru Saja</option>
                  <option value="staf">Staf TU Saja</option>
                </select>
              </div>
            </div>
          </div>

          {/* Slips Result Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Ditemukan <strong className="text-emerald-400">{filteredSlips.length}</strong> dokumen slip gaji:</span>
              <span className="text-[11px] text-zinc-500">Klik tombol "Buka Slip Gaji" untuk cetak / unduh</span>
            </div>

            {filteredSlips.length === 0 ? (
              <div className="bg-[#121215]/60 border border-zinc-800/80 rounded-2xl p-10 text-center space-y-3">
                <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Tidak Ada Dokumen Slip Gaji yang Cocok</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Silakan periksa kembali ejaan nama, NIP/NIK, atau ganti pilihan filter bulan di atas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredSlips.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#121215]/80 hover:bg-[#18181d] border border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-lg flex flex-col justify-between group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.penerimaTipe === 'guru' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' : 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                          }`}>
                            {item.penerimaTipe}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {item.penerimaNipNik || item.id}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-1">
                          {item.penerimaNama}
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {item.jabatan || 'Guru'} • Periode: <strong className="text-zinc-200">{item.bulan} {item.tahun}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 block">Gaji Bersih</span>
                        <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                          Rp {item.totalDiterima.toLocaleString('id-ID')}
                        </div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {item.status === 'Paid' ? 'Lunas' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlipId(item.id);
                        try {
                          const url = new URL(window.location.href);
                          url.searchParams.set('slip', item.id);
                          window.history.pushState({}, '', url.toString());
                        } catch {}
                      }}
                      className="w-full py-2 px-3 bg-emerald-900/40 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30 hover:border-transparent active:scale-[0.99] cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Buka & Cetak Slip Gaji</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
