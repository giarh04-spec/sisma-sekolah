import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Printer, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  Calendar, 
  User, 
  CreditCard, 
  ArrowLeft, 
  CheckCheck, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText
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
  const [slipData, setSlipData] = useState<GajiPembayaran | null>(() => {
    // Check initial props
    const found = initialGajiList.find(g => g.id === slipId);
    if (found) return found;
    // Check local storage
    try {
      const saved = localStorage.getItem('edu_gajiList');
      if (saved) {
        const list: GajiPembayaran[] = JSON.parse(saved);
        return list.find(g => g.id === slipId) || null;
      }
    } catch (e) {
      console.error('Error reading localStorage for slip:', e);
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

  const [isLoading, setIsLoading] = useState<boolean>(!slipData);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const slipRef = useRef<HTMLDivElement>(null);

  // Fetch from Firestore if not found immediately
  useEffect(() => {
    const loadSlipFromDb = async () => {
      if (slipData) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const remoteGaji = await dbFetchCollection<GajiPembayaran>('edu_gajiList');
        const found = remoteGaji.find(g => g.id === slipId);
        if (found) {
          setSlipData(found);
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

    loadSlipFromDb();
  }, [slipId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find Bendahara & Kepala Sekolah info
  const bendaharaStaf = stafList.find(s => 
    s.bagian === 'Bendahara / Keuangan' || 
    (s.bagian && s.bagian.toLowerCase().includes('bendahara')) ||
    (s.bagian && s.bagian.toLowerCase().includes('keuangan'))
  );

  const bendaharaNama = bendaharaStaf?.nama || schoolSettings?.namaKasir || 'Nurhidayati, S.Pd';
  const bendaharaNik = bendaharaStaf?.nik || '-';
  const kepalaSekolahNama = schoolSettings?.kepalaSekolah || 'Dr. H. Ahmad Fauzi, M.Pd';
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
      showToast('Fitur salin gambar tidak didukung oleh peramban ini. Silakan gunakan tombol Unduh PNG.');
    }
  };

  // Copy Public Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedText(true);
      showToast('🔗 Link tautan slip berhasil disalin!');
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  // Calculations
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

      {/* Top Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBackToApp) {
                onBackToApp();
              } else {
                window.location.href = window.location.origin + window.location.pathname;
              }
            }}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Portal Sekolah</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Dokumen Resmi Terverifikasi
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
          <h3 className="text-base font-bold text-white">Memuat Data Slip Gaji...</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Sedang mengambil rincian data slip gaji digital resmi dari basis data sekolah. Mohon tunggu sebentar.
          </p>
        </div>
      ) : !slipData ? (
        <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800 p-10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">Data Slip Gaji Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Dokumen slip gaji dengan ID <code className="text-rose-300 font-mono bg-rose-950/40 px-2 py-0.5 rounded">{slipId}</code> tidak ditemukan di sistem atau mungkin telah diperbarui. Silakan hubungi bagian Tata Usaha / Bendahara Sekolah.
          </p>
          <button
            onClick={() => {
              window.location.href = window.location.origin + window.location.pathname;
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            Buka Beranda Sekolah
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          
          {/* Action Bar (Download, Print, Copy) */}
          <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden backdrop-blur-md">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Slip Gaji & Honorarium: <span className="text-emerald-400">{slipData.penerimaNama}</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Periode {slipData.bulan} {slipData.tahun} • No. Dokumen: <span className="font-mono text-slate-300">{slipData.id}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPng}
                disabled={isGeneratingImage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Unduh file gambar slip beresolusi tinggi (PNG)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Slip (PNG)</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
                title="Cetak slip atau simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Salin gambar ke papan klip (Clipboard)"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salin Gambar</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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
              id="printable-slip-gaji-public"
              className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl w-full max-w-3xl border border-slate-300 font-sans shadow-xl text-xs print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none"
              style={{ minWidth: '320px' }}
            >
              {/* KOP SURAT SEKOLAH */}
              <div className="flex items-center gap-4 pb-4 border-b-2 border-slate-900 mb-4">
                {schoolSettings?.logoUrl ? (
                  <img 
                    src={schoolSettings.logoUrl} 
                    alt="Logo Sekolah" 
                    className="w-16 h-16 object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xl shrink-0 border border-slate-300">
                    🏫
                  </div>
                )}
                <div className="flex-1 text-center pr-2">
                  <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase leading-tight">
                    {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    NPSN: {schoolSettings?.npsn || '69987123'} • Akreditasi: {schoolSettings?.akreditasi || 'A (Unggul)'}
                  </p>
                  <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                    {schoolSettings?.alamat || 'Jl. Pendidikan No. 45, Kecamatan Sukamaju'}
                    {schoolSettings?.kotaKabupaten ? `, ${schoolSettings.kotaKabupaten}` : ''}
                    {schoolSettings?.telepon ? ` • Telp: ${schoolSettings.telepon}` : ''}
                  </p>
                </div>
              </div>

              {/* JUDUL SLIP GAJI */}
              <div className="text-center my-3 pb-2 border-b border-slate-200">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-wide uppercase underline">
                  SLIP GAJI & HONORARIUM BULANAN
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1 font-bold text-slate-700 text-xs">
                  <span>Periode: <strong className="text-slate-950">{slipData.bulan} {slipData.tahun}</strong></span>
                  <span>•</span>
                  <span>No. Slip: <strong className="font-mono text-slate-950">{slipData.id}</strong></span>
                </div>
              </div>

              {/* IDENTITAS PENERIMA */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800 text-[11px]">
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">Nama Penerima</span>
                  <span className="font-bold text-slate-950">: {slipData.penerimaNama}</span>
                </div>
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">Tanggal Bayar</span>
                  <span className="font-bold text-slate-950">: {slipData.tanggalBayar}</span>
                </div>
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">NIP / NIK</span>
                  <span className="font-bold text-slate-950">: {slipData.penerimaNipNik || '-'}</span>
                </div>
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">Metode Bayar</span>
                  <span className="font-bold text-slate-950">: {slipData.metodePembayaran}</span>
                </div>
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">Jabatan / Bagian</span>
                  <span className="font-bold text-slate-950">: {slipData.jabatan}</span>
                </div>
                <div className="flex justify-between sm:justify-start gap-2">
                  <span className="w-28 text-slate-500 font-medium">Status Pembayaran</span>
                  <span className="font-bold">
                    : <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      slipData.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {slipData.status === 'Paid' ? 'LUNAS / DITERIMA' : 'DRAFT / PENDING'}
                    </span>
                  </span>
                </div>
                {slipData.penerimaRekening && (
                  <div className="flex justify-between sm:justify-start gap-2 sm:col-span-2">
                    <span className="w-28 text-slate-500 font-medium">No. Rekening</span>
                    <span className="font-bold font-mono text-slate-950">: {slipData.penerimaRekening}</span>
                  </div>
                )}
              </div>

              {/* RINCIAN PENGHASILAN & POTONGAN (TABEL 2 KOLOM) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-[10.5px] items-stretch">
                
                {/* KOLOM KIRI: PENERIMAAN */}
                <div className="border border-emerald-300/80 rounded-xl overflow-hidden bg-emerald-50/25 flex flex-col h-full shadow-sm">
                  <div className="bg-emerald-700 text-white px-3.5 py-2 flex justify-between items-center">
                    <span className="text-[10.5px] font-black uppercase tracking-wide">1. PENERIMAAN / PENGHASILAN</span>
                    <span className="text-[9px] font-bold opacity-90">JUMLAH</span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-[10.5px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Gaji Pokok</span>
                        <span className="font-mono font-bold text-slate-950">Rp {slipData.gajiPokok.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Tunj. Jabatan & Ops</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tJabatan.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Tunj. Wali Kelas (Walas)</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tWalas.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Ketepatan Waktu</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tKetepatan.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Tunj. Kehadiran</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tHadir.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Tunj. Piket</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tPiket.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                        <span className="text-slate-600 font-medium">• Excess Time (Jam Tambahan)</span>
                        <span className="font-mono font-bold text-slate-950">Rp {tExcess.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2.5 mt-3 border-t-2 border-emerald-600 font-black text-xs text-emerald-950">
                      <span>Subtotal Penerimaan</span>
                      <span className="font-mono">Rp {subtotalPenghasilan.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: POTONGAN */}
                <div className="border border-rose-300/80 rounded-xl overflow-hidden bg-rose-50/25 flex flex-col h-full shadow-sm">
                  <div className="bg-rose-700 text-white px-3.5 py-2 flex justify-between items-center">
                    <span className="text-[10.5px] font-black uppercase tracking-wide">2. POTONGAN & DENDA</span>
                    <span className="text-[9px] font-bold opacity-90">JUMLAH</span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-[10.5px]">
                    <div className="space-y-1.5">
                      <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                        <span className="text-slate-600 font-medium">• Potongan Absensi / Umum</span>
                        <span className="font-mono font-bold text-slate-950">Rp {pAbsensi.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                        <span className="text-slate-600 font-medium">• Denda Terlambat</span>
                        <span className="font-mono font-bold text-slate-950">Rp {pTerlambat.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                        <span className="text-slate-600 font-medium">• Denda Lupa Finger</span>
                        <span className="font-mono font-bold text-slate-950">Rp {pFinger.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                        <span className="text-slate-600 font-medium">• Potongan Koperasi</span>
                        <span className="font-mono font-bold text-slate-950">Rp {pKoperasi.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                        <span className="text-slate-600 font-medium">• Kas Bon / Pinjaman</span>
                        <span className="font-mono font-bold text-slate-950">Rp {pKasBon.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2.5 mt-3 border-t-2 border-rose-600 font-black text-xs text-rose-950">
                      <span>Total Potongan</span>
                      <span className="font-mono">Rp {totalPotongan.toLocaleString('id-ID')}</span>
                    </div>
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
                      Terbilang: <em>"{terbilang(slipData.totalDiterima)}"</em>
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
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
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

            <button
              onClick={() => {
                window.location.href = window.location.origin + window.location.pathname;
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Masuk Portal Utama</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
