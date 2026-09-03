import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Laptop, 
  Plus, 
  FileJson, 
  Upload, 
  Sparkles, 
  Play, 
  Clock, 
  Image,
  Film,
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Trash2,
  Download,
  Calendar,
  CreditCard,
  ShieldAlert,
  FileSpreadsheet,
  Printer,
  Maximize2,
  X,
  Building2,
  QrCode,
  ShieldCheck,
  Cloud,
  FileText,
  User,
  Edit2,
  MapPin,
  UserCheck,
  Layers,
  Sparkle,
  CheckSquare,
  Square,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  BankSoal, 
  SoalCBT, 
  UjianCBT, 
  HasilUjian, 
  TipeSoal, 
  JawabanSiswa,
  JadwalUjianItem,
  Siswa,
  Guru,
  RombelKelas,
  MataPelajaranItem,
  Role,
  CbtSubTab,
  SchoolSettings
} from '../types/school';
import { dbFetchCollection, dbSaveCollection } from '../lib/firebaseSync';

interface CbtViewProps {
  bankSoalList: BankSoal[];
  setBankSoalList: React.Dispatch<React.SetStateAction<BankSoal[]>>;
  ujianList: UjianCBT[];
  setUjianList: React.Dispatch<React.SetStateAction<UjianCBT[]>>;
  hasilUjianList?: HasilUjian[];
  setHasilUjianList?: React.Dispatch<React.SetStateAction<HasilUjian[]>>;
  siswaList: Siswa[];
  guruList?: Guru[];
  rombelList?: RombelKelas[];
  mapelList?: MataPelajaranItem[];
  currentRole?: Role;
  userEmail?: string;
  subTab?: CbtSubTab;
  setSubTab?: (subTab: CbtSubTab) => void;
  schoolSettings?: SchoolSettings;
}

export const CbtView: React.FC<CbtViewProps> = ({
  bankSoalList,
  setBankSoalList,
  ujianList,
  setUjianList,
  hasilUjianList = [],
  setHasilUjianList,
  siswaList,
  guruList = [],
  rombelList = [],
  mapelList = [],
  currentRole = 'admin',
  userEmail = '',
  subTab: externalSubTab,
  setSubTab: externalSetSubTab,
  schoolSettings
}) => {
  const [internalSubTab, setInternalSubTab] = useState<CbtSubTab>('bank_soal');
  const subTab = externalSubTab !== undefined ? externalSubTab : internalSubTab;
  const setSubTab = externalSetSubTab || setInternalSubTab;

  useEffect(() => {
    if (currentRole === 'guru' && subTab === 'jadwal_kartu') {
      setSubTab('bank_soal');
    } else if (currentRole === 'siswa') {
      if (subTab === 'bank_soal' || subTab === 'ai_generator') {
        setSubTab('simulasi_ujian');
      }
    }
  }, [currentRole, subTab]);

  // Compute dynamic lists of available classes, subjects, and teachers
  // Hanya masukkan kelas/rombel yang benar-benar memiliki siswa terdaftar
  const availableKelasList = useMemo(() => {
    const rawSet = new Set<string>();

    rombelList.forEach(r => {
      const name = r.namaRombel || (r as any).nama;
      if (name && typeof name === 'string' && name.trim()) {
        rawSet.add(name.trim());
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

  const availableMapelList = useMemo(() => {
    const set = new Set<string>();
    mapelList.forEach(m => {
      const name = m.namaMapel || (m as any).nama;
      if (name && typeof name === 'string' && name.trim()) set.add(name.trim());
    });
    ujianList.forEach(u => {
      if (u.mataPelajaran && u.mataPelajaran.trim()) set.add(u.mataPelajaran.trim());
    });
    bankSoalList.forEach(b => {
      if (b.mataPelajaran && b.mataPelajaran.trim()) set.add(b.mataPelajaran.trim());
    });
    guruList.forEach(g => {
      if (g.mataPelajaran && g.mataPelajaran.trim()) set.add(g.mataPelajaran.trim());
    });
    if (set.size === 0) {
      ['Informatika / TIK', 'Matematika', 'Matematika Tingkat Lanjut', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA (Fisika/Kimia/Biologi)', 'IPS (Ekonomi/Geografi/Sejarah)', 'Pendidikan Agama Islam'].forEach(m => set.add(m));
    }
    return Array.from(set).sort();
  }, [mapelList, ujianList, bankSoalList, guruList]);

  // --- Jadwal Ujian State & Persistence ---
  const DEFAULT_JADWAL: JadwalUjianItem[] = [
    {
      id: 'jdw-01',
      ujianId: 'uj-01',
      judulUjian: 'Penilaian Tengah Semester (PTS) Matematika Kelas VIII',
      mataPelajaran: 'Matematika',
      kelasTarget: 'VIII - Al Biruni',
      tanggal: '2026-08-01',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      ruang: 'Lab Komputer 01',
      pengawas: 'Siti Rahmawati, S.Si., M.Sc.',
      status: 'Aktif'
    },
    {
      id: 'jdw-02',
      ujianId: 'uj-02',
      judulUjian: 'PTS Bahasa Indonesia Fase D',
      mataPelajaran: 'Bahasa Indonesia',
      kelasTarget: 'VIII - Al Farabi',
      tanggal: '2026-08-01',
      jamMulai: '09:30',
      jamSelesai: '11:00',
      ruang: 'Lab Komputer 01',
      pengawas: 'Rian Hidayat, S.Pd.',
      status: 'Mendatang'
    }
  ];

  const [jadwalList, setJadwalList] = useState<JadwalUjianItem[]>(() => {
    try {
      const saved = localStorage.getItem('edu_jadwalUjianList');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: JadwalUjianItem) => ({
            ...item,
            kelasTarget: item.kelasTarget === 'X-IPA-1' ? 'VIII - Al Biruni' : item.kelasTarget
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_JADWAL;
  });

  // Delete Confirmation Modal State
  const [deleteTargetJadwal, setDeleteTargetJadwal] = useState<JadwalUjianItem | null>(null);

  // Sync with Firestore
  useEffect(() => {
    const fetchRemoteJadwal = async () => {
      try {
        const remote = await dbFetchCollection<JadwalUjianItem>('edu_jadwalUjianList');
        if (remote && Array.isArray(remote) && remote.length > 0) {
          const sanitized = remote.map(item => ({
            ...item,
            kelasTarget: item.kelasTarget === 'X-IPA-1' ? 'VIII - Al Biruni' : item.kelasTarget
          }));
          setJadwalList(sanitized);
          localStorage.setItem('edu_jadwalUjianList', JSON.stringify(sanitized));
        }
      } catch (err) {
        console.error('Gagal mengambil jadwal ujian remote:', err);
      }
    };
    fetchRemoteJadwal();
  }, []);

  const saveJadwalList = (newList: JadwalUjianItem[]) => {
    const sanitized = newList.map(item => ({
      ...item,
      kelasTarget: item.kelasTarget === 'X-IPA-1' ? 'VIII - Al Biruni' : item.kelasTarget
    }));
    setJadwalList(sanitized);
    try {
      localStorage.setItem('edu_jadwalUjianList', JSON.stringify(sanitized));
      dbSaveCollection('edu_jadwalUjianList', sanitized).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  };

  // State Modal Tambah / Edit Sesi Ujian
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [editingJadwalId, setEditingJadwalId] = useState<string | null>(null);
  const [formJadwal, setFormJadwal] = useState<{
    ujianId: string;
    judulUjian: string;
    mataPelajaran: string;
    kelasTarget: string;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    ruang: string;
    pengawas: string;
    status: 'Aktif' | 'Mendatang' | 'Selesai';
  }>({
    ujianId: '',
    judulUjian: '',
    mataPelajaran: '',
    kelasTarget: 'Semua Kelas',
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '07:30',
    jamSelesai: '09:00',
    ruang: 'Lab Komputer 01',
    pengawas: '',
    status: 'Aktif'
  });

  const [formError, setFormError] = useState('');
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [customKelasInput, setCustomKelasInput] = useState('');

  // Helper untuk multi-select Kelas Target (membersihkan kelas usang seperti X-IPA-1 jika ada)
  const selectedKelasArray = useMemo(() => {
    if (!formJadwal.kelasTarget || !formJadwal.kelasTarget.trim()) return [];
    if (formJadwal.kelasTarget === 'Semua Kelas') return availableKelasList;
    return formJadwal.kelasTarget
      .split(',')
      .map(s => s.trim())
      .filter(s => s && s !== 'X-IPA-1');
  }, [formJadwal.kelasTarget, availableKelasList]);

  // Efek untuk otomatis membersihkan jika formJadwal.kelasTarget masih memuat X-IPA-1
  useEffect(() => {
    if (formJadwal.kelasTarget && formJadwal.kelasTarget.includes('X-IPA-1')) {
      const cleaned = formJadwal.kelasTarget
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== 'X-IPA-1')
        .join(', ');
      setFormJadwal(prev => ({
        ...prev,
        kelasTarget: cleaned || 'Semua Kelas'
      }));
    }
  }, [formJadwal.kelasTarget]);

  const isAllKelasSelected = 
    formJadwal.kelasTarget === 'Semua Kelas' || 
    (availableKelasList.length > 0 && availableKelasList.every(k => selectedKelasArray.includes(k)));

  const handleToggleKelasCheckbox = (kelasName: string) => {
    let current: string[];
    if (formJadwal.kelasTarget === 'Semua Kelas') {
      current = [...availableKelasList];
    } else {
      current = [...selectedKelasArray];
    }

    if (current.includes(kelasName)) {
      current = current.filter(k => k !== kelasName);
    } else {
      current = [...current, kelasName];
    }

    if (current.length === 0) {
      setFormJadwal(prev => ({ ...prev, kelasTarget: '' }));
    } else if (current.length === availableKelasList.length && availableKelasList.length > 0) {
      setFormJadwal(prev => ({ ...prev, kelasTarget: 'Semua Kelas' }));
    } else {
      setFormJadwal(prev => ({ ...prev, kelasTarget: current.join(', ') }));
    }
  };

  const handleSelectAllKelasToggle = () => {
    if (isAllKelasSelected) {
      setFormJadwal(prev => ({ ...prev, kelasTarget: '' }));
    } else {
      setFormJadwal(prev => ({ ...prev, kelasTarget: 'Semua Kelas' }));
    }
  };

  const handleAddCustomKelas = () => {
    if (!customKelasInput.trim()) return;
    const newKelas = customKelasInput.trim();
    let current: string[] = [];
    if (formJadwal.kelasTarget === 'Semua Kelas') {
      current = [...availableKelasList];
    } else {
      current = [...selectedKelasArray];
    }
    if (!current.includes(newKelas)) {
      current.push(newKelas);
      setFormJadwal(prev => ({ ...prev, kelasTarget: current.join(', ') }));
    }
    setCustomKelasInput('');
  };

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  const handleOpenAddJadwal = () => {
    setEditingJadwalId(null);
    setFormError('');
    
    // Temukan ujian CBT pertama (jika ada) untuk dijadikan referensi awal
    const firstUjian = ujianList[0];
    const defaultMapel = firstUjian?.mataPelajaran || availableMapelList[0] || 'Informatika / TIK';
    const rawKelas = firstUjian?.kelasTarget;
    const defaultKelas = (rawKelas && rawKelas !== 'X-IPA-1' && (availableKelasList.includes(rawKelas) || rawKelas === 'Semua Kelas'))
      ? rawKelas
      : (availableKelasList[0] || 'Semua Kelas');

    // Cari guru pengampu mapel yang sesuai
    const matchedGuru = guruList.find(g => 
      g.mataPelajaran && defaultMapel && 
      (g.mataPelajaran.toLowerCase().includes(defaultMapel.toLowerCase()) || 
       defaultMapel.toLowerCase().includes(g.mataPelajaran.toLowerCase()))
    );
    const defaultGuru = matchedGuru?.nama || guruList[0]?.nama || 'Aulia Safitri, S.Pd';

    setFormJadwal({
      ujianId: firstUjian?.id || '',
      judulUjian: firstUjian?.judulUjian || '',
      mataPelajaran: defaultMapel,
      kelasTarget: defaultKelas,
      tanggal: new Date().toISOString().split('T')[0],
      jamMulai: '07:30',
      jamSelesai: '09:00',
      ruang: 'Lab Komputer 01',
      pengawas: defaultGuru,
      status: 'Aktif'
    });
    setShowJadwalModal(true);
  };

  const handleOpenEditJadwal = (item: JadwalUjianItem) => {
    setEditingJadwalId(item.id);
    setFormError('');
    setFormJadwal({
      ujianId: item.ujianId || '',
      judulUjian: item.judulUjian,
      mataPelajaran: item.mataPelajaran,
      kelasTarget: item.kelasTarget,
      tanggal: item.tanggal,
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
      ruang: item.ruang,
      pengawas: item.pengawas,
      status: item.status
    });
    setShowJadwalModal(true);
  };

  const handleSelectUjianPreset = (selectedId: string) => {
    const selected = ujianList.find(u => u.id === selectedId);
    if (selected) {
      // Cari guru pengampu dari bank soal atau kecocokan mata pelajaran
      const bank = bankSoalList.find(b => b.id === selected.bankSoalId);
      const matchedGuruByBank = bank?.dibuatOleh ? guruList.find(g => g.nama.toLowerCase() === bank.dibuatOleh.toLowerCase()) : null;
      const matchedGuruByMapel = guruList.find(g => 
        g.mataPelajaran && selected.mataPelajaran && 
        (g.mataPelajaran.toLowerCase().includes(selected.mataPelajaran.toLowerCase()) || 
         selected.mataPelajaran.toLowerCase().includes(g.mataPelajaran.toLowerCase()))
      );

      const targetGuru = matchedGuruByBank?.nama || matchedGuruByMapel?.nama;

      setFormJadwal(prev => ({
        ...prev,
        ujianId: selected.id,
        judulUjian: selected.judulUjian,
        mataPelajaran: selected.mataPelajaran,
        kelasTarget: selected.kelasTarget,
        pengawas: targetGuru || prev.pengawas || (guruList[0]?.nama || '')
      }));
    } else {
      setFormJadwal(prev => ({ ...prev, ujianId: '' }));
    }
  };

  const handleMapelChange = (newMapel: string) => {
    const matchedGuru = guruList.find(g => 
      g.mataPelajaran && newMapel && 
      (g.mataPelajaran.toLowerCase().includes(newMapel.toLowerCase()) || 
       newMapel.toLowerCase().includes(g.mataPelajaran.toLowerCase()))
    );

    setFormJadwal(prev => ({
      ...prev,
      mataPelajaran: newMapel,
      pengawas: matchedGuru ? matchedGuru.nama : prev.pengawas
    }));
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJadwal.judulUjian.trim()) {
      setFormError('Nama sesi ujian tidak boleh kosong!');
      return;
    }
    if (!formJadwal.mataPelajaran.trim()) {
      setFormError('Mata pelajaran tidak boleh kosong!');
      return;
    }
    if (!formJadwal.kelasTarget || !formJadwal.kelasTarget.trim() || selectedKelasArray.length === 0) {
      setFormError('Pilih minimal satu kelas / rombel target!');
      return;
    }
    if (!formJadwal.tanggal) {
      setFormError('Tanggal pelaksanaan ujian harus dipilih!');
      return;
    }

    if (editingJadwalId) {
      const updated = jadwalList.map(j => {
        if (j.id === editingJadwalId) {
          return {
            ...j,
            ...formJadwal,
            id: editingJadwalId
          };
        }
        return j;
      });
      saveJadwalList(updated);
      showToast('Sesi ujian berhasil diperbarui!');
    } else {
      const newItem: JadwalUjianItem = {
        id: `jdw-${Date.now().toString().slice(-6)}`,
        ...formJadwal
      };
      saveJadwalList([newItem, ...jadwalList]);
      showToast('Sesi ujian baru berhasil dijadwalkan!');
    }

    setShowJadwalModal(false);
  };

  const handleOpenDeleteJadwal = (item: JadwalUjianItem) => {
    setDeleteTargetJadwal(item);
  };

  const handleConfirmDeleteJadwal = () => {
    if (!deleteTargetJadwal) return;
    const filtered = jadwalList.filter(j => j.id !== deleteTargetJadwal.id);
    saveJadwalList(filtered);
    showToast(`Sesi ujian "${deleteTargetJadwal.judulUjian}" berhasil dihapus!`);
    setDeleteTargetJadwal(null);
  };

  const handleToggleStatusJadwal = (id: string, currentStatus: 'Aktif' | 'Mendatang' | 'Selesai') => {
    const nextStatus: 'Aktif' | 'Mendatang' | 'Selesai' = 
      currentStatus === 'Aktif' ? 'Selesai' :
      currentStatus === 'Mendatang' ? 'Aktif' : 'Mendatang';
    
    const updated = jadwalList.map(j => j.id === id ? { ...j, status: nextStatus } : j);
    saveJadwalList(updated);
    showToast(`Status sesi diubah menjadi ${nextStatus}!`);
  };

  // Modal Kartu Peserta Ujian Printable State
  const [selectedKartuSiswa, setSelectedKartuSiswa] = useState<Siswa | null>(null);
  const printKartuRef = useRef<HTMLDivElement>(null);

  const handlePrintKartuUjian = () => {
    const printContent = printKartuRef.current;
    if (!printContent) return;
    const windowPrint = window.open('', '', 'width=900,height=650');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Peserta & Jadwal Ujian CBT - ${selectedKartuSiswa?.nama}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; background: white; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen bg-slate-100 p-8">
          <div>${printContent.innerHTML}</div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  // --- Bank Soal & Input Soal Manual State ---
  const [selectedBankId, setSelectedBankId] = useState<string>(bankSoalList[0]?.id || '');
  const activeBank = bankSoalList.find(b => b.id === selectedBankId) || bankSoalList[0];

  const [showAddSoalModal, setShowAddSoalModal] = useState(false);
  const [newTipe, setNewTipe] = useState<TipeSoal>('pg');
  const [newPertanyaan, setNewPertanyaan] = useState('');
  const [newOpsiA, setNewOpsiA] = useState('');
  const [newOpsiB, setNewOpsiB] = useState('');
  const [newOpsiC, setNewOpsiC] = useState('');
  const [newOpsiD, setNewOpsiD] = useState('');
  const [newKunciPg, setNewKunciPg] = useState('A');
  const [newKunciMultipleChoice, setNewKunciMultipleChoice] = useState<string[]>(['A', 'C']);
  const [newKunciIsian, setNewKunciIsian] = useState('');
  const [newKunciEsai, setNewKunciEsai] = useState('');
  const [newPembahasan, setNewPembahasan] = useState('');
  const [newBobot, setNewBobot] = useState(25);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleAddSoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBank) return;

    let kunci: string | string[] = newKunciPg;
    if (newTipe === 'multiple_choice') kunci = newKunciMultipleChoice;
    if (newTipe === 'isian') kunci = newKunciIsian;
    if (newTipe === 'esai') kunci = newKunciEsai;

    const newSoal: SoalCBT = {
      id: `soal-${Date.now()}`,
      tipe: newTipe,
      pertanyaan: newPertanyaan,
      opsi: (newTipe === 'pg' || newTipe === 'multiple_choice') ? [
        { id: 'A', teks: newOpsiA || 'Opsi A' },
        { id: 'B', teks: newOpsiB || 'Opsi B' },
        { id: 'C', teks: newOpsiC || 'Opsi C' },
        { id: 'D', teks: newOpsiD || 'Opsi D' },
      ] : undefined,
      kunciJawaban: kunci,
      pembahasan: newPembahasan,
      bobot: Number(newBobot),
      imageUrl: newImageUrl || undefined,
      videoUrl: newVideoUrl || undefined
    };

    setBankSoalList(prev => prev.map(b => {
      if (b.id === activeBank.id) {
        return {
          ...b,
          daftarSoal: [...b.daftarSoal, newSoal],
          jumlahSoal: b.daftarSoal.length + 1
        };
      }
      return b;
    }));

    setShowAddSoalModal(false);
    setNewPertanyaan('');
    setNewImageUrl('');
    setNewVideoUrl('');
    alert('Soal baru berhasil ditambahkan ke Bank Soal!');
  };

  // --- AI Generator State ---
  const [aiMapel, setAiMapel] = useState(availableMapelList[0] || 'Informatika / TIK');
  const [aiKelas, setAiKelas] = useState<string[]>(availableKelasList.length > 0 ? [availableKelasList[0]] : []);
  const [aiTipeSoal, setAiTipeSoal] = useState<string[]>(['pg', 'multiple_choice', 'isian', 'esai']);
  const [aiTopik, setAiTopik] = useState('Sistem Peredaran Darah & Fotosintesis');
  const [aiJumlah, setAiJumlah] = useState(4);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleToggleAiKelas = (kelasName: string) => {
    setAiKelas(prev => {
      if (prev.includes(kelasName)) {
        return prev.filter(k => k !== kelasName);
      }
      return [...prev, kelasName];
    });
  };

  const handleToggleAiTipe = (tipeName: string) => {
    setAiTipeSoal(prev => {
      if (prev.includes(tipeName)) {
        if (prev.length === 1) return prev; // prevent emptying
        return prev.filter(t => t !== tipeName);
      }
      return [...prev, tipeName];
    });
  };

  const handleGenerateAi = async () => {
    if (aiKelas.length === 0) {
      alert('Pilih minimal satu kelas target!');
      return;
    }
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaran: aiMapel,
          kelas: aiKelas.join(', '),
          topik: aiTopik,
          jumlahSoal: aiJumlah,
          tipeSoal: aiTipeSoal
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.soalList)) {
        const formattedSoal: SoalCBT[] = data.soalList.map((item: any, index: number) => ({
          id: `ai-soal-${Date.now()}-${index}`,
          tipe: item.tipe || 'pg',
          pertanyaan: item.pertanyaan,
          opsi: item.opsi,
          kunciJawaban: item.kunciJawaban,
          pembahasan: item.pembahasan,
          bobot: item.bobot || 25
        }));

        const newBank: BankSoal = {
          id: `bs-ai-${Date.now()}`,
          judul: `AI Bank Soal: ${aiMapel} - ${aiTopik}`,
          kode: `AI-${aiMapel.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          mataPelajaran: aiMapel,
          kelas: aiKelas.join(', '),
          durasiMenit: 60,
          jumlahSoal: formattedSoal.length,
          daftarSoal: formattedSoal,
          dibuatOleh: 'Gemini AI Assistant',
          tanggalDibuat: new Date().toISOString().split('T')[0]
        };

        setBankSoalList(prev => [newBank, ...prev]);
        setSelectedBankId(newBank.id);
        setSubTab('bank_soal');
        alert('Berhasil membuat Bank Soal otomatis dengan Gemini AI!');
      } else {
        alert('Gagal menghasilkan soal. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat menghubungi API Gemini AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        tipe: "pg",
        pertanyaan: "Berapakah hasil dari 12 x 8?",
        opsi: [
          { id: "A", teks: "96" },
          { id: "B", teks: "84" },
          { id: "C", teks: "108" },
          { id: "D", teks: "72" }
        ],
        kunciJawaban: "A",
        pembahasan: "12 dikali 8 sama dengan 96.",
        bobot: 25
      },
      {
        tipe: "multiple_choice",
        pertanyaan: "Pilihlah planet yang tergolong Planet Dalam (Terestrial)! (Pilihan >1)",
        opsi: [
          { id: "A", teks: "Merkurius" },
          { id: "B", teks: "Venus" },
          { id: "C", teks: "Jupiter" },
          { id: "D", teks: "Saturnus" }
        ],
        kunciJawaban: ["A", "B"],
        pembahasan: "Planet Dalam adalah Merkurius, Venus, Bumi, dan Mars.",
        bobot: 25
      },
      {
        tipe: "isian",
        pertanyaan: "Ibu kota negara Republik Indonesia yang baru di Kalimantan Timur adalah...",
        kunciJawaban: "Nusantara",
        pembahasan: "IKN Nusantara berlokasi di Kalimantan Timur.",
        bobot: 25
      },
      {
        tipe: "esai",
        pertanyaan: "Jelaskan prinsip kerja Fotosintesis pada tumbuhan hijau!",
        kunciJawaban: "Proses merubah air dan CO2 dengan bantuan sinar matahari menjadi glukosa dan O2...",
        pembahasan: "Penilaian berdasarkan penjelasan reaksi terang dan gelap.",
        bobot: 25
      }
    ];

    const jsonStr = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Soal_CBT_4Tipe.json';
    a.click();
  };

  // --- Simulasi Ujian Student State ---
  const [soalIndex, setSoalIndex] = useState(0);
  const [siswaJawaban, setSiswaJawaban] = useState<Record<string, JawabanSiswa>>({});
  const [examFinished, setExamFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');

  // Ambil data siswa aktif secara dinamis & akurat sesuai akun login atau pilihan simulasi
  const activeSiswa = useMemo(() => {
    // 1. Jika admin/guru secara manual memilih siswa dari dropdown simulasi, gunakan pilihan tersebut
    if (currentRole !== 'siswa' && selectedSiswaId) {
      const found = (siswaList || []).find(s => s.id === selectedSiswaId);
      if (found) return found;
    }

    const emailLower = userEmail?.toLowerCase().trim() || '';
    const emailPrefix = emailLower.split('@')[0];

    // 2. Cari siswa yang emailnya cocok atau username / NIS cocok dengan userEmail / emailPrefix
    const foundSiswa = (siswaList || []).find(s => {
      const sEmail = s.email?.toLowerCase().trim() || '';
      const sUsername = s.username?.toLowerCase().trim() || '';
      const sId = s.id?.toLowerCase().trim() || '';
      const sNis = s.nis?.toLowerCase().trim() || '';
      const sNisn = s.nisn?.toLowerCase().trim() || '';

      // Match criteria - Ensure none of the comparison fields are empty strings to avoid false positive matches
      return (
        (sEmail && sEmail === emailLower) ||
        (sUsername && sUsername === emailLower) ||
        (sId && sId === emailLower) ||
        (sNis && sNis === emailLower) ||
        (sNisn && sNisn === emailLower) ||
        (emailPrefix && (
          (sEmail && sEmail === emailPrefix) ||
          (sUsername && sUsername === emailPrefix) ||
          (sId && sId === emailPrefix) ||
          (sNis && sNis === emailPrefix) ||
          (sNisn && sNisn === emailPrefix)
        )) ||
        (emailLower.length > 0 && (
          (sUsername && emailLower.startsWith(sUsername)) ||
          (sNis && emailLower.startsWith(sNis)) ||
          (sId && emailLower.startsWith(sId)) ||
          (sUsername && emailLower.includes(sUsername)) ||
          (sNis && emailLower.includes(sNis))
        ))
      );
    });

    if (foundSiswa) return foundSiswa;

    // 3. Jika login sebagai siswa tapi tidak ditemukan di database dengan email itu,
    // coba cari siswa pertama yang namanya mengandung bagian dari email prefix
    if (emailPrefix && emailPrefix.length > 2) {
      const matchingByName = (siswaList || []).find(s => {
        const sNama = s.nama?.toLowerCase() || '';
        return sNama.includes(emailPrefix) || emailPrefix.includes(sNama);
      });
      if (matchingByName) return matchingByName;
    }

    // 4. Jika tidak ada kecocokan email tapi ada daftar siswa, berikan rekomendasi otomatis
    // Sesuai permintaan user, prioritaskan "Azahra", "Alya Salsabila" atau "Syahira"
    if (siswaList && siswaList.length > 0) {
      if (emailLower.includes('azahra') || emailLower.includes('zahra') || emailLower.includes('kamilah')) {
        const azahra = siswaList.find(s => s.nama.toLowerCase().includes('azahra') || s.nama.toLowerCase().includes('zahra'));
        if (azahra) return azahra;
      }
      if (emailLower.includes('alya')) {
        const alya = siswaList.find(s => s.nama.toLowerCase().includes('alya'));
        if (alya) return alya;
      }
      if (emailLower.includes('syahira')) {
        const syahira = siswaList.find(s => s.nama.toLowerCase().includes('syahira'));
        if (syahira) return syahira;
      }
      
      // Default fallback demo: cari siswa bernama "Azahra" (untuk visual demo terbaik sesuai screenshot user)
      const defaultAzahra = siswaList.find(s => s.nama.toLowerCase().includes('azahra') || s.nama.toLowerCase().includes('zahra'));
      if (defaultAzahra) return defaultAzahra;

      const defaultAlya = siswaList.find(s => s.nama.toLowerCase().includes('alya'));
      if (defaultAlya) return defaultAlya;

      // Jika tidak ada "Alya" di database, cari "Syahira"
      const defaultSyahira = siswaList.find(s => s.nama.toLowerCase().includes('syahira'));
      if (defaultSyahira) return defaultSyahira;

      return siswaList[0];
    }

    // 5. Fallback final jika list kosong
    return {
      id: 'sis-002',
      nisn: '122600683',
      nis: '10209',
      nama: 'Alya Salsabila Amani',
      kelas: 'IX - Utsman bin Affan',
      jenisKelamin: 'P',
      fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    };
  }, [siswaList, currentRole, userEmail, selectedSiswaId]);
  
  // Real dynamic timer matching the mockup image (1 Jam 49 Menit 51 Detik)
  const [timeLeft, setTimeLeft] = useState(1 * 3600 + 49 * 60 + 51);

  useEffect(() => {
    if (subTab !== 'simulasi_ujian' || examFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subTab, examFinished]);

  const getFormattedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h} Jam ${m} Menit ${s} Detik`;
  };

  // --- Anti-Cheat Monitoring & Audio Alarm State ---
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatAlert, setShowCheatAlert] = useState(false);
  const [cheatLogs, setCheatLogs] = useState<string[]>([]);

  // Synthesizer Web Audio API for Warning Alarm (Bip Bip Bip)
  const playViolationBeepSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      
      // Play 3 loud, high-pitched alarm beeps in quick succession: "Bip... Bip... Bip!"
      const beeps = [
        { time: now + 0.05, freq: 900, dur: 0.12 },
        { time: now + 0.22, freq: 900, dur: 0.12 },
        { time: now + 0.39, freq: 1150, dur: 0.22 }
      ];

      beeps.forEach(({ time, freq, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth'; // Piercing, clear warning alarm tone
        osc.frequency.setValueAtTime(freq, time);

        // Envelope: instant attack, punchy decay
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.45, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });
    } catch (e) {
      console.error('Audio warning beep error:', e);
    }
  };

  // Continuous sound alarm loop while the violation popup (showCheatAlert) is visible
  useEffect(() => {
    if (!showCheatAlert) return;

    // Play initial beep burst immediately
    playViolationBeepSound();

    // Repeat alarm beep "bip bip bip" every 1.4s until dismissed
    const alarmInterval = setInterval(() => {
      playViolationBeepSound();
    }, 1400);

    return () => {
      clearInterval(alarmInterval);
    };
  }, [showCheatAlert]);

  // Window Focus / Tab Switch Detection Effect
  useEffect(() => {
    if (subTab !== 'simulasi_ujian' || examFinished) return;

    const handleWindowBlur = () => {
      setCheatCount(prev => {
        const next = prev + 1;
        const timeLog = new Date().toLocaleTimeString('id-ID');
        setCheatLogs(logs => [`[${timeLog}] Terdeteksi keluar dari aplikasi CBT (Pelanggaran ke-${next})`, ...logs]);
        setShowCheatAlert(true);

        if (next >= 3) {
          setTimeout(() => {
            handleFinishExam();
            alert('PERINGATAN KRITIS: Anda telah melakukan pelanggaran batas 3x keluar aplikasi! Ujian di-submit otomatis oleh Sistem Anti-Cheat.');
          }, 1000);
        }
        return next;
      });
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleWindowBlur();
    });

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [subTab, examFinished]);

  const currentExam = activeBank;
  const currentSoal = currentExam?.daftarSoal[soalIndex];

  const handleAnswerSelect = (soalId: string, answer: string | string[]) => {
    setSiswaJawaban(prev => ({
      ...prev,
      [soalId]: {
        soalId,
        jawaban: answer,
        raguRagu: prev[soalId]?.raguRagu || false
      }
    }));
  };

  const toggleRaguRagu = (soalId: string) => {
    setSiswaJawaban(prev => ({
      ...prev,
      [soalId]: {
        soalId: soalId,
        jawaban: prev[soalId]?.jawaban || '',
        raguRagu: !prev[soalId]?.raguRagu
      }
    }));
  };

  const handleFinishExam = () => {
    if (!currentExam) return;
    let score = 0;
    currentExam.daftarSoal.forEach(s => {
      const userAns = siswaJawaban[s.id]?.jawaban;
      if (s.tipe === 'pg') {
        if (userAns === s.kunciJawaban) score += s.bobot;
      } else if (s.tipe === 'isian') {
        if (typeof userAns === 'string' && typeof s.kunciJawaban === 'string') {
          if (userAns.trim().toLowerCase() === s.kunciJawaban.trim().toLowerCase()) {
            score += s.bobot;
          }
        }
      } else if (s.tipe === 'multiple_choice') {
        if (Array.isArray(userAns) && Array.isArray(s.kunciJawaban)) {
          if (JSON.stringify(userAns.sort()) === JSON.stringify((s.kunciJawaban as string[]).sort())) {
            score += s.bobot;
          }
        }
      } else if (s.tipe === 'esai') {
        // Default partial score for esai preview
        score += Math.round(s.bobot * 0.8);
      }
    });

    const newHasil: HasilUjian = {
      id: `hsl-${Date.now()}`,
      ujianId: currentExam.id,
      siswaId: activeSiswa.id,
      siswaNama: activeSiswa.nama,
      nis: activeSiswa.nis,
      kelas: activeSiswa.kelas,
      jawaban: siswaJawaban,
      nilaiTotal: score,
      statusPenilaian: currentExam.daftarSoal.some(s => s.tipe === 'esai') ? 'Perlu Koreksi Manual' : 'Selesai',
      waktuSubmit: new Date().toISOString(),
      pelanggaranCount: cheatCount,
      logKecurangan: cheatLogs
    };

    if (setHasilUjianList) {
      setHasilUjianList(prev => [...prev, newHasil]);
    }

    setFinalScore(score);
    setExamFinished(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-400" /> CBT Ujian & Bank Soal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Input Soal 4 Tipe (PG, Multiple Choice, Isian, Esai), Generator AI, & Simulasi Ujian Online
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg font-bold bg-slate-800/80 text-blue-400 border border-slate-700/60">
            {subTab === 'bank_soal' && `Bank Soal (${bankSoalList.length})`}
            {subTab === 'jadwal_kartu' && 'Jadwal & Kartu Ujian'}
            {subTab === 'simulasi_ujian' && 'Simulasi CBT Anti-Cheat'}
          </span>
        </div>
      </div>

      {/* SUBTAB JADWAL & KARTU PESERTA UJIAN */}
      {subTab === 'jadwal_kartu' && (
        <div className="space-y-6">
          
          {/* Toast Notification */}
          {toastNotification && (
            <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastNotification}</span>
            </div>
          )}

          {/* Jadwal Ujian List */}
          <div className="bg-[#121212] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" /> Jadwal Pelaksanaan Ujian CBT 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar sesi ujian online, jadwal ruang lab komputer, dan guru mata pelajaran
                </p>
              </div>

              <button
                onClick={handleOpenAddJadwal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Sesi Ujian
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#181818] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nama Sesi Ujian</th>
                    <th className="px-4 py-3">Mata Pelajaran</th>
                    <th className="px-4 py-3">Kelas Target</th>
                    <th className="px-4 py-3">Tanggal & Waktu</th>
                    <th className="px-4 py-3">Ruang / Guru Mapel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {jadwalList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                        <p className="font-semibold text-slate-400">Belum ada sesi ujian yang dijadwalkan</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Klik tombol &ldquo;Tambah Sesi Ujian&rdquo; untuk membuat jadwal baru</p>
                        <button
                          onClick={handleOpenAddJadwal}
                          className="mt-3 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all border border-blue-500/30"
                        >
                          <Plus className="w-3.5 h-3.5" /> Buat Sesi Pertama
                        </button>
                      </td>
                    </tr>
                  ) : (
                    jadwalList.map(j => (
                      <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                            <span>{j.judulUjian}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-blue-400 font-semibold">{j.mataPelajaran}</td>
                        <td className="px-4 py-3 font-mono text-slate-200">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {j.kelasTarget === 'Semua Kelas' ? (
                              <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/80 text-blue-300 text-[11px] font-semibold">
                                🌐 Semua Kelas
                              </span>
                            ) : (
                              j.kelasTarget.split(',').map((k, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-200 font-bold">
                                  {k.trim()}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          <div className="font-bold text-white">{j.tanggal}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {j.jamMulai} - {j.jamSelesai} WIB
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <div className="font-semibold text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" /> {j.ruang}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5" title="Guru Mata Pelajaran">
                            <UserCheck className="w-3 h-3 text-emerald-400" /> {j.pengawas || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatusJadwal(j.id, j.status)}
                            title="Klik untuk mengubah status sesi"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                              j.status === 'Aktif' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : j.status === 'Mendatang'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              j.status === 'Aktif' ? 'bg-emerald-400 animate-pulse' : j.status === 'Mendatang' ? 'bg-amber-400' : 'bg-slate-500'
                            }`}></span>
                            {j.status}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditJadwal(j)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Edit Sesi Ujian"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteJadwal(j)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Hapus Sesi Ujian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Kartu Peserta Ujian Generator */}
          <div className="bg-[#121212] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" /> Cetak Kartu Peserta & Kartu Jadwal Ujian
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kartu resmi peserta ujian CBT lengkap dengan nomor peserta, password login, barcode ID, dan jadwal lengkap
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {siswaList.map(siswa => (
                <div
                  key={siswa.id}
                  className="p-3.5 bg-[#181818] rounded-xl border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-all group gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      {siswa.fotoUrl ? (
                        <img src={siswa.fotoUrl} alt={siswa.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{siswa.nama}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">NISN: {siswa.nisn} | Kelas {siswa.kelas}</div>
                      <div className="text-[9px] font-mono text-purple-400 mt-0.5">No Peserta: C2026-{siswa.nisn.slice(-4)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedKartuSiswa(siswa)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Kartu
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 1: BANK SOAL */}
      {subTab === 'bank_soal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Bank List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Daftar Paket Bank Soal</h3>
              <button 
                onClick={handleDownloadTemplate}
                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Template JSON
              </button>
            </div>

            <div className="space-y-2">
              {bankSoalList.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBankId(b.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    b.id === activeBank?.id
                      ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 font-semibold shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold">
                      {b.kode}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">{b.jumlahSoal} Soal</span>
                  </div>
                  <h4 className="text-xs font-bold mt-1.5">{b.judul}</h4>
                  <div className="text-[11px] text-slate-500 mt-1">{b.mataPelajaran} • {b.kelas}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Question Inspector & Manual Addition */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            {activeBank ? (
              <>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{activeBank.judul}</h3>
                    <p className="text-xs text-slate-500">{activeBank.mataPelajaran} - Kelas {activeBank.kelas} | Durasi: {activeBank.durasiMenit} Menit</p>
                  </div>
                  <button
                    onClick={() => setShowAddSoalModal(true)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Tambah Soal Manual
                  </button>
                </div>

                {/* List of Questions in Bank */}
                <div className="space-y-4">
                  {activeBank.daftarSoal.map((soal, idx) => (
                    <div key={soal.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono font-bold rounded text-[10px]">
                          Soal #{idx + 1} • {soal.tipe.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">Bobot: {soal.bobot} Poin</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs leading-relaxed">{soal.pertanyaan}</p>

                      {/* Media Display (Image / Video) */}
                      {(soal.imageUrl || soal.videoUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2.5">
                          {soal.imageUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                              <img 
                                src={soal.imageUrl} 
                                alt={`Media Soal #${idx + 1}`} 
                                className="max-h-48 w-full object-contain rounded-lg mx-auto"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          {soal.videoUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
                              <video 
                                src={soal.videoUrl} 
                                controls 
                                className="max-h-48 w-full rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options for PG & MC */}
                      {soal.opsi && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 pt-1">
                          {soal.opsi.map(o => (
                            <div key={o.id} className="text-xs text-slate-700 flex items-center gap-2">
                              <span className="font-bold text-slate-500">{o.id}.</span>
                              <span>{o.teks}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200 mt-2">
                        <span className="font-bold">Kunci Jawaban:</span> {Array.isArray(soal.kunciJawaban) ? soal.kunciJawaban.join(', ') : soal.kunciJawaban}
                        {soal.pembahasan && <div className="text-[10px] text-emerald-700 mt-0.5">Pembahasan: {soal.pembahasan}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-xs">Pilih paket bank soal di sebelah kiri.</p>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: AI GENERATOR */}
      {subTab === 'ai_generator' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg border-b pb-3">
            <Sparkles className="w-5 h-5" /> Gemini AI Question Generator
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Hasilkan set soal Ujian CBT otomatis berdasarkan mata pelajaran <span className="font-bold text-slate-800">{aiMapel}</span> dan topik <span className="font-bold text-slate-800">{aiTopik || 'umum'}</span>, lengkap dengan pembahasan dan kunci jawaban!
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Mata Pelajaran</label>
              <select
                value={aiMapel}
                onChange={e => setAiMapel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
              >
                {availableMapelList.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Kelas Target (Pilih lebih dari satu)</label>
              <div className="flex flex-wrap gap-2">
                {availableKelasList.map(k => (
                  <button
                    key={k}
                    onClick={() => handleToggleAiKelas(k)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      aiKelas.includes(k)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipe Soal (Pilih yang akan di-generate)</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'pg', label: 'Pilihan Ganda' },
                  { id: 'multiple_choice', label: 'Ganda Kompleks' },
                  { id: 'isian', label: 'Isian Singkat' },
                  { id: 'esai', label: 'Esai Uraian' }
                ].map(tipe => (
                  <button
                    key={tipe.id}
                    onClick={() => handleToggleAiTipe(tipe.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                      aiTipeSoal.includes(tipe.id)
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                        : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                      aiTipeSoal.includes(tipe.id) ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300'
                    }`}>
                      {aiTipeSoal.includes(tipe.id) && <Check className="w-2 h-2 text-white" />}
                    </div>
                    {tipe.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Jumlah Soal Total</label>
                <input 
                  type="number" 
                  min={1}
                  max={20}
                  value={aiJumlah} 
                  onChange={e => setAiJumlah(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400" 
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Topik / Bahasan Soal</label>
                <input 
                  type="text" 
                  value={aiTopik} 
                  onChange={e => setAiTopik(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400" 
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAi}
              disabled={loadingAi}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {loadingAi ? (
                <span>Generating dengan Gemini AI...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Bank Soal Otomatis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SIMULASI UJIAN SISWA */}
      {subTab === 'simulasi_ujian' && (
        <div className="space-y-4">
          
          {/* Anti-Cheat Proctored Warning Banner */}
          {!examFinished && (
            <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 uppercase tracking-wider block text-[10px]">
                    Sistem Pengawasan Otomatis CBT (Anti-Cheat Active)
                  </span>
                  <span>Dilarang berpindah tab, membuka aplikasi lain, atau meminimalkan browser.</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCheatCount(prev => {
                      const next = prev + 1;
                      const timeLog = new Date().toLocaleTimeString('id-ID');
                      setCheatLogs(logs => [`[${timeLog}] Simulasi Pelanggaran Ujian (Pelanggaran ke-${next})`, ...logs]);
                      setShowCheatAlert(true);
                      return next;
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40 cursor-pointer active:scale-95"
                  title="Klik untuk menguji bunyi alarm bip bip bip dan simulasi pelanggaran"
                >
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Uji Alarm Bip
                </button>
                <span className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                  cheatCount === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  cheatCount === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  Pelanggaran: {cheatCount} / 3
                </span>
              </div>
            </div>
          )}

          {!examFinished ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Main Question Display - Left side (8 Cols to accommodate the 4-col sidebar perfectly) */}
              <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Header: Soal No.X and Subject Badge */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xl font-extrabold text-slate-800 tracking-tight">Soal No.{soalIndex + 1}</span>
                  <span className="text-xs font-bold text-[#4f46e5] bg-[#eef2ff] px-4 py-1.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                    {currentExam?.mapel || "Matematika"}
                  </span>
                </div>

                {/* Question Body */}
                {currentSoal ? (
                  <div className="space-y-6">
                    <div className="text-slate-800 text-[15px] font-semibold leading-relaxed">
                      {currentSoal.pertanyaan}
                    </div>

                    {/* Student Exam Question Media Display */}
                    {(currentSoal.imageUrl || currentSoal.videoUrl) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentSoal.imageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gambar Soal</span>
                            <img 
                              src={currentSoal.imageUrl} 
                              alt="Gambar Lampiran" 
                              className="max-h-64 object-contain rounded-xl w-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        {currentSoal.videoUrl && (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Video Lampiran</span>
                            <video 
                              src={currentSoal.videoUrl} 
                              controls 
                              className="max-h-64 rounded-xl w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Answer Inputs based on Question Type */}
                    {(currentSoal.tipe === 'pg' || currentSoal.tipe === 'multiple_choice') && currentSoal.opsi && (
                      <div className="space-y-3 pt-2">
                        {currentSoal.opsi.map(o => {
                          const isSelected = Array.isArray(siswaJawaban[currentSoal.id]?.jawaban)
                            ? (siswaJawaban[currentSoal.id]?.jawaban as string[]).includes(o.id)
                            : siswaJawaban[currentSoal.id]?.jawaban === o.id;

                          return (
                            <div
                              key={o.id}
                              onClick={() => {
                                if (currentSoal.tipe === 'pg') {
                                  handleAnswerSelect(currentSoal.id, o.id);
                                } else {
                                  // Multiple choice
                                  const currentArr = (siswaJawaban[currentSoal.id]?.jawaban as string[]) || [];
                                  const newArr = currentArr.includes(o.id) 
                                    ? currentArr.filter(x => x !== o.id) 
                                    : [...currentArr, o.id];
                                  handleAnswerSelect(currentSoal.id, newArr);
                                }
                              }}
                              className="group flex items-start gap-3 cursor-pointer text-slate-800 hover:text-slate-950 text-sm font-semibold transition-all py-1.5"
                            >
                              {/* Circular Radio Indicator - matching hollow green/teal/slate style */}
                              <span className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                isSelected 
                                  ? 'border-teal-500 bg-white' 
                                  : 'border-slate-300 group-hover:border-slate-400 bg-white'
                              }`}>
                                {isSelected && <span className="w-3 h-3 rounded-full bg-teal-500"></span>}
                              </span>
                              <span className="leading-relaxed">
                                <span className="lowercase font-bold text-slate-800 mr-2">{o.id.toLowerCase()}.</span> 
                                <span className="text-slate-700 font-semibold group-hover:text-slate-900">{o.teks}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentSoal.tipe === 'isian' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Ketikkan Jawaban Singkat Anda:</label>
                        <input
                          type="text"
                          value={(siswaJawaban[currentSoal.id]?.jawaban as string) || ''}
                          onChange={e => handleAnswerSelect(currentSoal.id, e.target.value)}
                          placeholder="Masukkan jawaban..."
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
                        />
                      </div>
                    )}

                    {currentSoal.tipe === 'esai' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Tuliskan Jawaban Uraian / Esai Anda secara Lengkap:</label>
                        <textarea
                          rows={4}
                          value={(siswaJawaban[currentSoal.id]?.jawaban as string) || ''}
                          onChange={e => handleAnswerSelect(currentSoal.id, e.target.value)}
                          placeholder="Ketikkan uraian penjelas..."
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Bottom Question Controls */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={soalIndex === 0}
                          onClick={() => setSoalIndex(prev => prev - 1)}
                          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-full flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" /> Sebelum
                        </button>
                        <button
                          onClick={() => toggleRaguRagu(currentSoal.id)}
                          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                            siswaJawaban[currentSoal.id]?.raguRagu
                              ? 'bg-amber-400 text-slate-950 border-amber-500'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {siswaJawaban[currentSoal.id]?.raguRagu ? '✓ Ragu (Aktif)' : 'Ragu-Ragu'}
                        </button>
                      </div>

                      {soalIndex < (currentExam?.daftarSoal.length || 1) - 1 ? (
                        <button
                          onClick={() => setSoalIndex(prev => prev + 1)}
                          className="px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-black rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                        >
                          Selanjutnya <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={handleFinishExam}
                          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-full flex items-center gap-1.5 transition-all shadow-md cursor-pointer uppercase tracking-wider"
                        >
                          Selesai <CheckCircle2 className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>

                  </div>
                ) : null}

              </div>

              {/* Right: Countdown Panel & Question Navigation Grid (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Profil Peserta Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-wider text-center pb-2 border-b border-slate-100">
                    Profil Peserta
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={activeSiswa.fotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                        alt={activeSiswa.nama}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="font-bold text-slate-900 text-sm truncate" title={activeSiswa.nama}>{activeSiswa.nama}</h5>
                      <p className="text-[11px] text-slate-500 font-medium">NISN: {activeSiswa.nisn || activeSiswa.nis || "117899483"}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Kelas: {activeSiswa.kelas || "IX - Utsman bin Affan"}</p>
                      <span className="inline-block text-[10px] uppercase font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100/30 mt-1">
                        Aktif Mengikuti Ujian
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Pemilihan Siswa khusus untuk Admin / Guru untuk simulasi */}
                  {currentRole !== 'siswa' && siswaList && siswaList.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-1">
                      <label className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">
                        Ganti Akun Simulasi (Mode Admin):
                      </label>
                      <select
                        value={selectedSiswaId || activeSiswa.id}
                        onChange={(e) => setSelectedSiswaId(e.target.value)}
                        className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        {siswaList.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.nama} ({s.kelas})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Waktu Tersisa Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-wide">Waktu Tersisa</h4>
                  
                  <div className="py-2 bg-amber-50/20 rounded-2xl border border-amber-100/30">
                    <span className="text-[#f59e0b] font-black text-2xl block">
                      {Math.floor(timeLeft / 3600)} Jam
                    </span>
                    <span className="text-[#f59e0b] font-black text-xl block mt-0.5">
                      {Math.floor((timeLeft % 3600) / 60)} Menit {timeLeft % 60} Detik
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-400">Sudah Selesai?</p>
                    <button
                      onClick={handleFinishExam}
                      className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold rounded-full text-xs transition-all shadow-md tracking-wider uppercase cursor-pointer"
                    >
                      Selesaikan Ujian
                    </button>
                  </div>
                </div>

                {/* Nomor Soal Grid Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-wider text-center pb-2 border-b border-slate-100">
                    Nomor Soal
                  </h4>

                  <div className="grid grid-cols-5 gap-2">
                    {currentExam?.daftarSoal.map((s, idx) => {
                      const hasAnswer = siswaJawaban[s.id]?.jawaban;
                      const isRagu = siswaJawaban[s.id]?.raguRagu;
                      const isCurrent = soalIndex === idx;

                      // Exact styles inspired by mockup image: pink blocks for unanswered, orange/amber for answered
                      let btnStyle = "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200";
                      if (isRagu) {
                        btnStyle = "bg-amber-400 text-slate-950 border-amber-400 font-black";
                      } else if (hasAnswer) {
                        btnStyle = "bg-[#f59e0b] text-white border-[#f59e0b] font-black";
                      }

                      if (isCurrent) {
                        btnStyle += " ring-2 ring-slate-800 ring-offset-2 scale-105";
                      }

                      return (
                        <button
                          key={s.id}
                          onClick={() => setSoalIndex(idx)}
                          className={`aspect-square w-full rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center justify-center ${btnStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Result Screen */
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-bold">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ujian CBT Telah Selesai!</h3>
              <p className="text-xs text-slate-500">
                Jawaban telah berhasil disimpan dan dinilai secara otomatis oleh sistem.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nilai Akhir Siswa</span>
                <span className="text-4xl font-extrabold text-emerald-600 mt-1 block">{finalScore} / 100</span>
              </div>

              <button
                onClick={() => setExamFinished(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
              >
                Kembali ke Simulasi
              </button>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 5: HASIL UJIAN FROM FIREBASE */}
      {subTab === 'hasil_ujian' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Hasil Penilaian Ujian CBT (Database Firebase)
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar hasil pengerjaan ujian siswa yang telah tersimpan secara aman dan realtime di Firestore cloud database.
                </p>
              </div>
              <button
                onClick={() => alert('Data hasil ujian telah sinkron 100% dengan Cloud Firestore.')}
                className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" /> Cloud Terhubung
              </button>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hasil Disimpan</span>
                  <span className="text-lg font-bold text-slate-800 block">{hasilUjianList.length} Lembar</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-Rata Nilai</span>
                  <span className="text-lg font-bold text-slate-800 block">
                    {hasilUjianList.length > 0 
                      ? Math.round(hasilUjianList.reduce((acc, h) => acc + h.nilaiTotal, 0) / hasilUjianList.length)
                      : 0} / 100
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sesi Dengan Pelanggaran</span>
                  <span className="text-lg font-bold text-slate-800 block">
                    {hasilUjianList.filter(h => (h.pelanggaranCount || 0) > 0).length} Sesi
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            {hasilUjianList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Hasil Ujian Tersimpan</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Silakan buka tab <strong className="text-slate-600">"Simulasi CBT Anti-Cheat"</strong>, pilih paket bank soal, lalu selesaikan ujian untuk mensimulasikan penyimpanan data otomatis ke Firebase.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">Kelas & NIS</th>
                      <th className="p-3">Waktu Submit</th>
                      <th className="p-3 text-center">Pelanggaran</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {hasilUjianList.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{h.siswaNama}</td>
                        <td className="p-3 text-slate-500">
                          {h.kelas} <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1 font-mono">{h.nis}</span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {new Date(h.waktuSubmit).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center">
                          {(h.pelanggaranCount || 0) > 0 ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[9px] inline-flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> {h.pelanggaranCount}x
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[9px]">
                              Aman
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            h.statusPenilaian === 'Selesai' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {h.statusPenilaian}
                          </span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                          <span className={h.nilaiTotal >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                            {h.nilaiTotal} / 100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ADD MANUAL QUESTION */}
      {showAddSoalModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Input Soal Baru Manual</h3>
              <button 
                type="button" 
                onClick={() => setShowAddSoalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSoal} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div>
                <label className="text-xs font-extrabold text-slate-800 mb-1 block">Tipe Soal</label>
                <select
                  value={newTipe}
                  onChange={e => setNewTipe(e.target.value as TipeSoal)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="pg" className="text-slate-900 bg-white font-medium">Pilihan Ganda (1 Jawaban Benar)</option>
                  <option value="multiple_choice" className="text-slate-900 bg-white font-medium">Pilihan Ganda Kompleks (&gt;1 Jawaban)</option>
                  <option value="isian" className="text-slate-900 bg-white font-medium">Isian Singkat</option>
                  <option value="esai" className="text-slate-900 bg-white font-medium">Esai Uraian</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 mb-1 block">Teks Pertanyaan Soal</label>
                <textarea
                  required
                  rows={3}
                  value={newPertanyaan}
                  onChange={e => setNewPertanyaan(e.target.value)}
                  placeholder="Ketikkan teks pertanyaan soal secara lengkap..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {(newTipe === 'pg' || newTipe === 'multiple_choice') && (
                <div>
                  <label className="text-xs font-extrabold text-slate-800 mb-1 block">Pilihan Opsi Jawaban</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input type="text" placeholder="Opsi A" value={newOpsiA} onChange={e => setNewOpsiA(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    <input type="text" placeholder="Opsi B" value={newOpsiB} onChange={e => setNewOpsiB(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    <input type="text" placeholder="Opsi C" value={newOpsiC} onChange={e => setNewOpsiC(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                    <input type="text" placeholder="Opsi D" value={newOpsiD} onChange={e => setNewOpsiD(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>
              )}

              {newTipe === 'pg' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-800 mb-1 block">Kunci Jawaban PG</label>
                  <select value={newKunciPg} onChange={e => setNewKunciPg(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="A" className="text-slate-900 bg-white font-medium">A</option>
                    <option value="B" className="text-slate-900 bg-white font-medium">B</option>
                    <option value="C" className="text-slate-900 bg-white font-medium">C</option>
                    <option value="D" className="text-slate-900 bg-white font-medium">D</option>
                  </select>
                </div>
              )}

              {newTipe === 'isian' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-800 mb-1 block">Kunci Jawaban Isian Singkat</label>
                  <input type="text" required value={newKunciIsian} onChange={e => setNewKunciIsian(e.target.value)} placeholder="Contoh: Jakarta" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              )}

              {newTipe === 'esai' && (
                <div>
                  <label className="text-xs font-extrabold text-slate-800 mb-1 block">Pedoman Kunci Esai</label>
                  <input type="text" required value={newKunciEsai} onChange={e => setNewKunciEsai(e.target.value)} placeholder="Masukkan kata kunci/pedoman jawaban..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              )}

              {/* Media Upload Area (Image & Video) */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emerald-600" /> Media Pendukung (Gambar / Video)
                </span>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Image input/upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gambar Soal</label>
                    {newImageUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white h-20 flex items-center justify-center">
                        <img src={newImageUrl} alt="Pratinjau Gambar" className="h-full object-cover w-full" />
                        <button 
                          type="button" 
                          onClick={() => setNewImageUrl('')} 
                          className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <label className="border border-dashed border-slate-300 hover:border-slate-400 bg-white text-center p-2 rounded-lg cursor-pointer flex flex-col items-center justify-center h-20 transition-all">
                          <Image className="w-5 h-5 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-600 mt-1">Unggah Gambar</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewImageUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="Atau URL gambar..." 
                          value={newImageUrl} 
                          onChange={(e) => setNewImageUrl(e.target.value)} 
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-[9px] font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Video input/upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Video Soal</label>
                    {newVideoUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white h-20 flex items-center justify-center">
                        <div className="text-[10px] text-slate-600 font-bold flex flex-col items-center gap-1">
                          <Film className="w-5 h-5 text-emerald-600" />
                          <span>Video Terpasang</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setNewVideoUrl('')} 
                          className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                        >
                          Hapus Video
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <label className="border border-dashed border-slate-300 hover:border-slate-400 bg-white text-center p-2 rounded-lg cursor-pointer flex flex-col items-center justify-center h-20 transition-all">
                          <Film className="w-5 h-5 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-600 mt-1">Unggah Video</span>
                          <input 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewVideoUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="Atau URL video..." 
                          value={newVideoUrl} 
                          onChange={(e) => setNewVideoUrl(e.target.value)} 
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-[9px] font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 mb-1 block">Bobot Poin Soal</label>
                <input type="number" value={newBobot} onChange={e => setNewBobot(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              </div>

              <div className="flex justify-end gap-2.5 p-4 bg-slate-50 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddSoalModal(false)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/15 transition-all cursor-pointer">Simpan Soal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP CHEAT ALERT MODAL (DENGAN ALARM SUARA BIP BIP BIP) */}
      {showCheatAlert && (
        <div className="fixed inset-0 bg-[#3b050d]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#100a0d] border border-rose-500/70 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl shadow-rose-950/70 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Pulsing Icon */}
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 relative">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                PERINGATAN KECURANGAN CBT!
              </h3>
              <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed px-2">
                Sistem mendeteksi Anda mencoba membuka aplikasi/tab lain atau keluar dari fokus layar ujian.
              </p>
            </div>

            {/* Violation Counter Box */}
            <div className="p-3 bg-[#1e0a11] rounded-xl border border-rose-900/80 text-rose-200 font-mono text-xs font-bold tracking-wider">
              Status Pelanggaran: {cheatCount} / 3
            </div>

            {/* Sound Alarm Active Badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl py-1.5 px-3">
              <Volume2 className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>Alarm Pelanggaran Aktif: <strong>Bip Bip Bip</strong></span>
              <button
                type="button"
                onClick={() => playViolationBeepSound()}
                className="text-[10px] bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 px-2 py-0.5 rounded ml-1 transition-all cursor-pointer font-bold"
                title="Bunyikan Ulang"
              >
                Ulangi
              </button>
            </div>

            <p className="text-[10px] text-slate-400 px-1 leading-relaxed">
              {cheatCount >= 3 
                ? 'Batas maksimal pelanggaran telah terlampaui. Ujian telah di-submit secara otomatis!' 
                : 'Peringatan: Apabila mencapai 3 kali pelanggaran, sistem akan otomatis mengunci dan me-submit ujian Anda!'}
            </p>

            <button
              onClick={() => setShowCheatAlert(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-900/50 cursor-pointer"
            >
              Saya Mengerti & Kembali ke Ujian
            </button>
          </div>
        </div>
      )}

      {/* PRINTABLE KARTU PESERTA & JADWAL UJIAN MODAL */}
      {selectedKartuSiswa && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" /> Pratinjau Cetak Kartu Peserta Ujian CBT
              </h3>
              <button
                onClick={() => setSelectedKartuSiswa(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Container */}
            <div ref={printKartuRef} className="bg-white p-6 rounded-xl text-slate-900 border-2 border-slate-900 shadow-md space-y-4">
              
              {/* Header Kartu Ujian */}
              <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
                <div className="w-12 h-12 bg-slate-900 rounded-xl text-white font-bold flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {schoolSettings?.logoUrl ? (
                    <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  ) : (
                    <Building2 className="w-7 h-7" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-wide leading-tight">KARTU PESERTA & JADWAL UJIAN CBT 2026</h4>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">
                    {schoolSettings?.namaSekolah || 'SMA PERMATA BANGSA'} • {schoolSettings?.semester ? `SEMESTER ${schoolSettings.semester.toUpperCase()}` : 'SEMESTER GANJIL'}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {schoolSettings?.alamat || 'Jl. Education No. 123'} • Telp: {schoolSettings?.telepon || '(021) 555-0199'}
                  </p>
                </div>
                <div className="text-right border-l-2 border-slate-900 pl-3">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">NO PESERTA</div>
                  <div className="text-xs font-mono font-extrabold text-blue-800">C2026-{selectedKartuSiswa.nisn.slice(-4)}</div>
                </div>
              </div>

              {/* Identity & Photo Grid */}
              <div className="flex gap-3.5 items-start">
                {/* Pasfoto Peserta (3x4 Aspect Ratio) */}
                <div className="w-[84px] h-[112px] shrink-0 border-2 border-slate-900 rounded-lg overflow-hidden bg-slate-100 flex flex-col items-center justify-center relative shadow-sm">
                  {selectedKartuSiswa.fotoUrl ? (
                    <img 
                      src={selectedKartuSiswa.fotoUrl} 
                      alt={selectedKartuSiswa.nama} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                      <User className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500">FOTO 3x4</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/85 text-white text-[7px] text-center font-bold py-0.5 uppercase tracking-wider">
                    Peserta
                  </div>
                </div>

                {/* Identity Grid */}
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Nama Peserta:</span>
                    <span className="font-extrabold text-slate-900 text-sm leading-tight block">{selectedKartuSiswa.nama}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">NISN / NIS:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedKartuSiswa.nisn} / {selectedKartuSiswa.nis}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Kelas / Ruang Ujian:</span>
                    <span className="font-bold text-slate-800">
                      {selectedKartuSiswa.kelas} ({jadwalList.find(j => (j.kelasTarget && (j.kelasTarget.includes(selectedKartuSiswa.kelas) || (selectedKartuSiswa.rombel && j.kelasTarget.includes(selectedKartuSiswa.rombel)))) || j.kelasTarget === 'Semua Tingkat')?.ruang || rombelList.find(r => r.namaRombel === selectedKartuSiswa.kelas || r.namaRombel === selectedKartuSiswa.rombel)?.ruangan || 'Ruang 01'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Password Login CBT:</span>
                    <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
                      CBT#{selectedKartuSiswa.nisn.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Jadwal Ringkas Table */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Jadwal Sesi Ujian Terjadwal:
                </span>
                <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-bold uppercase text-slate-700">
                    <tr>
                      <th className="border border-slate-300 p-1">Tgl / Waktu</th>
                      <th className="border border-slate-300 p-1">Mata Pelajaran</th>
                      <th className="border border-slate-300 p-1">Ruang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList.map(j => (
                      <tr key={j.id}>
                        <td className="border border-slate-300 p-1 font-mono">{j.tanggal} ({j.jamMulai})</td>
                        <td className="border border-slate-300 p-1 font-bold">{j.mataPelajaran}</td>
                        <td className="border border-slate-300 p-1">{j.ruang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Barcode Footer */}
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 text-[9px] text-slate-500">
                <div>
                  <p>Tanda Tangan Kepala Sekolah,</p>
                  <div className="h-7"></div>
                  <p className="font-bold text-slate-900">{schoolSettings?.kepalaSekolah || 'Dr. H. Ahmad Dahlan, M.Pd.'}</p>
                </div>
                <div className="text-center font-mono">
                  <div className="bg-slate-900 text-white font-mono font-extrabold px-3 py-1 tracking-widest text-xs rounded">
                    |||||| |||| ||||| |||||||
                  </div>
                  <div className="mt-0.5 text-[8px]">{selectedKartuSiswa.kodeBarcode || `SIS-${selectedKartuSiswa.nisn}`}</div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedKartuSiswa(null)}
                className="px-4 py-2 bg-[#181818] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintKartuUjian}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" /> Cetak Kartu Peserta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH & EDIT SESI UJIAN CBT */}
      {showJadwalModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingJadwalId ? 'Edit Sesi Ujian CBT' : 'Tambah Sesi Ujian CBT'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Atur jadwal pelaksanaan ujian online, ruang lab, dan guru mata pelajaran
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJadwalModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveJadwal} className="space-y-4 text-xs">
              
              {/* Preset dari Ujian CBT */}
              {ujianList.length > 0 && !editingJadwalId && (
                <div className="p-3.5 bg-[#181818] rounded-xl border border-blue-500/30 space-y-1.5 shadow-sm">
                  <label className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Pilih dari Ujian CBT yang Sudah Dibuat (Opsional):
                  </label>
                  <select
                    value={formJadwal.ujianId}
                    onChange={(e) => handleSelectUjianPreset(e.target.value)}
                    className="w-full bg-[#121212] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-blue-500 outline-none font-medium"
                  >
                    <option value="">-- Buat Sesi Kustom / Mandiri --</option>
                    {ujianList.map(u => (
                      <option key={u.id} value={u.id}>
                        📝 {u.judulUjian} ({u.mataPelajaran} • Kelas {u.kelasTarget})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Memilih ujian CBT akan otomatis mengisi nama sesi, mata pelajaran, kelas target, dan guru mapel terkait.
                  </p>
                </div>
              )}

              {/* Nama Sesi Ujian */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Nama Sesi Ujian <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Penilaian Tengah Semester (PTS) Matematika Kelas X"
                  value={formJadwal.judulUjian}
                  onChange={(e) => setFormJadwal({ ...formJadwal, judulUjian: e.target.value })}
                  className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs focus:border-blue-500 outline-none"
                />
              </div>

              {/* Grid 2: Mapel & Guru Mapel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Mata Pelajaran <span className="text-rose-400">*</span>
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={availableMapelList.includes(formJadwal.mataPelajaran) ? formJadwal.mataPelajaran : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          handleMapelChange(e.target.value);
                        }
                      }}
                      className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {availableMapelList.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="custom">✏️ Tulis Mata Pelajaran Kustom / Lainnya...</option>
                    </select>

                    {/* Jika memilih kustom atau input manual */}
                    {(!availableMapelList.includes(formJadwal.mataPelajaran) || !formJadwal.mataPelajaran) && (
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama mata pelajaran..."
                        value={formJadwal.mataPelajaran}
                        onChange={(e) => handleMapelChange(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-blue-500/50 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Guru Mata Pelajaran (Guru Mapel)
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={
                        guruList.some(g => g.nama === formJadwal.pengawas)
                          ? formJadwal.pengawas
                          : formJadwal.pengawas
                          ? 'custom'
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setFormJadwal({ ...formJadwal, pengawas: e.target.value });
                        }
                      }}
                      className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-blue-500 outline-none font-medium"
                    >
                      <option value="">-- Pilih Guru Mata Pelajaran --</option>
                      {guruList.map(g => (
                        <option key={g.id} value={g.nama}>
                          {g.nama} {g.mataPelajaran ? `(Guru ${g.mataPelajaran})` : ''}
                        </option>
                      ))}
                      <option value="custom">✏️ Tulis Guru Mapel Lainnya...</option>
                    </select>

                    {(formJadwal.pengawas && !guruList.some(g => g.nama === formJadwal.pengawas)) && (
                      <input
                        type="text"
                        placeholder="Ketik nama guru mata pelajaran..."
                        value={formJadwal.pengawas}
                        onChange={(e) => setFormJadwal({ ...formJadwal, pengawas: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-blue-500/50 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 text-xs focus:border-blue-500 outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Kelas / Rombel Target (Multi-Pilihan Ceklis) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-bold text-xs">
                    Kelas / Rombel Target (Bisa Pilih Lebih dari Satu) <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      formJadwal.kelasTarget === 'Semua Kelas' || isAllKelasSelected
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : selectedKelasArray.length > 0
                        ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {formJadwal.kelasTarget === 'Semua Kelas' || isAllKelasSelected
                        ? '🌐 Semua Kelas Terpilih'
                        : selectedKelasArray.length > 0
                        ? `✓ ${selectedKelasArray.length} Kelas Dipilih`
                        : '⚠️ Belum Ada Kelas Dipilih'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllKelasToggle}
                      className="text-[11px] text-slate-400 hover:text-blue-400 underline transition-colors cursor-pointer"
                    >
                      {isAllKelasSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                  </div>
                </div>

                <div className="bg-[#181818] border border-slate-800 rounded-xl p-3 space-y-2.5">
                  {/* Master Toggle: Semua Kelas */}
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141414] hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isAllKelasSelected}
                        onChange={handleSelectAllKelasToggle}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>🌐</span> Semua Kelas (Semua Rombel Terdaftar)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Berlaku otomatis untuk seluruh siswa di semua tingkatan kelas
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {availableKelasList.length} Rombel
                    </span>
                  </label>

                  {/* Grid Checkbox Rombel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {availableKelasList.map(k => {
                      const isChecked = selectedKelasArray.includes(k) || formJadwal.kelasTarget === 'Semua Kelas';
                      const count = siswaList.filter(s => s.kelas && s.kelas.trim().toLowerCase() === k.toLowerCase()).length;
                      return (
                        <label
                          key={k}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-sm'
                              : 'bg-[#141414] border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleKelasCheckbox(k)}
                              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600 shrink-0"
                            />
                            <span className="text-xs font-medium truncate" title={k}>{k}</span>
                          </div>
                          {count > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded shrink-0 ml-1.5">
                              {count} Siswa
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Tambah Kelas / Rombel Kustom */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="+ Tulis nama kelas / rombel kustom..."
                      value={customKelasInput}
                      onChange={(e) => setCustomKelasInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomKelas();
                        }
                      }}
                      className="flex-1 bg-[#121212] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomKelas}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* Chips Preview Rombel yang Dipilih */}
                  {selectedKelasArray.length > 0 && formJadwal.kelasTarget !== 'Semua Kelas' && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400">Rombel Terpilih:</span>
                      {selectedKelasArray.map(k => (
                        <span
                          key={k}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px]"
                        >
                          {k}
                          <button
                            type="button"
                            onClick={() => handleToggleKelasCheckbox(k)}
                            className="hover:text-rose-400 cursor-pointer ml-0.5"
                            title={`Hapus ${k}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 3: Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Tanggal Pelaksanaan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formJadwal.tanggal}
                    onChange={(e) => setFormJadwal({ ...formJadwal, tanggal: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Jam Mulai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formJadwal.jamMulai}
                    onChange={(e) => setFormJadwal({ ...formJadwal, jamMulai: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Jam Selesai <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formJadwal.jamSelesai}
                    onChange={(e) => setFormJadwal({ ...formJadwal, jamSelesai: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Ruang & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Ruang Ujian
                  </label>
                  <input
                    type="text"
                    placeholder="cth: Ruang Ujian 01"
                    value={formJadwal.ruang}
                    onChange={(e) => setFormJadwal({ ...formJadwal, ruang: e.target.value })}
                    className="w-full bg-[#181818] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Status Sesi Ujian
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Aktif', 'Mendatang', 'Selesai'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFormJadwal({ ...formJadwal, status: st })}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          formJadwal.status === st
                            ? st === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                              : st === 'Mendatang'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                              : 'bg-slate-700 text-slate-200 border-slate-600 shadow-sm'
                            : 'bg-[#181818] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          st === 'Aktif' ? 'bg-emerald-400' : st === 'Mendatang' ? 'bg-amber-400' : 'bg-slate-500'
                        }`}></span>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJadwalModal(false)}
                  className="px-4 py-2.5 bg-[#181818] hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingJadwalId ? 'Perbarui Sesi Ujian' : 'Simpan Sesi Ujian'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Sesi Ujian */}
      {deleteTargetJadwal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-rose-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-rose-950/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-base font-bold text-white">Hapus Sesi Ujian CBT?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apakah Anda yakin ingin menghapus sesi ujian ini dari jadwal pelaksanaan CBT?
                </p>
                <div className="p-3 bg-[#181818] rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-rose-300">{deleteTargetJadwal.judulUjian}</div>
                  <div className="text-[11px] text-slate-400">
                    {deleteTargetJadwal.mataPelajaran} • Kelas {deleteTargetJadwal.kelasTarget}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {deleteTargetJadwal.tanggal} ({deleteTargetJadwal.jamMulai} - {deleteTargetJadwal.jamSelesai}) • {deleteTargetJadwal.ruang}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetJadwal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteJadwal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Sesi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
