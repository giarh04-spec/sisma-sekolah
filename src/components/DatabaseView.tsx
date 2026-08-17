import React, { useState, useRef } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2,
  FileSpreadsheet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  QrCode,
  CreditCard,
  Download,
  Upload,
  FileText,
  Sparkles,
  FolderDown,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  User,
  Layers,
  School,
  Eye,
  BookOpen,
  Award,
  UserPlus,
  Check,
  Clock,
  BookCheck,
  Home,
  Trophy,
  Activity,
  ShieldAlert,
  DollarSign,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { Siswa, Guru, Staf, RombelKelas, MataPelajaranItem, ScheduleSlot, SubTab, EkstrakurikulerItem } from '../types/school';
import { INITIAL_ROMBEL, INITIAL_MAPEL, INITIAL_EKSKUL } from '../data/mockData';
import { KartuDigitalModal } from './KartuDigitalModal';
import { exportAllToGoogleSheets } from '../lib/googleDriveSync';

interface DatabaseViewProps {
  rombelList?: RombelKelas[];
  setRombelList?: React.Dispatch<React.SetStateAction<RombelKelas[]>>;
  siswaList: Siswa[];
  setSiswaList: React.Dispatch<React.SetStateAction<Siswa[]>>;
  guruList: Guru[];
  setGuruList: React.Dispatch<React.SetStateAction<Guru[]>>;
  stafList: Staf[];
  setStafList: React.Dispatch<React.SetStateAction<Staf[]>>;
  mapelList?: MataPelajaranItem[];
  setMapelList?: React.Dispatch<React.SetStateAction<MataPelajaranItem[]>>;
  ekskulList?: EkstrakurikulerItem[];
  setEkskulList?: React.Dispatch<React.SetStateAction<EkstrakurikulerItem[]>>;
  subTab?: SubTab;
  setSubTab?: (subTab: SubTab) => void;
  userGoogleToken?: string;
  userEmail?: string;
  absensiHarian?: any[];
  absensiKelasList?: any[];
  currentRole?: string;
}

const normalizeDateForInput = (d: string | undefined): string => {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const p = d.split(/[\/\-]/);
  if (p.length === 3 && p[2].length === 4) return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  return d;
};

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  rombelList: propsRombelList,
  setRombelList: setPropsRombelList,
  siswaList,
  setSiswaList,
  guruList,
  setGuruList,
  stafList,
  setStafList,
  mapelList: propsMapelList,
  setMapelList: setPropsMapelList,
  ekskulList: propsEkskulList,
  setEkskulList: setPropsEkskulList,
  subTab: propsSubTab,
  setSubTab: propsSetSubTab,
  userGoogleToken = 'demo_workspace_token_active',
  userEmail = '',
  absensiHarian = [],
  absensiKelasList = [],
  currentRole = 'admin'
}) => {
  const [localSubTab, setLocalSubTab] = useState<SubTab>('siswa');
  const subTab = propsSubTab || localSubTab;
  const setSubTab = propsSetSubTab || setLocalSubTab;
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');
  const [filterGender, setFilterGender] = useState('Semua');

  // Fallback state for Rombel if props not provided
  const [localRombelList, setLocalRombelList] = useState<RombelKelas[]>(INITIAL_ROMBEL);
  const activeRombelList = propsRombelList || localRombelList;
  const setActiveRombelList = (action: React.SetStateAction<RombelKelas[]>) => {
    if (setPropsRombelList) {
      setPropsRombelList(action);
    } else {
      setLocalRombelList(action);
    }
  };

  // Fallback state for Mata Pelajaran if props not provided
  const [localMapelList, setLocalMapelList] = useState<MataPelajaranItem[]>(INITIAL_MAPEL);
  const activeMapelList = propsMapelList || localMapelList;
  const setActiveMapelList = (action: React.SetStateAction<MataPelajaranItem[]>) => {
    if (setPropsMapelList) {
      setPropsMapelList(action);
    } else {
      setLocalMapelList(action);
    }
  };

  // Fallback state for Ekstrakurikuler if props not provided
  const [localEkskulList, setLocalEkskulList] = useState<EkstrakurikulerItem[]>(INITIAL_EKSKUL);
  const activeEkskulList = propsEkskulList || localEkskulList;
  const setActiveEkskulList = (action: React.SetStateAction<EkstrakurikulerItem[]>) => {
    if (setPropsEkskulList) {
      setPropsEkskulList(action);
    } else {
      setLocalEkskulList(action);
    }
  };

  const [syncingToDrive, setSyncingToDrive] = useState(false);
  const [databaseSpreadsheetUrl, setDatabaseSpreadsheetUrl] = useState<string | null>(null);

  const handleSyncAllToGoogleSheets = async () => {
    setSyncingToDrive(true);
    try {
      const res = await exportAllToGoogleSheets(userGoogleToken, {
        siswaList,
        guruList,
        stafList,
        rombelList: activeRombelList,
        mapelList: activeMapelList,
        absensiHarian,
        absensiKelasList
      });

      if (res.success) {
        alert(`Sinkronisasi Database Sukses!\n\n${res.message}`);
        if (res.url) {
          setDatabaseSpreadsheetUrl(res.url);
        }
      } else {
        alert(`Sinkronisasi Gagal: ${res.message}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat menyinkronkan data.');
    } finally {
      setSyncingToDrive(false);
    }
  };

  // Mapel specific state & filters
  const [filterKategoriMapel, setFilterKategoriMapel] = useState<string>('Semua');
  const [filterHariMapel, setFilterHariMapel] = useState<string>('Semua');

  // Form State for Mata Pelajaran
  const [formMapel, setFormMapel] = useState<Omit<MataPelajaranItem, 'id'>>({
    kodeMapel: 'MP-MAT-01',
    namaMapel: '',
    kategori: 'Wajib Umum',
    tingkatKelas: 'Kelas 10 & 11',
    guruPengampuNama: guruList[0]?.nama || 'Drs. Hendra Kusuma, M.Pd.',
    nipGuru: guruList[0]?.nip || '198501152010011002',
    alokasiJamPerMinggu: 4,
    kkm: 75,
    kurikulum: 'Kurikulum Merdeka',
    catatan: '',
    jadwalMengajar: [
      { id: 'js-new-1', hari: 'Senin', jamMulai: '07:30', jamSelesai: '09:00', kelasTarget: 'X-IPA-1', ruangan: 'Ruang R.101 (Gedung A)' }
    ]
  });

  // Temporary state for schedule builder inside MAPEL form
  const [newScheduleHari, setNewScheduleHari] = useState<string>('Senin');
  const [newScheduleKelasTarget, setNewScheduleKelasTarget] = useState<string>('');
  const [newScheduleJamMulai, setNewScheduleJamMulai] = useState<string>('07:30');
  const [newScheduleJamSelesai, setNewScheduleJamSelesai] = useState<string>('09:00');
  const [newScheduleRuangan, setNewScheduleRuangan] = useState<string>('');

  // Rombel specific state
  const [filterTingkat, setFilterTingkat] = useState<string>('Semua');
  const [activeRombelDetail, setActiveRombelDetail] = useState<RombelKelas | null>(null);
  const [studentToAssign, setStudentToAssign] = useState<string>('');
  const [selectedSiswaIdsForRombel, setSelectedSiswaIdsForRombel] = useState<string[]>([]);
  const [studentSearchInput, setStudentSearchInput] = useState<string>('');

  // Form State for Rombel
  const [formRombel, setFormRombel] = useState<Omit<RombelKelas, 'id'>>({
    namaRombel: '',
    tingkatKelas: 'Kelas 10',
    jurusanPeminatan: 'MIPA / Umum',
    waliKelasNama: guruList[0]?.nama || 'Drs. Hendra Kusuma, M.Pd.',
    ruangan: 'Ruang R.101 (Gedung A)',
    kurikulum: 'Kurikulum Merdeka',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    ketuaKelasNama: '',
    kapasitas: 36,
    catatan: ''
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Student Detail Modal State
  const [selectedSiswaDetail, setSelectedSiswaDetail] = useState<Siswa | null>(null);
  const [detailTab, setDetailTab] = useState<'biodata' | 'akademik' | 'wali'>('biodata');

  // Delete Confirmation State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    id: string;
    nama: string;
    targetType: 'siswa' | 'guru' | 'staf' | 'rombel' | 'mapel' | 'ekskul';
  } | null>(null);

  // Ekskul specific state & filters
  const [filterKategoriEkskul, setFilterKategoriEkskul] = useState<string>('Semua');
  const [filterHariEkskul, setFilterHariEkskul] = useState<string>('Semua');
  const [filterStatusEkskul, setFilterStatusEkskul] = useState<string>('Semua');

  // Active Ekskul for Member Enrollment Modal
  const [activeEkskulMembersModal, setActiveEkskulMembersModal] = useState<EkstrakurikulerItem | null>(null);
  const [ekskulMemberSearch, setEkskulMemberSearch] = useState<string>('');
  const [ekskulMemberKelasFilter, setEkskulMemberKelasFilter] = useState<string>('Semua');

  // Form State for Ekstrakurikuler
  const [formEkskul, setFormEkskul] = useState<Omit<EkstrakurikulerItem, 'id'>>({
    kodeEkskul: 'EKS-01',
    namaEkskul: '',
    kategori: 'Olahraga',
    pembinaNama: guruList[0]?.nama || 'Drs. H. Bambang Sutrisno',
    nipPembina: guruList[0]?.nip || '197103251998021001',
    kontakPembina: guruList[0]?.telepon || '081234567801',
    hariLatihan: 'Jumat',
    jamMulai: '15:00',
    jamSelesai: '17:00',
    tempat: 'Lapangan Utama Sekolah',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 30,
    anggotaSiswaIds: [],
    status: 'Aktif',
    biayaIuran: 0,
    deskripsi: ''
  });

  // Digital ID Card Modal State
  const [cardModalData, setCardModalData] = useState<{
    type: 'siswa' | 'guru' | 'staf';
    data: Siswa | Guru | Staf;
  } | null>(null);

  // Quick Photo Upload Modal State
  const [quickPhotoData, setQuickPhotoData] = useState<{
    type: 'siswa' | 'guru' | 'staf';
    data: Siswa | Guru | Staf;
  } | null>(null);
  const quickPhotoFileInputRef = useRef<HTMLInputElement>(null);

  // Photo Input Ref for Form Modal
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Preset Sample Pas Foto
  const PRESET_PHOTOS = {
    L: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'
    ],
    P: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
    ]
  };

  // Form States for Siswa
  const [formSiswa, setFormSiswa] = useState<Omit<Siswa, 'id'>>({
    nisn: '',
    nis: '',
    nik: '',
    nama: '',
    kelas: 'X-IPA-1',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2008-01-01',
    agama: 'Islam',
    alamat: '',
    alamatLengkap: '',
    namaWali: '',
    teleponWali: '',
    status: 'Aktif',
    golonganDarah: 'O',
    kodeBarcode: '',
    fotoUrl: '',
    email: '',
    asalSekolah: '',
    anakKe: 1,
    jumlahSaudara: 0,
    beratBadan: 0,
    tinggiBadan: 0,
    namaAyah: '',
    namaIbu: '',
    tempatLahirOrtu: '',
    tanggalLahirOrtu: '',
    pendidikanOrtu: '',
    pekerjaanOrtu: '',
    nikOrtu: ''
  });

  // Form States for Guru
  const [formGuru, setFormGuru] = useState<Omit<Guru, 'id'>>({
    nip: '',
    nik: '',
    nama: '',
    gelarDepan: '',
    gelarBelakang: '',
    mataPelajaran: '',
    jabatan: 'Guru Mata Pelajaran',
    email: '',
    telepon: '',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1985-01-01',
    agama: 'Islam',
    alamatLengkap: '',
    pendidikanTerakhir: 'S1 Pendidikan',
    sertifikasiGuru: true,
    status: 'PNS',
    kodeBarcode: '',
    fotoUrl: '',
    username: '',
    password: ''
  });

  // Form States for Staf
  const [formStaf, setFormStaf] = useState<Omit<Staf, 'id'>>({
    nik: '',
    nama: '',
    bagian: 'Tata Usaha',
    email: '',
    telepon: '',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1990-01-01',
    agama: 'Islam',
    alamatLengkap: '',
    pendidikanTerakhir: 'D3 / S1',
    status: 'Tetap',
    kodeBarcode: '',
    fotoUrl: '',
    username: '',
    password: ''
  });

  const getCurrentFotoUrl = () => {
    if (subTab === 'siswa') return formSiswa.fotoUrl || '';
    if (subTab === 'guru') return formGuru.fotoUrl || '';
    return formStaf.fotoUrl || '';
  };

  const setCurrentFotoUrl = (url: string) => {
    if (subTab === 'siswa') setFormSiswa(prev => ({ ...prev, fotoUrl: url }));
    else if (subTab === 'guru') setFormGuru(prev => ({ ...prev, fotoUrl: url }));
    else if (subTab === 'staf') setFormStaf(prev => ({ ...prev, fotoUrl: url }));
  };

  const compressImageToBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          callback(dataUrl); // Fallback
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    compressImageToBase64(file, (dataUrl) => {
      setCurrentFotoUrl(dataUrl);
    });
  };

  const applyPhotoToPerson = (id: string, type: 'siswa' | 'guru' | 'staf', fotoUrl: string) => {
    if (type === 'siswa') {
      setSiswaList(prev => prev.map(s => s.id === id ? { ...s, fotoUrl } : s));
    } else if (type === 'guru') {
      setGuruList(prev => prev.map(g => g.id === id ? { ...g, fotoUrl } : g));
    } else if (type === 'staf') {
      setStafList(prev => prev.map(st => st.id === id ? { ...st, fotoUrl } : st));
    }
    setQuickPhotoData(null);
  };

  // --- TEMPLATE & IMPORT DATA MASTER STATE & HANDLERS ---
  const [showTemplateHubModal, setShowTemplateHubModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTargetType, setImportTargetType] = useState<'siswa' | 'guru' | 'staf'>('siswa');

  // Handle Download Template CSV
  const handleDownloadTemplate = (type: 'siswa' | 'guru' | 'staf') => {
    let headers = '';
    let sampleRows = '';
    let filename = '';

    if (type === 'siswa') {
      headers = 'NISN;NIS;NIK;Nama;Rombel;JenisKelamin;TempatLahir;TanggalLahir;Agama;Alamat;NamaOrang tua/Wali;TeleponWali;AsalSekolah;Anak Ke-;JumlahSaudara;BeratBadan;TinggiBadan\n';
      sampleRows = '81234567;1001;3171010101080001;Budi Santoso;X-IPA-1;L;Jakarta;12/05/2008;Islam;Jl. Merdeka No 10;Ahmad Santoso;81234567890;;;;;\n' +
                   '81234568;1002;3171010202080002;Siti Rahma;X-IPA-1;P;Bandung;18/06/2008;Islam;Jl. Mawar No 5;Bambang;81298765432;;;;;\n';
      filename = 'Template_Import_Data_Siswa_2026.csv';
    } else if (type === 'guru') {
      headers = 'NIP,NIK,Nama,GelarDepan,GelarBelakang,MataPelajaran,Jabatan,Email,Telepon,JenisKelamin,TempatLahir,TanggalLahir,Agama,Pendidikan,Status\n';
      sampleRows = '198501152010011002,3171011501850002,Ahmad Dahlan,Drs.,M.Pd.,Matematika Tingkat Lanjut,Guru Utama,ahmad@sekolah.sch.id,081122334455,L,Bandung,1985-01-15,Islam,S2 Pendidikan,PNS\n' +
                   '198903202015022001,3171022003890001,Dewi Kartika,S.Pd.,M.Si.,Fisika,Guru Mata Pelajaran,dewi@sekolah.sch.id,081233445566,P,Surakarta,1989-03-20,Islam,S1 Fisika,PNS\n';
      filename = 'Template_Import_Data_Guru_2026.csv';
    } else {
      headers = 'NIK,Nama,Bagian,Email,Telepon,JenisKelamin,TempatLahir,TanggalLahir,Agama,Pendidikan,Status\n';
      sampleRows = '3171022002900003,Rina Hastuti,Tata Usaha & Keuangan,rina@sekolah.sch.id,081299887766,P,Surakarta,1990-02-20,Islam,S1 Akuntansi,Tetap\n' +
                   '3171031505880004,Joko Widodo,Laboran Komputer,joko@sekolah.sch.id,081388776655,L,Yogyakarta,1988-05-15,Islam,D3 Informatika,Kontrak\n';
      filename = 'Template_Import_Data_Staf_2026.csv';
    }

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle File Import
  const handleTriggerImport = (type: 'siswa' | 'guru' | 'staf') => {
    setImportTargetType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleProcessImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(text);
          if (Array.isArray(jsonData)) {
            if (importTargetType === 'siswa') setSiswaList(prev => [...jsonData, ...prev]);
            if (importTargetType === 'guru') setGuruList(prev => [...jsonData, ...prev]);
            if (importTargetType === 'staf') setStafList(prev => [...jsonData, ...prev]);
            alert(`✓ Berhasil mengimpor ${jsonData.length} data ${importTargetType.toUpperCase()} dari file JSON!`);
          }
        } else {
          // Parse CSV
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length <= 1) {
            alert('File CSV kosong atau hanya berisi baris header.');
            return;
          }

          const firstLine = lines[0] || '';
          const delimiter = firstLine.includes(';') ? ';' : ',';
          const dataRows = lines.slice(1);
          let count = 0;

          if (importTargetType === 'siswa') {
            const newSiswaItems: Siswa[] = dataRows.map((row, idx) => {
              const cols = row.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
              return {
                id: `sis-imp-${Date.now()}-${idx}`,
                nisn: cols[0] || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
                nis: cols[1] || `${1000 + idx}`,
                nik: cols[2] || `317100000000000${idx}`,
                nama: cols[3] || `Siswa Impor ${idx + 1}`,
                kelas: cols[4] || 'X-IPA-1',
                jenisKelamin: (cols[5] === 'P' || cols[5] === 'p' ? 'P' : 'L') as 'L' | 'P',
                tempatLahir: cols[6] || 'Jakarta',
                tanggalLahir: cols[7] || '2008-01-01',
                agama: cols[8] || 'Islam',
                alamat: cols[9] || 'Jl. Sekolah No. 1',
                alamatLengkap: cols[9] || 'Jl. Sekolah No. 1',
                namaWali: cols[10] || 'Orang Tua',
                teleponWali: cols[11] || '08123456789',
                asalSekolah: cols[12] || '',
                anakKe: cols[13] ? parseInt(cols[13]) || undefined : undefined,
                jumlahSaudara: cols[14] ? parseInt(cols[14]) || undefined : undefined,
                beratBadan: cols[15] ? parseInt(cols[15]) || undefined : undefined,
                tinggiBadan: cols[16] ? parseInt(cols[16]) || undefined : undefined,
                status: 'Aktif',
                kodeBarcode: `SIS-${cols[0] || '008'}`
              };
            });
            setSiswaList(prev => [...newSiswaItems, ...prev]);
            count = newSiswaItems.length;
          } else if (importTargetType === 'guru') {
            const newGuruItems: Guru[] = dataRows.map((row, idx) => {
              const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
              return {
                id: `gur-imp-${Date.now()}-${idx}`,
                nip: cols[0] || `19850101201001100${idx}`,
                nik: cols[1] || `31710000000000${idx}`,
                nama: cols[2] || `Guru Impor ${idx + 1}`,
                gelarDepan: cols[3] || '',
                gelarBelakang: cols[4] || 'S.Pd.',
                mataPelajaran: cols[5] || 'Umum',
                jabatan: cols[6] || 'Guru Mata Pelajaran',
                email: cols[7] || `guru${idx}@sekolah.sch.id`,
                telepon: cols[8] || '08123456789',
                jenisKelamin: (cols[9] === 'P' ? 'P' : 'L') as 'L' | 'P',
                tempatLahir: cols[10] || 'Jakarta',
                tanggalLahir: cols[11] || '1985-01-01',
                agama: cols[12] || 'Islam',
                alamatLengkap: 'Jl. Pendidikan No. 1',
                pendidikanTerakhir: cols[13] || 'S1 Pendidikan',
                sertifikasiGuru: true,
                status: (cols[14] as any) || 'PNS',
                kodeBarcode: `GUR-${cols[0] || '1985'}`
              };
            });
            setGuruList(prev => [...newGuruItems, ...prev]);
            count = newGuruItems.length;
          } else {
            const newStafItems: Staf[] = dataRows.map((row, idx) => {
              const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
              return {
                id: `stf-imp-${Date.now()}-${idx}`,
                nik: cols[0] || `31710000000000${idx}`,
                nama: cols[1] || `Staf Impor ${idx + 1}`,
                bagian: cols[2] || 'Tata Usaha',
                email: cols[3] || `staf${idx}@sekolah.sch.id`,
                telepon: cols[4] || '08123456789',
                jenisKelamin: (cols[5] === 'P' ? 'P' : 'L') as 'L' | 'P',
                tempatLahir: cols[6] || 'Jakarta',
                tanggalLahir: cols[7] || '1990-01-01',
                agama: cols[8] || 'Islam',
                alamatLengkap: 'Jl. Pendidikan No. 1',
                pendidikanTerakhir: cols[9] || 'S1',
                status: (cols[10] as any) || 'Tetap',
                kodeBarcode: `STF-${cols[0] || '3171'}`
              };
            });
            setStafList(prev => [...newStafItems, ...prev]);
            count = newStafItems.length;
          }

          alert(`✓ Berhasil mengimpor ${count} data ${importTargetType.toUpperCase()} ke dalam database sekolah!`);
        }
      } catch (err) {
        alert('Gagal memproses file. Pastikan format file sesuai dengan template CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered lists
  const filteredSiswa = siswaList.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || 
                        s.nis.includes(search) || 
                        s.nisn.includes(search);
    const matchKelas = filterKelas === 'Semua' || s.kelas === filterKelas;
    const matchGender = filterGender === 'Semua' || s.jenisKelamin === filterGender;
    return matchSearch && matchKelas && matchGender;
  });

  const filteredGuru = guruList.filter(g => 
    g.nama.toLowerCase().includes(search.toLowerCase()) || 
    g.nip.includes(search) ||
    g.mataPelajaran.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStaf = stafList.filter(st => 
    st.nama.toLowerCase().includes(search.toLowerCase()) || 
    st.nik.includes(search) ||
    st.bagian.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRombel = activeRombelList.filter(r => {
    const matchSearch = r.namaRombel.toLowerCase().includes(search.toLowerCase()) ||
                        r.waliKelasNama.toLowerCase().includes(search.toLowerCase()) ||
                        r.ruangan.toLowerCase().includes(search.toLowerCase()) ||
                        (r.ketuaKelasNama && r.ketuaKelasNama.toLowerCase().includes(search.toLowerCase()));
    const matchTingkat = filterTingkat === 'Semua' || r.tingkatKelas === filterTingkat;
    return matchSearch && matchTingkat;
  });

  const filteredMapel = activeMapelList.filter(m => {
    const matchSearch = m.namaMapel.toLowerCase().includes(search.toLowerCase()) || 
                        m.kodeMapel.toLowerCase().includes(search.toLowerCase()) || 
                        m.guruPengampuNama.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategoriMapel === 'Semua' || m.kategori === filterKategoriMapel;
    const matchHari = filterHariMapel === 'Semua' || m.jadwalMengajar.some(j => j.hari === filterHariMapel);
    return matchSearch && matchKategori && matchHari;
  });

  const filteredEkskul = activeEkskulList.filter(e => {
    const matchSearch = e.namaEkskul.toLowerCase().includes(search.toLowerCase()) ||
                        e.kodeEkskul.toLowerCase().includes(search.toLowerCase()) ||
                        e.pembinaNama.toLowerCase().includes(search.toLowerCase()) ||
                        e.tempat.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategoriEkskul === 'Semua' || e.kategori === filterKategoriEkskul;
    const matchHari = filterHariEkskul === 'Semua' || e.hariLatihan === filterHariEkskul;
    const matchStatus = filterStatusEkskul === 'Semua' || e.status === filterStatusEkskul;
    return matchSearch && matchKategori && matchHari && matchStatus;
  });

  const handleExportEkskulCsv = () => {
    let csv = 'Kode Ekskul,Nama Ekstrakurikuler,Kategori,Pembina,NIP Pembina,Kontak,Hari Latihan,Jam Latihan,Tempat,Tingkat Target,Kuota,Jumlah Anggota,Biaya Iuran (Rp),Status,Deskripsi,Daftar Nama Siswa Anggota\n';
    activeEkskulList.forEach(e => {
      const studentNames = e.anggotaSiswaIds
        .map(sid => siswaList.find(s => s.id === sid)?.nama || sid)
        .join('; ');
      csv += `"${e.kodeEkskul}","${e.namaEkskul}","${e.kategori}","${e.pembinaNama}","${e.nipPembina || '-'}","${e.kontakPembina || '-'}","${e.hariLatihan}","${e.jamMulai} - ${e.jamSelesai}","${e.tempat}","${e.tingkatTarget}","${e.kuotaMaksimal}","${e.anggotaSiswaIds.length}","${e.biayaIuran}","${e.status}","${(e.deskripsi || '').replace(/"/g, '""')}","${studentNames}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Database_Kelas_Ekstrakurikuler_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStudentInEkskul = (ekskulId: string, siswaId: string) => {
    setActiveEkskulList(prev => prev.map(e => {
      if (e.id === ekskulId) {
        const exists = e.anggotaSiswaIds.includes(siswaId);
        const updated = exists 
          ? e.anggotaSiswaIds.filter(id => id !== siswaId)
          : [...e.anggotaSiswaIds, siswaId];
        return { ...e, anggotaSiswaIds: updated };
      }
      return e;
    }));
    if (activeEkskulMembersModal && activeEkskulMembersModal.id === ekskulId) {
      setActiveEkskulMembersModal(prev => {
        if (!prev) return null;
        const exists = prev.anggotaSiswaIds.includes(siswaId);
        const updated = exists 
          ? prev.anggotaSiswaIds.filter(id => id !== siswaId)
          : [...prev.anggotaSiswaIds, siswaId];
        return { ...prev, anggotaSiswaIds: updated };
      });
    }
  };

  const handleExportMapelCsv = () => {
    let csv = 'Kode Mapel,Nama Mata Pelajaran,Kategori,Tingkat Kelas,Guru Pengampu,NIP,Alokasi JP/Minggu,KKM,Kurikulum,Jadwal & Jam Mengajar\n';
    activeMapelList.forEach(m => {
      const jadwalStr = m.jadwalMengajar.map(j => `${j.hari} ${j.jamMulai}-${j.jamSelesai} (${j.kelasTarget} - ${j.ruangan || '-'})`).join(' | ');
      csv += `"${m.kodeMapel}","${m.namaMapel}","${m.kategori}","${m.tingkatKelas}","${m.guruPengampuNama}","${m.nipGuru || '-'}","${m.alokasiJamPerMinggu}","${m.kkm}","${m.kurikulum}","${jadwalStr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Database_Mata_Pelajaran_Sekolah_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Open Modal Add
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    if (subTab === 'siswa') {
      const defaultRombel = activeRombelList[0];
      setFormSiswa({
        nisn: '',
        nis: '',
        nik: '',
        nama: '',
        kelas: defaultRombel?.namaRombel || 'X-IPA-1',
        tingkatKelas: defaultRombel?.tingkatKelas || 'Kelas 7',
        rombel: defaultRombel?.namaRombel || '',
        jenisKelamin: 'L',
        tempatLahir: 'Jakarta',
        tanggalLahir: '2008-01-01',
        agama: 'Islam',
        alamat: '',
        alamatLengkap: '',
        namaWali: '',
        teleponWali: '',
        status: 'Aktif',
        golonganDarah: 'O',
        kodeBarcode: '',
        fotoUrl: '',
        email: '',
        username: '',
        password: '',
        asalSekolah: '',
        anakKe: 1,
        jumlahSaudara: 0,
        beratBadan: 0,
        tinggiBadan: 0,
        namaAyah: '',
        namaIbu: '',
        tempatLahirOrtu: '',
        tanggalLahirOrtu: '',
        pendidikanOrtu: '',
        pekerjaanOrtu: '',
        nikOrtu: ''
      });
    } else if (subTab === 'guru') {
      setFormGuru({
        nip: '',
        nik: '',
        nama: '',
        gelarDepan: '',
        gelarBelakang: '',
        mataPelajaran: '',
        jabatan: 'Guru Mata Pelajaran',
        email: '',
        username: '',
        password: '',
        telepon: '',
        jenisKelamin: 'L',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1985-01-01',
        agama: 'Islam',
        alamatLengkap: '',
        pendidikanTerakhir: 'S1 Pendidikan',
        sertifikasiGuru: true,
        status: 'PNS',
        kodeBarcode: '',
        fotoUrl: ''
      });
    } else if (subTab === 'staf') {
      setFormStaf({
        nik: '',
        nama: '',
        bagian: 'Tata Usaha',
        email: '',
        username: '',
        password: '',
        telepon: '',
        jenisKelamin: 'L',
        tempatLahir: 'Jakarta',
        tanggalLahir: '1990-01-01',
        agama: 'Islam',
        alamatLengkap: '',
        pendidikanTerakhir: 'D3 / S1',
        status: 'Tetap',
        kodeBarcode: '',
        fotoUrl: ''
      });
    } else if (subTab === 'rombel') {
      setSelectedSiswaIdsForRombel([]);
      setFormRombel({
        namaRombel: '',
        tingkatKelas: 'Kelas 10',
        jurusanPeminatan: 'MIPA / Umum',
        waliKelasNama: guruList[0]?.nama || 'Drs. Hendra Kusuma, M.Pd.',
        ruangan: 'Ruang R.101 (Gedung A)',
        kurikulum: 'Kurikulum Merdeka',
        tahunAjaran: '2026/2027',
        semester: 'Ganjil',
        ketuaKelasNama: '',
        kapasitas: 36,
        catatan: ''
      });
    } else if (subTab === 'mapel') {
      const defaultGuru = guruList[0];
      setFormMapel({
        kodeMapel: `MP-${Date.now().toString().slice(-4)}`,
        namaMapel: '',
        kategori: 'Wajib Umum',
        tingkatKelas: 'Kelas 10 & 11',
        guruPengampuNama: defaultGuru?.nama || 'Drs. Hendra Kusuma, M.Pd.',
        nipGuru: defaultGuru?.nip || '198501152010011002',
        alokasiJamPerMinggu: 4,
        kkm: 75,
        kurikulum: 'Kurikulum Merdeka',
        catatan: '',
        jadwalMengajar: [
          { id: `js-${Date.now()}`, hari: 'Senin', jamMulai: '07:30', jamSelesai: '09:00', kelasTarget: 'X-IPA-1', ruangan: 'Ruang R.101 (Gedung A)' }
        ]
      });
    } else if (subTab === 'ekskul') {
      const defaultGuru = guruList[0];
      const newNum = String(activeEkskulList.length + 1).padStart(2, '0');
      setFormEkskul({
        kodeEkskul: `EKS-0${newNum}`,
        namaEkskul: '',
        kategori: 'Olahraga',
        pembinaNama: defaultGuru?.nama || 'Drs. H. Bambang Sutrisno',
        nipPembina: defaultGuru?.nip || '197103251998021001',
        kontakPembina: defaultGuru?.telepon || '081234567801',
        hariLatihan: 'Jumat',
        jamMulai: '15:00',
        jamSelesai: '17:00',
        tempat: 'Lapangan Utama / Aula',
        tingkatTarget: 'Semua Tingkat',
        kuotaMaksimal: 30,
        anggotaSiswaIds: [],
        status: 'Aktif',
        biayaIuran: 0,
        deskripsi: ''
      });
    }
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subTab === 'siswa') {
      if (modalMode === 'add') {
        const newSiswa: Siswa = { ...formSiswa, id: `sis-${Date.now()}` };
        setSiswaList(prev => [newSiswa, ...prev]);
      } else if (editingId) {
        setSiswaList(prev => prev.map(s => s.id === editingId ? { ...formSiswa, id: editingId } : s));
      }
    } else if (subTab === 'guru') {
      if (modalMode === 'add') {
        const newGuru: Guru = { ...formGuru, id: `gur-${Date.now()}` };
        setGuruList(prev => [newGuru, ...prev]);
      } else if (editingId) {
        setGuruList(prev => prev.map(g => g.id === editingId ? { ...formGuru, id: editingId } : g));
      }
    } else if (subTab === 'staf') {
      if (modalMode === 'add') {
        const newStaf: Staf = { ...formStaf, id: `stf-${Date.now()}` };
        setStafList(prev => [newStaf, ...prev]);
      } else if (editingId) {
        setStafList(prev => prev.map(st => st.id === editingId ? { ...formStaf, id: editingId } : st));
      }
    } else if (subTab === 'rombel') {
      if (modalMode === 'add') {
        const newRombel: RombelKelas = { ...formRombel, id: `rombel-${Date.now()}` };
        setActiveRombelList(prev => [newRombel, ...prev]);
        setSiswaList(prev => prev.map(s => {
          if (selectedSiswaIdsForRombel.includes(s.id)) {
            return { ...s, kelas: newRombel.namaRombel };
          }
          return s;
        }));
      } else if (editingId) {
        const updatedRombel: RombelKelas = { ...formRombel, id: editingId };
        setActiveRombelList(prev => prev.map(r => r.id === editingId ? updatedRombel : r));
        const originalRombel = activeRombelList.find(r => r.id === editingId);
        const originalName = originalRombel ? originalRombel.namaRombel : formRombel.namaRombel;
        setSiswaList(prev => prev.map(s => {
          if (selectedSiswaIdsForRombel.includes(s.id)) {
            return { ...s, kelas: formRombel.namaRombel };
          }
          if (originalName && s.kelas.toLowerCase() === originalName.toLowerCase()) {
            return { ...s, kelas: 'Belum Ada Kelas' };
          }
          return s;
        }));
      }
    } else if (subTab === 'mapel') {
      if (modalMode === 'add') {
        const newMapel: MataPelajaranItem = { ...formMapel, id: `mapel-${Date.now()}` };
        setActiveMapelList(prev => [newMapel, ...prev]);
      } else if (editingId) {
        setActiveMapelList(prev => prev.map(m => m.id === editingId ? { ...formMapel, id: editingId } : m));
      }
    } else if (subTab === 'ekskul') {
      if (modalMode === 'add') {
        const newEkskul: EkstrakurikulerItem = { ...formEkskul, id: `eks-${Date.now()}` };
        setActiveEkskulList(prev => [newEkskul, ...prev]);
      } else if (editingId) {
        setActiveEkskulList(prev => prev.map(e => e.id === editingId ? { ...formEkskul, id: editingId } : e));
      }
    }
    setIsModalOpen(false);
  };

  // Delete Handlers
  const handleDelete = (id: string, name?: string, type?: 'siswa' | 'guru' | 'staf' | 'rombel' | 'mapel' | 'ekskul') => {
    const currentType = type || (subTab as 'siswa' | 'guru' | 'staf' | 'rombel' | 'mapel' | 'ekskul');
    let itemName = name || '';

    if (!itemName) {
      if (currentType === 'siswa') itemName = siswaList.find(s => s.id === id)?.nama || 'Siswa';
      else if (currentType === 'guru') itemName = guruList.find(g => g.id === id)?.nama || 'Guru';
      else if (currentType === 'staf') itemName = stafList.find(st => st.id === id)?.nama || 'Staf';
      else if (currentType === 'rombel') itemName = activeRombelList.find(r => r.id === id)?.namaRombel || 'Rombel';
      else if (currentType === 'mapel') itemName = activeMapelList.find(m => m.id === id)?.namaMapel || 'Mata Pelajaran';
      else if (currentType === 'ekskul') itemName = activeEkskulList.find(e => e.id === id)?.namaEkskul || 'Kelas Ekstrakurikuler';
    }

    setDeleteConfirmItem({ id, nama: itemName, targetType: currentType });
  };

  const executeDelete = () => {
    if (!deleteConfirmItem) return;

    const { id, targetType } = deleteConfirmItem;

    if (targetType === 'siswa') {
      setSiswaList(prev => prev.filter(s => s.id !== id));
    } else if (targetType === 'guru') {
      setGuruList(prev => prev.filter(g => g.id !== id));
    } else if (targetType === 'staf') {
      setStafList(prev => prev.filter(st => st.id !== id));
    } else if (targetType === 'rombel') {
      const deletedRombel = activeRombelList.find(r => r.id === id);
      setActiveRombelList(prev => prev.filter(r => r.id !== id));
      if (deletedRombel) {
        setSiswaList(prev => prev.map(s => 
          s.kelas.toLowerCase() === deletedRombel.namaRombel.toLowerCase() 
            ? { ...s, kelas: 'Belum Ada Kelas' } 
            : s
        ));
      }
    } else if (targetType === 'mapel') {
      setActiveMapelList(prev => prev.filter(m => m.id !== id));
    } else if (targetType === 'ekskul') {
      setActiveEkskulList(prev => prev.filter(e => e.id !== id));
    }

    setDeleteConfirmItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5 flex-wrap">
            <Users className="w-5 h-5 text-blue-400" /> Database Induk Sekolah
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1.5">
              {subTab === 'siswa' && (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Data Siswa ({siswaList.length})
                </>
              )}
              {subTab === 'guru' && (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Data Guru ({guruList.length})
                </>
              )}
              {subTab === 'staf' && (
                <>
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Data Staf ({stafList.length})
                </>
              )}
              {subTab === 'rombel' && (
                <>
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Rombel & Kelas ({activeRombelList.length})
                </>
              )}
              {subTab === 'mapel' && (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Mata Pelajaran ({activeMapelList.length})
                </>
              )}
              {subTab === 'ekskul' && (
                <>
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Kelas Ekstrakurikuler ({activeEkskulList.length})
                </>
              )}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {subTab === 'ekskul' 
              ? 'Manajemen program, pembina, jadwal latihan, kuota, dan keanggotaan ekstrakurikuler'
              : subTab === 'mapel'
              ? 'Manajemen kurikulum, mata pelajaran, alokasi jam, dan jadwal mengajar guru'
              : subTab === 'rombel'
              ? 'Manajemen rombongan belajar, wali kelas, ruangan, dan pembagian siswa per kelas'
              : 'Manajemen data master Siswa, Guru, dan Staf Kependidikan'}
          </p>
        </div>

        {/* Google Sheets Sync panel */}
        <div className="flex flex-wrap items-center gap-2">
          {databaseSpreadsheetUrl && (
            <a
              href={databaseSpreadsheetUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Buka Spreadsheet
            </a>
          )}
          <button
            onClick={handleSyncAllToGoogleSheets}
            disabled={syncingToDrive}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            {syncingToDrive ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Sinkronisasi...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> Sinkron Google Sheets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden File Input for Template Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleProcessImportFile} 
        accept=".csv,.json,.txt" 
        className="hidden" 
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-[#121212] p-4 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={
                subTab === 'rombel' 
                  ? "Cari Rombel, Wali Kelas, Ruangan..." 
                  : subTab === 'mapel'
                  ? "Cari nama mapel, kode, atau guru pengampu..."
                  : subTab === 'ekskul'
                  ? "Cari ekskul, pembina, hari, atau tempat latihan..."
                  : "Cari nama, NUPTK/NISN/NIK, atau mata pelajaran..."
              }
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Class Filter for Siswa */}
          {subTab === 'siswa' && (
            <>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterKelas}
                  onChange={e => setFilterKelas(e.target.value)}
                  className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua Kelas / Rombel</option>
                  {Array.from(new Set([...activeRombelList.map(r => r.namaRombel), 'X-IPA-1', 'XI-IPA-2', 'XI-IPS-1', 'XII-IPA-1'])).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                  className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua L/P</option>
                  <option value="L">L - Laki-laki</option>
                  <option value="P">P - Perempuan</option>
                </select>
              </div>
            </>
          )}

          {/* Tingkat Filter for Rombel */}
          {subTab === 'rombel' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterTingkat}
                onChange={e => setFilterTingkat(e.target.value)}
                className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="Kelas 10">Kelas 10</option>
                <option value="Kelas 11">Kelas 11</option>
                <option value="Kelas 12">Kelas 12</option>
                <option value="Kelas 7">Kelas 7</option>
                <option value="Kelas 8">Kelas 8</option>
                <option value="Kelas 9">Kelas 9</option>
              </select>
            </div>
          )}

          {/* Kategori & Hari Filter for Mapel */}
          {subTab === 'mapel' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterKategoriMapel}
                onChange={e => setFilterKategoriMapel(e.target.value)}
                className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Semua">Semua Kategori Mapel</option>
                <option value="Wajib Umum">Wajib Umum</option>
                <option value="Peminatan IPA">Peminatan IPA</option>
                <option value="Peminatan IPS">Peminatan IPS</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
                <option value="Informatika & Teknologi">Informatika & Teknologi</option>
              </select>

              <select
                value={filterHariMapel}
                onChange={e => setFilterHariMapel(e.target.value)}
                className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Semua">Semua Hari Mengajar</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>
          )}

          {/* Kategori, Hari, & Status Filter for Ekskul */}
          {subTab === 'ekskul' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterKategoriEkskul}
                  onChange={e => setFilterKategoriEkskul(e.target.value)}
                  className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Seni & Budaya">Seni & Budaya</option>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Sains & Teknologi">Sains & Teknologi</option>
                  <option value="Kepanduan & Bela Negara">Kepanduan & Bela Negara</option>
                  <option value="Bahasa & Komunikasi">Bahasa & Komunikasi</option>
                </select>
              </div>

              <select
                value={filterHariEkskul}
                onChange={e => setFilterHariEkskul(e.target.value)}
                className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Semua">Semua Hari Latihan</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>

              <select
                value={filterStatusEkskul}
                onChange={e => setFilterStatusEkskul(e.target.value)}
                className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          )}
        </div>

        {/* Template & Add Controls */}
        {currentRole !== 'staf' && (
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {subTab === 'mapel' && (
              <button
                onClick={handleExportMapelCsv}
                className="px-3 py-2 bg-[#181818] hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
                title="Ekspor Database Mata Pelajaran ke CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" /> Ekspor Mapel CSV
              </button>
            )}

            {subTab === 'ekskul' && (
              <button
                onClick={handleExportEkskulCsv}
                className="px-3 py-2 bg-[#181818] hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
                title="Ekspor Database Ekstrakurikuler ke CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Ekspor Ekskul CSV
              </button>
            )}

            {subTab !== 'rombel' && subTab !== 'mapel' && subTab !== 'ekskul' && (
              <>
                <button
                  onClick={() => handleDownloadTemplate(subTab as 'siswa' | 'guru' | 'staf')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  title={`Unduh Template CSV Data ${subTab.toUpperCase()}`}
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" /> Template CSV
                </button>

                <button
                  onClick={() => handleTriggerImport(subTab as 'siswa' | 'guru' | 'staf')}
                  className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  title={`Import File Template ke Database ${subTab.toUpperCase()}`}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import File
                </button>

                <button
                  onClick={() => setShowTemplateHubModal(true)}
                  className="px-3 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/50 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FolderDown className="w-3.5 h-3.5 text-purple-400" /> Pusat Template
                </button>
              </>
            )}

            <button
              onClick={handleOpenAdd}
              className={`px-4 py-2 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                subTab === 'rombel' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-1 ring-indigo-400/50' 
                  : subTab === 'mapel'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-1 ring-amber-400/50'
                  : subTab === 'ekskul'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              Tambah {subTab === 'siswa' ? 'Siswa' : subTab === 'guru' ? 'Guru' : subTab === 'staf' ? 'Staf' : subTab === 'mapel' ? 'Mata Pelajaran' : subTab === 'ekskul' ? 'Ekskul' : 'Rombel'} Baru
            </button>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW FOR ACTIVE SUBTAB */}
      {subTab === 'siswa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-blue-500/30 transition-all">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa Terdaftar</p>
              <p className="text-xl font-black text-white mt-0.5">
                {siswaList.length} <span className="text-[10px] font-normal text-slate-400">Siswa</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                <span className="text-green-400 font-bold flex items-center">
                  {siswaList.filter(s => s.status === 'Aktif').length}
                </span>
                <span>Aktif</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{siswaList.filter(s => s.status === 'Alumni').length} Alumni</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-indigo-500/30 transition-all">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rombongan Belajar</p>
              <p className="text-xl font-black text-white mt-0.5">
                {new Set(siswaList.map(s => s.kelas)).size} <span className="text-[10px] font-normal text-slate-400">Rombel</span>
              </p>
              <p className="text-[10px] text-indigo-300 mt-1 truncate">
                Wali Kelas & Kurikulum Merdeka aktif
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keseimbangan Gender</p>
              <p className="text-base font-black text-white mt-0.5 flex items-center justify-between">
                <span>{siswaList.filter(s => s.jenisKelamin === 'L').length} L <span className="text-[10px] font-normal text-slate-500">vs</span> {siswaList.filter(s => s.jenisKelamin === 'P').length} P</span>
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden flex border border-slate-800/80">
                <div 
                  className="bg-blue-500 h-full transition-all" 
                  style={{ width: `${(siswaList.filter(s => s.jenisKelamin === 'L').length / (siswaList.length || 1)) * 100}%` }} 
                />
                <div 
                  className="bg-rose-500 h-full transition-all" 
                  style={{ width: `${(siswaList.filter(s => s.jenisKelamin === 'P').length / (siswaList.length || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-purple-500/30 transition-all">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Persentase Keaktifan</p>
              <p className="text-xl font-black text-white mt-0.5">
                {siswaList.length ? Math.round((siswaList.filter(s => s.status === 'Aktif').length / siswaList.length) * 100) : 0}% <span className="text-[10px] font-normal text-slate-400">Aktif</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {siswaList.filter(s => s.status === 'Pindah').length} Siswa Pindah / Mutasi Keluar
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'guru' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-purple-500/30 transition-all">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tenaga Pendidik</p>
              <p className="text-xl font-black text-white mt-0.5">
                {guruList.length} <span className="text-[10px] font-normal text-slate-400">Guru</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                PNS: {guruList.filter(g => g.status === 'PNS').length} | GTT/GTY: {guruList.filter(g => g.status !== 'PNS').length}
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-amber-500/30 transition-all">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kualifikasi S2/S3</p>
              <p className="text-xl font-black text-white mt-0.5">
                {guruList.filter(g => g.pendidikanTerakhir?.includes('S2') || g.pendidikanTerakhir?.includes('S3')).length} <span className="text-[10px] font-normal text-slate-400">Guru</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Sarjana (S1): {guruList.filter(g => g.pendidikanTerakhir?.includes('S1')).length} Guru
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sertifikasi Guru</p>
              <p className="text-xl font-black text-white mt-0.5">
                {guruList.filter(g => g.sertifikasiGuru).length} <span className="text-[10px] font-normal text-slate-400">Guru</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Proses/Belum: {guruList.filter(g => !g.sertifikasiGuru).length} Guru
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-indigo-500/30 transition-all">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bidang Pengajaran</p>
              <p className="text-xl font-black text-white mt-0.5">
                {new Set(guruList.map(g => g.mataPelajaran)).size} <span className="text-[10px] font-normal text-slate-400">Bidang</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {activeMapelList.length} Mata Pelajaran aktif
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'staf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-pink-500/30 transition-all">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Kependidikan</p>
              <p className="text-xl font-black text-white mt-0.5">
                {stafList.length} <span className="text-[10px] font-normal text-slate-400">Staf</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Tetap: {stafList.filter(s => s.status === 'Tetap').length} | Kontrak: {stafList.filter(s => s.status !== 'Tetap').length}
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-indigo-500/30 transition-all">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Divisi & Bidang Kerja</p>
              <p className="text-xl font-black text-white mt-0.5">
                {new Set(stafList.map(s => s.bagian)).size} <span className="text-[10px] font-normal text-slate-400">Bagian</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                TU, Keuangan, Perpustakaan, IT
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'ekskul' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Ekstrakurikuler</p>
              <p className="text-xl font-black text-white mt-0.5">
                {activeEkskulList.length} <span className="text-[10px] font-normal text-slate-400">Klub</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                <span className="text-emerald-400 font-bold">
                  {activeEkskulList.filter(e => e.status === 'Aktif').length}
                </span>
                <span>Aktif</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{activeEkskulList.filter(e => e.status === 'Nonaktif').length} Nonaktif</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-blue-500/30 transition-all">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa Terdaftar</p>
              <p className="text-xl font-black text-white mt-0.5">
                {activeEkskulList.reduce((acc, curr) => acc + (curr.anggotaSiswaIds ? curr.anggotaSiswaIds.length : 0), 0)} <span className="text-[10px] font-normal text-slate-400">Pendaftaran</span>
              </p>
              <p className="text-[10px] text-blue-300 mt-1 truncate">
                Partisipasi minat & bakat siswa
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-amber-500/30 transition-all">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Bidang</p>
              <p className="text-xl font-black text-white mt-0.5">
                {new Set(activeEkskulList.map(e => e.kategori)).size} <span className="text-[10px] font-normal text-slate-400">Bidang</span>
              </p>
              <p className="text-[10px] text-amber-300 mt-1 truncate">
                Olahraga, Seni, Sains, Kepanduan
              </p>
            </div>
          </div>

          <div className="bg-[#121212] p-4 rounded-xl border border-slate-800 flex items-center gap-3 shadow-md hover:border-purple-500/30 transition-all">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guru Pembina</p>
              <p className="text-xl font-black text-white mt-0.5">
                {new Set(activeEkskulList.map(e => e.pembinaNama)).size} <span className="text-[10px] font-normal text-slate-400">Pembina</span>
              </p>
              <p className="text-[10px] text-purple-300 mt-1 truncate">
                Pendampingan intensif & prestasi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLE DATA LIST */}
      <div className="bg-[#121212] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        
        {subTab === 'siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Foto & Nama Siswa</th>
                  <th className="px-4 py-3">NISN / NIS</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">L/P</th>
                  <th className="px-4 py-3">Orang Tua / Wali</th>
                  <th className="px-4 py-3">Telepon Wali</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data siswa yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/20 border-b border-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div 
                            className="relative shrink-0 group cursor-pointer" 
                            onClick={() => setQuickPhotoData({ type: 'siswa', data: s })}
                            title="Klik untuk ganti foto"
                          >
                            <img 
                              src={s.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                              alt={s.nama} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500 transition-all shadow-md"
                            />
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${
                              s.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-500'
                            }`} />
                          </div>
                          <div>
                            <span 
                              onClick={() => {
                                setSelectedSiswaDetail(s);
                                setDetailTab('biodata');
                              }}
                              className="text-white font-extrabold hover:text-blue-400 cursor-pointer block transition-colors hover:underline whitespace-nowrap"
                            >
                              {s.nama}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[180px] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-600 shrink-0" /> {s.alamat || 'Alamat tidak diisi'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                        <div className="font-mono text-slate-300 font-bold">{s.nisn}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">NIS: {s.nis}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] whitespace-nowrap">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">
                        {s.jenisKelamin === 'L' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 inline-flex items-center text-[11px] font-mono">
                            L
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20 inline-flex items-center text-[11px] font-mono">
                            P
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                        <div className="text-slate-300 font-bold">{s.namaWali}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-600 shrink-0" /> Orang Tua / Wali
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{s.teleponWali}</span>
                          {s.teleponWali && (
                            <button
                              onClick={() => {
                                let formattedPhone = s.teleponWali.trim().replace(/\D/g, '');
                                if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
                                else if (formattedPhone.startsWith('8')) formattedPhone = '62' + formattedPhone;
                                const text = encodeURIComponent(`Halo Bapak/Ibu ${s.namaWali}, kami dari sekolah ingin menginformasikan perihal perkembangan akademik anak Anda yang bernama *${s.nama}*...`);
                                window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
                              }}
                              title="Hubungi Wali di WhatsApp"
                              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-md transition-all shrink-0"
                            >
                              <Phone className="w-3.5 h-3.5 fill-emerald-500/10" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => {
                              setSelectedSiswaDetail(s);
                              setDetailTab('biodata');
                            }}
                            title="Lihat Profil Lengkap"
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-600/15 border border-blue-500/20 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setCardModalData({ type: 'siswa', data: s })}
                            title="Cetak Kartu Digital & Barcode"
                            className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-600/15 border border-purple-500/20 rounded-lg transition-all"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {currentRole !== 'staf' && (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingId(s.id);
                                  setFormSiswa({
                                    ...s,
                                    tanggalLahir: normalizeDateForInput(s.tanggalLahir),
                                    email: s.email || '',
                                    asalSekolah: s.asalSekolah || '',
                                    anakKe: s.anakKe !== undefined ? s.anakKe : 1,
                                    jumlahSaudara: s.jumlahSaudara !== undefined ? s.jumlahSaudara : 0,
                                    beratBadan: s.beratBadan !== undefined ? s.beratBadan : 0,
                                    tinggiBadan: s.tinggiBadan !== undefined ? s.tinggiBadan : 0,
                                    namaAyah: s.namaAyah || '',
                                    namaIbu: s.namaIbu || '',
                                    tempatLahirOrtu: s.tempatLahirOrtu || '',
                                    tanggalLahirOrtu: normalizeDateForInput(s.tanggalLahirOrtu || ''),
                                    pendidikanOrtu: s.pendidikanOrtu || '',
                                    pekerjaanOrtu: s.pekerjaanOrtu || '',
                                    nikOrtu: s.nikOrtu || ''
                                  });
                                  setModalMode('edit');
                                  setIsModalOpen(true);
                                }}
                                title="Ubah Biodata Siswa"
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(s.id, s.nama, 'siswa')}
                                title="Hapus Data Siswa"
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'guru' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Foto & Nama Guru</th>
                  <th className="px-4 py-3">NUPTK</th>
                  <th className="px-4 py-3">Mata Pelajaran</th>
                  <th className="px-4 py-3">Jabatan / Tugas</th>
                  <th className="px-4 py-3">Kontak Email / Telp</th>
                  <th className="px-4 py-3">Status Pegawai</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGuru.map(g => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-3">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => setQuickPhotoData({ type: 'guru', data: g })}
                        title="Klik untuk Upload / Ganti Foto"
                      >
                        <img 
                          src={g.fotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80'} 
                          alt={g.nama} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-purple-400 transition-all shadow-sm"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-purple-400 transition-opacity">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-white font-bold">{g.nama}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{g.nip}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                        {g.mataPelajaran}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{g.jabatan}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{g.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{g.telepon}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-[10px]">
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => setQuickPhotoData({ type: 'guru', data: g })}
                        title="Upload / Ganti Foto Guru"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCardModalData({ type: 'guru', data: g })}
                        title="Cetak Kartu Digital & Barcode"
                        className="px-2 py-1 text-purple-400 hover:bg-purple-600/20 bg-purple-600/10 border border-purple-500/30 rounded-lg transition-colors text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Kartu ID
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(g.id);
                          setFormGuru({
                            nip: g.nip || '',
                            nik: g.nik || '',
                            nama: g.nama || '',
                            gelarDepan: g.gelarDepan || '',
                            gelarBelakang: g.gelarBelakang || '',
                            mataPelajaran: g.mataPelajaran || '',
                            jabatan: g.jabatan || 'Guru Mata Pelajaran',
                            email: g.email || '',
                            telepon: g.telepon || '',
                            jenisKelamin: g.jenisKelamin || 'L',
                            tempatLahir: g.tempatLahir || 'Jakarta',
                            tanggalLahir: normalizeDateForInput(g.tanggalLahir || '1985-01-01'),
                            agama: g.agama || 'Islam',
                            alamatLengkap: g.alamatLengkap || '',
                            pendidikanTerakhir: g.pendidikanTerakhir || 'S1 Pendidikan',
                            sertifikasiGuru: g.sertifikasiGuru ?? true,
                            status: g.status || 'PNS',
                            kodeBarcode: g.kodeBarcode || `GUR-${g.nip}`,
                            fotoUrl: g.fotoUrl || '',
                            username: g.username || '',
                            password: g.password || ''
                          });
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
                        title="Edit Data Guru"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(g.id, g.nama, 'guru')}
                        title="Hapus Data Guru"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'staf' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Foto & Nama Staf</th>
                  <th className="px-4 py-3">NIK</th>
                  <th className="px-4 py-3">Bagian / Divisi</th>
                  <th className="px-4 py-3">Email & Telepon</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStaf.map(st => (
                  <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-3">
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => setQuickPhotoData({ type: 'staf', data: st })}
                        title="Klik untuk Upload / Ganti Foto"
                      >
                        <img 
                          src={st.fotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'} 
                          alt={st.nama} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-amber-400 transition-all shadow-sm"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-amber-400 transition-opacity">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-white font-bold">{st.nama}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{st.nik}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {st.bagian}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{st.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{st.telepon}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-300">{st.status}</td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button 
                        onClick={() => setQuickPhotoData({ type: 'staf', data: st })}
                        title="Upload / Ganti Foto Staf"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCardModalData({ type: 'staf', data: st })}
                        title="Cetak Kartu Digital & Barcode"
                        className="px-2 py-1 text-amber-400 hover:bg-amber-600/20 bg-amber-600/10 border border-amber-500/30 rounded-lg transition-colors text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Kartu ID
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(st.id);
                          setFormStaf({
                            nik: st.nik || '',
                            nama: st.nama || '',
                            bagian: st.bagian || 'Tata Usaha',
                            email: st.email || '',
                            telepon: st.telepon || '',
                            jenisKelamin: st.jenisKelamin || 'L',
                            tempatLahir: st.tempatLahir || 'Jakarta',
                            tanggalLahir: normalizeDateForInput(st.tanggalLahir || '1990-01-01'),
                            agama: st.agama || 'Islam',
                            alamatLengkap: st.alamatLengkap || '',
                            pendidikanTerakhir: st.pendidikanTerakhir || 'D3 / S1',
                            status: st.status || 'Tetap',
                            kodeBarcode: st.kodeBarcode || `STF-${st.nik}`,
                            fotoUrl: st.fotoUrl || '',
                            username: st.username || '',
                            password: st.password || ''
                          });
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
                        title="Edit Data Staf"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(st.id, st.nama, 'staf')}
                        title="Hapus Data Staf"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === 'rombel' && (
          <div className="p-5 space-y-6">
            {/* Rombel Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Rombel</p>
                  <p className="text-xl font-black text-white">{activeRombelList.length} <span className="text-xs font-normal text-slate-400">Kelas</span></p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kuota / Kapasitas</p>
                  <p className="text-xl font-black text-white">
                    {activeRombelList.reduce((acc, r) => acc + r.kapasitas, 0)} <span className="text-xs font-normal text-slate-400">Kursi</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</p>
                  <p className="text-xl font-black text-white">
                    {siswaList.filter(s => activeRombelList.some(r => r.namaRombel.toLowerCase() === s.kelas.toLowerCase())).length} <span className="text-xs font-normal text-slate-400">Siswa</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tahun Ajaran Active</p>
                  <p className="text-sm font-bold text-white">2026/2027 <span className="text-xs text-amber-400 font-semibold">(Ganjil)</span></p>
                </div>
              </div>
            </div>

            {/* Rombel Grid Cards */}
            {filteredRombel.length === 0 ? (
              <div className="text-center py-12 bg-[#181818] rounded-xl border border-slate-800/80">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300">Tidak ada Rombel / Kelas ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau buat Rombel baru.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Buat Rombel Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredRombel.map(rombel => {
                  const countSiswa = siswaList.filter(s => s.kelas.toLowerCase() === rombel.namaRombel.toLowerCase()).length;
                  const percentage = Math.min(100, Math.round((countSiswa / rombel.kapasitas) * 100));

                  return (
                    <div 
                      key={rombel.id}
                      className="bg-[#181818] rounded-2xl border border-slate-800/90 hover:border-indigo-500/50 p-5 shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Header Badge */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                                {rombel.namaRombel}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">
                                {rombel.tingkatKelas}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">{rombel.jurusanPeminatan}</span>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                            {rombel.kurikulum}
                          </span>
                        </div>

                        {/* Details List */}
                        <div className="space-y-2 text-xs text-slate-300 bg-[#121212] p-3 rounded-xl border border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Wali Kelas:
                            </span>
                            <span className="font-bold text-white text-right truncate max-w-[170px]" title={rombel.waliKelasNama}>
                              {rombel.waliKelasNama}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Ruangan:
                            </span>
                            <span className="font-semibold text-slate-200">{rombel.ruangan}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Periode:
                            </span>
                            <span className="font-medium text-slate-300">{rombel.tahunAjaran} ({rombel.semester})</span>
                          </div>

                          {rombel.ketuaKelasNama && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Ketua Kelas:
                              </span>
                              <span className="font-medium text-slate-300">{rombel.ketuaKelasNama}</span>
                            </div>
                          )}
                        </div>

                        {/* Kapasitas & Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-indigo-400" /> Kuota Terisi:
                            </span>
                            <span className="font-bold text-white">
                              {countSiswa} <span className="text-slate-500 font-normal">/ {rombel.kapasitas} Siswa</span>
                            </span>
                          </div>

                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                percentage >= 90 ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setActiveRombelDetail(rombel)}
                          className="px-3 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-1 justify-center"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat Siswa ({countSiswa})
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(rombel.id);
                              const currentStudents = siswaList
                                .filter(s => s.kelas.toLowerCase() === rombel.namaRombel.toLowerCase())
                                .map(s => s.id);
                              setSelectedSiswaIdsForRombel(currentStudents);
                              setFormRombel({
                                namaRombel: rombel.namaRombel,
                                tingkatKelas: rombel.tingkatKelas,
                                jurusanPeminatan: rombel.jurusanPeminatan,
                                waliKelasNama: rombel.waliKelasNama,
                                ruangan: rombel.ruangan,
                                kurikulum: rombel.kurikulum,
                                tahunAjaran: rombel.tahunAjaran,
                                semester: rombel.semester,
                                ketuaKelasNama: rombel.ketuaKelasNama || '',
                                kapasitas: rombel.kapasitas,
                                catatan: rombel.catatan || ''
                              });
                              setModalMode('edit');
                              setIsModalOpen(true);
                            }}
                            title="Edit Data Rombel"
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(rombel.id, rombel.namaRombel, 'rombel')}
                            title="Hapus Rombel"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {subTab === 'mapel' && (
          <div className="p-5 space-y-6">
            {/* Mapel Statistics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Mata Pelajaran</p>
                  <p className="text-xl font-black text-white">{activeMapelList.length} <span className="text-xs font-normal text-slate-400">Mapel</span></p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Alokasi Beban Jam</p>
                  <p className="text-xl font-black text-white">
                    {activeMapelList.reduce((acc, m) => acc + m.alokasiJamPerMinggu, 0)} <span className="text-xs font-normal text-slate-400">JP / Minggu</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guru Pengampu Active</p>
                  <p className="text-xl font-black text-white">
                    {new Set(activeMapelList.map(m => m.guruPengampuNama)).size} <span className="text-xs font-normal text-slate-400">Guru</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sesi Mengajar Terjadwal</p>
                  <p className="text-xl font-black text-white">
                    {activeMapelList.reduce((acc, m) => acc + m.jadwalMengajar.length, 0)} <span className="text-xs font-normal text-slate-400">Sesi / Minggu</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Mapel Grid Cards */}
            {filteredMapel.length === 0 ? (
              <div className="text-center py-12 bg-[#181818] rounded-xl border border-slate-800/80">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300">Tidak ada Mata Pelajaran ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1">Coba sesuaikan pencarian atau tambahkan mata pelajaran baru.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Tambah Mata Pelajaran Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredMapel.map(mapel => (
                  <div 
                    key={mapel.id}
                    className="bg-[#181818] rounded-2xl border border-slate-800/90 hover:border-amber-500/50 p-5 shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Header Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                              {mapel.kodeMapel}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                              {mapel.tingkatKelas}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors mt-1.5">
                            {mapel.namaMapel}
                          </h3>
                        </div>

                        <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-bold shrink-0">
                          KKM: {mapel.kkm}
                        </span>
                      </div>

                      {/* Main Details Box */}
                      <div className="space-y-2 text-xs text-slate-300 bg-[#121212] p-3 rounded-xl border border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Guru Pengampu:
                          </span>
                          <span className="font-bold text-white text-right truncate max-w-[170px]" title={mapel.guruPengampuNama}>
                            {mapel.guruPengampuNama}
                          </span>
                        </div>

                        {mapel.nipGuru && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pl-5">
                            <span>NIP: {mapel.nipGuru}</span>
                            <span className="text-emerald-400 font-semibold">{mapel.kategori}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Alokasi Beban:
                          </span>
                          <span className="font-bold text-amber-300">{mapel.alokasiJamPerMinggu} JP / Minggu</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <BookCheck className="w-3.5 h-3.5 text-indigo-400" /> Kurikulum:
                          </span>
                          <span className="font-medium text-slate-300">{mapel.kurikulum}</span>
                        </div>
                      </div>

                      {/* Schedule Slots Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Jadwal & Jam Mengajar ({mapel.jadwalMengajar.length})
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {mapel.jadwalMengajar.map((jadwal, idx) => (
                            <div 
                              key={jadwal.id || idx}
                              className="p-2 bg-[#121212] border border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                  {jadwal.hari}
                                </span>
                                <span className="font-mono text-slate-200 text-[11px]">
                                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-right">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                                  {jadwal.kelasTarget}
                                </span>
                                {jadwal.ruangan && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]" title={jadwal.ruangan}>
                                    {jadwal.ruangan}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditingId(mapel.id);
                          setFormMapel({
                            kodeMapel: mapel.kodeMapel,
                            namaMapel: mapel.namaMapel,
                            kategori: mapel.kategori,
                            tingkatKelas: mapel.tingkatKelas,
                            guruPengampuNama: mapel.guruPengampuNama,
                            nipGuru: mapel.nipGuru || '',
                            alokasiJamPerMinggu: mapel.alokasiJamPerMinggu,
                            kkm: mapel.kkm,
                            kurikulum: mapel.kurikulum,
                            catatan: mapel.catatan || '',
                            jadwalMengajar: mapel.jadwalMengajar
                          });
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-1 justify-center"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Mata Pelajaran
                      </button>

                      <button
                        onClick={() => handleDelete(mapel.id, mapel.namaMapel, 'mapel')}
                        title="Hapus Mata Pelajaran"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subTab === 'ekskul' && (
          <div className="p-4 sm:p-5">
            {filteredEkskul.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Trophy className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                <p className="font-semibold text-sm text-slate-400">Tidak ada data kelas ekstrakurikuler yang cocok.</p>
                <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau filter kategori/hari.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEkskul.map(ekskul => {
                  const memberCount = ekskul.anggotaSiswaIds ? ekskul.anggotaSiswaIds.length : 0;
                  const kuotaPercent = Math.min(100, Math.round((memberCount / (ekskul.kuotaMaksimal || 1)) * 100));
                  
                  const categoryBadgeColor = 
                    ekskul.kategori === 'Olahraga' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : ekskul.kategori === 'Seni & Budaya'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : ekskul.kategori === 'Keagamaan'
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      : ekskul.kategori === 'Sains & Teknologi'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : ekskul.kategori === 'Kepanduan & Bela Negara'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                  return (
                    <div 
                      key={ekskul.id} 
                      className="bg-[#181818] rounded-xl border border-slate-800 p-4.5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-md group"
                    >
                      {/* Top Header Card */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                {ekskul.kodeEkskul}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${categoryBadgeColor}`}>
                                {ekskul.kategori}
                              </span>
                            </div>
                            <h3 className="font-black text-white text-base group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                              {ekskul.namaEkskul}
                            </h3>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${
                            ekskul.status === 'Aktif' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {ekskul.status}
                          </span>
                        </div>

                        {ekskul.deskripsi && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {ekskul.deskripsi}
                          </p>
                        )}

                        {/* Coach & Schedule info */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Pembina:
                            </span>
                            <span className="font-bold text-slate-200 text-right truncate max-w-[160px]" title={ekskul.pembinaNama}>
                              {ekskul.pembinaNama}
                            </span>
                          </div>

                          {ekskul.kontakPembina && (
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pl-5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" /> Kontak:
                              </span>
                              <span className="font-mono text-slate-300">{ekskul.kontakPembina}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Hari & Jam:
                            </span>
                            <span className="font-bold text-emerald-300">
                              {ekskul.hariLatihan}, {ekskul.jamMulai} - {ekskul.jamSelesai}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Tempat:
                            </span>
                            <span className="font-medium text-slate-300 text-right truncate max-w-[160px]" title={ekskul.tempat}>
                              {ekskul.tempat}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Target Kelas:
                            </span>
                            <span className="font-medium text-slate-300">
                              {ekskul.tingkatTarget}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Biaya Iuran:
                            </span>
                            <span className="font-bold text-amber-300">
                              {ekskul.biayaIuran > 0 ? `Rp ${ekskul.biayaIuran.toLocaleString('id-ID')} / bln` : 'Gratis (Sekolah)'}
                            </span>
                          </div>
                        </div>

                        {/* Quota & Enrollment progress */}
                        <div className="bg-[#121212] p-3 rounded-lg border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-bold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-400" /> Anggota Terdaftar
                            </span>
                            <span className="font-bold text-slate-200">
                              <span className="text-emerald-400">{memberCount}</span> / {ekskul.kuotaMaksimal} Siswa
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                kuotaPercent >= 100 
                                  ? 'bg-rose-500' 
                                  : kuotaPercent >= 80 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${kuotaPercent}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 text-right">
                            Keterisian Kuota: {kuotaPercent}% {kuotaPercent >= 100 ? '(Penuh)' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <button
                          onClick={() => {
                            setActiveEkskulMembersModal(ekskul);
                            setEkskulMemberSearch('');
                            setEkskulMemberKelasFilter('Semua');
                          }}
                          className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Users className="w-3.5 h-3.5" /> Kelola Anggota Siswa ({memberCount})
                        </button>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setEditingId(ekskul.id);
                              setFormEkskul({
                                kodeEkskul: ekskul.kodeEkskul,
                                namaEkskul: ekskul.namaEkskul,
                                kategori: ekskul.kategori,
                                pembinaNama: ekskul.pembinaNama,
                                nipPembina: ekskul.nipPembina || '',
                                kontakPembina: ekskul.kontakPembina || '',
                                hariLatihan: ekskul.hariLatihan,
                                jamMulai: ekskul.jamMulai,
                                jamSelesai: ekskul.jamSelesai,
                                tempat: ekskul.tempat,
                                tingkatTarget: ekskul.tingkatTarget,
                                kuotaMaksimal: ekskul.kuotaMaksimal,
                                anggotaSiswaIds: ekskul.anggotaSiswaIds || [],
                                status: ekskul.status,
                                biayaIuran: ekskul.biayaIuran || 0,
                                deskripsi: ekskul.deskripsi || ''
                              });
                              setModalMode('edit');
                              setIsModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#121212] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-1 justify-center"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-400" /> Edit Ekskul
                          </button>

                          <button
                            onClick={() => handleDelete(ekskul.id, ekskul.namaEkskul, 'ekskul')}
                            title="Hapus Ekstrakurikuler"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL ADD / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-5 pb-4 shrink-0">
              <h3 className="font-bold text-white text-base">
                {modalMode === 'add' ? 'Tambah Data Baru' : 'Edit Data'} ({subTab.toUpperCase()})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 text-slate-200">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* Photo Upload Section (Siswa, Guru, Staf only) */}
              {subTab !== 'rombel' && subTab !== 'mapel' && (
                <div className="bg-[#181818] p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-400" /> Pas Foto {subTab.toUpperCase()}
                    </label>
                    {getCurrentFotoUrl() && (
                      <button 
                        type="button" 
                        onClick={() => setCurrentFotoUrl('')} 
                        className="text-[10px] text-rose-400 hover:underline font-semibold"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <img
                        src={getCurrentFotoUrl() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt="Preview Foto"
                        className="w-14 h-16 object-cover rounded-xl border-2 border-blue-500/50 shadow-md bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[9px] font-bold"
                      >
                        Ganti
                      </button>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload File Foto
                        </button>
                        <input
                          type="file"
                          ref={photoInputRef}
                          onChange={handlePhotoFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">Pas Foto Sampel:</span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                          {PRESET_PHOTOS[subTab === 'siswa' ? formSiswa.jenisKelamin : subTab === 'guru' ? (formGuru.jenisKelamin || 'L') : (formStaf.jenisKelamin || 'L')].map((pUrl, idx) => (
                            <img
                              key={idx}
                              src={pUrl}
                              alt={`Sampel ${idx + 1}`}
                              onClick={() => setCurrentFotoUrl(pUrl)}
                              className={`w-6 h-6 rounded-md object-cover cursor-pointer border hover:scale-110 transition-all shrink-0 ${
                                getCurrentFotoUrl() === pUrl ? 'border-2 border-blue-400 ring-2 ring-blue-500/30' : 'border-slate-700 opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subTab === 'siswa' && (
                <>
                  {/* BAGIAN I: DATA PRIBADI SISWA */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> 1. Data Pribadi Siswa
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">NISN</label>
                        <input 
                          type="text" 
                          required 
                          value={formSiswa.nisn} 
                          onChange={e => setFormSiswa({ ...formSiswa, nisn: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">NIS</label>
                        <input 
                          type="text" 
                          required 
                          value={formSiswa.nis} 
                          onChange={e => setFormSiswa({ ...formSiswa, nis: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">No. NIK Siswa</label>
                        <input 
                          type="text" 
                          placeholder="NIK 16 digit"
                          value={formSiswa.nik || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, nik: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Email Siswa</label>
                        <input 
                          type="email" 
                          placeholder="siswa@sekolah.sch.id"
                          value={formSiswa.email || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, email: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Username Akun</label>
                        <input 
                          type="text" 
                          placeholder="username_siswa"
                          value={formSiswa.username || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, username: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Password Akun</label>
                        <input 
                          type="text" 
                          placeholder="password"
                          value={formSiswa.password || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, password: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Nama Lengkap Siswa</label>
                      <input 
                        type="text" 
                        required 
                        value={formSiswa.nama} 
                        onChange={e => setFormSiswa({ ...formSiswa, nama: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Tingkat Kelas</label>
                        <select 
                          value={formSiswa.tingkatKelas || 'Kelas 7'} 
                          onChange={e => {
                            const newTingkat = e.target.value;
                            const matchingRombel = activeRombelList.find(r => r.tingkatKelas === newTingkat);
                            setFormSiswa({ 
                              ...formSiswa, 
                              tingkatKelas: newTingkat,
                              kelas: matchingRombel ? matchingRombel.namaRombel : formSiswa.kelas
                            });
                          }}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
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
                        <label className="text-[11px] font-bold text-slate-400">Rombel / Sub-Kelas</label>
                        <select 
                          value={formSiswa.kelas} 
                          onChange={e => setFormSiswa({ ...formSiswa, kelas: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                        >
                          {activeRombelList
                            .filter(r => !formSiswa.tingkatKelas || r.tingkatKelas === formSiswa.tingkatKelas)
                            .map(r => (
                              <option key={r.id} value={r.namaRombel}>{r.namaRombel} ({r.tingkatKelas})</option>
                            ))}
                          {activeRombelList.filter(r => !formSiswa.tingkatKelas || r.tingkatKelas === formSiswa.tingkatKelas).length === 0 && (
                            activeRombelList.map(r => (
                              <option key={r.id} value={r.namaRombel}>{r.namaRombel} ({r.tingkatKelas})</option>
                            ))
                          )}
                          <option value="Belum Ada Kelas">Belum Ada Kelas</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Tempat Lahir</label>
                        <input 
                          type="text" 
                          required 
                          value={formSiswa.tempatLahir} 
                          onChange={e => setFormSiswa({ ...formSiswa, tempatLahir: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Tanggal Lahir</label>
                        <div className="relative w-full">
                          <input 
                            type="date" 
                            required 
                            value={formSiswa.tanggalLahir} 
                            onChange={e => setFormSiswa({ ...formSiswa, tanggalLahir: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white flex justify-between items-center group focus-within:border-amber-500 transition-colors">
                            <span>
                              {formSiswa.tanggalLahir 
                                ? formSiswa.tanggalLahir.split('-').reverse().join('/') 
                                : <span className="text-slate-500">dd/mm/yyyy</span>}
                            </span>
                            <Calendar className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Jenis Kelamin</label>
                        <select 
                          value={formSiswa.jenisKelamin} 
                          onChange={e => setFormSiswa({ ...formSiswa, jenisKelamin: e.target.value as 'L' | 'P' })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="L">Laki-laki (L)</option>
                          <option value="P">Perempuan (P)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Agama</label>
                        <select 
                          value={formSiswa.agama || 'Islam'} 
                          onChange={e => setFormSiswa({ ...formSiswa, agama: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                      </div>
                    </div>


                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Alamat Tempat Tinggal</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: Jl. Merdeka No. 12"
                        value={formSiswa.alamat} 
                        onChange={e => setFormSiswa({ ...formSiswa, alamat: e.target.value, alamatLengkap: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  {/* BAGIAN II: FISIK & KELUARGA SISWA */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> 2. Data Fisik & Keluarga
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Anak Ke-</label>
                        <input 
                          type="number" 
                          min={1}
                          value={formSiswa.anakKe || 1} 
                          onChange={e => setFormSiswa({ ...formSiswa, anakKe: parseInt(e.target.value) || 1 })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Jumlah Saudara Kandung</label>
                        <input 
                          type="number" 
                          min={0}
                          value={formSiswa.jumlahSaudara || 0} 
                          onChange={e => setFormSiswa({ ...formSiswa, jumlahSaudara: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Berat Badan (kg)</label>
                        <input 
                          type="number" 
                          min={0}
                          value={formSiswa.beratBadan || 0} 
                          onChange={e => setFormSiswa({ ...formSiswa, beratBadan: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Tinggi Badan (cm)</label>
                        <input 
                          type="number" 
                          min={0}
                          value={formSiswa.tinggiBadan || 0} 
                          onChange={e => setFormSiswa({ ...formSiswa, tinggiBadan: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN III: IDENTITAS ORANG TUA / WALI */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" /> 3. Identitas Orang Tua / Wali
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Nama Ayah Kandung</label>
                        <input 
                          type="text" 
                          placeholder="Nama Lengkap Ayah"
                          value={formSiswa.namaAyah || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, namaAyah: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Nama Ibu Kandung</label>
                        <input 
                          type="text" 
                          placeholder="Nama Lengkap Ibu"
                          value={formSiswa.namaIbu || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, namaIbu: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">NIK Orang Tua (Ayah / Ibu)</label>
                        <input 
                          type="text" 
                          placeholder="NIK 16 digit"
                          value={formSiswa.nikOrtu || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, nikOrtu: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Tempat Tanggal Lahir Ortu</label>
                        <input 
                          type="text" 
                          placeholder="contoh: Bandung, 12 Mei 1980"
                          value={formSiswa.tempatLahirOrtu || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, tempatLahirOrtu: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Pendidikan Terakhir Ortu</label>
                        <select 
                          value={formSiswa.pendidikanOrtu || 'SMA / Sederajat'} 
                          onChange={e => setFormSiswa({ ...formSiswa, pendidikanOrtu: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                        >
                          <option value="SD">SD / Sederajat</option>
                          <option value="SMP">SMP / Sederajat</option>
                          <option value="SMA / Sederajat">SMA / Sederajat</option>
                          <option value="Diploma (D1/D2/D3)">Diploma (D1/D2/D3)</option>
                          <option value="Sarjana (S1)">Sarjana (S1)</option>
                          <option value="Magister (S2)">Magister (S2)</option>
                          <option value="Doktor (S3)">Doktor (S3)</option>
                          <option value="Tidak Sekolah">Tidak Sekolah</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Pekerjaan Orang Tua</label>
                        <input 
                          type="text" 
                          placeholder="contoh: PNS, Wiraswasta, Karyawan"
                          value={formSiswa.pekerjaanOrtu || ''} 
                          onChange={e => setFormSiswa({ ...formSiswa, pekerjaanOrtu: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-800/40 pt-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Nama Wali (Kontak Utama)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Nama lengkap wali / ayah / ibu"
                          value={formSiswa.namaWali} 
                          onChange={e => setFormSiswa({ ...formSiswa, namaWali: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">No. Telepon Wali (WhatsApp)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="contoh: 0812XXXXXXXX"
                          value={formSiswa.teleponWali} 
                          onChange={e => setFormSiswa({ ...formSiswa, teleponWali: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {subTab === 'guru' && (() => {
                const availableMapelOptions = [
                  'Matematika',
                  'Matematika Tingkat Lanjut',
                  'Bahasa Indonesia',
                  'Bahasa Indonesia Fase E/F',
                  'Bahasa Inggris',
                  'Bahasa Inggris Komunikasi',
                  'Fisika',
                  'Fisika & Informatika',
                  'Kimia',
                  'Kimia Praktikum',
                  'Biologi',
                  'Biologi & Lingkungan',
                  'Sains / IPA',
                  'IPS / Ilmu Pengetahuan Sosial',
                  'Informatika',
                  'Pendidikan Agama Islam',
                  'Pendidikan Pancasila / PKn',
                  'PPKn & Pancasila',
                  'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
                  'Seni Budaya',
                  'Bimbingan Konseling (BK)',
                  'Sejarah',
                  'Sosiologi',
                  'Sosiologi & Sejarah',
                  'Ekonomi',
                  'Ekonomi & Bisnis',
                  'Geografi'
                ];

                const availableJabatanOptions = [
                  'Kepala Sekolah',
                  'Guru Pembina / Wakasek Kurikulum',
                  'Wakasek Kesiswaan',
                  'Wakasek Sarana Prasarana',
                  'Wakasek Hubungan Masyarakat',
                  'Guru Mata Pelajaran',
                  'Guru Kelas / Wali Kelas',
                  'Kepala Laboratorium Komputer',
                  'Kepala Laboratorium IPA',
                  'Kepala Perpustakaan',
                  'Pembina OSIS',
                  'Wali Kelas X-IPA-1'
                ];

                const mapelOptionsToRender = Array.from(new Set([
                  ...(formGuru.mataPelajaran ? [formGuru.mataPelajaran] : []),
                  ...availableMapelOptions
                ])).filter(Boolean);

                const jabatanOptionsToRender = Array.from(new Set([
                  ...(formGuru.jabatan ? [formGuru.jabatan] : []),
                  ...availableJabatanOptions
                ])).filter(Boolean);

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">NUPTK</label>
                        <input 
                          type="text" 
                          required 
                          value={formGuru.nip} 
                          onChange={e => setFormGuru({ ...formGuru, nip: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">NIK (Opsional)</label>
                        <input 
                          type="text" 
                          value={formGuru.nik || ''} 
                          onChange={e => setFormGuru({ ...formGuru, nik: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Nama Lengkap & Gelar</label>
                      <input 
                        type="text" 
                        required 
                        value={formGuru.nama} 
                        onChange={e => setFormGuru({ ...formGuru, nama: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Mata Pelajaran</label>
                        <select 
                          required 
                          value={formGuru.mataPelajaran} 
                          onChange={e => setFormGuru({ ...formGuru, mataPelajaran: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-semibold" 
                        >
                          <option value="">-- Pilih Mata Pelajaran --</option>
                          {mapelOptionsToRender.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Jabatan / Tugas</label>
                        <select 
                          required 
                          value={formGuru.jabatan} 
                          onChange={e => setFormGuru({ ...formGuru, jabatan: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-semibold" 
                        >
                          <option value="">-- Pilih Jabatan / Tugas --</option>
                          {jabatanOptionsToRender.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Status Pegawai</label>
                        <select 
                          value={formGuru.status} 
                          onChange={e => setFormGuru({ ...formGuru, status: e.target.value as any })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                        >
                          <option value="PNS">PNS</option>
                          <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                          <option value="GTT">Guru Tidak Tetap (GTT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Jenis Kelamin</label>
                        <select 
                          value={formGuru.jenisKelamin || 'L'} 
                          onChange={e => setFormGuru({ ...formGuru, jenisKelamin: e.target.value as 'L' | 'P' })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                        >
                          <option value="L">Laki-laki (L)</option>
                          <option value="P">Perempuan (P)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Email</label>
                        <input 
                          type="email" 
                          required 
                          value={formGuru.email} 
                          onChange={e => setFormGuru({ ...formGuru, email: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">No. HP / WhatsApp</label>
                        <input 
                          type="text" 
                          required 
                          value={formGuru.telepon} 
                          onChange={e => setFormGuru({ ...formGuru, telepon: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Username Akun</label>
                        <input 
                          type="text" 
                          placeholder="username_guru"
                          value={formGuru.username || ''} 
                          onChange={e => setFormGuru({ ...formGuru, username: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">Password Akun</label>
                        <input 
                          type="text" 
                          placeholder="password"
                          value={formGuru.password || ''} 
                          onChange={e => setFormGuru({ ...formGuru, password: e.target.value })}
                          className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              {subTab === 'staf' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">NIK Staf</label>
                      <input 
                        type="text" 
                        required 
                        value={formStaf.nik} 
                        onChange={e => setFormStaf({ ...formStaf, nik: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Status Pegawai</label>
                      <select 
                        value={formStaf.status} 
                        onChange={e => setFormStaf({ ...formStaf, status: e.target.value as any })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="Tetap">Tetap</option>
                        <option value="Kontrak">Kontrak</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required 
                      value={formStaf.nama} 
                      onChange={e => setFormStaf({ ...formStaf, nama: e.target.value })}
                      className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Bagian / Divisi</label>
                      <select 
                        value={formStaf.bagian} 
                        onChange={e => setFormStaf({ ...formStaf, bagian: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="Bendahara / Keuangan">Bendahara / Keuangan</option>
                        <option value="Tata Usaha">Tata Usaha</option>
                        <option value="Perpustakaan">Perpustakaan</option>
                        <option value="Sarana & Prasarana (TUK)">Sarana & Prasarana (TUK)</option>
                        <option value="Kebersihan & Keamanan">Kebersihan & Keamanan</option>
                        <option value="Teknologi Informasi (IT)">Teknologi Informasi (IT)</option>
                        <option value="Administrasi Akademik">Administrasi Akademik</option>
                        <option value="Humas & Layanan Siswa">Humas & Layanan Siswa</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Jenis Kelamin</label>
                      <select 
                        value={formStaf.jenisKelamin || 'L'} 
                        onChange={e => setFormStaf({ ...formStaf, jenisKelamin: e.target.value as 'L' | 'P' })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Email</label>
                      <input 
                        type="email" 
                        required 
                        value={formStaf.email} 
                        onChange={e => setFormStaf({ ...formStaf, email: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">No. HP / WhatsApp</label>
                      <input 
                        type="text" 
                        required 
                        value={formStaf.telepon} 
                        onChange={e => setFormStaf({ ...formStaf, telepon: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Username Akun</label>
                      <input 
                        type="text" 
                        placeholder="username_staf"
                        value={formStaf.username || ''} 
                        onChange={e => setFormStaf({ ...formStaf, username: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Password Akun</label>
                      <input 
                        type="text" 
                        placeholder="password"
                        value={formStaf.password || ''} 
                        onChange={e => setFormStaf({ ...formStaf, password: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                  </div>
                </>
              )}

              {subTab === 'rombel' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Nama Rombel / Kelas</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: X-IPA-1, 7-A"
                        value={formRombel.namaRombel} 
                        onChange={e => setFormRombel({ ...formRombel, namaRombel: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Tingkat Kelas</label>
                      <select 
                        value={formRombel.tingkatKelas} 
                        onChange={e => setFormRombel({ ...formRombel, tingkatKelas: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="Kelas 10">Kelas 10</option>
                        <option value="Kelas 11">Kelas 11</option>
                        <option value="Kelas 12">Kelas 12</option>
                        <option value="Kelas 7">Kelas 7</option>
                        <option value="Kelas 8">Kelas 8</option>
                        <option value="Kelas 9">Kelas 9</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Jurusan / Peminatan</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: MIPA, IPS, Umum"
                        value={formRombel.jurusanPeminatan} 
                        onChange={e => setFormRombel({ ...formRombel, jurusanPeminatan: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kurikulum</label>
                      <select 
                        value={formRombel.kurikulum} 
                        onChange={e => setFormRombel({ ...formRombel, kurikulum: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                        <option value="Kurikulum 2013">Kurikulum 2013</option>
                        <option value="KTSP 2006">KTSP 2006</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Wali Kelas</label>
                      <select 
                        value={formRombel.waliKelasNama} 
                        onChange={e => setFormRombel({ ...formRombel, waliKelasNama: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="">-- Pilih Wali Kelas --</option>
                        {guruList.map(g => (
                          <option key={g.id} value={g.nama}>{g.nama} ({g.mataPelajaran || 'Guru'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Ruangan Kelas</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: Ruang R.101 (Gedung A)"
                        value={formRombel.ruangan} 
                        onChange={e => setFormRombel({ ...formRombel, ruangan: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Tahun Ajaran</label>
                      <input 
                        type="text" 
                        required 
                        value={formRombel.tahunAjaran} 
                        onChange={e => setFormRombel({ ...formRombel, tahunAjaran: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Semester</label>
                      <select 
                        value={formRombel.semester} 
                        onChange={e => setFormRombel({ ...formRombel, semester: e.target.value as 'Ganjil' | 'Genap' })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kapasitas Maks</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        max={60}
                        value={formRombel.kapasitas} 
                        onChange={e => setFormRombel({ ...formRombel, kapasitas: parseInt(e.target.value) || 36 })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white" 
                      />
                    </div>
                  </div>

                  {/* Student Selection for Rombel */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-4 h-4" /> Anggota Rombel ({selectedSiswaIdsForRombel.length} Siswa)
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Maks. Kapasitas: {formRombel.kapasitas}</span>
                    </div>

                    <div className="bg-[#181818] p-3 rounded-xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Search field for available students */}
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Cari Nama / NISN Siswa</label>
                          <input
                            type="text"
                            placeholder="Ketik untuk memfilter..."
                            value={studentSearchInput}
                            onChange={e => setStudentSearchInput(e.target.value)}
                            className="w-full p-1.5 bg-[#121212] border border-slate-700 text-white rounded text-[11px] focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Dropdown list of available students */}
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Pilih Siswa untuk Ditambahkan</label>
                          <select
                            value=""
                            onChange={e => {
                              const val = e.target.value;
                              if (val) {
                                if (selectedSiswaIdsForRombel.length >= formRombel.kapasitas) {
                                  alert(`Kapasitas maksimal rombel (${formRombel.kapasitas} siswa) sudah tercapai!`);
                                  return;
                                }
                                setSelectedSiswaIdsForRombel(prev => [...prev, val]);
                                setStudentSearchInput(''); // clear search input
                              }
                            }}
                            className="w-full p-1.5 bg-[#121212] border border-slate-700 text-white rounded text-[11px] focus:outline-none focus:border-amber-500"
                          >
                            <option value="">-- Pilih & Tambahkan Siswa --</option>
                            {siswaList
                              .filter(s => {
                                // Exclude students assigned to OTHER rombels
                                const otherRombelNames = activeRombelList
                                  .filter(r => r.id !== editingId)
                                  .map(r => r.namaRombel.toLowerCase());
                                const isSiswaInOtherRombel = s.kelas && s.kelas !== 'Belum Ada Kelas' && otherRombelNames.includes(s.kelas.toLowerCase());
                                return !isSiswaInOtherRombel && !selectedSiswaIdsForRombel.includes(s.id);
                              })
                              .filter(s => 
                                s.nama.toLowerCase().includes(studentSearchInput.toLowerCase()) ||
                                s.nisn.includes(studentSearchInput) ||
                                s.nis.includes(studentSearchInput)
                              )
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.nama} ({s.nisn || s.nis}) {s.kelas && s.kelas !== 'Belum Ada Kelas' ? `[${s.kelas}]` : '[Belum Ada Kelas]'}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>

                      {/* Enrolled students grid */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {selectedSiswaIdsForRombel.map(id => {
                          const student = siswaList.find(s => s.id === id);
                          if (!student) return null;
                          return (
                            <div key={student.id} className="p-2 bg-[#121212] border border-slate-800 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                              <div className="flex items-center gap-2">
                                <img
                                  src={student.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={student.nama}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <span className="font-bold text-slate-200">{student.nama}</span>
                                  <span className="text-slate-500 text-[10px] ml-1.5 font-mono">({student.nisn || student.nis})</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSiswaIdsForRombel(prev => prev.filter(item => item !== id));
                                }}
                                className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                                title="Keluarkan dari Rombel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        {selectedSiswaIdsForRombel.length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-500">
                            Belum ada siswa dalam rombel ini. Pilih siswa dari dropdown di atas.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400">Ketua Kelas (Opsional)</label>
                    <select 
                      value={formRombel.ketuaKelasNama || ''} 
                      onChange={e => setFormRombel({ ...formRombel, ketuaKelasNama: e.target.value })}
                      className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pilih Ketua Kelas --</option>
                      {selectedSiswaIdsForRombel.map(id => {
                        const s = siswaList.find(item => item.id === id);
                        if (!s) return null;
                        return (
                          <option key={s.id} value={s.nama}>{s.nama}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400">Catatan / Deskripsi</label>
                    <textarea 
                      rows={2}
                      placeholder="Catatan khusus rombel..."
                      value={formRombel.catatan || ''} 
                      onChange={e => setFormRombel({ ...formRombel, catatan: e.target.value })}
                      className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white resize-none focus:outline-none" 
                    />
                  </div>
                </>
              )}

              {subTab === 'mapel' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kode Mata Pelajaran</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: MP-MAT-01"
                        value={formMapel.kodeMapel} 
                        onChange={e => setFormMapel({ ...formMapel, kodeMapel: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Nama Mata Pelajaran</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="contoh: Matematika Wajib"
                        value={formMapel.namaMapel} 
                        onChange={e => setFormMapel({ ...formMapel, namaMapel: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kategori Mapel</label>
                      <select 
                        value={formMapel.kategori} 
                        onChange={e => setFormMapel({ ...formMapel, kategori: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="Wajib Umum">Wajib Umum</option>
                        <option value="Peminatan">Peminatan</option>
                        <option value="Muatan Lokal">Muatan Lokal</option>
                        <option value="Pilihan">Pilihan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Tingkat Kelas</label>
                      <select 
                        value={formMapel.tingkatKelas} 
                        onChange={e => setFormMapel({ ...formMapel, tingkatKelas: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="Semua Tingkat">Semua Tingkat</option>
                        <option value="Kelas 1">Kelas 1</option>
                        <option value="Kelas 2">Kelas 2</option>
                        <option value="Kelas 3">Kelas 3</option>
                        <option value="Kelas 4">Kelas 4</option>
                        <option value="Kelas 5">Kelas 5</option>
                        <option value="Kelas 6">Kelas 6</option>
                        <option value="Kelas 7">Kelas 7</option>
                        <option value="Kelas 8">Kelas 8</option>
                        <option value="Kelas 9">Kelas 9</option>
                        <option value="Kelas 10">Kelas 10</option>
                        <option value="Kelas 11">Kelas 11</option>
                        <option value="Kelas 12">Kelas 12</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Guru Pengampu</label>
                      <select 
                        required 
                        value={formMapel.guruPengampuNama} 
                        onChange={e => {
                          const selectedNama = e.target.value;
                          const selectedGuru = guruList.find(g => g.nama === selectedNama);
                          setFormMapel({ 
                            ...formMapel, 
                            guruPengampuNama: selectedNama,
                            nipGuru: selectedGuru ? (selectedGuru.nip || '-') : '-'
                          });
                        }}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- Pilih Guru Pengampu --</option>
                        {guruList.map(g => (
                          <option key={g.id} value={g.nama}>{g.nama} ({g.nip || 'GTY'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Alokasi JP / Minggu</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        max={24}
                        value={formMapel.alokasiJamPerMinggu} 
                        onChange={e => setFormMapel({ ...formMapel, alokasiJamPerMinggu: parseInt(e.target.value) || 2 })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">KKM</label>
                      <input 
                        type="number" 
                        required 
                        min={0}
                        max={100}
                        value={formMapel.kkm} 
                        onChange={e => setFormMapel({ ...formMapel, kkm: parseInt(e.target.value) || 75 })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kurikulum</label>
                      <select 
                        value={formMapel.kurikulum} 
                        onChange={e => setFormMapel({ ...formMapel, kurikulum: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-500"
                      >
                        <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                        <option value="Kurikulum 2013">Kurikulum 2013</option>
                        <option value="KTSP 2006">KTSP 2006</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400">Catatan Tambahan</label>
                    <textarea 
                      rows={2}
                      placeholder="Catatan mapel..."
                      value={formMapel.catatan || ''} 
                      onChange={e => setFormMapel({ ...formMapel, catatan: e.target.value })}
                      className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white resize-none focus:outline-none focus:border-amber-500" 
                    />
                  </div>

                  {/* Jadwal & Rombel Assignments */}
                  <div className="border-t border-slate-800/80 pt-3 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4" /> Kelas Target & Jadwal Mengajar
                    </h4>

                    {/* Current schedules list */}
                    {formMapel.jadwalMengajar.length === 0 ? (
                      <div className="p-2 bg-[#181818] border border-slate-800 text-center text-xs text-slate-500 rounded-lg">
                        Belum ada kelas pengajaran atau jadwal mengajar.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {formMapel.jadwalMengajar.map((jadwal, idx) => (
                          <div 
                            key={jadwal.id || idx}
                            className="p-2 bg-[#181818] border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                {jadwal.hari}
                              </span>
                              <span className="font-mono text-slate-300">
                                {jadwal.jamMulai}-{jadwal.jamSelesai}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold">
                                {jadwal.kelasTarget}
                              </span>
                              {jadwal.ruangan && (
                                <span className="text-slate-400 text-[11px] truncate max-w-[80px]">
                                  ({jadwal.ruangan})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormMapel({
                                  ...formMapel,
                                  jadwalMengajar: formMapel.jadwalMengajar.filter((_, i) => i !== idx)
                                });
                              }}
                              className="text-slate-500 hover:text-rose-400 font-bold transition-colors ml-2"
                              title="Hapus Kelas & Jadwal Ini"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schedule Builder Inputs */}
                    <div className="bg-[#181818] p-3 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        + Tambah Kelas & Sesi Mengajar Baru
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Hari</label>
                          <select
                            value={newScheduleHari}
                            onChange={e => setNewScheduleHari(e.target.value)}
                            className="w-full p-1.5 bg-[#121212] border border-slate-700 text-white rounded text-[11px]"
                          >
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Sabtu">Sabtu</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Kelas / Rombel Pengajaran</label>
                          <select
                            value={newScheduleKelasTarget}
                            onChange={e => setNewScheduleKelasTarget(e.target.value)}
                            className="w-full p-1.5 bg-[#121212] border border-slate-700 text-white rounded text-[11px]"
                          >
                            <option value="">-- Pilih Rombel --</option>
                            {activeRombelList.map(r => (
                              <option key={r.id} value={r.namaRombel}>{r.namaRombel}</option>
                            ))}
                            <option value="Semua Kelas">Semua Kelas</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Jam Mulai</label>
                          <input
                            type="text"
                            placeholder="07:30"
                            value={newScheduleJamMulai}
                            onChange={e => setNewScheduleJamMulai(e.target.value)}
                            className="w-full p-1 bg-[#121212] border border-slate-700 text-white rounded text-[11px] font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Jam Selesai</label>
                          <input
                            type="text"
                            placeholder="09:00"
                            value={newScheduleJamSelesai}
                            onChange={e => setNewScheduleJamSelesai(e.target.value)}
                            className="w-full p-1 bg-[#121212] border border-slate-700 text-white rounded text-[11px] font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5">Ruangan / Lab</label>
                          <input
                            type="text"
                            placeholder="R.101"
                            value={newScheduleRuangan}
                            onChange={e => setNewScheduleRuangan(e.target.value)}
                            className="w-full p-1 bg-[#121212] border border-slate-700 text-white rounded text-[11px]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newScheduleKelasTarget) {
                            alert('Silakan pilih Kelas / Rombel pengajaran terlebih dahulu!');
                            return;
                          }
                          const newAssignment = {
                            id: `js-${Date.now()}`,
                            hari: newScheduleHari,
                            jamMulai: newScheduleJamMulai || '07:30',
                            jamSelesai: newScheduleJamSelesai || '09:00',
                            kelasTarget: newScheduleKelasTarget,
                            ruangan: newScheduleRuangan ? `Ruang ${newScheduleRuangan}` : 'Ruang Kelas'
                          };
                          setFormMapel({
                            ...formMapel,
                            jadwalMengajar: [...formMapel.jadwalMengajar, newAssignment]
                          });
                          // Reset inputs
                          setNewScheduleRuangan('');
                        }}
                        className="w-full mt-2 py-1.5 bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-all"
                      >
                        + Tambahkan Kelas & Sesi Ini
                      </button>
                    </div>
                  </div>
                </>
              )}

              {subTab === 'ekskul' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kode Ekskul *</label>
                      <input 
                        required 
                        placeholder="Contoh: EKS-PMR"
                        value={formEkskul.kodeEkskul} 
                        onChange={e => setFormEkskul({ ...formEkskul, kodeEkskul: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white uppercase font-mono focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Nama Ekstrakurikuler *</label>
                      <input 
                        required 
                        placeholder="Contoh: Palang Merah Remaja"
                        value={formEkskul.namaEkskul} 
                        onChange={e => setFormEkskul({ ...formEkskul, namaEkskul: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kategori Bidang *</label>
                      <select 
                        value={formEkskul.kategori} 
                        onChange={e => setFormEkskul({ ...formEkskul, kategori: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Olahraga">Olahraga</option>
                        <option value="Seni & Budaya">Seni & Budaya</option>
                        <option value="Keagamaan">Keagamaan</option>
                        <option value="Sains & Teknologi">Sains & Teknologi</option>
                        <option value="Kepanduan & Bela Negara">Kepanduan & Bela Negara</option>
                        <option value="Bahasa & Komunikasi">Bahasa & Komunikasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Status Klub *</label>
                      <select 
                        value={formEkskul.status} 
                        onChange={e => setFormEkskul({ ...formEkskul, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-[#181818] rounded-xl border border-slate-800 space-y-3">
                    <label className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
                      Informasi Pembina / Pelatih
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Pilih Guru Pembina atau Tulis Nama</label>
                        <select
                          value={formEkskul.pembinaNama}
                          onChange={e => {
                            const selectedGuru = guruList.find(g => g.nama === e.target.value);
                            setFormEkskul({
                              ...formEkskul,
                              pembinaNama: e.target.value,
                              nipPembina: selectedGuru ? selectedGuru.nuptk : formEkskul.nipPembina,
                              kontakPembina: selectedGuru ? selectedGuru.telepon : formEkskul.kontakPembina
                            });
                          }}
                          className="w-full p-2 bg-[#121212] border border-slate-700 text-white rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Pilih dari Daftar Guru --</option>
                          {guruList.map(g => (
                            <option key={g.id} value={g.nama}>{g.nama} ({g.mataPelajaran})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nama Pembina / Pelatih Luar *</label>
                        <input
                          required
                          placeholder="Nama lengkap pembina"
                          value={formEkskul.pembinaNama}
                          onChange={e => setFormEkskul({ ...formEkskul, pembinaNama: e.target.value })}
                          className="w-full p-2 bg-[#121212] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">NIP / NUPTK Pembina</label>
                        <input
                          placeholder="NIP jika guru tetap"
                          value={formEkskul.nipPembina || ''}
                          onChange={e => setFormEkskul({ ...formEkskul, nipPembina: e.target.value })}
                          className="w-full p-2 bg-[#121212] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Kontak Telepon / WA</label>
                        <input
                          placeholder="081234567890"
                          value={formEkskul.kontakPembina || ''}
                          onChange={e => setFormEkskul({ ...formEkskul, kontakPembina: e.target.value })}
                          className="w-full p-2 bg-[#121212] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Hari Latihan *</label>
                      <select 
                        value={formEkskul.hariLatihan} 
                        onChange={e => setFormEkskul({ ...formEkskul, hariLatihan: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Jam Mulai *</label>
                      <input 
                        type="text"
                        placeholder="15:30"
                        value={formEkskul.jamMulai} 
                        onChange={e => setFormEkskul({ ...formEkskul, jamMulai: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500" 
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Jam Selesai *</label>
                      <input 
                        type="text"
                        placeholder="17:00"
                        value={formEkskul.jamSelesai} 
                        onChange={e => setFormEkskul({ ...formEkskul, jamSelesai: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Tempat / Lokasi Latihan *</label>
                      <input 
                        required 
                        placeholder="Contoh: Lapangan Utama, Ruang Musik"
                        value={formEkskul.tempat} 
                        onChange={e => setFormEkskul({ ...formEkskul, tempat: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Tingkat Kelas Target</label>
                      <select 
                        value={formEkskul.tingkatTarget} 
                        onChange={e => setFormEkskul({ ...formEkskul, tingkatTarget: e.target.value })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 text-white rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Semua Tingkat (Kelas 7, 8, 9)">Semua Tingkat (Kelas 7, 8, 9)</option>
                        <option value="Semua Tingkat (Kelas 10, 11, 12)">Semua Tingkat (Kelas 10, 11, 12)</option>
                        <option value="Kelas 7 & 8">Kelas 7 & 8</option>
                        <option value="Kelas 10 & 11">Kelas 10 & 11</option>
                        <option value="Khusus Kelas 7">Khusus Kelas 7</option>
                        <option value="Khusus Kelas 10">Khusus Kelas 10</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Kuota Maksimal Siswa</label>
                      <input 
                        type="number"
                        min="1"
                        max="200"
                        value={formEkskul.kuotaMaksimal} 
                        onChange={e => setFormEkskul({ ...formEkskul, kuotaMaksimal: Number(e.target.value) || 30 })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400">Iuran / Biaya (Rp per Bulan)</label>
                      <input 
                        type="number"
                        min="0"
                        step="5000"
                        placeholder="0 jika gratis"
                        value={formEkskul.biayaIuran} 
                        onChange={e => setFormEkskul({ ...formEkskul, biayaIuran: Number(e.target.value) || 0 })}
                        className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400">Deskripsi & Program Kerja</label>
                    <textarea 
                      rows={2}
                      placeholder="Uraian singkat program kegiatan, target lomba/prestasi..."
                      value={formEkskul.deskripsi || ''} 
                      onChange={e => setFormEkskul({ ...formEkskul, deskripsi: e.target.value })}
                      className="w-full p-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white resize-none focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                </>
              )}

              </div>

              <div className="p-5 pt-3 flex justify-end gap-2 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                    subTab === 'rombel' 
                      ? 'bg-indigo-600 hover:bg-indigo-500' 
                      : subTab === 'mapel'
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : subTab === 'ekskul'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROMBEL MEMBER DETAIL MODAL */}
      {activeRombelDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-3xl w-full p-6 border border-slate-800 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg flex items-center gap-2">
                    Detail Anggota Rombel: {activeRombelDetail.namaRombel}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wali Kelas: <span className="text-indigo-300 font-semibold">{activeRombelDetail.waliKelasNama}</span> | Ruangan: {activeRombelDetail.ruangan}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveRombelDetail(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assign Student Form */}
            <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 space-y-2 shrink-0">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-400" /> Tambahkan Siswa ke Rombel Ini
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={studentToAssign}
                  onChange={e => setStudentToAssign(e.target.value)}
                  className="flex-1 p-2 bg-[#121212] border border-slate-700 text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Siswa yang belum masuk / ganti kelas --</option>
                  {siswaList
                    .filter(s => s.kelas.toLowerCase() !== activeRombelDetail.namaRombel.toLowerCase())
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} (NISN: {s.nisn}) - Kelas Saat Ini: {s.kelas}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => {
                    if (studentToAssign) {
                      setSiswaList(prev => prev.map(s => s.id === studentToAssign ? { ...s, kelas: activeRombelDetail.namaRombel } : s));
                      setStudentToAssign('');
                    }
                  }}
                  disabled={!studentToAssign}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 justify-center shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambahkan ke Rombel
                </button>
              </div>
            </div>

            {/* Enrolled Students Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daftar Siswa Terdaftar ({siswaList.filter(s => s.kelas.toLowerCase() === activeRombelDetail.namaRombel.toLowerCase()).length} Siswa)
              </h4>

              {siswaList.filter(s => s.kelas.toLowerCase() === activeRombelDetail.namaRombel.toLowerCase()).length === 0 ? (
                <div className="text-center py-8 bg-[#181818] rounded-xl border border-slate-800">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Belum ada siswa yang dimasukkan ke kelas ini.</p>
                </div>
              ) : (
                <div className="bg-[#181818] rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#121212] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Siswa</th>
                        <th className="px-4 py-2.5">NISN / NIS</th>
                        <th className="px-4 py-2.5">L/P</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {siswaList
                        .filter(s => s.kelas.toLowerCase() === activeRombelDetail.namaRombel.toLowerCase())
                        .map(s => (
                          <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-white flex items-center gap-2.5">
                              <img
                                src={s.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={s.nama}
                                className="w-7 h-7 rounded-full object-cover border border-slate-700"
                              />
                              {s.nama}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">{s.nisn} / {s.nis}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-300">{s.jenisKelamin}</td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                {s.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => {
                                  setSiswaList(prev => prev.map(item => item.id === s.id ? { ...item, kelas: 'Belum Ada Kelas' } : item));
                                }}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all"
                              >
                                Keluarkan
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveRombelDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EKSKUL MEMBERSHIP MANAGEMENT MODAL */}
      {activeEkskulMembersModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-4xl w-full p-6 border border-slate-800 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-white text-lg">
                      Keanggotaan: {activeEkskulMembersModal.namaEkskul}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold border border-slate-700">
                      {activeEkskulMembersModal.kodeEkskul}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {activeEkskulMembersModal.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Pembina: <strong className="text-slate-200">{activeEkskulMembersModal.pembinaNama}</strong></span>
                    <span>•</span>
                    <span>Jadwal: <strong className="text-emerald-300">{activeEkskulMembersModal.hariLatihan} ({activeEkskulMembersModal.jamMulai} - {activeEkskulMembersModal.jamSelesai})</strong></span>
                    <span>•</span>
                    <span>Lokasi: <strong className="text-slate-200">{activeEkskulMembersModal.tempat}</strong></span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setActiveEkskulMembersModal(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quota & Capacity Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#181818] rounded-xl border border-slate-800 shrink-0 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121212] border border-slate-800/80">
                <span className="text-slate-400 font-medium">Terdaftar Saat Ini:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {activeEkskulMembersModal.anggotaSiswaIds.length} Siswa
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121212] border border-slate-800/80">
                <span className="text-slate-400 font-medium">Kapasitas Kuota:</span>
                <span className="font-black text-white text-sm">
                  {activeEkskulMembersModal.kuotaMaksimal} Siswa
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121212] border border-slate-800/80">
                <span className="text-slate-400 font-medium">Sisa Slot Kursi:</span>
                <span className={`font-black text-sm ${
                  activeEkskulMembersModal.kuotaMaksimal - activeEkskulMembersModal.anggotaSiswaIds.length <= 0
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {Math.max(0, activeEkskulMembersModal.kuotaMaksimal - activeEkskulMembersModal.anggotaSiswaIds.length)} Slot
                </span>
              </div>
            </div>

            {/* Search and Filters for Member modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau NISN..."
                  value={ekskulMemberSearch}
                  onChange={e => setEkskulMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={ekskulMemberKelasFilter}
                  onChange={e => setEkskulMemberKelasFilter(e.target.value)}
                  className="bg-[#181818] border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
                >
                  <option value="Semua">Semua Kelas Siswa</option>
                  {Array.from(new Set(siswaList.map(s => s.kelas))).filter(Boolean).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Member Lists Section */}
            <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pr-1">
              
              {/* SECTION 1: ANGGOTA TERDAFTAR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Daftar Anggota Aktif ({activeEkskulMembersModal.anggotaSiswaIds.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Siswa resmi terdaftar dalam kegiatan
                  </span>
                </div>

                {activeEkskulMembersModal.anggotaSiswaIds.length === 0 ? (
                  <div className="p-6 bg-[#181818] border border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                    Belum ada siswa yang terdaftar di ekstrakurikuler ini. Silakan tambahkan dari daftar di bawah.
                  </div>
                ) : (
                  <div className="bg-[#181818] rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#121212] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5">Nama Siswa</th>
                          <th className="px-4 py-2.5">NISN / NIS</th>
                          <th className="px-4 py-2.5">Kelas</th>
                          <th className="px-4 py-2.5">L/P</th>
                          <th className="px-4 py-2.5">No. Telepon Wali</th>
                          <th className="px-4 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {siswaList
                          .filter(s => activeEkskulMembersModal.anggotaSiswaIds.includes(s.id))
                          .filter(s => {
                            const matchSearch = s.nama.toLowerCase().includes(ekskulMemberSearch.toLowerCase()) ||
                                                s.nisn.includes(ekskulMemberSearch) ||
                                                s.nis.includes(ekskulMemberSearch);
                            const matchKelas = ekskulMemberKelasFilter === 'Semua' || s.kelas === ekskulMemberKelasFilter;
                            return matchSearch && matchKelas;
                          })
                          .map(s => (
                            <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-2.5 font-bold text-white flex items-center gap-2.5">
                                <img
                                  src={s.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={s.nama}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                                {s.nama}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">{s.nisn} / {s.nis}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-200 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] whitespace-nowrap">
                                  {s.kelas}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-400">{s.jenisKelamin}</td>
                              <td className="px-4 py-2.5 font-mono text-slate-400">{s.teleponWali || '-'}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedIds = activeEkskulMembersModal.anggotaSiswaIds.filter(id => id !== s.id);
                                    const updatedEkskul = { ...activeEkskulMembersModal, anggotaSiswaIds: updatedIds };
                                    setActiveEkskulList(prev => prev.map(e => e.id === updatedEkskul.id ? updatedEkskul : e));
                                    setActiveEkskulMembersModal(updatedEkskul);
                                  }}
                                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ml-auto"
                                >
                                  <X className="w-3 h-3" /> Keluarkan
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION 2: TAMBAH / DAFTARKAN SISWA LAIN */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Daftarkan Siswa Baru ke Ekskul Ini
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Pilih siswa untuk diikutsertakan
                  </span>
                </div>

                {activeEkskulMembersModal.anggotaSiswaIds.length >= activeEkskulMembersModal.kuotaMaksimal ? (
                  <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Kuota siswa untuk ekstrakurikuler ini telah <strong>PENUH</strong> ({activeEkskulMembersModal.kuotaMaksimal} siswa). Anda dapat menambah batas kuota di menu Edit Ekskul.</span>
                  </div>
                ) : (
                  <div className="bg-[#181818] rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#121212] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5">Nama Siswa</th>
                          <th className="px-4 py-2.5">NISN / NIS</th>
                          <th className="px-4 py-2.5">Kelas</th>
                          <th className="px-4 py-2.5">L/P</th>
                          <th className="px-4 py-2.5 text-right">Aksi Pendaftaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {siswaList
                          .filter(s => !activeEkskulMembersModal.anggotaSiswaIds.includes(s.id))
                          .filter(s => {
                            const matchSearch = s.nama.toLowerCase().includes(ekskulMemberSearch.toLowerCase()) ||
                                                s.nisn.includes(ekskulMemberSearch) ||
                                                s.nis.includes(ekskulMemberSearch);
                            const matchKelas = ekskulMemberKelasFilter === 'Semua' || s.kelas === ekskulMemberKelasFilter;
                            return matchSearch && matchKelas;
                          })
                          .slice(0, 15) // Limit view to 15 for fast performance
                          .map(s => (
                            <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-2.5 font-bold text-white flex items-center gap-2.5">
                                <img
                                  src={s.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={s.nama}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                                {s.nama}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-slate-400 whitespace-nowrap">{s.nisn} / {s.nis}</td>
                              <td className="px-4 py-2.5 font-semibold text-slate-200 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] whitespace-nowrap">
                                  {s.kelas}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-400">{s.jenisKelamin}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeEkskulMembersModal.anggotaSiswaIds.length >= activeEkskulMembersModal.kuotaMaksimal) {
                                      alert('Kuota ekstrakurikuler sudah penuh!');
                                      return;
                                    }
                                    const updatedIds = [...activeEkskulMembersModal.anggotaSiswaIds, s.id];
                                    const updatedEkskul = { ...activeEkskulMembersModal, anggotaSiswaIds: updatedIds };
                                    setActiveEkskulList(prev => prev.map(e => e.id === updatedEkskul.id ? updatedEkskul : e));
                                    setActiveEkskulMembersModal(updatedEkskul);
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ml-auto shadow-sm"
                                >
                                  <Plus className="w-3 h-3" /> Daftarkan
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveEkskulMembersModal(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Selesai & Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DIGITAL CARD MODAL */}
      {cardModalData && (
        <KartuDigitalModal
          type={cardModalData.type}
          data={cardModalData.data}
          onClose={() => setCardModalData(null)}
        />
      )}

      {/* PUSAT TEMPLATE DATA MASTER MODAL */}
      {showTemplateHubModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-purple-400" /> Pusat Template Data Master Sekolah 2026
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Unduh format template resmi CSV/Excel untuk pengisian massal data Siswa, Guru, dan Staf Kependidikan.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateHubModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 3 Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card Template Siswa */}
              <div className="bg-[#181818] p-5 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Template Data Siswa</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Format resmi untuk pendataan biodata peserta didik baru, NISN, NIK, Wali, dan data kelas.
                  </p>
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[9px] text-slate-400 space-y-0.5">
                    <div>Col: NISN; NIS; NIK; Nama; Rombel; JenisKelamin</div>
                    <div>TempatLahir; TanggalLahir; Agama; Alamat</div>
                    <div>NamaOrang tua/Wali; TeleponWali; AsalSekolah</div>
                    <div>Anak Ke-; JumlahSaudara; BeratBadan; TinggiBadan</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleDownloadTemplate('siswa')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template CSV
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateHubModal(false);
                      handleTriggerImport('siswa');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" /> Import Data Siswa
                  </button>
                </div>
              </div>

              {/* Card Template Guru */}
              <div className="bg-[#181818] p-5 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Template Data Guru</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Format resmi pendataan Tenaga Pendidik, NIP/NUPTK, Gelar, Mata Pelajaran, dan Sertifikasi.
                  </p>
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[9px] text-slate-400 space-y-0.5">
                    <div>Col: NIP, NIK, Nama, GelarDepan</div>
                    <div>GelarBelakang, MataPelajaran, Jabatan</div>
                    <div>Email, Telepon, Pendidikan, Status</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleDownloadTemplate('guru')}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template CSV
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateHubModal(false);
                      handleTriggerImport('guru');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" /> Import Data Guru
                  </button>
                </div>
              </div>

              {/* Card Template Staf */}
              <div className="bg-[#181818] p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Template Data Staf</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Format resmi pendataan Tenaga Kependidikan, Tata Usaha, Keuangan, Perpustakaan & Laboran.
                  </p>
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-800 font-mono text-[9px] text-slate-400 space-y-0.5">
                    <div>Col: NIK, Nama, Bagian/Divisi</div>
                    <div>Email, Telepon, JenisKelamin</div>
                    <div>PendidikanTerakhir, StatusKaryawan</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleDownloadTemplate('staf')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template CSV
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateHubModal(false);
                      handleTriggerImport('staf');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import Data Staf
                  </button>
                </div>
              </div>

            </div>

            {/* Instruction Footer */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Petunjuk Penggunaan Template & Import Data:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Unduh template file `.csv` sesuai kategori yang Anda butuhkan (Siswa, Guru, atau Staf).</li>
                <li>Buka file menggunakan Microsoft Excel, Google Sheets, atau aplikasi Spreadsheet.</li>
                <li>Isi data sesuai urutan kolom header (Jangan mengubah atau menghapus nama kolom header).</li>
                <li>Simpan kembali file dalam format `.csv` atau `.json`.</li>
                <li>Klik tombol <span className="text-emerald-400 font-bold">Import Data</span> untuk mengunggah dan memasukkan data secara massal ke database sekolah.</li>
              </ol>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTemplateHubModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PHOTO UPLOAD MODAL */}
      {quickPhotoData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Upload Pas Foto {quickPhotoData.type.toUpperCase()}</h3>
                  <p className="text-xs text-slate-400 font-medium">{quickPhotoData.data.nama}</p>
                </div>
              </div>
              <button onClick={() => setQuickPhotoData(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              {/* Preview Avatar */}
              <div className="relative group">
                <img
                  src={quickPhotoData.data.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={quickPhotoData.data.nama}
                  className="w-28 h-32 object-cover rounded-2xl border-2 border-emerald-500 shadow-xl bg-slate-900"
                />
              </div>

              <input
                type="file"
                ref={quickPhotoFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    alert('Ukuran file foto maksimal 5MB.');
                    return;
                  }
                  compressImageToBase64(file, (dataUrl) => {
                    applyPhotoToPerson(quickPhotoData.data.id, quickPhotoData.type, dataUrl);
                  });
                }}
                accept="image/*"
                className="hidden"
              />

              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() => quickPhotoFileInputRef.current?.click()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <UploadCloud className="w-4 h-4" /> Upload File Foto dari Komputer / HP
                </button>

                <div className="bg-[#181818] p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-2">Atau Pilih Pas Foto Sampel:</span>
                  <div className="flex items-center justify-center gap-2">
                    {PRESET_PHOTOS[quickPhotoData.data.jenisKelamin === 'P' ? 'P' : 'L'].map((pUrl, idx) => (
                      <img
                        key={idx}
                        src={pUrl}
                        alt={`Sampel ${idx + 1}`}
                        onClick={() => applyPhotoToPerson(quickPhotoData.data.id, quickPhotoData.type, pUrl)}
                        className="w-10 h-10 rounded-xl object-cover cursor-pointer border border-slate-700 hover:border-emerald-400 hover:scale-110 transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              {quickPhotoData.data.fotoUrl ? (
                <button
                  onClick={() => applyPhotoToPerson(quickPhotoData.data.id, quickPhotoData.type, '')}
                  className="text-rose-400 hover:underline text-xs font-semibold"
                >
                  Hapus Foto
                </button>
              ) : <div />}
              <button
                onClick={() => setQuickPhotoData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      {selectedSiswaDetail && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl text-white my-8 overflow-hidden flex flex-col md:flex-row gap-6">
            
            {/* Left Profile Card Column */}
            <div className="md:w-1/3 flex flex-col items-center text-center p-5 bg-[#181818] rounded-2xl border border-slate-800/80 space-y-4 relative overflow-hidden shrink-0">
              {/* Decorative accent top strip */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              {/* Photo */}
              <div className="relative group mt-2">
                <img 
                  src={selectedSiswaDetail.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                  alt={selectedSiswaDetail.nama} 
                  className="w-32 h-36 object-cover rounded-2xl border-4 border-slate-800 group-hover:border-blue-500/50 shadow-xl transition-all"
                />
                <button
                  onClick={() => {
                    setQuickPhotoData({ type: 'siswa', data: selectedSiswaDetail });
                    setSelectedSiswaDetail(null);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20"
                  title="Ganti Foto Siswa"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">{selectedSiswaDetail.nama}</h4>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                    Siswa Aktif
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                    {selectedSiswaDetail.kelas}
                  </span>
                </div>
              </div>

              {/* MOCK BARCODE DESIGN */}
              <div className="w-full bg-[#121212] p-3 rounded-xl border border-slate-800/80 flex flex-col items-center space-y-1.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-blue-400" /> Kartu Identitas Digital
                </div>
                {/* Visual Barcode lookalike with code text */}
                <div className="h-9 w-44 bg-white rounded p-1 flex items-stretch justify-between shadow-inner">
                  {[2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,1,2,1].map((bar, i) => (
                    <div 
                      key={i} 
                      className="bg-black shrink-0" 
                      style={{ width: `${bar * 1.5}px` }} 
                    />
                  ))}
                </div>
                <div className="font-mono text-[10px] text-slate-400 font-bold tracking-widest">{selectedSiswaDetail.nisn || '0081234567'}</div>
              </div>

              {/* Quick ID Card Trigger Button */}
              <button
                onClick={() => {
                  setCardModalData({ type: 'siswa', data: selectedSiswaDetail });
                  setSelectedSiswaDetail(null);
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 border border-blue-400/20"
              >
                <CreditCard className="w-3.5 h-3.5" /> Cetak Kartu Digital
              </button>
            </div>

            {/* Right Side Detail Information Area */}
            <div className="flex-1 flex flex-col space-y-4 font-sans">
              
              {/* Dynamic Sub-tabs for detail view */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setDetailTab('biodata')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    detailTab === 'biodata' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Biodata Lengkap
                </button>
                <button
                  onClick={() => setDetailTab('akademik')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    detailTab === 'akademik' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Akademik & Kelas
                </button>
                <button
                  onClick={() => setDetailTab('wali')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    detailTab === 'wali' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Orang Tua / Kontak
                </button>
              </div>

              {/* Tab 1: Biodata */}
              {detailTab === 'biodata' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nomor Induk Siswa Nasional (NISN)</p>
                    <p className="text-sm font-bold text-white font-mono tracking-wider">{selectedSiswaDetail.nisn}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nomor Induk Siswa (NIS)</p>
                    <p className="text-sm font-bold text-white font-mono tracking-wider">{selectedSiswaDetail.nis}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nomor Induk Kependudukan (NIK)</p>
                    <p className="text-sm font-bold text-white font-mono tracking-wider">{selectedSiswaDetail.nik || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {selectedSiswaDetail.jenisKelamin === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Tempat, Tanggal Lahir</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {selectedSiswaDetail.tempatLahir}, {selectedSiswaDetail.tanggalLahir}
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Agama & Golongan Darah</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{selectedSiswaDetail.agama || 'Islam'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">Golongan Darah: {selectedSiswaDetail.golonganDarah || 'O'}</span>
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Asal Sekolah & Email</p>
                    <p className="text-sm font-bold text-white">
                      {selectedSiswaDetail.asalSekolah || '-'} <span className="text-slate-500">({selectedSiswaDetail.email || 'Email tidak diset'})</span>
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Urutan Keluarga & Fisik</p>
                    <p className="text-sm font-bold text-amber-400">
                      Anak ke-{selectedSiswaDetail.anakKe || 1} <span className="text-slate-500">dari</span> {(selectedSiswaDetail.anakKe || 1) + (selectedSiswaDetail.jumlahSaudara || 0)} <span className="text-slate-500">Bersaudara</span>
                      <span className="text-slate-600 px-1.5">•</span>
                      <span className="text-slate-200">{selectedSiswaDetail.beratBadan || '-'} kg</span> / <span className="text-slate-200">{selectedSiswaDetail.tinggiBadan || '-'} cm</span>
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1 sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Alamat Lengkap Rumah</p>
                    <p className="text-sm font-bold text-white flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{selectedSiswaDetail.alamatLengkap || selectedSiswaDetail.alamat || 'Alamat tidak diisi lengkap'}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Akademik */}
              {detailTab === 'akademik' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Rombongan Belajar (Rombel)</p>
                    <p className="text-sm font-bold text-white font-mono">{selectedSiswaDetail.kelas}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Wali Kelas Pengampu</p>
                    <p className="text-sm font-bold text-indigo-300">
                      {activeRombelList.find(r => r.namaRombel === selectedSiswaDetail.kelas)?.waliKelasNama || 'Drs. Hendra Kusuma, M.Pd.'}
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Kurikulum Pendidikan</p>
                    <p className="text-sm font-bold text-white">
                      {activeRombelList.find(r => r.namaRombel === selectedSiswaDetail.kelas)?.kurikulum || 'Kurikulum Merdeka'}
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Tahun Ajaran & Semester</p>
                    <p className="text-sm font-bold text-white">
                      {activeRombelList.find(r => r.namaRombel === selectedSiswaDetail.kelas)?.tahunAjaran || '2026/2027'} - {activeRombelList.find(r => r.namaRombel === selectedSiswaDetail.kelas)?.semester || 'Ganjil'}
                    </p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-2 sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Catatan Perkembangan Siswa</p>
                    <div className="p-3 bg-[#121212] rounded-lg border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                      Siswa berkelakuan baik, rajin, aktif dalam kegiatan organisasi sekolah, serta memiliki kehadiran di atas 95%. Perlu pembinaan berkala untuk mempertahankan prestasi belajarnya.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Wali & Kontak */}
              {detailTab === 'wali' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nama Ayah Kandung</p>
                    <p className="text-sm font-bold text-white">{selectedSiswaDetail.namaAyah || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nama Ibu Kandung</p>
                    <p className="text-sm font-bold text-white">{selectedSiswaDetail.namaIbu || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">NIK Orang Tua (Ayah / Ibu)</p>
                    <p className="text-sm font-bold text-white font-mono tracking-wider">{selectedSiswaDetail.nikOrtu || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Tempat, Tanggal Lahir Ortu</p>
                    <p className="text-sm font-bold text-white">{selectedSiswaDetail.tempatLahirOrtu || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Pendidikan Terakhir Ortu</p>
                    <p className="text-sm font-bold text-indigo-300">{selectedSiswaDetail.pendidikanOrtu || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Pekerjaan Orang Tua</p>
                    <p className="text-sm font-bold text-white">{selectedSiswaDetail.pekerjaanOrtu || '-'}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Nama Wali (Kontak Utama)</p>
                    <p className="text-sm font-bold text-amber-400">{selectedSiswaDetail.namaWali}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">No. Telepon / HP Aktif</p>
                    <p className="text-sm font-bold text-white font-mono">{selectedSiswaDetail.teleponWali}</p>
                  </div>

                  <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/60 space-y-1 flex items-center justify-between sm:col-span-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Metode Notifikasi WA</p>
                      <p className="text-xs font-bold text-green-400 mt-1">Fonnte Gateway Ready</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 block animate-pulse" />
                  </div>

                  {/* High Quality Action Button for WhatsApp Chat */}
                  <div className="sm:col-span-2 pt-2">
                    <button
                      onClick={() => {
                        let formattedPhone = selectedSiswaDetail.teleponWali.trim().replace(/\D/g, '');
                        if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
                        else if (formattedPhone.startsWith('8')) formattedPhone = '62' + formattedPhone;
                        const text = encodeURIComponent(`Halo Bapak/Ibu ${selectedSiswaDetail.namaWali}, perkenalkan kami dari pihak sekolah ingin menyampaikan laporan bulanan perkembangan akademik anak Anda yang bernama *${selectedSiswaDetail.nama}*...`);
                        window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/15 border border-emerald-500/20 animate-pulse"
                    >
                      <Phone className="w-4 h-4" /> Hubungi Orang Tua via WhatsApp (Buka Chat Baru)
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom control actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditingId(selectedSiswaDetail.id);
                    setFormSiswa({
                      ...selectedSiswaDetail,
                      tanggalLahir: normalizeDateForInput(selectedSiswaDetail.tanggalLahir),
                      email: selectedSiswaDetail.email || '',
                      asalSekolah: selectedSiswaDetail.asalSekolah || '',
                      anakKe: selectedSiswaDetail.anakKe !== undefined ? selectedSiswaDetail.anakKe : 1,
                      jumlahSaudara: selectedSiswaDetail.jumlahSaudara !== undefined ? selectedSiswaDetail.jumlahSaudara : 0,
                      beratBadan: selectedSiswaDetail.beratBadan !== undefined ? selectedSiswaDetail.beratBadan : 0,
                      tinggiBadan: selectedSiswaDetail.tinggiBadan !== undefined ? selectedSiswaDetail.tinggiBadan : 0,
                      namaAyah: selectedSiswaDetail.namaAyah || '',
                      namaIbu: selectedSiswaDetail.namaIbu || '',
                      tempatLahirOrtu: selectedSiswaDetail.tempatLahirOrtu || '',
                      tanggalLahirOrtu: normalizeDateForInput(selectedSiswaDetail.tanggalLahirOrtu || ''),
                      pendidikanOrtu: selectedSiswaDetail.pendidikanOrtu || '',
                      pekerjaanOrtu: selectedSiswaDetail.pekerjaanOrtu || '',
                      nikOrtu: selectedSiswaDetail.nikOrtu || ''
                    });
                    setModalMode('edit');
                    setSelectedSiswaDetail(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl text-xs flex items-center gap-1 border border-slate-700"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Biodata
                </button>
                <button
                  onClick={() => setSelectedSiswaDetail(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Tutup Profil
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Konfirmasi Hapus Data</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus {deleteConfirmItem.targetType === 'rombel' ? 'Rombel / Kelas' : deleteConfirmItem.targetType === 'mapel' ? 'Mata Pelajaran' : deleteConfirmItem.targetType.toUpperCase()} <span className="font-bold text-rose-400 text-sm">{deleteConfirmItem.nama}</span> dari database?
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
