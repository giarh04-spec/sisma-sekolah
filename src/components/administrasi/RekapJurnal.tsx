import React, { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  BookOpen,
  User,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  FileText,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AbsensiSiswaKelas, 
  Siswa, 
  Guru, 
  MataPelajaranItem, 
  RombelKelas,
  StatusAbsensi
} from '../../types/school';

interface RekapJurnalProps {
  absensiKelasList: AbsensiSiswaKelas[];
  siswaList: Siswa[];
  guruList: Guru[];
  rombelList: RombelKelas[];
  mapelList: MataPelajaranItem[];
}

export const RekapJurnal: React.FC<RekapJurnalProps> = ({
  absensiKelasList,
  siswaList,
  guruList,
  rombelList,
  mapelList
}) => {
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterMapel, setFilterMapel] = useState('Semua');
  const [filterGuru, setFilterGuru] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedJurnal, setSelectedJurnal] = useState<AbsensiSiswaKelas | null>(null);

  // Options for filters
  const classes = useMemo(() => ['Semua', ...Array.from(new Set(absensiKelasList.map(a => a.kelas)))].sort(), [absensiKelasList]);
  const subjects = useMemo(() => ['Semua', ...Array.from(new Set(absensiKelasList.map(a => a.mataPelajaran)))].sort(), [absensiKelasList]);
  const teachers = useMemo(() => ['Semua', ...Array.from(new Set(absensiKelasList.map(a => a.guruNama)))].sort(), [absensiKelasList]);

  const filteredJurnals = useMemo(() => {
    return absensiKelasList.filter(item => {
      const matchKelas = filterKelas === 'Semua' || item.kelas === filterKelas;
      const matchMapel = filterMapel === 'Semua' || item.mataPelajaran === filterMapel;
      const matchGuru = filterGuru === 'Semua' || item.guruNama === filterGuru;
      const matchSearch = item.materi.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.mataPelajaran.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchDate = true;
      if (dateRange.start) matchDate = matchDate && item.tanggal >= dateRange.start;
      if (dateRange.end) matchDate = matchDate && item.tanggal <= dateRange.end;

      return matchKelas && matchMapel && matchGuru && matchSearch && matchDate;
    });
  }, [absensiKelasList, filterKelas, filterMapel, filterGuru, searchTerm, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpha = 0;
    let totalSiswa = 0;

    filteredJurnals.forEach(j => {
      (Object.values(j.kehadiranMap) as StatusAbsensi[]).forEach(status => {
        if (status === 'Hadir') hadir++;
        else if (status === 'Sakit') sakit++;
        else if (status === 'Izin') izin++;
        else if (status === 'Alpha') alpha++;
        totalSiswa++;
      });
    });

    return { hadir, sakit, izin, alpha, totalSiswa };
  }, [filteredJurnals]);

  const percentage = (val: number) => {
    if (stats.totalSiswa === 0) return 0;
    return Math.round((val / stats.totalSiswa) * 100);
  };

  const handleExport = async () => {
    // Helper to format date from YYYY-MM-DD to DD/MM/YYYY
    const formatDateForExport = (dateStr: string) => {
      if (!dateStr.includes('-')) return dateStr;
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rekap Jurnal');

    // Define columns
    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Mata Pelajaran', key: 'mataPelajaran', width: 25 },
      { header: 'Guru', key: 'guru', width: 25 },
      { header: 'Jam', key: 'jam', width: 20 },
      { header: 'Materi', key: 'materi', width: 40 },
      { header: 'Tujuan Pembelajaran', key: 'tujuanPembelajaran', width: 40 },
      { header: 'Metode Pembelajaran', key: 'metodePembelajaran', width: 30 },
      { header: 'Media Pembelajaran', key: 'mediaPembelajaran', width: 30 },
      { header: 'Refleksi', key: 'refleksi', width: 40 },
      { header: 'Tindak Lanjut', key: 'tindakLanjut', width: 40 },
      { header: 'Hadir', key: 'hadir', width: 10 },
      { header: 'Sakit', key: 'sakit', width: 10 },
      { header: 'Izin', key: 'izin', width: 10 },
      { header: 'Alpha', key: 'alpha', width: 10 },
    ];

    // Format Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: '000000' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F2F2F2' } // Light Gray
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Borders to Header
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add Data
    filteredJurnals.forEach(j => {
      const itemCounts: Record<StatusAbsensi, number> = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
      (Object.values(j.kehadiranMap) as StatusAbsensi[]).forEach(s => itemCounts[s]++);

      const row = worksheet.addRow({
        tanggal: formatDateForExport(j.tanggal),
        kelas: j.kelas,
        mataPelajaran: j.mataPelajaran,
        guru: j.guruNama,
        jam: j.jamKe,
        materi: j.materi,
        tujuanPembelajaran: j.tujuanPembelajaran || '',
        metodePembelajaran: j.metodePembelajaran || '',
        mediaPembelajaran: j.mediaPembelajaran || '',
        refleksi: j.refleksi || '',
        tindakLanjut: j.tindakLanjut || '',
        hadir: itemCounts.Hadir,
        sakit: itemCounts.Sakit,
        izin: itemCounts.Izin,
        alpha: itemCounts.Alpha,
      });

      // Style row cells
      row.eachCell((cell, colNumber) => {
        // Alignment
        if (colNumber >= 7) { // Hadir, Sakit, Izin, Alpha
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }

        // Borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `rekap_jurnal_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Premium Header Card */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20">
              <FileSpreadsheet className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Rekapitulasi Jurnal & Kehadiran</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Analisis data pembelajaran dan tingkat kehadiran siswa secara komprehensif</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-black transition-all flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-500" /> Export CSV / Excel
            </button>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400">
              <TrendingUp className="w-3 h-3" /> Live Statistics
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute left-1/2 top-0 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <div className="p-2 bg-slate-50 rounded-lg"><Users className="w-4 h-4" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Total Record</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{filteredJurnals.length}</div>
          <div className="text-[10px] font-bold text-slate-400">Jurnal Pertemuan</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Hadir</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.hadir}</div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400">Kumulatif Siswa</div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">{percentage(stats.hadir)}%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Sakit</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.sakit}</div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400">Kumulatif Siswa</div>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black">{percentage(stats.sakit)}%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><HelpCircle className="w-4 h-4" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Izin</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.izin}</div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400">Kumulatif Siswa</div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black">{percentage(stats.izin)}%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-rose-500 mb-2">
            <div className="p-2 bg-rose-50 rounded-lg"><XCircle className="w-4 h-4" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Alpha</span>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.alpha}</div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400">Kumulatif Siswa</div>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black">{percentage(stats.alpha)}%</span>
          </div>
        </motion.div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <Search className="w-3.5 h-3.5" />
              <label className="text-[10px] font-black uppercase tracking-widest">Cari Materi</label>
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik kata kunci..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <label className="text-[10px] font-black uppercase tracking-widest">Kelas</label>
            </div>
            <select 
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 transition-all appearance-none"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <BookOpen className="w-3.5 h-3.5" />
              <label className="text-[10px] font-black uppercase tracking-widest">Mata Pelajaran</label>
            </div>
            <select 
              value={filterMapel}
              onChange={e => setFilterMapel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 transition-all appearance-none"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <User className="w-3.5 h-3.5" />
              <label className="text-[10px] font-black uppercase tracking-widest">Guru Pengampu</label>
            </div>
            <select 
              value={filterGuru}
              onChange={e => setFilterGuru(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50 transition-all appearance-none"
            >
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 ml-1">
              <Calendar className="w-3.5 h-3.5" />
              <label className="text-[10px] font-black uppercase tracking-widest">Rentang Tanggal</label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:outline-none transition-all"
              />
              <span className="text-slate-300">-</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Data List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Info Pertemuan</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Guru & Mata Pelajaran</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Materi / Ringkasan Jurnal</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100">Statistik Kehadiran</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredJurnals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic text-sm">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredJurnals.map((item, idx) => {
                    const counts: Record<StatusAbsensi, number> = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
                    (Object.values(item.kehadiranMap) as StatusAbsensi[]).forEach(s => counts[s]++);
                    const totalInItem = Object.values(item.kehadiranMap).length;

                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setSelectedJurnal(item)}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-slate-900 text-sm tracking-tight">{item.tanggal}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black">{item.jamKe.split(' (')[0]}</span>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[9px] font-black">{item.kelas}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm leading-none mb-1.5">{item.mataPelajaran}</span>
                            <span className="text-xs text-slate-500 font-medium">{item.guruNama}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 max-w-md">
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 italic">"{item.materi}"</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-1">
                              {counts.Hadir > 0 && <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white" title="Hadir">{counts.Hadir}</div>}
                              {counts.Sakit > 0 && <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white" title="Sakit">{counts.Sakit}</div>}
                              {counts.Izin > 0 && <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white" title="Izin">{counts.Izin}</div>}
                              {counts.Alpha > 0 && <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white" title="Alpha">{counts.Alpha}</div>}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">/ {totalInItem} Siswa</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJurnal(item);
                            }}
                            className="p-2.5 hover:bg-white hover:shadow-md hover:text-amber-500 text-slate-400 rounded-xl transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Jurnal Modal */}
      <AnimatePresence>
        {selectedJurnal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedJurnal.kelas}</span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{selectedJurnal.jamKe.split(' (')[0]}</span>
                    <span className="text-slate-400 text-xs font-bold">{selectedJurnal.tanggal}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">{selectedJurnal.mataPelajaran}</h3>
                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Guru: {selectedJurnal.guruNama}</p>
                </div>
                <button
                  onClick={() => setSelectedJurnal(null)}
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
                  <p className="text-slate-800 text-sm font-medium leading-relaxed italic">"{selectedJurnal.materi}"</p>
                </div>

                {/* 2. Tujuan & Metode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Tujuan Pembelajaran:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedJurnal.tujuanPembelajaran || 'Tidak diisi'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Metode Pembelajaran:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedJurnal.metodePembelajaran || 'Tidak diisi'}</p>
                  </div>
                </div>

                {/* 3. Media */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Media Pembelajaran:</span>
                  <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedJurnal.mediaPembelajaran || 'Tidak diisi'}</p>
                </div>

                {/* 4. Refleksi & Tindak Lanjut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block mb-1">Refleksi Guru:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed italic">"{selectedJurnal.refleksi || 'Tidak diisi'}"</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block mb-1">Tindak Lanjut:</span>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedJurnal.tindakLanjut || 'Tidak diisi'}</p>
                  </div>
                </div>

                {/* 5. Kehadiran */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Presensi Kehadiran Siswa:</span>
                  <div className="flex gap-4">
                    {(() => {
                      const c: Record<StatusAbsensi, number> = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
                      (Object.values(selectedJurnal.kehadiranMap) as StatusAbsensi[]).forEach(status => c[status]++);
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

                  {/* List of absent students if any */}
                  {(() => {
                    const absentList = Object.entries(selectedJurnal.kehadiranMap)
                      .filter(([_, status]) => status !== 'Hadir')
                      .map(([sId, status]) => {
                        const sName = siswaList.find(s => s.id === sId)?.nama || 'Siswa';
                        return { id: sId, name: sName, status };
                      });
                    
                    if (absentList.length > 0) {
                      return (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Keterangan Khusus Ketidakhadiran:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {absentList.map(a => (
                              <div key={a.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-150 text-[11px] font-bold">
                                <span className="text-slate-700 truncate max-w-[150px]">{a.name}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  a.status === 'Sakit' ? 'bg-amber-50 text-amber-700' :
                                  a.status === 'Izin' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                                }`}>{a.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Footer action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedJurnal(null)}
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
  );
};
