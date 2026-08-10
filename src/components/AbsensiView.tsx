import React, { useState, useEffect, useMemo } from 'react';
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
  Phone,
  LogIn,
  LogOut,
  Smartphone,
  Share2
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

type SubTabAbsensi = 'scan_barcode' | 'harian_siswa' | 'kelas_mapel' | 'absensi_guru';

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
  const [internalSubTab, setInternalSubTab] = useState<SubTabAbsensi>(currentRole === 'guru' ? 'kelas_mapel' : 'scan_barcode');

  const subTab = controlledSubTab ?? internalSubTab;
  const setSubTab = (val: SubTabAbsensi) => {
    setInternalSubTab(val);
    if (setControlledSubTab) setControlledSubTab(val);
  };

  useEffect(() => {
    if (currentRole === 'guru') {
      if (subTab === 'harian_siswa' || subTab === 'absensi_guru') {
        setSubTab('kelas_mapel');
      }
      setScanTargetType('siswa');
    }
  }, [currentRole, subTab]);

  // --- Subtab Barcode Scanner, Jadwal & Fonnte Modal State ---
  const [showFonnteModal, setShowFonnteModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [localJadwal, setLocalJadwal] = useState<JadwalPresensi>(
    schoolSettings?.jadwalPresensi || {
      jamMasuk: '07:00',
      jamToleransi: '07:15',
      jamPulang: '14:30',
      hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      autoSwitchScanMode: true
    }
  );

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

  // Helper to calculate status attendance label (Tepat Waktu, Terlambat, Pulang Cepat)
  const calculateAttendanceStatusLabel = (timeStr: string, mode: 'Masuk' | 'Pulang') => {
    const jadwal = schoolSettings?.jadwalPresensi || localJadwal;
    const parts = timeStr.split(':').map(Number);
    const curH = parts[0] || 0;
    const curM = parts[1] || 0;
    const curTotalSec = curH * 3600 + curM * 60;

    if (mode === 'Masuk') {
      const [mH, mM] = (jadwal.jamMasuk || '07:00').split(':').map(Number);
      const [tH, tM] = (jadwal.jamToleransi || '07:15').split(':').map(Number);
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
      const [pH, pM] = (jadwal.jamPulang || '14:30').split(':').map(Number);
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
  const [scanTargetType, setScanTargetType] = useState<'siswa' | 'guru'>('siswa');
  const [scanMode, setScanMode] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [autoSendWA, setAutoSendWA] = useState<boolean>(true);

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
  }>>([]);

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

    const statusInfo = calculateAttendanceStatusLabel(waktu, tipe);

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
    const code = codeToScan.trim();
    if (!code) return;

    playBeepSound();
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    if (scanTargetType === 'siswa') {
      // Find student by barcode or NISN or NIS
      const foundSiswa = siswaList.find(s => 
        (s.kodeBarcode && s.kodeBarcode.toLowerCase() === code.toLowerCase()) ||
        s.nisn === code ||
        s.nis === code ||
        s.nama.toLowerCase().includes(code.toLowerCase())
      );

      if (foundSiswa) {
        const statusInfo = calculateAttendanceStatusLabel(timeNow, scanMode);

        setAbsensiHarian(prev => {
          const existing = prev.find(a => a.siswaId === foundSiswa.id && a.tanggal === today);
          const filtered = prev.filter(a => !(a.siswaId === foundSiswa.id && a.tanggal === today));
          return [
            {
              id: `abh-${foundSiswa.id}-${today}`,
              siswaId: foundSiswa.id,
              tanggal: today,
              status: statusInfo.isLate ? 'Terlambat' : 'Hadir',
              jamScan: timeNow,
              jamMasuk: scanMode === 'Masuk' ? timeNow : (existing?.jamMasuk || timeNow),
              jamPulang: scanMode === 'Pulang' ? timeNow : existing?.jamPulang,
              tipeScan: scanMode,
              metodeScan: 'Barcode / QR'
            },
            ...filtered
          ];
        });

        const res = {
          nama: foundSiswa.nama,
          role: `Siswa Kelas ${foundSiswa.kelas}`,
          kode: foundSiswa.kodeBarcode || `SIS-${foundSiswa.nisn}`,
          waktu: timeNow,
          detail: `NISN: ${foundSiswa.nisn} | Status: ${statusInfo.label} | Wali: ${foundSiswa.namaWali || '-'} (${foundSiswa.teleponWali || '-'})`,
          teleponWali: foundSiswa.teleponWali,
          namaWali: foundSiswa.namaWali,
          tipeAbsensi: scanMode,
          siswaObj: foundSiswa
        };
        setLastScannedResult(res);
        setScanHistory(prev => [res, ...prev]);

        if (autoSendWA && foundSiswa.teleponWali) {
          sendWhatsAppNotif(foundSiswa, timeNow, scanMode);
        }
      } else {
        alert(`Barcode / ID "${code}" tidak ditemukan pada Database Siswa!`);
      }
    } else {
      // Find guru by barcode or NIP
      const foundGuru = guruList.find(g => 
        (g.kodeBarcode && g.kodeBarcode.toLowerCase() === code.toLowerCase()) ||
        g.nip === code ||
        g.nama.toLowerCase().includes(code.toLowerCase())
      );

      if (foundGuru) {
        setAbsensiGuruList(prev => {
          const existingIndex = prev.findIndex(g => g.guruId === foundGuru.id && g.tanggal === today);
          if (existingIndex >= 0) {
            const updated = [...prev];
            if (scanMode === 'Pulang') {
              updated[existingIndex].jamPulang = timeNow;
              updated[existingIndex].metodeOut = 'Barcode / QR';
            } else {
              updated[existingIndex].jamMasuk = timeNow;
              updated[existingIndex].status = 'Hadir';
              updated[existingIndex].metodeIn = 'Barcode / QR';
            }
            return updated;
          } else {
            return [
              {
                id: `abg-${Date.now()}`,
                guruId: foundGuru.id,
                guruNama: foundGuru.nama,
                tanggal: today,
                jamMasuk: scanMode === 'Masuk' ? timeNow : undefined,
                jamPulang: scanMode === 'Pulang' ? timeNow : undefined,
                status: 'Hadir',
                statusIzin: 'Disetujui',
                lokasiIn: 'Mesin Scan Barcode Utama',
                metodeIn: 'Barcode / QR'
              },
              ...prev
            ];
          }
        });

        const res = {
          nama: foundGuru.nama,
          role: `Guru ${foundGuru.mataPelajaran}`,
          kode: foundGuru.kodeBarcode || `GUR-${foundGuru.nip}`,
          waktu: timeNow,
          detail: `NIP: ${foundGuru.nip} | Status: ${foundGuru.status}`
        };
        setLastScannedResult(res);
        setScanHistory(prev => [res, ...prev]);
      } else {
        alert(`Barcode / NIP "${code}" tidak ditemukan pada Database Guru!`);
      }
    }

    setBarcodeInput('');
  };

  // Dynamic list of available classes from rombelList and siswaList
  const availableKelasOptions = useMemo(() => {
    const set = new Set<string>();
    rombelList.forEach(r => { if (r.namaRombel && r.namaRombel.trim()) set.add(r.namaRombel.trim()); });
    siswaList.forEach(s => { if (s.kelas && s.kelas.trim()) set.add(s.kelas.trim()); });
    if (set.size === 0) {
      ['X-IPA-1', 'XI-IPA-2', 'XI-IPS-1', 'XII-IPA-1'].forEach(k => set.add(k));
    }
    return Array.from(set);
  }, [rombelList, siswaList]);

  // --- Subtab 1: Absensi Siswa Harian State ---
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedKelas, setSelectedKelas] = useState(() => availableKelasOptions[0] || 'X-IPA-1');
  const [selectedTanggal, setSelectedTanggal] = useState(todayDateStr);

  // Auto ensure selectedKelas is valid if available options change
  useEffect(() => {
    if (availableKelasOptions.length > 0 && !availableKelasOptions.includes(selectedKelas)) {
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
  const [localHarianState, setLocalHarianState] = useState<Record<string, StatusAbsensi>>({});

  // Sync localHarianState whenever selectedKelas or selectedTanggal changes
  useEffect(() => {
    const map: Record<string, StatusAbsensi> = {};
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

  // --- Subtab 2: Absensi Kelas Per Mapel State ---
  const [mapelKelas, setMapelKelas] = useState(() => availableKelasOptions[0] || 'X-IPA-1');
  const [mapelNama, setMapelNama] = useState('Fisika & Informatika');
  const [mapelGuru, setMapelGuru] = useState('Siti Rahmawati, S.Si., M.Sc.');
  const [mapelJam, setMapelJam] = useState('1 - 2 (07:00 - 08:30)');
  const [mapelMateri, setMapelMateri] = useState('Eksperimen Praktikum Vektor & Simulasi Komputer');

  // Auto ensure mapelKelas is valid if available options change
  useEffect(() => {
    if (availableKelasOptions.length > 0 && !availableKelasOptions.includes(mapelKelas)) {
      setMapelKelas(availableKelasOptions[0]);
    }
  }, [availableKelasOptions, mapelKelas]);

  // Memoized student list for Subtab 2 (Absensi Mapel)
  const classSiswaMapelList = useMemo(() => {
    if (!mapelKelas) return [];
    const target = mapelKelas.trim().toLowerCase();
    return siswaList.filter(s => s.kelas && s.kelas.trim().toLowerCase() === target);
  }, [siswaList, mapelKelas]);
  
  const [localMapelState, setLocalMapelState] = useState<Record<string, StatusAbsensi>>({});
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  // Dynamic selection lists
  const subjectsOptions = Array.from(new Set([
    ...mapelList.map(m => m.namaMapel),
    'Fisika & Informatika',
    'Matematika Tingkat Lanjut',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Pendidikan Pancasila',
    'IPA Terpadu',
    'IPS Terpadu',
    'Seni & Musik',
    'PJOK'
  ]));

  const teachersOptions = Array.from(new Set([
    ...guruList.map(g => g.nama),
    'Siti Rahmawati, S.Si., M.Sc.',
    'Drs. Hendra Kusuma, M.Pd.',
    'Budi Santoso, S.Pd.',
    'Rina Wijaya, M.Pd.',
    'Achmad Fauzi, S.Kom.'
  ]));

  const hoursOptions = [
    '1 - 2 (07:00 - 08:30)',
    '3 - 4 (08:30 - 10:00)',
    '5 - 6 (10:15 - 11:45)',
    '7 - 8 (12:30 - 14:00)',
    '9 - 10 (14:00 - 15:30)'
  ];

  // Auto fill teacher based on selected subject from mapelList
  useEffect(() => {
    if (mapelList && mapelList.length > 0) {
      const matchingMapel = mapelList.find(m => m.namaMapel === mapelNama);
      if (matchingMapel) {
        setMapelGuru(matchingMapel.guruPengampuNama);
      }
    }
  }, [mapelNama, mapelList]);

  // Reset local mapel state when class changes to clear previous selections
  useEffect(() => {
    setLocalMapelState({});
  }, [mapelKelas]);

  const handleSaveAbsensiMapel = async () => {
    // Fill in default 'Hadir' status for all students in the class who don't have a status yet
    const finalKehadiranMap: Record<string, StatusAbsensi> = {};
    classSiswaMapelList.forEach(s => {
      finalKehadiranMap[s.id] = localMapelState[s.id] || 'Hadir';
    });

    const newEntry: AbsensiSiswaKelas = {
      id: `abk-${Date.now()}`,
      kelas: mapelKelas,
      mataPelajaran: mapelNama,
      guruNama: mapelGuru,
      tanggal: selectedTanggal,
      jamKe: mapelJam,
      materi: mapelMateri,
      kehadiranMap: finalKehadiranMap,
      catatan: 'Absensi jurnal mengajar berhasil disimpan.'
    };
    
    setAbsensiKelasList(prev => [newEntry, ...prev]);

    setSavingToDrive(true);
    try {
      const res = await exportAllToGoogleSheets(userGoogleToken, {
        siswaList,
        guruList,
        stafList,
        rombelList,
        mapelList,
        absensiHarian,
        absensiKelasList: [newEntry, ...absensiKelasList]
      });

      if (res.success) {
        alert(`Jurnal & Absensi Kelas Berhasil Disimpan!\n\n${res.message}`);
        if (res.url) {
          setSpreadsheetUrl(res.url);
        }
      } else {
        alert(`Jurnal & Absensi Kelas disimpan secara lokal, namun gagal sync ke Google Sheets: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Jurnal & Absensi Kelas berhasil disimpan secara lokal.');
    } finally {
      setSavingToDrive(false);
    }
  };

  // --- Subtab 3: Absensi Guru Clock In / Clock Out & Izin ---
  const [guruClockStatus, setGuruClockStatus] = useState<string | null>(null);
  const [showFormIzin, setShowFormIzin] = useState(false);
  const [formIzinGuruId, setFormIzinGuruId] = useState('gur-01');
  const [formIzinKet, setFormIzinKet] = useState('');

  const handleClockIn = (guruId: string) => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === guruId && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].jamMasuk = timeNow;
        updated[existingIndex].status = 'Hadir';
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
            lokasiIn: 'Gedung Utama Sekolah'
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

    setAbsensiGuruList(prev => {
      const existingIndex = prev.findIndex(g => g.guruId === guruId && g.tanggal === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].jamKeluar = timeNow;
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

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
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
            {subTab === 'kelas_mapel' && <><BookOpen className="w-3.5 h-3.5" /> Absensi Kelas Per Mapel</>}
            {subTab === 'absensi_guru' && <><UserCheck className="w-3.5 h-3.5" /> Presensi Guru</>}
          </span>
        </div>
      </div>

      {/* SUBTAB 0: SCAN BARCODE / QR ABSENSI */}
      {subTab === 'scan_barcode' && (
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

            {/* Target Selector & WA Config Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Target Scan:</span>
                {currentRole !== 'guru' ? (
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
                  </div>
                ) : (
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold">
                    Siswa
                  </span>
                )}
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
            </div>

            {/* Active Presensi Schedule Info Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#181818] px-4 py-2.5 rounded-xl border border-blue-500/30 text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-blue-400" /> Jadwal Presensi Aktif:
                </span>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <LogIn className="w-3 h-3 text-emerald-400" /> Masuk: {schoolSettings?.jadwalPresensi?.jamMasuk || localJadwal.jamMasuk} WIB
                  </span>
                  <span className="bg-amber-950/60 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-md font-bold">
                    Toleransi: {schoolSettings?.jadwalPresensi?.jamToleransi || localJadwal.jamToleransi} WIB
                  </span>
                  <span className="bg-blue-950/60 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <LogOut className="w-3 h-3 text-blue-400" /> Pulang: {schoolSettings?.jadwalPresensi?.jamPulang || localJadwal.jamPulang} WIB
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
                Input Manual / Tempelkan Laser Barcode Scanner di Sini:
              </label>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleExecuteScan(barcodeInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder={scanTargetType === 'siswa' ? 'Contoh: SIS-0081234561 atau NISN' : 'Contoh: GUR-198501152010011002 atau NIP'}
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

            {/* Quick Demo Pickers */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] font-bold text-slate-400 mb-2">Pilih Sampel Kartu ID untuk Tes Simulasi Scan Quick Barcode:</p>
              <div className="flex flex-wrap gap-2">
                {scanTargetType === 'siswa' ? (
                  siswaList.slice(0, 4).map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleExecuteScan(s.kodeBarcode || `SIS-${s.nisn}`)}
                      className="px-3 py-1.5 bg-[#181818] hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-lg text-left transition-all group"
                    >
                      <div className="text-[11px] font-bold text-white group-hover:text-blue-400">{s.nama}</div>
                      <div className="text-[9px] font-mono text-slate-500">{s.kodeBarcode || `SIS-${s.nisn}`}</div>
                    </button>
                  ))
                ) : (
                  guruList.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleExecuteScan(g.kodeBarcode || `GUR-${g.nip}`)}
                      className="px-3 py-1.5 bg-[#181818] hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-lg text-left transition-all group"
                    >
                      <div className="text-[11px] font-bold text-white group-hover:text-purple-400">{g.nama}</div>
                      <div className="text-[9px] font-mono text-slate-500">{g.kodeBarcode || `GUR-${g.nip}`}</div>
                    </button>
                  ))
                )}
              </div>
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
                {lastScannedResult?.tipeAbsensi && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    lastScannedResult.tipeAbsensi === 'Masuk' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {lastScannedResult.tipeAbsensi.toUpperCase()}
                  </span>
                )}
              </h4>

              {lastScannedResult ? (
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded border ${
                      lastScannedResult.tipeAbsensi === 'Pulang'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      PRESENSI {lastScannedResult.tipeAbsensi ? lastScannedResult.tipeAbsensi.toUpperCase() : 'BERHASIL'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{lastScannedResult.waktu}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{lastScannedResult.nama}</h3>
                    <p className="text-xs font-semibold text-blue-400">{lastScannedResult.role}</p>
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
                    <div key={idx} className="p-2.5 bg-[#181818] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate">{item.nama}</span>
                          {item.tipeAbsensi && (
                            <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
                              item.tipeAbsensi === 'Pulang' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.tipeAbsensi}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.role}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="font-mono text-emerald-400 font-bold text-[11px]">{item.waktu}</div>
                          <div className="text-[9px] text-slate-500 font-mono">{item.kode}</div>
                        </div>

                        {item.siswaObj && item.teleponWali && (
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
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={e => setSelectedTanggal(e.target.value)}
                  className="bg-[#181818] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
                />
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

      {/* SUBTAB 2: ABSENSI KELAS PER MAPEL */}
      {subTab === 'kelas_mapel' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b pb-3">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Form Jurnal & Kehadiran Per Mata Pelajaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Kelas</label>
                <select 
                  value={mapelKelas} 
                  onChange={e => setMapelKelas(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {availableKelasOptions.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Mata Pelajaran</label>
                <select 
                  value={mapelNama} 
                  onChange={e => setMapelNama(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {subjectsOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Guru Pengajar</label>
                <select 
                  value={mapelGuru} 
                  onChange={e => setMapelGuru(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {teachersOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Jam Ke- / Waktu</label>
                <select 
                  value={mapelJam} 
                  onChange={e => setMapelJam(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {hoursOptions.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Materi Pembelajaran / Ringkasan Jurnal Kelas</label>
              <textarea 
                rows={2} 
                value={mapelMateri} 
                onChange={e => setMapelMateri(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>

            {/* Checklist Attendance in Mapel */}
            <div className="pt-2">
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">
                Checklist Kehadiran Siswa di Jam Mapel Ini ({classSiswaMapelList.length} Siswa):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-xl bg-slate-50">
                {classSiswaMapelList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 col-span-2">
                    Tidak ada data siswa untuk kelas <span className="font-bold text-slate-700">{mapelKelas}</span>. Silakan tambahkan siswa di kelas ini melalui Menu Database Siswa.
                  </p>
                ) : (
                  classSiswaMapelList.map(s => {
                    const status = localMapelState[s.id] || 'Hadir';
                    return (
                      <div key={s.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-xs hover:border-slate-300 transition-all">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{s.nama}</span>
                          <span className="text-[10px] text-slate-400 font-mono">NISN: {s.nisn}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['Hadir', 'Sakit', 'Izin', 'Alpha'] as StatusAbsensi[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setLocalMapelState(prev => ({ ...prev, [s.id]: st }))}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                status === st 
                                  ? st === 'Hadir' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                                    : st === 'Sakit' ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                    : st === 'Izin' ? 'bg-blue-600 text-white font-black shadow-xs'
                                    : 'bg-rose-600 text-white font-black shadow-xs'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3 border-t">
              <div>
                {spreadsheetUrl && (
                  <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer" 
                    className="text-xs text-emerald-600 hover:text-emerald-500 font-bold flex items-center gap-1.5 border-b border-emerald-500/30 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Buka Database Spreadsheet Anda di Google Drive
                  </a>
                )}
              </div>
              <button
                onClick={handleSaveAbsensiMapel}
                disabled={savingToDrive}
                className={`px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md ${
                  savingToDrive ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {savingToDrive ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                    Menyimpan & Menyinkronkan ke Drive...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Jurnal & Sync Spreadsheet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Jurnal Kelas */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Jurnal Kelas & Absensi Mapel</h3>
            <div className="space-y-2">
              {absensiKelasList.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{item.mataPelajaran} ({item.kelas}) - {item.jamKe}</div>
                    <div className="text-slate-500 mt-0.5">Guru: {item.guruNama} | Materi: {item.materi}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px] self-start sm:self-center">
                    {item.tanggal}
                  </span>
                </div>
              ))}
            </div>
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
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Rekap Kehadiran Guru (Hari Ini)</h3>
              <span className="text-xs text-slate-500 font-semibold">Total: {absensiGuruList.length} Record</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama Guru</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Jam Keluar</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Keterangan / Lokasi</th>
                    <th className="px-4 py-3 text-right">Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absensiGuruList.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{a.guruNama}</td>
                      <td className="px-4 py-3 font-mono">{a.tanggal}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-700">{a.jamMasuk || '-'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">{a.jamKeluar || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          a.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {a.keteranganIzin || a.lokasiIn || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.statusIzin === 'Pending' ? (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleApproveIzin(a.id, 'Disetujui')}
                              className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[10px]"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleApproveIzin(a.id, 'Ditolak')}
                              className="px-2 py-1 bg-rose-500 text-white font-bold rounded text-[10px]"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            a.statusIzin === 'Disetujui' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                          }`}>
                            {a.statusIzin}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
