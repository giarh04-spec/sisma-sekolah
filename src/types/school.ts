export interface RombelKelas {
  id: string;
  namaRombel: string;
  tingkatKelas: string; // e.g. "Kelas 10", "Kelas 11", "Kelas 12", "Kelas 7", etc.
  jurusanPeminatan?: string; // e.g. "MIPA", "IPS", "Bahasa", "Umum (Kurikulum Merdeka)"
  waliKelasNama: string;
  ruangan: string;
  kurikulum: 'Kurikulum Merdeka' | 'Kurikulum 2013' | 'KTSP';
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  ketuaKelasNama?: string;
  kapasitas: number;
  catatan?: string;
}

export type Role = 'admin' | 'guru' | 'siswa' | 'staf' | 'kepsek' | 'petugas_absensi';
export type SubTab = 'siswa' | 'guru' | 'staf' | 'rombel' | 'mapel' | 'ekskul';
export type AbsensiSubTab = 'scan_barcode' | 'harian_siswa' | 'absensi_guru' | 'redaksi' | 'perizinan' | 'jurnal_guru';
export type CbtSubTab = 'bank_soal' | 'jadwal_kartu' | 'ai_generator' | 'simulasi_ujian' | 'hasil_ujian';
export type KeuanganSubTab = 'pembayaran' | 'pengaturan_biaya' | 'rekap' | 'redaksi' | 'gaji';
export type AdministrasiSubTab = 'modul_ajar' | 'cp' | 'atp' | 'kktp' | 'prota' | 'prosem' | 'jadwal' | 'kalender' | 'jurnal_guru';
export type PengaturanSubTab = 'identitas' | 'logo' | 'google_drive' | 'fonnte' | 'jadwal' | 'sistem';

export interface TarifBiaya {
  id: string;
  namaBiaya: string;
  tipe: TipeKeuangan;
  tingkatKelas: string;
  nominal: number;
  periode: 'Bulanan' | 'Sekali Bayar (Uang Masuk / UKT)' | 'Per Semester';
  keterangan?: string;
  status: 'Aktif' | 'Nonaktif';
  ekskulId?: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nis: string;
  nik?: string;
  nama: string;
  kelas: string;
  tingkatKelas?: string;
  rombel?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama?: string;
  alamat: string;
  alamatLengkap?: string;
  rtRw?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  namaWali: string;
  teleponWali: string;
  status: 'Aktif' | 'Alumni' | 'Pindah';
  fotoUrl?: string;
  kodeBarcode?: string; // e.g. SIS-0081234561
  golonganDarah?: string;
  email?: string;
  username?: string;
  password?: string;
  asalSekolah?: string;
  anakKe?: number;
  jumlahSaudara?: number;
  beratBadan?: number;
  tinggiBadan?: number;
  namaAyah?: string;
  nikAyah?: string;
  tempatLahirAyah?: string;
  tanggalLahirAyah?: string;
  pendidikanAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyah?: string;
  teleponAyah?: string;

  namaIbu?: string;
  nikIbu?: string;
  tempatLahirIbu?: string;
  tanggalLahirIbu?: string;
  pendidikanIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;
  teleponIbu?: string;

  tempatLahirOrtu?: string;
  tanggalLahirOrtu?: string;
  pendidikanOrtu?: string;
  pekerjaanOrtu?: string;
  nikOrtu?: string;
}

export interface Guru {
  id: string;
  nip: string;
  nuptk?: string;
  nik?: string;
  nama: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  mataPelajaran: string;
  jabatan: string;
  email: string;
  username?: string;
  password?: string;
  telepon: string;
  jenisKelamin?: 'L' | 'P';
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  alamatLengkap?: string;
  pendidikanTerakhir?: string;
  sertifikasiGuru?: boolean;
  status: 'GTY' | 'GTT' | 'PNS';
  fotoUrl?: string;
  kodeBarcode?: string; // e.g. GUR-198501152010011002
}

export interface Staf {
  id: string;
  nik: string;
  nip?: string;
  nama: string;
  bagian: string; // TUK, Perpus, Keuangan, Kebersihan, IT
  email: string;
  username?: string;
  password?: string;
  telepon: string;
  jenisKelamin?: 'L' | 'P';
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  alamatLengkap?: string;
  pendidikanTerakhir?: string;
  status: 'Tetap' | 'Kontrak';
  fotoUrl?: string;
  kodeBarcode?: string; // e.g. STF-3201123456780001
}

export interface ScheduleSlot {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | string;
  jamMulai: string; // e.g. "07:30"
  jamSelesai: string; // e.g. "09:00"
  kelasTarget: string; // e.g. "X-IPA-1"
  ruangan?: string; // e.g. "Ruang R.101"
}

export interface MataPelajaranItem {
  id: string;
  kodeMapel: string; // e.g. "MP-MAT-01"
  namaMapel: string; // e.g. "Matematika Tingkat Lanjut"
  kategori: 'Wajib Umum' | 'Peminatan MIPA' | 'Peminatan IPS' | 'Muatan Lokal' | 'Vokasional';
  tingkatKelas: string; // e.g. "Kelas 10", "Kelas 11", "Kelas 12", "Semua Tingkat"
  guruPengampuNama: string; // e.g. "Drs. Hendra Kusuma, M.Pd."
  nipGuru?: string;
  alokasiJamPerMinggu: number; // e.g. 4 (JP/Minggu)
  kkm: number; // e.g. 75
  kurikulum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
  jadwalMengajar: ScheduleSlot[];
  catatan?: string;
}

export interface EkstrakurikulerItem {
  id: string;
  kodeEkskul: string; // e.g. "EKS-PRA-01"
  namaEkskul: string; // e.g. "Pramuka"
  kategori: 'Olahraga' | 'Seni & Budaya' | 'Keagamaan' | 'Sains & Teknologi' | 'Kepanduan & Bela Negara' | 'Bahasa & Komunikasi';
  pembinaNama: string; // e.g. "Drs. H. Bambang Sutrisno"
  nipPembina?: string;
  kontakPembina?: string;
  hariLatihan: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  jamMulai: string; // e.g. "15:00"
  jamSelesai: string; // e.g. "16:30"
  tempat: string; // e.g. "Lapangan Utama"
  tingkatTarget: string; // e.g. "Semua Tingkat", "Kelas 7", "Kelas 8", "Kelas 9"
  kuotaMaksimal: number;
  anggotaSiswaIds: string[];
  status: 'Aktif' | 'Nonaktif';
  biayaIuran: number;
  deskripsi?: string;
}

export type StatusAbsensi = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';

export interface AbsensiSiswaHarian {
  id: string;
  siswaId: string;
  tanggal: string; // YYYY-MM-DD
  status: StatusAbsensi | 'Terlambat';
  keterangan?: string;
  jamScan?: string;
  jamMasuk?: string;
  jamPulang?: string;
  tipeScan?: 'Masuk' | 'Pulang';
  metodeScan?: 'Manual' | 'Barcode / QR';
  lokasiScan?: string;
  statusIzin?: 'Disetujui' | 'Pending' | 'Ditolak';
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  alasanPenolakan?: string;
  buktiUrl?: string;
  kategoriIzin?: 'Sakit' | 'Izin Pribadi' | 'Cuti' | 'Dispensasi Lomba' | 'Lainnya' | string;
  sampaiTanggal?: string;
}

export interface AbsensiSiswaKelas {
  id: string;
  kelas: string;
  mataPelajaran: string;
  guruNama: string;
  tanggal: string;
  jamKe: string; // e.g., "1-2" or "3-4"
  materi: string;
  kehadiranMap: Record<string, StatusAbsensi>; // siswaId -> status
  catatan?: string;
  tujuanPembelajaran?: string;
  metodePembelajaran?: string;
  mediaPembelajaran?: string;
  refleksi?: string;
  tindakLanjut?: string;
}

export interface AbsensiGuru {
  id: string;
  guruId: string;
  guruNama: string;
  tanggal: string;
  jamMasuk?: string;
  jamKeluar?: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Dinas Outer';
  keteranganIzin?: string;
  statusIzin: 'Disetujui' | 'Pending' | 'Ditolak';
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  alasanPenolakan?: string;
  buktiUrl?: string;
  kategoriIzin?: 'Sakit' | 'Cuti Tahunan' | 'Cuti Melahirkan' | 'Dinas Luar' | 'Izin Keperluan Mendesak' | 'Lainnya' | string;
  sampaiTanggal?: string;
  lokasiIn?: string;
  lokasiOut?: string;
  metodeIn?: 'Manual' | 'Barcode / QR';
  metodeOut?: 'Manual' | 'Barcode / QR';
  koordinatGps?: string;
}

export type TipeSoal = 'pg' | 'multiple_choice' | 'isian' | 'esai';

export interface OpsiSoal {
  id: string;
  teks: string;
}

export interface SoalCBT {
  id: string;
  tipe: TipeSoal;
  pertanyaan: string;
  opsi?: OpsiSoal[]; // Untuk PG & Multiple Choice
  kunciJawaban: string | string[]; // Single string untuk PG/Isian, array untuk Multiple Choice / Esai keyword
  pembahasan?: string;
  bobot: number;
  imageUrl?: string;
  videoUrl?: string;
}

export interface BankSoal {
  id: string;
  judul: string;
  kode: string;
  mataPelajaran: string;
  mapel?: string;
  kelas: string;
  durasiMenit: number;
  jumlahSoal: number;
  daftarSoal: SoalCBT[];
  dibuatOleh: string;
  tanggalDibuat: string;
}

export interface JadwalUjianItem {
  id: string;
  ujianId: string;
  judulUjian: string;
  mataPelajaran: string;
  kelasTarget: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
  pengawas: string;
  status: 'Aktif' | 'Selesai' | 'Mendatang';
}

export interface UjianCBT {
  id: string;
  bankSoalId: string;
  judulUjian: string;
  mataPelajaran: string;
  kelasTarget: string;
  waktuMulai: string;
  waktuSelesai: string;
  durasiMenit: number;
  acakSoal: boolean;
  modeAntiCheat?: boolean;
  status: 'Aktif' | 'Draft' | 'Selesai';
}

export interface KartuPesertaUjian {
  siswaId: string;
  nomorPeserta: string;
  ruang: string;
  nomorMeja: string;
  lokasiGedung: string;
  sesi: string;
}

export interface JawabanSiswa {
  soalId: string;
  jawaban: string | string[]; // String atau array of IDs
  raguRagu?: boolean;
  nilai?: number; // Diisi otomatis/manual
}

export interface HasilUjian {
  id: string;
  ujianId: string;
  siswaId: string;
  siswaNama: string;
  nis: string;
  kelas: string;
  jawaban: Record<string, JawabanSiswa>;
  nilaiTotal: number;
  statusPenilaian: 'Selesai' | 'Perlu Koreksi Manual';
  waktuSubmit: string;
  pelanggaranCount?: number;
  logKecurangan?: string[];
}

export interface ModulAjarContent {
  // A. INFORMASI UMUM
  informasiUmum: {
    namaPenyusun: string;
    namaSekolah: string;
    mataPelajaran: string;
    fase: string;
    kelas: string;
    semester: string;
    tahunAjaran: string;
    alokasiWaktu: string;
    materi: string;
  };
  // B. KOMPETENSI AWAL
  kompetensiAwal: string;
  // C. PROFIL / KOMPETENSI YANG DITUJU
  profilPelajarPancasila: string[];
  // D. SARANA DAN PRASARANA
  saranaPrasarana: string[]; // Laptop, Internet, etc.
  // E. TARGET PESERTA DIDIK
  targetPesertaDidik: 'Reguler' | 'Dukungan tambahan' | 'Pengayaan';
  // F. MODEL PEMBELAJARAN
  modelPembelajaran: string;
  // G. TUJUAN PEMBELAJARAN
  tujuanPembelajaran: string[];
  // H. PEMAHAMAN BERMAKNA
  pemahamanBermakna: string;
  // I. PERTANYAAN PEMANTIK
  pertanyaanPemantik: string[];
  // J. KEGIATAN PEMBELAJARAN
  kegiatanPembelajaran: {
    pendahuluan: { deskripsi: string; durasi: string };
    inti: { deskripsi: string; durasi: string };
    penutup: { deskripsi: string; durasi: string };
  };
  // K. ASESMEN
  asesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
    teknik: string;
    instrumen: string;
    rubrik: string;
    kriteriaPenilaian: string;
  };
  // L. DIFERENSIASI PEMBELAJARAN
  diferensiasi: {
    konten: string;
    proses: string;
    produk: string;
  };
  // M. REMEDIAL
  remedial: string;
  // N. PENGAYAAN
  pengayaan: string;
  // O. REFLEKSI GURU
  refleksiGuru: string;
  // P. REFLEKSI PESERTA DIDIK
  refleksiPesertaDidik: string;
  // Q. LAMPIRAN
  lampiran: {
    lkpd: string;
    bahanBacaan: string;
    rubrik: string;
    instrumenAsesmen: string;
    daftarPustaka: string;
  };
}

export type TipeAdministrasi = 
  | 'modul_ajar'
  | 'atp'
  | 'cp'
  | 'jurnal'
  | 'prota'
  | 'prosem'
  | 'kktp'
  | 'kaldik'
  | 'jadwal';

export interface AdministrasiGuru {
  id: string;
  tipe: TipeAdministrasi;
  guruNama: string;
  mataPelajaran: string;
  kelas: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  judul: string;
  deskripsi: string;
  content?: string;
  tanggalInput: string;
  status: 'Draft' | 'Final' | 'Disetujui Kepala Sekolah';
  kontenJson?: Record<string, any>;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'template_kemendikdasmen' | 'custom_excel' | 'custom_word' | 'custom_pdf';
}

export type TipeKeuangan = 'spp' | 'ukt' | 'ekskul' | 'other' | string;

export interface TagihanKeuangan {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  noWaOrangTua?: string;
  tipe: TipeKeuangan;
  namaTagihan: string; // e.g., "SPP Agustus 2026", "UKT Semester Ganjil", "Ekskul Pramuka"
  bulanTahun: string;
  nominal: number;
  terbayar: number;
  status: 'Lunas' | 'Belum Lunas' | 'Dicicil';
  jatuhTempo: string;
  tanggalTagihan?: string;
  tanggalBayar?: string; // Tanggal pembayaran dilakukan (e.g. "2026-08-09" / "09/08/2026")
  waWaliSentAt?: string;
  isDeleted?: boolean;
}

export interface TransaksiKeuangan {
  id: string;
  tagihanId: string;
  siswaNama: string;
  pembayaran?: string;
  tipe: TipeKeuangan;
  nominal: number;
  tanggal: string;
  metodePembayaran: 'Cash / Kasir' | 'Transfer Bank' | 'QRIS';
  penerima: string;
  catatan?: string;
  waReceiptSentAt?: string;
}

export interface FonnteConfig {
  apiKey: string;
  senderName: string;
  templateReminder: string;
  templateReceipt: string;
  templateAbsensiMasuk?: string;
  templateAbsensiPulang?: string;
  enabled: boolean;
  autoSendAbsensi?: boolean;
  autoSendKeuangan?: boolean;
  autoSendPerizinan?: boolean;
}

export interface GoogleDriveExportResult {
  success: boolean;
  spreadsheetUrl?: string;
  spreadsheetId?: string;
  message?: string;
}

export interface JadwalPresensi {
  // Jadwal Siswa
  jamMasuk: string; // HH:mm format, e.g. "07:00"
  jamToleransi: string; // HH:mm format, e.g. "07:15"
  jamPulang: string; // HH:mm format, e.g. "14:30"
  
  // Jadwal Guru & Staf
  jamMasukGuru?: string;
  jamToleransiGuru?: string;
  jamPulangGuru?: string;

  hariKerja: string[]; // e.g. ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  autoSwitchScanMode?: boolean; // Otomatis berpindah mode Masuk/Pulang berdasarkan jam realtime
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  bentukPendidikan: string;
  statusSekolah: string;
  akreditasi: string;
  alamat: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  teleponKepsek: string;
  tahunAjaran: string;
  semester?: string;
  semesterAktif: string;
  logoUrl: string;
  namaKasir?: string;
  fonnteToken?: string;
  fonnteConfig?: FonnteConfig;
  jadwalPresensi?: JadwalPresensi;
  googleSyncEmail?: string;
  adminEmails?: string[];
  googleSyncEnabled?: boolean;
  googleSyncSpreadsheetId?: string;
  googleSyncSpreadsheetUrl?: string;
  googleSyncLastTime?: string;
  googleSyncStatus?: 'idle' | 'syncing' | 'success' | 'failed';
  bankVaName?: string;
  bankVaNumber?: string;
  bankVaOwner?: string;
  qrisUrl?: string;
}

export interface GajiPembayaran {
  id: string;
  penerimaId: string;
  penerimaNama: string;
  penerimaTipe: 'guru' | 'staf';
  penerimaNipNik: string;
  jabatan: string;
  bulan: string; // e.g. "Juli", "Agustus"
  tahun: string; // e.g. "2026"
  gajiPokok: number;
  tunjangan: number;
  // Detailed Tunjangan
  tunjanganWalas?: number;
  tunjanganKetepatanWaktu?: number;
  tunjanganKehadiran?: number;
  tunjanganPiket?: number;
  tunjanganExcessTime?: number;
  
  potongan: number;
  // Detailed Potongan
  potonganDendaTerlambat?: number; // Denda Terlambat < 30 Min
  potonganDendaTerlambatLebih?: number; // Denda Terlambat > 30 Min
  potonganDendaLupaFinger?: number; // Denda Lupa Finger
  potonganKoperasi?: number; // Pot. Koperasi
  potonganKasBon?: number; // Gaji Diambil Dimuka (Kasbon / Pinjaman)

  totalDiterima: number;
  tanggalBayar: string; // YYYY-MM-DD
  metodePembayaran: 'Cash' | 'Transfer Bank' | 'E-Wallet';
  status: 'Draft' | 'Paid';
  catatan?: string;
  penerimaRekening?: string;
}
