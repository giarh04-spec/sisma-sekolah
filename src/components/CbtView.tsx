import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, 
  Plus, 
  FileJson, 
  Upload, 
  Sparkles, 
  Play, 
  Clock, 
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
  QrCode
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
  Role,
  CbtSubTab
} from '../types/school';

interface CbtViewProps {
  bankSoalList: BankSoal[];
  setBankSoalList: React.Dispatch<React.SetStateAction<BankSoal[]>>;
  ujianList: UjianCBT[];
  setUjianList: React.Dispatch<React.SetStateAction<UjianCBT[]>>;
  siswaList: Siswa[];
  currentRole?: Role;
  userEmail?: string;
  subTab?: CbtSubTab;
  setSubTab?: (subTab: CbtSubTab) => void;
}

export const CbtView: React.FC<CbtViewProps> = ({
  bankSoalList,
  setBankSoalList,
  ujianList,
  setUjianList,
  siswaList,
  currentRole = 'admin',
  userEmail = '',
  subTab: externalSubTab,
  setSubTab: externalSetSubTab
}) => {
  const [internalSubTab, setInternalSubTab] = useState<CbtSubTab>('bank_soal');
  const subTab = externalSubTab !== undefined ? externalSubTab : internalSubTab;
  const setSubTab = externalSetSubTab || setInternalSubTab;

  useEffect(() => {
    if (currentRole === 'guru' && subTab === 'jadwal_kartu') {
      setSubTab('bank_soal');
    }
  }, [currentRole, subTab]);

  // --- Jadwal Ujian State ---
  const [jadwalList, setJadwalList] = useState<JadwalUjianItem[]>([
    {
      id: 'jdw-01',
      ujianId: 'uj-01',
      judulUjian: 'Penilaian Tengah Semester (PTS) Matematika Kelas X',
      mataPelajaran: 'Matematika Tingkat Lanjut',
      kelasTarget: 'X-IPA-1',
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
      judulUjian: 'PTS Bahasa Indonesia Fase E',
      mataPelajaran: 'Bahasa Indonesia',
      kelasTarget: 'X-IPA-1',
      tanggal: '2026-08-01',
      jamMulai: '09:30',
      jamSelesai: '11:00',
      ruang: 'Lab Komputer 01',
      pengawas: 'Rian Hidayat, S.Pd.',
      status: 'Mendatang'
    }
  ]);

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
      bobot: Number(newBobot)
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
    alert('Soal baru berhasil ditambahkan ke Bank Soal!');
  };

  // --- AI Generator State ---
  const [aiMapel, setAiMapel] = useState('Fisika');
  const [aiKelas, setAiKelas] = useState('X-IPA-1');
  const [aiTopik, setAiTopik] = useState('Hukum Newton & Gravitasi');
  const [aiJumlah, setAiJumlah] = useState(4);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAi = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaran: aiMapel,
          kelas: aiKelas,
          topik: aiTopik,
          jumlahSoal: aiJumlah
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
          kelas: aiKelas,
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

  // --- Anti-Cheat Monitoring State ---
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatAlert, setShowCheatAlert] = useState(false);
  const [cheatLogs, setCheatLogs] = useState<string[]>([]);

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
            {subTab === 'ai_generator' && 'AI Generator Soal'}
            {subTab === 'simulasi_ujian' && 'Simulasi CBT Anti-Cheat'}
          </span>
        </div>
      </div>

      {/* SUBTAB JADWAL & KARTU PESERTA UJIAN */}
      {subTab === 'jadwal_kartu' && (
        <div className="space-y-6">
          
          {/* Jadwal Ujian List */}
          <div className="bg-[#121212] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" /> Jadwal Pelaksanaan Ujian CBT 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar sesi ujian online, jadwal ruang lab komputer, dan pengawas
                </p>
              </div>

              <button
                onClick={() => alert('Jadwal ujian baru telah disinkronkan dengan aplikasi seluruh siswa!')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
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
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Tanggal & Waktu</th>
                    <th className="px-4 py-3">Ruang / Pengawas</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {jadwalList.map(j => (
                    <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{j.judulUjian}</td>
                      <td className="px-4 py-3 text-blue-400 font-semibold">{j.mataPelajaran}</td>
                      <td className="px-4 py-3 font-mono font-bold">{j.kelasTarget}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {j.tanggal} ({j.jamMulai} - {j.jamSelesai})
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        <div>{j.ruang}</div>
                        <div className="text-[10px] text-slate-500">Pengawas: {j.pengawas}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          j.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  className="p-4 bg-[#181818] rounded-xl border border-slate-800 flex items-center justify-between hover:border-purple-500/40 transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300">{siswa.nama}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">NISN: {siswa.nisn} | Kelas {siswa.kelas}</div>
                    <div className="text-[9px] font-mono text-purple-400 mt-1">No Peserta: C2026-{siswa.nisn.slice(-4)}</div>
                  </div>

                  <button
                    onClick={() => setSelectedKartuSiswa(siswa)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
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
            <Sparkles className="w-5 h-5" /> Gemini AI Question Generator (4 Tipe Soal)
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Hasilkan set soal Ujian CBT otomatis berisi Pilihan Ganda (PG), Pilihan Ganda Kompleks (MC &gt; 1 jawaban), Isian Singkat, dan Esai lengkap dengan pembahasan dan kunci jawaban!
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Mata Pelajaran</label>
              <input 
                type="text" 
                value={aiMapel} 
                onChange={e => setAiMapel(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Kelas Target</label>
                <input 
                  type="text" 
                  value={aiKelas} 
                  onChange={e => setAiKelas(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700">Jumlah Soal</label>
                <input 
                  type="number" 
                  min={1}
                  max={10}
                  value={aiJumlah} 
                  onChange={e => setAiJumlah(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" 
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Topik / Bahasan Soal</label>
              <input 
                type="text" 
                value={aiTopik} 
                onChange={e => setAiTopik(e.target.value)}
                className="w-full p-2 bg-slate-50 border rounded-lg text-xs" 
              />
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
                <span className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Main Question Display */}
              <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                
                {/* Exam Top Status */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      SOAL NO #{soalIndex + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{currentExam?.judul}</h3>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-mono text-xs font-bold">
                    <Clock className="w-4 h-4" /> 01:29:45
                  </div>
                </div>

                {/* Question Body */}
                {currentSoal ? (
                  <div className="space-y-4 py-2">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 leading-relaxed font-semibold">
                      {currentSoal.pertanyaan}
                    </div>

                    {/* Answer Inputs based on Question Type */}
                    {(currentSoal.tipe === 'pg' || currentSoal.tipe === 'multiple_choice') && currentSoal.opsi && (
                      <div className="space-y-2">
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
                              className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-bold shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-full bg-slate-900/10 flex items-center justify-center font-bold text-xs">
                                {o.id}
                              </span>
                              <span>{o.teks}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentSoal.tipe === 'isian' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Ketikkan Jawaban Singkat Anda:</label>
                        <input
                          type="text"
                          value={(siswaJawaban[currentSoal.id]?.jawaban as string) || ''}
                          onChange={e => handleAnswerSelect(currentSoal.id, e.target.value)}
                          placeholder="Masukkan jawaban..."
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                        />
                      </div>
                    )}

                    {currentSoal.tipe === 'esai' && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Tuliskan Jawaban Uraian / Esai Anda secara Lengkap:</label>
                        <textarea
                          rows={4}
                          value={(siswaJawaban[currentSoal.id]?.jawaban as string) || ''}
                          onChange={e => handleAnswerSelect(currentSoal.id, e.target.value)}
                          placeholder="Ketikkan uraian penjelas..."
                          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                        />
                      </div>
                    )}

                    {/* Bottom Question Controls */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <button
                        onClick={() => toggleRaguRagu(currentSoal.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          siswaJawaban[currentSoal.id]?.raguRagu
                            ? 'bg-amber-500 text-slate-950 border-amber-600'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        {siswaJawaban[currentSoal.id]?.raguRagu ? '✓ Ragu-Ragu (Aktif)' : 'Tandai Ragu-Ragu'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={soalIndex === 0}
                          onClick={() => setSoalIndex(prev => prev - 1)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Sebelum
                        </button>
                        <button
                          disabled={soalIndex === (currentExam?.daftarSoal.length || 1) - 1}
                          onClick={() => setSoalIndex(prev => prev + 1)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          Berikut <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ) : null}

              </div>

              {/* Right: Question Navigation Grid & Submit */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-2">
                  Navigasi Soal Ujian
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  {currentExam?.daftarSoal.map((s, idx) => {
                    const hasAnswer = siswaJawaban[s.id]?.jawaban;
                    const isRagu = siswaJawaban[s.id]?.raguRagu;

                    return (
                      <button
                        key={s.id}
                        onClick={() => setSoalIndex(idx)}
                        className={`p-2.5 rounded-xl font-bold text-xs transition-all border ${
                          soalIndex === idx
                            ? 'border-slate-900 ring-2 ring-slate-900'
                            : 'border-slate-200'
                        } ${
                          isRagu
                            ? 'bg-amber-400 text-slate-950 font-extrabold'
                            : hasAnswer
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleFinishExam}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md mt-4"
                >
                  Selesaikan & Submit Ujian
                </button>
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

      {/* MODAL ADD MANUAL QUESTION */}
      {showAddSoalModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-200 pb-3">Input Soal Baru Manual</h3>

            <form onSubmit={handleAddSoal} className="space-y-4">
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

              <div>
                <label className="text-xs font-extrabold text-slate-800 mb-1 block">Bobot Poin Soal</label>
                <input type="number" value={newBobot} onChange={e => setNewBobot(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddSoalModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all">Simpan Soal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP CHEAT ALERT MODAL */}
      {showCheatAlert && (
        <div className="fixed inset-0 bg-rose-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">PERINGATAN KECURANGAN CBT!</h3>
              <p className="text-xs text-rose-300 mt-1">
                Sistem mendeteksi Anda mencoba membuka aplikasi/tab lain atau keluar dari fokus layar ujian.
              </p>
            </div>

            <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-800 text-rose-200 font-mono text-xs font-bold">
              Status Pelanggaran: {cheatCount} / 3
            </div>

            <p className="text-[11px] text-slate-400">
              {cheatCount >= 3 
                ? 'Batas maksimal pelanggaran telah terlampaui. Ujian telah di-submit secara otomatis!' 
                : 'Peringatan: Apabila mencapai 3 kali pelanggaran, sistem akan otomatis mengunci dan me-submit ujian Anda!'}
            </p>

            <button
              onClick={() => setShowCheatAlert(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
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
                <div className="w-12 h-12 bg-slate-900 rounded-xl text-white font-bold flex items-center justify-center text-xl shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-wide leading-tight">KARTU PESERTA & JADWAL UJIAN CBT 2026</h4>
                  <p className="text-[10px] font-bold text-slate-600">SMA PERMATA BANGSA • SEMESTER GANJIL</p>
                  <p className="text-[9px] text-slate-500">Jl. Education No. 123 • Telp: (021) 555-0199</p>
                </div>
                <div className="text-right border-l-2 border-slate-900 pl-3">
                  <div className="text-[9px] font-bold text-slate-500 uppercase">NO PESERTA</div>
                  <div className="text-xs font-mono font-extrabold text-blue-800">C2026-{selectedKartuSiswa.nisn.slice(-4)}</div>
                </div>
              </div>

              {/* Identity Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Nama Peserta:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedKartuSiswa.nama}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">NISN / NIS:</span>
                  <span className="font-mono font-bold">{selectedKartuSiswa.nisn} / {selectedKartuSiswa.nis}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Kelas / Ruang Lab:</span>
                  <span className="font-bold">{selectedKartuSiswa.kelas} (Ruang Lab 01)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Password Login CBT:</span>
                  <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    CBT#{selectedKartuSiswa.nisn.slice(-4)}
                  </span>
                </div>
              </div>

              {/* Jadwal Ringkas Table */}
              <div className="pt-2">
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
                  <div className="h-8"></div>
                  <p className="font-bold text-slate-900">Dr. H. Ahmad Dahlan, M.Pd.</p>
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

    </div>
  );
};
