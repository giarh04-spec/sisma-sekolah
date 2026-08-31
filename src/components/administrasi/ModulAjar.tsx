import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Save, 
  ChevronLeft, 
  Download, 
  Plus, 
  Trash2, 
  Search, 
  FilePlus,
  Loader2,
  ChevronRight,
  User,
  BookOpen,
  Layout,
  Users,
  Target,
  Sparkles,
  ClipboardCheck,
  RotateCcw
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ModulAjarData, InclusionStudent, KKTPTerdiferensiasi } from '../../types/modulAjar';

const COLLECTION_NAME = 'edu_modulAjarList';

const initialModulAjar: Omit<ModulAjarData, 'id' | 'authorId' | 'updatedAt'> = {
  identitas: {
    namaPenyusun: 'Aulia Safitri, S.Pd',
    namaSekolah: 'SMP Islam Modern Al Fakhir',
    mataPelajaran: 'Matematika',
    faseKelas: 'D/VII',
    semester: 'I (Ganjil)',
    materiPokok: 'Aritmatika Sosial',
    alokasiWaktu: '2 x 40 menit (4x pertemuan)',
    tahunPelajaran: '2026-2027',
  },
  identifikasi: {
    muridDeskripsi: 'Peserta didik kelas VII pada umumnya sudah mengenal konsep jual beli, untung, dan rugi dari pengalaman sehari-hari serta pembelajaran matematika di jenjang SD (operasi hitung bilangan bulat dan pecahan, serta konsep persen sederhana). Namun, sebagian besar murid belum terbiasa menghubungkan perhitungan tersebut dengan istilah baku aritmetika sosial (harga beli, harga jual, persentase untung/rugi, diskon, bruto neto-tara, pajak, dan bunga tunggal). Murid senang belajar melalui simulasi praktik langsung (role play jual beli), suka bekerja dalam kelompok, tertarik pada kegiatan wirausaha sederhana, dan lebih bersemangat jika pembelajaran dikaitkan dengan konteks nyata serta nilai-nilai keislaman yang mereka pelajari di mata pelajaran Pendidikan Agama Islam.',
    inclusionStudents: [
      {
        no: 1,
        nama: "Gendis",
        kebutuhan: "Disleksia ringan",
        karakteristik: "Kesulitan membaca soal cerita panjang",
        akomodasi: "Soal cerita disederhanakan & dibacakan; diberi waktu tambahan; gunakan ilustrasi gambar",
        pendamping: "GPK*, 2x/minggu"
      },
      {
        no: 2,
        nama: "Afkar",
        kebutuhan: "ADHD (Perhatian & Konsentrasi)",
        karakteristik: "Mudah teralihkan, butuh instruksi bertahap",
        akomodasi: "Instruksi dipecah per langkah; posisi duduk di depan; jeda gerak (brain break) tiap 15 menit",
        pendamping: "Kolaborasi wali kelas"
      },
      {
        no: 3,
        nama: "Nesya",
        kebutuhan: "Slow Learner",
        karakteristik: "Butuh waktu lebih lama memahami konsep",
        akomodasi: "Modul diberi tahap perhitungan lebih rinci; latihan soal dikurangi jumlah namun ditambah pengulangan; pendampingan tutor sebaya",
        pendamping: "Tutor sebaya + guru"
      }
    ]
  },
  materi: 'Aritmetika Sosial (Harga Pembelian, Harga Penjualan, Untung, Rugi, Persentase Untung/Rugi, Diskon, Bruto-Neto-Tara, Pajak, dan Bunga Tunggal)',
  dimensiProfil: [
    'Keimanan dan Ketakwaan terhadap Tuhan YME: menerapkan kejujuran dan keadilan dalam bertransaksi sesuai tuntunan Islam.',
    'Bernalar Kritis: menganalisis untung, rugi, dan kewajaran harga dalam sebuah transaksi.',
    'Kreatif: merancang produk dan strategi harga dalam proyek simulasi usaha kelas.',
    'Kolaborasi: bekerja sama dalam kelompok menyelesaikan proyek wirausaha kelas.'
  ],
  desainPembelajaran: {
    capaianElemen: 'Peserta didik dapat menggunakan rasio dan proporsi untuk menyelesaikan masalah aritmetika sosial (harga penjualan, pembelian, untung, rugi, diskon, pajak, bruto, neto, tara, dan bunga tunggal) dalam kehidupan sehari-hari.',
    lintasDisiplin: 'Pendidikan Agama Islam (adab jual beli, kejujuran, larangan riba, zakat perdagangan) dan Ilmu Pengetahuan Sosial/Prakarya (konsep kewirausahaan dan ekonomi kreatif).',
    tujuanPembelajaran: 'Setelah pembelajaran yang kreatif, bernalar kritis, dan berkolaborasi, murid mampu menyelesaikan masalah aritmetika sosial serta merancang simulasi usaha yang menerapkan prinsip jual beli yang jujur dan sesuai nilai-nilai Islam.',
    kktpRegular: [
      'Menentukan harga pembelian, harga penjualan, besar untung atau rugi dari sebuah transaksi. (Unistruktural)',
      'Menghitung persentase untung, rugi, diskon, pajak, bunga tunggal, serta bruto, neto, dan tara. (Multistruktural)',
      "Merancang dan menganalisis simulasi usaha (proyek 'Toko Kelas Barokah') yang menerapkan prinsip jual beli jujur dan menghitung zakat perdagangan dari keuntungan yang diperoleh. (Relasional)"
    ],
    kktpTerdiferensiasi: [
      {
        nama: "Gendis",
        kebutuhan: "Disleksia ringan",
        kktp: "Dengan soal cerita yang disederhanakan, dibacakan, dan dibantu ilustrasi gambar, murid mampu menentukan harga beli, harga jual, serta untung/rugi dari satu transaksi sederhana.",
        targetSolo: "Unistruktural"
      },
      {
        nama: "Afkar",
        kebutuhan: "ADHD",
        kktp: "Dengan instruksi yang dipecah bertahap dan jeda gerak tiap 15 menit, murid mampu menentukan harga jual/beli dan menghitung persentase untung, rugi, atau diskon dengan bimbingan langkah demi langkah.",
        targetSolo: "Multistruktural"
      }
    ],
    topik: 'Aritmetika Sosial',
    praktikPedagogis: 'Project Based Learning (PJBL)',
    lingkungan: 'ruang kelas dan koperasi/kantin sekolah',
    pemanfaatanDigital: 'LCD proyektor, Quizizz/Google Form, kalkulator, aplikasi desain sederhana (Canva) untuk label harga produk',
    integrasiNilaiIslami: 'QS. An-Nisa (4): 29, QS. Al-Baqarah (2): 275, QS. Al-Muthaffifin (83): 1–3, HR. Tirmidzi',
    zakatPerdagangan: 'Peserta didik diajak menghitung zakat sebesar 2,5% dari keuntungan bersih proyek simulasi usaha sebagai penerapan nyata aritmetika sosial yang bernilai ibadah.'
  },
  pengalamanBelajar: {
    pendahuluan: [
      'Salam dan berdoa (dipimpin murid secara bergantian)',
      'Apersepsi dan motivasi: mengaitkan materi dengan kisah keteladanan Nabi Muhammad SAW sebagai pedagang yang dikenal jujur (Al-Amin)',
      'Presensi',
      'Menyampaikan pertanyaan pemantik: "Pernahkah kalian membantu orang tua berjualan atau berbelanja di pasar/koperasi sekolah?"'
    ],
    kegiatanInti: [
      'Pertemuan 1 — Memahami: Guru menayangkan video singkat tentang kisah kejujuran Nabi Muhammad SAW dalam berdagang',
      'Pertemuan 2–3 — Mengaplikasi (bermakna): Proyek: "Toko Kelas Barokah" — merancang simulasi usaha kelompok dengan menerapkan prinsip jual beli yang jujur sesuai nilai Islam.',
      'Murid dibentuk beberapa kelompok terdiri atas 4–5 orang',
      'Tiap kelompok memilih satu jenis produk sederhana (alat tulis, makanan ringan halal, kerajinan, dll.)',
      'Murid berdiskusi menjawab pertanyaan harga beli, harga jual wajar, diskon, dan zakat.'
    ],
    penutup: [
      'Merefleksi — Evaluasi Pengalaman Belajar',
      'Tindak Lanjut: guru memberikan tugas rumah menghitung untung, rugi, dan zakat dari sebuah simulasi transaksi di rumah masing-masing.'
    ]
  }
};

export const ModulAjar: React.FC = () => {
  const [modules, setModules] = useState<ModulAjarData[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModulAjarData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'identitas' | 'murid' | 'desain' | 'kegiatan'>('identitas');

  const [formData, setFormData] = useState<Omit<ModulAjarData, 'id' | 'authorId' | 'updatedAt'>>(initialModulAjar);

  useEffect(() => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ModulAjarData[];
      setModules(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateNew = () => {
    setSelectedModule(null);
    setFormData(initialModulAjar);
    setIsEditing(true);
    setActiveTab('identitas');
  };

  const handleSelectModule = (mod: ModulAjarData) => {
    setSelectedModule(mod);
    setFormData({
      identitas: mod.identitas,
      identifikasi: mod.identifikasi,
      materi: mod.materi || '',
      dimensiProfil: mod.dimensiProfil || [],
      desainPembelajaran: mod.desainPembelajaran,
      pengalamanBelajar: mod.pengalamanBelajar || { pendahuluan: [], kegiatanInti: [], penutup: [] }
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Anda harus login untuk menyimpan data.');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        authorId: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (selectedModule) {
        await updateDoc(doc(db, COLLECTION_NAME, selectedModule.id), dataToSave);
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
        setSelectedModule({ id: docRef.id, ...dataToSave } as ModulAjarData);
      }
      setIsEditing(false);
      alert('Modul Ajar berhasil disimpan!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) return;
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      if (selectedModule?.id === id) {
        setSelectedModule(null);
        setIsEditing(false);
      }
      alert('Modul Ajar berhasil dihapus.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    }
  };

  const updateIdentitas = (field: keyof typeof formData.identitas, value: string) => {
    setFormData(prev => ({
      ...prev,
      identitas: { ...prev.identitas, [field]: value }
    }));
  };

  const updateDesain = (field: keyof typeof formData.desainPembelajaran, value: any) => {
    setFormData(prev => ({
      ...prev,
      desainPembelajaran: { ...prev.desainPembelajaran, [field]: value }
    }));
  };

  const filteredModules = modules.filter(m => 
    m.identitas.materiPokok.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.identitas.mataPelajaran.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
        activeTab === id 
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20' 
          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 gap-6 p-4 lg:p-6 print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .lg\\:w-80, .sticky, button, nav, aside, [role="navigation"], .lg\\:flex-row > div:first-child { display: none !important; }
          .flex-1 { width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .bg-slate-50 { background-color: white !important; }
          .shadow-2xl { box-shadow: none !important; border: none !important; }
          body { background-color: white !important; }
          .max-w-5xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .rounded-sm { border-radius: 0 !important; border: none !important; }
          .min-h-[1400px] { min-height: auto !important; padding: 0 !important; }
        }
      `}} />
      
      {/* Sidebar List */}
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Daftar Modul
            </h3>
            <button 
              onClick={handleCreateNew}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Buat Modul Baru"
            >
              <FilePlus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari materi/mapel..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredModules.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400">Belum ada modul ajar.</p>
            </div>
          ) : (
            filteredModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`w-full text-left p-3 rounded-xl transition-all group border ${
                  selectedModule?.id === mod.id 
                    ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/10' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    selectedModule?.id === mod.id ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {mod.identitas.mataPelajaran}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(mod.id);
                      }}
                      className="p-1 hover:text-rose-600 text-slate-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-black text-slate-800 line-clamp-1 mb-1">
                  {mod.identitas.materiPokok}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold text-slate-500">Kelas {mod.identitas.faseKelas}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${selectedModule?.id === mod.id ? 'translate-x-1 text-emerald-500' : 'text-slate-300'}`} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Editor Controls */}
        {isEditing && (
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
            <TabButton id="identitas" label="A. Identitas" icon={Layout} />
            <TabButton id="murid" label="B. Identifikasi" icon={Users} />
            <TabButton id="desain" label="C. Desain" icon={Target} />
            <TabButton id="kegiatan" label="D. Kegiatan" icon={Sparkles} />
            
            <div className="ml-auto flex items-center gap-2 pl-4 border-l border-slate-100">
               <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                title="Batal"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isEditing && selectedModule && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Mode Tampilan Dokumen</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SMP Islam Modern Al Fakhir</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-md"
              >
                Edit Dokumen
              </button>
              <button 
                onClick={() => window.print()}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                title="Cetak / Simpan PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* The Official Document Canvas */}
        <div className="bg-white shadow-2xl rounded-sm border border-slate-300 min-h-[1400px] p-[1.5cm] md:p-[2cm] relative overflow-hidden mx-auto max-w-5xl">
          
          {/* Official School Letterhead (Kop Surat Resmi) */}
          <div className="mb-10 relative border-b-[3px] border-slate-900 pb-2">
            <div className="flex items-center justify-center gap-8">
              {/* School Logo */}
              <div className="shrink-0 w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center p-3 shadow-sm border-2 border-slate-900">
                <Sparkles className="w-14 h-14 text-white" />
              </div>
              
              {/* Header Text */}
              <div className="text-center space-y-0.5">
                <h4 className="text-xs font-bold text-slate-700 tracking-[0.15em] uppercase">Yayasan Pendidikan Islam Modern Al Fakhir</h4>
                <h1 className="text-3xl font-black text-emerald-800 tracking-tighter uppercase leading-tight py-0.5">SMP Islam Modern Al Fakhir</h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  NPSN: 70034821 | Status Akreditasi A (Unggul) | Izin Operasional: 421.3/2882-Disdik/2026
                </p>
                <p className="text-[9px] font-medium text-slate-500">
                  Jl. Pesantren Luhur No. 45, Kebayoran Baru, Jakarta Selatan 12140
                </p>
                <p className="text-[9px] font-medium text-slate-500">
                  Telp: (021) 7223456 | Website: www.alfakhir.sch.id | Email: info@alfakhir.sch.id
                </p>
              </div>

              {/* Spacer for symmetry (or second logo like Kemendikbud) */}
              <div className="shrink-0 w-24 h-24 opacity-0 invisible md:visible"></div> 
            </div>
            {/* Traditional official double line */}
            <div className="absolute bottom-[-6px] left-0 w-full border-b border-slate-900"></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 underline underline-offset-4 decoration-2 uppercase tracking-tight">Modul Ajar Berdiferensiasi</h2>
            <p className="text-xs font-black text-slate-500 mt-1.5 uppercase tracking-[0.25em]">Kurikulum Merdeka Tahun Pelajaran 2026 / 2027</p>
          </div>

          {/* DOCUMENT CONTENT */}
          <div className="space-y-8">
            
            {/* A. IDENTITAS */}
            <div className={isEditing && activeTab !== 'identitas' ? 'hidden' : ''}>
              <div className="bg-[#92D050] border-2 border-slate-900 px-4 py-1.5 mb-1">
                <h3 className="font-black text-slate-900 uppercase italic text-sm">A. IDENTITAS</h3>
              </div>
              <div className="border-2 border-slate-900 grid grid-cols-[1.2fr_2fr]">
                {[
                  { label: "Nama Penyusun", key: "namaPenyusun" },
                  { label: "Nama Sekolah", key: "namaSekolah" },
                  { label: "Mata Pelajaran", key: "mataPelajaran" },
                  { label: "Fase/Kelas", key: "faseKelas" },
                  { label: "Semester", key: "semester" },
                  { label: "Materi Pokok", key: "materiPokok" },
                  { label: "Alokasi Waktu", key: "alokasiWaktu" },
                  { label: "Tahun Pelajaran", key: "tahunPelajaran" },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="border-r-2 border-b-2 last:border-b-0 border-slate-900 bg-[#FFFF00] p-2 text-xs font-black text-slate-900 flex items-center">
                      {item.label}
                    </div>
                    <div className="border-b-2 last:border-b-0 border-slate-900 p-1 text-xs font-bold text-slate-800">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={formData.identitas[item.key as keyof typeof formData.identitas]}
                          onChange={(e) => updateIdentitas(item.key as any, e.target.value)}
                          className="w-full bg-white border-none focus:ring-2 focus:ring-emerald-500 p-2 rounded font-bold"
                        />
                      ) : (
                        <span className="p-2 block">{formData.identitas[item.key as keyof typeof formData.identitas]}</span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* B. IDENTIFIKASI */}
            <div className={isEditing && activeTab !== 'murid' ? 'hidden' : ''}>
              <div className="bg-[#92D050] border-2 border-slate-900 px-4 py-1.5 mb-2">
                <h3 className="font-black text-slate-900 uppercase italic text-sm">B. IDENTIFIKASI</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-slate-900 text-xs mb-2 underline flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> 1. Murid
                  </h4>
                  {isEditing ? (
                    <textarea 
                      value={formData.identifikasi.muridDeskripsi}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        identifikasi: { ...prev.identifikasi, muridDeskripsi: e.target.value } 
                      }))}
                      className="w-full text-xs text-justify leading-relaxed font-bold text-slate-800 bg-white border-2 border-slate-900 p-3 focus:ring-0"
                      rows={6}
                    />
                  ) : (
                    <p className="text-xs text-justify leading-relaxed font-bold text-slate-800 p-1">
                      {formData.identifikasi.muridDeskripsi}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-slate-900 text-xs italic underline">Data Peserta Didik Inklusi</h4>
                    {isEditing && (
                      <button 
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          identifikasi: {
                            ...prev.identifikasi,
                            inclusionStudents: [
                              ...prev.identifikasi.inclusionStudents,
                              { no: prev.identifikasi.inclusionStudents.length + 1, nama: '', kebutuhan: '', karakteristik: '', akomodasi: '', pendamping: '' }
                            ]
                          }
                        }))}
                        className="text-[10px] font-black text-emerald-600 underline"
                      >
                        + Tambah Siswa
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border-2 border-slate-900 p-2 font-black uppercase w-8">No</th>
                          <th className="border-2 border-slate-900 p-2 font-black uppercase w-32">Nama</th>
                          <th className="border-2 border-slate-900 p-2 font-black uppercase">Jenis Kebutuhan</th>
                          <th className="border-2 border-slate-900 p-2 font-black uppercase">Karakteristik</th>
                          <th className="border-2 border-slate-900 p-2 font-black uppercase">Akomodasi / Modifikasi</th>
                          <th className="border-2 border-slate-900 p-2 font-black uppercase w-32">Pendamping</th>
                          {isEditing && <th className="border-2 border-slate-900 p-2 font-black uppercase w-8"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.identifikasi.inclusionStudents.map((s, idx) => (
                          <tr key={idx}>
                            <td className="border-2 border-slate-900 p-2 text-center font-black">{idx + 1}</td>
                            <td className="border-2 border-slate-900 p-2">
                              {isEditing ? (
                                <input 
                                  value={s.nama} 
                                  onChange={e => {
                                    const newList = [...formData.identifikasi.inclusionStudents];
                                    newList[idx].nama = e.target.value;
                                    setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] font-black focus:ring-0"
                                />
                              ) : <span className="font-black">{s.nama}</span>}
                            </td>
                            <td className="border-2 border-slate-900 p-2">
                              {isEditing ? (
                                <input 
                                  value={s.kebutuhan} 
                                  onChange={e => {
                                    const newList = [...formData.identifikasi.inclusionStudents];
                                    newList[idx].kebutuhan = e.target.value;
                                    setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] font-bold focus:ring-0"
                                />
                              ) : <span className="font-bold">{s.kebutuhan}</span>}
                            </td>
                            <td className="border-2 border-slate-900 p-2">
                               {isEditing ? (
                                <textarea 
                                  value={s.karakteristik} 
                                  onChange={e => {
                                    const newList = [...formData.identifikasi.inclusionStudents];
                                    newList[idx].karakteristik = e.target.value;
                                    setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] italic focus:ring-0"
                                />
                              ) : <span className="italic">{s.karakteristik}</span>}
                            </td>
                            <td className="border-2 border-slate-900 p-2">
                               {isEditing ? (
                                <textarea 
                                  value={s.akomodasi} 
                                  onChange={e => {
                                    const newList = [...formData.identifikasi.inclusionStudents];
                                    newList[idx].akomodasi = e.target.value;
                                    setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] focus:ring-0 text-justify"
                                />
                              ) : <span className="text-justify">{s.akomodasi}</span>}
                            </td>
                            <td className="border-2 border-slate-900 p-2">
                               {isEditing ? (
                                <input 
                                  value={s.pendamping} 
                                  onChange={e => {
                                    const newList = [...formData.identifikasi.inclusionStudents];
                                    newList[idx].pendamping = e.target.value;
                                    setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                  }}
                                  className="w-full bg-transparent border-none p-0 text-[10px] font-black focus:ring-0"
                                />
                              ) : <span className="font-black">{s.pendamping}</span>}
                            </td>
                            {isEditing && (
                              <td className="border-2 border-slate-900 p-2 text-center">
                                <button onClick={() => {
                                   const newList = formData.identifikasi.inclusionStudents.filter((_, i) => i !== idx);
                                   setFormData(p => ({ ...p, identifikasi: { ...p.identifikasi, inclusionStudents: newList } }));
                                }} className="text-rose-500">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                   <h4 className="font-black text-slate-900 text-xs mb-2 underline flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> 2. Materi
                  </h4>
                  {isEditing ? (
                    <textarea 
                      value={formData.materi}
                      onChange={(e) => setFormData(p => ({ ...p, materi: e.target.value }))}
                      className="w-full text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 p-3 focus:ring-0"
                      rows={2}
                    />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 p-1">{formData.materi}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-xs mb-2 underline flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> 3. Dimensi Profil Lulusan
                  </h4>
                  <div className="pl-4 space-y-1">
                    {formData.dimensiProfil.map((dim, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <span className="text-xs font-black">{String.fromCharCode(97 + idx)}.</span>
                        {isEditing ? (
                          <input 
                            value={dim}
                            onChange={e => {
                              const newList = [...formData.dimensiProfil];
                              newList[idx] = e.target.value;
                              setFormData(p => ({ ...p, dimensiProfil: newList }));
                            }}
                            className="flex-1 bg-transparent border-none p-0 text-xs font-bold focus:ring-0"
                          />
                        ) : <span className="text-xs font-bold text-slate-800">{dim}</span>}
                      </div>
                    ))}
                    {isEditing && (
                      <button 
                        onClick={() => setFormData(p => ({ ...p, dimensiProfil: [...p.dimensiProfil, ''] }))}
                        className="text-[10px] font-black text-emerald-600 underline mt-2"
                      >
                        + Tambah Dimensi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* C. DESAIN PEMBELAJARAN */}
            <div className={isEditing && activeTab !== 'desain' ? 'hidden' : ''}>
              <div className="bg-[#92D050] border-2 border-slate-900 px-4 py-1.5 mb-2">
                <h3 className="font-black text-slate-900 uppercase italic text-sm">C. DESAIN PEMBELAJARAN</h3>
              </div>
              <div className="space-y-6">
                <div>
                   <h4 className="font-black text-slate-900 text-xs mb-2 underline">1. Capaian Pembelajaran:</h4>
                   <div className="pl-4 space-y-4">
                      <div>
                        <span className="font-black text-xs block mb-1">a. Elemen: Bilangan</span>
                        {isEditing ? (
                          <textarea 
                            value={formData.desainPembelajaran.capaianElemen}
                            onChange={e => updateDesain('capaianElemen', e.target.value)}
                            className="w-full text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 p-2 focus:ring-0"
                            rows={3}
                          />
                        ) : <p className="text-xs font-bold text-slate-800 leading-relaxed">{formData.desainPembelajaran.capaianElemen}</p>}
                      </div>
                      <div>
                        <span className="font-black text-xs block mb-1">b. Lintas Disiplin Ilmu:</span>
                        {isEditing ? (
                          <textarea 
                            value={formData.desainPembelajaran.lintasDisiplin}
                            onChange={e => updateDesain('lintasDisiplin', e.target.value)}
                            className="w-full text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 p-2 focus:ring-0 italic"
                            rows={2}
                          />
                        ) : <p className="text-xs font-bold text-slate-800 italic">{formData.desainPembelajaran.lintasDisiplin}</p>}
                      </div>
                      <div>
                        <span className="font-black text-xs block mb-1">c. Tujuan Pembelajaran:</span>
                        {isEditing ? (
                          <textarea 
                            value={formData.desainPembelajaran.tujuanPembelajaran}
                            onChange={e => updateDesain('tujuanPembelajaran', e.target.value)}
                            className="w-full text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 p-2 focus:ring-0"
                            rows={3}
                          />
                        ) : <p className="text-xs font-bold text-slate-800">{formData.desainPembelajaran.tujuanPembelajaran}</p>}
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="font-black text-slate-900 text-xs mb-2 underline italic">d. KKTP :</h4>
                   <div className="pl-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                           <span className="font-black text-xs italic">Regular :</span>
                           {isEditing && <button onClick={() => updateDesain('kktpRegular', [...formData.desainPembelajaran.kktpRegular, ''])} className="text-[10px] font-black text-emerald-600 underline">+ Tambah</button>}
                        </div>
                        <div className="space-y-2">
                           {formData.desainPembelajaran.kktpRegular.map((k, idx) => (
                             <div key={idx} className="flex gap-2">
                               <span className="text-xs font-black">{idx + 1})</span>
                               {isEditing ? (
                                  <textarea 
                                    value={k}
                                    onChange={e => {
                                      const newList = [...formData.desainPembelajaran.kktpRegular];
                                      newList[idx] = e.target.value;
                                      updateDesain('kktpRegular', newList);
                                    }}
                                    className="flex-1 bg-transparent border-none p-0 text-xs font-bold focus:ring-0"
                                  />
                               ) : <span className="text-xs font-bold text-slate-800">{k}</span>}
                             </div>
                           ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <span className="font-black text-xs italic underline">Terdiferensiasi (Peserta Didik Inklusi)</span>
                           {isEditing && <button onClick={() => updateDesain('kktpTerdiferensiasi', [...formData.desainPembelajaran.kktpTerdiferensiasi, { nama: '', kebutuhan: '', kktp: '', targetSolo: '' }])} className="text-[10px] font-black text-emerald-600 underline">+ Tambah</button>}
                        </div>
                        <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
                           <thead className="bg-slate-100">
                             <tr>
                               <th className="border-2 border-slate-900 p-2 font-black uppercase w-32">Nama / Kebutuhan</th>
                               <th className="border-2 border-slate-900 p-2 font-black uppercase">KKTP yang Disesuaikan</th>
                               <th className="border-2 border-slate-900 p-2 font-black uppercase w-32">Target Level SOLO</th>
                             </tr>
                           </thead>
                           <tbody>
                             {formData.desainPembelajaran.kktpTerdiferensiasi.map((k, idx) => (
                               <tr key={idx}>
                                 <td className="border-2 border-slate-900 p-2">
                                   {isEditing ? (
                                      <input 
                                        value={k.nama}
                                        onChange={e => {
                                          const newList = [...formData.desainPembelajaran.kktpTerdiferensiasi];
                                          newList[idx].nama = e.target.value;
                                          updateDesain('kktpTerdiferensiasi', newList);
                                        }}
                                        className="w-full bg-transparent border-none p-0 text-[10px] font-black focus:ring-0"
                                      />
                                   ) : <span className="font-black">{k.nama}</span>}
                                 </td>
                                 <td className="border-2 border-slate-900 p-2">
                                    {isEditing ? (
                                      <textarea 
                                        value={k.kktp}
                                        onChange={e => {
                                          const newList = [...formData.desainPembelajaran.kktpTerdiferensiasi];
                                          newList[idx].kktp = e.target.value;
                                          updateDesain('kktpTerdiferensiasi', newList);
                                        }}
                                        className="w-full bg-transparent border-none p-0 text-[10px] font-bold focus:ring-0"
                                      />
                                   ) : <span className="font-bold">{k.kktp}</span>}
                                 </td>
                                 <td className="border-2 border-slate-900 p-2 text-center">
                                    {isEditing ? (
                                      <input 
                                        value={k.targetSolo}
                                        onChange={e => {
                                          const newList = [...formData.desainPembelajaran.kktpTerdiferensiasi];
                                          newList[idx].targetSolo = e.target.value;
                                          updateDesain('kktpTerdiferensiasi', newList);
                                        }}
                                        className="w-full bg-transparent border-none p-0 text-[10px] font-black text-center focus:ring-0"
                                      />
                                   ) : <span className="font-black">{k.targetSolo}</span>}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   {[
                     { label: "e. Topik Pembelajaran", key: "topik" },
                     { label: "f. Praktik Pedagogis", key: "praktikPedagogis" },
                     { label: "g. Lingkungan", key: "lingkungan" },
                     { label: "h. Pemanfaatan Digital", key: "pemanfaatanDigital" },
                   ].map((item, idx) => (
                     <div key={idx}>
                        <h4 className="font-black text-slate-900 text-xs mb-1 underline">{item.label} :</h4>
                        {isEditing ? (
                          <input 
                            value={formData.desainPembelajaran[item.key as keyof typeof formData.desainPembelajaran] as string}
                            onChange={e => updateDesain(item.key as any, e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 p-2 text-xs font-bold focus:ring-0"
                          />
                        ) : <p className="text-xs font-bold text-slate-800">{formData.desainPembelajaran[item.key as keyof typeof formData.desainPembelajaran] as string}</p>}
                     </div>
                   ))}
                </div>

                <div>
                   <h4 className="font-black text-slate-900 text-xs mb-1 underline">i. Integrasi Nilai Islami dalam Pembelajaran :</h4>
                   {isEditing ? (
                      <textarea 
                        value={formData.desainPembelajaran.integrasiNilaiIslami}
                        onChange={e => updateDesain('integrasiNilaiIslami', e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-white border-2 border-slate-900 p-3 focus:ring-0"
                        rows={4}
                      />
                   ) : <p className="text-xs font-bold text-slate-800 leading-relaxed whitespace-pre-line">{formData.desainPembelajaran.integrasiNilaiIslami}</p>}
                </div>
              </div>
            </div>

            {/* D. PENGALAMAN BELAJAR */}
            <div className={isEditing && activeTab !== 'kegiatan' ? 'hidden' : ''}>
              <div className="bg-[#92D050] border-2 border-slate-900 px-4 py-1.5 mb-2">
                <h3 className="font-black text-slate-900 uppercase italic text-sm">D. PENGALAMAN BELAJAR</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { title: "1. Pendahuluan", key: "pendahuluan" },
                   { title: "2. Kegiatan Inti", key: "kegiatanInti" },
                   { title: "3. Penutup", key: "penutup" },
                 ].map((section, sIdx) => (
                   <div key={sIdx}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-slate-900 text-xs mb-1 underline">{section.title} :</h4>
                        {isEditing && (
                          <button 
                            onClick={() => {
                              const newList = [...formData.pengalamanBelajar[section.key as keyof typeof formData.pengalamanBelajar]];
                              newList.push('');
                              setFormData(p => ({ ...p, pengalamanBelajar: { ...p.pengalamanBelajar, [section.key]: newList } }));
                            }}
                            className="text-[10px] font-black text-emerald-600 underline"
                          >
                            + Tambah Langkah
                          </button>
                        )}
                      </div>
                      <div className="pl-4 space-y-2">
                        {formData.pengalamanBelajar[section.key as keyof typeof formData.pengalamanBelajar].map((step, idx) => (
                          <div key={idx} className="flex gap-2 group">
                            <span className="text-xs font-black">{String.fromCharCode(97 + idx)}.</span>
                            {isEditing ? (
                              <textarea 
                                value={step}
                                onChange={e => {
                                  const newList = [...formData.pengalamanBelajar[section.key as keyof typeof formData.pengalamanBelajar]];
                                  newList[idx] = e.target.value;
                                  setFormData(p => ({ ...p, pengalamanBelajar: { ...p.pengalamanBelajar, [section.key]: newList } }));
                                }}
                                className="flex-1 bg-transparent border-none p-0 text-xs font-bold focus:ring-0"
                                rows={2}
                              />
                            ) : <span className="text-xs font-bold text-slate-800 leading-relaxed">{step}</span>}
                            {isEditing && (
                              <button onClick={() => {
                                const newList = formData.pengalamanBelajar[section.key as keyof typeof formData.pengalamanBelajar].filter((_, i) => i !== idx);
                                setFormData(p => ({ ...p, pengalamanBelajar: { ...p.pengalamanBelajar, [section.key]: newList } }));
                              }} className="text-rose-400 opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

          </div>

          {/* Footer Signature Area (Page 7 style) */}
          <div className="mt-20 pt-10 border-t border-slate-200">
             <div className="flex justify-between items-end">
                <div className="text-center space-y-20">
                   <div className="space-y-1">
                      <p className="text-xs font-bold">Mengetahui,</p>
                      <p className="text-xs font-black uppercase">Kepala Sekolah</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black underline">Deni Rahmat, S.Sos.I</p>
                      <p className="text-[10px] font-bold text-slate-500">NUPTK: 19820412 200801 1 003</p>
                   </div>
                </div>

                <div className="text-center space-y-20">
                   <div className="space-y-1 text-right">
                      <p className="text-xs font-bold">Sawangan, ...................... 2026</p>
                      <p className="text-xs font-black uppercase">Guru Mata Pelajaran</p>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-xs font-black underline">{formData.identitas.namaPenyusun}</p>
                      <p className="text-[10px] font-bold text-slate-500">NUPTK: 19900524 201503 2 004</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Pagination Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Halaman {isEditing ? (activeTab === 'identitas' ? '1' : activeTab === 'murid' ? '2' : activeTab === 'desain' ? '3' : '4') : '1'} dari 7 • SMP Islam Modern Al Fakhir
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
