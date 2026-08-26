import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Laptop, 
  FileText, 
  Wallet,
  Sparkles,
  Settings,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Layers,
  BookOpen,
  Calendar,
  Play,
  CreditCard,
  Sliders,
  FileSpreadsheet,
  QrCode,
  Image,
  Cloud,
  MessageSquare,
  Clock,
  Building,
  Trophy,
  Coins
} from 'lucide-react';
import { Role, SubTab, AbsensiSubTab, CbtSubTab, KeuanganSubTab, AdministrasiSubTab, PengaturanSubTab } from '../types/school';

export type TabType = 'dashboard' | 'database' | 'absensi' | 'cbt' | 'administrasi' | 'keuangan' | 'pengaturan';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userGoogleToken: string;
  currentRole?: Role;
  databaseSubTab: SubTab;
  setDatabaseSubTab: (subTab: SubTab) => void;
  absensiSubTab?: AbsensiSubTab;
  setAbsensiSubTab?: (subTab: AbsensiSubTab) => void;
  cbtSubTab?: CbtSubTab;
  setCbtSubTab?: (subTab: CbtSubTab) => void;
  administrasiSubTab?: AdministrasiSubTab;
  setAdministrasiSubTab?: (subTab: AdministrasiSubTab) => void;
  keuanganSubTab?: KeuanganSubTab;
  setKeuanganSubTab?: (subTab: KeuanganSubTab) => void;
  pengaturanSubTab?: PengaturanSubTab;
  setPengaturanSubTab?: (subTab: PengaturanSubTab) => void;
  siswaCount: number;
  guruCount: number;
  stafCount: number;
  rombelCount: number;
  mapelCount: number;
  ekskulCount?: number;
  bankSoalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userGoogleToken,
  currentRole = 'admin',
  databaseSubTab,
  setDatabaseSubTab,
  absensiSubTab = 'scan_barcode',
  setAbsensiSubTab,
  cbtSubTab = 'bank_soal',
  setCbtSubTab,
  administrasiSubTab = 'perangkat',
  setAdministrasiSubTab,
  keuanganSubTab = 'pembayaran',
  setKeuanganSubTab,
  pengaturanSubTab = 'identitas',
  setPengaturanSubTab,
  siswaCount,
  guruCount,
  stafCount,
  rombelCount,
  mapelCount,
  ekskulCount = 0,
  bankSoalCount
}) => {
  const allMenuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string; desc: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      desc: 'Ringkasan Statistik'
    },
    {
      id: 'database',
      label: 'Database Sekolah',
      icon: <Users className="w-5 h-5" />,
      desc: 'Siswa, Guru, Staf'
    },
    {
      id: 'absensi',
      label: currentRole === 'guru' ? 'Absensi Kelas & Mapel' : 'Absensi Terpadu',
      icon: <CalendarCheck className="w-5 h-5" />,
      desc: currentRole === 'guru' ? 'Presensi Siswa Per Kelas' : 'Harian, Mapel & Guru'
    },
    {
      id: 'cbt',
      label: 'CBT Ujian & Soal',
      icon: <Laptop className="w-5 h-5" />,
      badge: 'Bank Soal',
      desc: 'PG, Isian, Esai'
    },
    {
      id: 'administrasi',
      label: 'Administrasi Guru',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Modul Ajar, Jadwal, Kalender'
    },
    {
      id: 'keuangan',
      label: 'Keuangan & Sheets',
      icon: <Wallet className="w-5 h-5" />,
      badge: userGoogleToken ? 'Drive Ready' : 'Sheets',
      desc: 'SPP, UKT & Drive'
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sekolah',
      icon: <Settings className="w-5 h-5" />,
      desc: 'Identitas & Logo'
    },
  ];

  // Filter menu items based on role
  const menuItems = allMenuItems.filter((item) => {
    if (currentRole === 'guru') {
      // Guru ONLY gets: absensi kelas, administrasi guru, cbt ujian (bank soal)
      return item.id === 'absensi' || item.id === 'administrasi' || item.id === 'cbt';
    }
    if (currentRole === 'staf') {
      return item.id === 'keuangan';
    }
    if (currentRole === 'siswa') {
      return item.id === 'dashboard' || item.id === 'absensi' || item.id === 'cbt' || item.id === 'keuangan';
    }
    // Admin gets all
    return true;
  });

  return (
    <aside className="w-full md:w-64 bg-[#121212] border border-slate-800 text-slate-300 flex-shrink-0 rounded-2xl p-4">
      <div className="space-y-3">
        {/* Active Role Indicator Box */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          currentRole === 'guru' ? 'bg-purple-950/40 border-purple-800/60 text-purple-300' :
          currentRole === 'admin' ? 'bg-blue-950/40 border-blue-800/60 text-blue-300' :
          currentRole === 'staf' ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' :
          'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {currentRole === 'guru' && <GraduationCap className="w-4 h-4 text-purple-400" />}
            {currentRole === 'admin' && <ShieldCheck className="w-4 h-4 text-blue-400" />}
            {currentRole === 'staf' && <UserCheck className="w-4 h-4 text-amber-400" />}
            {currentRole === 'siswa' && <Users className="w-4 h-4 text-emerald-400" />}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Akses Peran</div>
              <div className="text-xs font-black uppercase tracking-wide">
                {currentRole === 'guru' ? 'Guru / Pendidik' : currentRole === 'staf' ? 'Staf / Tata Usaha' : currentRole === 'siswa' ? 'Siswa / Wali' : 'Administrator'}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-1 pt-1">
          Menu Akses Fitur ({menuItems.length})
        </div>
        
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'keuangan' && currentRole === 'staf' && activeTab === 'database');
            
            if (item.id === 'database') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('database');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      <button
                        onClick={() => setDatabaseSubTab('siswa')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'siswa'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Data Siswa</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {siswaCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setDatabaseSubTab('guru')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'guru'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Data Guru</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {guruCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setDatabaseSubTab('staf')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'staf'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          <span>Data Staf</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {stafCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setDatabaseSubTab('rombel')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'rombel'
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Rombel & Kelas</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {rombelCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setDatabaseSubTab('mapel')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'mapel'
                            ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mata Pelajaran</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {mapelCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setDatabaseSubTab('ekskul')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          databaseSubTab === 'ekskul'
                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kelas Ekstrakurikuler</span>
                        </div>
                        <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {ekskulCount}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'absensi') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('absensi');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items for Absensi */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      {/* 1. Scan Barcode / QR */}
                      <button
                        onClick={() => {
                          setActiveTab('absensi');
                          if (setAbsensiSubTab) setAbsensiSubTab('scan_barcode');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          absensiSubTab === 'scan_barcode'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <QrCode className="w-3.5 h-3.5 text-blue-400" />
                          <span>Scan Barcode / QR</span>
                        </div>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.5 rounded font-bold">
                          Kamera
                        </span>
                      </button>

                      {/* 2. Absensi Harian Siswa */}
                      {currentRole !== 'guru' && (
                        <button
                          onClick={() => {
                            setActiveTab('absensi');
                            if (setAbsensiSubTab) setAbsensiSubTab('harian_siswa');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                            absensiSubTab === 'harian_siswa'
                              ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Absensi Harian Siswa</span>
                          </div>
                        </button>
                      )}

                      {/* 3. Absensi Kelas Per Mapel */}
                      <button
                        onClick={() => {
                          setActiveTab('absensi');
                          if (setAbsensiSubTab) setAbsensiSubTab('kelas_mapel');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          absensiSubTab === 'kelas_mapel'
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Absensi Kelas Per Mapel</span>
                        </div>
                      </button>

                      {/* 4. Presensi Guru */}
                      {currentRole !== 'guru' && (
                        <button
                          onClick={() => {
                            setActiveTab('absensi');
                            if (setAbsensiSubTab) setAbsensiSubTab('absensi_guru');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                            absensiSubTab === 'absensi_guru'
                              ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>Presensi Guru</span>
                          </div>
                        </button>
                      )}

                      {/* 5. Redaksi Notifikasi WA */}
                      {currentRole !== 'guru' && (
                        <button
                          onClick={() => {
                            setActiveTab('absensi');
                            if (setAbsensiSubTab) setAbsensiSubTab('redaksi');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                            absensiSubTab === 'redaksi'
                              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Redaksi Notifikasi WA</span>
                          </div>
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.5 rounded font-bold">
                            Baru
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'cbt') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('cbt');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items for CBT */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      {/* 1. Bank Soal */}
                      <button
                        onClick={() => {
                          setActiveTab('cbt');
                          if (setCbtSubTab) setCbtSubTab('bank_soal');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          cbtSubTab === 'bank_soal'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>Bank Soal Ujian</span>
                        </div>
                        {bankSoalCount !== undefined && (
                          <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {bankSoalCount}
                          </span>
                        )}
                      </button>

                      {/* 2. Jadwal & Kartu Ujian */}
                      {currentRole !== 'guru' && (
                        <button
                          onClick={() => {
                            setActiveTab('cbt');
                            if (setCbtSubTab) setCbtSubTab('jadwal_kartu');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                            cbtSubTab === 'jadwal_kartu'
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Jadwal & Kartu Ujian</span>
                          </div>
                        </button>
                      )}

                      {/* 3. Simulasi CBT Anti-Cheat */}
                      <button
                        onClick={() => {
                          setActiveTab('cbt');
                          if (setCbtSubTab) setCbtSubTab('simulasi_ujian');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          cbtSubTab === 'simulasi_ujian'
                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulasi CBT Anti-Cheat</span>
                        </div>
                      </button>

                      {/* 4. Hasil Ujian (Firebase) */}
                      <button
                        onClick={() => {
                          setActiveTab('cbt');
                          if (setCbtSubTab) setCbtSubTab('hasil_ujian');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          cbtSubTab === 'hasil_ujian'
                            ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Hasil Ujian (Firebase)</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'administrasi') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('administrasi');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items for Administrasi Guru */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      <button
                        onClick={() => {
                          setActiveTab('administrasi');
                          if (setAdministrasiSubTab) setAdministrasiSubTab('perangkat');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          administrasiSubTab === 'perangkat'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Dokumen Administrasi</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('administrasi');
                          if (setAdministrasiSubTab) setAdministrasiSubTab('jadwal');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          administrasiSubTab === 'jadwal'
                            ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Jadwal Mengajar</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('administrasi');
                          if (setAdministrasiSubTab) setAdministrasiSubTab('kalender');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          administrasiSubTab === 'kalender'
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Kalender Pendidikan</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'keuangan') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('keuangan');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-emerald-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-emerald-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items for Keuangan */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      {/* 1. Pembayaran Siswa */}
                      <button
                        onClick={() => {
                          setActiveTab('keuangan');
                          if (setKeuanganSubTab) setKeuanganSubTab('pembayaran');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          keuanganSubTab === 'pembayaran'
                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Pembayaran Siswa</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.5 rounded font-bold">
                          Kasir
                        </span>
                      </button>

                      {/* 2. Pengaturan Biaya UKT, SPP, Ekskul */}
                      <button
                        onClick={() => {
                          setActiveTab('keuangan');
                          if (setKeuanganSubTab) setKeuanganSubTab('pengaturan_biaya');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          keuanganSubTab === 'pengaturan_biaya'
                            ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pengaturan Tarif Biaya</span>
                        </div>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.5 rounded font-bold">
                          UKT/SPP
                        </span>
                      </button>

                      {/* 3. Rekap & Google Sheets */}
                      <button
                        onClick={() => {
                          setActiveTab('keuangan');
                          if (setKeuanganSubTab) setKeuanganSubTab('rekap');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          keuanganSubTab === 'rekap'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                          <span>Rekap & Fonnte WA</span>
                        </div>
                      </button>

                      {/* 4. Redaksi Notifikasi WA */}
                      <button
                        onClick={() => {
                          setActiveTab('keuangan');
                          if (setKeuanganSubTab) setKeuanganSubTab('redaksi');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          keuanganSubTab === 'redaksi'
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Redaksi Notifikasi WA</span>
                        </div>
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.5 rounded font-bold">
                          Baru
                        </span>
                      </button>

                      {/* 5. Pembayaran Gaji / Payroll */}
                      <button
                        onClick={() => {
                          setActiveTab('keuangan');
                          if (setKeuanganSubTab) setKeuanganSubTab('gaji');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          keuanganSubTab === 'gaji'
                            ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="w-3.5 h-3.5 text-rose-400" />
                          <span>Pembayaran Gaji (Payroll)</span>
                        </div>
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded font-bold animate-pulse">
                          Gaji
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'pengaturan') {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('pengaturan');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                        : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{item.label}</div>
                        <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isActive ? 'transform rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown nested items for Pengaturan */}
                  {isActive && (
                    <div className="pl-3 pr-1 py-1 space-y-1 border-l border-slate-800 ml-6 mt-1 transition-all">
                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('identitas');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'identitas'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-blue-400" />
                          <span>Identitas Sekolah</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('logo');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'logo'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Image className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Logo Sekolah</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('google_drive');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'google_drive'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Drive Sync</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('fonnte');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'fonnte'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Token Fonnte (WA)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('jadwal');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'jadwal'
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Jadwal Masuk/Pulang</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('pengaturan');
                          if (setPengaturanSubTab) setPengaturanSubTab('sistem');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all ${
                          pengaturanSubTab === 'sistem'
                            ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sistem & Database</span>
                        </div>
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded font-bold">
                          Reset
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-slate-800/90 text-blue-400 font-bold border border-slate-700/80 shadow-md ring-1 ring-blue-500/20'
                    : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none">{item.label}</div>
                    <div className={`text-[10px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Integration Callout */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 px-0.5">
          <div className="bg-[#0A0A0A] rounded-xl p-3 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Sekolah 2026
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {currentRole === 'guru' 
                ? 'Terhubung dengan Google Drive untuk menyimpan Modul Ajar, ATP & Bank Soal Ujian.'
                : 'Ekspor rekap keuangan & absensi langsung ke Google Drive & Spreadsheet secara otomatis.'}
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
};
