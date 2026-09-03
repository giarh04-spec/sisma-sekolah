import { PerizinanView } from './PerizinanView';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CameraScanner } from './CameraScanner';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Check, 
  BookOpen, 
  Plus, 
  Save, 
  FileSpreadsheet,
  Send,
  QrCode,
  ScanLine,
  Volume2,
  CheckCheck,
  MessageSquare,
  FileSignature,
  Phone,
  LogIn,
  LogOut,
  Smartphone,
  Share2,
  Sparkles,
  Bell,
  Sliders,
  RefreshCw,
  Calendar,
  Trash2,
  Square,
  CheckSquare
} from 'lucide-react';
import { 
  Siswa, 
  Guru, 
  Staf,
  AbsensiSiswaHarian, 
  AbsensiSiswaKelas, 
  AbsensiGuru, 
  StatusAbsensi,
  Role,
  RombelKelas,
  MataPelajaranItem,
  SchoolSettings,
  JadwalPresensi
} from '../types/school';
import { exportAllToGoogleSheets } from '../lib/googleDriveSync';
import { sendFonnteMessage, getFonnteDeviceStatus, FonnteDeviceStatus } from '../lib/fonnte';

const LocationWithMapLink = ({ text }: { text: string }) => {
  if (!text || text === '-' || text === 'N/A') return <span>-</span>;
  
  const match = text.match(/\(([^)]+)\)/);
  let cleanCoords = '';
  let before = text;
  let after = '';
  let hasCoords = false;

  if (match) {
    const coords = match[1];
    const parts = coords.split(',');
    if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
      before = text.substring(0, match.index);
      after = text.substring(match.index! + match[0].length);
      cleanCoords = coords.trim().replace(/\s+/g, '');
      hasCoords = true;
    }
  }

  const query = hasCoords ? cleanCoords : `${text} Sekolah Islam Modern Al Fakhir`;
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="flex items-center flex-wrap gap-1">
      <span className="text-slate-700">{hasCoords ? before.trim() : text}</span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-[9px] font-bold text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors uppercase tracking-tight shadow-sm"
        title="Buka di Google Maps"
      >
        <MapPin className="w-2 h-2 mr-0.5" />
        Peta
      </a>
      {hasCoords && <span className="text-slate-500 text-[10px]">{after}</span>}
    </div>
  );
};

interface AbsensiViewProps {
  siswaList: Siswa[];
  guruList: Guru[];
  absensiHarian: AbsensiSiswaHarian[];
  setAbsensiHarian: React.Dispatch<React.SetStateAction<AbsensiSiswaHarian[]>>;
  absensiKelasList: AbsensiSiswaKelas[];
  setAbsensiKelasList: React.Dispatch<React.SetStateAction<AbsensiSiswaKelas[]>>;
  absensiGuruList: AbsensiGuru[];
  setAbsensiGuruList: React.Dispatch<React.SetStateAction<AbsensiGuru[]>>;
  currentRole?: Role;
  userGoogleToken?: string;
  rombelList?: RombelKelas[];
  mapelList?: MataPelajaranItem[];
  stafList?: Staf[];
  subTab?: SubTabAbsensi;
  setSubTab?: (subTab: SubTabAbsensi) => void;
  schoolSettings?: SchoolSettings;
  setSchoolSettings?: React.Dispatch<React.SetStateAction<SchoolSettings>>;
}

type SubTabAbsensi = 'scan_barcode' | 'harian_siswa' | 'absensi_guru' | 'redaksi' | 'jurnal_guru' | 'perizinan';

// Helper to resolve coordinates to known school locations or format nicely
const getFriendlyLocationName = (lat: number, lng: number): string => {
  // School reference point (based on typical coordinates in the screenshot)
  const schoolPoints = [
    { lat: -6.2415, lng: 106.8045, name: 'Sekolah Islam Modern Al Fakhir' },
    { lat: -6.200000, lng: 106.816666, name: 'Gerbang Utama Sekolah' },
    { lat: -6.200100, lng: 106.816700, name: 'Lobby Gedung Utama' },
    { lat: -6.200200, lng: 106.816500, name: 'Area Parkir Guru' },
    { lat: -6.200500, lng: 106.816800, name: 'Kantor Tata Usaha' }
  ];

  // Check if within ~50 meters (roughly 0.0005 degrees)
  const found = schoolPoints.find(p => 
    Math.abs(p.lat - lat) < 0.0005 && Math.abs(p.lng - lng) < 0.0005
  );

  const coordsStr = `(${lat.toFixed(6)}, ${lng.toFixed(6)})`;
  if (found) return `${found.name} ${coordsStr}`;
  
  // Otherwise return formatted GPS
  return `Lokasi Luar ${coordsStr}`;
};

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  siswaList,
  guruList,
  absensiHarian,
  setAbsensiHarian,
  absensiKelasList,
  setAbsensiKelasList,
  absensiGuruList,
  setAbsensiGuruList,
  currentRole = 'admin',
  userGoogleToken = 'demo_workspace_token_active',
  rombelList = [],
  mapelList = [],
  stafList = [],
  subTab: controlledSubTab,
  setSubTab: setControlledSubTab,
  schoolSettings,
  setSchoolSettings
}) => {
  const [internalSubTab, setInternalSubTab] = useState<SubTabAbsensi>('scan_barcode');

  const subTab = controlledSubTab ?? internalSubTab;
  const setSubTab = (val: SubTabAbsensi) => {
    setInternalSubTab(val);
    if (setControlledSubTab) setControlledSubTab(val);
  };

  useEffect(() => {
    if (currentRole === 'guru') {
      setScanTargetType('siswa');
    }
  }, [currentRole]);

  // --- Subtab Barcode Scanner, Jadwal & Fonnte Modal State ---
  const [showFonnteModal, setShowFonnteModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [localJadwal, setLocalJadwal] = useState<JadwalPresensi>(
    schoolSettings?.jadwalPresensi || {
      jamMasuk: '07:00',
      jamToleransi: '07:15',
      jamPulang: '16:00',
      hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      autoSwitchScanMode: true
    }
  );

  // Selection state for bulk actions
  const [selectedGuruIds, setSelectedGuruIds] = useState<string[]>([]);

  useEffect(() => {
    if (schoolSettings?.jadwalPresensi) {
      setLocalJadwal(schoolSettings.jadwalPresensi);
    }
  }, [schoolSettings]);

  // Auto switch scan mode based on current server/client hour
  useEffect(() => {
    const currentJadwal = schoolSettings?.jadwalPresensi || localJadwal;
    if (currentJadwal?.autoSwitchScanMode) {
      const now = new Date();
      const currentH = now.getHours();
      const [pH] = (currentJadwal.jamPulang || '14:30').split(':').map(Number);
      if (currentH >= 12 || currentH >= (pH - 1)) {
        setScanMode('Pulang');
      } else {
        setScanMode('Masuk');
      }
    }
  }, [schoolSettings?.jadwalPresensi, localJadwal]);

  // Auto redirect away from scan_barcode if not admin or petugas_absensi
  useEffect(() => {
    if (currentRole !== 'admin' && currentRole !== 'petugas_absensi' && subTab === 'scan_barcode' && setSubTab) {
      setSubTab('perizinan');
    }
  }, [currentRole, subTab, setSubTab]);

  // GPS Geotagging State & Integration
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'connected' | 'error'>('idle');
  const [gpsAddress, setGpsAddress] = useState<string>('Mencari Lokasi GPS...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsAddress('Geolocation tidak didukung');
      return;
    }

    setGpsStatus('fetching');
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        setGpsCoords({ lat, lng, accuracy });
        setGpsStatus('connected');
        const friendlyName = getFriendlyLocationName(lat, lng);
        setGpsAddress(`${friendlyName} (Akurasi ±${Math.round(accuracy)}m)`);
      },
      (error) => {
        let errorMsg = 'Lokasi Default';
        let detailMsg = 'Menggunakan koordinat default sekolah.';
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMsg = 'Izin Lokasi Ditolak';
            detailMsg = 'Menggunakan titik koordinat sekolah (GPS default).';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMsg = 'Lokasi Tidak Terdeteksi';
            detailMsg = 'Menggunakan titik koordinat sekolah.';
            break;
          case 3: // TIMEOUT
            errorMsg = 'Waktu Tunggu GPS Habis';
            detailMsg = 'Menggunakan titik koordinat sekolah.';
            break;
          default:
            errorMsg = 'GPS Offline';
        }
        
        // Gracefully fallback without breaking UI state
        setGpsStatus('connected');
        setGpsAddress(`Lokasi Sekolah (Default) - Akurasi ±100m`);

        if (!gpsCoords) {
          setGpsCoords({ lat: -6.2415, lng: 106.8045, accuracy: 100 });
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchGpsLocation = () => {
    // Manual refresh if needed, though watchPosition should handle it
    setGpsStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        setGpsCoords({ lat, lng, accuracy });
        setGpsStatus('connected');
        const friendlyName = getFriendlyLocationName(lat, lng);
        setGpsAddress(`${friendlyName} (Akurasi ±${Math.round(accuracy)}m)`);
        showToast(`GPS Diperbarui: ${friendlyName}`, 'success');
      },
      (error) => {
        let errorMsg = 'GPS Error';
        let detailMsg = 'Pastikan GPS aktif.';
        switch (error.code) {
          case 1: 
            errorMsg = 'Izin Lokasi Ditolak'; 
            detailMsg = 'Buka di tab baru jika izin tidak muncul.';
            break;
          case 2: errorMsg = 'Lokasi Tidak Terdeteksi'; break;
          case 3: errorMsg = 'Waktu Tunggu Habis'; break;
          default: errorMsg = 'Gagal Mengakses GPS';
        }
        showToast(`Gagal: ${errorMsg}. ${detailMsg}`, 'error');
        setGpsStatus('error');
        setGpsAddress(`${errorMsg} - ${detailMsg}`);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Helper to calculate status attendance label (Tepat Waktu, Terlambat, Pulang Cepat)
  const calculateAttendanceStatusLabel = (timeStr: string, mode: 'Masuk' | 'Pulang', userType: 'siswa' | 'guru' | 'staf' = 'siswa') => {
    const jadwal = schoolSettings?.jadwalPresensi || localJadwal;
    // Replace dots with colons to support id-ID time format (e.g. 07.15.00)
    const normalizedTimeStr = timeStr.replace(/\./g, ':');
    const parts = normalizedTimeStr.split(':').map(Number);
    const curH = parts[0] || 0;
    const curM = parts[1] || 0;
    const curTotalSec = curH * 3600 + curM * 60;

    const jMasuk = userType === 'siswa' ? (jadwal.jamMasuk || '07:00') : (jadwal.jamMasukGuru || '06:45');
    const jToleransi = userType === 'siswa' ? (jadwal.jamToleransi || '07:15') : (jadwal.jamToleransiGuru || '07:00');
    const jPulang = userType === 'siswa' ? (jadwal.jamPulang || '14:30') : (jadwal.jamPulangGuru || '15:00');

    if (mode === 'Masuk') {
      const [mH, mM] = jMasuk.split(':').map(Number);
      const [tH, tM] = jToleransi.split(':').map(Number);
      const masukSec = mH * 3600 + mM * 60;
      const toleransiSec = tH * 3600 + tM * 60;

      if (curTotalSec <= masukSec) {
        return { label: 'Hadir Tepat Waktu', isLate: false };
      } else if (curTotalSec <= toleransiSec) {
        const diffMins = Math.max(1, Math.ceil((curTotalSec - masukSec) / 60));
        return { label: `Hadir (Toleransi ${diffMins}m)`, isLate: false };
      } else {
        const lateMins = Math.max(1, Math.ceil((curTotalSec - toleransiSec) / 60));
        return { label: `Terlambat (${lateMins} Menit)`, isLate: true };
      }
    } else {
      const [pH, pM] = jPulang.split(':').map(Number);
      const pulangSec = pH * 3600 + pM * 60;

      if (curTotalSec < pulangSec) {
        const earlyMins = Math.max(1, Math.ceil((pulangSec - curTotalSec) / 60));
        return { label: `Pulang Cepat (${earlyMins}m)`, isLate: false };
      } else {
        return { label: 'Pulang Sesuai Jadwal', isLate: false };
      }
    }
  };

  const [localFonnteToken, setLocalFonnteToken] = useState(schoolSettings?.fonnteToken || 'FONNTE_EDU_TOKEN_2026_SMP_MODERN_AL_FAKHIR');
  const [fonnteStatusInfo, setFonnteStatusInfo] = useState<FonnteDeviceStatus | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [scanTargetType, setScanTargetType] = useState<'siswa' | 'guru' | 'staf'>('siswa');
  const [scanMode, setScanMode] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [autoSendWA, setAutoSendWA] = useState<boolean>(true);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [lastScannedResult, setLastScannedResult] = useState<{
    nama: string;
    role: string;
    kode: string;
    waktu: string;
    detail: string;
    teleponWali?: string;
    namaWali?: string;
    tipeAbsensi?: 'Masuk' | 'Pulang';
    siswaObj?: Siswa;
    waSentStatus?: string;
    isUnknown?: boolean;
  } | null>(null);

  const [scanHistory, setScanHistory] = useState<Array<{
    nama: string;
    role: string;
    kode: string;
    waktu: string;
    tipeAbsensi?: 'Masuk' | 'Pulang';
    teleponWali?: string;
    namaWali?: string;
    siswaObj?: Siswa;
    isUnknown?: boolean;
  }>>([]);

  // --- Attendance WA Template Redaksi States & Helpers ---
  const defaultAbsensiMasukText = `*PRESENSI SEKOLAH - NOTIFIKASI MASUK*\n\nYth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),\n\nKami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *HADIR & MELAKUKAN PRESENSI MASUK* di sekolah pada:\n🗓 Tanggal: *{TANGGAL}*\n⏰ Jam Scan: *{JAM_SCAN} WIB*\n📍 Status: *{STATUS_KEHADIRAN}*\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu Wali Murid.\n\n_{NAMA_SEKOLAH}_`;

  const defaultAbsensiPulangText = `*PRESENSI SEKOLAH - NOTIFIKASI PULANG*\n\nYth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),\n\nKami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *SELESAI KBM & PRESENSI PULANG* dari sekolah pada:\n🗓 Tanggal: *{TANGGAL}*\n⏰ Jam Scan: *{JAM_SCAN} WIB*\n📍 Status: *{STATUS_KEHADIRAN}*\n\nTerima kasih dan selamat beristirahat.\n\n_{NAMA_SEKOLAH}_`;

  const [localTemplateAbsensiMasuk, setLocalTemplateAbsensiMasuk] = useState(schoolSettings?.fonnteConfig?.templateAbsensiMasuk || defaultAbsensiMasukText);
  const [localTemplateAbsensiPulang, setLocalTemplateAbsensiPulang] = useState(schoolSettings?.fonnteConfig?.templateAbsensiPulang || defaultAbsensiPulangText);
  const [activeRedaksiTab, setActiveRedaksiTab] = useState<'masuk' | 'pulang'>('masuk');
  const [redaksiSaveSuccessMsg, setRedaksiSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (schoolSettings?.fonnteConfig?.templateAbsensiMasuk) {
      setLocalTemplateAbsensiMasuk(schoolSettings.fonnteConfig.templateAbsensiMasuk);
    }
    if (schoolSettings?.fonnteConfig?.templateAbsensiPulang) {
      setLocalTemplateAbsensiPulang(schoolSettings.fonnteConfig.templateAbsensiPulang);
    }
  }, [schoolSettings]);

  const formatWhatsAppMarkdown = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Asterisks for bold: *text* -> <strong class="font-extrabold text-slate-900">text</strong>
    html = html.replace(/\*([^*]+)\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
    
    // Underscores for italics: _text_ -> <em class="italic text-slate-600">text</em>
    html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-600">$1</em>');

    return html;
  };

  const parseWaTemplateAbsensi = (
    template: string,
    vars: {
      NAMA_SISWA: string;
      KELAS: string;
      TANGGAL: string;
      JAM_SCAN: string;
      STATUS_KEHADIRAN: string;
      NAMA_SEKOLAH: string;
    }
  ) => {
    let result = template;
    Object.entries(vars).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{${key}}`, 'gi'), val);
    });
    return result;
  };

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
          autoSendKeuangan: true,
          templateReminder: '',
          templateReceipt: ''
        }),
        templateAbsensiMasuk: localTemplateAbsensiMasuk,
        templateAbsensiPulang: localTemplateAbsensiPulang
      }
    }));
    setRedaksiSaveSuccessMsg("Redaksi notifikasi WhatsApp Presensi berhasil disimpan!");
    setTimeout(() => setRedaksiSaveSuccessMsg(null), 3000);
  };

  const handleResetTemplate = () => {
    if (activeRedaksiTab === 'masuk') {
      setLocalTemplateAbsensiMasuk(defaultAbsensiMasukText);
    } else {
      setLocalTemplateAbsensiPulang(defaultAbsensiPulangText);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const elId = activeRedaksiTab === 'masuk' ? 'template_masuk_input' : 'template_pulang_input';
    const textarea = document.getElementById(elId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeRedaksiTab === 'masuk' ? localTemplateAbsensiMasuk : localTemplateAbsensiPulang;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;

    if (activeRedaksiTab === 'masuk') {
      setLocalTemplateAbsensiMasuk(newText);
    } else {
      setLocalTemplateAbsensiPulang(newText);
    }

    // Restore focus and cursor selection range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Helper to send WhatsApp Notification using Fonnte API Token
  const sendWhatsAppNotif = async (siswa: Siswa, waktu: string, tipe: 'Masuk' | 'Pulang') => {
    if (!siswa.teleponWali || !siswa.teleponWali.trim()) {
      alert(`Nomor WhatsApp/Telepon wali untuk ${siswa.nama} belum terdaftar di database.`);
      return;
    }

    const tokenToUse = schoolSettings?.fonnteToken || localFonnteToken || 'FONNTE_EDU_TOKEN_2026_SMP_MODERN_AL_FAKHIR';
    const config = schoolSettings?.fonnteConfig;
    const namaSekolah = schoolSettings?.namaSekolah || 'SMP Modern Al Fakhir';

    const tanggalIndo = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const statusInfo = calculateAttendanceStatusLabel(waktu, tipe, 'siswa');

    let message = '';
    const template = tipe === 'Masuk' ? config?.templateAbsensiMasuk : config?.templateAbsensiPulang;
    if (template && template.trim()) {
      message = template
        .replace(/{NAMA_SISWA}/g, siswa.nama)
        .replace(/{KELAS}/g, siswa.kelas)
        .replace(/{JAM_SCAN}/g, waktu)
        .replace(/{TANGGAL}/g, tanggalIndo)
        .replace(/{STATUS_KEHADIRAN}/g, statusInfo.label)
        .replace(/{NAMA_SEKOLAH}/g, namaSekolah);
    } else {
      if (tipe === 'Masuk') {
        message = `*PRESENSI SEKOLAH - NOTIFIKASI HADIR MASUK*\n\n` +
          `Yth. Bapak/Ibu Wali dari *${siswa.nama}* (*Kelas ${siswa.kelas}*),\n\n` +
          `Kami menginformasikan bahwa siswa/i atas nama *${siswa.nama}* telah *PRESENSI HADIR MASUK* di sekolah pada:\n` +
          `🗓 Tanggal: *${tanggalIndo}*\n` +
          `⏰ Jam Scan: *${waktu} WIB*\n` +
          `📍 Status: *${statusInfo.label}*\n\n` +
          `Terima kasih atas perhatian dan kerja sama Bapak/Ibu Wali Murid.\n\n` +
          `_${namaSekolah}_`;
      } else {
        message = `*PRESENSI SEKOLAH - NOTIFIKASI PULANG*\n\n` +
          `Yth. Bapak/Ibu Wali dari *${siswa.nama}* (*Kelas ${siswa.kelas}*),\n\n` +
          `Kami menginformasikan bahwa siswa/i atas nama *${siswa.nama}* telah *SELESAI KBM & PRESENSI PULANG* dari sekolah pada:\n` +
          `🗓 Tanggal: *${tanggalIndo}*\n` +
          `⏰ Jam Scan: *${waktu} WIB*\n` +
          `📍 Status: *${statusInfo.label}*\n\n` +
          `Terima kasih dan selamat beristirahat.\n\n` +
          `_${namaSekolah}_`;
      }
    }

    // Direct automated call to Fonnte API Gateway
    const res = await sendFonnteMessage(siswa.teleponWali, message, tokenToUse);
    setLastScannedResult(prev => prev ? { ...prev, waSentStatus: res.message } : null);
  };

  // Synthesize Web Audio Beep Sound
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 note
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignore audio autoplay restrictions
    }
  };

  const handleExecuteScan = (codeToScan: string) => {
    let rawCode = codeToScan.trim();
    if (!rawCode) return;

    // Smart Parsing: extract ID from complex strings (e.g. "Nama: Giar | ID: gur-123")
    let code = rawCode;
    if (rawCode.includes('ID:')) {
      const parts = rawCode.split('ID:');
      if (parts.length > 1) {
        code = parts[1].split('|')[0].trim();
      }
    } else if (rawCode.includes('|')) {
      const parts = rawCode.split('|');
      // Try to find part with SIS-, GUR-, or STF- prefix
      const prefixedPart = parts.find(p => {
        const up = p.trim().toUpperCase();
        return up.startsWith('SIS-') || up.startsWith('GUR-') || up.startsWith('STF-');
      });
      if (prefixedPart) {
        code = prefixedPart.trim();
      }
    }

    // Detect prefix and automatically switch scanTargetType to ensure flawless mapping
    let currentTargetType = scanTargetType;
    const upperCode = code.toUpperCase();
    
    if (upperCode.startsWith('SIS-')) {
      currentTargetType = 'siswa';
      setScanTargetType('siswa');
    } else if (upperCode.startsWith('GUR-')) {
      currentTargetType = 'guru';
      setScanTargetType('guru');
    } else if (upperCode.startsWith('STF-')) {
      currentTargetType = 'staf';
      setScanTargetType('staf');
    }

    playBeepSound();
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    // Cross-check: find in siswa, guru, or staf list to prevent tab mismatch issues
    const foundSiswa = siswaList.find(s => 
      (s.kodeBarcode && s.kodeBarcode.toLowerCase() === code.toLowerCase()) ||
      s.nisn === code ||
      s.nis === code ||
      `SIS-${s.nisn}`.toLowerCase() === code.toLowerCase() ||
      `SIS-${s.nis}`.toLowerCase() === code.toLowerCase() ||
      s.nama.toLowerCase() === code.toLowerCase()
    );

    const foundGuru = guruList.find(g => 
      (g.kodeBarcode && g.kodeBarcode.toLowerCase() === code.toLowerCase()) ||
      (g.nik && g.nik === code) ||
      (g.nik && `GUR-${g.nik}`.toLowerCase() === code.toLowerCase()) ||
      g.nip === code ||
      `GUR-${g.nip}`.toLowerCase() === code.toLowerCase() ||
      g.id === code ||
      `GUR-${g.id}`.toLowerCase() === code.toLowerCase() ||
      g.nama.toLowerCase() === code.toLowerCase()
    );

    const foundStaf = stafList.find(s => 
      (s.kodeBarcode && s.kodeBarcode.toLowerCase() === code.toLowerCase()) ||
      (s.nik && s.nik === code) ||
      (s.nik && `STF-${s.nik}`.toLowerCase() === code.toLowerCase()) ||
      s.id === code ||
      `STF-${s.id}`.toLowerCase() === code.toLowerCase() ||
      s.nama.toLowerCase() === code.toLowerCase()
    );

    // Process based on who was actually found (prioritizing the detected currentTargetType)
    let processed = false;

    if (foundSiswa && (currentTargetType === 'siswa' || (!foundGuru && !foundStaf))) {
      setScanTargetType('siswa');
      processSiswaScan(foundSiswa, timeNow, today);
      processed = true;
    } else if (foundGuru && (currentTargetType === 'guru' || (!foundSiswa && !foundStaf))) {
      setScanTargetType('guru');
      processGuruScan(foundGuru, timeNow, today);
      processed = true;
    } else if (foundStaf && (currentTargetType === 'staf' || (!foundSiswa && !foundGuru))) {
      setScanTargetType('staf');
      processStafScan(foundStaf, timeNow, today);
      processed = true;
    } else {
      // Final specific check if not processed yet
      if (foundSiswa) {
        setScanTargetType('siswa');
        processSiswaScan(foundSiswa, timeNow, today);
        processed = true;
      } else if (foundGuru) {
        setScanTargetType('guru');
        processGuruScan(foundGuru, timeNow, today);
        processed = true;
      } else if (foundStaf) {
        setScanTargetType('staf');
        processStafScan(foundStaf, timeNow, today);
        processed = true;
      }
    }

    // Fallback: If code is not found in any database list, STILL display it in "Hasil Scan Terakhir" as requested!
    if (!processed) {
      const fallbackResult = {
        nama: `ID / Kartu: ${rawCode.length > 30 ? rawCode.substring(0, 30) + '...' : rawCode}`,
        role: `KARTU TIDAK DIKENAL`,
        kode: code,
        waktu: timeNow,
        detail: `Pemindaian sukses, namun kode "${code}" belum terdaftar di Database ${upperCode.startsWith('GUR-') ? 'GURU' : upperCode.startsWith('STF-') ? 'STAF' : 'SISWA'}.`,
        tipeAbsensi: scanMode,
        isUnknown: true
      };
      setLastScannedResult(fallbackResult);
      setScanHistory(prev => [fallbackResult, ...prev]);
      showToast(`ID / Barcode "${code}" tidak dikenal!`, 'error');
    }

    setBarcodeInput('');
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  };

  // Logic to get separate status for Masuk and Pulang
  const getDualStatus = (a: AbsensiGuru, userType: 'guru' | 'staf' = 'guru') => {
    const statusMasuk = { label: '-', color: 'text-slate-400' };
    const statusPulang = { label: '-', color: 'text-slate-400' };

    if (a.status !== 'Hadir') {
      const color = a.status === 'Izin' ? 'bg-amber-100 text-amber-800' : a.status === 'Sakit' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800';
      return { 
        masuk: { label: a.status, color }, 
        pulang: { label: a.status, color } 
      };
    }

    if (a.jamMasuk) {
      const res = calculateAttendanceStatusLabel(a.jamMasuk, 'Masuk', userType);
      statusMasuk.label = res.label;
      statusMasuk.color = res.isLate ? 'bg-rose-100 text-rose-800' : res.label.includes('Toleransi') ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
    } else {
      statusMasuk.label = 'Tanpa Scan';
      statusMasuk.color = 'bg-slate-100 text-slate-500';
    }

    if (a.jamKeluar) {
      const res = calculateAttendanceStatusLabel(a.jamKeluar, 'Pulang', userType);
      statusPulang.label = res.label;
      statusPulang.color = res.label.includes('Pulang Cepat') ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800';
    } else {
      statusPulang.label = 'Tanpa Scan';
      statusPulang.color = 'bg-slate-100 text-slate-500';
    }

    return { masuk: statusMasuk, pulang: statusPulang };
  };

  // Helper scan processors to keep code modular and readable
  const processSiswaScan = (siswa: Siswa, timeNow: string, today: string) => {
    const statusInfo = calculateAttendanceStatusLabel(timeNow, scanMode, 'siswa');
    const locationStr = gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Mesin Scan Barcode Utama';

    setAbsensiHarian(prev => {
      const existing = prev.find(a => a.siswaId === siswa.id && a.tanggal === today);
      const filtered = prev.filter(a => !(a.siswaId === siswa.id && a.tanggal === today));
      return [
        {
          id: `abh-${siswa.id}-${today}`,
          siswaId: siswa.id,
          tanggal: today,
          status: statusInfo.isLate ? 'Terlambat' : 'Hadir',
          jamScan: timeNow,
          jamMasuk: scanMode === 'Masuk' ? timeNow : (existing?.jamMasuk || timeNow),
          jamPulang: scanMode === 'Pulang' ? timeNow : existing?.jamPulang,
          tipeScan: scanMode,
          metodeScan: 'Barcode / QR',
          lokasiScan: locationStr,
          // // // koordinatGps: gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined
        },
        ...filtered
      ];
    });

    const res = {
      nama: siswa.nama,
      role: `Siswa Kelas ${siswa.kelas}`,
      kode: siswa.kodeBarcode || `SIS-${siswa.nisn}`,
      waktu: timeNow,
      detail: `NISN: ${siswa.nisn} | Status: ${statusInfo.label} | Lokasi: ${gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Terhubung'}`,
      teleponWali: siswa.teleponWali,
      namaWali: siswa.namaWali,
      tipeAbsensi: scanMode,
      siswaObj: siswa
    };
    setLastScannedResult(res);
    setScanHistory(prev => [res, ...prev]);
    showToast(`Presensi ${scanMode} Berhasil: ${siswa.nama} (${statusInfo.label})`, 'success');

    if (autoSendWA && siswa.teleponWali) {
      sendWhatsAppNotif(siswa, timeNow, scanMode);
    }
  };

  const processGuruScan = (guru: Guru, timeNow: string, today: string) => {
    const statusInfo = calculateAttendanceStatusLabel(timeNow, scanMode, 'guru');
    const locationStr = gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Mesin Scan Barcode Utama';
    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === guru.id && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        if (scanMode === 'Pulang') {
          updated[existingIndex].jamKeluar = timeNow;
          updated[existingIndex].metodeOut = 'Barcode / QR';
          updated[existingIndex].lokasiOut = locationStr;
        } else {
          updated[existingIndex].jamMasuk = timeNow;
          updated[existingIndex].status = 'Hadir';
          updated[existingIndex].statusIzin = 'Disetujui';
          updated[existingIndex].metodeIn = 'Barcode / QR';
          updated[existingIndex].lokasiIn = locationStr;
        }
        updated[existingIndex].koordinatGps = gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined;
        return updated;
      } else {
        const record: any = {
          id: `abg-${Date.now()}`,
          guruId: guru.id,
          guruNama: guru.nama,
          tanggal: today,
          status: 'Hadir',
          statusIzin: 'Disetujui',
          lokasiIn: locationStr,
          metodeIn: 'Barcode / QR',
          // // // koordinatGps: gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined
        };
        if (scanMode === 'Masuk') {
          record.jamMasuk = timeNow;
        } else if (scanMode === 'Pulang') {
          record.jamKeluar = timeNow;
          record.lokasiOut = locationStr;
        }
        return [record, ...prev];
      }
    });

    const res = {
      nama: guru.nama,
      role: `Guru ${guru.mataPelajaran}`,
      kode: guru.kodeBarcode || `GUR-${guru.nip}`,
      waktu: timeNow,
      detail: `NIP: ${guru.nip} | Status: ${guru.status} | Lokasi: ${gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Terhubung'}`,
      tipeAbsensi: scanMode
    };
    setLastScannedResult(res);
    setScanHistory(prev => [res, ...prev]);
    showToast(`Presensi ${scanMode} Guru Berhasil: ${guru.nama}`, 'success');
  };

  const processStafScan = (staf: Staf, timeNow: string, today: string) => {
    const statusInfo = calculateAttendanceStatusLabel(timeNow, scanMode, 'staf');
    const locationStr = gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Mesin Scan Barcode Utama';
    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === staf.id && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        if (scanMode === 'Pulang') {
          updated[existingIndex].jamKeluar = timeNow;
          updated[existingIndex].metodeOut = 'Barcode / QR';
          updated[existingIndex].lokasiOut = locationStr;
        } else {
          updated[existingIndex].jamMasuk = timeNow;
          updated[existingIndex].status = 'Hadir';
          updated[existingIndex].statusIzin = 'Disetujui';
          updated[existingIndex].metodeIn = 'Barcode / QR';
          updated[existingIndex].lokasiIn = locationStr;
        }
        updated[existingIndex].koordinatGps = gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined;
        return updated;
      } else {
        const record: any = {
          id: `abg-${Date.now()}`,
          guruId: staf.id,
          guruNama: staf.nama,
          tanggal: today,
          status: 'Hadir',
          statusIzin: 'Disetujui',
          lokasiIn: locationStr,
          metodeIn: 'Barcode / QR',
          // // // koordinatGps: gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined
        };
        if (scanMode === 'Masuk') {
          record.jamMasuk = timeNow;
        } else if (scanMode === 'Pulang') {
          record.jamKeluar = timeNow;
          record.lokasiOut = locationStr;
        }
        return [record, ...prev];
      }
    });

    const res = {
      nama: staf.nama,
      role: `Staf / Tata Usaha (${staf.bagian})`,
      kode: staf.nik || staf.id,
      waktu: timeNow,
      detail: `NIK: ${staf.nik} | Bagian: ${staf.bagian} | Lokasi: ${gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Terhubung'}`,
      tipeAbsensi: scanMode
    };
    setLastScannedResult(res);
    setScanHistory(prev => [res, ...prev]);
    showToast(`Presensi ${scanMode} Staf Berhasil: ${staf.nama}`, 'success');
  };

  // Automated Simulation Effect for Automatic Scanning
  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (scanTargetType === 'siswa') {
        if (siswaList.length === 0) return;
        const randomIdx = Math.floor(Math.random() * siswaList.length);
        const randomSiswa = siswaList[randomIdx];
        handleExecuteScan(randomSiswa.kodeBarcode || `SIS-${randomSiswa.nisn}`);
      } else if (scanTargetType === 'guru') {
        if (guruList.length === 0) return;
        const randomIdx = Math.floor(Math.random() * guruList.length);
        const randomGuru = guruList[randomIdx];
        handleExecuteScan(randomGuru.kodeBarcode || `GUR-${randomGuru.nip}`);
      } else {
        if (stafList.length === 0) return;
        const randomIdx = Math.floor(Math.random() * stafList.length);
        const randomStaf = stafList[randomIdx];
        handleExecuteScan(randomStaf.nik || randomStaf.id);
      }
    }, 5000); // scan automatically every 5 seconds

    return () => clearInterval(interval);
  }, [autoSimulate, scanTargetType, siswaList, guruList, stafList, scanMode]);

  // Dynamic list of available classes strictly from rombelList database
  const availableKelasOptions = useMemo(() => {
    const rawSet = new Set<string>();
    rombelList.forEach(r => { 
      if (r.namaRombel && r.namaRombel.trim()) {
        rawSet.add(r.namaRombel.trim()); 
      } 
    });

    if (rawSet.size === 0) {
      ['VII - Ibnu Sina', 'VII - Ibnu Khaldun', 'VII - Ibnu Al Haytam', 'VIII - Al Kindi', 'VIII - Al Khawarizmi', 'VIII - Al Farabi', 'VIII - Al Biruni', 'IX - Umar bin Khattab', 'IX - Utsman bin Affan'].forEach(k => rawSet.add(k));
    }

    return Array.from(rawSet).sort((a, b) => {
      const getGrade = (s: string) => {
        if (s.startsWith('VII -') || s.startsWith('7 -')) return 7;
        if (s.startsWith('VIII -') || s.startsWith('8 -')) return 8;
        if (s.startsWith('IX -') || s.startsWith('9 -')) return 9;
        return 99;
      };
      const gradeA = getGrade(a);
      const gradeB = getGrade(b);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [rombelList]);

  // --- Subtab 1: Absensi Siswa Harian State ---
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedKelas, setSelectedKelas] = useState(() => availableKelasOptions[0] || 'VIII - Al Biruni');
  const [selectedTanggal, setSelectedTanggal] = useState(todayDateStr);

  // Auto ensure selectedKelas is valid if available options change
  useEffect(() => {
    if (availableKelasOptions.length > 0 && (!selectedKelas || selectedKelas === 'X-IPA-1' || !availableKelasOptions.includes(selectedKelas))) {
      setSelectedKelas(availableKelasOptions[0]);
    }
  }, [availableKelasOptions, selectedKelas]);

  // Memoized student list for Subtab 1 (Absensi Harian)
  const classSiswaList = useMemo(() => {
    if (!selectedKelas) return [];
    const target = selectedKelas.trim().toLowerCase();
    return siswaList.filter(s => s.kelas && s.kelas.trim().toLowerCase() === target);
  }, [siswaList, selectedKelas]);

  // Local state for batch editing daily attendance
  const [localHarianState, setLocalHarianState] = useState<Record<string, StatusAbsensi | 'Terlambat'>>({});

  // Sync localHarianState whenever selectedKelas or selectedTanggal changes
  useEffect(() => {
    const map: Record<string, StatusAbsensi | 'Terlambat'> = {};
    classSiswaList.forEach(s => {
      const existing = absensiHarian.find(a => a.siswaId === s.id && a.tanggal === selectedTanggal);
      map[s.id] = existing ? existing.status : 'Hadir';
    });
    setLocalHarianState(map);
  }, [selectedKelas, selectedTanggal, classSiswaList, absensiHarian]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveHarian = () => {
    if (classSiswaList.length === 0) {
      alert(`Tidak ada data siswa di kelas ${selectedKelas} untuk disimpan.`);
      return;
    }

    const newRecords: AbsensiSiswaHarian[] = [];
    classSiswaList.forEach(s => {
      const status = localHarianState[s.id] || 'Hadir';
      newRecords.push({
        id: `abh-${s.id}-${selectedTanggal}`,
        siswaId: s.id,
        tanggal: selectedTanggal,
        status: status
      });
    });

    setAbsensiHarian(prev => {
      const currentSiswaIds = new Set(classSiswaList.map(s => s.id));
      const filtered = prev.filter(a => !(a.tanggal === selectedTanggal && currentSiswaIds.has(a.siswaId)));
      return [...filtered, ...newRecords];
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // --- Subtab 3: Absensi Guru Clock In / Clock Out & Izin ---
  const [guruClockStatus, setGuruClockStatus] = useState<string | null>(null);
  const [showFormIzin, setShowFormIzin] = useState(false);
  const [formIzinGuruId, setFormIzinGuruId] = useState('gur-01');
  const [formIzinKet, setFormIzinKet] = useState('');

  const handleClockIn = (guruId: string) => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];
    const locationStr = gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Aplikasi Presensi Mandiri';

    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === guruId && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].jamMasuk = timeNow;
        updated[existingIndex].status = 'Hadir';
        updated[existingIndex].statusIzin = 'Disetujui';
        updated[existingIndex].metodeIn = 'Aplikasi Web' as any;
        updated[existingIndex].lokasiIn = locationStr;
        updated[existingIndex].koordinatGps = gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined;
        return updated;
      } else {
        const guru = guruList.find(g => g.id === guruId);
        return [
          {
            id: `abg-${Date.now()}`,
            guruId,
            guruNama: guru?.nama || 'Guru',
            tanggal: today,
            jamMasuk: timeNow,
            status: 'Hadir',
            statusIzin: 'Disetujui',
            metodeIn: 'Aplikasi Web' as any,
            lokasiIn: locationStr,
            // // // koordinatGps: gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined
          },
          ...prev
        ];
      }
    });

    setGuruClockStatus(`Clock-IN Berhasil pada jam ${timeNow}!`);
    setTimeout(() => setGuruClockStatus(null), 4000);
  };

  const handleClockOut = (guruId: string) => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];
    const locationStr = gpsCoords ? getFriendlyLocationName(gpsCoords.lat, gpsCoords.lng) : 'Aplikasi Presensi Mandiri';

    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === guruId && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].jamKeluar = timeNow;
        updated[existingIndex].metodeOut = 'Aplikasi Web' as any;
        updated[existingIndex].lokasiOut = locationStr;
        updated[existingIndex].koordinatGps = gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : undefined;
        return updated;
      }
      return prev;
    });

    setGuruClockStatus(`Clock-OUT Berhasil pada jam ${timeNow}!`);
    setTimeout(() => setGuruClockStatus(null), 4000);
  };

  const handlePengajuanIzin = (e: React.FormEvent) => {
    e.preventDefault();
    const guru = guruList.find(g => g.id === formIzinGuruId);
    const today = new Date().toISOString().split('T')[0];

    const newIzin: AbsensiGuru = {
      id: `abg-iz-${Date.now()}`,
      guruId: formIzinGuruId,
      guruNama: guru?.nama || 'Guru',
      tanggal: today,
      status: 'Izin',
      keteranganIzin: formIzinKet,
      statusIzin: 'Pending'
    };

    setAbsensiGuruList(prev => [newIzin, ...prev]);
    setShowFormIzin(false);
    setFormIzinKet('');
    alert('Pengajuan izin berhasil dikirim. Menunggu persetujuan Kepala Sekolah.');
  };

  const handleApproveIzin = (id: string, newStatus: 'Disetujui' | 'Ditolak') => {
    setAbsensiGuruList(prev => prev.map(a => a.id === id ? { ...a, statusIzin: newStatus } : a));
  };

  const handleDeleteGuruRecords = (ids: string[], forceConfirm: boolean = false) => {
    // Show confirmation if forced or if deleting multiple items
    if (forceConfirm || ids.length > 1) {
      if (!confirm(`Yakin ingin menghapus ${ids.length} data terpilih?`)) return;
    }
    
    // Perform deletion
    setAbsensiGuruList(prev => prev.filter(a => !ids.includes(a.id)));
    
    // Clear selection
    setSelectedGuruIds(prev => prev.filter(id => !ids.includes(id)));
    
    // Feedback
    showToast(`${ids.length} data berhasil dihapus`, 'success');
  };

  const toggleSelectGuru = (id: string) => {
    setSelectedGuruIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllGuru = () => {
    if (selectedGuruIds.length === absensiGuruList.length) {
      setSelectedGuruIds([]);
    } else {
      setSelectedGuruIds(absensiGuruList.map(a => a.id));
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-down max-w-sm">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 text-white ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 shadow-emerald-950/50' :
            toast.type === 'error' ? 'bg-red-600 border-red-500 shadow-red-950/50' :
            'bg-blue-600 border-blue-500 shadow-blue-950/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Top Navigation - shown for non-kepsek roles since PerizinanView has its own full executive header */}
      {currentRole !== 'kepsek' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-5 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-400" /> Presensi & Absensi Terpadu
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pencatatan absensi harian siswa, kehadiran kelas per mata pelajaran, dan presensi guru.
            </p>
          </div>

          {/* Current Active Subtab Badge */}
          <div className="flex items-center gap-2 bg-[#181818] px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Submenu:</span>
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              {subTab === 'scan_barcode' && <><QrCode className="w-3.5 h-3.5" /> Scan Barcode / QR</>}
              {subTab === 'harian_siswa' && <><CalendarCheck className="w-3.5 h-3.5" /> Absensi Harian Siswa</>}
              {subTab === 'jurnal_guru' && <><BookOpen className="w-3.5 h-3.5" /> Jurnal Guru</>}
              {subTab === 'absensi_guru' && <><UserCheck className="w-3.5 h-3.5" /> Presensi Guru</>}
              {subTab === 'redaksi' && <><MessageSquare className="w-3.5 h-3.5" /> Redaksi Notifikasi WA</>}
              {subTab === 'perizinan' && <><FileSignature className="w-3.5 h-3.5" /> Pengajuan Izin / Cuti</>}
            </span>
          </div>
        </div>
      )}

      {/* SUBTAB 0: SCAN BARCODE / QR ABSENSI (Admin only) */}
      {subTab === 'scan_barcode' && (currentRole === 'admin' || currentRole === 'petugas_absensi') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Barcode Scanner Interface */}
          <div className="lg:col-span-2 bg-[#121212] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-blue-400" /> Scanner Barcode & QR Code Presensi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Arahkan barcode / QR dari Kartu ID Siswa atau Guru ke kamera scanner
                </p>
              </div>

              {/* Mode Tipe Presensi (Masuk vs Pulang) */}
              <div className="flex items-center gap-1.5 bg-[#181818] p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setScanMode('Masuk')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    scanMode === 'Masuk'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('Pulang')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    scanMode === 'Pulang'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" /> Pulang
                </button>
              </div>
            </div>

            {/* GPS Geotagging Status & Refresh Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-950/20 p-3 rounded-xl border border-blue-500/30 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${gpsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : gpsStatus === 'fetching' ? 'bg-amber-500 animate-ping' : 'bg-red-500'}`} />
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-bold text-blue-200">GPS Geotagging:</span>{' '}
                  <span className="text-slate-300 font-mono text-[11px]">{gpsAddress}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {gpsStatus === 'error' && (
                  <button
                    type="button"
                    onClick={() => {
                      setGpsCoords({ lat: -6.2415, lng: 106.8045, accuracy: 5 });
                      setGpsStatus('connected');
                      setGpsAddress('Sekolah Islam Modern Al Fakhir (Manual)');
                      showToast('Menggunakan Lokasi Sekolah secara manual', 'success');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Paksa Lokasi Sekolah
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchGpsLocation}
                  disabled={gpsStatus === 'fetching'}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gpsStatus === 'fetching' ? 'animate-spin' : ''}`} />
                  <span>{gpsStatus === 'fetching' ? 'Mendapatkan GPS...' : 'Refresh GPS'}</span>
                </button>
              </div>
            </div>

            {/* Target Selector & WA Config Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Target Scan:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScanTargetType('siswa')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      scanTargetType === 'siswa' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanTargetType('guru')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      scanTargetType === 'guru' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Guru
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanTargetType('staf')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      scanTargetType === 'staf' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Staf
                  </button>
                </div>
              </div>

              {/* WhatsApp Notification Auto-send Toggle & Token Setting */}
              {scanTargetType === 'siswa' && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-300 font-semibold transition-all">
                    <input
                      type="checkbox"
                      checked={autoSendWA}
                      onChange={e => setAutoSendWA(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto WA Notif ({scanMode})</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowFonnteModal(true)}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    title="Pengaturan Token Fonnte WhatsApp"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Token Fonnte Active
                  </button>
                </div>
              )}

              {/* Simulation Mode Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoSimulate(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                    autoSimulate
                      ? 'bg-amber-600 border-amber-500/50 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Simulasikan pemindaian kartu secara otomatis setiap 5 detik"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${autoSimulate ? 'animate-spin text-amber-300' : 'text-amber-500'}`} />
                  <span>{autoSimulate ? 'Simulasi Auto Scan Aktif (5s)' : 'Simulasi Auto Scan'}</span>
                </button>
              </div>
            </div>

            {/* Active Presensi Schedule Info Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#181818] px-4 py-2.5 rounded-xl border border-blue-500/30 text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-blue-400" /> Jadwal {scanTargetType === 'siswa' ? 'Siswa' : 'Guru & Staf'}:
                </span>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <LogIn className="w-3 h-3 text-emerald-400" /> Masuk: {scanTargetType === 'siswa' ? (schoolSettings?.jadwalPresensi?.jamMasuk || localJadwal.jamMasuk) : (schoolSettings?.jadwalPresensi?.jamMasukGuru || localJadwal.jamMasukGuru || '06:45')} WIB
                  </span>
                  <span className="bg-amber-950/60 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-md font-bold">
                    Toleransi: {scanTargetType === 'siswa' ? (schoolSettings?.jadwalPresensi?.jamToleransi || localJadwal.jamToleransi) : (schoolSettings?.jadwalPresensi?.jamToleransiGuru || localJadwal.jamToleransiGuru || '07:00')} WIB
                  </span>
                  <span className="bg-blue-950/60 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <LogOut className="w-3 h-3 text-blue-400" /> Pulang: {scanTargetType === 'siswa' ? (schoolSettings?.jadwalPresensi?.jamPulang || localJadwal.jamPulang) : (schoolSettings?.jadwalPresensi?.jamPulangGuru || localJadwal.jamPulangGuru || '15:00')} WIB
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowJadwalModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 shrink-0"
              >
                <Clock className="w-3.5 h-3.5" /> Atur Jam Masuk & Pulang
              </button>
            </div>

            {/* Live Camera Barcode & QR Scanner */}
            <CameraScanner 
              scanTargetType={scanTargetType} 
              onScanSuccess={(code) => handleExecuteScan(code)} 
            />

            {/* Manual / Scanner Input Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Input Manual {scanTargetType === 'siswa' ? 'NISN/NIS' : 'NIK'} / Scan Barcode:
              </label>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleExecuteScan(barcodeInput);
                }}
                className="flex gap-2"
              >
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder={scanTargetType === 'siswa' ? 'Contoh: NISN / NIS' : 'Contoh: NIK (320xxxxxxxxxxxxx)'}
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  autoFocus
                  className="flex-1 bg-[#181818] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <ScanLine className="w-4 h-4" /> Process Scan
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Scan Result Card & Log */}
          <div className="space-y-4">
            
            {/* Last Scanned Box */}
            <div className="bg-[#121212] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-400" /> Hasil Scan Terakhir
                </span>
                <div className="flex items-center gap-2">
                  {scanHistory.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Bersihkan semua riwayat scan?')) setScanHistory([]);
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Bersihkan
                    </button>
                  )}
                  {lastScannedResult?.tipeAbsensi && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      lastScannedResult.isUnknown
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : lastScannedResult.tipeAbsensi === 'Masuk'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {lastScannedResult.isUnknown ? 'UNREGISTERED' : lastScannedResult.tipeAbsensi.toUpperCase()}
                    </span>
                  )}
                </div>
              </h4>

              {lastScannedResult ? (
                <div className={`p-4 rounded-xl space-y-3 border ${
                  lastScannedResult.isUnknown
                    ? 'bg-red-950/25 border-red-900/40'
                    : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded border ${
                      lastScannedResult.isUnknown
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : lastScannedResult.tipeAbsensi === 'Pulang'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {lastScannedResult.isUnknown ? 'KARTU TIDAK DIKENAL' : `PRESENSI ${lastScannedResult.tipeAbsensi ? lastScannedResult.tipeAbsensi.toUpperCase() : 'BERHASIL'}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{lastScannedResult.waktu}</span>
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${lastScannedResult.isUnknown ? 'text-red-400' : 'text-white'}`}>
                      {lastScannedResult.nama}
                    </h3>
                    <p className={`text-xs font-semibold ${lastScannedResult.isUnknown ? 'text-slate-400' : 'text-blue-400'}`}>
                      {lastScannedResult.role}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">{lastScannedResult.detail}</p>
                  </div>

                  {/* Send WhatsApp Notification Button */}
                  {lastScannedResult.siswaObj && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Kontak Orang Tua / Wali:</span>
                        <span className="font-mono text-emerald-400 font-bold">{lastScannedResult.teleponWali || 'Tidak Ada No. HP'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => lastScannedResult.siswaObj && sendWhatsAppNotif(lastScannedResult.siswaObj, lastScannedResult.waktu, lastScannedResult.tipeAbsensi || 'Masuk')}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white/20" />
                        Kirim WA Notif {lastScannedResult.tipeAbsensi || 'Presensi'} ke Orang Tua
                      </button>
                    </div>
                  )}

                  {lastScannedResult.isUnknown && (
                    <div className="pt-2 border-t border-red-900/30 text-center">
                      <span className="text-[9px] text-red-400 font-semibold italic">
                        *Daftarkan kode barcode ini di menu Database Sekolah agar terbaca otomatis.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-[#181818] rounded-xl text-center text-slate-500 text-xs border border-slate-800">
                  Belum ada data barcode yang di-scan.
                </div>
              )}
            </div>

            {/* Scan History Log */}
            <div className="bg-[#121212] rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3 max-h-80 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Log Riwayat Scan Hari Ini</h4>
              <div className="space-y-2">
                {scanHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Belum ada riwayat scan.</p>
                ) : (
                  scanHistory.map((item, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs gap-2 ${
                      item.isUnknown 
                        ? 'bg-red-950/10 border-red-900/20' 
                        : 'bg-[#181818] border-slate-800/80'
                    }`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold truncate ${item.isUnknown ? 'text-red-400' : 'text-white'}`}>{item.nama}</span>
                          {item.tipeAbsensi && (
                            <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
                              item.isUnknown
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.tipeAbsensi === 'Pulang'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.isUnknown ? 'UNKNOWN' : item.tipeAbsensi}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.role}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className={`font-mono font-bold text-[11px] ${item.isUnknown ? 'text-red-400' : 'text-emerald-400'}`}>{item.waktu}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{item.kode}</div>
                        </div>

                        {item.siswaObj && item.teleponWali && !item.isUnknown && (
                          <button
                            type="button"
                            onClick={() => sendWhatsAppNotif(item.siswaObj!, item.waktu, item.tipeAbsensi || 'Masuk')}
                            title="Kirim Notifikasi WA Orang Tua"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 1: ABSENSI HARIAN SISWA */}
      {subTab === 'harian_siswa' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pilih Kelas</label>
                <select
                  value={selectedKelas}
                  onChange={e => setSelectedKelas(e.target.value)}
                  className="bg-[#181818] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {availableKelasOptions.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tanggal</label>
                <div className="relative w-full min-w-[140px]">
                  <input
                    type="date"
                    value={selectedTanggal}
                    onChange={e => setSelectedTanggal(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-[#181818] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 flex justify-between items-center group focus-within:border-blue-500 transition-colors">
                    <span>
                      {selectedTanggal
                        ? selectedTanggal.split('-').reverse().join('/')
                        : <span className="text-slate-500">dd/mm/yyyy</span>}
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-500 transition-colors ml-2" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveHarian}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Simpan Absensi Harian
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Absensi harian siswa kelas {selectedKelas} tanggal {selectedTanggal} berhasil disimpan!
            </div>
          )}

          {/* Table Attendance Grid */}
          <div className="bg-[#121212] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">NISN / NIS</th>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classSiswaList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada siswa di kelas ini.
                    </td>
                  </tr>
                ) : (
                  classSiswaList.map((s, idx) => {
                    const currentStatus = localHarianState[s.id] || 'Hadir';
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{s.nisn}</td>
                        <td className="px-4 py-3 font-bold text-white">{s.nama}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpha'] as StatusAbsensi[]).map(st => (
                              <button
                                key={st}
                                onClick={() => setLocalHarianState(prev => ({ ...prev, [s.id]: st }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentStatus === st
                                    ? st === 'Hadir' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-sm'
                                      : st === 'Sakit' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-sm'
                                      : st === 'Izin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm'
                                    : 'bg-[#181818] text-slate-400 hover:bg-slate-800 border border-slate-800'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}


      {/* SUBTAB 3: ABSENSI GURU CLOCK IN/OUT & IZIN */}
      {subTab === 'absensi_guru' && (
        <div className="space-y-6">
          
          {guruClockStatus && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {guruClockStatus}
            </div>
          )}

          {/* Clock In / Out Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Real-Time Presensi Kehadiran Guru
              </span>
              <h3 className="text-xl font-bold">Clock-IN & Clock-OUT Guru</h3>
              <p className="text-xs text-slate-300 mt-1">
                Catat jam kedatangan dan jam pulang harian guru dengan geotagging lokasi sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleClockIn('gur-01')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Clock className="w-4 h-4" /> Clock-IN (Masuk)
              </button>
              <button
                onClick={() => handleClockOut('gur-01')}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 border border-slate-600"
              >
                <Clock className="w-4 h-4 text-emerald-400" /> Clock-OUT (Pulang)
              </button>
              <button
                onClick={() => setShowFormIzin(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Pengajuan Izin / Cuti
              </button>
            </div>
          </div>

          {/* Form Modal Izin Guru */}
          {showFormIzin && (
            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-md space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-700">
                <Send className="w-4 h-4" /> Form Pengajuan Izin / Cuti / Dinas Outer Guru
              </h4>
              <form onSubmit={handlePengajuanIzin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Pilih Nama Guru</label>
                  <select
                    value={formIzinGuruId}
                    onChange={e => setFormIzinGuruId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {guruList.map(g => (
                      <option key={g.id} value={g.id}>{g.nama} ({g.mataPelajaran})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Alasan & Keterangan Izin</label>
                  <textarea
                    required
                    rows={2}
                    value={formIzinKet}
                    onChange={e => setFormIzinKet(e.target.value)}
                    placeholder="Contoh: Mengikuti Pelatihan Kurikulum Merdeka atau Sakit..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFormIzin(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400"
                  >
                    Kirim Izin
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Daftar Kehadiran Guru Hari Ini */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Rekap Kehadiran Guru (Hari Ini)</h3>
                {selectedGuruIds.length > 0 && (
                  <button
                    onClick={() => handleDeleteGuruRecords(selectedGuruIds, true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    Hapus ({selectedGuruIds.length})
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500 font-semibold">Total: {absensiGuruList.length} Record</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <button 
                        onClick={toggleSelectAllGuru}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {selectedGuruIds.length === absensiGuruList.length && absensiGuruList.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3">Nama Guru</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Jam Keluar</th>
                    <th className="px-4 py-3">Status Masuk</th>
                    <th className="px-4 py-3">Status Pulang</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absensiGuruList.map(a => (
                    <tr key={a.id} className={`hover:bg-slate-50/80 transition-colors ${selectedGuruIds.includes(a.id) ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => toggleSelectGuru(a.id)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {selectedGuruIds.includes(a.id) ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{a.guruNama}</td>
                      <td className="px-4 py-3 font-mono">{a.tanggal}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-700">{a.jamMasuk || '-'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">{a.jamKeluar || '-'}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const { masuk } = getDualStatus(a);
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] ${masuk.color}`}>
                              {masuk.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const { pulang } = getDualStatus(a);
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] ${pulang.color}`}>
                              {pulang.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        <LocationWithMapLink text={a.lokasiIn || a.lokasiOut || '-'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteGuruRecords([a.id])}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 flex items-center justify-center cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      
      {/* SUBTAB 5: PERIZINAN */}
      {subTab === 'perizinan' && (
        <PerizinanView
          siswaList={siswaList}
          guruList={guruList}
          stafList={stafList}
          rombelList={rombelList}
          absensiHarian={absensiHarian}
          setAbsensiHarian={setAbsensiHarian}
          absensiGuruList={absensiGuruList}
          setAbsensiGuruList={setAbsensiGuruList}
          currentRole={currentRole}
          schoolSettings={schoolSettings}
        />
      )}

{/* SUBTAB 4: EDIT REDAKSI TEMPLATE NOTIFIKASI WA PRESENSI */}
      {subTab === 'redaksi' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900/20 via-indigo-950/10 to-transparent border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Edit Redaksi Notifikasi WA Presensi
              </h2>
              <p className="text-xs text-slate-400">
                Kustomisasi template kalimat notifikasi kehadiran masuk dan pulang siswa yang dikirimkan otomatis ke WhatsApp Wali Murid.
              </p>
            </div>
            
            {redaksiSaveSuccessMsg && (
              <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold shrink-0 shadow-lg border-l-4 border-l-emerald-400">
                ✓ {redaksiSaveSuccessMsg}
              </div>
            )}
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex border-b border-slate-800 pb-px gap-2">
            <button
              onClick={() => setActiveRedaksiTab('masuk')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeRedaksiTab === 'masuk'
                  ? 'border-indigo-500 text-indigo-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              Notifikasi Presensi Masuk
            </button>
            <button
              onClick={() => setActiveRedaksiTab('pulang')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeRedaksiTab === 'pulang'
                  ? 'border-blue-500 text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LogOut className="w-4 h-4 text-blue-400" />
              Notifikasi Presensi Pulang
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Editor Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#121212]/90 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    {activeRedaksiTab === 'masuk' ? 'Template Teks Presensi Masuk' : 'Template Teks Presensi Pulang'}
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
                      NAMA_SISWA: "Ahmad Rizky",
                      KELAS: "VII-B",
                      TANGGAL: "Kamis, 13 Agustus 2026",
                      JAM_SCAN: "07:12",
                      STATUS_KEHADIRAN: activeRedaksiTab === 'masuk' ? "Hadir Tepat Waktu" : "Sudah Pulang",
                      NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Modern Al Fakhir"
                    }).map(vKey => (
                      <button
                        key={vKey}
                        onClick={() => insertPlaceholder(`{${vKey}}`)}
                        className="px-2 py-1 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-500/20 rounded-lg text-[9px] font-mono font-extrabold text-indigo-300 transition-all cursor-pointer"
                      >
                        {`{${vKey}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div>
                  <textarea
                    id={activeRedaksiTab === 'masuk' ? 'template_masuk_input' : 'template_pulang_input'}
                    value={activeRedaksiTab === 'masuk' ? localTemplateAbsensiMasuk : localTemplateAbsensiPulang}
                    onChange={e => {
                      if (activeRedaksiTab === 'masuk') {
                        setLocalTemplateAbsensiMasuk(e.target.value);
                      } else {
                        setLocalTemplateAbsensiPulang(e.target.value);
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
                      activeRedaksiTab === 'masuk'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    <CheckCheck className="w-4 h-4" />
                    Simpan Perubahan Redaksi
                  </button>
                </div>
              </div>

              {/* Informative Tips Footer */}
              <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 space-y-1.5">
                <span className="font-extrabold text-slate-200 block">💡 Tips Format WhatsApp:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Gunakan tanda bintang untuk menebalkan teks, contoh: <code className="text-slate-300 font-mono">*Teks Tebal*</code></li>
                  <li>Gunakan garis bawah untuk memiringkan teks, contoh: <code className="text-slate-300 font-mono">_Teks Miring_</code></li>
                  <li>Pastikan Anda tidak mengubah ejaan variabel di dalam kurung kurawal agar sistem dapat menggantinya dengan informasi riil siswa secara otomatis.</li>
                </ul>
              </div>
            </div>

            {/* Smartphone Mockup Column */}
            <div className="lg:col-span-5 flex justify-center">
               <div className="w-full max-w-[320px] bg-[#0b141a] rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl relative overflow-hidden aspect-[9/18]">
                 {/* Phone Notch/Speaker */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
                   <div className="w-8 h-1.5 bg-slate-900 rounded-full" />
                 </div>
 
                 {/* Status Bar */}
                 <div className="flex items-center justify-between text-[10px] text-slate-400 px-4 pt-1.5 pb-2 border-b border-emerald-900/10 z-10 bg-[#075e54]">
                   <span className="font-semibold text-white">07:12</span>
                   <div className="flex items-center gap-1.5 text-white">
                     <span className="text-[8px]">📶</span>
                     <span className="text-[8px]">🔋 85%</span>
                   </div>
                 </div>
 
                 {/* WA Chat Room Header */}
                 <div className="bg-[#075e54] text-white p-3 flex items-center gap-2 border-b border-[#128c7e]/10">
                   <div className="w-7 h-7 rounded-full bg-emerald-700/80 border border-emerald-400/25 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                     {schoolSettings?.namaSekolah ? schoolSettings.namaSekolah[0] : 'S'}
                   </div>
                   <div>
                     <h5 className="text-[10px] font-extrabold leading-none truncate w-[160px] text-left">
                       {schoolSettings?.namaSekolah || "SMP Modern Al Fakhir"}
                     </h5>
                     <span className="text-[7px] text-emerald-300 block text-left mt-0.5">Online • WhatsApp Gateway</span>
                   </div>
                 </div>
 
                 {/* WA Chat Body with Bubble */}
                 <div className="p-3 space-y-3 bg-[#0b141a] h-[360px] overflow-y-auto flex flex-col justify-end text-left select-none relative">
                   {/* Background Wallpaper Pattern (Subtle grid simulated) */}
                   <div className="absolute inset-0 bg-[#0b141a] opacity-35 pointer-events-none" />
 
                   {/* System Date Badge */}
                   <div className="mx-auto px-2 py-0.5 bg-[#121b22] text-slate-400 text-[8px] rounded-lg shadow border border-slate-800/50 text-center font-bold tracking-wide z-10">
                     HARI INI
                   </div>
 
                   {/* Message Bubble Container */}
                   <div className="bg-[#005c4b] border border-emerald-800/20 text-slate-100 p-3 rounded-2xl rounded-tr-none text-[11px] leading-relaxed shadow-md max-w-[88%] self-end relative z-10 border-l-4 border-l-emerald-500">
                     <div 
                       className="whitespace-pre-wrap select-text selection:bg-emerald-600 font-sans"
                       dangerouslySetInnerHTML={{
                         __html: formatWhatsAppMarkdown(
                           parseWaTemplateAbsensi(
                             activeRedaksiTab === 'masuk' ? localTemplateAbsensiMasuk : localTemplateAbsensiPulang,
                             {
                               NAMA_SISWA: "Ahmad Rizky",
                               KELAS: "VII-B",
                               TANGGAL: "Kamis, 13 Agustus 2026",
                               JAM_SCAN: "07:12",
                               STATUS_KEHADIRAN: activeRedaksiTab === 'masuk' ? "Hadir Tepat Waktu" : "Sudah Pulang",
                               NAMA_SEKOLAH: schoolSettings?.namaSekolah || "SMP Modern Al Fakhir"
                             }
                           )
                         )
                       }}
                     />
                     {/* Timestamp & Sent Checks */}
                     <div className="flex items-center justify-end gap-1 text-[7px] text-emerald-300 mt-1.5 font-semibold">
                       <span>07:12</span>
                       <span className="text-sky-300">✓✓</span>
                     </div>
                   </div>
                 </div>
 
                 {/* Phone Bottom Pill */}
                 <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-800 rounded-full z-20" />
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL PENGATURAN JADWAL MASUK & PULANG */}
      {showJadwalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Atur Jam Masuk & Jam Pulang Sekolah
              </h3>
              <button
                type="button"
                onClick={() => setShowJadwalModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400 block">Jam Masuk Utama (WIB) *</label>
                  <input
                    type="time"
                    value={localJadwal.jamMasuk}
                    onChange={e => setLocalJadwal(prev => ({ ...prev, jamMasuk: e.target.value }))}
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Scan sebelum jam ini: Hadir Tepat Waktu</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400 block">Batas Toleransi (WIB) *</label>
                  <input
                    type="time"
                    value={localJadwal.jamToleransi}
                    onChange={e => setLocalJadwal(prev => ({ ...prev, jamToleransi: e.target.value }))}
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Scan setelah jam ini: Terlambat</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-400 block">Jam Pulang Sekolah (WIB) *</label>
                <input
                  type="time"
                  value={localJadwal.jamPulang}
                  onChange={e => setLocalJadwal(prev => ({ ...prev, jamPulang: e.target.value }))}
                  className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-blue-300 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">Scan sebelum jam ini: Pulang Cepat</p>
              </div>

              {/* Hari Operasional */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Hari Operasional Sekolah</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(hari => {
                    const isSelected = localJadwal.hariKerja?.includes(hari);
                    return (
                      <button
                        type="button"
                        key={hari}
                        onClick={() => {
                          const currentDays = localJadwal.hariKerja || [];
                          const nextDays = isSelected
                            ? currentDays.filter(d => d !== hari)
                            : [...currentDays, hari];
                          setLocalJadwal(prev => ({ ...prev, hariKerja: nextDays }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-[#181818] text-slate-500 border border-slate-800'
                        }`}
                      >
                        {hari}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto Switch Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#181818] rounded-xl border border-slate-800">
                <div>
                  <h5 className="text-xs font-bold text-white">Otomatis Switch Mode Scan</h5>
                  <p className="text-[10px] text-slate-400">Pagi otomatis mode Masuk, Siang/Sore otomatis mode Pulang</p>
                </div>
                <input
                  type="checkbox"
                  checked={localJadwal.autoSwitchScanMode ?? true}
                  onChange={e => setLocalJadwal(prev => ({ ...prev, autoSwitchScanMode: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowJadwalModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (setSchoolSettings) {
                    setSchoolSettings(prev => ({
                      ...prev,
                      jadwalPresensi: localJadwal
                    }));
                  }
                  setShowJadwalModal(false);
                  alert('Jadwal Masuk & Pulang sekolah berhasil diperbarui!');
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                Simpan Jadwal Presensi
              </button>
            </div>

          </div>
        </div>
      )}
      {showFonnteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Token Fonnte WhatsApp Gateway Presensi
              </h3>
              <button
                type="button"
                onClick={() => setShowFonnteModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Token API Fonnte Active</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localFonnteToken}
                    onChange={e => setLocalFonnteToken(e.target.value)}
                    placeholder="Masukkan Token Fonnte..."
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isCheckingToken}
                    onClick={async () => {
                      setIsCheckingToken(true);
                      const status = await getFonnteDeviceStatus(localFonnteToken);
                      setFonnteStatusInfo(status);
                      setIsCheckingToken(false);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs shrink-0 flex items-center gap-1 border border-slate-700"
                  >
                    {isCheckingToken ? 'Mengecek...' : 'Cek Status'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Token ini digunakan untuk mengirimkan notifikasi WA otomatis saat barcode siswa discan.
                </p>
              </div>

              {fonnteStatusInfo && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Device: {fonnteStatusInfo.device}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Pengirim (WA): <span className="font-mono font-bold text-white">{fonnteStatusInfo.sender}</span></p>
                  <p className="text-[11px] text-slate-400">Sisa Kuota: <span className="text-amber-400 font-bold">{fonnteStatusInfo.quota}</span></p>
                </div>
              )}

              <div className="p-3 bg-[#181818] rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <span className="font-bold text-white text-[11px] block">Pratinjau Pesan WA Presensi:</span>
                <p className="font-mono text-[10px] text-slate-400 leading-relaxed bg-[#121212] p-2 rounded-lg border border-slate-800">
                  *PRESENSI SEKOLAH - NOTIFIKASI MASUK*<br />
                  Yth. Wali dari *Ahmad Rizky* (*Kelas X-IPA-1*),<br />
                  Siswa telah HADIR & SCAN MASUK pada 07:15:00 WIB.<br />
                  _{schoolSettings?.namaSekolah || 'SMP Modern Al Fakhir'}_
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowFonnteModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (setSchoolSettings) {
                    setSchoolSettings(prev => ({
                      ...prev,
                      fonnteToken: localFonnteToken,
                      fonnteConfig: {
                        ...(prev.fonnteConfig || { apiKey: '', senderName: '', templateReminder: '', templateReceipt: '', enabled: true }),
                        apiKey: localFonnteToken
                      }
                    }));
                  }
                  setShowFonnteModal(false);
                  alert('Token Fonnte berhasil diperbarui untuk Presensi Barcode!');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                Simpan Token Presensi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
