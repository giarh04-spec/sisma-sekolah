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
  HasilUjian,
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

import { initAuth, googleSignOut, db } from './lib/firebase';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { exportAllToGoogleSheets } from './lib/googleDriveSync';
import { 
  validateFirestoreConnection, 
  dbSaveItem, 
  dbFetchCollection, 
  dbSaveCollection 
} from './lib/firebaseSync';

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
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
  const [hasilUjianList, setHasilUjianList] = useState<HasilUjian[]>(() => getSavedData('edu_hasilUjianList', []));

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

  // Load database from Firestore upon user login
  useEffect(() => {
    if (isLoggedIn) {
      const loadAllFromFirestore = async () => {
        try {
          await validateFirestoreConnection();

          // Fetch all collections
          const rombelData = await dbFetchCollection<RombelKelas>('edu_rombelList');
          const siswaData = await dbFetchCollection<Siswa>('edu_siswaList');
          const guruData = await dbFetchCollection<Guru>('edu_guruList');
          const stafData = await dbFetchCollection<Staf>('edu_stafList');
          const mapelData = await dbFetchCollection<MataPelajaranItem>('edu_mapelList');
          const absensiData = await dbFetchCollection<AbsensiSiswaHarian>('edu_absensiHarian');
          const absensiKelasData = await dbFetchCollection<AbsensiSiswaKelas>('edu_absensiKelasList');
          const absensiGuruData = await dbFetchCollection<AbsensiGuru>('edu_absensiGuruList');
          const bankSoalData = await dbFetchCollection<BankSoal>('edu_bankSoalList');
          const ujianData = await dbFetchCollection<UjianCBT>('edu_ujianList');
          const administrasiData = await dbFetchCollection<AdministrasiGuru>('edu_administrasiList');
          const tagihanData = await dbFetchCollection<TagihanKeuangan>('edu_tagihanList');
          const transaksiData = await dbFetchCollection<TransaksiKeuangan>('edu_transaksiList');
          const tarifBiayaData = await dbFetchCollection<TarifBiaya>('edu_tarifBiayaList');
          const hasilUjianData = await dbFetchCollection<HasilUjian>('edu_hasilUjianList');
          const settingsData = await dbFetchCollection<SchoolSettings>('edu_schoolSettings');

          // Sync data back to React state or seed empty Firestore
          if (rombelData.length > 0) setRombelList(rombelData);
          else await dbSaveCollection('edu_rombelList', rombelList);

          if (siswaData.length > 0) setSiswaList(siswaData);
          else await dbSaveCollection('edu_siswaList', siswaList);

          if (guruData.length > 0) setGuruList(guruData);
          else await dbSaveCollection('edu_guruList', guruList);

          if (stafData.length > 0) setStafList(stafData);
          else await dbSaveCollection('edu_stafList', stafList);

          if (mapelData.length > 0) setMapelList(mapelData);
          else await dbSaveCollection('edu_mapelList', mapelList);

          if (absensiData.length > 0) setAbsensiHarian(absensiData);
          else await dbSaveCollection('edu_absensiHarian', absensiHarian);

          if (absensiKelasData.length > 0) setAbsensiKelasList(absensiKelasData);
          else await dbSaveCollection('edu_absensiKelasList', absensiKelasList);

          if (absensiGuruData.length > 0) setAbsensiGuruList(absensiGuruData);
          else await dbSaveCollection('edu_absensiGuruList', absensiGuruList);

          if (bankSoalData.length > 0) setBankSoalList(bankSoalData);
          else await dbSaveCollection('edu_bankSoalList', bankSoalList);

          if (ujianData.length > 0) setUjianList(ujianData);
          else await dbSaveCollection('edu_ujianList', ujianList);

          if (administrasiData.length > 0) setAdministrasiList(administrasiData);
          else await dbSaveCollection('edu_administrasiList', administrasiList);

          if (tagihanData.length > 0) setTagihanList(tagihanData);
          else await dbSaveCollection('edu_tagihanList', tagihanList);

          if (transaksiData.length > 0) setTransaksiList(transaksiData);
          else await dbSaveCollection('edu_transaksiList', transaksiList);

          if (tarifBiayaData.length > 0) setTarifBiayaList(tarifBiayaData);
          else await dbSaveCollection('edu_tarifBiayaList', tarifBiayaList);

          if (hasilUjianData.length > 0) setHasilUjianList(hasilUjianData);

          if (settingsData.length > 0) {
            const foundSetting = settingsData.find(s => s.namaSekolah);
            if (foundSetting) setSchoolSettings(foundSetting);
          } else {
            await dbSaveItem('edu_schoolSettings', { id: 'current', ...schoolSettings });
          }

          setIsDbLoaded(true);
        } catch (error) {
          console.error('Error in initial load from Firestore:', error);
          setIsDbLoaded(true); // fall back to local storage
        }
      };
      loadAllFromFirestore();
    } else {
      setIsDbLoaded(false);
    }
  }, [isLoggedIn]);

  // Status-reporting wrappers for Firebase saves
  const saveCollectionWithStatus = async (collectionName: string, items: any[]) => {
    setFirebaseSyncStatus('saving');
    try {
      await dbSaveCollection(collectionName, items);
      setFirebaseSyncStatus('saved');
      const timer = setTimeout(() => setFirebaseSyncStatus('idle'), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error(`Error syncing ${collectionName} to Firebase:`, e);
      setFirebaseSyncStatus('error');
    }
  };

  const saveItemWithStatus = async (collectionName: string, item: any) => {
    setFirebaseSyncStatus('saving');
    try {
      await dbSaveItem(collectionName, item);
      setFirebaseSyncStatus('saved');
      const timer = setTimeout(() => setFirebaseSyncStatus('idle'), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error(`Error syncing item ${collectionName} to Firebase:`, e);
      setFirebaseSyncStatus('error');
    }
  };

  // Sync state to localStorage and Firestore on changes
  useEffect(() => {
    localStorage.setItem('edu_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('edu_rombelList', JSON.stringify(rombelList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_rombelList', rombelList);
    }
  }, [rombelList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_siswaList', JSON.stringify(siswaList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_siswaList', siswaList);
    }
  }, [siswaList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_guruList', JSON.stringify(guruList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_guruList', guruList);
    }
  }, [guruList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_stafList', JSON.stringify(stafList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_stafList', stafList);
    }
  }, [stafList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_mapelList', JSON.stringify(mapelList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_mapelList', mapelList);
    }
  }, [mapelList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_absensiHarian', JSON.stringify(absensiHarian));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_absensiHarian', absensiHarian);
    }
  }, [absensiHarian, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_absensiKelasList', JSON.stringify(absensiKelasList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_absensiKelasList', absensiKelasList);
    }
  }, [absensiKelasList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_absensiGuruList', JSON.stringify(absensiGuruList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_absensiGuruList', absensiGuruList);
    }
  }, [absensiGuruList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_bankSoalList', JSON.stringify(bankSoalList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_bankSoalList', bankSoalList);
    }
  }, [bankSoalList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_ujianList', JSON.stringify(ujianList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_ujianList', ujianList);
    }
  }, [ujianList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_administrasiList', JSON.stringify(administrasiList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_administrasiList', administrasiList);
    }
  }, [administrasiList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_tagihanList', JSON.stringify(tagihanList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_tagihanList', tagihanList);
    }
  }, [tagihanList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_transaksiList', JSON.stringify(transaksiList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_transaksiList', transaksiList);
    }
  }, [transaksiList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_tarifBiayaList', JSON.stringify(tarifBiayaList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_tarifBiayaList', tarifBiayaList);
    }
  }, [tarifBiayaList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_hasilUjianList', JSON.stringify(hasilUjianList));
    if (isDbLoaded && isLoggedIn) {
      saveCollectionWithStatus('edu_hasilUjianList', hasilUjianList);
    }
  }, [hasilUjianList, isDbLoaded, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('edu_schoolSettings', JSON.stringify(schoolSettings));
    if (isDbLoaded && isLoggedIn) {
      saveItemWithStatus('edu_schoolSettings', { id: 'current', ...schoolSettings });
    }
  }, [schoolSettings, isDbLoaded, isLoggedIn]);

  // Realtime synchronization from Firestore (Admin <-> TU/Staf/Guru integration)
  useEffect(() => {
    if (!isLoggedIn || !isDbLoaded) return;

    const unsubs: (() => void)[] = [];

    const listenCollection = <T extends { id: string }>(colName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      try {
        const unsub = onSnapshot(collection(db, colName), (snapshot) => {
          if (snapshot.metadata.hasPendingWrites) return;
          const items: T[] = [];
          snapshot.forEach((doc) => {
            items.push(doc.data() as T);
          });
          setter((prev) => {
            // Sort to ensure stable comparison
            const sortKey = (a: any, b: any) => (a.id || '').localeCompare(b.id || '');
            const sortedPrev = [...prev].sort(sortKey);
            const sortedItems = [...items].sort(sortKey);
            if (JSON.stringify(sortedPrev) !== JSON.stringify(sortedItems)) {
              return items;
            }
            return prev;
          });
        });
        unsubs.push(unsub);
      } catch (err) {
        console.error(`Error subscribing to ${colName}:`, err);
      }
    };

    listenCollection<RombelKelas>('edu_rombelList', setRombelList);
    listenCollection<Siswa>('edu_siswaList', setSiswaList);
    listenCollection<Guru>('edu_guruList', setGuruList);
    listenCollection<Staf>('edu_stafList', setStafList);
    listenCollection<MataPelajaranItem>('edu_mapelList', setMapelList);
    listenCollection<AbsensiSiswaHarian>('edu_absensiHarian', setAbsensiHarian);
    listenCollection<AbsensiSiswaKelas>('edu_absensiKelasList', setAbsensiKelasList);
    listenCollection<AbsensiGuru>('edu_absensiGuruList', setAbsensiGuruList);
    listenCollection<BankSoal>('edu_bankSoalList', setBankSoalList);
    listenCollection<UjianCBT>('edu_ujianList', setUjianList);
    listenCollection<AdministrasiGuru>('edu_administrasiList', setAdministrasiList);
    listenCollection<TagihanKeuangan>('edu_tagihanList', setTagihanList);
    listenCollection<TransaksiKeuangan>('edu_transaksiList', setTransaksiList);
    listenCollection<TarifBiaya>('edu_tarifBiayaList', setTarifBiayaList);
    listenCollection<HasilUjian>('edu_hasilUjianList', setHasilUjianList);

    // Document listener for school settings
    try {
      const unsubSettings = onSnapshot(doc(db, 'edu_schoolSettings', 'current'), (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        if (snapshot.exists()) {
          const data = snapshot.data() as SchoolSettings;
          setSchoolSettings((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });
        }
      });
      unsubs.push(unsubSettings);
    } catch (err) {
      console.error('Error subscribing to edu_schoolSettings:', err);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [isLoggedIn, isDbLoaded]);

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
        firebaseSyncStatus={firebaseSyncStatus}
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
              hasilUjianList={hasilUjianList}
              setHasilUjianList={setHasilUjianList}
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
              setSchoolSettings={setSchoolSettings}
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
