import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DatabaseView } from './components/DatabaseView';
import { AbsensiView } from './components/AbsensiView';
import { CbtView } from './components/CbtView';
import { AdministrasiGuruView } from './components/AdministrasiGuruView';
import { KeuanganView } from './components/KeuanganView';
import { PengaturanView } from './components/PengaturanView';
import { LoginView } from './components/LoginView';

import { 
  Role, 
  SubTab,
  AbsensiSubTab,
  CbtSubTab,
  KeuanganSubTab,
  PengaturanSubTab,
  TarifBiaya,
  Siswa, 
  Guru, 
  Staf, 
  RombelKelas,
  MataPelajaranItem,
  AbsensiSiswaHarian, 
  AbsensiSiswaKelas, 
  AbsensiGuru, 
  BankSoal, 
  UjianCBT, 
  AdministrasiGuru, 
  TagihanKeuangan, 
  TransaksiKeuangan,
  SchoolSettings
} from './types/school';

import { 
  INITIAL_ROMBEL,
  INITIAL_SISWA, 
  INITIAL_GURU, 
  INITIAL_STAF, 
  INITIAL_MAPEL,
  INITIAL_ABSENSI_SISWA_HARIAN, 
  INITIAL_ABSENSI_SISWA_KELAS, 
  INITIAL_ABSENSI_GURU, 
  INITIAL_BANK_SOAL, 
  INITIAL_UJIAN, 
  INITIAL_ADMINISTRASI, 
  INITIAL_TAGIHAN, 
  INITIAL_TRANSAKSI,
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_TARIF_BIAYA
} from './data/mockData';

import { initAuth, googleSignOut } from './lib/firebase';
import { exportAllToGoogleSheets } from './lib/googleDriveSync';

function getSavedData<T>(key: string, initial: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return initial;
    if (typeof initial === 'string') {
      try {
        return JSON.parse(saved) as T;
      } catch {
        return saved as unknown as T;
      }
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(initial) && initial.length > 0) {
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return initial;
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [databaseSubTab, setDatabaseSubTab] = useState<SubTab>('siswa');
  const [absensiSubTab, setAbsensiSubTab] = useState<AbsensiSubTab>('scan_barcode');
  const [cbtSubTab, setCbtSubTab] = useState<CbtSubTab>('bank_soal');
  const [keuanganSubTab, setKeuanganSubTab] = useState<KeuanganSubTab>('pembayaran');
  const [pengaturanSubTab, setPengaturanSubTab] = useState<PengaturanSubTab>('identitas');

  // Google OAuth Auth State
  const [userGoogleToken, setUserGoogleToken] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Main School Master Data
  const [rombelList, setRombelList] = useState<RombelKelas[]>(() => getSavedData('edu_rombelList', INITIAL_ROMBEL));
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => getSavedData('edu_siswaList', INITIAL_SISWA));
  const [guruList, setGuruList] = useState<Guru[]>(() => getSavedData('edu_guruList', INITIAL_GURU));
  const [stafList, setStafList] = useState<Staf[]>(() => getSavedData('edu_stafList', INITIAL_STAF));
  const [mapelList, setMapelList] = useState<MataPelajaranItem[]>(() => getSavedData('edu_mapelList', INITIAL_MAPEL));

  // Attendance State
  const [absensiHarian, setAbsensiHarian] = useState<AbsensiSiswaHarian[]>(() => getSavedData('edu_absensiHarian', INITIAL_ABSENSI_SISWA_HARIAN));
  const [absensiKelasList, setAbsensiKelasList] = useState<AbsensiSiswaKelas[]>(() => getSavedData('edu_absensiKelasList', INITIAL_ABSENSI_SISWA_KELAS));
  const [absensiGuruList, setAbsensiGuruList] = useState<AbsensiGuru[]>(() => getSavedData('edu_absensiGuruList', INITIAL_ABSENSI_GURU));

  // CBT State
  const [bankSoalList, setBankSoalList] = useState<BankSoal[]>(() => getSavedData('edu_bankSoalList', INITIAL_BANK_SOAL));
  const [ujianList, setUjianList] = useState<UjianCBT[]>(() => getSavedData('edu_ujianList', INITIAL_UJIAN));

  // Curriculum & Administration State
  const [administrasiList, setAdministrasiList] = useState<AdministrasiGuru[]>(() => getSavedData('edu_administrasiList', INITIAL_ADMINISTRASI));

  // Financial State
  const [tagihanList, setTagihanList] = useState<TagihanKeuangan[]>(() => getSavedData('edu_tagihanList', INITIAL_TAGIHAN));
  const [transaksiList, setTransaksiList] = useState<TransaksiKeuangan[]>(() => getSavedData('edu_transaksiList', INITIAL_TRANSAKSI));
  const [tarifBiayaList, setTarifBiayaList] = useState<TarifBiaya[]>(() => getSavedData('edu_tarifBiayaList', INITIAL_TARIF_BIAYA));

  // School Identity & Settings State
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = getSavedData('edu_schoolSettings', INITIAL_SCHOOL_SETTINGS);
    if (!saved || !saved.namaSekolah || saved.namaSekolah === 'SEKOLAH MENENGAH ATAS WORKSPACE 2026' || saved.namaSekolah === 'My App' || saved.namaSekolah === 'Untitled' || saved.namaSekolah === 'SMP Modern Al Fakhir') {
      return INITIAL_SCHOOL_SETTINGS;
    }
    return {
      ...INITIAL_SCHOOL_SETTINGS,
      ...saved,
      namaSekolah: saved.namaSekolah === 'SMP Modern Al Fakhir' ? INITIAL_SCHOOL_SETTINGS.namaSekolah : (saved.namaSekolah || INITIAL_SCHOOL_SETTINGS.namaSekolah),
      npsn: saved.npsn || INITIAL_SCHOOL_SETTINGS.npsn,
      akreditasi: saved.akreditasi || INITIAL_SCHOOL_SETTINGS.akreditasi,
      logoUrl: saved.logoUrl && !saved.logoUrl.includes('unsplash') ? saved.logoUrl : INITIAL_SCHOOL_SETTINGS.logoUrl,
    };
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getSavedData('edu_theme', 'dark'));

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('edu_theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('edu_rombelList', JSON.stringify(rombelList));
  }, [rombelList]);

  useEffect(() => {
    localStorage.setItem('edu_siswaList', JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem('edu_guruList', JSON.stringify(guruList));
  }, [guruList]);

  useEffect(() => {
    localStorage.setItem('edu_stafList', JSON.stringify(stafList));
  }, [stafList]);

  useEffect(() => {
    localStorage.setItem('edu_mapelList', JSON.stringify(mapelList));
  }, [mapelList]);

  useEffect(() => {
    localStorage.setItem('edu_absensiHarian', JSON.stringify(absensiHarian));
  }, [absensiHarian]);

  useEffect(() => {
    localStorage.setItem('edu_absensiKelasList', JSON.stringify(absensiKelasList));
  }, [absensiKelasList]);

  useEffect(() => {
    localStorage.setItem('edu_absensiGuruList', JSON.stringify(absensiGuruList));
  }, [absensiGuruList]);

  useEffect(() => {
    localStorage.setItem('edu_bankSoalList', JSON.stringify(bankSoalList));
  }, [bankSoalList]);

  useEffect(() => {
    localStorage.setItem('edu_ujianList', JSON.stringify(ujianList));
  }, [ujianList]);

  useEffect(() => {
    localStorage.setItem('edu_administrasiList', JSON.stringify(administrasiList));
  }, [administrasiList]);

  useEffect(() => {
    localStorage.setItem('edu_tagihanList', JSON.stringify(tagihanList));
  }, [tagihanList]);

  useEffect(() => {
    localStorage.setItem('edu_transaksiList', JSON.stringify(transaksiList));
  }, [transaksiList]);

  useEffect(() => {
    localStorage.setItem('edu_tarifBiayaList', JSON.stringify(tarifBiayaList));
  }, [tarifBiayaList]);

  useEffect(() => {
    localStorage.setItem('edu_schoolSettings', JSON.stringify(schoolSettings));
  }, [schoolSettings]);

  // Auto-sync effect to Google Drive when master data changes and auto-sync is enabled
  useEffect(() => {
    if (!schoolSettings.googleSyncEnabled || !userGoogleToken) {
      return;
    }

    const timer = setTimeout(async () => {
      // console.log('Triggering auto-sync to Google Drive Spreadsheet...');
      setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'syncing' }));

      try {
        const syncData = {
          siswaList,
          guruList,
          stafList,
          rombelList,
          mapelList,
          absensiHarian,
          absensiKelasList
        };

        const res = await exportAllToGoogleSheets(
          userGoogleToken,
          syncData,
          schoolSettings.googleSyncSpreadsheetId
        );

        if (res.success) {
          const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
          setSchoolSettings(prev => ({
            ...prev,
            googleSyncSpreadsheetId: res.spreadsheetId || '',
            googleSyncSpreadsheetUrl: res.url || '',
            googleSyncLastTime: nowStr,
            googleSyncStatus: 'success'
          }));
        } else {
          setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'failed' }));
        }
      } catch (err) {
        // console.error('Auto-sync error:', err);
        setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'failed' }));
      }
    }, 5000); // Debounce sync by 5 seconds

    return () => clearTimeout(timer);
  }, [
    siswaList,
    guruList,
    stafList,
    rombelList,
    mapelList,
    absensiHarian,
    absensiKelasList,
    schoolSettings.googleSyncEnabled,
    userGoogleToken,
    schoolSettings.googleSyncSpreadsheetId
  ]);

  // Auto initialize Google OAuth listener
  useEffect(() => {
    initAuth(
      (user, token) => {
        setUserGoogleToken(token || '');
        setUserEmail(user.email || 'giar.hermawan4@guru.smp.belajar.id');
        setIsLoggedIn(true);
      },
      () => {
        // Unauthenticated
      }
    );
  }, []);

  const handleLoginSuccess = (email: string, token: string, role: Role) => {
    setUserEmail(email);
    setUserGoogleToken(token);
    setCurrentRole(role);
    setIsLoggedIn(true);
    // Guru default tab is 'absensi'
    if (role === 'guru') {
      setActiveTab('absensi');
    } else if (role === 'staf') {
      setActiveTab('keuangan');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Auto switch tab if current activeTab is not allowed for current role
  useEffect(() => {
    if (currentRole === 'guru') {
      if (activeTab !== 'absensi' && activeTab !== 'administrasi' && activeTab !== 'cbt') {
        setActiveTab('absensi');
      }
    } else if (currentRole === 'staf') {
      if (activeTab !== 'keuangan') {
        setActiveTab('keuangan');
      }
    } else if (currentRole === 'siswa') {
      if (activeTab === 'database' || activeTab === 'administrasi' || activeTab === 'pengaturan') {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, userEmail]);

  const handleLogout = async () => {
    try {
      await googleSignOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUserEmail('');
    setUserGoogleToken('');
    setIsLoggedIn(false);
  };

  // If not logged in, render Dashboard Login
  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        schoolSettings={schoolSettings}
        guruList={guruList}
        stafList={stafList}
        siswaList={siswaList}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0A0A] text-slate-200'} font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white transition-colors`}>
      
      {/* Navbar Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        userGoogleToken={userGoogleToken}
        setUserGoogleToken={setUserGoogleToken}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        schoolSettings={schoolSettings}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main App Layout */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row my-4 px-3 sm:px-6 gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userGoogleToken={userGoogleToken}
          currentRole={currentRole}
          databaseSubTab={databaseSubTab}
          setDatabaseSubTab={setDatabaseSubTab}
          absensiSubTab={absensiSubTab}
          setAbsensiSubTab={setAbsensiSubTab}
          cbtSubTab={cbtSubTab}
          setCbtSubTab={setCbtSubTab}
          keuanganSubTab={keuanganSubTab}
          setKeuanganSubTab={setKeuanganSubTab}
          pengaturanSubTab={pengaturanSubTab}
          setPengaturanSubTab={setPengaturanSubTab}
          siswaCount={siswaList.length}
          guruCount={guruList.length}
          stafCount={stafList.length}
          rombelCount={rombelList.length}
          mapelCount={mapelList.length}
          bankSoalCount={bankSoalList.length}
        />

        {/* Content View Area */}
        <main className={`flex-1 min-w-0 ${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#0A0A0A] text-slate-200 border-slate-800'} rounded-2xl p-4 sm:p-6 border shadow-2xl transition-colors`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              siswaList={siswaList}
              guruList={guruList}
              stafList={stafList}
              absensiGuru={absensiGuruList}
              absensiSiswa={absensiHarian}
              tagihanList={tagihanList}
              ujianList={ujianList}
              onNavigateTab={setActiveTab}
              userGoogleToken={userGoogleToken}
              currentRole={currentRole}
              userEmail={userEmail}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              rombelList={rombelList}
              setRombelList={setRombelList}
              siswaList={siswaList}
              setSiswaList={setSiswaList}
              guruList={guruList}
              setGuruList={setGuruList}
              stafList={stafList}
              setStafList={setStafList}
              mapelList={mapelList}
              setMapelList={setMapelList}
              subTab={databaseSubTab}
              setSubTab={setDatabaseSubTab}
              userGoogleToken={userGoogleToken}
              userEmail={userEmail}
              absensiHarian={absensiHarian}
              absensiKelasList={absensiKelasList}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'absensi' && (
            <AbsensiView
              siswaList={siswaList}
              guruList={guruList}
              absensiHarian={absensiHarian}
              setAbsensiHarian={setAbsensiHarian}
              absensiKelasList={absensiKelasList}
              setAbsensiKelasList={setAbsensiKelasList}
              absensiGuruList={absensiGuruList}
              setAbsensiGuruList={setAbsensiGuruList}
              currentRole={currentRole}
              userGoogleToken={userGoogleToken}
              rombelList={rombelList}
              mapelList={mapelList}
              stafList={stafList}
              subTab={absensiSubTab}
              setSubTab={setAbsensiSubTab}
              schoolSettings={schoolSettings}
              setSchoolSettings={setSchoolSettings}
            />
          )}

          {activeTab === 'cbt' && (
            <CbtView
              bankSoalList={bankSoalList}
              setBankSoalList={setBankSoalList}
              ujianList={ujianList}
              setUjianList={setUjianList}
              siswaList={siswaList}
              currentRole={currentRole}
              userEmail={userEmail}
              subTab={cbtSubTab}
              setSubTab={setCbtSubTab}
            />
          )}

          {activeTab === 'administrasi' && (
            <AdministrasiGuruView
              administrasiList={administrasiList}
              setAdministrasiList={setAdministrasiList}
              currentRole={currentRole}
              userEmail={userEmail}
              guruList={guruList}
            />
          )}
          
          {activeTab === 'keuangan' && (
            <KeuanganView
              tagihanList={tagihanList}
              setTagihanList={setTagihanList}
              transaksiList={transaksiList}
              setTransaksiList={setTransaksiList}
              userGoogleToken={userGoogleToken}
              siswaList={siswaList}
              subTab={keuanganSubTab}
              setSubTab={setKeuanganSubTab}
              tarifBiayaList={tarifBiayaList}
              setTarifBiayaList={setTarifBiayaList}
              schoolSettings={schoolSettings}
              onRefresh={() => {
                setTagihanList(getSavedData('edu_tagihanList', INITIAL_TAGIHAN));
                setTransaksiList(getSavedData('edu_transaksiList', INITIAL_TRANSAKSI));
                setTarifBiayaList(getSavedData('edu_tarifBiayaList', INITIAL_TARIF_BIAYA));
              }}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              schoolSettings={schoolSettings}
              setSchoolSettings={setSchoolSettings}
              currentRole={currentRole}
              userGoogleToken={userGoogleToken}
              setUserGoogleToken={setUserGoogleToken}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              siswaList={siswaList}
              guruList={guruList}
              stafList={stafList}
              rombelList={rombelList}
              mapelList={mapelList}
              absensiHarian={absensiHarian}
              absensiKelasList={absensiKelasList}
              activeSubTab={pengaturanSubTab}
              setSubTab={setPengaturanSubTab}
            />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className={`${theme === 'light' ? 'bg-white text-slate-500 border-slate-200' : 'bg-[#0A0A0A] text-slate-500 border-slate-800'} border-t py-4 text-center text-xs uppercase font-medium tracking-wider transition-colors`}>
        <p>© 2026 EduPortal Pro Integrated • Google AI Studio Applet</p>
      </footer>

    </div>
  );
}
