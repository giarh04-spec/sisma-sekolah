import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Save, 
  FileSpreadsheet,
  User,
  Clock,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  History,
  LayoutDashboard,
  FileBarChart,
  Zap,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RekapJurnal } from './RekapJurnal';
import { 
  Siswa, 
  Guru, 
  AbsensiSiswaKelas, 
  StatusAbsensi,
  RombelKelas,
  MataPelajaranItem,
  SchoolSettings
} from '../../types/school';
import { exportAllToGoogleSheets } from '../../lib/googleDriveSync';
import { SCHEDULE_CLASSES, TEACHER_MAPPINGS, MASTER_SCHEDULE } from '../../types/scheduleData';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { JadwalMengajarItem } from './JadwalMengajar';

interface JurnalGuruProps {
  siswaList: Siswa[];
  guruList: Guru[];
  rombelList?: RombelKelas[];
  mapelList?: MataPelajaranItem[];
  absensiKelasList: AbsensiSiswaKelas[];
  setAbsensiKelasList: React.Dispatch<React.SetStateAction<AbsensiSiswaKelas[]>>;
  userGoogleToken?: string;
  schoolSettings?: SchoolSettings;
  absensiHarian?: any[]; // For syncing
  stafList?: any[]; // For syncing
}

export const JurnalGuru: React.FC<JurnalGuruProps> = ({
  siswaList,
  guruList,
  rombelList = [],
  mapelList = [],
  absensiKelasList,
  setAbsensiKelasList,
  userGoogleToken = 'demo_workspace_token_active',
  schoolSettings,
  absensiHarian = [],
  stafList = []
}) => {
  // Dynamic selection lists
  const subjectsOptions = Array.from(new Set([
    ...mapelList.map(m => m.namaMapel),
    ...TEACHER_MAPPINGS.map(t => t.subject.split(' & ')[0].split(' 7')[0].split(' 8')[0].split(' 9')[0]),
    'Informatika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'Pendidikan Pancasila',
    'Seni Budaya',
    'PJOK',
    'Bahasa Arab',
    'Bahasa Jepang',
    'Bahasa Korea'
  ])).filter(Boolean);

  const teachersOptions = Array.from(new Set([
    ...guruList.map(g => g.nama),
    ...TEACHER_MAPPINGS.map(t => t.name),
    'Giar Hermawan, S.Kom',
    'Deny Rahmat, S.Sos.I',
    'Arifah Hilyati, S.S, M.Pd'
  ])).filter(Boolean);

  const hoursOptions = [
    '1 - 2 (07:00 - 08:30)',
    '3 - 4 (08:30 - 10:00)',
    '5 - 6 (10:15 - 11:45)',
    '7 - 8 (12:30 - 14:00)',
    '9 - 10 (14:00 - 15:30)'
  ];

  // Dynamic list of available classes from rombelList and siswaList
  const availableKelasOptions = useMemo(() => {
    const rawSet = new Set<string>();
    
    rombelList.forEach(r => { if (r.namaRombel && r.namaRombel.trim()) rawSet.add(r.namaRombel.trim()); });
    siswaList.forEach(s => { if (s.kelas && s.kelas.trim()) rawSet.add(s.kelas.trim()); });
    
    if (rawSet.size === 0) {
      SCHEDULE_CLASSES.forEach(c => rawSet.add(c.name));
    }
    
    // Normalize and filter duplicates
    const allRaw = Array.from(rawSet);
    const filtered = allRaw.filter(name => {
      // Filter out legacy "VII-A", "VIII-A", "IX-A" format if modern format exists
      const isLegacy = /^(VII|VIII|IX)-[A-Z]$/.test(name);
      if (isLegacy) {
        const hasModern = allRaw.some(n => n.includes(' - ') && !/^(VII|VIII|IX)-[A-Z]$/.test(n));
        if (hasModern) return false;
      }

      // If this is a plain name like "Ibnu Sina" and there's a prefixed version, skip plain one
      const prefixes = ['VII - ', 'VIII - ', 'IX - '];
      const hasPrefixed = prefixes.some(p => allRaw.includes(p + name));
      if (hasPrefixed) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      // Custom sort: VII -> VIII -> IX
      const getGrade = (s: string) => {
        if (s.startsWith('VII -')) return 7;
        if (s.startsWith('VIII -')) return 8;
        if (s.startsWith('IX -')) return 9;
        return 99;
      };
      const gradeA = getGrade(a);
      const gradeB = getGrade(b);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [rombelList, siswaList]);

  const [mapelKelas, setMapelKelas] = useState(() => availableKelasOptions.includes('IX - Utsman bin Affan') ? 'IX - Utsman bin Affan' : (availableKelasOptions[0] || 'IX - Utsman bin Affan'));
  const [mapelNama, setMapelNama] = useState(subjectsOptions[0] || 'Informatika');
  const [mapelGuru, setMapelGuru] = useState(teachersOptions[0] || 'Guru Pengampu');
  const [mapelJam, setMapelJam] = useState(hoursOptions[0] || '1 - 2 (07:00 - 08:30)');
  const [mapelMateri, setMapelMateri] = useState('');
  const [mapelTujuan, setMapelTujuan] = useState('');
  const [mapelMetode, setMapelMetode] = useState('');
  const [mapelMedia, setMapelMedia] = useState('');
  const [mapelRefleksi, setMapelRefleksi] = useState('');
  const [mapelTindakLanjut, setMapelTindakLanjut] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().split('T')[0]);

  // Auto ensure mapelKelas is valid if available options change
  useEffect(() => {
    if (availableKelasOptions.length > 0 && !availableKelasOptions.includes(mapelKelas)) {
      setMapelKelas(availableKelasOptions[0]);
    }
  }, [availableKelasOptions, mapelKelas]);

  // Memoized student list for Absensi Mapel
  const classSiswaMapelList = useMemo(() => {
    if (!mapelKelas) return [];
    const target = mapelKelas.trim().toLowerCase();
    return siswaList
      .filter(s => s.kelas && s.kelas.trim().toLowerCase() === target)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [siswaList, mapelKelas]);
  
  const [localMapelState, setLocalMapelState] = useState<Record<string, StatusAbsensi>>({});
  const [viewMode, setViewMode] = useState<'input' | 'rekap'>('input');
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(schoolSettings?.googleSyncSpreadsheetUrl || null);
  const [jadwalList, setJadwalList] = useState<JadwalMengajarItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewJurnal, setSelectedReviewJurnal] = useState<AbsensiSiswaKelas | null>(null);

  const handleExportCustomExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap Jurnal', {
        views: [{ showGridLines: true }]
      });

      // Title rows
      worksheet.mergeCells('A1:P1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'SEKOLAH ISLAM MODERN AL FAKHIR';
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells('A2:P2');
      const subtitleCell = worksheet.getCell('A2');
      subtitleCell.value = 'REKAPITULASI JURNAL MENGAJAR & PRESENSI KELAS (BOXED & FORMATTED)';
      subtitleCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      subtitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF334155' }
      };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells('A3:P3');
      const dateCell = worksheet.getCell('A3');
      dateCell.value = `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')} | Total Sesi: ${absensiKelasList.length}`;
      dateCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
      dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.addRow([]);

      // Headers row
      worksheet.getRow(5).values = [
        'No', 'Tanggal', 'Kelas', 'Mata Pelajaran', 'Guru Pengampu', 'Jam Ke', 
        'Materi / Ringkasan Jurnal', 'Tujuan Pembelajaran', 'Metode Pembelajaran', 
        'Media Pembelajaran', 'Refleksi Guru', 'Tindak Lanjut', 'Hadir', 'Sakit', 'Izin', 'Alpha'
      ];

      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'tanggal', width: 14 },
        { key: 'kelas', width: 14 },
        { key: 'mataPelajaran', width: 22 },
        { key: 'guru', width: 22 },
        { key: 'jam', width: 15 },
        { key: 'materi', width: 35 },
        { key: 'tujuan', width: 35 },
        { key: 'metode', width: 25 },
        { key: 'media', width: 25 },
        { key: 'refleksi', width: 35 },
        { key: 'tindakLanjut', width: 35 },
        { key: 'hadir', width: 8 },
        { key: 'sakit', width: 8 },
        { key: 'izin', width: 8 },
        { key: 'alpha', width: 8 }
      ];

      const headerRow = worksheet.getRow(5);
      headerRow.height = 28;
      headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      const cellBorder = {
        top: { style: 'thin' as const, color: { argb: 'FF94A3B8' } },
        left: { style: 'thin' as const, color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin' as const, color: { argb: 'FF94A3B8' } },
        right: { style: 'thin' as const, color: { argb: 'FF94A3B8' } }
      };

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' }
        };
        cell.border = cellBorder;
      });

      absensiKelasList.forEach((j, index) => {
        const itemCounts: Record<StatusAbsensi, number> = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
        if (j.kehadiranMap) {
          (Object.values(j.kehadiranMap) as StatusAbsensi[]).forEach(s => {
            if (itemCounts[s] !== undefined) itemCounts[s]++;
          });
        }

        const dataRow = worksheet.addRow({
          no: index + 1,
          tanggal: j.tanggal,
          kelas: j.kelas,
          mataPelajaran: j.mataPelajaran,
          guru: j.guruNama,
          jam: j.jamKe.split(' (')[0],
          materi: j.materi,
          tujuan: j.tujuanPembelajaran || '',
          metode: j.metodePembelajaran || '',
          media: j.mediaPembelajaran || '',
          refleksi: j.refleksi || '',
          tindakLanjut: j.tindakLanjut || '',
          hadir: itemCounts.Hadir,
          sakit: itemCounts.Sakit,
          izin: itemCounts.Izin,
          alpha: itemCounts.Alpha
        });

        dataRow.height = 24;
        const isEven = index % 2 === 0;
        const rowBgColor = isEven ? 'FFFFFFFF' : 'F8FAFCFF';

        dataRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 9, color: { argb: 'FF334155' } };
          cell.border = cellBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBgColor }
          };

          if (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 6 || colNumber >= 13) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          }

          if (colNumber >= 14 && colNumber <= 16) {
            const val = Number(cell.value);
            if (val > 0) {
              cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: colNumber === 16 ? 'FFE11D48' : 'FFD97706' } };
            }
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Rekap_Kotak_Jurnal_Mengajar_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Failed to export custom formatted excel:', error);
      alert('Gagal mengekspor rekap Excel.');
    }
  };

  const handleDeleteJurnal = async (id: string) => {
    const updatedList = absensiKelasList.filter(item => item.id !== id);
    setAbsensiKelasList(updatedList);
    setDeletingId(null);

    setSavingToDrive(true);
    try {
      const res = await exportAllToGoogleSheets(userGoogleToken, {
        siswaList,
        guruList,
        stafList,
        rombelList,
        mapelList,
        absensiHarian,
        absensiKelasList: updatedList
      });

      if (res.success) {
        alert(`Jurnal & Absensi Kelas Berhasil Dihapus!\n\n${res.message}`);
        if (res.url) {
          setSpreadsheetUrl(res.url);
        }
      } else {
        alert(`Jurnal & Absensi Kelas dihapus secara lokal, namun gagal sync ke Google Sheets: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setSavingToDrive(false);
    }
  };

  // Fetch Schedule for Auto-fill
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'edu_jadwalList')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as JadwalMengajarItem[];
      setJadwalList(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'edu_jadwalList');
    });
    return () => unsub();
  }, []);

  const handleAutoFill = () => {
    const now = new Date();
    const currentDay = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'][now.getDay()];
    const currentClock = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}`;
    
    const normalize = (t: string) => t.replace(':', '.');
    const nowNorm = normalize(currentClock);

    // Try to find matching session in schedules
    const allSchedules = [
      ...MASTER_SCHEDULE,
      ...jadwalList.map(j => ({
        day: j.hari.toUpperCase(),
        time: `${j.jamMulai} - ${j.jamSelesai}`,
        classId: j.ruang || j.kelas,
        subject: j.mataPelajaran,
        teacherCode: j.teacherCode || ''
      }))
    ];

    const currentSession = allSchedules.find(s => {
      if (s.day !== currentDay) return false;
      const [start, end] = s.time.split(' - ');
      return nowNorm >= normalize(start) && nowNorm <= normalize(end);
    });

    if (currentSession) {
      // Find proper class name from options
      const matchedKelas = availableKelasOptions.find(k => 
        k === currentSession.classId || 
        k.includes(currentSession.classId) || 
        currentSession.classId.includes(k)
      );
      
      if (matchedKelas) setMapelKelas(matchedKelas);
      setMapelNama(currentSession.subject);
      setMapelJam(currentSession.time);
      
      // Auto fill teacher based on code
      if (currentSession.teacherCode) {
        const teacher = TEACHER_MAPPINGS.find(t => t.code === currentSession.teacherCode);
        if (teacher) setMapelGuru(teacher.name);
      }
    } else {
      alert('Tidak ada jadwal yang sedang berlangsung saat ini.');
    }
  };

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
      tujuanPembelajaran: mapelTujuan,
      metodePembelajaran: mapelMetode,
      mediaPembelajaran: mapelMedia,
      refleksi: mapelRefleksi,
      tindakLanjut: mapelTindakLanjut,
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
        setMapelMateri('');
        setMapelTujuan('');
        setMapelMetode('');
        setMapelMedia('');
        setMapelRefleksi('');
        setMapelTindakLanjut('');
      } else {
        alert(`Jurnal & Absensi Kelas disimpan secara lokal, namun gagal sync ke Google Sheets: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSavingToDrive(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-6 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                {viewMode === 'input' ? (
                  <BookOpen className="w-6 h-6 text-slate-900" />
                ) : (
                  <FileBarChart className="w-6 h-6 text-slate-900" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tight">
                  {viewMode === 'input' ? 'Jurnal Guru & Kehadiran Siswa' : 'Rekapitulasi Jurnal & Kehadiran'}
                </h3>
                <p className="text-slate-400 text-sm opacity-90 font-medium">
                  {viewMode === 'input' 
                    ? 'Manajemen pembelajaran dan presensi siswa per mata pelajaran' 
                    : 'Laporan ringkasan jurnal mengajar dan statistik kehadiran siswa'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {viewMode === 'input' && (
                <button
                  onClick={handleAutoFill}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-xs font-black transition-all"
                >
                  <Zap className="w-4 h-4 fill-amber-500" />
                  UPDATE OTOMATIS
                </button>
              )}
              
              {/* View Mode Dropdown */}
              <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <div className="flex items-center gap-2 ml-1 text-slate-400">
                  <LayoutDashboard className="w-3 h-3" />
                  <label className="text-[10px] font-black uppercase tracking-widest">Pilih Tampilan</label>
                </div>
                <div className="relative group">
                  <select 
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'input' | 'rekap')}
                    className="w-full h-11 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500/50 cursor-pointer appearance-none transition-all pr-10"
                  >
                    <option value="input" className="bg-slate-900 text-white font-bold">Input Jurnal & Presensi</option>
                    <option value="rekap" className="bg-slate-900 text-white font-bold">Rekap Laporan Jurnal</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          
          {/* Subtle decorative background */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -top-10 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'input' ? (
            <motion.div 
              key="input-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 space-y-8"
            >
              {/* Header Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-slate-500">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-[11px] font-black uppercase tracking-widest">Kelas</label>
                  </div>
                  <div className="relative group">
                    <select 
                      value={mapelKelas} 
                      onChange={e => setMapelKelas(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer appearance-none transition-all pr-12 shadow-sm group-hover:border-slate-300"
                    >
                      {availableKelasOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-[11px] font-black uppercase tracking-widest">Mata Pelajaran</label>
                  </div>
                  <div className="relative group">
                    <select 
                      value={mapelNama} 
                      onChange={e => setMapelNama(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer appearance-none transition-all pr-12 shadow-sm group-hover:border-slate-300"
                    >
                      {subjectsOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-slate-500">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-[11px] font-black uppercase tracking-widest">Guru Pengajar</label>
                  </div>
                  <div className="relative group">
                    <select 
                      value={mapelGuru} 
                      onChange={e => setMapelGuru(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer appearance-none transition-all pr-12 shadow-sm group-hover:border-slate-300"
                    >
                      {teachersOptions.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-[11px] font-black uppercase tracking-widest">Jam Ke- / Waktu</label>
                  </div>
                  <div className="relative group">
                    <select 
                      value={mapelJam} 
                      onChange={e => setMapelJam(e.target.value)}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:text-slate-950 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 cursor-pointer appearance-none transition-all pr-12 shadow-sm group-hover:border-slate-300"
                    >
                      {hoursOptions.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal Entry Section */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Materi Pembelajaran / Ringkasan Jurnal Kelas</label>
                  <textarea 
                    rows={3} 
                    value={mapelMateri} 
                    onChange={e => setMapelMateri(e.target.value)}
                    placeholder="Tuliskan ringkasan materi atau jurnal mengajar di sini..."
                    className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Tujuan Pembelajaran</label>
                    <textarea 
                      rows={2} 
                      value={mapelTujuan} 
                      onChange={e => setMapelTujuan(e.target.value)}
                      placeholder="Tuliskan tujuan pembelajaran untuk sesi ini..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Metode Pembelajaran</label>
                    <textarea 
                      rows={2} 
                      value={mapelMetode} 
                      onChange={e => setMapelMetode(e.target.value)}
                      placeholder="Contoh: Diskusi Kelompok, Ceramah Interaktif, PBL, Demonstrasi..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Media Pembelajaran</label>
                    <textarea 
                      rows={3} 
                      value={mapelMedia} 
                      onChange={e => setMapelMedia(e.target.value)}
                      placeholder="Contoh: Proyektor, Slide PPT, Papan Tulis, Alat Peraga..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Refleksi Pembelajaran</label>
                    <textarea 
                      rows={3} 
                      value={mapelRefleksi} 
                      onChange={e => setMapelRefleksi(e.target.value)}
                      placeholder="Evaluasi kelas, kesulitan siswa, atau temuan menarik..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-3 block">Tindak Lanjut</label>
                    <textarea 
                      rows={3} 
                      value={mapelTindakLanjut} 
                      onChange={e => setMapelTindakLanjut(e.target.value)}
                      placeholder="Rencana remidial, pengayaan, atau pekerjaan rumah..."
                      className="w-full p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:text-slate-950 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm transition-all placeholder:text-slate-400" 
                    />
                  </div>
                </div>
              </div>

              {/* Attendance Checklist Grid */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Daftar Kehadiran Siswa <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full ml-2">({classSiswaMapelList.length} Siswa)</span>
                  </h4>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Hadir</span>
                    <span className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3 text-amber-500" /> Sakit</span>
                    <span className="flex items-center gap-1.5"><HelpCircle className="w-3 h-3 text-blue-500" /> Izin</span>
                    <span className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-rose-500" /> Alpha</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {classSiswaMapelList.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300 col-span-2 space-y-3"
                      >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Tidak ada data siswa</p>
                        <p className="text-xs text-slate-400 px-10">Silakan tambahkan siswa di kelas <span className="text-slate-900">{mapelKelas}</span> melalui menu Database Siswa.</p>
                      </motion.div>
                    ) : (
                      classSiswaMapelList.map((s, index) => {
                        const status = localMapelState[s.id] || 'Hadir';
                        return (
                          <motion.div 
                            key={s.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                              status === 'Hadir' ? 'bg-white border-slate-100 hover:border-amber-200' :
                              status === 'Sakit' ? 'bg-amber-50/30 border-amber-100 hover:border-amber-200' :
                              status === 'Izin' ? 'bg-blue-50/30 border-blue-100 hover:border-blue-200' :
                              'bg-rose-50/30 border-rose-100 hover:border-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-colors shadow-sm ${
                                status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                                status === 'Sakit' ? 'bg-amber-100 text-amber-700' :
                                status === 'Izin' ? 'bg-blue-100 text-blue-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {s.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-sm tracking-tight">{s.nama}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NISN: {s.nisn}</span>
                              </div>
                            </div>
                            
                            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                              {(['Hadir', 'Sakit', 'Izin', 'Alpha'] as StatusAbsensi[]).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setLocalMapelState(prev => ({ ...prev, [s.id]: st }))}
                                  className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                    status === st 
                                      ? st === 'Hadir' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : st === 'Sakit' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                        : st === 'Izin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                  }`}
                                >
                                  {st[0]}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-6 border-t border-slate-100">
                <div>
                  {spreadsheetUrl ? (
                    <a 
                      href={spreadsheetUrl} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      rel="noopener noreferrer" 
                      className="group flex items-center gap-3 p-3 bg-amber-50 rounded-2xl transition-all hover:bg-amber-100"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">Google Drive Sync</p>
                        <p className="text-xs font-bold text-amber-700">Buka Database Spreadsheet</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 p-2 italic text-xs">
                      <AlertCircle className="w-4 h-4" />
                      Sync Google Drive belum aktif
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSaveAbsensiMapel}
                  disabled={savingToDrive}
                  className={`group relative overflow-hidden px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm transition-all flex items-center gap-3 shadow-2xl shadow-slate-900/30 active:scale-95 ${
                    savingToDrive ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {savingToDrive ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Menyinkronkan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" /> 
                      <span>Simpan & Sync Jurnal</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="rekap-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <RekapJurnal 
                absensiKelasList={absensiKelasList}
                siswaList={siswaList}
                guruList={guruList}
                rombelList={rombelList}
                mapelList={mapelList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* History Section - Only show when in input mode */}
      {viewMode === 'input' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-800 text-lg tracking-tight">Riwayat Jurnal Kelas</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-black rounded-xl border border-blue-100 transition-all cursor-pointer shadow-sm shadow-blue-500/5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Review Tabel Jurnal</span>
            </button>
            <button
              onClick={handleExportCustomExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black rounded-xl border border-emerald-100 transition-all cursor-pointer shadow-sm shadow-emerald-500/5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Rekap Excel Kotak</span>
            </button>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 uppercase tracking-wider">Record Terbaru</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {absensiKelasList.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.tanggal}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{item.jamKe.split(' (')[0]}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      title="Hapus Jurnal Kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="font-black text-slate-900 text-sm">{item.mataPelajaran} <span className="text-slate-400 font-bold ml-1">— {item.kelas}</span></div>
                  <p className="text-xs text-slate-500 font-bold">Guru: {item.guruNama}</p>
                  
                  <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Materi / Jurnal:</span>
                      <p className="text-slate-700 italic">"{item.materi}"</p>
                    </div>

                    {item.tujuanPembelajaran && (
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tujuan Pembelajaran:</span>
                        <p className="text-slate-700">{item.tujuanPembelajaran}</p>
                      </div>
                    )}

                    {item.metodePembelajaran && (
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Metode Pembelajaran:</span>
                        <p className="text-slate-700">{item.metodePembelajaran}</p>
                      </div>
                    )}

                    {item.mediaPembelajaran && (
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Media Pembelajaran:</span>
                        <p className="text-slate-700">{item.mediaPembelajaran}</p>
                      </div>
                    )}

                    {item.refleksi && (
                      <div className="p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10 mt-1">
                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">Refleksi Guru:</span>
                        <p className="text-slate-700 italic">"{item.refleksi}"</p>
                      </div>
                    )}

                    {item.tindakLanjut && (
                      <div className="p-2.5 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">Tindak Lanjut:</span>
                        <p className="text-slate-700">{item.tindakLanjut}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {absensiKelasList.length === 0 && (
            <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <History className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400 font-bold italic uppercase tracking-widest">Belum ada riwayat jurnal kelas</p>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Custom Delete Confirmation Modal */}
    <AnimatePresence>
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-800 text-base">Hapus Jurnal Kelas?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Apakah Anda yakin ingin menghapus jurnal kelas ini? Data kehadiran siswa untuk sesi ini juga akan dihapus secara permanen dari sistem dan Google Sheets.
            </p>
            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteJurnal(deletingId)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/10 transition-all"
              >
                Ya, Hapus Jurnal
              </button>
            </div>
          </motion.div>
      {/* Review Jurnal Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full border border-slate-150 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-600" />
                    Review Tabel Jurnal Kelas
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Tinjau seluruh data pembelajaran dan presensi kelas dalam format tabel yang rapi.</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150">
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider text-center w-12">No</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">Kelas</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">Mata Pelajaran</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">Guru</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">Materi</th>
                      <th className="px-4 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {absensiKelasList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 italic">Belum ada data jurnal kelas.</td>
                      </tr>
                    ) : (
                      absensiKelasList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.tanggal}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">{item.kelas}</span></td>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.mataPelajaran}</td>
                          <td className="px-4 py-3 text-slate-500">{item.guruNama}</td>
                          <td className="px-4 py-3 max-w-[180px] truncate">{item.materi}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedReviewJurnal(item)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[11px] font-black transition-all cursor-pointer"
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleExportCustomExcel}
                  className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/15"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel Kotak</span>
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Review Detail Modal */}
      <AnimatePresence>
        {selectedReviewJurnal && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-150 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedReviewJurnal.kelas}</span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedReviewJurnal.jamKe.split(' (')[0]}</span>
                    <span className="text-slate-400 text-xs font-bold">{selectedReviewJurnal.tanggal}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">{selectedReviewJurnal.mataPelajaran}</h3>
                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Guru: {selectedReviewJurnal.guruNama}</p>
                </div>
                <button
                  onClick={() => setSelectedReviewJurnal(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid content */}
              <div className="space-y-5">
                {/* 1. Jurnal / Materi */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Materi / Ringkasan Jurnal:</span>
                  <p className="text-slate-800 text-sm font-medium leading-relaxed italic">"{selectedReviewJurnal.materi}"</p>
                </div>

                {/* 2. Tujuan & Metode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Tujuan Pembelajaran:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedReviewJurnal.tujuanPembelajaran || 'Tidak diisi'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Metode Pembelajaran:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedReviewJurnal.metodePembelajaran || 'Tidak diisi'}</p>
                  </div>
                </div>

                {/* 3. Media */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Media Pembelajaran:</span>
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedReviewJurnal.mediaPembelajaran || 'Tidak diisi'}</p>
                </div>

                {/* 4. Refleksi & Tindak Lanjut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block mb-1">Refleksi Guru:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed italic">"{selectedReviewJurnal.refleksi || 'Tidak diisi'}"</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block mb-1">Tindak Lanjut:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedReviewJurnal.tindakLanjut || 'Tidak diisi'}</p>
                  </div>
                </div>

                {/* 5. Kehadiran */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Presensi Kehadiran Siswa:</span>
                  <div className="flex gap-4">
                    {(() => {
                      const c: Record<StatusAbsensi, number> = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
                      if (selectedReviewJurnal.kehadiranMap) {
                        (Object.values(selectedReviewJurnal.kehadiranMap) as StatusAbsensi[]).forEach(status => {
                          if (c[status] !== undefined) c[status]++;
                        });
                      }
                      return (
                        <>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Hadir: {c.Hadir}</span>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Sakit: {c.Sakit}</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Izin: {c.Izin}</span>
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">Alpha: {c.Alpha}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedReviewJurnal(null)}
                  className="px-5 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  </div>
);
};
