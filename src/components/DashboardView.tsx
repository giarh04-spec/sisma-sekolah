import React from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  CalendarCheck, 
  Laptop, 
  FileSpreadsheet, 
  Wallet, 
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';
import { Siswa, Guru, Staf, AbsensiGuru, AbsensiSiswaHarian, TagihanKeuangan, UjianCBT, Role } from '../types/school';

interface DashboardViewProps {
  siswaList: Siswa[];
  guruList: Guru[];
  stafList: Staf[];
  absensiGuru: AbsensiGuru[];
  absensiSiswa: AbsensiSiswaHarian[];
  tagihanList: TagihanKeuangan[];
  ujianList: UjianCBT[];
  onNavigateTab: (tab: any) => void;
  userGoogleToken: string;
  currentRole?: Role;
  userEmail?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  siswaList,
  guruList,
  stafList,
  absensiGuru,
  absensiSiswa,
  tagihanList,
  ujianList,
  onNavigateTab,
  userGoogleToken,
  currentRole = 'admin',
  userEmail = 'pengguna.sekolah@gmail.com'
}) => {
  // Calculations
  const totalSiswa = siswaList.length;
  const totalGuru = guruList.length;
  const totalStaf = stafList.length;

  const siswaHadir = absensiSiswa.filter(a => a.status === 'Hadir').length;
  const persenKehadiranSiswa = totalSiswa ? Math.round((siswaHadir / totalSiswa) * 100) : 0;

  const guruHadir = absensiGuru.filter(a => a.status === 'Hadir').length;
  
  const totalPenerimaan = tagihanList.reduce((acc, curr) => acc + curr.terbayar, 0);
  const totalTunggakan = tagihanList.reduce((acc, curr) => acc + (curr.nominal - curr.terbayar), 0);

  return (
    <div className="space-y-6">
      
      {/* Banner Top Welcome */}
      <div className="bg-[#121212] border border-slate-800 rounded-xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Portal SIM Sekolah 2026
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase border ${
              currentRole === 'admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
              currentRole === 'guru' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
              currentRole === 'staf' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              Akses: {currentRole}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Selamat Datang, {currentRole === 'admin' ? 'Administrator Sekolah' : currentRole === 'guru' ? 'Bapak/Ibu Guru Pendidik' : currentRole === 'staf' ? 'Staf Tata Usaha & Keuangan' : 'Siswa / Wali Murid'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {currentRole === 'admin' && 'Akses penuh seluruh modul sistem: Manajemen Database Siswa/Guru/Staf, Absensi QR, Ujian CBT, Modul Ajar, serta Laporan Keuangan SPP terintegrasi Google Workspace.'}
            {currentRole === 'guru' && 'Akses khusus Pendidik: Presensi Harian/Kelas, Bank Soal & Ujian Online CBT Anti-Cheat, Administrasi Guru (Modul Ajar, CP, ATP & Prota).'}
            {currentRole === 'staf' && 'Akses Tata Usaha & Administrasi: Pengelolaan Data Master Sekolah, Rekapitulasi Absensi Pegawai/Siswa, dan Pembayaran SPP Keuangan.'}
            {currentRole === 'siswa' && 'Akses Portal Siswa/Wali: Informasi Jadwal Ujian CBT, Kartu Digital QR Presensi, Rekap Kehadiran dan Tagihan SPP Bulanan.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('keuangan')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Google Sheets
          </button>
          <button
            onClick={() => onNavigateTab('cbt')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-all border border-slate-700 flex items-center gap-2"
          >
            <Laptop className="w-4 h-4 text-blue-400" /> Ujian CBT & Bank Soal
          </button>
        </div>
      </div>

      {/* Grid Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#121212] border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Siswa</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalSiswa}</span>
            <span className="text-xs text-slate-500">Siswa Aktif</span>
          </div>
          <p className="text-xs text-blue-400 mt-2">Kehadiran Hari Ini: <span className="font-semibold">{persenKehadiranSiswa}%</span> ({siswaHadir}/{totalSiswa})</p>
        </div>

        <div className="bg-[#121212] border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Guru & Staf</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalGuru + totalStaf}</span>
            <span className="text-xs text-slate-500">Personel</span>
          </div>
          <p className="text-xs text-green-400 mt-2">{guruHadir}/{totalGuru} Guru hadir di lokasi</p>
        </div>

        <div className="bg-[#121212] border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ujian CBT Aktif</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">0{ujianList.length}</span>
            <span className="text-xs text-slate-500">Ujian Aktif</span>
          </div>
          <p className="text-xs text-amber-400 mt-2">UTS Ganjil Sedang Berlangsung</p>
        </div>

        <div className="bg-[#121212] border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Keuangan SPP</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">
              Rp {totalPenerimaan.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Tunggakan Siswa: <span className="font-semibold text-amber-400">Rp {totalTunggakan.toLocaleString('id-ID')}</span></p>
        </div>

      </div>

      {/* Middle Section: Modular Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Quick Actions & Navigation */}
        <div className="lg:col-span-2 bg-[#121212] rounded-xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Modul Administrasi & Fitur Utama
            </h3>
            <span className="text-xs font-semibold text-slate-500">Akses Cepat</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div 
              onClick={() => onNavigateTab('absensi')}
              className="p-4 rounded-xl border border-slate-800 bg-[#181818] hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Absensi Siswa & Guru</h4>
                    <p className="text-xs text-slate-400">Harian, kelas mapel, clock-in/out guru</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('cbt')}
              className="p-4 rounded-xl border border-slate-800 bg-[#181818] hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">CBT Bank Soal & AI</h4>
                    <p className="text-xs text-slate-400">Template PG, Isian, Esai + Import</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('administrasi')}
              className="p-4 rounded-xl border border-slate-800 bg-[#181818] hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Administrasi Kurikulum</h4>
                    <p className="text-xs text-slate-400">Modul Ajar, ATP, CP, Jurnal, Prota, Prosem</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>

            <div 
              onClick={() => onNavigateTab('keuangan')}
              className="p-4 rounded-xl border border-slate-800 bg-[#181818] hover:border-blue-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Keuangan & Google Sheets</h4>
                    <p className="text-xs text-slate-400">Tagihan SPP, UKT & Ekspor Drive</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>

          </div>
        </div>

        {/* Module 2: Status Google Drive Integration */}
        <div className="bg-[#121212] rounded-xl p-6 border border-slate-800 text-white shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <FileSpreadsheet className="w-4 h-4" /> Google Drive & Sheets Integration
            </div>
            <h3 className="text-lg font-bold">Laporan Spreadsheet Otomatis</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Semua data laporan keuangan (SPP, UKT, Ekskul), absensi harian & rekapitulasi siswa dapat diekspor langsung dalam format Google Sheets yang tersimpan di akun Google Drive Anda.
            </p>

            <div className="mt-4 p-3 bg-[#181818] rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Status Integrasi:</span>
                <span className={`font-bold ${userGoogleToken ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {userGoogleToken ? 'Terhubung (OAuth Ready)' : 'Belum Login Google'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Izin Akses:</span>
                <span className="text-slate-500 font-mono text-[10px]">spreadsheets & drive.file</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('keuangan')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Buka Panel Ekspor Keuangan
          </button>
        </div>

      </div>

    </div>
  );
};
