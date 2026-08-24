import React, { useState, useMemo, useEffect } from 'react';
import { downloadCSV, terbilang, captureElementToBlob, downloadElementAsImage, copyElementImageToClipboard } from '../lib/exportUtils';
import { dbClearCollection } from '../lib/firebaseSync';
import { 
  Wallet, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Send, 
  Settings, 
  CheckCheck, 
  Printer, 
  Calendar, 
  User, 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  DollarSign,
  AlertCircle,
  FileText,
  Sliders,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Tag,
  GraduationCap,
  Sparkles,
  Layers,
  RefreshCw,
  RotateCcw,
  MessageSquare,
  Smartphone,
  Bell,
  Building2,
  QrCode,
  Coins,
  Image as ImageIcon,
  Copy,
  Share2,
  Loader2,
  X,
  Upload
} from 'lucide-react';
import { TagihanKeuangan, TransaksiKeuangan, Siswa, KeuanganSubTab, TarifBiaya, TipeKeuangan, SchoolSettings, RombelKelas, EkstrakurikulerItem, GajiPembayaran, Guru, Staf } from '../types/school';
import { sendFonnteMessage } from '../lib/fonnte';
import { INITIAL_FONNTE_CONFIG, INITIAL_TARIF_BIAYA, INITIAL_ROMBEL } from '../data/mockData';

interface KeuanganViewProps {
  tagihanList: TagihanKeuangan[];
  setTagihanList: React.Dispatch<React.SetStateAction<TagihanKeuangan[]>>;
  transaksiList: TransaksiKeuangan[];
  setTransaksiList: React.Dispatch<React.SetStateAction<TransaksiKeuangan[]>>;
  userGoogleToken: string;
  siswaList?: Siswa[];
  setSiswaList?: React.Dispatch<React.SetStateAction<Siswa[]>>;
  rombelList?: RombelKelas[];
  subTab?: KeuanganSubTab;
  setSubTab?: (subTab: KeuanganSubTab) => void;
  tarifBiayaList?: TarifBiaya[];
  setTarifBiayaList?: React.Dispatch<React.SetStateAction<TarifBiaya[]>>;
  schoolSettings?: SchoolSettings;
  setSchoolSettings?: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  ekskulList?: EkstrakurikulerItem[];
  gajiList?: GajiPembayaran[];
  setGajiList?: React.Dispatch<React.SetStateAction<GajiPembayaran[]>>;
  guruList?: Guru[];
  stafList?: Staf[];
  onRefresh?: () => void;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  tagihanList,
  setTagihanList,
  transaksiList,
  setTransaksiList,
  userGoogleToken,
  siswaList = [],
  setSiswaList,
  rombelList = INITIAL_ROMBEL,
  subTab,
  setSubTab,
  tarifBiayaList: propTarifBiayaList,
  setTarifBiayaList: propSetTarifBiayaList,
  schoolSettings,
  setSchoolSettings,
  ekskulList = [],
  gajiList = [],
  setGajiList,
  guruList = [],
  stafList = [],
  onRefresh
}) => {
  // Navigation Subtab State
  const [localActiveTab, setLocalActiveTab] = useState<KeuanganSubTab>('pembayaran');
  const activeTab = subTab || localActiveTab;

  const handleTabChange = (tab: KeuanganSubTab) => {
    if (setSubTab) {
      setSubTab(tab);
    }
    setLocalActiveTab(tab);
  };

  // Internal Fee Rate State (fallback if not provided via props)
  const [internalTarifList, setInternalTarifList] = useState<TarifBiaya[]>(INITIAL_TARIF_BIAYA);
  const tarifList = propTarifBiayaList || internalTarifList;
  const setTarifList = propSetTarifBiayaList || setInternalTarifList;

  // Filter Data Pembayaran Siswa State
  const [tahunAjaran, setTahunAjaran] = useState<string>(schoolSettings?.tahunAjaran || '2026/2027');
  const [semester, setSemester] = useState<string>(schoolSettings?.semesterAktif || 'Ganjil');
  const [searchKey, setSearchKey] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (schoolSettings?.tahunAjaran) {
      setTahunAjaran(schoolSettings.tahunAjaran);
    }
    if (schoolSettings?.semesterAktif) {
      setSemester(schoolSettings.semesterAktif);
    }
  }, [schoolSettings]);

  // Gaji (Payroll) State Declarations
  const [showBayarGajiModal, setShowBayarGajiModal] = useState<boolean>(false);
  const [showSlipGajiModal, setShowSlipGajiModal] = useState<boolean>(false);
  const [selectedGajiForSlip, setSelectedGajiForSlip] = useState<GajiPembayaran | null>(null);
  const [editingGaji, setEditingGaji] = useState<GajiPembayaran | null>(null);
  const [isProcessingSlipImage, setIsProcessingSlipImage] = useState<boolean>(false);
  const [slipSendingStatus, setSlipSendingStatus] = useState<string>('');
  const [offscreenSlipItem, setOffscreenSlipItem] = useState<GajiPembayaran | null>(null);

  // Bulk Auto-send Gaji State
  const [isBulkSendingGaji, setIsBulkSendingGaji] = useState<boolean>(false);
  const [bulkGajiProgress, setBulkGajiProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  // Form State for Gaji
  const [gajiPenerimaTipe, setGajiPenerimaTipe] = useState<'guru' | 'staf'>('guru');
  const [gajiPenerimaId, setGajiPenerimaId] = useState<string>('');
  const [gajiPokok, setGajiPokok] = useState<number>(3000000);
  const [gajiTunjangan, setGajiTunjangan] = useState<number>(500000);
  const [gajiTunjanganWalas, setGajiTunjanganWalas] = useState<number>(0);
  const [gajiTunjanganKetepatanWaktu, setGajiTunjanganKetepatanWaktu] = useState<number>(0);
  const [gajiTunjanganKehadiran, setGajiTunjanganKehadiran] = useState<number>(0);
  const [gajiTunjanganPiket, setGajiTunjanganPiket] = useState<number>(0);
  const [gajiTunjanganExcessTime, setGajiTunjanganExcessTime] = useState<number>(0);

  const [gajiPotongan, setGajiPotongan] = useState<number>(0);
  const [gajiPotonganDendaTerlambat, setGajiPotonganDendaTerlambat] = useState<number>(0);
  const [gajiPotonganDendaTerlambatLebih, setGajiPotonganDendaTerlambatLebih] = useState<number>(0);
  const [gajiPotonganDendaLupaFinger, setGajiPotonganDendaLupaFinger] = useState<number>(0);
  const [gajiPotonganKoperasi, setGajiPotonganKoperasi] = useState<number>(0);
  const [gajiPotonganKasBon, setGajiPotonganKasBon] = useState<number>(0);

  const [gajiBulan, setGajiBulan] = useState<string>('Juli');
  const [gajiTahun, setGajiTahun] = useState<string>(new Date().getFullYear().toString());
  const [gajiMetode, setGajiMetode] = useState<'Cash' | 'Transfer Bank' | 'E-Wallet'>('Transfer Bank');
  const [gajiTanggal, setGajiTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gajiStatus, setGajiStatus] = useState<'Draft' | 'Paid'>('Paid');
  const [gajiCatatan, setGajiCatatan] = useState<string>('');
  const [gajiRekening, setGajiRekening] = useState<string>('');

  // Filters for Gaji list
  const [gajiSearchQuery, setGajiSearchQuery] = useState<string>('');
  const [gajiFilterTipe, setGajiFilterTipe] = useState<'semua' | 'guru' | 'staf'>('semua');
  const [gajiFilterStatus, setGajiFilterStatus] = useState<'semua' | 'Draft' | 'Paid'>('semua');
  const [gajiFilterBulan, setGajiFilterBulan] = useState<string>('semua');

  // Rekap Laporan Gaji Bulanan State
  const [showRekapGajiModal, setShowRekapGajiModal] = useState<boolean>(false);
  const [rekapGajiBulan, setRekapGajiBulan] = useState<string>('Juli');
  const [rekapGajiTahun, setRekapGajiTahun] = useState<string>(new Date().getFullYear().toString());
  const [rekapGajiTipe, setRekapGajiTipe] = useState<'semua' | 'guru' | 'staf'>('semua');
  const [rekapGajiStatus, setRekapGajiStatus] = useState<'semua' | 'Draft' | 'Paid'>('semua');
  const [rekapTemplateMode, setRekapTemplateMode] = useState<'excel' | 'modern'>('excel');

  // Gaji UI alerts & confirmation states
  const [gajiToast, setGajiToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [gajiToDeleteId, setGajiToDeleteId] = useState<string | null>(null);

  // Active Bendahara / Keuangan Staff
  const bendaharaStaf = useMemo(() => {
    return (stafList || []).find(s => 
      s.bagian === 'Bendahara / Keuangan' || 
      (s.bagian && s.bagian.toLowerCase().includes('bendahara')) ||
      (s.bagian && s.bagian.toLowerCase().includes('keuangan'))
    ) || null;
  }, [stafList]);

  const bendaharaNama = bendaharaStaf?.nama || schoolSettings?.namaKasir || 'Nurhidayati, S.Pd';
  const bendaharaNik = bendaharaStaf?.nik || '-';

  // Auto-clear toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setGajiToast({ message, type });
    setTimeout(() => {
      setGajiToast(null);
    }, 4000);
  };

  // Submit/Save Gaji Transaction
  const handleSaveGaji = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gajiPenerimaId) {
      showToast('Pilih penerima gaji terlebih dahulu', 'error');
      return;
    }

    let name = '';
    let nipNik = '';
    let jab = '';

    if (gajiPenerimaTipe === 'guru') {
      const g = guruList.find(item => item.id === gajiPenerimaId);
      if (g) {
        name = g.nama;
        nipNik = g.nik || g.nip || '';
        jab = g.jabatan || 'Guru';
      }
    } else {
      const s = stafList.find(item => item.id === gajiPenerimaId);
      if (s) {
        name = s.nama;
        nipNik = s.nik || s.nip || '';
        jab = s.bagian || 'Staf';
      }
    }

    const totalTunjanganCalc = Number(gajiTunjangan) +
      Number(gajiTunjanganWalas) +
      Number(gajiTunjanganKetepatanWaktu) +
      Number(gajiTunjanganKehadiran) +
      Number(gajiTunjanganPiket) +
      Number(gajiTunjanganExcessTime);

    const totalPotonganCalc = Number(gajiPotongan) +
      Number(gajiPotonganDendaTerlambat) +
      Number(gajiPotonganDendaTerlambatLebih) +
      Number(gajiPotonganDendaLupaFinger) +
      Number(gajiPotonganKoperasi) +
      Number(gajiPotonganKasBon);

    const total = Number(gajiPokok) + totalTunjanganCalc - totalPotonganCalc;

    const payload: GajiPembayaran = {
      id: editingGaji ? editingGaji.id : `GJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      penerimaId: gajiPenerimaId,
      penerimaNama: name,
      penerimaTipe: gajiPenerimaTipe,
      penerimaNipNik: nipNik,
      jabatan: jab,
      bulan: gajiBulan,
      tahun: gajiTahun,
      gajiPokok: Number(gajiPokok),
      tunjangan: Number(gajiTunjangan),
      tunjanganWalas: Number(gajiTunjanganWalas),
      tunjanganKetepatanWaktu: Number(gajiTunjanganKetepatanWaktu),
      tunjanganKehadiran: Number(gajiTunjanganKehadiran),
      tunjanganPiket: Number(gajiTunjanganPiket),
      tunjanganExcessTime: Number(gajiTunjanganExcessTime),
      potongan: Number(gajiPotongan),
      potonganDendaTerlambat: Number(gajiPotonganDendaTerlambat),
      potonganDendaTerlambatLebih: Number(gajiPotonganDendaTerlambatLebih),
      potonganDendaLupaFinger: Number(gajiPotonganDendaLupaFinger),
      potonganKoperasi: Number(gajiPotonganKoperasi),
      potonganKasBon: Number(gajiPotonganKasBon),
      totalDiterima: total,
      tanggalBayar: gajiTanggal,
      metodePembayaran: gajiMetode,
      status: gajiStatus,
      catatan: gajiCatatan,
      penerimaRekening: gajiRekening
    };

    if (setGajiList) {
      setGajiList(prev => {
        if (editingGaji) {
          return prev.map(item => item.id === editingGaji.id ? payload : item);
        } else {
          return [payload, ...prev];
        }
      });
      showToast(editingGaji ? 'Transaksi pembayaran gaji berhasil diperbarui!' : 'Transaksi pembayaran gaji baru berhasil ditambahkan!');
    } else {
      showToast('Gagal memproses karena setter data gaji tidak terdefinisi', 'error');
    }

    // Reset Form
    setShowBayarGajiModal(false);
    setEditingGaji(null);
    setGajiPenerimaId('');
    setGajiPokok(3000000);
    setGajiTunjangan(500000);
    setGajiTunjanganWalas(0);
    setGajiTunjanganKetepatanWaktu(0);
    setGajiTunjanganKehadiran(0);
    setGajiTunjanganPiket(0);
    setGajiTunjanganExcessTime(0);
    setGajiPotongan(0);
    setGajiPotonganDendaTerlambat(0);
    setGajiPotonganDendaTerlambatLebih(0);
    setGajiPotonganDendaLupaFinger(0);
    setGajiPotonganKoperasi(0);
    setGajiPotonganKasBon(0);
    setGajiCatatan('');
    setGajiRekening('');
  };

  const handleEditGajiClick = (item: GajiPembayaran) => {
    setEditingGaji(item);
    setGajiPenerimaTipe(item.penerimaTipe);
    setGajiPenerimaId(item.penerimaId);
    setGajiPokok(item.gajiPokok);
    setGajiTunjangan(item.tunjangan);
    setGajiTunjanganWalas(item.tunjanganWalas || 0);
    setGajiTunjanganKetepatanWaktu(item.tunjanganKetepatanWaktu || 0);
    setGajiTunjanganKehadiran(item.tunjanganKehadiran || 0);
    setGajiTunjanganPiket(item.tunjanganPiket || 0);
    setGajiTunjanganExcessTime(item.tunjanganExcessTime || 0);
    setGajiPotongan(item.potongan);
    setGajiPotonganDendaTerlambat(item.potonganDendaTerlambat || 0);
    setGajiPotonganDendaTerlambatLebih(item.potonganDendaTerlambatLebih || 0);
    setGajiPotonganDendaLupaFinger(item.potonganDendaLupaFinger || 0);
    setGajiPotonganKoperasi(item.potonganKoperasi || 0);
    setGajiPotonganKasBon(item.potonganKasBon || 0);
    setGajiBulan(item.bulan);
    setGajiTahun(item.tahun);
    setGajiMetode(item.metodePembayaran);
    setGajiTanggal(item.tanggalBayar);
    setGajiStatus(item.status);
    setGajiCatatan(item.catatan || '');
    setGajiRekening(item.penerimaRekening || '');
    setShowBayarGajiModal(true);
  };

  const handleExecuteDeleteGaji = () => {
    if (gajiToDeleteId) {
      if (setGajiList) {
        setGajiList(prev => prev.filter(item => item.id !== gajiToDeleteId));
        showToast('Pembayaran gaji berhasil dihapus dari sistem!');
      }
      setGajiToDeleteId(null);
    }
  };

  // Helper untuk membuat blob gambar slip gaji (baik modal terbuka maupun di latar belakang)
  const generateSlipImageBlob = async (item: GajiPembayaran): Promise<Blob | null> => {
    // 1. Jika modal slip sedang terbuka untuk item ini
    const modalEl = document.getElementById('printable-slip-gaji');
    if (modalEl && selectedGajiForSlip?.id === item.id) {
      return await captureElementToBlob(modalEl);
    }

    // 2. Render ke offscreen element
    setOffscreenSlipItem(item);
    await new Promise(resolve => setTimeout(resolve, 150));
    const offscreenEl = document.getElementById('printable-slip-gaji-offscreen');
    if (offscreenEl) {
      return await captureElementToBlob(offscreenEl);
    }
    return null;
  };

  // Unduh Slip Gaji sebagai Gambar PNG
  const handleDownloadSlipImage = async (item: GajiPembayaran) => {
    const safeName = (item.penerimaNama || 'Penerima').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Slip_Gaji_${safeName}_${item.bulan}_${item.tahun}`;
    showToast('Sedang membuat gambar slip gaji (PNG)...');
    
    let element = document.getElementById('printable-slip-gaji');
    if (!element) {
      setOffscreenSlipItem(item);
      await new Promise(res => setTimeout(res, 150));
      element = document.getElementById('printable-slip-gaji-offscreen');
    }
    
    if (!element) {
      showToast('Gagal merender elemen slip gaji.', 'error');
      return;
    }

    const success = await downloadElementAsImage(element, filename);
    if (success) {
      showToast('✅ Gambar Slip Gaji berhasil diunduh (PNG)!');
    } else {
      showToast('Gagal mengunduh gambar slip.', 'error');
    }
  };

  // Salin Gambar Slip Gaji ke Clipboard
  const handleCopySlipImage = async (item: GajiPembayaran) => {
    let element = document.getElementById('printable-slip-gaji');
    if (!element) {
      setOffscreenSlipItem(item);
      await new Promise(res => setTimeout(res, 150));
      element = document.getElementById('printable-slip-gaji-offscreen');
    }

    if (!element) {
      showToast('Gagal menemukan elemen slip gaji.', 'error');
      return;
    }

    showToast('Menyalin gambar slip ke clipboard...');
    const success = await copyElementImageToClipboard(element);
    if (success) {
      showToast('📋 Gambar Slip Gaji berhasil disalin ke Clipboard! Tinggal tekan Ctrl+V di chat WhatsApp.');
    } else {
      showToast('Peramban tidak mendukung salin gambar otomatis. Silakan gunakan tombol Unduh Gambar.', 'error');
    }
  };

  // Build pesan teks slip gaji
  const buildGajiWhatsAppMessage = (item: GajiPembayaran) => {
    const tWalas = item.tunjanganWalas || 0;
    const tKetepatan = item.tunjanganKetepatanWaktu || 0;
    const tHadir = item.tunjanganKehadiran || 0;
    const tPiket = item.tunjanganPiket || 0;
    const tExcess = item.tunjanganExcessTime || 0;
    const tJabatan = item.tunjangan || 0;

    const pTerlambat = item.potonganDendaTerlambat || 0;
    const pFinger = item.potonganDendaLupaFinger || 0;
    const pKoperasi = item.potonganKoperasi || 0;
    const pKasBon = item.potonganKasBon || 0;
    const pAbsensi = item.potongan || 0;

    const totalT = tJabatan + tWalas + tKetepatan + tHadir + tPiket + tExcess;
    const totalP = pAbsensi + pTerlambat + pFinger + pKoperasi + pKasBon;
    const subtotalPenghasilan = item.gajiPokok + totalT;

    const formattedGajiPokok = item.gajiPokok.toLocaleString('id-ID');
    const formattedTotal = item.totalDiterima.toLocaleString('id-ID');

    let tunjanganLines = '';
    if (tJabatan > 0) tunjanganLines += `  • Tunj. Jabatan & Ops: Rp ${tJabatan.toLocaleString('id-ID')}\n`;
    if (tWalas > 0) tunjanganLines += `  • Tunj. Wali Kelas: Rp ${tWalas.toLocaleString('id-ID')}\n`;
    if (tKetepatan > 0) tunjanganLines += `  • Ketepatan Waktu: Rp ${tKetepatan.toLocaleString('id-ID')}\n`;
    if (tHadir > 0) tunjanganLines += `  • Tunj. Kehadiran: Rp ${tHadir.toLocaleString('id-ID')}\n`;
    if (tPiket > 0) tunjanganLines += `  • Tunj. Piket: Rp ${tPiket.toLocaleString('id-ID')}\n`;
    if (tExcess > 0) tunjanganLines += `  • Excess Time: Rp ${tExcess.toLocaleString('id-ID')}\n`;

    let potonganLines = '';
    if (pAbsensi > 0) potonganLines += `  • Pot. Absensi/Umum: Rp ${pAbsensi.toLocaleString('id-ID')}\n`;
    if (pTerlambat > 0) potonganLines += `  • Denda Terlambat: Rp ${pTerlambat.toLocaleString('id-ID')}\n`;
    if (pFinger > 0) potonganLines += `  • Denda Lupa Finger: Rp ${pFinger.toLocaleString('id-ID')}\n`;
    if (pKoperasi > 0) potonganLines += `  • Potongan Koperasi: Rp ${pKoperasi.toLocaleString('id-ID')}\n`;
    if (pKasBon > 0) potonganLines += `  • Kas Bon: Rp ${pKasBon.toLocaleString('id-ID')}\n`;

    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
    const slipDownloadUrl = `${baseUrl}?slip=${encodeURIComponent(item.id)}`;

    return `🧾 *SLIP GAJI & HONORARIUM BULANAN*\n` +
      `*${schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}*\n` +
      `Periode: *${item.bulan} ${item.tahun}*\n` +
      `No. Slip: ${item.id}\n` +
      `─────────────────────────\n` +
      `👤 *Data Penerima:*\n` +
      `• Nama: *${item.penerimaNama}*\n` +
      `• NIP/NIK: ${(item.penerimaNipNik && item.penerimaNipNik !== '-') ? item.penerimaNipNik : '-'}\n` +
      `• Jabatan: ${item.jabatan}\n\n` +
      `💰 *1. PENERIMAAN:*\n` +
      `  • Gaji Pokok: Rp ${formattedGajiPokok}\n` +
      `${tunjanganLines}` +
      `  *Subtotal Penerimaan: Rp ${subtotalPenghasilan.toLocaleString('id-ID')}*\n\n` +
      `🔻 *2. POTONGAN:*\n` +
      `${potonganLines || '  • (Tidak ada potongan)\n'}` +
      `  *Total Potongan: Rp ${totalP.toLocaleString('id-ID')}*\n\n` +
      `─────────────────────────\n` +
      `💵 *TOTAL BERSIH (NET INCOME): Rp ${formattedTotal}*\n` +
      `_(${terbilang(item.totalDiterima)})_\n` +
      `─────────────────────────\n` +
      `• Status: *${item.status === 'Paid' ? 'LUNAS / TELAH DIBAYAR' : 'DRAFT / PENDING'}*\n` +
      `• Metode: ${item.metodePembayaran}\n` +
      `• Tanggal: ${item.tanggalBayar}\n` +
      `${item.penerimaRekening ? `• No. Rekening: ${item.penerimaRekening}\n` : ''}` +
      `${item.catatan ? `• Catatan: ${item.catatan}\n` : ''}\n` +
      `📥 *Link Unduh & Lihat Slip Digital:*\n` +
      `${slipDownloadUrl}\n\n` +
      `🖼️ *Gambar slip gaji resmi terlampir.* (Tersedia format cetak & unduh di tautan resmi di atas)\n\n` +
      `Terima kasih atas dedikasi dan kerja keras Ibu/Bapak.\n\n` +
      `Salam hangat,\n*Bendahara & Manajemen Keuangan Sekolah*`;
  };

  // Kirim slip gaji via WhatsApp secara otomatis (dengan gambar lampiran & rincian)
  const handleKirimGajiWA = async (item: GajiPembayaran) => {
    let phone = '';
    if (item.penerimaTipe === 'guru') {
      const g = guruList.find(x => x.id === item.penerimaId);
      phone = g?.telepon || '';
    } else {
      const s = stafList.find(x => x.id === item.penerimaId);
      phone = s?.telepon || '';
    }

    if (!phone) {
      showToast('Nomor telepon penerima tidak ditemukan atau kosong.', 'error');
      return;
    }

    setIsProcessingSlipImage(true);
    setSlipSendingStatus('Membuat gambar slip gaji beresolusi tinggi...');
    
    const safeName = (item.penerimaNama || 'Penerima').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Slip_Gaji_${safeName}_${item.bulan}_${item.tahun}.png`;

    const msg = buildGajiWhatsAppMessage(item);

    // Generate slip image blob for WhatsApp Gateway
    const slipBlob = await generateSlipImageBlob(item);
    
    // Copy image to clipboard so user can easily paste if using WhatsApp Web
    const targetEl = document.getElementById('printable-slip-gaji') || document.getElementById('printable-slip-gaji-offscreen');
    if (targetEl) {
      copyElementImageToClipboard(targetEl).catch(() => {});
    }

    setSlipSendingStatus('Mengirimkan slip gaji ke WhatsApp penerima...');

    const apiToken = schoolSettings?.fonnteToken || '';
    if (apiToken) {
      try {
        const result = await sendFonnteMessage(phone, msg, apiToken, slipBlob, filename);
        if (result.success) {
          showToast(`✅ Slip gaji & gambar resmi berhasil dikirim otomatis ke WA ${item.penerimaNama}!`);
        } else {
          showToast(`Gagal kirim via Gateway: ${result.message || 'Terjadi kesalahan'}.`, 'error');
        }
      } catch (err) {
        showToast('Koneksi WhatsApp Gateway terputus.', 'error');
      }
    } else {
      // Fallback Direct WA link
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
      const newTab = window.open(waUrl, '_blank');
      if (newTab) {
        showToast('✅ WhatsApp dibuka! Rincian slip gaji & link digital siap dikirim.');
      } else {
        showToast('Gagal membuka popup WhatsApp, silakan izinkan popup di browser Anda.', 'error');
      }
    }

    setIsProcessingSlipImage(false);
    setSlipSendingStatus('');
  };

  // Bulk Auto-send Gaji to All Filtered Recipients
  const handleBulkKirimGajiWA = async () => {
    const targets = filteredGajiList.filter(item => {
      const g = item.penerimaTipe === 'guru' ? guruList.find(x => x.id === item.penerimaId) : stafList.find(x => x.id === item.penerimaId);
      return Boolean(g?.telepon);
    });

    if (targets.length === 0) {
      showToast('Tidak ada data gaji dengan nomor telepon WhatsApp yang valid untuk dikirim.', 'error');
      return;
    }

    if (!confirm(`Kirim gambar slip gaji resmi otomatis ke ${targets.length} penerima melalui WhatsApp Gateway?`)) {
      return;
    }

    setIsBulkSendingGaji(true);
    let successCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const item = targets[i];
      setBulkGajiProgress({ current: i + 1, total: targets.length, name: item.penerimaNama });
      
      try {
        let phone = '';
        if (item.penerimaTipe === 'guru') {
          const g = guruList.find(x => x.id === item.penerimaId);
          phone = g?.telepon || '';
        } else {
          const s = stafList.find(x => x.id === item.penerimaId);
          phone = s?.telepon || '';
        }

        if (phone) {
          const safeName = (item.penerimaNama || 'Penerima').replace(/[^a-zA-Z0-9_-]/g, '_');
          const filename = `Slip_Gaji_${safeName}_${item.bulan}_${item.tahun}.png`;
          const msg = buildGajiWhatsAppMessage(item);
          const slipBlob = await generateSlipImageBlob(item);
          const apiToken = schoolSettings?.fonnteToken || '';
          
          await sendFonnteMessage(phone, msg, apiToken, slipBlob, filename);
          successCount++;
        }
        // Small throttling delay to avoid gateway flood
        await new Promise(res => setTimeout(res, 600));
      } catch (err) {
        console.error('Error auto-sending gaji to:', item.penerimaNama, err);
      }
    }

    setIsBulkSendingGaji(false);
    setBulkGajiProgress(null);
    showToast(`✅ Selesai! ${successCount} dari ${targets.length} slip gaji bergambar berhasil dikirim otomatis ke WhatsApp.`);
  };

  // Filtered Gaji List Memo
  const filteredGajiList = useMemo(() => {
    return gajiList.filter(item => {
      // Search Match
      const searchLower = gajiSearchQuery.toLowerCase();
      const matchSearch = 
        (item.penerimaNama || '').toLowerCase().includes(searchLower) ||
        (item.penerimaNipNik || '').toLowerCase().includes(searchLower) ||
        (item.jabatan || '').toLowerCase().includes(searchLower) ||
        (item.id || '').toLowerCase().includes(searchLower);

      // Tipe Match
      const matchTipe = gajiFilterTipe === 'semua' || item.penerimaTipe === gajiFilterTipe;

      // Status Match
      const matchStatus = gajiFilterStatus === 'semua' || item.status === gajiFilterStatus;

      // Bulan Match
      const matchBulan = gajiFilterBulan === 'semua' || item.bulan === gajiFilterBulan;

      return matchSearch && matchTipe && matchStatus && matchBulan;
    });
  }, [gajiList, gajiSearchQuery, gajiFilterTipe, gajiFilterStatus, gajiFilterBulan]);

  // Filtered Rekap Gaji List for Monthly Report
  const rekapGajiFiltered = useMemo(() => {
    return gajiList.filter(item => {
      const matchBulan = rekapGajiBulan === 'semua' || item.bulan.toLowerCase() === rekapGajiBulan.toLowerCase();
      const matchTahun = !rekapGajiTahun || item.tahun.toString() === rekapGajiTahun.toString();
      const matchTipe = rekapGajiTipe === 'semua' || item.penerimaTipe === rekapGajiTipe;
      const matchStatus = rekapGajiStatus === 'semua' || item.status === rekapGajiStatus;
      return matchBulan && matchTahun && matchTipe && matchStatus;
    });
  }, [gajiList, rekapGajiBulan, rekapGajiTahun, rekapGajiTipe, rekapGajiStatus]);

  // Aggregated totals for Monthly Recap
  const rekapGajiTotals = useMemo(() => {
    let totalPokok = 0;
    let totalJabatan = 0; // Tunjangan Fungsional
    let totalWalas = 0; // TJ Walas
    let totalKetepatan = 0; // Ketetapan Waktu
    let totalKehadiran = 0; // TJ Kehadiran
    let totalPiket = 0; // Piket
    let totalExcess = 0; // Exces Time
    let totalTunjangan = 0;
    let totalGross = 0;

    let totalPotAbsensi = 0;
    let totalPotTerlambat = 0; // Denda Terlambat < 30 Min
    let totalPotTerlambatLebih = 0; // Denda Terlambat > 30 Min
    let totalPotFinger = 0; // Denda Lupa Finger
    let totalPotKoperasi = 0; // Pot. Koperasi
    let totalPotKasBon = 0; // Gaji Diambil Dimuka
    let totalPotongan = 0;

    let totalNet = 0;
    let totalPaid = 0;
    let totalDraft = 0;

    rekapGajiFiltered.forEach(item => {
      const tJ = item.tunjangan || 0;
      const tW = item.tunjanganWalas || 0;
      const tK = item.tunjanganKetepatanWaktu || 0;
      const tH = item.tunjanganKehadiran || 0;
      const tP = item.tunjanganPiket || 0;
      const tE = item.tunjanganExcessTime || 0;
      const sumT = tJ + tW + tK + tH + tP + tE;

      const pA = item.potongan || 0;
      const pT = item.potonganDendaTerlambat || 0;
      const pTL = item.potonganDendaTerlambatLebih || 0;
      const pF = item.potonganDendaLupaFinger || 0;
      const pK = item.potonganKoperasi || 0;
      const pB = item.potonganKasBon || 0;
      const sumP = pA + pT + pTL + pF + pK + pB;

      totalPokok += item.gajiPokok || 0;
      totalJabatan += tJ;
      totalWalas += tW;
      totalKetepatan += tK;
      totalKehadiran += tH;
      totalPiket += tP;
      totalExcess += tE;
      totalTunjangan += sumT;
      totalGross += (item.gajiPokok || 0) + sumT;

      totalPotAbsensi += pA;
      totalPotTerlambat += pT;
      totalPotTerlambatLebih += pTL;
      totalPotFinger += pF;
      totalPotKoperasi += pK;
      totalPotKasBon += pB;
      totalPotongan += sumP;

      totalNet += item.totalDiterima || ((item.gajiPokok || 0) + sumT - sumP);
      if (item.status === 'Paid') totalPaid++;
      else totalDraft++;
    });

    return {
      totalPokok,
      totalJabatan,
      totalWalas,
      totalKetepatan,
      totalKehadiran,
      totalPiket,
      totalExcess,
      totalTunjangan,
      totalGross,
      totalPotAbsensi,
      totalPotTerlambat,
      totalPotTerlambatLebih,
      totalPotFinger,
      totalPotKoperasi,
      totalPotKasBon,
      totalPotongan,
      totalNet,
      totalPaid,
      totalDraft,
      count: rekapGajiFiltered.length
    };
  }, [rekapGajiFiltered]);

  // Export CSV Rekap Gaji Bulanan (Format Template Master 18 Kolom)
  const handleExportRekapGajiCSV = () => {
    if (rekapGajiFiltered.length === 0) {
      showToast('Tidak ada data gaji pada periode yang dipilih untuk diekspor.', 'error');
      return;
    }

    const filename = `Rekap_Gaji_Karyawan_${rekapGajiBulan}_${rekapGajiTahun}`;
    const headers = [
      'No',
      'NAMA',
      'JABATAN',
      'GAJI POKOK',
      'TJ WALAS',
      'TUNJANGAN FUNGSIONAL',
      'KETETAPAN WAKTU',
      'TJ KEHADIRAN',
      'PIKET',
      'EXCES TIME',
      'JML PENDAPATAN',
      'DENDA TERLAMBAT < 30 MIN',
      'DENDA TERLAMBAT > 30 MIN',
      'DENDA LUPA FINGER',
      'POT. KOPERASI',
      'GAJI DIAMBIL DIMUKA',
      'TOTAL POTONGAN',
      'GAJI BERSIH'
    ];

    const rows: (string | number)[][] = [];

    // Header index row 1..18
    rows.push(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']);

    rekapGajiFiltered.forEach((item, idx) => {
      const tJ = item.tunjangan || 0;
      const tW = item.tunjanganWalas || 0;
      const tK = item.tunjanganKetepatanWaktu || 0;
      const tH = item.tunjanganKehadiran || 0;
      const tP = item.tunjanganPiket || 0;
      const tE = item.tunjanganExcessTime || 0;
      const sumT = tJ + tW + tK + tH + tP + tE;
      const jmlPendapatan = (item.gajiPokok || 0) + sumT;

      const pA = item.potongan || 0;
      const pT = item.potonganDendaTerlambat || 0;
      const pTL = item.potonganDendaTerlambatLebih || 0;
      const pF = item.potonganDendaLupaFinger || 0;
      const pK = item.potonganKoperasi || 0;
      const pB = item.potonganKasBon || 0;
      const sumP = pA + pT + pTL + pF + pK + pB;
      const gajiBersih = item.totalDiterima || (jmlPendapatan - sumP);

      rows.push([
        idx + 1,
        item.penerimaNama.toUpperCase(),
        (item.jabatan || '').toUpperCase(),
        item.gajiPokok || 0,
        tW || 0,
        tJ || 0,
        tK || 0,
        tH || 0,
        tP || 0,
        tE || 0,
        jmlPendapatan,
        pT || 0,
        pTL || 0,
        pF || 0,
        pK || 0,
        pB || 0,
        sumP,
        gajiBersih
      ]);
    });

    // Grand Total row
    rows.push([
      'TOTAL',
      `TOTAL ${rekapGajiTotals.count} PEGAWAI`,
      '',
      rekapGajiTotals.totalPokok,
      rekapGajiTotals.totalWalas,
      rekapGajiTotals.totalJabatan,
      rekapGajiTotals.totalKetepatan,
      rekapGajiTotals.totalKehadiran,
      rekapGajiTotals.totalPiket,
      rekapGajiTotals.totalExcess,
      rekapGajiTotals.totalGross,
      rekapGajiTotals.totalPotTerlambat,
      rekapGajiTotals.totalPotTerlambatLebih,
      rekapGajiTotals.totalPotFinger,
      rekapGajiTotals.totalPotKoperasi,
      rekapGajiTotals.totalPotKasBon,
      rekapGajiTotals.totalPotongan,
      rekapGajiTotals.totalNet
    ]);

    downloadCSV(headers, rows, filename);
    showToast('✅ Berhasil mengekspor Rekap Gaji Karyawan (18 Kolom Format Master Sheet)!');
  };

  // Salin Ringkasan Rekap Gaji Bulanan ke Clipboard (format WhatsApp)
  const handleCopyRekapGajiSummary = () => {
    const text = `📊 *REKAPITULASI LAPORAN PENGGAJIAN & HONORARIUM*\n` +
      `*${schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}*\n` +
      `Periode: *${rekapGajiBulan} ${rekapGajiTahun}*\n` +
      `─────────────────────────\n` +
      `👥 *Total Penerima:* ${rekapGajiTotals.count} Orang (${rekapGajiTotals.totalPaid} Lunas, ${rekapGajiTotals.totalDraft} Draft)\n` +
      `💵 *Total Gaji Pokok:* Rp ${rekapGajiTotals.totalPokok.toLocaleString('id-ID')}\n` +
      `➕ *Total Tunjangan:* Rp ${rekapGajiTotals.totalTunjangan.toLocaleString('id-ID')}\n` +
      `   • Tunj. Jabatan & Ops: Rp ${rekapGajiTotals.totalJabatan.toLocaleString('id-ID')}\n` +
      `   • Tunj. Wali Kelas: Rp ${rekapGajiTotals.totalWalas.toLocaleString('id-ID')}\n` +
      `   • Kehadiran & Piket: Rp ${(rekapGajiTotals.totalKehadiran + rekapGajiTotals.totalPiket).toLocaleString('id-ID')}\n` +
      `   • Ketepatan & Excess: Rp ${(rekapGajiTotals.totalKetepatan + rekapGajiTotals.totalExcess).toLocaleString('id-ID')}\n` +
      `📈 *Subtotal Penghasilan Kotor (Gross):* Rp ${rekapGajiTotals.totalGross.toLocaleString('id-ID')}\n` +
      `➖ *Total Potongan:* Rp ${rekapGajiTotals.totalPotongan.toLocaleString('id-ID')}\n` +
      `   • Potongan Absensi: Rp ${rekapGajiTotals.totalPotAbsensi.toLocaleString('id-ID')}\n` +
      `   • Denda Terlambat/Finger: Rp ${(rekapGajiTotals.totalPotTerlambat + rekapGajiTotals.totalPotFinger).toLocaleString('id-ID')}\n` +
      `   • Koperasi & Kasbon: Rp ${(rekapGajiTotals.totalPotKoperasi + rekapGajiTotals.totalPotKasBon).toLocaleString('id-ID')}\n` +
      `─────────────────────────\n` +
      `💰 *TOTAL GAJI BERSIH (NET DISBURSED):*\n` +
      `*Rp ${rekapGajiTotals.totalNet.toLocaleString('id-ID')}*\n` +
      `Terbilang: _${terbilang(rekapGajiTotals.totalNet)} Rupiah_\n` +
      `─────────────────────────\n` +
      `Bendahara: ${bendaharaNama}\n` +
      `Kepala Sekolah: ${schoolSettings?.namaKepalaSekolah || schoolSettings?.kepalaSekolah || 'H. Ahmad Fakhri, M.Pd'}`;

    navigator.clipboard.writeText(text);
    showToast('📋 Ringkasan Rekap Gaji Bulanan berhasil disalin ke Clipboard!');
  };

  // Search Suggestions memo
  const searchSuggestions = useMemo(() => {
    if (!searchKey.trim() || searchKey.trim().length < 1) return [];
    const q = searchKey.trim().toLowerCase();
    return siswaList.filter(s => 
      s.nama.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      (s.nisn && s.nisn.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [siswaList, searchKey]);

  // Find Selected Siswa
  const selectedSiswa = useMemo(() => {
    if (!siswaList.length) return null;
    const query = appliedSearch.trim().toLowerCase();
    if (!query) return null;

    const match = siswaList.find(
      s => s.nis.toLowerCase() === query || 
           (s.nisn && s.nisn.toLowerCase() === query) ||
           s.nis.toLowerCase().includes(query) ||
           (s.nisn && s.nisn.toLowerCase().includes(query)) ||
           s.nama.toLowerCase().includes(query) ||
           s.id.toLowerCase() === query
    );

    return match || null;
  }, [siswaList, appliedSearch]);

  const studentKey = `${selectedSiswa?.nis || 'default'}_${tahunAjaran}_${semester}`;

  // Selected Months for Bulanan SPP Payment
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Dynamic Payment Months Data State with localStorage persistence
  const [paidMonthsState, setPaidMonthsState] = useState<{ [month: string]: string }>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_paid_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const allMonths = [
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
  ];

  // Dynamic Monthly SPP Fee derived from Tarif Biaya settings matching student's class
  const monthlyFee = useMemo(() => {
    if (!tarifList || tarifList.length === 0) return 100000;

    const sppTarifs = tarifList.filter(t => t.tipe === 'spp' && t.status === 'Aktif');
    if (sppTarifs.length === 0) return 100000;

    if (selectedSiswa && selectedSiswa.kelas) {
      const k = selectedSiswa.kelas.toLowerCase();
      const match = sppTarifs.find(t => {
        const tk = t.tingkatKelas.toLowerCase();
        if ((k.includes('7') || k.includes('vii')) && (tk.includes('7') || tk.includes('vii'))) return true;
        if ((k.includes('8') || k.includes('viii')) && (tk.includes('8') || tk.includes('viii'))) return true;
        if ((k.includes('9') || k.includes('ix')) && (tk.includes('9') || tk.includes('ix'))) return true;
        if ((k.includes('10') || k.includes('x')) && (tk.includes('10') || tk.includes('x'))) return true;
        if ((k.includes('11') || k.includes('xi')) && (tk.includes('11') || tk.includes('xi'))) return true;
        if ((k.includes('12') || k.includes('xii')) && (tk.includes('12') || tk.includes('xii'))) return true;
        return false;
      });
      if (match) return match.nominal;
    }

    return sppTarifs[0].nominal;
  }, [tarifList, selectedSiswa]);

  const calculatedTotal = selectedMonths.length > 0 ? selectedMonths.length * monthlyFee : 0;

  const uktTarifs = useMemo(() => tarifList.filter(t => t.tipe === 'ukt' && t.status === 'Aktif'), [tarifList]);
  const ekskulTarifs = useMemo(() => tarifList.filter(t => t.tipe === 'ekskul' && t.status === 'Aktif'), [tarifList]);
  const [quickPayType, setQuickPayType] = useState<'spp' | 'ukt' | 'ekskul'>('spp');
  const [quickPayItemId, setQuickPayItemId] = useState<string>('');

  // Rekap / Daftar Tagihan Filter States (SPP, UKT, Ekskul, Kelas/Rombel)
  const [filterTipeTagihan, setFilterTipeTagihan] = useState<'all' | 'spp' | 'ukt' | 'ekskul'>('all');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [searchTagihanQuery, setSearchTagihanQuery] = useState<string>('');

  // Synthesize complete list of tagihan covering SPP, UKT, and Ekskul for all students
  const allEffectiveTagihanList = useMemo(() => {
    // We only show bills that have been explicitly created/inputted by finance
    return tagihanList.filter(t => t && !t.isDeleted);
  }, [tagihanList]);

  // Dynamically derive list of available classes for the dropdown
  const availableKelasList = useMemo(() => {
    const list = new Set<string>();
    siswaList.forEach(s => {
      if (s.kelas) list.add(s.kelas);
    });
    return Array.from(list).sort();
  }, [siswaList]);

  // Filtered tagihan list for the Rekap table
  const filteredGlobalTagihanList = useMemo(() => {
    return allEffectiveTagihanList.filter(t => {
      if (!t) return false;
      const tTipe = (t.tipe || '').toLowerCase();
      // 1. Tipe Tagihan Filter
      if (filterTipeTagihan !== 'all') {
        if (tTipe !== filterTipeTagihan.toLowerCase()) return false;
      }
      // 2. Kelas Filter
      if (filterKelas !== 'all') {
        if ((t.kelas || '') !== filterKelas) return false;
      }

      // Calculate status for filtering
      const isSynthesized = t.id && String(t.id).startsWith('syn-');
      const txsForTagihan = transaksiList.filter(tx => 
        tx.tagihanId === t.id || 
        (isSynthesized && tx && tx.siswaNama && t && t.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === (t.siswaNama || '').trim().toLowerCase() && (tx.tipe || '').toLowerCase() === (t.tipe || '').toLowerCase())
      );
      const totalTerbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + tx.nominal, 0);
      let totalTerbayar = Math.max(t.terbayar || 0, totalTerbayarFromTx);
      if (t.status === 'Lunas' && totalTerbayar < t.nominal) {
        totalTerbayar = t.nominal;
      }
      const isLunas = t.status === 'Lunas' || (totalTerbayar >= t.nominal && t.nominal > 0);
      const isDicicil = !isLunas && totalTerbayar > 0;

      // 4. Search Query
      if (searchTagihanQuery.trim()) {
        const q = searchTagihanQuery.toLowerCase();
        const matchSiswa = (t.siswaNama || '').toLowerCase().includes(q);
        const matchKelas = (t.kelas || '').toLowerCase().includes(q);
        const matchNama = (t.namaTagihan || '').toLowerCase().includes(q);
        const matchTipe = tTipe.includes(q);
        const statusStr = isLunas ? 'lunas' : (isDicicil ? 'dicicil cicil sebagian' : 'belum lunas');
        const matchStatus = statusStr.includes(q);
        if (!matchSiswa && !matchKelas && !matchNama && !matchTipe && !matchStatus) return false;
      }
      return true;
    });
  }, [allEffectiveTagihanList, filterTipeTagihan, filterKelas, searchTagihanQuery, transaksiList]);

  // Payment Form Input States
  const [inputTotal, setInputTotal] = useState<number>(0);
  const [inputDibayar, setInputDibayar] = useState<number>(0);
  const [inputTanggalTagihan, setInputTanggalTagihan] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMetodePembayaran, setSelectedMetodePembayaran] = useState<string>('Cash / Kasir');

  // Auto-select first item when type changes or tariffs update
  React.useEffect(() => {
    if (quickPayType === 'ukt' && uktTarifs.length > 0 && !uktTarifs.some(t => t.id === quickPayItemId)) {
      setQuickPayItemId(uktTarifs[0].id);
    } else if (quickPayType === 'ekskul' && ekskulTarifs.length > 0 && !ekskulTarifs.some(t => t.id === quickPayItemId)) {
      setQuickPayItemId(ekskulTarifs[0].id);
    }
  }, [quickPayType, uktTarifs, ekskulTarifs]);

  // Sync total when selected months, monthlyFee, or selected item change
  React.useEffect(() => {
    if (quickPayType === 'spp') {
      const tot = selectedMonths.length > 0 ? selectedMonths.length * monthlyFee : 0;
      setInputTotal(tot);
      setInputDibayar(tot);
    } else if (quickPayType === 'ekskul') {
      const found = ekskulTarifs.find(t => t.id === quickPayItemId);
      const fee = found ? found.nominal : 0;
      const tot = selectedMonths.length > 0 ? selectedMonths.length * fee : fee;
      setInputTotal(tot);
      setInputDibayar(tot);
    } else {
      const list = uktTarifs;
      const found = list.find(t => t.id === quickPayItemId) || list[0];
      if (found) {
        setInputTotal(found.nominal);
        setInputDibayar(found.nominal);
      } else {
        setInputTotal(0);
        setInputDibayar(0);
      }
    }
  }, [selectedMonths, monthlyFee, quickPayType, quickPayItemId, uktTarifs, ekskulTarifs]);

  // Calculate Kembalian
  const kembalian = Math.max(0, inputDibayar - (selectedMonths.length > 0 ? calculatedTotal : inputTotal));

  // Bebas Payment Custom Amount State
  const [bebasPayInput, setBebasPayInput] = useState<{ [key: string]: number }>({});

  // Bebas Terbayar Map state for non-SPP items with localStorage persistence
  const [bebasTerbayarMap, setBebasTerbayarMap] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_bebas_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Dynamic Bebas Items derived from Pengaturan Tarif Biaya (non-SPP)
  const bebasItems = useMemo(() => {
    const nonSppTarifs = tarifList.filter(t => t.tipe !== 'spp' && t.status === 'Aktif');
    if (nonSppTarifs.length === 0) {
      return [
        { id: 'gedung', nama: 'Uang Gedung & Pengembangan (UKT)', total: 2500000, terbayar: 0 },
        { id: 'seragam', nama: 'Seragam & Atribut Sekolah', total: 750000, terbayar: 0 },
        { id: 'kegiatan', nama: 'Iuran Kegiatan / Ekstrakurikuler', total: 300000, terbayar: 0 }
      ];
    }
    return nonSppTarifs.map(t => {
      const terbayar = bebasTerbayarMap[t.id] ?? 0;
      return {
        id: t.id,
        nama: `${t.namaBiaya} (${t.tingkatKelas})`,
        total: t.nominal,
        terbayar: Math.min(t.nominal, terbayar)
      };
    });
  }, [tarifList, bebasTerbayarMap, tahunAjaran, selectedSiswa]);

  const totalSppPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'spp';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalUktPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'ukt';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalEkskulPaid = useMemo(() => {
    if (!selectedSiswa) return 0;
    return allEffectiveTagihanList
      .filter(t => {
        if (!t) return false;
        const matchStudent = t.siswaId === selectedSiswa.id || (t.siswaNama && selectedSiswa.nama && t.siswaNama.trim().toLowerCase() === selectedSiswa.nama.trim().toLowerCase());
        return matchStudent && t.tipe === 'ekskul';
      })
      .reduce((sum, t) => sum + (t.terbayar || 0), 0);
  }, [allEffectiveTagihanList, selectedSiswa]);

  const totalSemuaPembayaran = totalSppPaid + totalUktPaid + totalEkskulPaid;

  // State for deletion modal
  const [deleteTargetTagihan, setDeleteTargetTagihan] = useState<TagihanKeuangan | null>(null);

  // Student Specific Recent Transactions List with localStorage persistence
  const [deleteTargetTx, setDeleteTargetTx] = useState<{
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  } | null>(null);

  const [studentTransactions, setStudentTransactions] = useState<Array<{
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  }>>(() => {
    try {
      const saved = localStorage.getItem(`edu_student_tx_${studentKey}`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync state changes on studentKey change or updates, treating active transaksiList and tagihanList as primary truth
  React.useEffect(() => {
    if (!selectedSiswa) {
      setStudentTransactions([]);
      setPaidMonthsState({});
      setBebasTerbayarMap({});
      return;
    }

    try {
      const studentName = selectedSiswa.nama;
      const normName = studentName.trim().toLowerCase().replace(/\s+/g, ' ');
      const sId = selectedSiswa.id;

      // 1. Transactions List - Robust Matching
      const studentTxs = transaksiList.filter(tx => {
        if (!tx) return false;
        
        // Match by ID
        if (tx.siswaId && sId && tx.siswaId === sId) return true;
        
        // Match by Name
        if (tx.siswaNama) {
          const txNormName = tx.siswaNama.trim().toLowerCase().replace(/\s+/g, ' ');
          if (txNormName === normName) return true;
        }
        
        return false;
      });

      const derivedTxs = studentTxs.map(tx => ({
        id: tx.id,
        pembayaran: tx.pembayaran || (tx.tipe === 'spp' ? `Pembayaran SPP` : `Pembayaran ${tx.tipe.toUpperCase()}`),
        tagihan: tx.nominal,
        tanggal: tx.tanggal,
        type: tx.tipe === 'spp' ? ('spp' as const) : ('bebas' as const),
        itemId: tx.tagihanId
      }));

      setStudentTransactions(derivedTxs);
      try {
        localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(derivedTxs));
      } catch (e) {}

      // 2. Paid Months State
      const derivedPaid: Record<string, string> = {};
      studentTxs.forEach(tx => {
        if (tx.tipe === 'spp') {
          allMonths.forEach(m => {
            if (tx.pembayaran && tx.pembayaran.toLowerCase().includes(m.toLowerCase())) {
              derivedPaid[m] = tx.tanggal;
            }
          });
        }
      });

      tagihanList.forEach(t => {
        if (t && !t.isDeleted && t.siswaNama && (t.siswaNama || '').trim().toLowerCase() === normName && t.tipe === 'spp' && t.status === 'Lunas') {
          allMonths.forEach(m => {
            if (t.namaTagihan && t.namaTagihan.toLowerCase().includes(m.toLowerCase())) {
              derivedPaid[m] = t.tanggalBayar || '09/08/2026';
            }
          });
        }
      });

      setPaidMonthsState(derivedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(derivedPaid));
      } catch (e) {}

      // 3. Bebas Terbayar Map
      const derivedBebas: Record<string, number> = {};
      studentTxs.forEach(tx => {
        if (tx.tipe !== 'spp' && tx.tagihanId) {
          derivedBebas[tx.tagihanId] = (derivedBebas[tx.tagihanId] || 0) + tx.nominal;
        }
      });

      setBebasTerbayarMap(derivedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(derivedBebas));
      } catch (e) {}

    } catch (e) {
      console.error('Error syncing student finance data:', e);
    }
  }, [studentKey, selectedSiswa, transaksiList, tagihanList]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(studentTransactions));
    } catch (e) {}
  }, [studentTransactions, studentKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(paidMonthsState));
    } catch (e) {}
  }, [paidMonthsState, studentKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(bebasTerbayarMap));
    } catch (e) {}
  }, [bebasTerbayarMap, studentKey]);

  // Helper helper to format dates beautifully
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('/') || dateStr.length > 10) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const mIdx = parseInt(month, 10) - 1;
      if (mIdx >= 0 && mIdx < 12) {
        return `${parseInt(day, 10)} ${months[mIdx]} ${year}`;
      }
    }
    return dateStr;
  };

  const studentBills = useMemo(() => {
    if (!selectedSiswa) return [];
    const normName = selectedSiswa.nama.trim().toLowerCase();
    
    // 1. Get all explicit bills for this student
    const explicitBills = allEffectiveTagihanList.filter(t => {
      if (!t || t.isDeleted) return false;
      const sId = selectedSiswa.id;
      const normName = selectedSiswa.nama.trim().toLowerCase().replace(/\s+/g, ' ');
      
      // Match by ID
      if (t.siswaId && sId && t.siswaId === sId) return true;
      
      // Match by Name (robust normalization)
      if (t.siswaNama) {
        const tNormName = t.siswaNama.trim().toLowerCase().replace(/\s+/g, ' ');
        if (tNormName === normName) return true;
      }
      
      return false;
    }).map(t => {
      // Calculate dynamic terbayar from transaksiList to ensure accuracy
      const txsForThisBill = transaksiList.filter(tx => 
        tx && (tx.tagihanId === t.id || (tx.pembayaran === t.namaTagihan && tx.siswaNama && tx.siswaNama.trim().toLowerCase() === normName))
      );
      const totalPaid = txsForThisBill.reduce((sum, tx) => sum + (tx.nominal || 0), 0);
      const displayTerbayar = Math.max(t.terbayar || 0, totalPaid);
      
      return {
        ...t,
        terbayar: displayTerbayar,
        status: displayTerbayar >= t.nominal ? 'Lunas' : (displayTerbayar > 0 ? 'Dicicil' : 'Belum Lunas'),
        tanggalBayar: t.tanggalBayar || (txsForThisBill.length > 0 ? txsForThisBill[0].tanggal : undefined)
      };
    });

    // 2. Identify "orphan" transactions (transactions without a corresponding bill in tagihanList)
    const orphanTxs = transaksiList.filter(tx => {
      if (!tx) return false;
      const sId = selectedSiswa.id;
      const normName = selectedSiswa.nama.trim().toLowerCase().replace(/\s+/g, ' ');
      
      const txStudent = (tx.siswaNama || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const isThisStudent = txStudent === normName || (tx.siswaId && tx.siswaId === sId);
      if (!isThisStudent) return false;
      
      const hasMatchingBill = explicitBills.some(b => b.id === tx.tagihanId || b.namaTagihan === tx.pembayaran);
      return !hasMatchingBill;
    });

    // 3. Convert orphan transactions to bill-like objects for display
    const orphanBills: TagihanKeuangan[] = orphanTxs.map(tx => ({
      id: tx.id,
      siswaId: selectedSiswa.id,
      siswaNama: selectedSiswa.nama,
      kelas: selectedSiswa.kelas || '',
      tipe: tx.tipe || 'other',
      namaTagihan: tx.pembayaran || 'Pembayaran Lainnya',
      bulanTahun: tahunAjaran,
      nominal: tx.nominal,
      terbayar: tx.nominal,
      status: 'Lunas',
      tanggalBayar: tx.tanggal,
      jatuhTempo: tx.tanggal
    }));

    // Combine and sort by date (newest first)
    return [...explicitBills, ...orphanBills].sort((a, b) => {
      const parseFlexibleDate = (dateStr?: string) => {
        if (!dateStr) return 0;
        if (typeof dateStr !== 'string') return 0;
        
        // Try standard parsing first
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.getTime();
        
        // Manual parsing for Indonesian formats like "10 Agustus 2026"
        try {
          const months = [
            'januari', 'februari', 'maret', 'april', 'mei', 'juni',
            'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
          ];
          const parts = dateStr.toLowerCase().split(' ');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const monthName = parts[1];
            const year = parseInt(parts[2], 10);
            const mIdx = months.indexOf(monthName);
            if (mIdx !== -1 && !isNaN(day) && !isNaN(year)) {
              return new Date(year, mIdx, day).getTime();
            }
          }
        } catch (e) {}
        
        return 0;
      };

      const dateA = parseFlexibleDate(a.tanggalBayar || a.jatuhTempo);
      const dateB = parseFlexibleDate(b.tanggalBayar || b.jatuhTempo);
      if (dateB === dateA) return b.id.localeCompare(a.id);
      return dateB - dateA;
    });
  }, [selectedSiswa, allEffectiveTagihanList, transaksiList, tahunAjaran]);

  // Execute Permanent Bill Deletion (Deletes bill & removes all associated transaction records)
  const handleExecuteDeleteTagihanPermanen = (t: TagihanKeuangan) => {
    if (!t) return;
    const sNameNorm = (t.siswaNama || (selectedSiswa ? selectedSiswa.nama : '') || '').trim().toLowerCase();
    const tTipe = (t.tipe || '').toLowerCase();
    const tName = (t.namaTagihan || '').toLowerCase();

    // 1. Mark bill as tombstoned in tagihanList
    const tombstone: TagihanKeuangan = {
      ...t,
      isDeleted: true
    };
    setTagihanList(prev => [
      ...prev.filter(item => item.id !== t.id),
      tombstone
    ]);

    // 2. Remove associated transactions from global transaksiList
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(tx => {
        if (!tx) return true;
        if (tx.tagihanId && tx.tagihanId === t.id) return false;
        const txStudent = (tx.siswaNama || '').trim().toLowerCase();
        if (sNameNorm && txStudent === sNameNorm) {
          const txTipe = (tx.tipe || '').toLowerCase();
          const txPay = (tx.pembayaran || '').toLowerCase();
          if (txTipe === tTipe && tName && (txPay.includes(tName) || tName.includes(txPay))) {
            return false;
          }
          if (t.id.startsWith('syn-') && txTipe === tTipe) {
            return false;
          }
        }
        return true;
      }));
    }

    // 3. Remove associated transactions from studentTransactions
    const updatedStudentTx = studentTransactions.filter(tx => {
      if (tx.itemId && tx.itemId === t.id) return false;
      const txPay = (tx.pembayaran || '').toLowerCase();
      if (tName && (txPay.includes(tName) || tName.includes(txPay))) return false;
      if (t.id.startsWith('syn-') && ((tTipe === 'spp' && tx.type === 'spp') || (tTipe !== 'spp' && tx.type === 'bebas'))) {
        return false;
      }
      return true;
    });
    setStudentTransactions(updatedStudentTx);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedStudentTx));
    } catch (e) {}

    // 4. Clean up paid SPP months if applicable
    if (tTipe === 'spp') {
      const updatedPaid = { ...paidMonthsState };
      allMonths.forEach(m => {
        if (tName.includes(m.toLowerCase())) {
          delete updatedPaid[m];
        }
      });
      setPaidMonthsState(updatedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
      } catch (e) {}
    }

    // 5. Clean up Bebas balances if applicable
    if (tTipe !== 'spp') {
      const updatedBebas = { ...bebasTerbayarMap };
      if (t.id) delete updatedBebas[t.id];
      bebasItems.forEach(b => {
        if (b.id === t.id || tName.includes(b.nama.toLowerCase()) || b.nama.toLowerCase().includes(tName)) {
          delete updatedBebas[b.id];
        }
      });
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    setDeleteTargetTagihan(null);
  };

  // Execute Payment Cancellation Only (Resets bill to Belum Lunas)
  const handleExecuteResetPaymentOnly = (t: TagihanKeuangan) => {
    if (!t) return;
    const sNameNorm = (t.siswaNama || (selectedSiswa ? selectedSiswa.nama : '') || '').trim().toLowerCase();
    const tTipe = (t.tipe || '').toLowerCase();
    const tName = (t.namaTagihan || '').toLowerCase();

    // 1. Reset bill payment status in tagihanList
    setTagihanList(prev => {
      const exists = prev.some(item => item.id === t.id);
      if (exists) {
        return prev.map(item => item.id === t.id ? {
          ...item,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        } : item);
      } else {
        const materializedId = t.id.startsWith('syn-') ? `tag-${Date.now()}` : t.id;
        const unpaidBill: TagihanKeuangan = {
          ...t,
          id: materializedId,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        };
        return [unpaidBill, ...prev.filter(item => item.id !== t.id)];
      }
    });

    // 2. Remove associated transactions from global transaksiList
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(tx => {
        if (!tx) return true;
        if (tx.tagihanId && tx.tagihanId === t.id) return false;
        const txStudent = (tx.siswaNama || '').trim().toLowerCase();
        if (sNameNorm && txStudent === sNameNorm) {
          const txTipe = (tx.tipe || '').toLowerCase();
          const txPay = (tx.pembayaran || '').toLowerCase();
          if (txTipe === tTipe && tName && (txPay.includes(tName) || tName.includes(txPay))) {
            return false;
          }
          if (t.id.startsWith('syn-') && txTipe === tTipe) {
            return false;
          }
        }
        return true;
      }));
    }

    // 3. Remove associated transactions from studentTransactions
    const updatedStudentTx = studentTransactions.filter(tx => {
      if (tx.itemId && tx.itemId === t.id) return false;
      const txPay = (tx.pembayaran || '').toLowerCase();
      if (tName && (txPay.includes(tName) || tName.includes(txPay))) return false;
      if (t.id.startsWith('syn-') && ((tTipe === 'spp' && tx.type === 'spp') || (tTipe !== 'spp' && tx.type === 'bebas'))) {
        return false;
      }
      return true;
    });
    setStudentTransactions(updatedStudentTx);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedStudentTx));
    } catch (e) {}

    // 4. Clean up paid SPP months if applicable
    if (tTipe === 'spp') {
      const updatedPaid = { ...paidMonthsState };
      allMonths.forEach(m => {
        if (tName.includes(m.toLowerCase())) {
          delete updatedPaid[m];
        }
      });
      setPaidMonthsState(updatedPaid);
      try {
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
      } catch (e) {}
    }

    // 5. Clean up Bebas balances if applicable
    if (tTipe !== 'spp') {
      const updatedBebas = { ...bebasTerbayarMap };
      if (t.id) delete updatedBebas[t.id];
      bebasItems.forEach(b => {
        if (b.id === t.id || tName.includes(b.nama.toLowerCase()) || b.nama.toLowerCase().includes(tName)) {
          delete updatedBebas[b.id];
        }
      });
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    setDeleteTargetTagihan(null);
  };

  // Helper Function: Perform Transaction Deletion & State Rollback
  const performDeleteTransaction = (targetTx: {
    id: string;
    pembayaran?: string;
    tagihan: number;
    tanggal: string;
    itemId?: string;
    type?: 'spp' | 'bebas';
  }) => {
    // 1. Remove from student transactions list
    const updatedTransactions = studentTransactions.filter(t => t.id !== targetTx.id);
    setStudentTransactions(updatedTransactions);
    try {
      localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify(updatedTransactions));
    } catch (e) {}

    const originalTx = transaksiList.find(tx => tx && tx.id === targetTx.id);
    const txTipe = originalTx ? originalTx.tipe : (targetTx.type === 'spp' ? 'spp' : 'ukt');

    const pembayaranText = targetTx.pembayaran || (originalTx ? originalTx.pembayaran : '') || '';
    const isSpp = txTipe === 'spp' || pembayaranText.toLowerCase().includes('spp');

    // 2. Restore SPP paid months if applicable
    let updatedPaid = { ...paidMonthsState };
    if (isSpp) {
      const monthMatch = pembayaranText.match(/\(([^)]+)\)/) || pembayaranText.match(/(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/i);
      if (monthMatch) {
        const monthNames = monthMatch[1] ? monthMatch[1].split(/[,&]/).map(m => m.trim()) : [monthMatch[0]];
        monthNames.forEach(m => {
          const foundMonth = allMonths.find(month => month.toLowerCase() === m.toLowerCase());
          if (foundMonth) {
            delete updatedPaid[foundMonth];
          }
        });
        setPaidMonthsState(updatedPaid);
        try {
          localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify(updatedPaid));
        } catch (e) {}
      }
    }

    // 3. Restore Bebas payment balance if applicable
    let updatedBebas = { ...bebasTerbayarMap };
    if (txTipe !== 'spp' || targetTx.itemId) {
      const targetId = targetTx.itemId || (originalTx ? originalTx.tagihanId : undefined);
      if (targetId) {
        updatedBebas[targetId] = Math.max(0, (updatedBebas[targetId] || 0) - targetTx.tagihan);
      } else {
        const matchedBebas = bebasItems.find(item => pembayaranText.toLowerCase().includes(item.nama.toLowerCase()));
        if (matchedBebas) {
          updatedBebas[matchedBebas.id] = Math.max(0, (updatedBebas[matchedBebas.id] || 0) - targetTx.tagihan);
        }
      }
      setBebasTerbayarMap(updatedBebas);
      try {
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify(updatedBebas));
      } catch (e) {}
    }

    // 4. Remove from global transaction list if callback exists
    if (setTransaksiList) {
      setTransaksiList(prev => prev.filter(t => t.id !== targetTx.id));
    }

    // 5. Update corresponding bill in global tagihanList if callback exists
    if (setTagihanList) {
      setTagihanList(prev => {
        return prev.map(t => {
          const isMatch = t.id === targetTx.itemId || (originalTx && t.id === originalTx.tagihanId) || 
            (t.siswaNama && selectedSiswa && 
             (t.siswaNama.toLowerCase() === selectedSiswa.nama.toLowerCase()) &&
             (t.tipe === txTipe));
          if (isMatch) {
            const remainingTerbayar = Math.max(0, (t.terbayar || 0) - targetTx.tagihan);
            const isLunas = remainingTerbayar >= t.nominal && t.nominal > 0;
            return {
              ...t,
              terbayar: remainingTerbayar,
              status: isLunas ? 'Lunas' : (remainingTerbayar > 0 ? 'Dicicil' : 'Belum Lunas')
            };
          }
          return t;
        });
      });
    }
  };

  // Hapus Transaksi Spesifik Handler
  const handleDeleteSingleTransaction = (txId: string) => {
    const targetTx = studentTransactions.find(t => t.id === txId);
    if (!targetTx) return;
    const cleanTx = {
      ...targetTx,
      pembayaran: targetTx.pembayaran || (targetTx.type === 'spp' ? 'Pembayaran SPP' : 'Pembayaran Tagihan')
    };
    setDeleteTargetTx(cleanTx);
  };

  // Reset Semua Transaksi Dari Awal Handler
  const handleResetAllTransactions = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset SELURUH riwayat transaksi dan status pembayaran siswa dari awal? Tindakan ini akan mengosongkan semua riwayat pembayaran dan mengembalikan status tagihan seperti semula.')) {
      setStudentTransactions([]);
      setPaidMonthsState({});
      setBebasTerbayarMap({});
      if (setTransaksiList) {
        setTransaksiList([]);
      }
      if (setTagihanList) {
        setTagihanList(prev => prev.map(t => ({
          ...t,
          terbayar: 0,
          status: 'Belum Lunas',
          tanggalBayar: ''
        })));
      }
      try {
        localStorage.setItem(`edu_student_tx_${studentKey}`, JSON.stringify([]));
        localStorage.setItem(`edu_student_paid_${studentKey}`, JSON.stringify({}));
        localStorage.setItem(`edu_student_bebas_${studentKey}`, JSON.stringify({}));
      } catch (e) {}
      alert('Semua riwayat transaksi berhasil di-reset dari awal.');
    }
  };

  // Helper to generate automatic invoice number in 0001/C-ALFAKHIR/VIII/2026 format
  const generateInvoiceNumber = (): string => {
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentRomanMonth = romanMonths[now.getMonth()];
    
    // Get counter from localStorage
    const storageKey = `invoice_seq_${currentYear}_${currentRomanMonth}`;
    let counter = Number(localStorage.getItem(storageKey) || "0");
    counter += 1;
    localStorage.setItem(storageKey, String(counter));
    
    const paddedSeq = String(counter).padStart(4, '0');
    return `${paddedSeq}/C-ALFAKHIR/${currentRomanMonth}/${currentYear}`;
  };

  // Stable invoice number generator per tagihan object
  const getStableInvoiceNumber = (t: any): string => {
    let seed = 1;
    if (t && t.id) {
      if (typeof t.id === 'number') {
        seed = t.id % 9000;
      } else {
        let hash = 0;
        const strId = String(t.id);
        for (let i = 0; i < strId.length; i++) {
          hash = (hash << 5) - hash + strId.charCodeAt(i);
          hash |= 0;
        }
        seed = Math.abs(hash) % 9000;
      }
    }
    const finalSeq = String((seed % 8999) + 1).padStart(4, '0');
    let romanMonth = "VIII";
    let year = "2026";
    if (t && t.tanggalTagihan) {
      const dateParts = String(t.tanggalTagihan).split(/[-/]/);
      if (dateParts.length >= 3) {
        const possibleYear = dateParts.find(p => p.length === 4);
        if (possibleYear) {
          year = possibleYear;
        }
        let monthNum = 8;
        if (dateParts[0].length === 4) {
          monthNum = parseInt(dateParts[1], 10) || 8;
        } else {
          monthNum = parseInt(dateParts[1], 10) || 8;
        }
        const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        if (monthNum >= 1 && monthNum <= 12) {
          romanMonth = romanMonths[monthNum - 1];
        }
      }
    }
    return `${finalSeq}/C-ALFAKHIR/${romanMonth}/${year}`;
  };

  // Printable Receipt Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [slipPrintDate, setSlipPrintDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [printReceiptData, setPrintReceiptData] = useState<{
    noNota: string;
    tahunAjaran: string;
    nis: string;
    nama: string;
    namaIbu: string;
    kelas: string;
    items?: Array<{ id: string; uraian: string; jumlah: number }>;
    pembayaranTitle?: string;
    nominal?: number;
    dibayar: number;
    kembalian?: number;
    tanggal: string;
    penerima: string;
  } | null>(null);

  // Helper functions to manage receipt items dynamically
  const handleAddReceiptItem = () => {
    if (!printReceiptData) return;
    const currentItems = (printReceiptData.items && printReceiptData.items.length > 0)
      ? printReceiptData.items
      : [{ id: '1', uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan', jumlah: printReceiptData.nominal || 100000 }];
    
    const newItem = {
      id: `item-${Date.now()}`,
      uraian: '',
      jumlah: 0
    };
    setPrintReceiptData({
      ...printReceiptData,
      items: [...currentItems, newItem]
    });
  };

  const handleUpdateReceiptItem = (id: string, field: 'uraian' | 'jumlah', val: any) => {
    if (!printReceiptData) return;
    const currentItems = (printReceiptData.items && printReceiptData.items.length > 0)
      ? printReceiptData.items
      : [{ id: '1', uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan', jumlah: printReceiptData.nominal || 100000 }];
    
    const updated = currentItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'jumlah' ? Number(val) || 0 : val };
      }
      return item;
    });
    setPrintReceiptData({
      ...printReceiptData,
      items: updated
    });
  };

  const handleDeleteReceiptItem = (id: string) => {
    if (!printReceiptData) return;
    const currentItems = printReceiptData.items || [];
    if (currentItems.length <= 1) return;
    setPrintReceiptData({
      ...printReceiptData,
      items: currentItems.filter(item => item.id !== id)
    });
  };

  // Computed receipt items, total nominal, and kembalian
  const receiptItems = useMemo(() => {
    if (!printReceiptData) return [];
    if (printReceiptData.items && printReceiptData.items.length > 0) {
      return printReceiptData.items;
    }
    return [
      {
        id: 'default-1',
        uraian: printReceiptData.pembayaranTitle || 'Pembayaran Keuangan',
        jumlah: printReceiptData.nominal || 100000
      }
    ];
  }, [printReceiptData]);

  const totalReceiptNominal = useMemo(() => {
    return receiptItems.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
  }, [receiptItems]);

  const receiptKembalian = useMemo(() => {
    if (!printReceiptData) return 0;
    return Math.max(0, (printReceiptData.dibayar || 0) - totalReceiptNominal);
  }, [printReceiptData, totalReceiptNominal]);

  // Handle print receipt with fallbacks
  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Standard window.print() failed, trying iframe fallback:', err);
      const printContent = document.getElementById('printable-receipt');
      if (printContent) {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Kwitansi Bukti Pembayaran Resmi</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1e293b; background: #fff; }
                  .print\\:hidden { display: none !important; }
                  .print\\:inline { display: inline !important; }
                  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
                  th { background-color: #f1f5f9; font-weight: bold; }
                  .text-right { text-align: right; }
                  .text-center { text-align: center; }
                  .font-bold { font-weight: bold; }
                  .font-mono { font-family: monospace; }
                  .flex { display: flex; justify-content: space-between; }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `);
          doc.close();
          iframe.contentWindow?.focus();
          setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1000);
          }, 300);
        }
      }
    }
  };

  // Handle Download Receipt as HTML/PDF file
  const handleDownloadReceipt = () => {
    try {
      const itemsHtml = receiptItems.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${item.uraian || '-'}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">
            Rp ${(Number(item.jumlah) || 0).toLocaleString('id-ID')}
          </td>
        </tr>
      `).join('');

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwitansi ${printReceiptData.noNota} - ${printReceiptData.nama}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; display: flex; justify-content: center; }
    .card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; max-width: 550px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header h2 { margin: 0; font-size: 16px; font-weight: 800; text-transform: uppercase; }
    .header p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; }
    .title { font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-top: 8px; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
    .label { color: #64748b; }
    .value { font-weight: bold; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th { background: #f1f5f9; padding: 8px; text-align: left; border: 1px solid #cbd5e1; font-weight: bold; }
    .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 12px; margin-top: 12px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .summary-row.total { font-weight: bold; font-size: 14px; color: #047857; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .signatures { display: flex; justify-content: space-between; margin-top: 28px; font-size: 11px; text-align: center; }
    .signature-box { width: 40%; }
    .space { height: 45px; }
    .btn-print { display: block; width: 100%; text-align: center; background: #059669; color: white; padding: 10px; border-radius: 8px; font-weight: bold; text-decoration: none; margin-top: 16px; cursor: pointer; border: none; }
    @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>SEKOLAH MENENGAH ATAS WORKSPACE 2026</h2>
      <p>Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan • Telp: (021) 7891234</p>
      <div class="title">KWITANSI BUKTI PEMBAYARAN RESMI</div>
    </div>
    <div class="info">
      <div class="row"><span class="label">No. Nota / Kwitansi</span><span class="value">${printReceiptData.noNota}</span></div>
      <div class="row"><span class="label">Tahun Ajaran</span><span class="value">${printReceiptData.tahunAjaran}</span></div>
      <div class="row"><span class="label">NISN & Nama Siswa</span><span class="value">${printReceiptData.nis} - ${printReceiptData.nama}</span></div>
      <div class="row"><span class="label">Kelas</span><span class="value">${printReceiptData.kelas}</span></div>
      <div class="row"><span class="label">Tanggal Pembayaran</span><span class="value">${printReceiptData.tanggal}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Uraian Pembayaran</th>
          <th style="text-align: right; width: 140px;">Jumlah (Rp)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div class="summary">
      <div class="summary-row total">
        <span>Total Tagihan:</span>
        <span>Rp ${totalReceiptNominal.toLocaleString('id-ID')}</span>
      </div>
      <div class="summary-row">
        <span>Jumlah Uang Diserahkan:</span>
        <span>Rp ${(printReceiptData.dibayar || 0).toLocaleString('id-ID')}</span>
      </div>
      <div class="summary-row" style="color: #047857; font-weight: bold;">
        <span>Uang Kembalian:</span>
        <span>Rp ${receiptKembalian.toLocaleString('id-ID')}</span>
      </div>
    </div>
    <div class="signatures">
      <div class="signature-box">
        <p>Siswa / Penyetor,</p>
        <div class="space"></div>
        <p><b>(${printReceiptData.nama})</b></p>
      </div>
      <div class="signature-box">
        <p>Kasir Keuangan,</p>
        <div class="space"></div>
        <p><b>(${printReceiptData.penerima})</b></p>
      </div>
    </div>
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF Kwitansi</button>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = printReceiptData.nama ? printReceiptData.nama.replace(/[^a-zA-Z0-9_]/g, '_') : 'Siswa';
      link.setAttribute('download', `Kwitansi_${printReceiptData.noNota}_${safeName}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download receipt error:', err);
      alert('Gagal mengunduh file kwitansi.');
    }
  };

  // Handle Download Receipt as Image (PNG)
  const handleDownloadReceiptAsImage = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 750;
      const itemsCount = receiptItems.length;
      canvas.height = 720 + (itemsCount * 32);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'extrabold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEKOLAH MENENGAH ATAS WORKSPACE 2026', canvas.width / 2, 55);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan • Telp: (021) 7891234', canvas.width / 2, 76);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('KWITANSI BUKTI PEMBAYARAN RESMI', canvas.width / 2, 102);

      // Header Line
      ctx.beginPath();
      ctx.moveTo(40, 118);
      ctx.lineTo(canvas.width - 40, 118);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Receipt details
      let y = 148;
      const drawRow = (label: string, val: string) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.font = '13px sans-serif';
        ctx.fillText(label, 45, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(val, canvas.width - 45, y);
        y += 24;
      };

      drawRow('No. Nota / Kwitansi', printReceiptData.noNota);
      drawRow('Tahun Ajaran', printReceiptData.tahunAjaran);
      drawRow('NISN & Nama Siswa', `${printReceiptData.nis} - ${printReceiptData.nama}`);
      drawRow('Kelas', `${printReceiptData.kelas}`);
      drawRow('Tanggal Pembayaran', printReceiptData.tanggal);

      y += 8;

      // Table Header
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(40, y, canvas.width - 80, 32);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, y, canvas.width - 80, 32);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Uraian Pembayaran', 55, y + 21);
      ctx.textAlign = 'right';
      ctx.fillText('Jumlah (Rp)', canvas.width - 55, y + 21);

      y += 32;

      // Items
      receiptItems.forEach(item => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, y, canvas.width - 80, 32);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(40, y, canvas.width - 80, 32);

        ctx.fillStyle = '#0f172a';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.uraian || '-', 55, y + 21);

        ctx.textAlign = 'right';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`Rp ${(Number(item.jumlah) || 0).toLocaleString('id-ID')}`, canvas.width - 55, y + 21);

        y += 32;
      });

      y += 16;

      // Summary Box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(40, y, canvas.width - 80, 100);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(40, y, canvas.width - 80, 100);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Total Tagihan:', 55, y + 30);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Rp ${totalReceiptNominal.toLocaleString('id-ID')}`, canvas.width - 55, y + 30);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText('Jumlah Uang Diserahkan:', 55, y + 58);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Rp ${(printReceiptData.dibayar || 0).toLocaleString('id-ID')}`, canvas.width - 55, y + 58);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Uang Kembalian:', 55, y + 84);
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Rp ${receiptKembalian.toLocaleString('id-ID')}`, canvas.width - 55, y + 84);

      y += 135;

      // Date of Printing
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      const cetakDate = new Date(slipPrintDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      ctx.fillText(`Tanggal Cetak: ${cetakDate}`, canvas.width - 55, y);
      y += 20;

      // Signatures
      ctx.fillStyle = '#334155';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Siswa / Penyetor,', 160, y);
      ctx.fillText('Kasir Keuangan,', canvas.width - 160, y);

      y += 55;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`(${printReceiptData.nama})`, 160, y);
      ctx.fillText(`(${printReceiptData.penerima})`, canvas.width - 160, y);

      const safeName = printReceiptData.nama ? printReceiptData.nama.replace(/[^a-zA-Z0-9_]/g, '_') : 'Siswa';
      const link = document.createElement('a');
      link.download = `Kwitansi_${printReceiptData.noNota}_${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download receipt image error:', err);
      alert('Gagal mengunduh gambar kwitansi.');
    }
  };

  // Re-open receipt modal for any previous transaction
  const handleReprintTransaction = (tx: { id: string; pembayaran: string; tagihan: number; tanggal: string }) => {
    const receipt = {
      noNota: generateInvoiceNumber(),
      tahunAjaran,
      nis: selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis) : '20261001',
      nama: selectedSiswa ? selectedSiswa.nama : 'Ahmad Rizky Pratama',
      namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : 'Ibnu Al haytam / Budi Pratama',
      kelas: selectedSiswa ? selectedSiswa.kelas : 'Kelas 7',
      items: [
        {
          id: `item-${Date.now()}`,
          uraian: tx.pembayaran,
          jumlah: tx.tagihan
        }
      ],
      pembayaranTitle: tx.pembayaran,
      nominal: tx.tagihan,
      dibayar: tx.tagihan,
      kembalian: 0,
      tanggal: tx.tanggal,
      penerima: 'Bendahara Sekolah'
    };
    setPrintReceiptData(receipt);
    setShowPrintModal(true);
  };

  // Fonnte & Sheets Export States
  const [fonnteToken, setFonnteToken] = useState(schoolSettings?.fonnteToken || INITIAL_FONNTE_CONFIG.apiKey);
  const [showFonnteConfigModal, setShowFonnteConfigModal] = useState(false);
  const [waSendingStatus, setWaSendingStatus] = useState<string | null>(null);
  const [exportingSheets, setExportingSheets] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; url?: string; message?: string } | null>(null);

  // VA & QRIS Settings
  const [bankVaName, setBankVaName] = useState(schoolSettings?.bankVaName || 'Bank BRI');
  const [bankVaNumber, setBankVaNumber] = useState(schoolSettings?.bankVaNumber || '1234-5678-9012-3456');
  const [bankVaOwner, setBankVaOwner] = useState(schoolSettings?.bankVaOwner || schoolSettings?.namaSekolah || 'SMP Islam Modern Al Fakhír');
  const [qrisUrl, setQrisUrl] = useState(schoolSettings?.qrisUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg');
  const [showVaConfigModal, setShowVaConfigModal] = useState(false);

  const getStudentTingkatDanRombel = (siswa: Siswa | null) => {
    if (!siswa) return { tingkatKelas: '-', rombel: '-' };
    
    let tk = siswa.tingkatKelas;
    let rb = siswa.rombel || siswa.kelas || '-';

    if (!tk && rombelList && rombelList.length > 0) {
      const matchRombel = rombelList.find(r => 
        r.namaRombel.trim().toLowerCase() === (siswa.kelas || '').trim().toLowerCase() || 
        r.namaRombel.trim().toLowerCase() === (siswa.rombel || '').trim().toLowerCase()
      );
      if (matchRombel) {
        tk = matchRombel.tingkatKelas;
      }
    }

    if (!tk && siswa.kelas) {
      const k = siswa.kelas.toLowerCase();
      if (k.includes('7') || k.includes('vii')) tk = 'Kelas 7';
      else if (k.includes('8') || k.includes('viii')) tk = 'Kelas 8';
      else if (k.includes('9') || k.includes('ix')) tk = 'Kelas 9';
      else if (k.includes('10') || k.includes(' x') || k.startsWith('x-') || k.startsWith('x ')) tk = 'Kelas 10';
      else if (k.includes('11') || k.includes('xi')) tk = 'Kelas 11';
      else if (k.includes('12') || k.includes('xii')) tk = 'Kelas 12';
    }

    return {
      tingkatKelas: tk || 'Kelas 7',
      rombel: rb
    };
  };

  const [showEditSiswaModal, setShowEditSiswaModal] = useState(false);
  const [editingSiswaData, setEditingSiswaData] = useState<Partial<Siswa>>({});

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa || !setSiswaList) return;
    
    const finalRombel = editingSiswaData.rombel || editingSiswaData.kelas || selectedSiswa.kelas;
    const finalTingkat = editingSiswaData.tingkatKelas || selectedSiswa.tingkatKelas || 'Kelas 7';

    const updatedSiswa: Siswa = {
      ...selectedSiswa,
      ...editingSiswaData,
      tingkatKelas: finalTingkat,
      rombel: finalRombel,
      kelas: finalRombel
    };

    setSiswaList(prev => prev.map(s => s.id === selectedSiswa.id ? updatedSiswa : s));
    setShowEditSiswaModal(false);
    alert("Data siswa (Kelas & Rombel) berhasil diperbarui!");
  };

  const defaultReminderText = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nMenginformasikan tagihan :\n• *No. Invoice*: {NO_INVOICE}\n• *{TAGIHAN}* : *Rp {NOMINAL}*\n• *Jatuh tempo* : {JATUH_TEMPO}\n• *Status saat ini*: {STATUS}.\n\nMohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer Bank :\n• *{BANK_VA_NAME}*\n• No. Rek/VA : *{BANK_VA_NUMBER}*\n• a.n *{BANK_VA_OWNER}*\n\nTerima kasih atas perhatian Bapak/Ibu.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
  
  const defaultReceiptText = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nTerima kasih, pembayaran *{NAMA_TAGIHAN}* sebesar *{NOMINAL_BAYAR}* telah *KAMI TERIMA* dengan baik pada *{TANGGAL_BAYAR}*.\n• *No. Invoice* : {NO_INVOICE}\n• *Metode*: {METODE_BAYAR}\n\n*Status Tagihan*: {STATUS}.\n• *Bendahara SMPI MODERN AL FAKHIR*`;

  const [localTemplateReminder, setLocalTemplateReminder] = useState(schoolSettings?.fonnteConfig?.templateReminder || defaultReminderText);
  const [localTemplateReceipt, setLocalTemplateReceipt] = useState(schoolSettings?.fonnteConfig?.templateReceipt || defaultReceiptText);
  const [activeRedaksiTab, setActiveRedaksiTab] = useState<'reminder' | 'receipt'>('reminder');

  React.useEffect(() => {
    if (schoolSettings?.fonnteToken) {
      setFonnteToken(schoolSettings.fonnteToken);
    }
    if (schoolSettings?.fonnteConfig?.templateReminder) {
      setLocalTemplateReminder(schoolSettings.fonnteConfig.templateReminder);
    }
    if (schoolSettings?.fonnteConfig?.templateReceipt) {
      setLocalTemplateReceipt(schoolSettings.fonnteConfig.templateReceipt);
    }
    if (schoolSettings?.bankVaName) setBankVaName(schoolSettings.bankVaName);
    if (schoolSettings?.bankVaNumber) setBankVaNumber(schoolSettings.bankVaNumber);
    if (schoolSettings?.bankVaOwner) setBankVaOwner(schoolSettings.bankVaOwner);
    if (schoolSettings?.qrisUrl) setQrisUrl(schoolSettings.qrisUrl);
  }, [schoolSettings]);

  const handleSaveVaConfig = () => {
    if (!setSchoolSettings) return;
    setSchoolSettings(prev => ({
      ...prev,
      bankVaName,
      bankVaNumber,
      bankVaOwner,
      qrisUrl
    }));
    setShowVaConfigModal(false);
    alert("Pengaturan Virtual Account & QRIS berhasil disimpan!");
  };

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveTemplates = () => {
    if (!setSchoolSettings) {
      alert("Fasilitas simpan pengaturan tidak tersedia!");
      return;
    }
    setSchoolSettings(prev => ({
      ...prev,
      fonnteConfig: {
        ...(prev.fonnteConfig || {
          apiKey: prev.fonnteToken || '',
          senderName: '',
          enabled: true,
          autoSendAbsensi: true,
          autoSendKeuangan: true
        }),
        templateReminder: localTemplateReminder,
        templateReceipt: localTemplateReceipt
      }
    }));
    setSaveSuccessMsg("Redaksi notifikasi WhatsApp berhasil disimpan!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleResetTemplate = () => {
    if (activeRedaksiTab === 'reminder') {
      setLocalTemplateReminder(defaultReminderText);
    } else {
      setLocalTemplateReceipt(defaultReceiptText);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const elId = activeRedaksiTab === 'reminder' ? 'template_reminder_input' : 'template_receipt_input';
    const textarea = document.getElementById(elId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;

    if (activeRedaksiTab === 'reminder') {
      setLocalTemplateReminder(newText);
    } else {
      setLocalTemplateReceipt(newText);
    }

    // Restore focus and cursor selection range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Fee Rates Settings View States
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<'semua' | 'spp' | 'ukt' | 'ekskul'>('semua');
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState<string>(new Date().toLocaleString('id-ID', { month: 'long' }));
  const [generateYear, setGenerateYear] = useState<string>(new Date().getFullYear().toString());
  const [generateTypes, setGenerateTypes] = useState<TipeKeuangan[]>(['spp', 'ukt', 'ekskul']);
  const [editingTarif, setEditingTarif] = useState<TarifBiaya | null>(null);
  const [tarifForm, setTarifForm] = useState<{
    namaBiaya: string;
    tipe: TipeKeuangan;
    tingkatKelas: string;
    nominal: number;
    periode: 'Bulanan' | 'Sekali Bayar (Uang Masuk / UKT)' | 'Per Semester';
    keterangan: string;
    status: 'Aktif' | 'Nonaktif';
    ekskulId: string;
  }>({
    namaBiaya: '',
    tipe: 'spp',
    tingkatKelas: 'Kelas 7',
    nominal: 100000,
    periode: 'Bulanan',
    keterangan: '',
    status: 'Aktif',
    ekskulId: ''
  });
  
  // Effect to automatically update tagihan status and terbayar amount when transactions change
  useEffect(() => {
    setTagihanList(prevTagihanList => {
      let hasChanged = false;
      const newList = prevTagihanList.map(tagihan => {
        if (!tagihan || tagihan.isDeleted) return tagihan;
        const txsForTagihan = transaksiList.filter(tx => tx && tx.tagihanId === tagihan.id);
        if (txsForTagihan.length > 0) {
          const terbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + (tx.nominal || 0), 0);
          const sisa = tagihan.nominal - terbayarFromTx;
          const status = sisa <= 0 ? 'Lunas' : (terbayarFromTx > 0 ? 'Dicicil' : 'Belum Lunas');
          const latestTx = txsForTagihan[txsForTagihan.length - 1];
          const latestTanggalBayar = latestTx ? latestTx.tanggal : tagihan.tanggalBayar;
          
          if (tagihan.terbayar !== terbayarFromTx || tagihan.status !== status || tagihan.tanggalBayar !== latestTanggalBayar) {
            hasChanged = true;
            return { ...tagihan, terbayar: terbayarFromTx, status, tanggalBayar: latestTanggalBayar };
          }
        } else if ((tagihan.terbayar && tagihan.terbayar > 0) || tagihan.status === 'Lunas' || tagihan.status === 'Dicicil') {
          // If all transactions were deleted for this bill, revert back to Belum Lunas
          if (!tagihan.id.startsWith('syn-')) {
            hasChanged = true;
            return { ...tagihan, terbayar: 0, status: 'Belum Lunas', tanggalBayar: '' };
          }
        }
        return tagihan;
      });
      return hasChanged ? newList : prevTagihanList;
    });
  }, [transaksiList, setTagihanList]);
  
  // Modal Edit Tagihan
  const [showEditTagihanModal, setShowEditTagihanModal] = useState(false);
  const [editingTagihan, setEditingTagihan] = useState<TagihanKeuangan | null>(null);
  const [editTagihanForm, setEditTagihanForm] = useState<{
    namaTagihan: string;
    nominal: number;
    jatuhTempo: string;
    tanggalBayar: string;
    tanggalTagihan?: string;
    status: 'Lunas' | 'Belum Lunas' | 'Dicicil';
    terbayar?: number;
    metodePembayaran?: string;
  }>({
    namaTagihan: '',
    nominal: 0,
    jatuhTempo: '',
    tanggalBayar: '',
    tanggalTagihan: '',
    status: 'Belum Lunas',
    terbayar: 0,
    metodePembayaran: 'Cash / Kasir'
  });

  // Search Submit Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchKey);
  };

  // Month Selection Toggle
  const toggleMonthSelection = (m: string) => {
    if (paidMonthsState[m]) return; // Already paid
    setSelectedMonths(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  // Helper function to update or create bill in tagihanList upon payment
  const updateOrCreateTagihanList = (
    sName: string,
    sId: string,
    sKelas: string,
    tipe: TipeKeuangan,
    title: string,
    nominal: number,
    bayar: number,
    payDate: string,
    tglTagihan?: string
  ) => {
    localStorage.removeItem('edu_tagihan_force_clear');
    localStorage.removeItem('edu_transaksi_force_clear');
    
    const normName = sName.trim().toLowerCase().replace(/\s+/g, ' ');
    const sIdNorm = (sId || '').trim();
    
    let targetTagihanId = `tag-${Date.now()}`;
    setTagihanList(prev => {
      const existingIndex = prev.findIndex(t => {
        const tNormName = (t.siswaNama || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const isSameStudent = (t.siswaId && sIdNorm && t.siswaId === sIdNorm) || tNormName === normName;
        if (!isSameStudent) return false;

        // Must match exact same type
        if (t.tipe !== tipe) return false;

        // For SPP (monthly), we should match the specific month
        if (tipe === 'spp') {
          const months = [
            'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
            'januari', 'februari', 'maret', 'april', 'mei', 'juni'
          ];
          const matchedMonthInTitle = months.find(m => title.toLowerCase().includes(m));
          const matchedMonthInTagihan = months.find(m => t.namaTagihan.toLowerCase().includes(m));
          
          if (matchedMonthInTitle && matchedMonthInTagihan) {
            return matchedMonthInTitle === matchedMonthInTagihan;
          }
        }

        // Default title matching for non-SPP or fallback
        return t.namaTagihan.toLowerCase().includes(title.toLowerCase()) || 
               title.toLowerCase().includes(t.namaTagihan.toLowerCase());
      });

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        targetTagihanId = existing.id;
        // Correct nominal if it differs from the official tariff nominal being processed
        const finalNominal = existing.nominal !== nominal ? nominal : existing.nominal;
        const newTerbayar = Math.min(finalNominal, (existing.terbayar || 0) + bayar);
        const isLunas = newTerbayar >= finalNominal;
        const updatedItem: TagihanKeuangan = {
          ...existing,
          nominal: finalNominal,
          terbayar: newTerbayar,
          status: isLunas ? 'Lunas' : (newTerbayar > 0 ? 'Dicicil' : 'Belum Lunas'),
          tanggalBayar: payDate,
          ...(tglTagihan ? { tanggalTagihan: tglTagihan } : {})
        };
        const newArr = [...prev];
        newArr[existingIndex] = updatedItem;
        return newArr;
      } else {
        const isLunas = bayar >= nominal;
        const months = [
          'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
          'januari', 'februari', 'maret', 'april', 'mei', 'juni'
        ];
        const matchedMonth = months.find(m => title.toLowerCase().includes(m));
        const finalBulanTagihan = matchedMonth 
          ? (matchedMonth.charAt(0).toUpperCase() + matchedMonth.slice(1)) 
          : (tipe === 'spp' || tipe === 'ekskul' ? 'Bulanan' : tahunAjaran);

        const newBill: TagihanKeuangan = {
          id: targetTagihanId,
          siswaId: sId || `sis-${Date.now()}`,
          siswaNama: sName || 'Siswa',
          kelas: sKelas || 'Umum',
          tipe: tipe,
          namaTagihan: title,
          bulanTahun: finalBulanTagihan,
          nominal: nominal,
          terbayar: Math.min(nominal, bayar),
          status: isLunas ? 'Lunas' : (bayar > 0 ? 'Dicicil' : 'Belum Lunas'),
          tanggalBayar: payDate,
          tanggalTagihan: tglTagihan || payDate,
          jatuhTempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        };
        return [newBill, ...prev];
      }
    });
    return targetTagihanId;
  };

  // Process Payment / Create Tagihan Submission
  const handleProcessPayment = () => {
    if (!selectedSiswa) {
      alert('Silakan cari dan pilih nama siswa terlebih dahulu!');
      return;
    }

    const studentName = selectedSiswa ? selectedSiswa.nama : '';
    const [tYear, tMonth, tDay] = (inputTanggalTagihan || new Date().toISOString().split('T')[0]).split('-').map(Number);
    const dateObj = (tYear && tMonth && tDay) ? new Date(tYear, tMonth - 1, tDay) : new Date();
    const todayFormatted = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const dateShort = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    });
    const dateNumeric = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    if (quickPayType === 'spp' || quickPayType === 'ekskul') {
      if (selectedMonths.length === 0) {
        alert(`Silakan pilih bulan ${quickPayType === 'spp' ? 'SPP' : 'Ekskul'} pada Jenis Tagihan terlebih dahulu.`);
        return;
      }
      if (quickPayType === 'ekskul' && !quickPayItemId) {
        alert('Silakan pilih item ekskul terlebih dahulu.');
        return;
      }
      const fee = quickPayType === 'spp' ? monthlyFee : (ekskulTarifs.find(t => t.id === quickPayItemId)?.nominal || 0);
      const totalToPay = selectedMonths.length * fee;
      if (totalToPay <= 0) {
        alert('Total tagihan harus lebih dari 0.');
        return;
      }

      const ekskulItem = quickPayType === 'ekskul' ? ekskulTarifs.find(t => t.id === quickPayItemId) : null;
      const ekskulName = ekskulItem ? ekskulItem.namaBiaya : 'Ekskul';
      const itemTitle = selectedMonths.length > 0 
        ? `${quickPayType === 'spp' ? `SPP - T.A ${tahunAjaran}` : ekskulName} (${selectedMonths.join(', ')})`
        : `${quickPayType === 'spp' ? `SPP - T.A ${tahunAjaran}` : ekskulName} (Bulanan)`;

      const tagId = updateOrCreateTagihanList(
        studentName,
        selectedSiswa ? selectedSiswa.id : '',
        selectedSiswa ? selectedSiswa.kelas : '',
        quickPayType,
        itemTitle,
        totalToPay,
        inputDibayar,
        inputTanggalTagihan || dateNumeric,
        inputTanggalTagihan || dateNumeric
      );

      if (inputDibayar > 0) {
        if (quickPayType === 'spp' && selectedMonths.length > 0) {
          const newPaid = { ...paidMonthsState };
          selectedMonths.forEach(m => {
            newPaid[m] = dateShort;
          });
          setPaidMonthsState(newPaid);
        }

        const txUniqueId = `tx-${Date.now()}`;
        const newTx = {
          id: txUniqueId,
          pembayaran: itemTitle,
          tagihan: totalToPay,
          tanggal: todayFormatted,
          type: quickPayType as ('spp' | 'ekskul')
        };
        setStudentTransactions(prev => [newTx, ...prev]);

        if (setTransaksiList) {
          const globalTrx: TransaksiKeuangan = {
            id: txUniqueId,
            tagihanId: tagId,
            siswaNama: studentName,
            pembayaran: itemTitle,
            tipe: quickPayType,
            nominal: inputDibayar,
            tanggal: dateNumeric,
            metodePembayaran: selectedMetodePembayaran,
            penerima: 'Kasir / Bendahara Sekolah'
          };
          setTransaksiList(prev => [globalTrx, ...prev]);
        }

        const receipt = {
          noNota: generateInvoiceNumber(),
          tahunAjaran,
          nis: selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis) : '',
          nama: studentName,
          namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
          kelas: selectedSiswa ? selectedSiswa.kelas : '',
          items: [{ id: `item-${Date.now()}`, uraian: itemTitle, jumlah: totalToPay }],
          pembayaranTitle: itemTitle,
          nominal: totalToPay,
          dibayar: inputDibayar,
          kembalian: Math.max(0, inputDibayar - totalToPay),
          tanggal: todayFormatted,
          penerima: 'Bendahara Sekolah'
        };

        setPrintReceiptData(receipt);
        setSlipPrintDate(inputTanggalTagihan || new Date().toISOString().split("T")[0]);
        // Jangan tampilkan kuitansi secara otomatis sesuai permintaan user
        // setShowPrintModal(true);
        alert(`Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} berhasil diproses!`);

        if (selectedSiswa && selectedSiswa.teleponWali) {
          const msg = `Yth. Ibu/Bapak Wali dari ${studentName},\n\nTerima kasih! Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} telah DITERIMA oleh Kasir Sekolah pada ${todayFormatted}.\n\n_Tata Usaha & Keuangan Sekolah_`;
          sendFonnteMessage(selectedSiswa.teleponWali, msg, fonnteToken);
        }
      } else {
        alert(`Tagihan ${itemTitle} sebesar Rp ${totalToPay.toLocaleString('id-ID')} berhasil dibuat dan muncul di Rekap (Daftar Tagihan)!`);
      }

      setSelectedMonths([]);
      setInputTotal(0);
      setInputDibayar(0);
    } else {
      const targetTarif = (quickPayType === 'ukt' ? uktTarifs : ekskulTarifs).find(t => t.id === quickPayItemId) || (quickPayType === 'ukt' ? uktTarifs[0] : ekskulTarifs[0]);
      const payNominal = inputTotal > 0 ? inputTotal : (targetTarif ? targetTarif.nominal : 100000);

      if (payNominal <= 0) {
        alert('Total tagihan harus lebih dari 0.');
        return;
      }

      const itemName = targetTarif ? targetTarif.namaBiaya : (quickPayType === 'ukt' ? 'UKT / Uang Masuk' : 'Ekskul / Kegiatan');
      const itemId = targetTarif ? targetTarif.id : quickPayType;
      const itemTitle = `${itemName} (T.A ${tahunAjaran})`;

      const tagId = updateOrCreateTagihanList(
        studentName,
        selectedSiswa ? selectedSiswa.id : '',
        selectedSiswa ? selectedSiswa.kelas : '',
        quickPayType,
        itemTitle,
        payNominal,
        inputDibayar,
        inputTanggalTagihan || dateNumeric,
        inputTanggalTagihan || dateNumeric
      );

      if (inputDibayar > 0) {
        setBebasTerbayarMap(prev => {
          const current = prev[itemId] || 0;
          const maxTotal = targetTarif ? targetTarif.nominal : payNominal;
          return { ...prev, [itemId]: Math.min(maxTotal, current + inputDibayar) };
        });

        const txUniqueId = `tx-${Date.now()}`;
        const newTx = {
          id: txUniqueId,
          pembayaran: itemTitle,
          tagihan: payNominal,
          tanggal: todayFormatted,
          itemId,
          type: 'bebas' as const
        };
        setStudentTransactions(prev => [newTx, ...prev]);

        if (setTransaksiList) {
          const globalTrx: TransaksiKeuangan = {
            id: txUniqueId,
            tagihanId: tagId,
            siswaNama: studentName,
            pembayaran: itemTitle,
            tipe: quickPayType,
            nominal: inputDibayar,
            tanggal: dateNumeric,
            metodePembayaran: selectedMetodePembayaran,
            penerima: 'Kasir / Bendahara Sekolah'
          };
          setTransaksiList(prev => [globalTrx, ...prev]);
        }

        const receipt = {
          noNota: generateInvoiceNumber(),
          tahunAjaran,
          nis: selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis) : '',
          nama: studentName,
          namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
          kelas: selectedSiswa ? selectedSiswa.kelas : '',
          items: [{ id: `item-${Date.now()}`, uraian: itemTitle, jumlah: payNominal }],
          pembayaranTitle: itemTitle,
          nominal: payNominal,
          dibayar: inputDibayar,
          kembalian: Math.max(0, inputDibayar - payNominal),
          tanggal: todayFormatted,
          penerima: 'Bendahara Sekolah'
        };
        setPrintReceiptData(receipt);
        setSlipPrintDate(inputTanggalTagihan || new Date().toISOString().split("T")[0]);
        setPrintReceiptData(receipt);
        // Jangan tampilkan kuitansi secara otomatis sesuai permintaan user
        // setShowPrintModal(true);
        alert(`Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} berhasil diproses!`);

        if (selectedSiswa && selectedSiswa.teleponWali) {
          const msg = `Yth. Ibu/Bapak Wali dari ${studentName},\n\nTerima kasih! Pembayaran ${itemTitle} sebesar Rp ${inputDibayar.toLocaleString('id-ID')} telah DITERIMA oleh Kasir Sekolah pada ${todayFormatted}.\n\n_Tata Usaha & Keuangan Sekolah_`;
          sendFonnteMessage(selectedSiswa.teleponWali, msg, fonnteToken);
        }
      } else {
        alert(`Tagihan ${itemTitle} sebesar Rp ${payNominal.toLocaleString('id-ID')} berhasil dibuat dan muncul di Rekap (Daftar Tagihan)!`);
      }

      setInputTotal(0);
      setInputDibayar(0);
    }
  };

  // Process Bebas Payment
  const handleProcessBebasPayment = (itemId: string, namaItem: string) => {
    const payNominal = bebasPayInput[itemId] || 0;
    if (payNominal <= 0) return;

    setBebasTerbayarMap(prev => {
      const current = prev[itemId] || 0;
      const targetItem = bebasItems.find(i => i.id === itemId);
      const maxTotal = targetItem ? targetItem.total : payNominal;
      return { ...prev, [itemId]: Math.min(maxTotal, current + payNominal) };
    });

    const [tYear, tMonth, tDay] = (inputTanggalTagihan || new Date().toISOString().split('T')[0]).split('-').map(Number);
    const dateObj = (tYear && tMonth && tDay) ? new Date(tYear, tMonth - 1, tDay) : new Date();
    const todayFormatted = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const dateNumeric = dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const txUniqueId = `tx-${Date.now()}`;

    const newTx = {
      id: txUniqueId,
      pembayaran: `${namaItem} (T.A ${tahunAjaran})`,
      tagihan: payNominal,
      tanggal: todayFormatted,
      itemId,
      type: 'bebas' as const
    };
    setStudentTransactions(prev => [newTx, ...prev]);

    const studentName = selectedSiswa ? selectedSiswa.nama : '';
    const tagId = updateOrCreateTagihanList(
      studentName,
      selectedSiswa ? selectedSiswa.id : '',
      selectedSiswa ? selectedSiswa.kelas : '',
      'ukt',
      `${namaItem} (T.A ${tahunAjaran})`,
      payNominal,
      payNominal,
      inputTanggalTagihan || dateNumeric,
      inputTanggalTagihan || dateNumeric
    );

    if (setTransaksiList) {
      const globalTrx: TransaksiKeuangan = {
        id: txUniqueId,
        tagihanId: tagId,
        siswaNama: studentName,
        pembayaran: `${namaItem} (T.A ${tahunAjaran})`,
        tipe: 'ukt',
        nominal: payNominal,
        tanggal: dateNumeric,
        metodePembayaran: selectedMetodePembayaran,
        penerima: 'Kasir / Bendahara Sekolah'
      };
      setTransaksiList(prev => [globalTrx, ...prev]);
    }
    const receipt = {
      noNota: generateInvoiceNumber(),
      tahunAjaran,
      nis: selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis) : '',
      nama: studentName,
      namaIbu: selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali) : '',
      kelas: selectedSiswa ? selectedSiswa.kelas : '',
      items: [
        {
          id: `item-${Date.now()}`,
          uraian: `${namaItem} (T.A ${tahunAjaran})`,
          jumlah: payNominal
        }
      ],
      pembayaranTitle: `${namaItem} (T.A ${tahunAjaran})`,
      nominal: payNominal,
      dibayar: payNominal,
      kembalian: 0,
      tanggal: todayFormatted,
      penerima: 'Bendahara Sekolah'
    };
    setPrintReceiptData(receipt);
    setShowPrintModal(true);
  };

  // Calculate unpaid SPP sum
  const unpaidMonthsCount = allMonths.filter(m => !paidMonthsState[m]).length;
  const totalSisaBulanan = unpaidMonthsCount * monthlyFee;

  // Fee Rates CRUD Handlers
  // Delete All Confirmation State
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const handleExecuteDeleteAll = async () => {
    try {
      localStorage.setItem('edu_tagihan_force_clear', 'true');
      localStorage.setItem('edu_transaksi_force_clear', 'true');
      
      setTagihanList([]);
      setTransaksiList([]);
      
      const clearPromises = [
        dbClearCollection('edu_tagihanList'),
        dbClearCollection('edu_transaksiList')
      ];
      
      await Promise.all(clearPromises);
      
      // Delay removal of force-clear flags to ensure onSnapshot listeners ignore any stale data propagation
      setTimeout(() => {
        localStorage.removeItem('edu_tagihan_force_clear');
        localStorage.removeItem('edu_transaksi_force_clear');
      }, 3000);
      
      setShowDeleteAllModal(false);
      alert('Seluruh data tagihan dan transaksi berhasil dikosongkan!');
    } catch (error) {
      console.error('Error during mass deletion:', error);
      alert('Gagal mengosongkan data. Silakan coba lagi.');
    }
  };

  const handleOpenAddTarif = () => {
    setEditingTarif(null);
    setTarifForm({
      namaBiaya: '',
      tipe: 'spp',
      tingkatKelas: 'Kelas 7',
      nominal: 100000,
      periode: 'Bulanan',
      keterangan: '',
      status: 'Aktif',
      ekskulId: ''
    });
    setShowTarifModal(true);
  };

  const handleOpenEditTarif = (tarif: TarifBiaya) => {
    setEditingTarif(tarif);
    setTarifForm({
      namaBiaya: tarif.namaBiaya,
      tipe: tarif.tipe,
      tingkatKelas: tarif.tingkatKelas,
      nominal: tarif.nominal,
      periode: tarif.periode,
      keterangan: tarif.keterangan || '',
      status: tarif.status,
      ekskulId: tarif.ekskulId || ''
    });
    setShowTarifModal(true);
  };

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifForm.namaBiaya.trim() || tarifForm.nominal <= 0) {
      alert('Mohon isi nama biaya dan nominal tarif dengan benar.');
      return;
    }

    if (editingTarif) {
      // Update
      setTarifList(prev => prev.map(t => t.id === editingTarif.id ? { ...t, ...tarifForm } : t));
    } else {
      // Create
      const newTarif: TarifBiaya = {
        id: `trf-${Date.now()}`,
        ...tarifForm
      };
      setTarifList(prev => [newTarif, ...prev]);
    }

    setShowTarifModal(false);
  };

  const handleDeleteTarif = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tarif biaya ini?')) {
      setTarifList(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleTarifStatus = (id: string) => {
    setTarifList(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Aktif' ? 'Nonaktif' : 'Aktif' };
      }
      return t;
    }));
  };

  const handleGenerateTagihanMassal = () => {
    if (!siswaList || siswaList.length === 0) {
      alert('Data siswa kosong. Tidak dapat membuat tagihan.');
      return;
    }

    const activeTarifs = tarifList.filter(t => t.status === 'Aktif' && generateTypes.includes(t.tipe));
    if (activeTarifs.length === 0) {
      alert('Tidak ada tarif aktif untuk kategori yang dipilih.');
      return;
    }

    let createdCount = 0;
    const newTagihan: TagihanKeuangan[] = [];

    siswaList.forEach(siswa => {
      const { tingkatKelas } = getStudentTingkatDanRombel(siswa);
      
      const matchingTarifs = activeTarifs.filter(t => {
        if (t.tingkatKelas === 'Peserta Ekskul') {
          if (t.ekskulId) {
            const eks = ekskulList.find(e => e.id === t.ekskulId);
            return eks?.anggotaSiswaIds?.includes(siswa.id);
          }
          return false;
        }
        return t.tingkatKelas === tingkatKelas || t.tingkatKelas === 'Semua Tingkat';
      });

      matchingTarifs.forEach(tarif => {
        const bulanTahun = (tarif.tipe === 'spp' || tarif.tipe === 'ekskul') ? `${generateMonth} ${generateYear}` : generateYear;
        
        // Cek apakah sudah ada tagihan yang sama untuk siswa ini
        const isExist = tagihanList.some(t => 
          t.siswaId === siswa.id && 
          t.namaTagihan === tarif.namaBiaya && 
          t.bulanTahun === bulanTahun &&
          !t.isDeleted
        );

        if (!isExist) {
          createdCount++;
          newTagihan.push({
            id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            siswaId: siswa.id,
            siswaNama: siswa.nama,
            kelas: siswa.kelas || tingkatKelas,
            tipe: tarif.tipe,
            namaTagihan: tarif.namaBiaya,
            bulanTahun: bulanTahun,
            nominal: tarif.nominal,
            terbayar: 0,
            status: 'Belum Lunas',
            jatuhTempo: `10 ${bulanTahun}`,
          });
        }
      });
    });

    if (newTagihan.length > 0) {
      setTagihanList(prev => [...newTagihan, ...prev]);
      alert(`Berhasil membuat ${createdCount} tagihan baru secara otomatis sesuai tarif & kelas masing-masing.`);
    } else {
      alert('Tidak ada tagihan baru yang dibuat. Semua tagihan untuk kriteria ini sudah ada sebelumnya.');
    }
    
    setShowGenerateModal(false);
  };

  // WhatsApp Fonnte Notification Handlers
  const formatWhatsAppMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Asterisks for bold: *text* -> <strong class="font-bold text-slate-900">text</strong>
    html = html.replace(/\*([^*]+)\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
    
    // Underscores for italics: _text_ -> <em class="italic text-slate-600">text</em>
    html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-600">$1</em>');

    return html;
  };

  const parseWaTemplate = (
    template: string,
    vars: {
      NAMA_SISWA: string;
      KELAS: string;
      NAMA_TAGIHAN: string;
      NOMINAL_TAGIHAN: string;
      SISA_TAGIHAN: string;
      NOMINAL_BAYAR: string;
      TANGGAL_BAYAR: string;
      NAMA_SEKOLAH: string;
      TAGIHAN?: string;
      NOMINAL?: string;
      JATUH_TEMPO?: string;
      STATUS?: string;
      NO_INVOICE?: string;
      METODE_BAYAR?: string;
      BANK_VA_NAME?: string;
      BANK_VA_NUMBER?: string;
      BANK_VA_OWNER?: string;
    }
  ) => {
    let result = template;
    const fullVars = {
      ...vars,
      TAGIHAN: vars.TAGIHAN || vars.NAMA_TAGIHAN,
      NOMINAL: vars.NOMINAL || vars.NOMINAL_TAGIHAN,
      JATUH_TEMPO: vars.JATUH_TEMPO || "10 Agustus 2026",
      STATUS: vars.STATUS || "BELUM LUNAS",
      NO_INVOICE: vars.NO_INVOICE || "0001/C-ALFAKHIR/VIII/2026",
      METODE_BAYAR: vars.METODE_BAYAR || "Cash / Kasir",
      BANK_VA_NAME: vars.BANK_VA_NAME || schoolSettings?.bankVaName || "-",
      BANK_VA_NUMBER: vars.BANK_VA_NUMBER || schoolSettings?.bankVaNumber || "-",
      BANK_VA_OWNER: vars.BANK_VA_OWNER || schoolSettings?.bankVaOwner || "-"
    };
    Object.entries(fullVars).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{${key}}`, 'gi'), val);
    });
    return result;
  };

  const handleSendWaReminder = async (tagihan: TagihanKeuangan) => {
    const s = siswaList.find(item => item.id === tagihan.siswaId || item.nis === tagihan.siswaNama || item.nama === tagihan.siswaNama);
    const phone = s?.teleponWali || '081234567890';
    const sisa = tagihan.nominal - tagihan.terbayar;
    
    const defaultTemplate = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nMenginformasikan tagihan :\n• *No. Invoice*: {NO_INVOICE}\n• *{TAGIHAN}* sebesar *Rp {NOMINAL}*\n• *Jatuh tempo pada* {JATUH_TEMPO}\n• *Status saat ini*: {STATUS}.\n\nMohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer.\n\nTerima kasih atas perhatian Bapak/Ibu.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
    const templateToUse = schoolSettings?.fonnteConfig?.templateReminder || defaultTemplate;

    const message = parseWaTemplate(templateToUse, {
      NAMA_SISWA: tagihan.siswaNama,
      KELAS: tagihan.kelas || 'X',
      NAMA_TAGIHAN: tagihan.namaTagihan,
      NOMINAL_TAGIHAN: `Rp ${tagihan.nominal.toLocaleString('id-ID')}`,
      SISA_TAGIHAN: `Rp ${sisa.toLocaleString('id-ID')}`,
      NOMINAL_BAYAR: `Rp ${tagihan.terbayar.toLocaleString('id-ID')}`,
      TANGGAL_BAYAR: tagihan.tanggalBayar || new Date().toLocaleDateString('id-ID'),
      NAMA_SEKOLAH: schoolSettings?.namaSekolah || 'Sekolah Modern Al-Fakhir',
      TAGIHAN: tagihan.namaTagihan,
      NOMINAL: `${tagihan.nominal.toLocaleString('id-ID')}`,
      JATUH_TEMPO: tagihan.jatuhTempo || new Date().toLocaleDateString('id-ID'),
      STATUS: tagihan.status === 'Lunas' ? 'LUNAS' : tagihan.status === 'Dicicil' ? 'DICICIL' : 'BELUM LUNAS',
      NO_INVOICE: getStableInvoiceNumber(tagihan),
      BANK_VA_NAME: schoolSettings?.bankVaName,
      BANK_VA_NUMBER: schoolSettings?.bankVaNumber,
      BANK_VA_OWNER: schoolSettings?.bankVaOwner
    });
    
    setWaSendingStatus(`Mengirim WA Tagihan ke ${tagihan.siswaNama} (${phone})...`);
    const res = await sendFonnteMessage(phone, message, fonnteToken);
    setWaSendingStatus(res.message);
    setTimeout(() => setWaSendingStatus(null), 4000);
  };

  const handleSendWaConfirmation = async (tagihan: TagihanKeuangan) => {
    const s = siswaList.find(item => item.id === tagihan.siswaId || item.nis === tagihan.siswaNama || item.nama === tagihan.siswaNama);
    const phone = s?.teleponWali || '081234567890';
    const txs = transaksiList.filter(tx => tx.tagihanId === tagihan.id);
    const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
    const tglBayar = tagihan.tanggalBayar || (latestTx ? latestTx.tanggal : new Date().toLocaleDateString('id-ID'));
    const sisa = tagihan.nominal - tagihan.terbayar;
    const bayarNominal = tagihan.terbayar > 0 ? tagihan.terbayar : tagihan.nominal;

    const defaultTemplate = `Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* ({KELAS}),\n\nTerima kasih, pembayaran *{NAMA_TAGIHAN}* sebesar *{NOMINAL_BAYAR}* telah *KAMI TERIMA* dengan baik pada *{TANGGAL_BAYAR}*.\n• *No. Invoice* : {NO_INVOICE}\n• *Metode*: {METODE_BAYAR}\n\n*Status Tagihan*: {STATUS}.\n• *Bendahara SMPI MODERN AL FAKHIR*`;
    const templateToUse = schoolSettings?.fonnteConfig?.templateReceipt || defaultTemplate;

    const message = parseWaTemplate(templateToUse, {
      NAMA_SISWA: tagihan.siswaNama,
      KELAS: tagihan.kelas || 'X',
      NAMA_TAGIHAN: tagihan.namaTagihan,
      NOMINAL_TAGIHAN: `Rp ${tagihan.nominal.toLocaleString('id-ID')}`,
      SISA_TAGIHAN: `Rp ${sisa.toLocaleString('id-ID')}`,
      NOMINAL_BAYAR: `Rp ${bayarNominal.toLocaleString('id-ID')}`,
      TANGGAL_BAYAR: tglBayar,
      NAMA_SEKOLAH: schoolSettings?.namaSekolah || 'Sekolah Modern Al-Fakhir',
      TAGIHAN: tagihan.namaTagihan,
      NOMINAL: `${tagihan.nominal.toLocaleString('id-ID')}`,
      JATUH_TEMPO: tagihan.jatuhTempo || new Date().toLocaleDateString('id-ID'),
      STATUS: 'LUNAS',
      NO_INVOICE: getStableInvoiceNumber(tagihan),
      METODE_BAYAR: latestTx?.metodePembayaran || (tagihan as any).metodePembayaran || 'Cash / Kasir',
      BANK_VA_NAME: schoolSettings?.bankVaName,
      BANK_VA_NUMBER: schoolSettings?.bankVaNumber,
      BANK_VA_OWNER: schoolSettings?.bankVaOwner
    });
    
    setWaSendingStatus(`Mengirim WA Konfirmasi Lunas ke ${tagihan.siswaNama} (${phone})...`);
    const res = await sendFonnteMessage(phone, message, fonnteToken);
    setWaSendingStatus(res.message);
    setTimeout(() => setWaSendingStatus(null), 4000);
  };

  const getDisplayBulanTagihan = (t: TagihanKeuangan) => {
    const months = [
      'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
      'januari', 'februari', 'maret', 'april', 'mei', 'juni'
    ];
    // Check namaTagihan first (e.g. "SPP - T.A 2026/2027 (Juli)" or "Ekskul Basket (Juli)")
    const foundNama = months.find(m => (t.namaTagihan || '').toLowerCase().includes(m));
    if (foundNama) {
      return foundNama.charAt(0).toUpperCase() + foundNama.slice(1);
    }
    // Check bulanTahun
    if (t.bulanTahun) {
      const foundBulan = months.find(m => t.bulanTahun.toLowerCase().includes(m));
      if (foundBulan) {
        return foundBulan.charAt(0).toUpperCase() + foundBulan.slice(1);
      }
    }
    // If it's Ekskul or UKT / Uang Masuk without month, display '-'
    const tipe = (t.tipe || '').toLowerCase();
    if (tipe === 'ekskul' || tipe === 'ukt' || tipe === 'bebas' || tipe === 'lainnya') {
      return '-';
    }
    return t.bulanTahun || '-';
  };

  const handleExportCSV = () => {
    const columns = [
      'No. Invoice', 'Nama Siswa', 'Kelas', 'Tipe Keuangan', 'Nama Tagihan', 
      'Bulan Tagihan', 'Nominal Tagihan (Rp)', 'Total Terbayar (Rp)', 'Sisa Tunggakan (Rp)', 'Tanggal Tagihan', 'Tanggal Pembayaran', 'Status'
    ];
    const rows = tagihanList.map(t => {
      const txs = transaksiList.filter(tx => tx.tagihanId === t.id);
      const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
      const isLunas = t.status === 'Lunas' || t.status === 'LUNAS';
      const tglBayar = isLunas ? (t.tanggalBayar || (latestTx ? latestTx.tanggal : new Date().toLocaleDateString('id-ID'))) : '-';
      const invoiceNo = getStableInvoiceNumber(t);
      return [
        invoiceNo, t.siswaNama, t.kelas, t.tipe.toUpperCase(), t.namaTagihan,
        getDisplayBulanTagihan(t), t.nominal, t.terbayar || 0, t.nominal - (t.terbayar || 0), t.jatuhTempo || '-', tglBayar, t.status
      ];
    });
    downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportResult({
      success: true,
      message: '✅ File Rekapitulasi Keuangan berhasil diunduh dalam format CSV / Excel!'
    });
  };

  // Google Sheets Export
  const handleExportGoogleSheets = async () => {
    setExportingSheets(true);
    setExportResult(null);

    const columns = [
      'No. Invoice', 'Nama Siswa', 'Kelas', 'Tipe Keuangan', 'Nama Tagihan', 
      'Bulan Tagihan', 'Nominal Tagihan (Rp)', 'Total Terbayar (Rp)', 'Sisa Tunggakan (Rp)', 'Tanggal Tagihan', 'Tanggal Pembayaran', 'Status'
    ];
    const rows = tagihanList.map(t => {
      const txs = transaksiList.filter(tx => tx.tagihanId === t.id);
      const latestTx = txs.length > 0 ? txs[txs.length - 1] : null;
      const isLunas = t.status === 'Lunas' || t.status === 'LUNAS';
      const tglBayar = isLunas ? (t.tanggalBayar || (latestTx ? latestTx.tanggal : new Date().toLocaleDateString('id-ID'))) : '-';
      const invoiceNo = getStableInvoiceNumber(t);
      return [
        invoiceNo, t.siswaNama, t.kelas, t.tipe.toUpperCase(), t.namaTagihan,
        t.bulanTahun || '-', t.nominal, t.terbayar || 0, t.nominal - (t.terbayar || 0), t.jatuhTempo || '-', tglBayar, t.status
      ];
    });

    try {
      const res = await fetch('/api/export-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: userGoogleToken,
          title: `Laporan Keuangan Sekolah - ${new Date().toLocaleDateString('id-ID')}`,
          sheetName: 'Rekap Keuangan SPP UKT',
          columns,
          rows
        })
      });
      const data = await res.json();
      
      const isRealUrl = data.success && data.spreadsheetUrl && !data.spreadsheetUrl.includes('demo_') && data.spreadsheetUrl.startsWith('http');

      if (isRealUrl) {
        setExportResult({ success: true, url: data.spreadsheetUrl, message: 'Berhasil membuat Google Spreadsheet di Drive Anda!' });
      } else {
        // Fallback: download CSV directly so user gets a valid file immediately
        downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
        setExportResult({
          success: true,
          message: 'Laporan Keuangan berhasil diunduh secara langsung sebagai file CSV / Excel!'
        });
      }
    } catch (err) {
      downloadCSV(columns, rows, `Laporan_Keuangan_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
      setExportResult({ success: true, message: 'Laporan Keuangan berhasil diunduh secara langsung sebagai file CSV / Excel.' });
    } finally {
      setExportingSheets(false);
    }
  };

  // Filtered Tarif List
  const filteredTarifList = useMemo(() => {
    if (feeCategoryFilter === 'semua') return tarifList;
    return tarifList.filter(t => t.tipe === feeCategoryFilter);
  }, [tarifList, feeCategoryFilter]);

  return (
    <div className="space-y-6 text-slate-100">

      {/* TOP HEADER & NAVIGATION SUBTABS */}
      <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {schoolSettings?.logoUrl ? (
            <div className="w-12 h-12 rounded-xl p-1 bg-white/10 border border-slate-700 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              <img 
                src={schoolSettings.logoUrl} 
                alt="Logo Sekolah" 
                className="w-full h-full object-contain" 
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">
                {schoolSettings?.namaSekolah || 'Manajemen Keuangan Sekolah & Kasir'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                {schoolSettings?.npsn ? `NPSN: ${schoolSettings.npsn}` : 'Keuangan'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{schoolSettings?.namaSekolah ? `Dashboard Keuangan • ${schoolSettings.namaSekolah}` : 'Modul transaksi kasir SPP, iuran UKT/Uang Masuk, setting tarif biaya, kwitansi.'}</span>
              {schoolSettings?.akreditasi && <span>• Akreditasi {schoolSettings.akreditasi}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFonnteConfigModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition-colors"
            title="Pengaturan Gateway WA Fonnte"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PEMBAYARAN SISWA (MAIN KASIR SPP & BEBAS) */}
      {activeTab === 'pembayaran' && (
        <div className="space-y-6">

          {/* 1. FILTER DATA PEMBAYARAN SISWA */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
              Filter Data Pembayaran Siswa
            </h3>

            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-end gap-4 pt-1">
              <div className="w-full md:w-48 space-y-1">
                <label className="text-xs font-bold text-slate-300">Tahun Ajaran</label>
                <select
                  value={tahunAjaran}
                  onChange={e => setTahunAjaran(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>

              <div className="w-full md:w-40 space-y-1">
                <label className="text-xs font-bold text-slate-300">Semester</label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div className="flex-1 w-full space-y-1 relative">
                <label className="text-xs font-bold text-slate-300">Cari Siswa (Nama / NIS / NISN)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan Nama, NIS, atau NISN (contoh: Ahmad / 20261001)..."
                      value={searchKey}
                      onChange={e => {
                        setSearchKey(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                      className="w-full bg-[#181818] border border-slate-700/80 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#181818] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                        {searchSuggestions.map(s => (
                          <div
                            key={s.id}
                            onMouseDown={() => {
                              setSearchKey(s.nama);
                              setAppliedSearch(s.nama);
                              setShowSuggestions(false);
                            }}
                            className="px-3.5 py-2.5 hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors text-left"
                          >
                            <div>
                              <p className="text-white font-bold text-xs">{s.nama}</p>
                              <p className="text-[10px] text-slate-400">NIS: {s.nis} | NISN: {s.nisn || '-'}</p>
                            </div>
                            <span className="text-[10px] font-semibold bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-700/50">
                              Kelas {s.kelas}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 shrink-0"
                  >
                    Cari
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. INFORMASI SISWA */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Informasi Siswa
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!selectedSiswa}
                  onClick={() => {
                    if (!selectedSiswa) return;
                    const { tingkatKelas, rombel } = getStudentTingkatDanRombel(selectedSiswa);
                    setEditingSiswaData({ 
                      ...selectedSiswa,
                      tingkatKelas,
                      rombel: selectedSiswa.rombel || selectedSiswa.kelas || rombel,
                      kelas: selectedSiswa.kelas || rombel
                    });
                    setShowEditSiswaModal(true);
                  }}
                  className={`px-3 py-1.5 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md ${!selectedSiswa ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Siswa
                </button>

                <button
                  type="button"
                  disabled={!selectedSiswa}
                  onClick={() => {
                    if (!selectedSiswa) return;
                    const { tingkatKelas, rombel } = getStudentTingkatDanRombel(selectedSiswa);
                    setPrintReceiptData({
                      noNota: generateInvoiceNumber(),
                      tahunAjaran,
                      nis: selectedSiswa.nisn || selectedSiswa.nis,
                      nama: selectedSiswa.nama,
                      namaIbu: selectedSiswa.namaIbu || selectedSiswa.namaWali,
                      kelas: `${tingkatKelas} - ${rombel}`,
                      pembayaranTitle: `Rekap Seluruh Tagihan T.A ${tahunAjaran}`,
                      nominal: totalSisaBulanan + 650000,
                      dibayar: totalSisaBulanan + 650000,
                      kembalian: 0,
                      tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
                      penerima: 'Bendahara Sekolah'
                    });
                    setShowPrintModal(true);
                  }}
                  className={`px-4 py-1.5 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md ${!selectedSiswa ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'}`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Semua Tagihan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Left Student Attributes Table */}
              <div className="md:col-span-3 space-y-2.5 text-xs text-slate-300">
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">NISN</span>
                  <span className="col-span-8 font-mono font-bold text-emerald-400">: {selectedSiswa ? (selectedSiswa.nisn || selectedSiswa.nis || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Nama Siswa</span>
                  <span className="col-span-8 font-bold text-white text-sm">: {selectedSiswa ? selectedSiswa.nama : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">No. WhatsApp</span>
                  <span className="col-span-8 font-mono font-bold text-emerald-400">: {selectedSiswa ? (selectedSiswa.teleponWali || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Nama Ibu Kandung</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? (selectedSiswa.namaIbu || selectedSiswa.namaWali || '-') : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1 border-b border-slate-800/60">
                  <span className="col-span-4 font-semibold text-slate-400">Kelas</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? getStudentTingkatDanRombel(selectedSiswa).tingkatKelas : '-'}</span>
                </div>
                <div className="grid grid-cols-12 py-1">
                  <span className="col-span-4 font-semibold text-slate-400">Rombel</span>
                  <span className="col-span-8 font-bold text-slate-200">: {selectedSiswa ? getStudentTingkatDanRombel(selectedSiswa).rombel : '-'}</span>
                </div>
              </div>

              {/* Right Student Photo Avatar */}
              <div className="flex justify-center md:justify-end">
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-sky-500/10 p-1 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                  {selectedSiswa?.fotoUrl ? (
                    <img 
                      src={selectedSiswa.fotoUrl} 
                      alt={selectedSiswa.nama} 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : selectedSiswa?.nama ? (
                    <div className="w-full h-full rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-extrabold text-3xl">
                      {selectedSiswa.nama.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                      <User className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RINGKASAN TOTAL PEMBAYARAN (SPP, UKT, EKSKUL) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#121212] border border-slate-800/80 p-4 rounded-2xl shadow-lg">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total SPP Terbayar</span>
              <span className="text-sm font-mono font-extrabold text-emerald-400 mt-1">Rp {totalSppPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">{selectedSiswa ? Object.keys(paidMonthsState).length : 0} bulan lunas</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total UKT / Masuk</span>
              <span className="text-sm font-mono font-extrabold text-amber-400 mt-1">Rp {totalUktPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Uang gedung & atribut</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Ekskul / Kegiatan</span>
              <span className="text-sm font-mono font-extrabold text-sky-400 mt-1">Rp {totalEkskulPaid.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Iuran ekstrakurikuler</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-300">Total Keseluruhan</span>
              <span className="text-base font-mono font-black text-emerald-400 mt-1">Rp {totalSemuaPembayaran.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-emerald-400/70 mt-1">Akumulasi tuntas</span>
            </div>
          </div>
               {/* 3. THREE PANELS GRID: TRANSAKSI TERAKHIR | PEMBAYARAN | CETAK BUKTI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* PANEL B: TAGIHAN (PROCESSOR CALCULATOR) */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3.5">
                <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-emerald-400 font-extrabold text-lg">$</span>
                    Tagihan
                  </span>
                  {selectedSiswa && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/50 font-medium truncate max-w-[150px]">
                      {selectedSiswa.nama}
                    </span>
                  )}
                </h4>

                {!selectedSiswa && (
                  <div className="bg-amber-950/60 border border-amber-600/50 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Silakan cari dan pilih <strong>Nama Siswa</strong> terlebih dahulu pada form di atas untuk menginput tagihan.</span>
                  </div>
                )}

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Tagihan</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['spp', 'ukt', 'ekskul'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setQuickPayType(t as any)}
                          className={`py-1.5 rounded-lg font-bold border transition-all ${
                            quickPayType === t 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-600/20' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {quickPayType === 'spp' || quickPayType === 'ekskul' ? (
                    <div className="space-y-1.5">
                      {quickPayType === 'ekskul' && (
                        <div className="space-y-1 mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Item Ekskul</label>
                          <select
                            value={quickPayItemId}
                            onChange={(e) => setQuickPayItemId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-xs"
                          >
                            <option value="">-- Pilih Item Ekskul --</option>
                            {ekskulTarifs.map(t => (
                              <option key={t.id} value={t.id}>{t.namaBiaya} - Rp {t.nominal.toLocaleString('id-ID')}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {quickPayType === 'spp' ? 'Pilih Bulan SPP' : 'Pilih Bulan Ekskul'}
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {allMonths.map((m) => {
                          const isPaid = quickPayType === 'spp' ? paidMonthsState[m] : false;
                          const isSelected = selectedMonths.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              disabled={quickPayType === 'spp' && !!isPaid}
                              onClick={() => toggleMonthSelection(m)}
                              className={`py-1 rounded text-[9px] font-bold border transition-all ${
                                quickPayType === 'spp' && isPaid 
                                  ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500/50 cursor-not-allowed' 
                                  : isSelected
                                    ? 'bg-sky-600 border-sky-500 text-white'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                              title={quickPayType === 'spp' && isPaid ? `Lunas: ${isPaid}` : m}
                            >
                              {m.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Item UKT</label>
                      <select
                        value={quickPayItemId}
                        onChange={(e) => setQuickPayItemId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      >
                        <option value="">-- Pilih Item --</option>
                        {uktTarifs.map(t => (
                          <option key={t.id} value={t.id}>{t.namaBiaya} - Rp {t.nominal.toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                        <input
                          type="number"
                          value={inputTotal || ''}
                          onChange={(e) => setInputTotal(Number(e.target.value))}
                          readOnly={quickPayType === 'spp' || quickPayType === 'ekskul'}
                          className={`w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold ${quickPayType === 'spp' || quickPayType === 'ekskul' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Jumlah Bayar</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">Rp</span>
                        <input
                          type="number"
                          value={inputDibayar || ''}
                          onChange={(e) => setInputDibayar(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-emerald-900/30 text-emerald-400 rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Tagihan</label>
                      <input
                        type="date"
                        value={inputTanggalTagihan}
                        onChange={(e) => setInputTanggalTagihan(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Pembayaran</label>
                    <select
                      value={selectedMetodePembayaran}
                      onChange={(e) => setSelectedMetodePembayaran(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Cash / Kasir">Cash / Kasir (Tunai)</option>
                      <option value="Transfer Bank - BRI">Transfer Bank - BRI</option>
                      <option value="Transfer Bank - BNI">Transfer Bank - BNI</option>
                      <option value="Transfer Bank - Mandiri">Transfer Bank - Mandiri</option>
                      <option value="Transfer Bank - BCA">Transfer Bank - BCA</option>
                      <option value="QRIS / E-Wallet">QRIS / E-Wallet (OVO/Dana/Gopay)</option>
                      <option value="Tabungan Siswa">Tabungan Siswa</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Kembalian</span>
                      <span className="text-sm font-mono font-black text-amber-400">Rp {kembalian.toLocaleString('id-ID')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={!selectedSiswa || ((quickPayType === 'spp' || quickPayType === 'ekskul') && selectedMonths.length === 0) || (quickPayType === 'ekskul' && !quickPayItemId) || (quickPayType === 'ukt' && !quickPayItemId && inputTotal <= 0)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Proses
                    </button>
                  </div>
                </div>
              </div>

              {/* PANEL NEW: PENGATURAN VA & QRIS (IN BETWEEN) */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      VA & QRIS Bank
                    </span>
                    <button 
                      onClick={() => setShowVaConfigModal(true)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-700 transition-all"
                      title="Ubah Pengaturan VA & QRIS"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </h4>
                  
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{bankVaName}</span>
                        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                          <Building2 className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-sm font-mono font-bold text-white tracking-wider">{bankVaNumber}</p>
                      <p className="text-[9px] text-slate-400 font-medium italic">a.n {bankVaOwner}</p>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                      <div className="w-10 h-10 bg-white rounded-lg p-1 shrink-0 overflow-hidden">
                        <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">QRIS PEMBAYARAN</p>
                        <p className="text-[9px] text-slate-400 leading-tight">Tampilkan QRIS di kwitansi atau kirim via WA.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[9px] text-slate-500 italic text-center leading-relaxed">
                    *Nomor Virtual Account & QRIS ini akan otomatis terlampir pada rincian tagihan yang dikirim ke orang tua.
                  </p>
                </div>
              </div>

              {/* PANEL A: TRANSAKSI TERAKHIR (Landscape, Wide) */}
              <div className="md:col-span-3 bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-lg space-y-3">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Semua Transaksi & Riwayat Tagihan Siswa
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#181818] text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-2 py-2">Nama Tagihan / Pembayaran</th>
                        <th className="px-2 py-2">Total Tagihan</th>
                        <th className="px-2 py-2">Terbayar</th>
                        <th className="px-2 py-2">Tanggal Tagihan</th>
                        <th className="px-2 py-2">Tanggal Bayar / Realisasi</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-1 py-2 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {studentBills.map((t, idx) => {
                        const isLunas = t.status === 'Lunas';
                        const isDicicil = t.status === 'Dicicil';
                        const isBelumLunas = t.status === 'Belum Lunas';

                        return (
                          <tr key={t.id} className="hover:bg-slate-900/50">
                            <td className="px-2 py-2.5 font-semibold text-slate-200">
                              {t.namaTagihan}
                              {idx === 0 && (
                                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-bold">
                                  Terbaru
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 font-mono font-bold text-slate-300 whitespace-nowrap">
                              Rp {t.nominal.toLocaleString('id-ID')}
                            </td>
                            <td className="px-2 py-2.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                              Rp {(t.terbayar || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="px-2 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">
                              {t.tanggalTagihan ? formatDate(t.tanggalTagihan) : (t.jatuhTempo ? formatDate(t.jatuhTempo) : '-')}
                            </td>
                            <td className="px-2 py-2.5 text-[10px] text-slate-400 whitespace-nowrap">
                              {(isLunas || isDicicil) ? (t.tanggalBayar ? formatDate(t.tanggalBayar) : '-') : '-'}
                            </td>
                            <td className="px-2 py-2.5 whitespace-nowrap">
                              {isLunas && (
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] rounded-full font-bold">
                                  Lunas
                                </span>
                              )}
                              {isDicicil && (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] rounded-full font-bold">
                                  Dicicil
                                </span>
                              )}
                              {isBelumLunas && (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] rounded-full font-bold">
                                  Belum Lunas
                                </span>
                              )}
                            </td>
                            <td className="px-1 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={t.terbayar === 0 && !isLunas}
                                  onClick={() => {
                                    const matchingTx = studentTransactions.find(tx => 
                                      (tx.itemId && tx.itemId === t.id) || 
                                      (tx.pembayaran && t.namaTagihan && tx.pembayaran === t.namaTagihan)
                                    );
                                    if (matchingTx) {
                                      handleReprintTransaction(matchingTx);
                                    } else {
                                      handleReprintTransaction({
                                        id: t.id,
                                        pembayaran: t.namaTagihan,
                                        tagihan: t.terbayar || t.nominal,
                                        tanggal: t.tanggalBayar || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                      });
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-emerald-400 rounded transition-colors"
                                  title="Cetak ulang kwitansi"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTargetTagihan(t)}
                                  className="p-1 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 rounded transition-colors"
                                  title="Hapus atau batalkan pembayaran"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {studentBills.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500 text-[10px]">
                            Belum ada riwayat tagihan atau transaksi untuk siswa ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        )}

      {activeTab === 'pengaturan_biaya' && (
        <div className="space-y-6">

          {/* Action Header Card */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Pengaturan Tarif Biaya Sekolah (UKT, SPP & Ekskul)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Atur standar tarif nominal SPP bulanan per tingkat kelas, biaya UKT / Uang Masuk, serta iuran ekstrakurikuler & kegiatan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Generate Tagihan Otomatis
              </button>
              <button
                onClick={handleOpenAddTarif}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                Tambah Tarif Baru
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFeeCategoryFilter('semua')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'semua'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Semua Biaya ({tarifList.length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('spp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'spp'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              SPP Bulanan ({tarifList.filter(t => t.tipe === 'spp').length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('ukt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'ukt'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              UKT / Uang Masuk ({tarifList.filter(t => t.tipe === 'ukt').length})
            </button>

            <button
              onClick={() => setFeeCategoryFilter('ekskul')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                feeCategoryFilter === 'ekskul'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121212] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Ekskul & Kegiatan ({tarifList.filter(t => t.tipe === 'ekskul').length})
            </button>
          </div>

          {/* Tarif Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Rata-Rata SPP Bulanan</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                Rp {
                  (
                    tarifList
                      .filter(t => t.tipe === 'spp')
                      .reduce((acc, curr) => acc + curr.nominal, 0) /
                    (tarifList.filter(t => t.tipe === 'spp').length || 1)
                  ).toLocaleString('id-ID')
                } <span className="text-xs text-slate-500 font-normal">/ bln</span>
              </div>
              <p className="text-[11px] text-slate-500">Standar pembiayaan operasional pembelajaran bulanan siswa.</p>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Total Estimasi Paket UKT (Uang Masuk)</span>
                <GraduationCap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                Rp {
                  tarifList
                    .filter(t => t.tipe === 'ukt')
                    .reduce((acc, curr) => acc + curr.nominal, 0)
                    .toLocaleString('id-ID')
                }
              </div>
              <p className="text-[11px] text-slate-500">Gedung, Seragam, & Administrasi Daftar Ulang Siswa Baru.</p>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Total Komponen Iuran Ekskul</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {tarifList.filter(t => t.tipe === 'ekskul').length} Jenis Ekskul
              </div>
              <p className="text-[11px] text-slate-500">Pramuka, Futsal, IT Coding, Basket, & Kemah Kepemimpinan.</p>
            </div>
          </div>

          {/* Tariff Data Table */}
          <div className="bg-[#121212] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="p-4 bg-[#181818] border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Daftar Parameter Tarif Keuangan ({filteredTarifList.length})
              </h4>
              <span className="text-[11px] text-slate-400">T.A {schoolSettings?.tahunAjaran || '2026/2027'} • Kurikulum Merdeka</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#151515] text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nama Biaya & Kategori</th>
                    <th className="px-4 py-3">Tingkat / Target</th>
                    <th className="px-4 py-3">Periode Tagihan</th>
                    <th className="px-4 py-3">Nominal Tarif (Rp)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTarifList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{item.namaBiaya}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.tipe === 'spp' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            item.tipe === 'ukt' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {item.tipe === 'spp' ? 'SPP Bulanan' : item.tipe === 'ukt' ? 'UKT / Uang Masuk' : 'Ekskul / Kegiatan'}
                          </span>
                          {item.ekskulId && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold uppercase">
                              {ekskulList.find(e => e.id === item.ekskulId)?.namaEkskul || 'Ekskul'}
                            </span>
                          )}
                          {item.keterangan && (
                            <span className="text-[11px] text-slate-500 italic truncate max-w-xs">{item.keterangan}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-200">
                        {item.tingkatKelas}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 font-medium">
                        {item.periode}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-400 text-sm">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleTarifStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            item.status === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditTarif(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Edit Tarif"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTarif(item.id)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg transition-colors"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTarifList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                        Belum ada parameter tarif biaya untuk kategori ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
    )}

      {/* SUBTAB 3: REKAP TAGIHAN & GOOGLE SHEETS / FONNTE WA */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">

          {/* Fonnte Notification Banner */}
          {waSendingStatus && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-lg">
              <Send className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{waSendingStatus}</span>
            </div>
          )}



          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md sm:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total Nominal Tagihan</span>
              <div className="text-2xl font-extrabold text-white mt-2">
                Rp {allEffectiveTagihanList.reduce((a, b) => a + b.nominal, 0).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-emerald-400">Total SPP</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-2">
                Rp {totalSppPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-amber-400">Total UKT</span>
              <div className="text-xl font-extrabold text-amber-400 mt-2">
                Rp {totalUktPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-purple-400">Total Ekskul</span>
              <div className="text-xl font-extrabold text-purple-400 mt-2">
                Rp {totalEkskulPaid.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-white">Total Akumulasi</span>
              <div className="text-xl font-extrabold text-white mt-2">
                Rp {(totalSppPaid + totalUktPaid + totalEkskulPaid).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase text-rose-400">Total Sisa</span>
              <div className="text-xl font-extrabold text-rose-400 mt-2">
                Rp {allEffectiveTagihanList.reduce((a, b) => a + (b.nominal - (b.terbayar || 0)), 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>



          {/* Action Header & Tagihan Filter Control */}
          <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Daftar Tagihan Seluruh Siswa</h3>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[11px] font-mono font-bold">
                  {filteredGlobalTagihanList.length} Tagihan
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-slate-700 shadow-md cursor-pointer"
                  title="Unduh File CSV / Excel Langsung"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Unduh CSV / Excel
                </button>
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-rose-500/30 shadow-md cursor-pointer"
                  title="Hapus Semua Data Tagihan"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Hapus Semua
                </button>
              </div>
            </div>

            {/* Filter controls bar for Tipe, Status, & Nama Tagihan */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Tipe Tagihan Selector Buttons */}
              <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" /> Tipe:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('all');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'all'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('spp');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'spp'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  SPP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('ukt');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'ukt'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  UKT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTipeTagihan('ekskul');
                    setFilterKelas('all');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTipeTagihan === 'ekskul'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Ekskul
                </button>
              </div>

              {/* Pilih Kelas Dropdown */}
              <div className="md:col-span-4">

                <select
                  value={filterKelas}
                  onChange={e => setFilterKelas(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-emerald-300 font-bold rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">-- Semua Kelas / Rombel --</option>
                  {availableKelasList.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="md:col-span-2 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTagihanQuery}
                  onChange={e => setSearchTagihanQuery(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-[#181818] border border-slate-700/80 text-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Global Tagihan Table */}
          <div className="bg-[#121212] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Siswa & Kelas</th>
                    <th className="px-4 py-3">No. Invoice</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Nama Tagihan</th>
                    <th className="px-4 py-3">Bulan Tagihan</th>
                    <th className="px-4 py-3">Nominal Tagihan</th>
                    <th className="px-4 py-3">Terbayar</th>
                    <th className="px-4 py-3">Sisa</th>
                    <th className="px-4 py-3">Tgl Tagihan</th>
                    <th className="px-4 py-3">Tgl Bayar</th>
                    <th className="px-4 py-3">Metode Pembayaran</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                    <th className="px-4 py-3 text-center">Kirim Notif WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGlobalTagihanList.length > 0 ? (
                    filteredGlobalTagihanList.map(t => {
                      const isSynthesized = t.id && String(t.id).startsWith('syn-');
                      const txsForTagihan = transaksiList.filter(tx => 
                        tx.tagihanId === t.id || 
                        (isSynthesized && tx && tx.siswaNama && t && t.siswaNama && (tx.siswaNama || '').trim().toLowerCase() === (t.siswaNama || '').trim().toLowerCase() && (tx.tipe || '').toLowerCase() === (t.tipe || '').toLowerCase())
                      );
                      const totalTerbayarFromTx = txsForTagihan.reduce((sum, tx) => sum + tx.nominal, 0);
                      
                      let totalTerbayar = Math.max(t.terbayar || 0, totalTerbayarFromTx);
                      if (t.status === 'Lunas' && totalTerbayar < t.nominal) {
                        totalTerbayar = t.nominal;
                      }

                      const sisa = Math.max(0, t.nominal - totalTerbayar);
                      const isLunas = t.status === 'Lunas' || (totalTerbayar >= t.nominal && t.nominal > 0);
                      const isDicicil = !isLunas && totalTerbayar > 0;
                      const latestTx = txsForTagihan.length > 0 ? txsForTagihan[txsForTagihan.length - 1] : null;
                      const effectiveTanggalBayar = t.tanggalBayar || (latestTx ? latestTx.tanggal : (isLunas ? '2026-08-09' : ''));
                      
                      return (
                        <tr key={t.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{t.siswaNama}</div>
                            <div className="text-[10px] text-slate-400">{t.kelas}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-[10px] bg-slate-900/60 border border-slate-800 text-slate-300 px-2 py-1 rounded-md">
                              {getStableInvoiceNumber(t)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold uppercase text-slate-400">{t.tipe}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{t.namaTagihan}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-purple-300">
                            {getDisplayBulanTagihan(t)}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-white">Rp {t.nominal.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 font-mono text-emerald-400">Rp {totalTerbayar.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 font-mono text-amber-400">Rp {sisa.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {t.tanggalTagihan ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTagihan(t);
                                  setEditTagihanForm({
                                    namaTagihan: t.namaTagihan,
                                    nominal: t.nominal,
                                    terbayar: totalTerbayar,
                                    jatuhTempo: t.jatuhTempo || '',
                                    tanggalBayar: effectiveTanggalBayar,
                                    tanggalTagihan: t.tanggalTagihan || "",
                                    status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                    metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                  });
                                  setShowEditTagihanModal(true);
                                }}
                                className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-100 font-mono text-[11px] font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 px-2.5 py-1 rounded-lg border border-emerald-700/60 transition-all cursor-pointer group shadow-sm"
                                title="Klik untuk ubah Tanggal Tagihan"
                              >
                                <Calendar className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span>{t.tanggalTagihan}</span>
                                <Edit3 className="w-2.5 h-2.5 text-emerald-400/70 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTagihan(t);
                                  setEditTagihanForm({
                                    namaTagihan: t.namaTagihan,
                                    nominal: t.nominal,
                                    terbayar: totalTerbayar,
                                    jatuhTempo: t.jatuhTempo || '',
                                    tanggalBayar: new Date().toISOString().slice(0, 10),
                                    tanggalTagihan: new Date().toISOString().slice(0, 10),
                                    status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                    metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                  });
                                  setShowEditTagihanModal(true);
                                }}
                                className="text-slate-500 hover:text-slate-300 font-mono text-[11px] px-2 py-0.5 rounded hover:bg-slate-800/60 transition-all flex items-center gap-1"
                                title="Set Tanggal Tagihan"
                              >
                                <span>-</span>
                                <span className="text-[9px] text-slate-400 underline decoration-dotted">+ Set Tgl</span>
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isLunas || isDicicil ? (
                              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {latestTx ? latestTx.tanggal : (t.tanggalBayar || '-')}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isLunas || isDicicil ? (
                              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-1 rounded-md inline-block border border-slate-700/60">
                                {latestTx?.metodePembayaran || t.metodePembayaran || 'Cash / Kasir'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1.5 ${
                              isLunas ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                              isDicicil ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isLunas ? 'bg-emerald-400' : isDicicil ? 'bg-sky-400' : 'bg-rose-400'}`}></span>
                              {isLunas ? 'Lunas' : (isDicicil ? 'Cicil' : 'Belum Lunas')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center relative z-50">
                              <button
                               type="button"
                               onClick={() => {
                                 setEditingTagihan(t);
                                 setEditTagihanForm({
                                   namaTagihan: t.namaTagihan,
                                   nominal: t.nominal,
                                   terbayar: totalTerbayar,
                                   jatuhTempo: t.jatuhTempo || '',
                                   tanggalBayar: effectiveTanggalBayar,
                                    tanggalTagihan: t.tanggalTagihan || "",
                                   status: isLunas ? 'Lunas' : (isDicicil ? 'Dicicil' : 'Belum Lunas'),
                                   metodePembayaran: latestTx?.metodePembayaran || 'Cash / Kasir'
                                 });
                                 setShowEditTagihanModal(true);
                               }}
                               className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all mr-1"
                               title="Edit Tagihan"
                             >
                               <Edit3 className="w-4 h-4" />
                             </button>
                             <button
                               type="button"
                               onClick={() => setDeleteTargetTagihan(t)}
                               className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all"
                               title="Hapus Tagihan"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </td>
                          <td className="px-4 py-3 text-center">
                            {!isLunas ? (
                              <button
                                type="button"
                                onClick={() => handleSendWaReminder(t)}
                                className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                title="Kirim WhatsApp pengingat untuk segera melakukan pembayaran"
                              >
                                <Send className="w-3 h-3 text-amber-400" /> WA Tagihan
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendWaConfirmation(t)}
                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                                title="Kirim WhatsApp konfirmasi bahwa pembayaran telah dilakukan & lunas"
                              >
                                <CheckCheck className="w-3 h-3 text-emerald-400" /> WA Lunas
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    siswaList.map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{s.nama}</div>
                          <div className="text-[10px] text-slate-400">{s.kelas}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold uppercase text-slate-400">-</td>
                        <td className="px-4 py-3 italic text-slate-500">Belum ada tagihan</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">-</td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Belum Dibuat
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">-</td>
                        <td className="px-4 py-3 text-center">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 4: EDIT REDAKSI TEMPLATE NOTIFIKASI WA */}
      {activeTab === 'redaksi' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/20 via-indigo-950/10 to-transparent border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-left">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Edit Redaksi Notifikasi WA
              </h2>
              <p className="text-xs text-slate-400">
                Kustomisasi susunan kalimat pengingat tagihan dan konfirmasi pelunasan pembayaran yang dikirim ke wali murid.
              </p>
            </div>
            
            {saveSuccessMsg && (
              <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold shrink-0 shadow-lg border-l-4 border-l-emerald-400">
                ✓ {saveSuccessMsg}
              </div>
            )}
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex border-b border-slate-800 pb-px gap-2">
            <button
              onClick={() => setActiveRedaksiTab('reminder')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeRedaksiTab === 'reminder'
                  ? 'border-indigo-500 text-indigo-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifikasi Tagihan (Pengingat)
            </button>
            <button
              onClick={() => setActiveRedaksiTab('receipt')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeRedaksiTab === 'receipt'
                  ? 'border-emerald-500 text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi Pelunasan Pembayaran
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Editor Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#121212]/90 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {activeRedaksiTab === 'reminder' ? 'Template Teks Tagihan' : 'Template Teks Pelunasan'}
                  </span>
                  <button
                    onClick={handleResetTemplate}
                    className="text-[10px] text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Kembalikan susunan kata ke setelan default"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset ke Default
                  </button>
                </div>

                {/* Variable Pills Scrollbox */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold block">
                    Klik variabel di bawah untuk menyisipkan ke kursor:
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#181818] rounded-xl border border-slate-800">
                    {Object.keys({
                      NAMA_SISWA: "Muhammad Rafli",
                      KELAS: "VIII-B",
                      NAMA_TAGIHAN: "SPP Juli 2026",
                      NOMINAL_TAGIHAN: "Rp 350.000",
                      SISA_TAGIHAN: "Rp 350.000",
                      NOMINAL_BAYAR: "Rp 350.000",
                      TANGGAL_BAYAR: "13 Agustus 2026",
                      TAGIHAN: "SPP Juli 2026",
                      NOMINAL: "350.000",
                      JATUH_TEMPO: "13 Agustus 2026",
                      STATUS: "BELUM LUNAS",
                      NO_INVOICE: "0001/C-ALFAKHIR/VIII/2026",
                      BANK_VA_NAME: bankVaName,
                      BANK_VA_NUMBER: bankVaNumber,
                      BANK_VA_OWNER: bankVaOwner,
                      NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Islam Modern Al-Fakhir"
                    }).map(vKey => {
                      if (activeRedaksiTab === 'reminder' && vKey === 'NOMINAL_BAYAR') return null;
                      if (activeRedaksiTab === 'receipt' && vKey === 'SISA_TAGIHAN') return null;
                      if (activeRedaksiTab === 'receipt' && vKey === 'JATUH_TEMPO') return null;

                      return (
                        <button
                          key={vKey}
                          onClick={() => insertPlaceholder(`{${vKey}}`)}
                          className="px-2 py-1 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-500/20 rounded-lg text-[9px] font-mono font-extrabold text-indigo-300 transition-all cursor-pointer"
                        >
                          {`{${vKey}}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div>
                  <textarea
                    id={activeRedaksiTab === 'reminder' ? 'template_reminder_input' : 'template_receipt_input'}
                    value={activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt}
                    onChange={e => {
                      if (activeRedaksiTab === 'reminder') {
                        setLocalTemplateReminder(e.target.value);
                      } else {
                        setLocalTemplateReceipt(e.target.value);
                      }
                    }}
                    rows={12}
                    className="w-full bg-[#181818] border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Masukkan redaksi notifikasi di sini..."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={handleSaveTemplates}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg cursor-pointer ${
                      activeRedaksiTab === 'reminder'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Simpan Perubahan Redaksi
                  </button>
                </div>
              </div>

              {/* Informative Tips Footer */}
              <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 space-y-1.5 text-left">
                <span className="font-extrabold text-slate-200 block">💡 Tips Format WhatsApp:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Gunakan tanda bintang untuk menebalkan teks, contoh: <code className="text-slate-300 font-mono">*Teks Tebal*</code></li>
                  <li>Gunakan garis bawah untuk memiringkan teks, contoh: <code className="text-slate-300 font-mono">_Teks Miring_</code></li>
                  <li>Pastikan Anda tidak mengubah ejaan variabel di dalam kurung kurawal agar sistem dapat menggantinya dengan informasi riil siswa secara otomatis.</li>
                </ul>
              </div>
            </div>

            {/* Smartphone Mockup Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 mb-3 block self-start">
                📱 Live Preview Tampilan Orang Tua / Wali:
              </span>

              {/* Phone Container */}
              <div className="w-full max-w-[340px] bg-[#111] rounded-[36px] p-3 border-[6px] border-slate-800 shadow-2xl relative overflow-hidden aspect-[9/18]">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20"></div>

                {/* WhatsApp Screen */}
                <div className="w-full h-full bg-[#efeae2] rounded-[26px] flex flex-col relative overflow-hidden">
                  {/* WhatsApp Status Bar Header */}
                  <div className="bg-[#075e54] text-white pt-5 pb-2.5 px-4 flex items-center gap-3 shadow-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200/20 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                      🏫
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[12px] leading-tight text-white">
                        {schoolSettings?.namaSekolah || 'Keuangan Sekolah'}
                      </h4>
                      <span className="text-[9px] text-emerald-300 font-semibold block leading-none">Online</span>
                    </div>
                    <div className="flex items-center gap-2.5 opacity-80">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Message Thread Body */}
                  <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end space-y-3">
                    {/* Timestamp */}
                    <div className="self-center bg-[#d6ebf1] text-sky-950 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                      HARI INI
                    </div>

                    {/* Chat Bubble */}
                    <div className="max-w-[88%] bg-[#e2f7cb] text-slate-800 rounded-lg p-2.5 shadow-md relative border border-emerald-200/30 self-start ml-2 rounded-tl-none text-left">
                      {/* Triangle tail mockup */}
                      <div className="absolute -left-1.5 top-0 w-0 h-0 border-t-[8px] border-t-[#e2f7cb] border-l-[8px] border-l-transparent"></div>
                      
                      {/* Formatted Text Content */}
                      <div 
                        className="text-[11px] leading-relaxed whitespace-pre-wrap break-words text-slate-800"
                        dangerouslySetInnerHTML={{ 
                          __html: formatWhatsAppMarkdown(
                            parseWaTemplate(
                              activeRedaksiTab === 'reminder' ? localTemplateReminder : localTemplateReceipt,
                              {
                                NAMA_SISWA: "Muhammad Rafli",
                                KELAS: "VIII-B",
                                NAMA_TAGIHAN: "SPP Juli 2026",
                                NOMINAL_TAGIHAN: "Rp 350.000",
                                SISA_TAGIHAN: "Rp 350.000",
                                NOMINAL_BAYAR: "Rp 350.000",
                                TANGGAL_BAYAR: "13 Agustus 2026",
                                NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Islam Modern Al-Fakhir",
                                TAGIHAN: "SPP Juli 2026",
                                NOMINAL: "350.000",
                                JATUH_TEMPO: "13 Agustus 2026",
                                STATUS: "BELUM LUNAS",
                                NO_INVOICE: "0001/C-ALFAKHIR/VIII/2026",
                                METODE_BAYAR: "Cash / Kasir",
                                BANK_VA_NAME: bankVaName,
                                BANK_VA_NUMBER: bankVaNumber,
                                BANK_VA_OWNER: bankVaOwner
                              }
                            )
                          ) 
                        }}
                      />

                      {/* Bubble Info Footer */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-500 font-semibold select-none">
                        <span>10:30</span>
                        <CheckCheck className="w-3 h-3 text-sky-500" />
                      </div>
                    </div>
                  </div>

                  {/* Input Mockup Footer */}
                  <div className="p-2.5 bg-slate-100 flex items-center gap-2 border-t border-slate-200">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-slate-400 text-left border border-slate-200/80">
                      Ketik pesan...
                    </div>
                    <div className="w-7 h-7 bg-[#075e54] rounded-full flex items-center justify-center shrink-0">
                      <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {showPrintModal && printReceiptData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans border border-slate-300">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" /> Struk Kwitansi Pembayaran Resmi
              </h3>
            </div>

            {/* Print Envelope Area */}
            <div id="printable-receipt" className="space-y-4 p-2">
              {/* School Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                {schoolSettings?.logoUrl && (
                  <div className="flex justify-center mb-1">
                    <img src={schoolSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                  </div>
                )}
                <h2 className="font-extrabold text-base tracking-wide uppercase text-slate-900">
                  {schoolSettings?.namaSekolah || 'SEKOLAH MENENGAH ATAS WORKSPACE 2026'}
                </h2>
                <p className="text-[10px] text-slate-600">
                  NPSN: {schoolSettings?.npsn || '-'} • Akreditasi: {schoolSettings?.akreditasi || '-'} • {schoolSettings?.alamat || 'Jl. Pendidikan No. 45'} • Telp: {schoolSettings?.telepon || '-'}
                </p>
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest pt-1">
                  KWITANSI BUKTI PEMBAYARAN RESMI
                </div>
              </div>

              {/* Receipt Details */}
              <div className="text-xs space-y-1.5 py-1 text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">No. Nota / Kwitansi</span>
                  <span className="font-mono font-bold text-slate-900">{printReceiptData.noNota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tahun Ajaran</span>
                  <span className="font-bold">{printReceiptData.tahunAjaran}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NISN & Nama Siswa</span>
                  <span className="font-bold text-slate-900">{printReceiptData.nis} - {printReceiptData.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Kelas</span>
                  <span className="font-bold">{printReceiptData.kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tanggal Pembayaran</span>
                  <span className="font-bold">{printReceiptData.tanggal}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden my-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <tr>
                      <th className="p-2">Uraian Pembayaran</th>
                      <th className="p-2 text-right w-32">Jumlah (Rp)</th>
                      <th className="p-2 text-center w-10 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {receiptItems.map(item => (
                      <tr key={item.id}>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.uraian}
                            onChange={e => handleUpdateReceiptItem(item.id, 'uraian', e.target.value)}
                            placeholder="Ketik uraian rincian pembayaran..."
                            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none transition-all print:hidden"
                          />
                          <span className="hidden print:inline font-semibold text-slate-900 px-1">
                            {item.uraian || '-'}
                          </span>
                        </td>
                        <td className="p-1.5 text-right">
                          <input
                            type="number"
                            value={item.jumlah || ''}
                            onChange={e => handleUpdateReceiptItem(item.id, 'jumlah', e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 text-right focus:outline-none transition-all print:hidden"
                          />
                          <span className="hidden print:inline font-mono font-bold text-slate-900 px-1">
                            Rp {(Number(item.jumlah) || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="p-1.5 text-center print:hidden">
                          {receiptItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReceiptItem(item.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action: Tambah Uraian Pembayaran */}
              <div className="flex items-center justify-between print:hidden mb-2">
                <button
                  type="button"
                  onClick={handleAddReceiptItem}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  + Tambah Uraian Pembayaran
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  {receiptItems.length} Rincian Pembayaran
                </span>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-emerald-700 text-sm">Rp {totalReceiptNominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Jumlah Uang Diserahkan:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold print:inline hidden">
                      Rp {(printReceiptData.dibayar || 0).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-1 print:hidden">
                      <span className="font-mono font-bold text-slate-600">Rp</span>
                      <input
                        type="number"
                        value={printReceiptData.dibayar}
                        onChange={e => setPrintReceiptData({ ...printReceiptData, dibayar: Number(e.target.value) })}
                        className="w-28 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono font-bold text-right text-xs focus:outline-none focus:border-emerald-600 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  <span>Uang Kembalian:</span>
                  <span className="font-mono">Rp {receiptKembalian.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Signature block */}
              <div className="pt-4 flex justify-between text-[11px] text-slate-700 text-center">
                <div>
                  <p>Siswa / Penyetor,</p>
                  <div className="h-10"></div>
                  <p className="font-bold underline">({printReceiptData.nama})</p>
                </div>
                <div>
                  <p>Depok, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p>Kasir Keuangan,</p>
                  <div className="h-10"></div>
                  <p className="font-bold underline">({printReceiptData.penerima === 'Bendahara Sekolah' ? (schoolSettings?.namaKasir || 'Bendahara Sekolah') : printReceiptData.penerima})</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 print:hidden flex-wrap">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleDownloadReceiptAsImage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                title="Download Kwitansi sebagai Gambar (PNG)"
              >
                <Download className="w-3.5 h-3.5" /> Download Gambar (PNG)
              </button>

              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                title="Download Kwitansi sebagai File HTML / PDF"
              >
                <FileText className="w-3.5 h-3.5" /> Download File (HTML)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN VA & QRIS */}
      {showVaConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#121212] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">Pengaturan VA & QRIS</h3>
                  <p className="text-[11px] text-emerald-100 font-medium">Konfigurasi Pembayaran Digital</p>
                </div>
              </div>
              <button 
                onClick={() => setShowVaConfigModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Nama Bank</label>
                  <input
                    type="text"
                    value={bankVaName}
                    onChange={(e) => setBankVaName(e.target.value)}
                    placeholder="Contoh: Bank BRI, Bank BCA..."
                    className="w-full bg-[#181818] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Nomor Virtual Account</label>
                  <input
                    type="text"
                    value={bankVaNumber}
                    onChange={(e) => setBankVaNumber(e.target.value)}
                    placeholder="Masukkan nomor VA lengkap..."
                    className="w-full bg-[#181818] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Nama Pemilik / Merchant</label>
                  <input
                    type="text"
                    value={bankVaOwner}
                    onChange={(e) => setBankVaOwner(e.target.value)}
                    placeholder="Contoh: Bendahara SMP Al Fakhir"
                    className="w-full bg-[#181818] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">URL Gambar QRIS</label>
                  <input
                    type="text"
                    value={qrisUrl}
                    onChange={(e) => setQrisUrl(e.target.value)}
                    placeholder="https://link-gambar-qris-anda.png"
                    className="w-full bg-[#181818] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 italic">Gunakan link gambar QRIS statis sekolah Anda.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowVaConfigModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveVaConfig}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCheck className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FONNTE CONFIG MODAL */}
      {showFonnteConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                Pengaturan Gateway Fonnte WhatsApp
              </h3>
              <button
                onClick={() => setShowFonnteConfigModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Fonnte API Token</label>
                <input
                  type="text"
                  value={fonnteToken}
                  onChange={e => setFonnteToken(e.target.value)}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Masukkan token API Fonnte..."
                />
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>Kirimkan bukti transaksi pembayaran dan tagihan secara otomatis ke WhatsApp nomor orang tua siswa.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFonnteConfigModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
              >
                Simpan Token
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MODAL TAMBAH / EDIT TARIF BIAYA */}
      {showTarifModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                {editingTarif ? 'Edit Tarif Biaya Keuangan' : 'Tambah Parameter Tarif Biaya Baru'}
              </h3>
              <button
                onClick={() => setShowTarifModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTarif} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Biaya / Tagihan *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: SPP Kelas 7, UKT Gedung, Seragam..."
                  value={tarifForm.namaBiaya}
                  onChange={e => setTarifForm({ ...tarifForm, namaBiaya: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Kategori Biaya</label>
                  <select
                    value={tarifForm.tipe}
                    onChange={e => setTarifForm({ ...tarifForm, tipe: e.target.value as TipeKeuangan })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="spp">SPP Bulanan</option>
                    <option value="ukt">UKT / Uang Masuk</option>
                    <option value="ekskul">Ekskul & Kegiatan</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Kelas / Tingkat</label>
                  <select
                    value={tarifForm.tingkatKelas}
                    onChange={e => setTarifForm({ ...tarifForm, tingkatKelas: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Kelas 7">Kelas 7 (Tingkat VII)</option>
                    <option value="Kelas 8">Kelas 8 (Tingkat VIII)</option>
                    <option value="Kelas 9">Kelas 9 (Tingkat IX)</option>
                    <option value="Kelas 10">Kelas 10 (Tingkat X)</option>
                    <option value="Kelas 11">Kelas 11 (Tingkat XI)</option>
                    <option value="Kelas 12">Kelas 12 (Tingkat XII)</option>
                    <option value="Peserta Ekskul">Peserta Ekskul</option>
                    <option value="Semua Tingkat">Semua Tingkat Kelas</option>
                  </select>
                </div>
              </div>

              {tarifForm.tipe === 'ekskul' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-slate-300 font-bold block mb-1">Pilih Ekstrakurikuler (Opsional)</label>
                  <select
                    value={tarifForm.ekskulId}
                    onChange={e => setTarifForm({ ...tarifForm, ekskulId: e.target.value })}
                    className="w-full bg-[#181818] border border-blue-500/50 text-blue-400 font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Semua Ekstrakurikuler --</option>
                    {ekskulList.map(eks => (
                      <option key={eks.id} value={eks.id}>
                        {eks.namaEkskul} ({eks.pembinaNama})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Pilih ekskul spesifik jika tarif ini hanya berlaku untuk ekskul tersebut.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nominal Tarif (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={tarifForm.nominal}
                    onChange={e => setTarifForm({ ...tarifForm, nominal: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-emerald-500/60 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Periode Pembayaran</label>
                  <select
                    value={tarifForm.periode}
                    onChange={e => setTarifForm({ ...tarifForm, periode: e.target.value as any })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Sekali Bayar (Uang Masuk / UKT)">Sekali Bayar (Uang Masuk / UKT)</option>
                    <option value="Per Semester">Per Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan komponen biaya..."
                  value={tarifForm.keterangan}
                  onChange={e => setTarifForm({ ...tarifForm, keterangan: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Status Keaktifan</label>
                <select
                  value={tarifForm.status}
                  onChange={e => setTarifForm({ ...tarifForm, status: e.target.value as any })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Aktif">Aktif (Berlaku)</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTarifModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GENERATE TAGIHAN OTOMATIS */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-amber-400">
                <Sparkles className="w-4 h-4" />
                Generate Tagihan Otomatis
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-200 leading-relaxed italic">
                  Fitur ini akan membuat tagihan secara otomatis untuk seluruh siswa berdasarkan tarif biaya aktif yang sesuai dengan tingkat kelas mereka.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Bulan (Untuk SPP & Ekskul)</label>
                  <select
                    value={generateMonth}
                    onChange={e => setGenerateMonth(e.target.value)}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tahun</label>
                  <select
                    value={generateYear}
                    onChange={e => setGenerateYear(e.target.value)}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Kategori Tagihan yang Dibuat</label>
                <div className="flex flex-wrap gap-2">
                  {['spp', 'ukt', 'ekskul'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setGenerateTypes(prev => 
                          prev.includes(type as TipeKeuangan) 
                            ? prev.filter(t => t !== type)
                            : [...prev, type as TipeKeuangan]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        generateTypes.includes(type as TipeKeuangan)
                          ? 'bg-amber-500 border-amber-600 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerateTagihanMassal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
                >
                  Generate Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT TAGIHAN */}
      {showEditTagihanModal && editingTagihan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                Edit Tagihan: {editingTagihan.namaTagihan}
              </h3>
              <button
                onClick={() => setShowEditTagihanModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  value={editTagihanForm.namaTagihan}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, namaTagihan: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={editTagihanForm.nominal}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, nominal: Number(e.target.value) })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Jatuh Tempo</label>
                <div className="relative w-full">
                  <input
                    type="date"
                    value={editTagihanForm.jatuhTempo}
                    onChange={e => setEditTagihanForm({ ...editTagihanForm, jatuhTempo: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs flex justify-between items-center group focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                    <span>
                      {editTagihanForm.jatuhTempo
                        ? editTagihanForm.jatuhTempo.split('-').reverse().join('/')
                        : <span className="text-slate-500">dd/mm/yyyy</span>}
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Status Pembayaran</label>
                <select
                  value={editTagihanForm.status}
                  onChange={e => {
                    const newStatus = e.target.value as 'Lunas' | 'Belum Lunas' | 'Dicicil';
                    setEditTagihanForm({ 
                      ...editTagihanForm, 
                      status: newStatus,
                      tanggalBayar: newStatus === 'Lunas' && !editTagihanForm.tanggalBayar ? new Date().toLocaleDateString('id-ID') : editTagihanForm.tanggalBayar
                    });
                  }}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Dicicil">Dicicil / Sebagian</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
              {editTagihanForm.status === 'Dicicil' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Jumlah Terbayar (Rp)</label>
                  <input
                    type="number"
                    value={editTagihanForm.terbayar !== undefined ? editTagihanForm.terbayar : 0}
                    onChange={e => setEditTagihanForm({ ...editTagihanForm, terbayar: Number(e.target.value) })}
                    className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Tanggal Tagihan
                </label>
                <input
                  type="date"
                  value={editTagihanForm.tanggalTagihan || ''}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, tanggalTagihan: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tanggal pembuatan tagihan di sistem.
                </span>
              </div>
              
              <div>
                <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Tanggal Pembayaran
                </label>
                <input
                  type="text"
                  value={editTagihanForm.tanggalBayar}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, tanggalBayar: e.target.value })}
                  placeholder="Contoh: 09/08/2026 atau 2026-08-09"
                  className="w-full bg-[#181818] border border-slate-700/80 text-emerald-300 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tanggal realisasi pembayaran di kasir.
                </span>
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Metode Pembayaran</label>
                <select
                  value={editTagihanForm.metodePembayaran}
                  onChange={e => setEditTagihanForm({ ...editTagihanForm, metodePembayaran: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-700/80 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cash / Kasir">Cash / Kasir (Tunai)</option>
                  <option value="Transfer Bank - BRI">Transfer Bank - BRI</option>
                  <option value="Transfer Bank - BNI">Transfer Bank - BNI</option>
                  <option value="Transfer Bank - Mandiri">Transfer Bank - Mandiri</option>
                  <option value="Transfer Bank - BCA">Transfer Bank - BCA</option>
                  <option value="QRIS / E-Wallet">QRIS / E-Wallet (OVO/Dana/Gopay)</option>
                  <option value="Tabungan Siswa">Tabungan Siswa</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowEditTagihanModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!editingTagihan) return;
                  
                  // Validasi Input
                  if (!editTagihanForm.namaTagihan.trim()) {
                    alert('Nama tagihan tidak boleh kosong!');
                    return;
                  }
                  if (isNaN(editTagihanForm.nominal) || editTagihanForm.nominal <= 0) {
                    alert('Nominal tagihan harus berupa angka dan lebih besar dari 0!');
                    return;
                  }

                  setTagihanList(prev => {
                    const exists = prev.some(t => t.id === editingTagihan.id);
                    
                    let finalStatus = editTagihanForm.status;
                    let updatedTerbayar = editingTagihan.terbayar || 0;
                    
                    if (finalStatus === 'Lunas') {
                      updatedTerbayar = editTagihanForm.nominal;
                    } else if (finalStatus === 'Belum Lunas') {
                      updatedTerbayar = 0;
                    } else if (finalStatus === 'Dicicil') {
                      updatedTerbayar = editTagihanForm.terbayar !== undefined ? editTagihanForm.terbayar : (editingTagihan.terbayar || 0);
                      if (updatedTerbayar >= editTagihanForm.nominal) {
                        // Jika jumlah bayar menyamai atau melebihi nominal, otomatis ubah status jadi Lunas
                        finalStatus = 'Lunas';
                        updatedTerbayar = editTagihanForm.nominal;
                      } else if (updatedTerbayar <= 0) {
                        // Jika dicicil tetapi nominal terbayar <= 0, ubah ke Belum Lunas
                        finalStatus = 'Belum Lunas';
                        updatedTerbayar = 0;
                      }
                    }
                    
                    let finalTanggalBayar = editTagihanForm.tanggalBayar;
                    if (finalStatus === 'Lunas' && !finalTanggalBayar) {
                      finalTanggalBayar = new Date().toLocaleDateString('id-ID');
                    }

                    const updatedItem = {
                      ...editingTagihan,
                      namaTagihan: editTagihanForm.namaTagihan,
                      nominal: editTagihanForm.nominal,
                      jatuhTempo: editTagihanForm.jatuhTempo,
                      tanggalTagihan: editTagihanForm.tanggalTagihan,
                      tanggalBayar: finalTanggalBayar,
                      status: finalStatus,
                      terbayar: updatedTerbayar
                    };

                    // Sync corresponding transaction(s) in transaksiList
                    if (setTransaksiList) {
                      setTransaksiList(prevTx => {
                        // Filter out existing transactions associated with this bill
                        const isSynthesized = editingTagihan.id && String(editingTagihan.id).startsWith('syn-');
                        const baseTx = prevTx.filter(tx => {
                          const isMatch = tx.tagihanId === editingTagihan.id || 
                            (isSynthesized && tx && tx.siswaNama && editingTagihan && editingTagihan.siswaNama && 
                             (tx.siswaNama || '').trim().toLowerCase() === (editingTagihan.siswaNama || '').trim().toLowerCase() && 
                             (tx.tipe || '').toLowerCase() === (editingTagihan.tipe || '').toLowerCase());
                          return !isMatch;
                        });

                        if (finalStatus === 'Belum Lunas') {
                          // No transaction record
                          return baseTx;
                        } else {
                          // Create/update a single corresponding transaction matching the new status and payment
                          const txId = `tx-${Date.now()}`;
                          const newTx: TransaksiKeuangan = {
                            id: txId,
                            tagihanId: editingTagihan.id,
                            siswaNama: editingTagihan.siswaNama || 'Siswa',
                            pembayaran: editTagihanForm.namaTagihan,
                            tipe: editingTagihan.tipe || 'spp',
                            nominal: updatedTerbayar,
                            tanggal: finalTanggalBayar || new Date().toLocaleDateString('id-ID'),
                            metodePembayaran: editTagihanForm.metodePembayaran || 'Cash / Kasir',
                            penerima: 'Kasir / Bendahara Sekolah'
                          };
                          return [newTx, ...baseTx];
                        }
                      });
                    }

                    if (exists) {
                      return prev.map(t => t.id === editingTagihan.id ? updatedItem : t);
                    } else {
                      return [updatedItem, ...prev];
                    }
                  });

                  localStorage.removeItem('edu_tagihan_force_clear');
                  localStorage.removeItem('edu_transaksi_force_clear');
                  
                  alert('Perubahan tagihan berhasil disimpan!');
                  setShowEditTagihanModal(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS / BATALKAN TAGIHAN & PEMBAYARAN */}
      {deleteTargetTagihan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                Hapus Tagihan / Batalkan Pembayaran
              </h3>
              <button
                onClick={() => setDeleteTargetTagihan(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Siswa</span>
                  <span className="font-bold text-slate-200">{deleteTargetTagihan.siswaNama}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Item Tagihan</span>
                  <span className="font-bold text-slate-100">{deleteTargetTagihan.namaTagihan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tagihan</span>
                  <span className="font-mono font-bold text-slate-300">Rp {deleteTargetTagihan.nominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Terbayar</span>
                  <span className="font-mono font-bold text-emerald-400">Rp {(deleteTargetTagihan.terbayar || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Saat Ini</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    deleteTargetTagihan.status === 'Lunas' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    deleteTargetTagihan.status === 'Dicicil' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {deleteTargetTagihan.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300">
                Silakan pilih tindakan penghapusan yang ingin Anda lakukan:
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              {((deleteTargetTagihan.terbayar && deleteTargetTagihan.terbayar > 0) || deleteTargetTagihan.status === 'Lunas' || deleteTargetTagihan.status === 'Dicicil') && (
                <button
                  type="button"
                  onClick={() => handleExecuteResetPaymentOnly(deleteTargetTagihan)}
                  className="w-full px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Batalkan Pembayaran Saja (Ubah ke Belum Lunas)
                </button>
              )}

              <button
                type="button"
                onClick={() => handleExecuteDeleteTagihanPermanen(deleteTargetTagihan)}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Tagihan Permanen dari Daftar
              </button>

              <button
                type="button"
                onClick={() => setDeleteTargetTagihan(null)}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs mt-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS TRANSAKSI */}
      {deleteTargetTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-rose-400">
                <Trash2 className="w-4 h-4" />
                Konfirmasi Hapus Transaksi
              </h3>
              <button
                onClick={() => setDeleteTargetTx(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2">
              <p>Apakah Anda yakin ingin menghapus transaksi ini?</p>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-200">{deleteTargetTx.pembayaran}</div>
                <div className="font-mono font-bold text-emerald-400">Rp {deleteTargetTx.tagihan.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-400">{deleteTargetTx.tanggal}</div>
              </div>
              <p className="text-[11px] text-slate-400 italic">Tindakan ini akan mengembalikan status pembayaran dan saldo tagihan siswa terkait secara otomatis.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  performDeleteTransaction(deleteTargetTx);
                  setDeleteTargetTx(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT SISWA */}
      {showEditSiswaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-blue-400">
                <Edit3 className="w-4 h-4" />
                Edit Data Siswa
              </h3>
              <button
                onClick={() => setShowEditSiswaModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSiswa} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  value={editingSiswaData.nama || ''}
                  onChange={e => setEditingSiswaData(prev => ({ ...prev, nama: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">NISN</label>
                  <input
                    type="text"
                    value={editingSiswaData.nisn || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, nisn: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">NIS</label>
                  <input
                    type="text"
                    value={editingSiswaData.nis || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, nis: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Kelas (Tingkat)</label>
                  <select
                    value={editingSiswaData.tingkatKelas || 'Kelas 7'}
                    onChange={e => {
                      const newTingkat = e.target.value;
                      const matchingRombel = rombelList.find(r => r.tingkatKelas === newTingkat);
                      setEditingSiswaData(prev => ({
                        ...prev,
                        tingkatKelas: newTingkat,
                        ...(matchingRombel && !prev.rombel ? { rombel: matchingRombel.namaRombel, kelas: matchingRombel.namaRombel } : {})
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                    <option value="Kelas 10">Kelas 10</option>
                    <option value="Kelas 11">Kelas 11</option>
                    <option value="Kelas 12">Kelas 12</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Rombel (Rombongan Belajar)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibnu Sina, VII-A"
                    value={editingSiswaData.rombel || editingSiswaData.kelas || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, rombel: e.target.value, kelas: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={editingSiswaData.teleponWali || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, teleponWali: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    value={editingSiswaData.namaIbu || ''}
                    onChange={e => setEditingSiswaData(prev => ({ ...prev, namaIbu: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditSiswaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA DATA */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121212] border-2 border-rose-900/50 text-white rounded-2xl max-w-md w-full p-8 shadow-[0_0_50px_-12px_rgba(225,29,72,0.5)] space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 animate-pulse">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-rose-500 tracking-tight uppercase">Hapus Semua Tagihan?</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tindakan ini akan <span className="text-rose-400 font-bold underline decoration-rose-500/50 underline-offset-4">MENGHAPUS PERMANEN</span> seluruh daftar tagihan dan riwayat transaksi. <br/>
                <span className="text-emerald-400 font-bold">Data Siswa & Pengaturan Tarif tetap tersimpan.</span>
              </p>
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 w-full">
                <p className="text-[11px] text-rose-300 font-medium italic">
                  *Data yang sudah dihapus tidak dapat dikembalikan. Pastikan Anda sudah melakukan pencadangan (Export CSV) jika diperlukan.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleExecuteDeleteAll}
                className="w-full px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <Trash2 className="w-5 h-5" />
                YA, HAPUS SEMUA SEKARANG
              </button>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all border border-slate-700"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: PEMBAYARAN GAJI & PAYROLL GURU/STAF */}
      {activeTab === 'gaji' && (
        <div className="space-y-6">
          {/* TOAST NOTIFICATION */}
          {gajiToast && (
            <div className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all animate-in slide-in-from-bottom duration-300 ${
              gajiToast.type === 'success' 
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950 border-rose-500/30 text-rose-300'
            }`}>
              {gajiToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-xs font-bold font-sans">{gajiToast.message}</span>
            </div>
          )}

          {/* MAIN ACTIONS & STATS */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-rose-400" />
                Manajemen Payroll & Pembayaran Gaji
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kelola transaksi gaji guru dan staf sekolah, cetak slip gaji fisik, dan kirim rincian payroll otomatis via WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (gajiFilterBulan !== 'semua') {
                    setRekapGajiBulan(gajiFilterBulan);
                  } else {
                    const latestMonth = gajiList[0]?.bulan || 'Juli';
                    setRekapGajiBulan(latestMonth);
                  }
                  setShowRekapGajiModal(true);
                }}
                className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 active:scale-[0.98] cursor-pointer"
                title="Buka Rekapitulasi Laporan Penggajian & Honorarium Bulanan (Cetak PDF / Ekspor CSV)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Rekap Laporan Bulanan
              </button>

              <button
                type="button"
                onClick={() => {
                  // Download Excel-compatible HTML Template matching the 18-column official master sheet layout with borders
                  const htmlContent = `
                  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                  <head>
                    <meta charset="utf-8">
                    <style>
                      table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10px; }
                      th, td { border: 1px solid black; padding: 4px 6px; text-align: center; vertical-align: middle; }
                      th { background-color: #f1f5f9; font-weight: bold; }
                      .text-left { text-align: left; }
                      .text-right { text-align: right; }
                      .bg-gray { background-color: #e2e8f0; }
                    </style>
                  </head>
                  <body>
                    <table>
                      <tr>
                        <th rowspan="2">No</th>
                        <th rowspan="2">NAMA</th>
                        <th rowspan="2">JABATAN</th>
                        <th colspan="8" class="bg-gray">PENDAPATAN</th>
                        <th colspan="6" class="bg-gray">POTONGAN</th>
                        <th rowspan="2" class="bg-gray">GAJI BERSIH</th>
                      </tr>
                      <tr>
                        <th>GAJI POKOK</th>
                        <th>TJ WALAS</th>
                        <th>TUNJANGAN FUNGSIONAL</th>
                        <th>KETETAPAN WAKTU</th>
                        <th>TJ KEHADIRAN</th>
                        <th>PIKET</th>
                        <th>EXCES TIME</th>
                        <th class="bg-gray">JML PENDAPATAN</th>
                        <th>DENDA TERLAMBAT < 30 MIN</th>
                        <th>DENDA TERLAMBAT > 30 MIN</th>
                        <th>DENDA LUPA FINGER</th>
                        <th>POT. KOPERASI</th>
                        <th>GAJI DIAMBIL DIMUKA</th>
                        <th class="bg-gray">TOTAL POTONGAN</th>
                      </tr>
                      <tr>
                        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th><th>17</th><th>18</th>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td class="text-left">ALYA NABIYLA</td>
                        <td class="text-left">ADMINISTRATION</td>
                        <td class="text-right">2000000</td>
                        <td class="text-right">70000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">0</td>
                        <td class="text-right">1000</td>
                        <td class="bg-gray text-right">2221000</td>
                        <td class="text-right">10000</td>
                        <td class="text-right">1000</td>
                        <td class="text-right">1000</td>
                        <td class="text-right">26000</td>
                        <td class="text-right">20000</td>
                        <td class="bg-gray text-right">58000</td>
                        <td class="bg-gray text-right">2163000</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td class="text-left">NOUFAL ZAINUDIN ZIDANE</td>
                        <td class="text-left">IT ENGINEERING</td>
                        <td class="text-right">4500000</td>
                        <td class="text-right">0</td>
                        <td class="text-right">1000000</td>
                        <td class="text-right">1170000</td>
                        <td class="text-right">910000</td>
                        <td class="text-right">100000</td>
                        <td class="text-right">0</td>
                        <td class="bg-gray text-right">7680000</td>
                        <td class="text-right">0</td>
                        <td class="text-right">0</td>
                        <td class="text-right">0</td>
                        <td class="text-right">0</td>
                        <td class="text-right">5233000</td>
                        <td class="bg-gray text-right">5233000</td>
                        <td class="bg-gray text-right">2447000</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td class="text-left">MUHAMMAD LUTHFI HAKIM</td>
                        <td class="text-left">OPERATOR</td>
                        <td class="text-right">2000000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">50000</td>
                        <td class="text-right">0</td>
                        <td class="text-right">0</td>
                        <td class="bg-gray text-right">2200000</td>
                        <td class="text-right">10000</td>
                        <td class="text-right">0</td>
                        <td class="text-right">0</td>
                        <td class="text-right">26000</td>
                        <td class="text-right">20000</td>
                        <td class="bg-gray text-right">56000</td>
                        <td class="bg-gray text-right">2144000</td>
                      </tr>
                    </table>
                  </body>
                  </html>`;
                  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Template_Master_Gaji_Sekolah.xls`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2.5 bg-slate-850 hover:bg-slate-800 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                title="Download Template Format CSV/Excel untuk Import Gaji"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                Template
              </button>

              <label
                className="px-3.5 py-2.5 bg-slate-850 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/50 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                title="Upload & Import Data Gaji dari File CSV/Excel"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                Upload
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        if (!text) return;
                        const lines = text.split('\n');
                        let importedCount = 0;
                        for (let i = 1; i < lines.length; i++) {
                          const line = lines[i].trim();
                          if (!line) continue;
                          const cols = line.split(',');
                          if (cols.length >= 6) {
                            const tipe = (cols[1]?.trim() === 'staf' ? 'staf' : 'guru') as 'guru' | 'staf';
                            const namaRaw = cols[2]?.trim() || 'Pegawai Import';
                            const nama = namaRaw.split('(')[0].trim();
                            const bulan = cols[3]?.trim() || 'Juli';
                            const tahun = String(cols[4]?.trim() || '2026');
                            const gajiPokok = Number(cols[5]?.trim()) || 3000000;
                            const tunjangan = Number(cols[6]?.trim()) || 500000;
                            const tunjanganWalas = Number(cols[7]?.trim()) || 0;
                            const tunjanganKetepatanWaktu = Number(cols[8]?.trim()) || 0;
                            const tunjanganKehadiran = Number(cols[9]?.trim()) || 0;
                            const tunjanganPiket = Number(cols[10]?.trim()) || 0;
                            const tunjanganExcessTime = Number(cols[11]?.trim()) || 0;
                            const potongan = Number(cols[12]?.trim()) || 0;
                            const potonganDendaTerlambat = Number(cols[13]?.trim()) || 0;
                            const potonganDendaTerlambatLebih = Number(cols[14]?.trim()) || 0;
                            const potonganDendaLupaFinger = Number(cols[15]?.trim()) || 0;
                            const potonganKoperasi = Number(cols[16]?.trim()) || 0;
                            const potonganKasBon = Number(cols[17]?.trim()) || 0;

                            const sumT = tunjangan + tunjanganWalas + tunjanganKetepatanWaktu + tunjanganKehadiran + tunjanganPiket + tunjanganExcessTime;
                            const sumP = potongan + potonganDendaTerlambat + potonganDendaTerlambatLebih + potonganDendaLupaFinger + potonganKoperasi + potonganKasBon;
                            const totalDiterima = (gajiPokok + sumT) - sumP;

                            const newGajiItem: GajiPembayaran = {
                              id: `gaji-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              penerimaId: `imp-${Math.random().toString(36).substr(2, 4)}`,
                              penerimaTipe: tipe,
                              penerimaNama: nama,
                              penerimaNipNik: '-',
                              jabatan: tipe === 'guru' ? 'Guru Mata Pelajaran' : 'Staf Kependidikan',
                              bulan,
                              tahun,
                              gajiPokok,
                              tunjangan,
                              tunjanganWalas,
                              tunjanganKetepatanWaktu,
                              tunjanganKehadiran,
                              tunjanganPiket,
                              tunjanganExcessTime,
                              potongan,
                              potonganDendaTerlambat,
                              potonganDendaTerlambatLebih,
                              potonganDendaLupaFinger,
                              potonganKoperasi,
                              potonganKasBon,
                              totalDiterima,
                              tanggalBayar: new Date().toISOString().split('T')[0],
                              metodePembayaran: 'Transfer Bank',
                              status: 'Paid',
                              catatan: 'Imported via Template CSV'
                            };

                            if (setGajiList) {
                              setGajiList(prev => [newGajiItem, ...prev]);
                            }
                            importedCount++;
                          }
                        }
                        alert(`Berhasil mengimpor ${importedCount} data gaji pegawai!`);
                      } catch (err) {
                        console.error(err);
                        alert('Gagal membaca file template. Pastikan format CSV sesuai.');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setEditingGaji(null);
                  setGajiPenerimaId('');
                  setGajiPokok(3000000);
                  setGajiTunjangan(500000);
                  setGajiPotongan(0);
                  setGajiCatatan('');
                  setGajiRekening('');
                  setShowBayarGajiModal(true);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 shrink-0 active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Proses Gaji Baru
              </button>
            </div>
          </div>

          {/* SUMMARY STATISTICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Gaji Terbayar */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Gaji Dibayarkan</span>
                <h4 className="text-lg font-extrabold text-white mt-0.5">
                  Rp {gajiList.filter(g => g.status === 'Paid').reduce((sum, g) => sum + g.totalDiterima, 0).toLocaleString('id-ID')}
                </h4>
                <p className="text-[9px] text-emerald-400 mt-0.5 font-bold">
                  {gajiList.filter(g => g.status === 'Paid').length} Transaksi Lunas
                </p>
              </div>
            </div>

            {/* Total Pending / Draft */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gaji Pending / Draft</span>
                <h4 className="text-lg font-extrabold text-white mt-0.5">
                  Rp {gajiList.filter(g => g.status === 'Draft').reduce((sum, g) => sum + g.totalDiterima, 0).toLocaleString('id-ID')}
                </h4>
                <p className="text-[9px] text-amber-400 mt-0.5 font-bold">
                  {gajiList.filter(g => g.status === 'Draft').length} Transaksi Draft
                </p>
              </div>
            </div>

            {/* Total Guru */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Penerima Tipe Guru</span>
                <h4 className="text-lg font-extrabold text-white mt-0.5">
                  {guruList.length} Orang
                </h4>
                <p className="text-[9px] text-purple-400 mt-0.5 font-bold">
                  {gajiList.filter(g => g.penerimaTipe === 'guru').length} Slip Terbit
                </p>
              </div>
            </div>

            {/* Total Staf */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Penerima Tipe Staf</span>
                <h4 className="text-lg font-extrabold text-white mt-0.5">
                  {stafList.length} Orang
                </h4>
                <p className="text-[9px] text-blue-400 mt-0.5 font-bold">
                  {gajiList.filter(g => g.penerimaTipe === 'staf').length} Slip Terbit
                </p>
              </div>
            </div>
          </div>

          {/* FILTER & FILTER BAR */}
          <div className="bg-[#121212] p-4 rounded-2xl border border-slate-850/80 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari penerima gaji, NIP, NIK, jabatan..."
                value={gajiSearchQuery}
                onChange={e => setGajiSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={gajiFilterTipe}
                  onChange={e => setGajiFilterTipe(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="semua" className="bg-slate-950 text-white">Semua Penerima</option>
                  <option value="guru" className="bg-slate-950 text-white">Guru</option>
                  <option value="staf" className="bg-slate-950 text-white">Staf</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={gajiFilterStatus}
                  onChange={e => setGajiFilterStatus(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="semua" className="bg-slate-950 text-white">Semua Status</option>
                  <option value="Paid" className="bg-slate-950 text-white">Lunas (Paid)</option>
                  <option value="Draft" className="bg-slate-950 text-white">Draft</option>
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={gajiFilterBulan}
                  onChange={e => setGajiFilterBulan(e.target.value)}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="semua" className="bg-slate-950 text-white">Semua Bulan</option>
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                    <option key={m} value={m} className="bg-slate-950 text-white">{m}</option>
                  ))}
                </select>
              </div>

              {/* Quick Rekap Button */}
              <button
                type="button"
                onClick={() => {
                  if (gajiFilterBulan !== 'semua') {
                    setRekapGajiBulan(gajiFilterBulan);
                  }
                  setShowRekapGajiModal(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Buka dan Cetak Rekap Laporan Gaji Periode Ini"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Rekap Periode
              </button>

              {/* Bulk Auto-Send WhatsApp Button */}
              <button
                onClick={handleBulkKirimGajiWA}
                disabled={isBulkSendingGaji || filteredGajiList.length === 0}
                className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Kirim gambar slip gaji otomatis ke semua guru/staf via WhatsApp"
              >
                {isBulkSendingGaji ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mengirim ({bulkGajiProgress ? `${bulkGajiProgress.current}/${bulkGajiProgress.total}` : '...'})
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    Kirim Semua Slip WA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LIST/TABLE OF PAYROLL TRANSACTIONS */}
          <div className="bg-[#121212] rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-4 px-4 w-12 text-center">No</th>
                    <th className="py-4 px-4">Penerima</th>
                    <th className="py-4 px-3">Tipe & Jabatan</th>
                    <th className="py-4 px-3">Periode</th>
                    <th className="py-4 px-3 text-right">Gaji Pokok</th>
                    <th className="py-4 px-3 text-right">Tunjangan</th>
                    <th className="py-4 px-3 text-right text-rose-400">Potongan</th>
                    <th className="py-4 px-3 text-right text-emerald-400">Net Diterima</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredGajiList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                        Tidak ada transaksi pembayaran gaji ditemukan. <br/>
                        <span className="text-[10px] text-slate-600 mt-1 block">Silakan tambahkan data pembayaran gaji baru.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredGajiList.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-white text-xs">{item.penerimaNama}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{(item.penerimaNipNik && item.penerimaNipNik !== '-') ? item.penerimaNipNik : (item.penerimaTipe === 'guru' ? (guruList.find(g => g.id === item.penerimaId)?.nik || guruList.find(g => g.id === item.penerimaId)?.nip || '-') : (stafList.find(s => s.id === item.penerimaId)?.nik || '-'))}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-bold uppercase mb-1 ${
                            item.penerimaTipe === 'guru' 
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.penerimaTipe}
                          </span>
                          <div className="text-slate-400 text-[11px] font-medium">{item.jabatan}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-300">
                          {item.bulan} {item.tahun}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                          Rp {item.gajiPokok.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                          + Rp {item.tunjangan.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-rose-400/80">
                          - Rp {item.potongan.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                          Rp {item.totalDiterima.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.status === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Paid' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            {item.status === 'Paid' ? 'Paid / Lunas' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* Slip Gaji Action */}
                            <button
                              onClick={() => {
                                setSelectedGajiForSlip(item);
                                setShowSlipGajiModal(true);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                              title="Cetak Slip Gaji (Print PDF)"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-400" />
                            </button>

                            {/* WhatsApp Notification Action */}
                            <button
                              onClick={() => handleKirimGajiWA(item)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                              title="Kirim Slip via WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            {/* Edit Action */}
                            <button
                              onClick={() => handleEditGajiClick(item)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                              title="Edit Data Gaji"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => setGajiToDeleteId(item.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                              title="Hapus Data Gaji"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BAYAR GAJI BARU / EDIT GAJI */}
      {showBayarGajiModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 shrink-0 bg-[#141414]">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{editingGaji ? 'Edit Transaksi Pembayaran Gaji' : 'Proses Transaksi Pembayaran Gaji Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowBayarGajiModal(false);
                  setEditingGaji(null);
                }}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGaji} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* COLUMN 1: RECIPENT INFO & PERIOD */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Penerima & Periode Gaji</h4>
                      
                      {/* Role Filter toggle inside modal */}
                      <div>
                        <label className="text-slate-400 font-bold block mb-1.5 text-xs">Tipe Penerima</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGajiPenerimaTipe('guru');
                              setGajiPenerimaId('');
                            }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              gajiPenerimaTipe === 'guru'
                                ? 'bg-purple-600/10 text-purple-400 border-purple-500/40 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            disabled={!!editingGaji}
                          >
                            Ibu/Bapak Guru
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGajiPenerimaTipe('staf');
                              setGajiPenerimaId('');
                            }}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              gajiPenerimaTipe === 'staf'
                                ? 'bg-blue-600/10 text-blue-400 border-blue-500/40 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                            disabled={!!editingGaji}
                          >
                            Staf / Karyawan
                          </button>
                        </div>
                      </div>

                      {/* Receiver Selector */}
                      <div>
                        <label className="text-slate-400 font-bold block mb-1 text-xs">Pilih Nama Penerima</label>
                        <select
                          value={gajiPenerimaId}
                          onChange={e => {
                            const id = e.target.value;
                            setGajiPenerimaId(id);
                            // Prefill logical salaries based on roles & status
                            if (id && !editingGaji) {
                              if (gajiPenerimaTipe === 'guru') {
                                const g = guruList.find(x => x.id === id);
                                if (g) {
                                  if (g.status === 'PNS') {
                                    setGajiPokok(4500000);
                                    setGajiTunjangan(1200000);
                                  } else if (g.status === 'GTY') {
                                    setGajiPokok(3500000);
                                    setGajiTunjangan(800000);
                                  } else {
                                    setGajiPokok(2500000);
                                    setGajiTunjangan(500000);
                                  }
                                }
                              } else {
                                const s = stafList.find(x => x.id === id);
                                if (s) {
                                  if (s.status === 'Tetap') {
                                    setGajiPokok(3200000);
                                    setGajiTunjangan(600000);
                                  } else {
                                    setGajiPokok(2200000);
                                    setGajiTunjangan(300000);
                                  }
                                }
                              }
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                          required
                          disabled={!!editingGaji}
                        >
                          <option value="">-- Pilih Penerima --</option>
                          {gajiPenerimaTipe === 'guru' ? (
                            guruList.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.nama} {g.nip ? `(NIP: ${g.nip})` : ''} - {g.jabatan}
                              </option>
                            ))
                          ) : (
                            stafList.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.nama} {s.nik ? `(NIK: ${s.nik})` : ''} - {s.bagian}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Period selection */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 font-bold block mb-1 text-xs">Bulan Gaji</label>
                          <select
                            value={gajiBulan}
                            onChange={e => setGajiBulan(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold block mb-1 text-xs">Tahun Gaji</label>
                          <input
                            type="number"
                            value={gajiTahun}
                            onChange={e => setGajiTahun(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Pembayaran & Penyetoran</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 font-bold block mb-1 text-xs">Metode Bayar</label>
                          <select
                            value={gajiMetode}
                            onChange={e => setGajiMetode(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Transfer Bank">Transfer Bank</option>
                            <option value="E-Wallet">E-Wallet</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold block mb-1 text-xs">Tanggal Bayar</label>
                          <input
                            type="date"
                            value={gajiTanggal}
                            onChange={e => setGajiTanggal(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 font-mono cursor-pointer"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 font-bold block mb-1 text-xs">No. Rekening / Keterangan Bank (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Bank Syariah Mandiri 7122455829"
                          value={gajiRekening}
                          onChange={e => setGajiRekening(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 font-bold block mb-1.5 text-xs">Status Pembayaran</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setGajiStatus('Draft')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              gajiStatus === 'Draft'
                                ? 'bg-amber-600/10 text-amber-400 border-amber-500/40 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Draft (Pending)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGajiStatus('Paid')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              gajiStatus === 'Paid'
                                ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/40 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Paid (Terbayar)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: FINANCIAL CALCULATIONS */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Perhitungan Nominal Gaji</h4>
                      
                      {/* Gaji Pokok */}
                      <div>
                        <label className="text-slate-400 font-bold block mb-1 text-xs">Gaji Pokok (Rp)</label>
                        <input
                          type="number"
                          value={gajiPokok}
                          onChange={e => setGajiPokok(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                          required
                          min={0}
                        />
                      </div>

                      {/* Kelompok Tunjangan */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Rincian Tunjangan & Bonus (Rp)</div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Tunjangan Jabatan & Ops</label>
                            <input
                              type="number"
                              value={gajiTunjangan}
                              onChange={e => setGajiTunjangan(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Tunjangan Walas</label>
                            <input
                              type="number"
                              value={gajiTunjanganWalas}
                              onChange={e => setGajiTunjanganWalas(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Ketepatan Waktu</label>
                            <input
                              type="number"
                              value={gajiTunjanganKetepatanWaktu}
                              onChange={e => setGajiTunjanganKetepatanWaktu(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Tunjangan Kehadiran</label>
                            <input
                              type="number"
                              value={gajiTunjanganKehadiran}
                              onChange={e => setGajiTunjanganKehadiran(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Tunjangan Piket</label>
                            <input
                              type="number"
                              value={gajiTunjanganPiket}
                              onChange={e => setGajiTunjanganPiket(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 text-[10px] block mb-0.5">Excess Time</label>
                            <input
                              type="number"
                              value={gajiTunjanganExcessTime}
                              onChange={e => setGajiTunjanganExcessTime(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Kelompok Potongan */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                        <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Rincian Potongan & Denda (Rp)</div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="col-span-2">
                            <label className="text-rose-300 text-[10px] block mb-0.5">Potongan Absensi / BPJS / Umum</label>
                            <input
                              type="number"
                              value={gajiPotongan}
                              onChange={e => setGajiPotongan(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-rose-300 text-[10px] block mb-0.5">Denda Terlambat &lt; 30 Min</label>
                            <input
                              type="number"
                              value={gajiPotonganDendaTerlambat}
                              onChange={e => setGajiPotonganDendaTerlambat(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-rose-300 text-[10px] block mb-0.5">Denda Terlambat &gt; 30 Min</label>
                            <input
                              type="number"
                              value={gajiPotonganDendaTerlambatLebih}
                              onChange={e => setGajiPotonganDendaTerlambatLebih(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-rose-300 text-[10px] block mb-0.5">Denda Lupa Finger</label>
                            <input
                              type="number"
                              value={gajiPotonganDendaLupaFinger}
                              onChange={e => setGajiPotonganDendaLupaFinger(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-rose-300 text-[10px] block mb-0.5">Potongan Koperasi</label>
                            <input
                              type="number"
                              value={gajiPotonganKoperasi}
                              onChange={e => setGajiPotonganKoperasi(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-rose-300 text-[10px] block mb-0.5">Gaji Diambil Dimuka / Kasbon</label>
                            <input
                              type="number"
                              value={gajiPotonganKasBon}
                              onChange={e => setGajiPotonganKasBon(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Catatan */}
                      <div>
                        <label className="text-slate-400 font-bold block mb-1 text-xs">Catatan Transaksi</label>
                        <textarea
                          placeholder="e.g. Pembayaran Gaji GTT, termasuk bonus lembur UTS..."
                          value={gajiCatatan}
                          onChange={e => setGajiCatatan(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 h-16 resize-none"
                        />
                      </div>

                      {/* LIVE CALCULATION REVENUE STATEMENT CARD */}
                      <div className="p-4 bg-rose-950/15 border border-rose-500/20 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-black text-rose-400/90 tracking-wider">Perkiraan Bersih (Net Income)</span>
                        <div className="flex flex-wrap justify-between items-end gap-2">
                          <div className="text-[10px] text-slate-400">
                            (Pokok + Total Tunjangan) - Total Potongan
                          </div>
                          <div className="text-xl font-black text-emerald-400 font-mono">
                            Rp {(
                              Number(gajiPokok) +
                              (Number(gajiTunjangan) + Number(gajiTunjanganWalas) + Number(gajiTunjanganKetepatanWaktu) + Number(gajiTunjanganKehadiran) + Number(gajiTunjanganPiket) + Number(gajiTunjanganExcessTime)) -
                              (Number(gajiPotongan) + Number(gajiPotonganDendaTerlambat) + Number(gajiPotonganDendaTerlambatLebih) + Number(gajiPotonganDendaLupaFinger) + Number(gajiPotonganKoperasi) + Number(gajiPotonganKasBon))
                            ).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-800 bg-[#141414] shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowBayarGajiModal(false);
                    setEditingGaji(null);
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingGaji ? 'Simpan Perubahan Gaji' : 'Proses & Bayar Gaji'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT / SLIP GAJI PREVIEW */}
      {showSlipGajiModal && selectedGajiForSlip && (() => {
        const item = selectedGajiForSlip;
        const tWalas = item.tunjanganWalas || 0;
        const tKetepatan = item.tunjanganKetepatanWaktu || 0;
        const tHadir = item.tunjanganKehadiran || 0;
        const tPiket = item.tunjanganPiket || 0;
        const tExcess = item.tunjanganExcessTime || 0;
        const tJabatan = item.tunjangan || 0;

        const pTerlambat = item.potonganDendaTerlambat || 0;
        const pFinger = item.potonganDendaLupaFinger || 0;
        const pKoperasi = item.potonganKoperasi || 0;
        const pKasBon = item.potonganKasBon || 0;
        const pAbsensi = item.potongan || 0;

        const totalT = tJabatan + tWalas + tKetepatan + tHadir + tPiket + tExcess;
        const totalP = pAbsensi + pTerlambat + pFinger + pKoperasi + pKasBon;
        const subtotalPenghasilan = item.gajiPokok + totalT;
        const totalNet = item.totalDiterima;

        // Recipient NIP / NIK
        const recipientNipNik = (item.penerimaNipNik && item.penerimaNipNik !== '-')
          ? item.penerimaNipNik
          : (item.penerimaTipe === 'guru' 
              ? (guruList.find(g => g.id === item.penerimaId)?.nip || guruList.find(g => g.id === item.penerimaId)?.nik || '-') 
              : (stafList.find(s => s.id === item.penerimaId)?.nip || stafList.find(s => s.id === item.penerimaId)?.nik || '-'));

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[105] flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl my-4 sm:my-8 overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Action buttons at the top of printable slip (hidden in standard browser prints) */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Pratinjau & Cetak Slip Gaji</span>
                    <span className="text-[10px] text-slate-500 font-medium">Periode {item.bulan} {item.tahun} • {item.penerimaNama}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownloadSlipImage(item)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    title="Unduh Slip Gaji sebagai file Gambar PNG"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    Unduh PNG
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak / PDF
                  </button>

                  <button
                    onClick={() => {
                      setShowSlipGajiModal(false);
                      setSelectedGajiForSlip(null);
                    }}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              {/* Real-time sending feedback bar */}
              {isProcessingSlipImage && (
                <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse print:hidden">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  <div className="text-xs text-emerald-900 font-semibold">
                    {slipSendingStatus || 'Sedang memproses dan mengirimkan gambar slip gaji via WhatsApp...'}
                  </div>
                </div>
              )}

              {/* PRINT SLIP BODY CONTENT (DESIGNED LIKE A REAL PHYSICAL SLIP) */}
              <div className="p-4 sm:p-8 space-y-4">
                <div id="printable-slip-gaji" className="border border-slate-300 p-5 sm:p-7 rounded-2xl space-y-4 sm:space-y-5 bg-white font-sans text-slate-900 shadow-sm">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start pb-3.5 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3.5">
                      {schoolSettings?.logoUrl ? (
                        <div className="w-14 h-14 p-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-700 text-lg shrink-0">
                          🏫
                        </div>
                      )}
                      <div>
                        <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-950 uppercase leading-tight">
                          {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}
                        </h2>
                        <p className="text-[10px] text-slate-600 leading-normal mt-0.5 max-w-md">
                          {schoolSettings?.alamat || 'Alamat Sekolah'}, RT/RW {schoolSettings?.rtRw || '01/01'}, Kec. {schoolSettings?.kecamatan || 'Kecamatan'}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                          NPSN: {schoolSettings?.npsn || '-'} • Akreditasi: {schoolSettings?.akreditasi || '-'} • Telp: {schoolSettings?.telepon || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider mb-1">
                        SLIP GAJI RESMI
                      </span>
                      <div className="text-[11px] font-bold font-mono text-slate-800">{item.id}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Tgl Bayar: <span className="font-semibold text-slate-700">{item.tanggalBayar}</span></div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center bg-slate-100/80 py-2 rounded-xl border border-slate-200">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900">SLIP GAJI & HONORARIUM</h3>
                    <p className="text-[10px] font-bold text-slate-600">PERIODE: {item.bulan.toUpperCase()} {item.tahun}</p>
                  </div>

                  {/* Recipient details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[10.5px] bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
                    <div className="space-y-1.5">
                      <div className="flex">
                        <span className="w-28 text-slate-500 font-medium">Nama Penerima</span>
                        <span className="text-slate-950 font-black">: {item.penerimaNama}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 text-slate-500 font-medium">NIP / NIK</span>
                        <span className="text-slate-800 font-mono">: {recipientNipNik}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex">
                        <span className="w-28 text-slate-500 font-medium">Jabatan / Bagian</span>
                        <span className="text-slate-900 font-bold">: {item.jabatan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-28 text-slate-500 font-medium">Metode Bayar</span>
                        <span className="text-slate-800 font-semibold">: {item.metodePembayaran}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial calculations tables (2 Columns: Penerimaan & Potongan) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                    
                    {/* 1. Penerimaan / Penghasilan */}
                    <div className="border border-emerald-300/80 rounded-xl overflow-hidden bg-emerald-50/25 flex flex-col h-full shadow-sm">
                      <div className="bg-emerald-700 text-white px-3.5 py-2 flex justify-between items-center">
                        <span className="text-[10.5px] font-black uppercase tracking-wide">1. PENERIMAAN / PENGHASILAN</span>
                        <span className="text-[9px] font-bold opacity-90">JUMLAH</span>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between text-[10.5px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                            <span className="text-slate-600 font-medium">• Gaji Pokok</span>
                            <span className="font-mono font-bold text-slate-950">Rp {item.gajiPokok.toLocaleString('id-ID')}</span>
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

                    {/* 2. Potongan & Denda */}
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
                          <span className="font-mono">Rp {totalP.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Grand Total Bersih / Net Income Card */}
                  <div className="p-4 sm:p-4.5 bg-slate-900 text-white rounded-xl space-y-2 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                          JUMLAH BERSIH YANG DITERIMA (NET INCOME)
                        </h4>
                        <p className="text-[9.5px] text-slate-300 font-medium mt-0.5">
                          {item.metodePembayaran} {item.penerimaRekening ? `• No. Rekening: ${item.penerimaRekening}` : ''}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 tracking-tight">
                          Rp {totalNet.toLocaleString('id-ID')}
                        </div>
                        <span className={`inline-block text-[8.5px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full mt-0.5 ${item.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                          {item.status === 'Paid' ? 'STATUS: PAID (LUNAS)' : 'STATUS: DRAFT (PENDING)'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Terbilang */}
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-300 italic">
                      <span className="font-bold text-slate-400 not-italic">Terbilang: </span>
                      "{terbilang(totalNet)}"
                    </div>
                  </div>

                  {/* Notes if any */}
                  {item.catatan && (
                    <div className="text-[10px] text-slate-700 italic bg-amber-50/90 p-3 rounded-xl border border-amber-200">
                      <span className="font-bold text-amber-900 not-italic">Catatan Tambahan: </span>{item.catatan}
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-6 pt-6 text-[10px] border-t border-slate-200">
                    <div className="text-center space-y-9">
                      <p className="text-slate-600 font-medium">Penerima Gaji,</p>
                      <div className="space-y-0.5">
                        <p className="font-bold underline text-slate-950">{item.penerimaNama}</p>
                      </div>
                    </div>
                    <div className="text-center space-y-9">
                      <p className="text-slate-600 font-medium">Bendahara Sekolah,</p>
                      <div className="space-y-0.5">
                        <p className="font-bold underline text-slate-950">{bendaharaNama}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slip generation footer */}
                  <div className="text-[8.5px] text-slate-400 text-center pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                    <span>Dicetak otomatis oleh Sistem Manajemen Keuangan Sekolah</span>
                    <span>{item.id} • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL REKAP LAPORAN PENGGAJIAN BULANAN */}
      {showRekapGajiModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[105] flex items-start justify-center p-2 sm:p-5 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-6xl w-full shadow-2xl my-3 sm:my-6 overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOP BAR / CONTROL ACTIONS (PRINT:HIDDEN) */}
            <div className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    Rekapitulasi Laporan Penggajian & Honorarium
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Per Bulan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Laporan buku kas payroll guru dan staf sekolah lengkap per periode.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyRekapGajiSummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 cursor-pointer"
                  title="Salin ringkasan rekap ke format pesan WhatsApp"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  Salin Ringkasan WA
                </button>

                <button
                  type="button"
                  onClick={handleExportRekapGajiCSV}
                  disabled={rekapGajiFiltered.length === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Unduh data tabel rekapitulasi gaji dalam format Excel CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Ekspor CSV
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 cursor-pointer"
                  title="Cetak format laporan resmi (Print / Simpan PDF)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / PDF
                </button>

                <button
                  type="button"
                  onClick={() => setShowRekapGajiModal(false)}
                  className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 border border-rose-500/30 active:scale-95 cursor-pointer"
                  title="Tutup Modal Rekap"
                >
                  <X className="w-3.5 h-3.5" />
                  Tutup
                </button>
              </div>
            </div>

            {/* FILTER TOOLBAR INSIDE MODAL (PRINT:HIDDEN) */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Tampilan Template */}
                <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setRekapTemplateMode('excel')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      rekapTemplateMode === 'excel'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📊 Format Master Sheet (18 Kolom Sesuai Gambar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRekapTemplateMode('modern')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      rekapTemplateMode === 'modern'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 Format Ringkas & TTD
                  </button>
                </div>

                {/* Pilih Bulan */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-bold text-slate-700">Bulan:</span>
                  <select
                    value={rekapGajiBulan}
                    onChange={e => setRekapGajiBulan(e.target.value)}
                    className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="semua">Semua Bulan</option>
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Pilih Tahun */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-sm">
                  <span className="font-bold text-slate-700">Tahun:</span>
                  <select
                    value={rekapGajiTahun}
                    onChange={e => setRekapGajiTahun(e.target.value)}
                    className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                {/* Filter Tipe */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-bold text-slate-700">Penerima:</span>
                  <select
                    value={rekapGajiTipe}
                    onChange={e => setRekapGajiTipe(e.target.value as any)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="semua">Semua (Guru & Staf)</option>
                    <option value="guru">Guru Saja</option>
                    <option value="staf">Staf Saja</option>
                  </select>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-sm">
                  <span className="font-bold text-slate-700">Status:</span>
                  <select
                    value={rekapGajiStatus}
                    onChange={e => setRekapGajiStatus(e.target.value as any)}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="Paid">Hanya Lunas (Paid)</option>
                    <option value="Draft">Hanya Draft</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                Menampilkan: <span className="text-emerald-700 font-extrabold">{rekapGajiFiltered.length} Data Transaksi</span>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY CARDS (PRINT:HIDDEN) */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3.5 print:hidden">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Total Gaji Pokok</span>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-1 font-mono">
                  Rp {rekapGajiTotals.totalPokok.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{rekapGajiTotals.count} Pegawai</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Total Seluruh Tunjangan</span>
                <div className="text-sm sm:text-base font-black text-indigo-700 mt-1 font-mono">
                  + Rp {rekapGajiTotals.totalTunjangan.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-indigo-600 mt-0.5 block">Walas, Fungsional, Piket, Excess Time</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Total Seluruh Potongan</span>
                <div className="text-sm sm:text-base font-black text-rose-700 mt-1 font-mono">
                  - Rp {rekapGajiTotals.totalPotongan.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-rose-600 mt-0.5 block">Denda Terlambat, Finger, Koperasi, Kasbon</span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Total Gaji Bersih (Net)</span>
                <div className="text-base sm:text-lg font-black text-emerald-700 mt-1 font-mono">
                  Rp {rekapGajiTotals.totalNet.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-0.5 block">
                  {rekapGajiTotals.totalPaid} Lunas • {rekapGajiTotals.totalDraft} Draft
                </span>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL REPORT SHEET CONTAINER */}
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div id="printable-rekap-gaji" className="border border-slate-300 p-4 sm:p-6 rounded-xl bg-white font-sans text-slate-900 shadow-sm space-y-4 min-w-[1100px]">
                
                {/* TEMPLATE MODE 1: EXCEL MASTER 18 KOLOM (EXACT MATCH DENGAN GAMBAR) */}
                {rekapTemplateMode === 'excel' ? (
                  <div className="space-y-4">
                    {/* Header Sesuai Gambar */}
                    <div className="text-center space-y-1 pb-2">
                      <div className="flex items-center justify-center gap-3">
                        {schoolSettings?.logoUrl && (
                          <img src={schoolSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                        )}
                        <h2 className="text-base sm:text-lg font-black tracking-wide text-black uppercase">
                          REKAP GAJI KARYAWAN {schoolSettings?.namaSekolah ? `- ${schoolSettings.namaSekolah.toUpperCase()}` : ''}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider">
                        BULAN : {rekapGajiBulan === 'semua' ? 'SEMUA BULAN' : rekapGajiBulan.toUpperCase()} {rekapGajiTahun}
                      </p>
                    </div>

                    {/* Spreadsheet Table 18 Kolom */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse border border-black text-[9px] leading-tight">
                        <thead>
                          {/* Row 1: Group Headers */}
                          <tr className="bg-slate-100 text-black font-extrabold uppercase text-center border-b border-black divide-x divide-black">
                            <th rowSpan={2} className="py-2 px-1 w-7 text-center align-middle">No</th>
                            <th rowSpan={2} className="py-2 px-2 min-w-[140px] text-center align-middle">NAMA</th>
                            <th rowSpan={2} className="py-2 px-2 min-w-[100px] text-center align-middle">JABATAN</th>
                            <th colSpan={8} className="py-1 px-2 text-center bg-slate-200 border-b border-black">PENDAPATAN</th>
                            <th colSpan={6} className="py-1 px-2 text-center bg-slate-200 border-b border-black">POTONGAN</th>
                            <th rowSpan={2} className="py-2 px-2 min-w-[105px] text-center align-middle bg-slate-100">GAJI BERSIH</th>
                          </tr>

                          {/* Row 2: Detailed Subheaders */}
                          <tr className="bg-slate-50 text-black font-bold uppercase text-[8.5px] text-center border-b border-black divide-x divide-black">
                            {/* PENDAPATAN Columns */}
                            <th className="py-2 px-1 min-w-[85px]">GAJI POKOK</th>
                            <th className="py-2 px-1 min-w-[70px]">TJ WALAS</th>
                            <th className="py-2 px-1 min-w-[85px]">TUNJANGAN FUNGSIONAL</th>
                            <th className="py-2 px-1 min-w-[80px]">KETETAPAN WAKTU</th>
                            <th className="py-2 px-1 min-w-[75px]">TJ KEHADIRAN</th>
                            <th className="py-2 px-1 min-w-[60px]">PIKET</th>
                            <th className="py-2 px-1 min-w-[70px]">EXCES TIME</th>
                            <th className="py-2 px-1 min-w-[90px] font-black bg-slate-200">JML PENDAPATAN</th>

                            {/* POTONGAN Columns */}
                            <th className="py-2 px-1 min-w-[85px]">DENDA TERLAMBAT &lt; 30 MIN</th>
                            <th className="py-2 px-1 min-w-[85px]">DENDA TERLAMBAT &gt; 30 MIN</th>
                            <th className="py-2 px-1 min-w-[75px]">DENDA LUPA FINGER</th>
                            <th className="py-2 px-1 min-w-[75px]">POT. KOPERASI</th>
                            <th className="py-2 px-1 min-w-[85px]">GAJI DIAMBIL DIMUKA</th>
                            <th className="py-2 px-1 min-w-[85px] font-black bg-slate-200">TOTAL POTONGAN</th>
                          </tr>

                          {/* Row 3: Column Numbers 1..18 */}
                          <tr className="bg-slate-200/80 text-black font-bold text-[8px] text-center border-b border-black divide-x divide-black">
                            {Array.from({ length: 18 }, (_, idx) => (
                              <th key={idx + 1} className="py-0.5 px-0.5">
                                {idx + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-black text-black">
                          {rekapGajiFiltered.length === 0 ? (
                            <tr>
                              <td colSpan={18} className="py-12 text-center text-slate-500 font-medium italic">
                                Belum ada data transaksi pembayaran gaji untuk periode {rekapGajiBulan} {rekapGajiTahun}.
                              </td>
                            </tr>
                          ) : (
                            rekapGajiFiltered.map((item, idx) => {
                              const tJ = item.tunjangan || 0;
                              const tW = item.tunjanganWalas || 0;
                              const tK = item.tunjanganKetepatanWaktu || 0;
                              const tH = item.tunjanganKehadiran || 0;
                              const tP = item.tunjanganPiket || 0;
                              const tE = item.tunjanganExcessTime || 0;
                              const sumT = tJ + tW + tK + tH + tP + tE;
                              const jmlPendapatan = (item.gajiPokok || 0) + sumT;

                              const pA = item.potongan || 0;
                              const pT = item.potonganDendaTerlambat || 0;
                              const pTL = item.potonganDendaTerlambatLebih || 0;
                              const pF = item.potonganDendaLupaFinger || 0;
                              const pK = item.potonganKoperasi || 0;
                              const pB = item.potonganKasBon || 0;
                              const sumP = pA + pT + pTL + pF + pK + pB;
                              const gajiBersih = item.totalDiterima || (jmlPendapatan - sumP);

                              const formatCurrency = (val: number, isZeroDash = true) => {
                                if (isZeroDash && (val === 0 || !val)) {
                                  return (
                                    <div className="flex justify-between w-full font-mono text-[8.5px] px-0.5">
                                      <span>Rp</span>
                                      <span>-</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex justify-between w-full font-mono text-[8.5px] px-0.5">
                                    <span>Rp</span>
                                    <span>{val.toLocaleString('id-ID')},00</span>
                                  </div>
                                );
                              };

                              return (
                                <tr key={item.id} className={`divide-x divide-black ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                                  {/* 1. No */}
                                  <td className="py-1 px-1 text-center font-mono font-medium">{idx + 1}</td>
                                  
                                  {/* 2. NAMA */}
                                  <td className="py-1 px-1.5 font-bold uppercase text-[8.5px] whitespace-nowrap">
                                    {item.penerimaNama}
                                  </td>

                                  {/* 3. JABATAN */}
                                  <td className="py-1 px-1.5 uppercase text-[8px] font-medium whitespace-nowrap">
                                    {item.jabatan || (item.penerimaTipe === 'guru' ? 'GURU' : 'STAF')}
                                  </td>

                                  {/* 4. GAJI POKOK */}
                                  <td className="py-1 px-1">{formatCurrency(item.gajiPokok || 0)}</td>

                                  {/* 5. TJ WALAS */}
                                  <td className="py-1 px-1">{formatCurrency(tW)}</td>

                                  {/* 6. TUNJANGAN FUNGSIONAL */}
                                  <td className="py-1 px-1">{formatCurrency(tJ)}</td>

                                  {/* 7. KETETAPAN WAKTU */}
                                  <td className="py-1 px-1">{formatCurrency(tK)}</td>

                                  {/* 8. TJ KEHADIRAN */}
                                  <td className="py-1 px-1">{formatCurrency(tH)}</td>

                                  {/* 9. PIKET */}
                                  <td className="py-1 px-1">{formatCurrency(tP)}</td>

                                  {/* 10. EXCES TIME */}
                                  <td className="py-1 px-1">{formatCurrency(tE)}</td>

                                  {/* 11. JML PENDAPATAN */}
                                  <td className="py-1 px-1 font-bold bg-slate-100/70">
                                    {formatCurrency(jmlPendapatan)}
                                  </td>

                                  {/* 12. DENDA TERLAMBAT < 30 MIN */}
                                  <td className="py-1 px-1">{formatCurrency(pT)}</td>

                                  {/* 13. DENDA TERLAMBAT > 30 MIN */}
                                  <td className="py-1 px-1">{formatCurrency(pTL)}</td>

                                  {/* 14. DENDA LUPA FINGER */}
                                  <td className="py-1 px-1">{formatCurrency(pF)}</td>

                                  {/* 15. POT. KOPERASI */}
                                  <td className="py-1 px-1">{formatCurrency(pK)}</td>

                                  {/* 16. GAJI DIAMBIL DIMUKA */}
                                  <td className="py-1 px-1">{formatCurrency(pB)}</td>

                                  {/* 17. TOTAL POTONGAN */}
                                  <td className="py-1 px-1 font-bold bg-slate-100/70">
                                    {formatCurrency(sumP)}
                                  </td>

                                  {/* 18. GAJI BERSIH */}
                                  <td className="py-1 px-1 font-bold bg-slate-200/50">
                                    {formatCurrency(gajiBersih)}
                                  </td>
                                </tr>
                              );
                            })
                          )}

                          {/* Extra blank rows to give standard Excel spreadsheet ledger layout */}
                          {rekapGajiFiltered.length > 0 && Array.from({ length: Math.max(0, 10 - rekapGajiFiltered.length) }, (_, i) => (
                            <tr key={`blank-${i}`} className="divide-x divide-black bg-white h-6">
                              <td className="py-1 px-1 text-center font-mono text-slate-400">{rekapGajiFiltered.length + i + 1}</td>
                              <td className="py-1 px-1.5">&nbsp;</td>
                              <td className="py-1 px-1.5">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1 bg-slate-100/40">
                                <div className="flex justify-between w-full font-mono text-[8.5px] px-0.5 text-slate-400">
                                  <span>Rp</span>
                                  <span>-</span>
                                </div>
                              </td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1">&nbsp;</td>
                              <td className="py-1 px-1 bg-slate-100/40">
                                <div className="flex justify-between w-full font-mono text-[8.5px] px-0.5 text-slate-400">
                                  <span>Rp</span>
                                  <span>-</span>
                                </div>
                              </td>
                              <td className="py-1 px-1 bg-slate-200/30">
                                <div className="flex justify-between w-full font-mono text-[8.5px] px-0.5 text-slate-400">
                                  <span>Rp</span>
                                  <span>-</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        {/* TOTAL ROW */}
                        {rekapGajiFiltered.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-200 text-black font-black text-[8.5px] divide-x divide-black border-t-2 border-black">
                              <td colSpan={3} className="py-2 px-2 text-center uppercase tracking-wider">
                                TOTAL
                              </td>
                              
                              {/* 4. Total Gaji Pokok */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPokok.toLocaleString('id-ID')},00</span>
                                </div>
                              </td>

                              {/* 5. Total Tj Walas */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalWalas > 0 ? `${rekapGajiTotals.totalWalas.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 6. Total Tunjangan Fungsional */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalJabatan > 0 ? `${rekapGajiTotals.totalJabatan.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 7. Total Ketetapan Waktu */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalKetepatan > 0 ? `${rekapGajiTotals.totalKetepatan.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 8. Total Tj Kehadiran */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalKehadiran > 0 ? `${rekapGajiTotals.totalKehadiran.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 9. Total Piket */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPiket > 0 ? `${rekapGajiTotals.totalPiket.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 10. Total Exces Time */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalExcess > 0 ? `${rekapGajiTotals.totalExcess.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 11. Total Jml Pendapatan */}
                              <td className="py-2 px-1 bg-slate-300">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalGross.toLocaleString('id-ID')},00</span>
                                </div>
                              </td>

                              {/* 12. Total Denda Terlambat < 30 Min */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotTerlambat > 0 ? `${rekapGajiTotals.totalPotTerlambat.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 13. Total Denda Terlambat > 30 Min */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotTerlambatLebih > 0 ? `${rekapGajiTotals.totalPotTerlambatLebih.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 14. Total Denda Lupa Finger */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotFinger > 0 ? `${rekapGajiTotals.totalPotFinger.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 15. Total Pot. Koperasi */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotKoperasi > 0 ? `${rekapGajiTotals.totalPotKoperasi.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 16. Total Gaji Diambil Dimuka */}
                              <td className="py-2 px-1">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotKasBon > 0 ? `${rekapGajiTotals.totalPotKasBon.toLocaleString('id-ID')},00` : '-'}</span>
                                </div>
                              </td>

                              {/* 17. Total Potongan */}
                              <td className="py-2 px-1 bg-slate-300">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalPotongan.toLocaleString('id-ID')},00</span>
                                </div>
                              </td>

                              {/* 18. Total Gaji Bersih */}
                              <td className="py-2 px-1 bg-slate-300">
                                <div className="flex justify-between w-full font-mono font-black px-0.5">
                                  <span>Rp</span>
                                  <span>{rekapGajiTotals.totalNet.toLocaleString('id-ID')},00</span>
                                </div>
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* Tanda Tangan & Pengesahan Master Sheet */}
                    <div className="flex justify-end pt-6 text-xs text-black">
                      <div className="text-center space-y-16 w-72">
                        <div>
                          <p className="text-black font-semibold">
                            {schoolSettings?.alamat ? (schoolSettings.alamat.split(',')[0] || 'Jakarta') : 'Jakarta'},{' '}
                            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="font-semibold text-black">Pembuat Daftar Gaji / Bendahara Sekolah,</p>
                          <p className="text-[10.5px] text-slate-600">{schoolSettings?.namaSekolah || 'SMP Islam Modern Al Fakhir'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold underline text-black text-sm">{bendaharaNama}</p>
                          <p className="text-[10px] text-slate-600 font-mono">NIK: {bendaharaNik}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TEMPLATE MODE 2: MODERN OFFICIAL KOP & DETAIL */
                  <div className="space-y-6">
                    {/* KOP SURAT SEKOLAH RESMI */}
                    <div className="flex justify-between items-start pb-4 border-b-2 border-slate-950">
                      <div className="flex items-center gap-4">
                        {schoolSettings?.logoUrl ? (
                          <div className="w-16 h-16 p-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-slate-700 text-2xl shrink-0">
                            🏫
                          </div>
                        )}
                        <div>
                          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-tight">
                            {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}
                          </h2>
                          <p className="text-xs text-slate-700 leading-normal mt-0.5 max-w-xl">
                            {schoolSettings?.alamat || 'Alamat Sekolah'}, RT/RW {schoolSettings?.rtRw || '01/01'}, Kec. {schoolSettings?.kecamatan || 'Kecamatan'}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                            NPSN: {schoolSettings?.npsn || '70048660'} • Akreditasi: {schoolSettings?.akreditasi || 'A (Unggul)'} • Telp: {schoolSettings?.telepon || '-'} • Email: {schoolSettings?.email || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider mb-1">
                          DOKUMEN PAYROLL RESMI
                        </span>
                        <div className="text-[11px] font-bold font-mono text-slate-800">
                          PERIODE: {rekapGajiBulan.toUpperCase()} {rekapGajiTahun}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          Tanggal Cetak: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* JUDUL LAPORAN */}
                    <div className="text-center bg-slate-100 py-3 rounded-xl border border-slate-200 space-y-0.5">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-950">
                        REKAPITULASI DAFTAR PENGGAJIAN & HONORARIUM GURU & KARYAWAN
                      </h3>
                      <p className="text-xs font-bold text-slate-600">
                        PERIODE BULAN: {rekapGajiBulan.toUpperCase()} {rekapGajiTahun} • UNIT: {rekapGajiTipe === 'semua' ? 'SEMUA TENAGA PENDIDIK & KEPENDIDIKAN' : (rekapGajiTipe === 'guru' ? 'DEWAN GURU' : 'STAF & KARYAWAN')}
                      </p>
                    </div>

                    {/* TABEL DETAIL REKAPITULASI GAJI */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-[10.5px]">
                        <thead>
                          <tr className="bg-slate-900 text-white text-[9.5px] uppercase font-bold tracking-wider divide-x divide-slate-800">
                            <th className="py-2.5 px-2 text-center w-8">No</th>
                            <th className="py-2.5 px-3">Nama Pegawai & NIP/NIK</th>
                            <th className="py-2.5 px-2 text-center w-24">Jabatan</th>
                            <th className="py-2.5 px-2.5 text-right">Gaji Pokok</th>
                            <th className="py-2.5 px-2 text-right">Tunj. Jabatan</th>
                            <th className="py-2.5 px-2 text-right">Tunj. Walas</th>
                            <th className="py-2.5 px-2 text-right">Kehadiran & Piket</th>
                            <th className="py-2.5 px-2.5 text-right bg-slate-800 text-emerald-300">Total Bruto</th>
                            <th className="py-2.5 px-2 text-right text-rose-300">Pot. Absensi</th>
                            <th className="py-2.5 px-2 text-right text-rose-300">Koperasi/Kasbon</th>
                            <th className="py-2.5 px-2 text-right text-rose-300">Total Pot.</th>
                            <th className="py-2.5 px-3 text-right bg-emerald-900 text-emerald-200 font-extrabold">Net Diterima</th>
                            <th className="py-2.5 px-2 text-center w-24">Status / TTD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          {rekapGajiFiltered.length === 0 ? (
                            <tr>
                              <td colSpan={13} className="py-10 text-center text-slate-400 font-medium italic">
                                Tidak ada transaksi penggajian untuk periode {rekapGajiBulan} {rekapGajiTahun}.
                              </td>
                            </tr>
                          ) : (
                            rekapGajiFiltered.map((item, idx) => {
                              const tJ = item.tunjangan || 0;
                              const tW = item.tunjanganWalas || 0;
                              const tK = item.tunjanganKetepatanWaktu || 0;
                              const tH = item.tunjanganKehadiran || 0;
                              const tP = item.tunjanganPiket || 0;
                              const tE = item.tunjanganExcessTime || 0;
                              const sumT = tJ + tW + tK + tH + tP + tE;

                              const pA = item.potongan || 0;
                              const pT = item.potonganDendaTerlambat || 0;
                              const pTL = item.potonganDendaTerlambatLebih || 0;
                              const pF = item.potonganDendaLupaFinger || 0;
                              const pK = item.potonganKoperasi || 0;
                              const pB = item.potonganKasBon || 0;
                              const sumP = pA + pT + pTL + pF + pK + pB;

                              const nipNik = (item.penerimaNipNik && item.penerimaNipNik !== '-') 
                                ? item.penerimaNipNik 
                                : (item.penerimaTipe === 'guru' ? (guruList.find(g => g.id === item.penerimaId)?.nik || guruList.find(g => g.id === item.penerimaId)?.nip || '-') : (stafList.find(s => s.id === item.penerimaId)?.nik || '-'));

                              return (
                                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                  <td className="py-2.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-slate-950 text-xs">{item.penerimaNama}</div>
                                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{nipNik}</div>
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <span className={`inline-block px-1.5 py-0.5 text-[8.5px] rounded font-bold uppercase ${
                                      item.penerimaTipe === 'guru' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                                    }`}>
                                      {item.penerimaTipe}
                                    </span>
                                    <div className="text-[9.5px] text-slate-600 font-medium truncate max-w-[90px] mx-auto mt-0.5">{item.jabatan}</div>
                                  </td>
                                  <td className="py-2.5 px-2.5 text-right font-mono text-slate-900 font-semibold">
                                    Rp {item.gajiPokok.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {tJ > 0 ? `Rp ${tJ.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {tW > 0 ? `Rp ${tW.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {(tH + tP + tK + tE) > 0 ? `Rp ${(tH + tP + tK + tE).toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-950 bg-slate-100/60">
                                    Rp {(item.gajiPokok + sumT).toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-rose-700">
                                    {(pA + pT + pTL + pF) > 0 ? `Rp ${(pA + pT + pTL + pF).toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-rose-700">
                                    {(pK + pB) > 0 ? `Rp ${(pK + pB).toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-700 bg-rose-50/40">
                                    {sumP > 0 ? `Rp ${sumP.toLocaleString('id-ID')}` : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 bg-emerald-50 text-xs">
                                    Rp {item.totalDiterima.toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-2.5 px-2 text-center text-[9px]">
                                    <span className={`inline-block px-1.5 py-0.5 rounded font-extrabold ${
                                      item.status === 'Paid' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                                    }`}>
                                      {item.status === 'Paid' ? 'LUNAS' : 'DRAFT'}
                                    </span>
                                    {item.penerimaRekening && (
                                      <div className="text-[8px] text-slate-500 font-mono mt-0.5 truncate max-w-[85px] mx-auto">
                                        {item.penerimaRekening}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>

                        {/* GRAND TOTAL ROW */}
                        {rekapGajiFiltered.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-900 text-white font-extrabold text-[10px] divide-x divide-slate-800 border-t-2 border-slate-950">
                              <td colSpan={3} className="py-3 px-3 text-center uppercase tracking-wider font-black">
                                GRAND TOTAL AKUMULASI ({rekapGajiTotals.count} PENERIMA)
                              </td>
                              <td className="py-3 px-2.5 text-right font-mono">
                                Rp {rekapGajiTotals.totalPokok.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-slate-300">
                                Rp {rekapGajiTotals.totalJabatan.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-slate-300">
                                Rp {rekapGajiTotals.totalWalas.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-slate-300">
                                Rp {(rekapGajiTotals.totalKehadiran + rekapGajiTotals.totalPiket + rekapGajiTotals.totalKetepatan + rekapGajiTotals.totalExcess).toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2.5 text-right font-mono text-emerald-300 font-black bg-slate-800">
                                Rp {rekapGajiTotals.totalGross.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-rose-300">
                                Rp {(rekapGajiTotals.totalPotAbsensi + rekapGajiTotals.totalPotTerlambat + rekapGajiTotals.totalPotTerlambatLebih + rekapGajiTotals.totalPotFinger).toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-rose-300">
                                Rp {(rekapGajiTotals.totalPotKoperasi + rekapGajiTotals.totalPotKasBon).toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono text-rose-300 font-black">
                                Rp {rekapGajiTotals.totalPotongan.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-black text-emerald-300 bg-emerald-950 text-xs">
                                Rp {rekapGajiTotals.totalNet.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-2 text-center text-[9px] text-slate-300">
                                {rekapGajiTotals.totalPaid} Lunas / {rekapGajiTotals.totalDraft} Draft
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* TERBILANG SECTION */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-slate-900">
                        Total Pengeluaran Gaji Bersih (Net Payroll):{' '}
                        <span className="text-emerald-700 font-extrabold font-mono text-sm">
                          Rp {rekapGajiTotals.totalNet.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[11px] italic text-slate-600">
                        <span className="font-semibold not-italic text-slate-800">Terbilang: </span>
                        "{terbilang(rekapGajiTotals.totalNet)} Rupiah"
                      </div>
                    </div>

                    {/* TANDA TANGAN & PENGESAHAN */}
                    <div className="flex justify-end pt-6 text-xs border-t border-slate-200">
                      <div className="text-center space-y-12 w-72">
                        <div>
                          <p className="text-slate-600 font-medium">
                            {schoolSettings?.alamat ? (schoolSettings.alamat.split(',')[0] || 'Jakarta') : 'Jakarta'},{' '}
                            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-slate-600 font-medium">Pembuat Daftar Gaji / Bendahara Sekolah,</p>
                          <p className="text-[10px] text-slate-400">SMP Islam Modern Al Fakhir</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold underline text-slate-950 text-sm">{bendaharaNama}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NIK: {bendaharaNik}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER NOTIFIKASI */}
                <div className="text-[9px] text-slate-400 text-center pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span>Dokumen Rekapitulasi Resmi Sistem Manajemen Keuangan Sekolah</span>
                  <span>Kode Rekap: REKAP-{rekapGajiBulan.toUpperCase()}-{rekapGajiTahun} • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION DIALOG MODAL FOR GAJI */}
      {gajiToDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Hapus Pembayaran Gaji?</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Apakah Anda benar-benar yakin ingin menghapus data payroll gaji ini? Rincian slip dan riwayat transaksi gaji ini akan dihapus permanen dari sistem.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setGajiToDeleteId(null)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors border border-slate-700"
              >
                Batalkan
              </button>
              <button
                onClick={handleExecuteDeleteGaji}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow-md shadow-rose-600/30"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK SENDING WHATSAPP PROGRESS MODAL */}
      {isBulkSendingGaji && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Mengirim Slip Gaji Otomatis</h3>
              <p className="text-xs text-slate-400 mt-1">
                Sedang memproses slip bergambar dan mengirimkan via WhatsApp Gateway...
              </p>
            </div>

            {bulkGajiProgress && (
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Penerima Saat Ini:</span>
                  <span className="text-emerald-400 font-extrabold">{bulkGajiProgress.name}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Progres:</span>
                  <span>{bulkGajiProgress.current} dari {bulkGajiProgress.total} orang</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round((bulkGajiProgress.current / bulkGajiProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-500 italic">
              Mohon tidak menutup halaman ini hingga proses pengiriman selesai.
            </p>
          </div>
        </div>
      )}

      {/* OFFSCREEN PRINTABLE SLIP CONTAINER FOR BACKGROUND IMAGE GENERATION */}
      {offscreenSlipItem && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px', zIndex: -100 }}>
          {(() => {
            const item = offscreenSlipItem;
            const tWalas = item.tunjanganWalas || 0;
            const tKetepatan = item.tunjanganKetepatanWaktu || 0;
            const tHadir = item.tunjanganKehadiran || 0;
            const tPiket = item.tunjanganPiket || 0;
            const tExcess = item.tunjanganExcessTime || 0;
            const tJabatan = item.tunjangan || 0;

            const pTerlambat = item.potonganDendaTerlambat || 0;
            const pFinger = item.potonganDendaLupaFinger || 0;
            const pKoperasi = item.potonganKoperasi || 0;
            const pKasBon = item.potonganKasBon || 0;
            const pAbsensi = item.potongan || 0;

            const totalT = tJabatan + tWalas + tKetepatan + tHadir + tPiket + tExcess;
            const totalP = pAbsensi + pTerlambat + pFinger + pKoperasi + pKasBon;
            const totalNet = item.totalDiterima;

            const recipientNipNik = (item.penerimaNipNik && item.penerimaNipNik !== '-')
              ? item.penerimaNipNik
              : (item.penerimaTipe === 'guru' 
                  ? (guruList.find(g => g.id === item.penerimaId)?.nip || guruList.find(g => g.id === item.penerimaId)?.nik || '-') 
                  : (stafList.find(s => s.id === item.penerimaId)?.nip || stafList.find(s => s.id === item.penerimaId)?.nik || '-'));

            return (
              <div id="printable-slip-gaji-offscreen" className="border border-slate-300 p-6 sm:p-7 rounded-xl space-y-5 bg-white font-sans text-slate-900 w-[800px]">
                {/* Header */}
                <div className="flex justify-between items-start pb-3.5 border-b-2 border-slate-800">
                  <div className="flex items-center gap-3.5">
                    {schoolSettings?.logoUrl ? (
                      <div className="w-14 h-14 p-1 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700 text-lg shrink-0">
                        🏫
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-900 uppercase leading-tight">
                        {schoolSettings?.namaSekolah || 'SMP ISLAM MODERN AL FAKHIR'}
                      </h2>
                      <p className="text-[10px] text-slate-600 leading-normal mt-0.5 max-w-md">
                        {schoolSettings?.alamat || 'Alamat Sekolah'}, RT/RW {schoolSettings?.rtRw || '01/01'}, Kec. {schoolSettings?.kecamatan || 'Kecamatan'}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                        NPSN: {schoolSettings?.npsn || '-'} • Telp: {schoolSettings?.telepon || '-'} • Email: {schoolSettings?.email || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider mb-1">
                      SLIP GAJI RESMI
                    </span>
                    <div className="text-[11px] font-bold font-mono text-slate-700">{item.id}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Tgl Bayar: <span className="font-semibold text-slate-700">{item.tanggalBayar}</span></div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center bg-slate-100/70 py-1.5 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">SLIP GAJI & HONORARIUM</h3>
                  <p className="text-[10px] font-bold text-slate-600">PERIODE: {item.bulan.toUpperCase()} {item.tahun}</p>
                </div>

                {/* Recipient details */}
                <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-slate-500 font-medium">Nama Penerima</span>
                      <span className="text-slate-900 font-black">: {item.penerimaNama}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500 font-medium">NIP / NIK</span>
                      <span className="text-slate-800 font-mono">: {recipientNipNik}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex">
                      <span className="w-28 text-slate-500 font-medium">Jabatan / Posisi</span>
                      <span className="text-slate-900 font-bold">: {item.jabatan}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500 font-medium">Metode Bayar</span>
                      <span className="text-slate-800 font-semibold">: {item.metodePembayaran}</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Sections */}
                <div className="grid grid-cols-2 gap-4 items-stretch">
                  {/* Penerimaan */}
                  <div className="border border-emerald-300/80 rounded-xl overflow-hidden bg-emerald-50/25 flex flex-col h-full shadow-sm">
                    <div className="bg-emerald-700 text-white font-extrabold text-[10.5px] px-3.5 py-2 uppercase tracking-wide flex justify-between items-center">
                      <span>I. PENERIMAAN (PENGHASILAN)</span>
                      <span className="text-[9px] font-bold opacity-90">JUMLAH</span>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between text-[10.5px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100 font-bold text-slate-900">
                          <span>• Gaji Pokok</span>
                          <span className="font-mono">Rp {item.gajiPokok.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Tunjangan Jabatan & Ops</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tJabatan.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Tunjangan Wali Kelas</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tWalas.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Ketepatan Waktu</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tKetepatan.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Tunjangan Kehadiran</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tHadir.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Tunjangan Piket</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tPiket.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-emerald-100">
                          <span className="text-slate-600 font-medium">• Excess Time</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {tExcess.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between pt-2.5 mt-3 border-t-2 border-emerald-600 font-black text-xs text-emerald-950">
                        <span>Total Penghasilan</span>
                        <span className="font-mono">Rp {(item.gajiPokok + totalT).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Potongan */}
                  <div className="border border-rose-300/80 rounded-xl overflow-hidden bg-rose-50/25 flex flex-col h-full shadow-sm">
                    <div className="bg-rose-700 text-white font-extrabold text-[10.5px] px-3.5 py-2 uppercase tracking-wide flex justify-between items-center">
                      <span>II. POTONGAN (DEDUKSI)</span>
                      <span className="text-[9px] font-bold opacity-90">JUMLAH</span>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between text-[10.5px]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                          <span className="text-slate-600 font-medium">• Potongan Absensi / Umum</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {pAbsensi.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                          <span className="text-slate-600 font-medium">• Denda Terlambat</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {pTerlambat.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                          <span className="text-slate-600 font-medium">• Denda Lupa Finger</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {pFinger.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                          <span className="text-slate-600 font-medium">• Potongan Koperasi</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {pKoperasi.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-0.5 border-b border-dashed border-rose-100">
                          <span className="text-slate-600 font-medium">• Kas Bon / Pinjaman</span>
                          <span className="font-mono font-semibold text-slate-900">Rp {pKasBon.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between pt-2.5 mt-3 border-t-2 border-rose-600 font-black text-xs text-rose-950">
                        <span>Total Potongan</span>
                        <span className="font-mono">Rp {totalP.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Bersih */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                        JUMLAH BERSIH YANG DITERIMA (NET INCOME)
                      </h4>
                      <p className="text-[9px] text-slate-300 font-medium">
                        {item.metodePembayaran} {item.penerimaRekening ? `• No. Rekening: ${item.penerimaRekening}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-emerald-300 tracking-tight">
                        Rp {totalNet.toLocaleString('id-ID')}
                      </div>
                      <span className={`inline-block text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${item.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                        {item.status === 'Paid' ? 'STATUS: PAID (LUNAS)' : 'STATUS: DRAFT (PENDING)'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-750 text-[9.5px] text-slate-300 italic">
                    <span className="font-semibold text-slate-400 not-italic">Terbilang: </span>
                    "{terbilang(totalNet)}"
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-6 text-[10px] border-t border-slate-200">
                  <div className="text-center space-y-10">
                    <p className="text-slate-600 font-medium">Penerima Gaji,</p>
                    <div className="space-y-0.5">
                      <p className="font-bold underline text-slate-900">{item.penerimaNama}</p>
                    </div>
                  </div>
                  <div className="text-center space-y-10">
                    <p className="text-slate-600 font-medium">Bendahara Sekolah,</p>
                    <div className="space-y-0.5">
                      <p className="font-bold underline text-slate-900">{bendaharaNama}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 text-center pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span>Dicetak otomatis oleh Sistem Manajemen Keuangan Sekolah</span>
                  <span>{item.id} • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
