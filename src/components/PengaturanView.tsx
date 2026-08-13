import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  School, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  UserCheck, 
  Award, 
  Calendar,
  CreditCard,
  Laptop,
  Check,
  FileText,
  Cloud,
  Loader2,
  LogIn,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Database,
  RefreshCw,
  MessageSquare,
  Key,
  Eye,
  EyeOff,
  Send,
  Smartphone,
  Copy,
  Zap,
  Sliders,
  Clock,
  Timer
} from 'lucide-react';
import { SchoolSettings, Siswa, Guru, Staf, RombelKelas, MataPelajaranItem, AbsensiSiswaHarian, AbsensiSiswaKelas, FonnteConfig, JadwalPresensi } from '../types/school';
import { exportAllToGoogleSheets } from '../lib/googleDriveSync';
import { googleSignIn, googleSignOut } from '../lib/firebase';
import { getFonnteDeviceStatus, sendFonnteMessage, FonnteDeviceStatus } from '../lib/fonnte';

interface PengaturanViewProps {
  schoolSettings: SchoolSettings;
  setSchoolSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  currentRole?: string;
  userGoogleToken?: string;
  setUserGoogleToken?: (token: string) => void;
  userEmail?: string;
  setUserEmail?: (email: string) => void;
  siswaList?: Siswa[];
  guruList?: Guru[];
  stafList?: Staf[];
  rombelList?: RombelKelas[];
  mapelList?: MataPelajaranItem[];
  absensiHarian?: AbsensiSiswaHarian[];
  absensiKelasList?: AbsensiSiswaKelas[];
  activeSubTab: 'identitas' | 'logo' | 'google_drive' | 'fonnte' | 'jadwal';
  setActiveSubTab: (tab: 'identitas' | 'logo' | 'google_drive' | 'fonnte' | 'jadwal') => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  schoolSettings,
  setSchoolSettings,
  currentRole,
  userGoogleToken,
  setUserGoogleToken,
  userEmail,
  setUserEmail,
  siswaList,
  guruList,
  stafList,
  rombelList,
  mapelList,
  absensiHarian,
  absensiKelasList,
  activeSubTab,
  setActiveSubTab
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...schoolSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonnte Token local testing & editing state
  const [showFonnteToken, setShowFonnteToken] = useState(false);
  const [isCheckingFonnte, setIsCheckingFonnte] = useState(false);
  const [fonnteDeviceStatus, setFonnteDeviceStatus] = useState<FonnteDeviceStatus | null>(null);
  const [testPhoneTarget, setTestPhoneTarget] = useState('081298765432');
  const [testMessageText, setTestMessageText] = useState('Halo, ini adalah pesan uji coba integrasi Token Fonnte WhatsApp Gateway dari SMP Modern Al Fakhir.');
  const [sendingTestWA, setSendingTestWA] = useState(false);

  // Synchronize internal form state when prop settings change
  React.useEffect(() => {
    setFormData({ ...schoolSettings });
  }, [schoolSettings]);

  if (currentRole !== 'admin') {
    return (
      <div className="bg-[#121212] border border-red-950/50 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-6 my-16 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-950/40 text-red-500 flex items-center justify-center mx-auto border border-red-900/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Akses Terbatas: Hanya Admin</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman pengaturan sistem, identitas sekolah, dan konfigurasi sinkronisasi Google Drive hanya diperuntukkan bagi akun dengan peran **ADMIN**.
          </p>
        </div>
        <div className="pt-2">
          <p className="text-[10px] text-slate-500">
            Peran Anda saat ini: <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">{currentRole || 'Siswa'}</span>
          </p>
        </div>
      </div>
    );
  }

  // Preset Logos List
  const presetLogos = [
    {
      id: 'tutwuri',
      nama: 'Tut Wuri Handayani (Kemendikdasmen)',
      url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
      tag: 'Kementerian'
    },
    {
      id: 'shield_gold',
      nama: 'Perisai Gold Pendidikan',
      url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      tag: 'Prestasi'
    },
    {
      id: 'torch_blue',
      nama: 'Obor Cendekia Biru',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
      tag: 'Akademik'
    },
    {
      id: 'crest_emerald',
      nama: 'Emblem Hijau Islami/Modren',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
      tag: 'Nasional'
    }
  ];

  const handleInputChange = (field: keyof SchoolSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setFormData(prev => ({ ...prev, logoUrl: base64Url }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80'
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Save Success Toast Banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Berhasil menyimpan Pengaturan Identitas & Logo Sekolah! Seluruh dokumen resmi otomatis terintegrasi.</span>
          </div>
          <button onClick={() => setSavedSuccess(false)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SUBTAB 1: IDENTITAS SEKOLAH FORM */}
      {activeSubTab === 'identitas' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Section 1: Profil Utama */}
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                <School className="w-4 h-4" /> Profil Utama Sekolah
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nama Resmi Sekolah / Satuan Pendidikan *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekolah}
                    onChange={e => handleInputChange('namaSekolah', e.target.value)}
                    placeholder="Contoh: SMA PERMATA BANGSA"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">NPSN (Nomor Pokok Sekolah Nasional) *</label>
                  <input
                    type="text"
                    required
                    value={formData.npsn}
                    onChange={e => handleInputChange('npsn', e.target.value)}
                    placeholder="Contoh: 20109876"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Bentuk Pendidikan</label>
                  <select
                    value={formData.bentukPendidikan}
                    onChange={e => handleInputChange('bentukPendidikan', e.target.value)}
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
                    <option value="MA">MA (Madrasah Aliyah)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
                    <option value="SD">SD / MI</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Status Sekolah</label>
                  <select
                    value={formData.statusSekolah}
                    onChange={e => handleInputChange('statusSekolah', e.target.value)}
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Swasta">Swasta</option>
                    <option value="Negeri">Negeri</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Status Akreditasi</label>
                  <input
                    type="text"
                    value={formData.akreditasi}
                    onChange={e => handleInputChange('akreditasi', e.target.value)}
                    placeholder="A (Unggul)"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Alamat & Kontak */}
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                <MapPin className="w-4 h-4" /> Alamat & Kontak Resmi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Jalan / Alamat Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.alamat}
                    onChange={e => handleInputChange('alamat', e.target.value)}
                    placeholder="Jl. Education No. 123"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">RT / RW</label>
                  <input
                    type="text"
                    value={formData.rtRw}
                    onChange={e => handleInputChange('rtRw', e.target.value)}
                    placeholder="005 / 002"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    value={formData.kelurahan}
                    onChange={e => handleInputChange('kelurahan', e.target.value)}
                    placeholder="Kebayoran Baru"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={formData.kecamatan}
                    onChange={e => handleInputChange('kecamatan', e.target.value)}
                    placeholder="Kebayoran Baru"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={formData.kotaKabupaten}
                    onChange={e => handleInputChange('kotaKabupaten', e.target.value)}
                    placeholder="Kota Jakarta Selatan"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={e => handleInputChange('provinsi', e.target.value)}
                    placeholder="DKI Jakarta"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.kodePos}
                    onChange={e => handleInputChange('kodePos', e.target.value)}
                    placeholder="12110"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nomor Telepon / WA Center</label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={e => handleInputChange('telepon', e.target.value)}
                    placeholder="(021) 555-0199"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Resmi Sekolah</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="info@permatabangsa.sch.id"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Website Sekolah</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={e => handleInputChange('website', e.target.value)}
                    placeholder="https://permatabangsa.sch.id"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pimpinan & Tahun Ajaran */}
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                <UserCheck className="w-4 h-4" /> Pimpinan Sekolah & Tahun Ajaran
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nama Kepala Sekolah (Lengkap Gelar)</label>
                  <input
                    type="text"
                    value={formData.kepalaSekolah}
                    onChange={e => handleInputChange('kepalaSekolah', e.target.value)}
                    placeholder="Dr. H. Ahmad Dahlan, M.Pd."
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">NUPTK Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formData.nipKepalaSekolah}
                    onChange={e => handleInputChange('nipKepalaSekolah', e.target.value)}
                    placeholder="197501152000031001"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tahun Ajaran Aktif</label>
                  <input
                    type="text"
                    value={formData.tahunAjaran}
                    onChange={e => handleInputChange('tahunAjaran', e.target.value)}
                    placeholder="2026/2027"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Semester Aktif</label>
                  <select
                    value={formData.semesterAktif}
                    onChange={e => handleInputChange('semesterAktif', e.target.value)}
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nama Kasir (Untuk Kuitansi)</label>
                  <input
                    type="text"
                    value={formData.namaKasir || ''}
                    onChange={e => handleInputChange('namaKasir', e.target.value)}
                    placeholder="Contoh: Bendahara TU"
                    className="w-full p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Save className="w-4 h-4" /> Simpan Identitas Sekolah
              </button>
            </div>

          </div>
        </form>
      )}

      {/* SUBTAB 2: GANTI LOGO SEKOLAH */}
      {activeSubTab === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Upload & Options */}
          <div className="lg:col-span-2 bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                <Upload className="w-4 h-4" /> Upload Logo Baru Sekolah
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Unggah gambar logo sekolah dari komputer/HP Anda. Format yang didukung: PNG, JPG, WEBP, atau SVG.
              </p>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Dropzone Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-[#181818] hover:bg-slate-800/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
              >
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400 group-hover:scale-110 transition-all">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Klik untuk Pilih Gambar Logo dari Perangkat</p>
                  <p className="text-[10px] text-slate-500 mt-1">Disarankan gambar berlatar transparan (.PNG) ukuran persegi (1:1)</p>
                </div>
              </div>
            </div>

            {/* Custom URL Option */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">Atau Masukkan URL Gambar Logo Online:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={e => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://domain-sekolah.sch.id/logo.png"
                  className="flex-1 p-2.5 bg-[#181818] border border-slate-700 rounded-xl text-xs font-semibold text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 shrink-0"
                  title="Kembalikan Logo Default"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Preset Logos Library */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Pilihan Preset Logo Standar Pendidikan
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetLogos.map(preset => {
                  const isSelected = formData.logoUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: preset.url }))}
                      className={`p-3 bg-[#181818] rounded-xl border cursor-pointer transition-all space-y-2 relative group text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/40'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">
                          ✓
                        </span>
                      )}
                      <img
                        src={preset.url}
                        alt={preset.nama}
                        className="w-12 h-12 object-contain mx-auto rounded-lg bg-white/10 p-1"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-white line-clamp-1">{preset.nama}</div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold block mt-0.5">{preset.tag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan Logo
              </button>
            </div>

          </div>

          {/* Right Column: Live Preview Cards */}
          <div className="space-y-4">
            <div className="bg-[#121212] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Live Preview Logo Sekolah
              </h3>

              {/* Header Preview */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">1. Tampilan Header Aplikasi:</span>
                <div className="p-3 bg-[#0A0A0A] rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{formData.namaSekolah}</h4>
                    <p className="text-[9px] text-slate-500">NPSN: {formData.npsn} • Akreditasi {formData.akreditasi}</p>
                  </div>
                </div>
              </div>

              {/* Student Card Preview */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">2. Tampilan KOP Kartu Peserta Ujian:</span>
                <div className="p-3 bg-white text-slate-900 rounded-xl border border-slate-300 space-y-2">
                  <div className="flex items-center gap-2.5 border-b border-slate-300 pb-2">
                    <img src={formData.logoUrl} alt="Logo Kartu" className="w-8 h-8 object-contain shrink-0" />
                    <div>
                      <h5 className="text-[11px] font-black uppercase leading-tight">{formData.namaSekolah}</h5>
                      <p className="text-[8px] font-bold text-slate-600">KARTU UJIAN CBT • T.A {formData.tahunAjaran}</p>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-600 flex justify-between font-mono">
                    <span>Siswa: Ahmad Rizky</span>
                    <span>Kelas: X-IPA-1</span>
                  </div>
                </div>
              </div>

              {/* Print Document Preview */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">3. Tampilan Dokumen Modul / KOP Surat:</span>
                <div className="p-3 bg-slate-100 text-slate-900 rounded-xl border border-slate-300 text-center space-y-1">
                  <img src={formData.logoUrl} alt="Logo Doc" className="w-7 h-7 object-contain mx-auto" />
                  <h6 className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">{formData.namaSekolah}</h6>
                  <p className="text-[8px] text-slate-600">{formData.alamat} • Telp: {formData.telepon}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'google_drive' && (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                <Cloud className="w-4 h-4" /> Integrasi & Auto-Sync Google Drive
              </h3>
              <p className="text-xs text-slate-400">
                Hubungkan sistem informasi sekolah dengan Google Drive Anda. Setiap ada perubahan data siswa atau data sekolah lainnya, sistem akan secara otomatis mensinkronkan data tersebut ke file Google Sheets di Drive Anda secara aman.
              </p>
            </div>

            {/* Sync Configuration Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Authorization Card */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Akun Google Tersambung</span>
                  {schoolSettings.googleSyncEmail ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{schoolSettings.googleSyncEmail}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Google Drive Terhubung
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-amber-950/10 border border-amber-500/20 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Akun Belum Terhubung</p>
                        <p className="text-[10px] text-slate-500">Hubungkan akun Gmail Anda untuk mengaktifkan sinkronisasi otomatis.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {schoolSettings.googleSyncEmail ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = window.confirm('Apakah Anda yakin ingin memutuskan sambungan Google Drive?');
                        if (!confirmed) return;
                        setFormData(prev => ({
                          ...prev,
                          googleSyncEmail: '',
                          googleSyncEnabled: false,
                          googleSyncSpreadsheetId: '',
                          googleSyncSpreadsheetUrl: ''
                        }));
                        setSchoolSettings(prev => ({
                          ...prev,
                          googleSyncEmail: '',
                          googleSyncEnabled: false,
                          googleSyncSpreadsheetId: '',
                          googleSyncSpreadsheetUrl: ''
                        }));
                        if (setUserGoogleToken) setUserGoogleToken('');
                        if (setUserEmail) setUserEmail('');
                        await googleSignOut();
                      }}
                      className="w-full py-2.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 font-bold rounded-xl text-xs transition-all border border-red-500/20"
                    >
                      Putuskan Akun Google
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await googleSignIn();
                          if (res) {
                            const { user, accessToken } = res;
                            setFormData(prev => ({
                              ...prev,
                              googleSyncEmail: user.email || 'giar.hermawan4@guru.smp.belajar.id',
                              googleSyncEnabled: true
                            }));
                            setSchoolSettings(prev => ({
                              ...prev,
                              googleSyncEmail: user.email || 'giar.hermawan4@guru.smp.belajar.id',
                              googleSyncEnabled: true
                            }));
                            if (setUserGoogleToken) setUserGoogleToken(accessToken);
                            if (setUserEmail) setUserEmail(user.email || 'giar.hermawan4@guru.smp.belajar.id');
                          }
                        } catch (e) {
                          alert('Gagal menghubungkan akun Google. Mohon coba lagi.');
                        }
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <LogIn className="w-4 h-4" /> Hubungkan Akun Google Drive (Gmail)
                    </button>
                  )}
                </div>
              </div>

              {/* Auto Sync Toggle Card */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">2. Status Sinkronisasi Otomatis</span>
                  <div className="flex items-center justify-between p-3 bg-[#121212] border border-slate-800 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-white">Auto-Sync Google Drive</h4>
                      <p className="text-[10px] text-slate-500">Sinkronkan data ke Drive secara berkala saat disimpan.</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={!schoolSettings.googleSyncEmail}
                        onClick={() => {
                          const nextVal = !formData.googleSyncEnabled;
                          setFormData(prev => ({ ...prev, googleSyncEnabled: nextVal }));
                          setSchoolSettings(prev => ({ ...prev, googleSyncEnabled: nextVal }));
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          formData.googleSyncEnabled ? 'bg-blue-600' : 'bg-slate-700 opacity-60'
                        } ${!schoolSettings.googleSyncEmail ? 'cursor-not-allowed opacity-40' : ''}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            formData.googleSyncEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic">
                  * Memerlukan akun Google yang terhubung. Ketika diaktifkan, seluruh perubahan data secara otomatis disinkronkan ke dokumen Google Sheets.
                </div>
              </div>
            </div>

            {/* Spreadsheet Sync Info Card */}
            {schoolSettings.googleSyncEmail && (
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-blue-400" /> Dokumen Spreadsheet di Google Drive
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Spreadsheet berisi seluruh tabel database: Siswa, Guru, Staf, Kelas, Mapel, Absensi, dan Jurnal.
                    </p>
                  </div>

                  {schoolSettings.googleSyncSpreadsheetUrl && (
                    <a
                      href={schoolSettings.googleSyncSpreadsheetUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 self-start sm:self-center"
                    >
                      Buka Spreadsheet <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#121212] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Tipe File</span>
                    <p className="font-bold text-white">Google Sheets (Spreadsheet)</p>
                  </div>
                  <div className="p-3 bg-[#121212] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Sinkronisasi Terakhir</span>
                    <p className="font-bold text-white">{schoolSettings.googleSyncLastTime || 'Belum pernah'}</p>
                  </div>
                  <div className="p-3 bg-[#121212] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Status</span>
                    <p className={`font-bold uppercase ${
                      schoolSettings.googleSyncStatus === 'success' ? 'text-emerald-400' :
                      schoolSettings.googleSyncStatus === 'syncing' ? 'text-blue-400' :
                      schoolSettings.googleSyncStatus === 'failed' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {schoolSettings.googleSyncStatus === 'success' ? 'Berhasil' :
                       schoolSettings.googleSyncStatus === 'syncing' ? 'Mensinkronkan...' :
                       schoolSettings.googleSyncStatus === 'failed' ? 'Gagal' : 'Idle'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={isSyncingManual}
                    onClick={async () => {
                      setIsSyncingManual(true);
                      setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'syncing' }));
                      try {
                        const syncData = {
                          siswaList: siswaList || [],
                          guruList: guruList || [],
                          stafList: stafList || [],
                          rombelList: rombelList || [],
                          mapelList: mapelList || [],
                          absensiHarian: absensiHarian || [],
                          absensiKelasList: absensiKelasList || []
                        };
                        const res = await exportAllToGoogleSheets(
                          userGoogleToken || 'demo_workspace_token_active',
                          syncData,
                          schoolSettings.googleSyncSpreadsheetId
                        );

                        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                        if (res.success) {
                          setFormData(prev => ({
                            ...prev,
                            googleSyncSpreadsheetId: res.spreadsheetId || '',
                            googleSyncSpreadsheetUrl: res.url || '',
                            googleSyncLastTime: nowStr,
                            googleSyncStatus: 'success'
                          }));
                          setSchoolSettings(prev => ({
                            ...prev,
                            googleSyncSpreadsheetId: res.spreadsheetId || '',
                            googleSyncSpreadsheetUrl: res.url || '',
                            googleSyncLastTime: nowStr,
                            googleSyncStatus: 'success'
                          }));
                          alert(res.message);
                        } else {
                          setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'failed' }));
                          alert('Gagal sinkronisasi: ' + res.message);
                        }
                      } catch (e: any) {
                        setSchoolSettings(prev => ({ ...prev, googleSyncStatus: 'failed' }));
                        alert('Error saat sinkronisasi: ' + e.message);
                      } finally {
                        setIsSyncingManual(false);
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shrink-0"
                  >
                    {isSyncingManual ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mensinkronkan...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" /> Sinkronkan Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: TOKEN FONNTE (WHATSAPP GATEWAY) */}
      {activeSubTab === 'fonnte' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Fonnte Container */}
          <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Integrasi Token Fonnte WhatsApp Gateway
                </h3>
                <a
                  href="https://fonnte.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-950/50 border border-emerald-500/30 hover:bg-emerald-900/50 text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                >
                  Buka Fonnte.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Hubungkan akun Fonnte WhatsApp API Anda untuk mengirimkan pesan notifikasi kehadiran siswa (Masuk & Pulang) langsung ke nomor HP WhatsApp Orang Tua / Wali secara otomatis saat scan ID Barcode.
              </p>
            </div>

            {/* Grid layout for Token Input & Connection Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card 1: API Token Configuration */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" /> Fonnte Account API Token
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                    Fonnte v2 API
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Token API Fonnte Anda *</label>
                  <div className="relative flex items-center">
                    <input
                      type={showFonnteToken ? 'text' : 'password'}
                      value={formData.fonnteToken || ''}
                      onChange={e => handleInputChange('fonnteToken', e.target.value)}
                      placeholder="Masukkan Token Fonnte (contoh: FONNTE_TOKEN_2026_XYZ)"
                      className="w-full p-2.5 pr-20 bg-[#121212] border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowFonnteToken(!showFonnteToken)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title={showFonnteToken ? 'Sembunyikan Token' : 'Tampilkan Token'}
                      >
                        {showFonnteToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.fonnteToken) {
                            navigator.clipboard.writeText(formData.fonnteToken);
                            alert('Token Fonnte berhasil disalin ke clipboard!');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Salin Token"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Dapatkan token resmi dari dashboard menu Device / API di website Fonnte (https://fonnte.com).
                  </p>
                </div>

                {/* Info Watermark Fonnte */}
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                  <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    💡 Info Watermark "Sent via fonnte.com"
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Teks <code className="text-amber-200 font-mono">"Sent via fonnte.com"</code> ditambahkan secara otomatis oleh server Fonnte untuk akun dengan paket <b>Free / Trial</b>. Untuk menyembunyikan atau menghilangkan watermark tersebut, silakan upgrade akun Fonnte Anda ke paket <b>Pro / Berlangganan</b> di website resmi Fonnte.
                  </p>
                </div>

                {/* Auto Sending Toggles */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#121212] rounded-xl border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">Auto-Send WA Presensi Siswa</h5>
                      <p className="text-[10px] text-slate-500">Kirim notifikasi otomatis ke orang tua saat barcode siswa discan.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = formData.fonnteConfig?.autoSendAbsensi ?? true;
                        const nextCfg: FonnteConfig = {
                          ...(formData.fonnteConfig || {
                            apiKey: formData.fonnteToken || '',
                            senderName: formData.namaSekolah,
                            templateReminder: '',
                            templateReceipt: '',
                            enabled: true
                          }),
                          autoSendAbsensi: !cur
                        };
                        setFormData(prev => ({ ...prev, fonnteConfig: nextCfg }));
                      }}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                        (formData.fonnteConfig?.autoSendAbsensi ?? true) ? 'bg-emerald-600' : 'bg-slate-700 opacity-60'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        (formData.fonnteConfig?.autoSendAbsensi ?? true) ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121212] rounded-xl border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-white">Auto-Send WA Bukti Kuitansi</h5>
                      <p className="text-[10px] text-slate-500">Kirim struk bukti pembayaran SPP & Keuangan via Fonnte WA.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = formData.fonnteConfig?.autoSendKeuangan ?? true;
                        const nextCfg: FonnteConfig = {
                          ...(formData.fonnteConfig || {
                            apiKey: formData.fonnteToken || '',
                            senderName: formData.namaSekolah,
                            templateReminder: '',
                            templateReceipt: '',
                            enabled: true
                          }),
                          autoSendKeuangan: !cur
                        };
                        setFormData(prev => ({ ...prev, fonnteConfig: nextCfg }));
                      }}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                        (formData.fonnteConfig?.autoSendKeuangan ?? true) ? 'bg-emerald-600' : 'bg-slate-700 opacity-60'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        (formData.fonnteConfig?.autoSendKeuangan ?? true) ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Save className="w-4 h-4" /> Simpan Konfigurasi Token Fonnte
                  </button>
                </div>

              </div>

              {/* Card 2: Device Status & Connection Tester */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" /> Status Device & Kuota Fonnte Gateway
                    </h4>
                    <button
                      type="button"
                      disabled={isCheckingFonnte}
                      onClick={async () => {
                        setIsCheckingFonnte(true);
                        const res = await getFonnteDeviceStatus(formData.fonnteToken || '');
                        setFonnteDeviceStatus(res);
                        setIsCheckingFonnte(false);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition-all border border-slate-700"
                    >
                      {isCheckingFonnte ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      Cek Status Device
                    </button>
                  </div>

                  {fonnteDeviceStatus ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <div>
                            <p className="text-xs font-black text-emerald-300">{fonnteDeviceStatus.message}</p>
                            <p className="text-[10px] text-slate-400">Device: {fonnteDeviceStatus.device}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                          ONLINE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Nomor Pengirim / Sender</span>
                          <p className="font-bold text-white font-mono">{fonnteDeviceStatus.sender}</p>
                        </div>
                        <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Paket Layanan</span>
                          <p className="font-bold text-emerald-400">{fonnteDeviceStatus.package}</p>
                        </div>
                        <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Sisa Kuota Notif</span>
                          <p className="font-bold text-amber-400">{fonnteDeviceStatus.quota}</p>
                        </div>
                        <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Masa Aktif Paket</span>
                          <p className="font-bold text-white">{fonnteDeviceStatus.expired}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#121212] rounded-xl border border-slate-800 text-center space-y-2">
                      <Zap className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                      <p className="text-xs font-bold text-slate-300">Token Fonnte Aktif di Sistem</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Klik tombol <span className="text-emerald-400 font-bold">"Cek Status Device"</span> di atas untuk memverifikasi koneksi WhatsApp Gateway dan mengecek kuota pengiriman pesan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Test Message Tool */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-400" /> Uji Coba Kirim WA via Token Fonnte
                  </h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testPhoneTarget}
                      onChange={e => setTestPhoneTarget(e.target.value)}
                      placeholder="Nomor HP (contoh: 081298765432)"
                      className="w-2/5 p-2 bg-[#121212] border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={sendingTestWA}
                      onClick={async () => {
                        if (!testPhoneTarget.trim()) {
                          alert('Mohon masukkan nomor HP tujuan untuk tes!');
                          return;
                        }
                        setSendingTestWA(true);
                        const res = await sendFonnteMessage(
                          testPhoneTarget,
                          testMessageText,
                          formData.fonnteToken
                        );
                        setSendingTestWA(false);
                        alert(res.message);
                      }}
                      className="w-3/5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {sendingTestWA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Kirim Pesan Uji Coba
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Section: Templates Manager */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Template Pesan WhatsApp Presensi & Keuangan
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Variabel dinamis yang dapat digunakan: <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px]">&#123;NAMA_SISWA&#125;</code>, <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px]">&#123;KELAS&#125;</code>, <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px]">&#123;JAM_SCAN&#125;</code>, <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px]">&#123;TANGGAL&#125;</code>, <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px]">&#123;NAMA_SEKOLAH&#125;</code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Template Presensi Masuk */}
                <div className="bg-[#181818] border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Template Presensi Masuk Siswa
                  </span>
                  <textarea
                    rows={6}
                    value={formData.fonnteConfig?.templateAbsensiMasuk || `*PRESENSI SEKOLAH - NOTIFIKASI MASUK*\n\nYth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),\n\nKami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *HADIR & MELAKUKAN PRESENSI MASUK* di sekolah pada:\n🗓 Tanggal: *{TANGGAL}*\n⏰ Jam Scan: *{JAM_SCAN} WIB*\n📍 Status: *Hadir Tepat Waktu*\n\nTerima kasih atas perhatian dan kerja sama Bapak/Ibu Wali Murid.\n\n_{NAMA_SEKOLAH}_`}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        fonnteConfig: {
                          ...(prev.fonnteConfig || { apiKey: '', senderName: '', templateReminder: '', templateReceipt: '', enabled: true }),
                          templateAbsensiMasuk: val
                        }
                      }));
                    }}
                    className="w-full p-2.5 bg-[#121212] border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Template Presensi Pulang */}
                <div className="bg-[#181818] border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Template Presensi Pulang Siswa
                  </span>
                  <textarea
                    rows={6}
                    value={formData.fonnteConfig?.templateAbsensiPulang || `*PRESENSI SEKOLAH - NOTIFIKASI PULANG*\n\nYth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),\n\nKami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *SELESAI KBM & PRESENSI PULANG* dari sekolah pada:\n🗓 Tanggal: *{TANGGAL}*\n⏰ Jam Scan: *{JAM_SCAN} WIB*\n📍 Status: *Sudah Pulang*\n\nTerima kasih dan selamat beristirahat.\n\n_{NAMA_SEKOLAH}_`}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        fonnteConfig: {
                          ...(prev.fonnteConfig || { apiKey: '', senderName: '', templateReminder: '', templateReceipt: '', enabled: true }),
                          templateAbsensiPulang: val
                        }
                      }));
                    }}
                    className="w-full p-2.5 bg-[#121212] border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Save className="w-4 h-4" /> Simpan Semua Pengaturan Fonnte
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 5: JADWAL PRESENSI MASUK & PULANG */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#121212] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Pengaturan Jadwal Jam Masuk & Jam Pulang Sekolah
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Atur batasan jam presensi siswa dan guru untuk penentuan otomatis status Tepat Waktu, Terlambat, maupun Pulang Cepat pada scanner barcode.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-950/60 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> Berlaku untuk Presensi Barcode & Online
              </span>
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Jam Masuk Utama */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-emerald-400" /> Jam Masuk Utama
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Target Masuk
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Jam Masuk (WIB) *</label>
                  <input
                    type="time"
                    value={formData.jadwalPresensi?.jamMasuk || '07:00'}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        jadwalPresensi: {
                          ...(prev.jadwalPresensi || { jamMasuk: '07:00', jamToleransi: '07:15', jamPulang: '14:30', hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] }),
                          jamMasuk: val
                        }
                      }));
                    }}
                    className="w-full p-2.5 bg-[#121212] border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Siswa yang scan sebelum jam ini dicatat sebagai <span className="text-emerald-400 font-bold">Hadir Tepat Waktu</span>.
                  </p>
                </div>
              </div>

              {/* Card 2: Batas Toleransi Terlambat */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-amber-400" /> Batas Toleransi
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    Batas Maksimal
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Jam Batas Toleransi (WIB) *</label>
                  <input
                    type="time"
                    value={formData.jadwalPresensi?.jamToleransi || '07:15'}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        jadwalPresensi: {
                          ...(prev.jadwalPresensi || { jamMasuk: '07:00', jamToleransi: '07:15', jamPulang: '14:30', hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] }),
                          jamToleransi: val
                        }
                      }));
                    }}
                    className="w-full p-2.5 bg-[#121212] border border-slate-700 rounded-xl text-sm font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Scan setelah jam ini dicatat sebagai <span className="text-rose-400 font-bold">Terlambat</span>.
                  </p>
                </div>
              </div>

              {/* Card 3: Jam Pulang Sekolah */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" /> Jam Pulang Sekolah
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                    Target Pulang
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Jam Pulang Resmi (WIB) *</label>
                  <input
                    type="time"
                    value={formData.jadwalPresensi?.jamPulang || '14:30'}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        jadwalPresensi: {
                          ...(prev.jadwalPresensi || { jamMasuk: '07:00', jamToleransi: '07:15', jamPulang: '14:30', hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] }),
                          jamPulang: val
                        }
                      }));
                    }}
                    className="w-full p-2.5 bg-[#121212] border border-slate-700 rounded-xl text-sm font-mono font-bold text-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Scan sebelum jam ini dicatat <span className="text-amber-300 font-bold">Pulang Cepat</span>.
                  </p>
                </div>
              </div>

            </div>

            {/* Hari Kerja Operasional & Auto Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Hari Operasional Sekolah */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" /> Hari Operasional Sekolah
                </h4>
                <p className="text-[11px] text-slate-400">Pilih hari kerja di mana presensi harian wajib dilaksanakan:</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(hari => {
                    const currentDays = formData.jadwalPresensi?.hariKerja || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                    const isSelected = currentDays.includes(hari);
                    return (
                      <button
                        type="button"
                        key={hari}
                        onClick={() => {
                          const nextDays = isSelected
                            ? currentDays.filter(d => d !== hari)
                            : [...currentDays, hari];
                          setFormData(prev => ({
                            ...prev,
                            jadwalPresensi: {
                              ...(prev.jadwalPresensi || { jamMasuk: '07:00', jamToleransi: '07:15', jamPulang: '14:30', hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] }),
                              hariKerja: nextDays
                            }
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                            : 'bg-[#121212] text-slate-500 border border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />} {hari}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto Switch Mode Scanner */}
              <div className="bg-[#181818] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Auto Switch Mode Scanner (Masuk / Pulang)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Sistem akan secara otomatis mengubah mode scanner ke <span className="text-emerald-400 font-bold">"Masuk"</span> pada pagi hari dan otomatis beralih ke <span className="text-amber-400 font-bold">"Pulang"</span> setelah lewat tengah hari / mendekati jam pulang.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#121212] rounded-xl border border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Aktifkan Auto-Switch Mode</h5>
                    <p className="text-[10px] text-slate-500">Ganti mode scan otomatis mengikuti jam server realtime</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = formData.jadwalPresensi?.autoSwitchScanMode ?? true;
                      setFormData(prev => ({
                        ...prev,
                        jadwalPresensi: {
                          ...(prev.jadwalPresensi || { jamMasuk: '07:00', jamToleransi: '07:15', jamPulang: '14:30', hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] }),
                          autoSwitchScanMode: !cur
                        }
                      }));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      (formData.jadwalPresensi?.autoSwitchScanMode ?? true) ? 'bg-blue-600' : 'bg-slate-700 opacity-60'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      (formData.jadwalPresensi?.autoSwitchScanMode ?? true) ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

            </div>

            {/* Status Classification Rule Preview Box */}
            <div className="p-4 bg-[#181818] border border-slate-800 rounded-2xl space-y-2 text-xs">
              <h5 className="font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ringkasan Aturan Keterlambatan Realtime
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Sebelum {formData.jadwalPresensi?.jamMasuk || '07:00'}</span>
                  <p className="font-bold text-white">Hadir Tepat Waktu</p>
                </div>
                <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">{formData.jadwalPresensi?.jamMasuk || '07:00'} s/d {formData.jadwalPresensi?.jamToleransi || '07:15'}</span>
                  <p className="font-bold text-white">Hadir (Toleransi)</p>
                </div>
                <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-rose-400 font-bold uppercase">Setelah {formData.jadwalPresensi?.jamToleransi || '07:15'}</span>
                  <p className="font-bold text-white">Terlambat X Menit</p>
                </div>
                <div className="p-2.5 bg-[#121212] rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">Jam Pulang {formData.jadwalPresensi?.jamPulang || '14:30'}</span>
                  <p className="font-bold text-white">Pulang Sesuai Jadwal</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Save className="w-4 h-4" /> Simpan Jadwal Masuk & Pulang
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
