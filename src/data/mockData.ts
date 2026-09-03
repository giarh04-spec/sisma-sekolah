import {
  Siswa,
  Guru,
  Staf,
  RombelKelas,
  MataPelajaranItem,
  ScheduleSlot,
  AbsensiSiswaHarian,
  AbsensiSiswaKelas,
  AbsensiGuru,
  BankSoal,
  UjianCBT,
  HasilUjian,
  AdministrasiGuru,
  TagihanKeuangan,
  TransaksiKeuangan,
  JadwalUjianItem,
  FonnteConfig,
  SchoolSettings,
  TarifBiaya,
  EkstrakurikulerItem,
  GajiPembayaran
} from '../types/school';

export const INITIAL_ROMBEL: RombelKelas[] = [
  { id: 'rom-7is', namaRombel: 'VII - Ibnu Sina', tingkatKelas: 'Kelas 7', jurusanPeminatan: 'Umum', waliKelasNama: 'Siti Aminah, S.Pd', ruangan: 'R. 101', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-7ik', namaRombel: 'VII - Ibnu Khaldun', tingkatKelas: 'Kelas 7', jurusanPeminatan: 'Umum', waliKelasNama: 'Dedi Kurniawan', ruangan: 'R. 102', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-7ih', namaRombel: 'VII - Ibnu Al Haytam', tingkatKelas: 'Kelas 7', jurusanPeminatan: 'Umum', waliKelasNama: 'Sri Lestari', ruangan: 'R. 103', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-8k', namaRombel: 'VIII - Al Kindi', tingkatKelas: 'Kelas 8', jurusanPeminatan: 'Umum', waliKelasNama: 'Budi Santoso, S.Pd', ruangan: 'R. 201', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-8kh', namaRombel: 'VIII - Al Khawarizmi', tingkatKelas: 'Kelas 8', jurusanPeminatan: 'Umum', waliKelasNama: 'Drs. H. Bambang Sutrisno', ruangan: 'R. 202', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-8f', namaRombel: 'VIII - Al Farabi', tingkatKelas: 'Kelas 8', jurusanPeminatan: 'Umum', waliKelasNama: 'Siti Aminah, S.Pd', ruangan: 'R. 203', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-8b', namaRombel: 'VIII - Al Biruni', tingkatKelas: 'Kelas 8', jurusanPeminatan: 'Umum', waliKelasNama: 'Siti Aminah, S.Pd', ruangan: 'R. 204', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-9u', namaRombel: 'IX - Umar bin Khattab', tingkatKelas: 'Kelas 9', jurusanPeminatan: 'Umum', waliKelasNama: 'Nurhidayati, S.Pd', ruangan: 'R. 301', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 30 },
  { id: 'rom-9ut', namaRombel: 'IX - Utsman bin Affan', tingkatKelas: 'Kelas 9', jurusanPeminatan: 'Umum', waliKelasNama: 'Giar Hermawan, S.Kom', ruangan: 'R. 302', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 30 }
];

export const INITIAL_SISWA: Siswa[] = [
  {
    id: 'sis-001',
    nisn: '117899483',
    nis: '10200',
    nik: '3276031101120000',
    nama: 'ALIA DINA SYAHIRA',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-01-10',
    agama: 'Islam',
    alamat: 'Kp. Kekupu RT. 03 RW. 08 Kel. Pasir Putih, Kec. Sawangan, Kota Depok',
    alamatLengkap: 'Kp. Kekupu RT. 03 RW. 08 Kel. Pasir Putih, Kec. Sawangan, Kota Depok, Jawa Barat',
    rtRw: '03/08',
    kelurahan: 'Pasir Putih',
    kecamatan: 'Sawangan',
    kota: 'Kota Depok',
    provinsi: 'Jawa Barat',
    kodePos: '16519',
    namaAyah: 'Muhammad',
    namaIbu: 'Siti Rahmah',
    namaWali: 'Muhammad',
    teleponWali: '081280020182',
    asalSekolah: 'SDIT Nurul Fikri',
    anakKe: 1,
    jumlahSaudara: 2,
    beratBadan: 42,
    tinggiBadan: 150,
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-117899483',
    email: 'alia.syahira@siswa.sch.id',
    username: 'alia.syahira',
    password: 'password123'
  },
  {
    id: 'sis-002',
    nisn: '122600683',
    nis: '10209',
    nik: '3276031101120009',
    nama: 'Alya Salsabila Amani',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-03-15',
    agama: 'Islam',
    alamat: 'Aryatama Regency 3 Blok C1 No.3',
    alamatLengkap: 'Aryatama Regency 3 Blok C1 No.3 RT. 02/05 Kel. Gandaria Utara, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta',
    rtRw: '02/05',
    kelurahan: 'Gandaria Utara',
    kecamatan: 'Kebayoran Baru',
    kota: 'Kota Jakarta Selatan',
    provinsi: 'DKI Jakarta',
    kodePos: '12140',
    namaAyah: 'Amani Hidayat',
    namaIbu: 'Nurul Hidayah',
    namaWali: 'Amani Hidayat',
    teleponWali: '081398765432',
    asalSekolah: 'SMP Negeri 1',
    anakKe: 2,
    jumlahSaudara: 1,
    beratBadan: 40,
    tinggiBadan: 148,
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-122600683',
    email: 'alya.salsabila@siswa.sch.id',
    username: 'alya.salsabila',
    password: 'password123'
  },
  {
    id: 'sis-000',
    nisn: '123901126',
    nis: '10210',
    nik: '3276032808100109',
    nama: 'Azahra Habibatul Kamilah',
    kelas: 'IX - Umar bin Khattab',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2011-05-15',
    agama: 'Islam',
    alamat: 'Jl. Raya Pasir Putih RT. 04 RW. 04 Kel. Pasir Putih, Kec. Sawangan, Kota Depok',
    alamatLengkap: 'Jl. Raya Pasir Putih RT. 04 RW. 04 Kel. Pasir Putih, Kec. Sawangan, Kota Depok, Jawa Barat',
    rtRw: '04/04',
    kelurahan: 'Pasir Putih',
    kecamatan: 'Sawangan',
    kota: 'Kota Depok',
    provinsi: 'Jawa Barat',
    kodePos: '16519',
    namaAyah: 'Ahmad Kamil',
    namaIbu: 'Fatimah',
    namaWali: 'Ahmad Kamil',
    teleponWali: '081299998888',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-123901126',
    email: 'giarhermawan.gh@gmail.com',
    username: 'giarhermawan.gh',
    password: 'password123'
  },
  {
    id: 'sis-101',
    nisn: '3109281001',
    nis: '10201',
    nik: '3276031101120001',
    nama: 'Ahmad Fauzan Al-Fikri',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta Selatan',
    tanggalLahir: '2013-05-12',
    agama: 'Islam',
    alamat: 'Jl. Senopati No. 45',
    namaWali: 'H. Abdullah',
    teleponWali: '081234567890',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281001',
    email: 'ahmad.fauzan@siswa.sch.id',
    username: 'ahmad.fauzan',
    password: 'password123'
  },
  {
    id: 'sis-102',
    nisn: '3109281002',
    nis: '10202',
    nik: '3276031202120002',
    nama: 'Nabila Zahra Maharani',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-08-20',
    agama: 'Islam',
    alamat: 'Jl. Radio Dalam Raya No. 12',
    namaWali: 'Dedi Kurniawan',
    teleponWali: '081345678901',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281002',
    email: 'nabila.zahra@siswa.sch.id',
    username: 'nabila.zahra',
    password: 'password123'
  },
  {
    id: 'sis-103',
    nisn: '3109281003',
    nis: '10203',
    nik: '3276031503120003',
    nama: 'Rizky Ramadhan Putra',
    kelas: 'VII - Utsman bin Affan',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-07-15',
    agama: 'Islam',
    alamat: 'Jl. Panglima Polim V No. 8',
    namaWali: 'Budi Santoso',
    teleponWali: '081456789012',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281003',
    email: 'rizky.ramadhan@siswa.sch.id',
    username: 'rizky.ramadhan',
    password: 'password123'
  },
  {
    id: 'sis-104',
    nisn: '3109281004',
    nis: '10204',
    nik: '3276031804110004',
    nama: 'Salsabila Putri Amalia',
    kelas: 'VII - Utsman bin Affan',
    jenisKelamin: 'P',
    tempatLahir: 'Depok',
    tanggalLahir: '2012-11-03',
    agama: 'Islam',
    alamat: 'Jl. Fatmawati Raya No. 99',
    namaWali: 'Joko Widodo',
    teleponWali: '081567890123',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281004',
    email: 'salsabila.putri@siswa.sch.id',
    username: 'salsabila.putri',
    password: 'password123'
  },
  {
    id: 'sis-105',
    nisn: '3109281005',
    nis: '9201',
    nik: '3276032005110005',
    nama: 'Dimas Anggara Pratama',
    kelas: 'VIII - Al Khawarizmi',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2012-02-14',
    agama: 'Islam',
    alamat: 'Jl. Cipete Raya No. 44',
    namaWali: 'Pratama Surya',
    teleponWali: '081678901234',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281005',
    email: 'dimas.anggara@siswa.sch.id',
    username: 'dimas.anggara',
    password: 'password123'
  },
  {
    id: 'sis-106',
    nisn: '3109281006',
    nis: '9202',
    nik: '3276032206110006',
    nama: 'Aulia Rahmawati',
    kelas: 'VIII - Al Khawarizmi',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2012-09-09',
    agama: 'Islam',
    alamat: 'Jl. Darmawangsa III No. 10',
    namaWali: 'Herman',
    teleponWali: '081789012345',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281006',
    email: 'aulia.rahma@siswa.sch.id',
    username: 'aulia.rahma',
    password: 'password123'
  },
  {
    id: 'sis-107',
    nisn: '3109281007',
    nis: '8201',
    nik: '3276032507100007',
    nama: 'Kevin Pratama Santoso',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '2011-04-05',
    agama: 'Islam',
    alamat: 'Jl. Kemang Selatan VIII No. 3',
    namaWali: 'Santoso Wijaya',
    teleponWali: '081890123456',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281007',
    email: 'kevin.pratama@siswa.sch.id',
    username: 'kevin.pratama',
    password: 'password123'
  },
  {
    id: 'sis-108',
    nisn: '3109281008',
    nis: '8202',
    nik: '3276032808100008',
    nama: 'Zahra Aulia Salsabila',
    kelas: 'IX - Utsman bin Affan',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2011-12-11',
    agama: 'Islam',
    alamat: 'Jl. Antasari No. 88',
    namaWali: 'M. Fikri',
    teleponWali: '081901234567',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281008',
    email: 'zahra.aulia@siswa.sch.id',
    username: 'zahra.aulia',
    password: 'password123'
  }
];

export const INITIAL_GURU: Guru[] = [
  {
    id: 'gur-1',
    nip: '198205122005011002',
    nik: '3276015212820001',
    nama: 'Budi Santoso, S.Pd',
    mataPelajaran: 'Matematika',
    jabatan: 'Guru Madya / Wali Kelas VII-A',
    status: 'PNS',
    jenisKelamin: 'L',
    tempatLahir: 'Solo',
    tanggalLahir: '1982-12-05',
    email: 'budi.santoso@guru.sch.id',
    username: 'budi.santoso',
    password: 'password123',
    telepon: '081122334455',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Pendidikan Permai No. 5'
  },
  {
    id: 'gur-2',
    nip: '198503202009032001',
    nik: '3276026003850002',
    nama: 'Siti Aminah, S.Pd',
    mataPelajaran: 'Bahasa Indonesia',
    jabatan: 'Guru Muda / Wali Kelas VII-B',
    status: 'PNS',
    jenisKelamin: 'P',
    tempatLahir: 'Yogyakarta',
    tanggalLahir: '1985-03-20',
    email: 'siti.aminah@guru.sch.id',
    username: 'siti.aminah',
    password: 'password123',
    telepon: '081133445566',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Mawar Indah No. 18'
  },
  {
    id: 'gur-3',
    nip: '196812101994031003',
    nik: '3276041012680003',
    nama: 'Drs. H. Bambang Sutrisno',
    mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
    jabatan: 'Guru Senior / Wali Kelas VIII-A',
    status: 'PNS',
    jenisKelamin: 'L',
    tempatLahir: 'Semarang',
    tanggalLahir: '1968-12-10',
    email: 'bambang.sutrisno@guru.sch.id',
    username: 'bambang.sutrisno',
    password: 'password123',
    telepon: '081144556677',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Cempaka Putih No. 22'
  },
  {
    id: 'gur-4',
    nip: '199004152014022002',
    nik: '3276055504900004',
    nama: 'Rina Marlina, M.Pd',
    mataPelajaran: 'Bahasa Inggris',
    jabatan: 'Guru Ahli Pertama',
    status: 'GTY',
    jenisKelamin: 'P',
    tempatLahir: 'Bogor',
    tanggalLahir: '1990-04-15',
    email: 'rina.marlina@guru.sch.id',
    username: 'rina.marlina',
    password: 'password123',
    telepon: '081155667788',
    fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Bogor Raya No. 40'
  },
  {
    id: 'gur-5',
    nip: '198808222011011001',
    nik: '3276062208880005',
    nama: 'Eko Prasetyo, S.Pd',
    mataPelajaran: 'PJOK',
    jabatan: 'Guru Pembina Olahraga',
    status: 'PNS',
    jenisKelamin: 'L',
    tempatLahir: 'Malang',
    tanggalLahir: '1988-08-22',
    email: 'eko.prasetyo@guru.sch.id',
    username: 'eko.prasetyo',
    password: 'password123',
    telepon: '081166778899',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Olahraga No. 7'
  },
  {
    id: 'gur-6',
    nip: '198204102010011010',
    nik: '3276010410820010',
    nama: 'Giar Hermawan, S.Kom',
    mataPelajaran: 'Informatika',
    jabatan: 'Guru TIK / Wali Kelas IX - Utsman bin Affan',
    status: 'GTY',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1982-04-10',
    email: 'giar.hermawan@guru.sch.id',
    username: 'giar.hermawan',
    password: 'password123',
    telepon: '081298765432',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    alamatLengkap: 'Jl. Merdeka No. 10'
  }
];

export const INITIAL_STAF: Staf[] = [
  {
    id: 'staf-1',
    nik: '3276034211900002',
    nama: 'Nurhidayati, S.Pd',
    bagian: 'Bendahara / Keuangan',
    email: 'nurhidayati.s106@admin.smp.belajar.id',
    username: 'nurhidayati',
    password: 'password',
    telepon: '081382083748',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1990-11-02',
    status: 'Tetap',
    alamatLengkap: 'Jl. Kebayoran Lama No. 15',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staf-2',
    nik: '3276031205880001',
    nama: 'Dedi Kurniawan',
    bagian: 'Tata Usaha',
    email: 'dedi.kurniawan@staf.sch.id',
    username: 'dedi.kurniawan',
    password: 'password123',
    telepon: '081312345678',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1988-05-12',
    status: 'Tetap',
    alamatLengkap: 'Jl. Mangga Besar No. 8',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staf-3',
    nik: '3276045009920003',
    nama: 'Sri Lestari',
    bagian: 'Perpustakaan',
    email: 'sri.lestari@staf.sch.id',
    username: 'sri.lestari',
    password: 'password123',
    telepon: '081398765432',
    jenisKelamin: 'P',
    tempatLahir: 'Surakarta',
    tanggalLahir: '1992-09-10',
    status: 'Tetap',
    alamatLengkap: 'Jl. Pustaka Indah No. 4',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'staf-4',
    nik: '3276011102850004',
    nama: 'Joko Widodo',
    bagian: 'Sarana & Prasarana (TUK)',
    email: 'joko.widodo@staf.sch.id',
    username: 'joko.widodo',
    password: 'password123',
    telepon: '081355557788',
    jenisKelamin: 'L',
    tempatLahir: 'Solo',
    tanggalLahir: '1985-02-11',
    status: 'Tetap',
    alamatLengkap: 'Jl. Pembangunan No. 9',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_ABSENSI_GURU: AbsensiGuru[] = [
  {
    id: 'abg-iz-001',
    guruId: 'gur-2',
    guruNama: 'Siti Aminah, S.Pd',
    tanggal: '2026-09-02',
    status: 'Izin',
    kategoriIzin: 'Cuti Tahunan',
    keteranganIzin: 'Menghadiri wisuda putri sulung di Universitas Indonesia.',
    statusIzin: 'Pending',
    disetujuiOleh: '',
    tanggalPersetujuan: '',
    metodeIn: 'Manual'
  },
  {
    id: 'abg-iz-002',
    guruId: 'gur-4',
    guruNama: 'Ahmad Fauzi, S.Pd.I',
    tanggal: '2026-09-01',
    status: 'Sakit',
    kategoriIzin: 'Sakit',
    keteranganIzin: 'Demam tinggi dan flu, istirahat dokter selama 2 hari.',
    statusIzin: 'Pending',
    disetujuiOleh: '',
    tanggalPersetujuan: '',
    metodeIn: 'Manual'
  },
  {
    id: 'abg-iz-003',
    guruId: 'gur-5',
    guruNama: 'Eko Prasetyo, S.Pd',
    tanggal: '2026-08-30',
    status: 'Hadir',
    kategoriIzin: 'Dinas Luar',
    keteranganIzin: 'Mendampingi kontingen O2SN Tingkat Provinsi DKI Jakarta.',
    statusIzin: 'Disetujui',
    disetujuiOleh: 'Dr. H. Ahmad Dahlan, M.Pd.',
    tanggalPersetujuan: '2026-08-29',
    lokasiIn: 'Dinas Luar',
    metodeIn: 'Manual'
  },
  {
    id: 'abg-iz-004',
    guruId: 'staf-2',
    guruNama: 'Dedi Kurniawan',
    tanggal: '2026-09-03',
    status: 'Izin',
    kategoriIzin: 'Izin Keperluan Mendesak',
    keteranganIzin: 'Pengurusan berkas kependudukan dan sertifikasi tanah keluarga di luar kota.',
    statusIzin: 'Pending',
    disetujuiOleh: '',
    tanggalPersetujuan: '',
    metodeIn: 'Manual'
  }
];

export const INITIAL_ABSENSI_SISWA_HARIAN: AbsensiSiswaHarian[] = [
  {
    id: 'abh-iz-001',
    siswaId: 'sis-102',
    tanggal: '2026-09-01',
    status: 'Sakit',
    kategoriIzin: 'Sakit',
    keterangan: 'Sakit tifus, surat dokter terlampir rawat inap di RS Fatmawati.',
    statusIzin: 'Pending',
    disetujuiOleh: '',
    tanggalPersetujuan: '',
    tipeScan: 'Masuk',
    metodeScan: 'Manual'
  },
  {
    id: 'abh-iz-002',
    siswaId: 'sis-105',
    tanggal: '2026-09-02',
    status: 'Izin',
    kategoriIzin: 'Dispensasi Lomba',
    keterangan: 'Mewakili sekolah dalam Olimpiade Sains Nasional (OSN) Matematika Tingkat Kota.',
    statusIzin: 'Pending',
    disetujuiOleh: '',
    tanggalPersetujuan: '',
    tipeScan: 'Masuk',
    metodeScan: 'Manual'
  },
  {
    id: 'abh-iz-003',
    siswaId: 'sis-107',
    tanggal: '2026-08-31',
    status: 'Izin',
    kategoriIzin: 'Izin Pribadi',
    keterangan: 'Menghadiri pemakaman kakek di Bandung Jawa Barat.',
    statusIzin: 'Disetujui',
    disetujuiOleh: 'Dr. H. Ahmad Dahlan, M.Pd.',
    tanggalPersetujuan: '2026-08-30',
    tipeScan: 'Masuk',
    metodeScan: 'Manual'
  }
];

export const INITIAL_ABSENSI_SISWA_KELAS: AbsensiSiswaKelas[] = [];

export const INITIAL_BANK_SOAL: BankSoal[] = [];

export const INITIAL_UJIAN: UjianCBT[] = [];

export const INITIAL_JADWAL_UJIAN: JadwalUjianItem[] = [];

export const INITIAL_ADMINISTRASI: AdministrasiGuru[] = [];

export const INITIAL_TAGIHAN: TagihanKeuangan[] = [];

export const INITIAL_TRANSAKSI: TransaksiKeuangan[] = [];

export const INITIAL_FONNTE_CONFIG: FonnteConfig = {
  apiKey: 'FONNTE_EDU_TOKEN_2026_SMP_MODERN_AL_FAKHIR',
  senderName: 'SMP Modern Al Fakhir',
  enabled: true,
  autoSendAbsensi: true,
  autoSendKeuangan: true,
  autoSendPerizinan: true,
  templateAbsensiMasuk: `*PRESENSI SEKOLAH - NOTIFIKASI MASUK*

Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),

Kami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *HADIR & MELAKUKAN PRESENSI MASUK* di sekolah pada:
🗓 Tanggal: *{TANGGAL}*
⏰ Jam Scan: *{JAM_SCAN} WIB*
📍 Status: *Hadir Tepat Waktu*

Terima kasih atas perhatian dan kerja sama Bapak/Ibu Wali Murid.

_{NAMA_SEKOLAH}_`,
  templateAbsensiPulang: `*PRESENSI SEKOLAH - NOTIFIKASI PULANG*

Yth. Bapak/Ibu Wali dari *{NAMA_SISWA}* (*Kelas {KELAS}*),

Kami menginformasikan bahwa siswa/i atas nama *{NAMA_SISWA}* telah *SELESAI KBM & PRESENSI PULANG* dari sekolah pada:
🗓 Tanggal: *{TANGGAL}*
⏰ Jam Scan: *{JAM_SCAN} WIB*
📍 Status: *Sudah Pulang*

Terima kasih dan selamat beristirahat.

_{NAMA_SEKOLAH}_`,
  templateReminder: `Yth. Bapak/Ibu Wali dari {NAMA_SISWA} ({KELAS}),

Menginformasikan tagihan :
- No. Invoice   : {NO_INVOICE}
- {TAGIHAN} : Rp {NOMINAL}
- Jatuh tempo   : {JATUH_TEMPO}
- Status saat ini : {STATUS}.

Mohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer Bank :
- {BANK_VA_NAME}
- No. Rek/VA : {BANK_VA_NUMBER}
- a.n {BANK_VA_OWNER}

Terima kasih atas perhatian Bapak/Ibu.
- Bendahara {NAMA_SEKOLAH}`,
  templateReceipt: `Yth. Bapak/Ibu Wali dari {NAMA_SISWA} ({KELAS}),

Terima kasih, pembayaran {TAGIHAN} sebesar Rp {NOMINAL} telah KAMI TERIMA dengan baik pada {TANGGAL_BAYAR}.
No. Bukti / Transaksi: {NO_TRANSAKSI}
Metode: {METODE_BAYAR}

Status Tagihan: LUNAS.
- Bendahara {NAMA_SEKOLAH}`
};

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMP Islam Modern Al Fakhír',
  npsn: '70048660',
  bentukPendidikan: 'SMP',
  statusSekolah: 'Swasta',
  akreditasi: 'A (Unggul)',
  alamat: 'Jl. Education No. 123, Kebayoran Baru',
  rtRw: '005 / 002',
  kelurahan: 'Kebayoran Baru',
  kecamatan: 'Kebayoran Baru',
  kotaKabupaten: 'Kota Jakarta Selatan',
  provinsi: 'DKI Jakarta',
  kodePos: '12110',
  telepon: '(021) 555-0199',
  email: 'info@smpislammodernalfakhir.sch.id',
  website: 'https://smpislammodernalfakhir.sch.id',
  kepalaSekolah: 'Dr. H. Ahmad Dahlan, M.Pd.',
  nipKepalaSekolah: '197501152000031001',
  teleponKepsek: '081298765432',
  tahunAjaran: '2026/2027',
  semesterAktif: 'Ganjil',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g transform="translate(100,100)"><polygon points="0,-85 24,-60 60,-60 60,-24 85,0 60,24 60,60 24,60 0,85 -24,60 -60,60 -60,24 -85,0 -60,-24 -60,-60 -24,-60" fill="%23ffffff" stroke="%230f766e" stroke-width="8"/><circle cx="0" cy="0" r="55" fill="%230f766e"/><path d="M-30 10 Q0 -25 30 10 L20 20 Q0 -5 -20 20 Z" fill="%23fbbf24"/><circle cx="0" cy="-8" r="4" fill="%23fbbf24"/><path d="M-35 22 Q0 35 35 22 L35 28 Q0 42 -35 28 Z" fill="%23ffffff"/><text x="0" y="42" font-size="9" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">SMP ISLAM MODERN</text><text x="0" y="55" font-size="13" font-family="sans-serif" font-weight="extrabold" fill="%23fbbf24" text-anchor="middle">AL FAKHİR</text></g></svg>',
  fonnteToken: 'FONNTE_EDU_TOKEN_2026_SMP_ISLAM_MODERN_AL_FAKHIR',
  fonnteConfig: INITIAL_FONNTE_CONFIG,
  jadwalPresensi: {
    jamMasuk: '07:00',
    jamToleransi: '07:15',
    jamPulang: '14:30',
    jamMasukGuru: '06:45',
    jamToleransiGuru: '07:00',
    jamPulangGuru: '15:00',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    autoSwitchScanMode: true
  },
  googleSyncEmail: 'giar.hermawan4@guru.smp.belajar.id',
  adminEmails: ['giar.hermawan4@guru.smp.belajar.id'],
  googleSyncEnabled: false,
  googleSyncSpreadsheetId: '',
  googleSyncSpreadsheetUrl: '',
  googleSyncLastTime: '',
  googleSyncStatus: 'idle',
  bankVaName: 'Bank BRI',
  bankVaNumber: '1234-5678-9012-3456',
  bankVaOwner: 'SMP Islam Modern Al Fakhír',
  qrisUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg'
};

export const INITIAL_MAPEL: MataPelajaranItem[] = [
  { id: 'mapel-1', kodeMapel: 'MP-MAT-01', namaMapel: 'Matematika', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Budi Santoso, S.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-2', kodeMapel: 'MP-BIN-02', namaMapel: 'Bahasa Indonesia', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Siti Aminah, S.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-3', kodeMapel: 'MP-IPA-03', namaMapel: 'Ilmu Pengetahuan Alam (IPA)', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Drs. H. Bambang Sutrisno', alokasiJamPerMinggu: 5, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-4', kodeMapel: 'MP-IPS-04', namaMapel: 'Ilmu Pengetahuan Sosial (IPS)', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Rina Marlina, M.Pd', alokasiJamPerMinggu: 4, kkm: 70, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-5', kodeMapel: 'MP-ENG-05', namaMapel: 'Bahasa Inggris', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Rina Marlina, M.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-6', kodeMapel: 'MP-INF-06', namaMapel: 'Informatika', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Giar Hermawan, S.Kom', alokasiJamPerMinggu: 2, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] }
];

export const INITIAL_TARIF_BIAYA: TarifBiaya[] = [
  { id: 'trf-1', namaBiaya: 'SPP Bulanan Kelas 7', tipe: 'spp', tingkatKelas: 'Kelas 7', nominal: 350000, periode: 'Bulanan', status: 'Aktif' },
  { id: 'trf-2', namaBiaya: 'SPP Bulanan Kelas 8 & 9', tipe: 'spp', tingkatKelas: 'Kelas 8', nominal: 375000, periode: 'Bulanan', status: 'Aktif' },
  { id: 'trf-3', namaBiaya: 'Uang Gedung & Pembangunan', tipe: 'ukt', tingkatKelas: 'Kelas 7', nominal: 2500000, periode: 'Sekali Bayar (Uang Masuk / UKT)', status: 'Aktif' },
  { id: 'trf-4', namaBiaya: 'Kegiatan Ekstrakurikuler', tipe: 'ekskul', tingkatKelas: 'Semua Tingkat', nominal: 100000, periode: 'Per Semester', status: 'Aktif' }
];

export const INITIAL_EKSKUL: EkstrakurikulerItem[] = [
  {
    id: 'eks-1',
    kodeEkskul: 'EKS-PRA-01',
    namaEkskul: 'Praja Muda Karana (Pramuka)',
    kategori: 'Kepanduan & Bela Negara',
    pembinaNama: 'Drs. H. Bambang Sutrisno',
    nipPembina: '197103251998021001',
    kontakPembina: '081234567803',
    hariLatihan: 'Jumat',
    jamMulai: '14:30',
    jamSelesai: '16:30',
    tempat: 'Lapangan Utama & Sanggar Pramuka',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 50,
    anggotaSiswaIds: ['sis-001', 'sis-002', 'sis-003'],
    status: 'Aktif',
    biayaIuran: 0,
    deskripsi: 'Kegiatan kepanduan, pembentukan karakter kepemimpinan, kemandirian, dan keterampilan survival outdoor.'
  },
  {
    id: 'eks-2',
    kodeEkskul: 'EKS-FUT-02',
    namaEkskul: 'Futsal & Sepak Bola',
    kategori: 'Olahraga',
    pembinaNama: 'Budi Santoso, S.Pd',
    nipPembina: '198005122005011002',
    kontakPembina: '081234567801',
    hariLatihan: 'Rabu',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    tempat: 'Lapangan Futsal Al Fakhír',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 30,
    anggotaSiswaIds: ['sis-001', 'sis-004', 'sis-005'],
    status: 'Aktif',
    biayaIuran: 50000,
    deskripsi: 'Pelatihan teknik sepak bola & futsal modern, fisik, taktik tim, dan persiapan turnamen antarsekolah.'
  },
  {
    id: 'eks-3',
    kodeEkskul: 'EKS-ROB-03',
    namaEkskul: 'Robotik & Coding Club',
    kategori: 'Sains & Teknologi',
    pembinaNama: 'Rina Marlina, M.Pd',
    nipPembina: '198807192012012004',
    kontakPembina: '081234567804',
    hariLatihan: 'Kamis',
    jamMulai: '15:00',
    jamSelesai: '17:00',
    tempat: 'Laboratorium Komputer & STEM',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 25,
    anggotaSiswaIds: ['sis-002', 'sis-006'],
    status: 'Aktif',
    biayaIuran: 100000,
    deskripsi: 'Eksplorasi mikrokontroler Arduino, sensor IoT, robotika dasar, dan pengantar algoritma pemrograman.'
  },
  {
    id: 'eks-4',
    kodeEkskul: 'EKS-PMR-04',
    namaEkskul: 'Palang Merah Remaja (PMR)',
    kategori: 'Kepanduan & Bela Negara',
    pembinaNama: 'Siti Aminah, S.Pd',
    nipPembina: '198502102008012003',
    kontakPembina: '081234567802',
    hariLatihan: 'Sabtu',
    jamMulai: '08:00',
    jamSelesai: '10:00',
    tempat: 'Ruang UKS & Aula Serbaguna',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 35,
    anggotaSiswaIds: ['sis-003', 'sis-005'],
    status: 'Aktif',
    biayaIuran: 25000,
    deskripsi: 'Pelatihan pertolongan pertama pada kecelakaan (P3K), kesiapsiagaan bencana, dan penyuluhan kesehatan remaja.'
  },
  {
    id: 'eks-5',
    kodeEkskul: 'EKS-THF-05',
    namaEkskul: 'Tahfidz & Tilawah Al-Qur\'an',
    kategori: 'Keagamaan',
    pembinaNama: 'Mochamad Asroru Pahala, S.Pd.I',
    nipPembina: '199208152018011005',
    kontakPembina: '089539376516',
    hariLatihan: 'Senin',
    jamMulai: '15:00',
    jamSelesai: '16:30',
    tempat: 'Masjid Utama Al Fakhír',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 40,
    anggotaSiswaIds: ['sis-001', 'sis-002', 'sis-004', 'sis-006'],
    status: 'Aktif',
    biayaIuran: 0,
    deskripsi: 'Bimbingan hafalan Al-Qur\'an tartil metode mutqin, tajwid aplikatif, dan seni tilawah bersuara merdu.'
  },
  {
    id: 'eks-6',
    kodeEkskul: 'EKS-MSK-06',
    namaEkskul: 'Seni Musik & Saman / Hadroh',
    kategori: 'Seni & Budaya',
    pembinaNama: 'Aulia Safitri, S.Pd',
    nipPembina: '199504122020012007',
    kontakPembina: '081298765432',
    hariLatihan: 'Selasa',
    jamMulai: '15:00',
    jamSelesai: '16:45',
    tempat: 'Ruang Seni & Budaya Lt. 2',
    tingkatTarget: 'Semua Tingkat',
    kuotaMaksimal: 30,
    anggotaSiswaIds: ['sis-003', 'sis-004'],
    status: 'Aktif',
    biayaIuran: 35000,
    deskripsi: 'Pengembangan talenta vokal, instrumen musik akustik, rebana hadroh Islami, dan koreografi tarian Nusantara.'
  }
];

export const INITIAL_GAJI: GajiPembayaran[] = [
  {
    id: 'gaji-001',
    penerimaId: 'staf-101',
    penerimaNama: 'ALYA NABIYLA',
    penerimaTipe: 'staf',
    penerimaNipNik: '327601002010001',
    jabatan: 'ADMINISTRATION',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 2000000,
    tunjangan: 50000, // Tunjangan Fungsional
    tunjanganWalas: 70000, // TJ Walas
    tunjanganKetepatanWaktu: 50000, // Ketetapan Waktu
    tunjanganKehadiran: 50000, // TJ Kehadiran
    tunjanganPiket: 0, // Piket
    tunjanganExcessTime: 1000, // Exces Time
    potongan: 0,
    potonganDendaTerlambat: 10000, // Denda Terlambat < 30 Min
    potonganDendaTerlambatLebih: 1000, // Denda Terlambat > 30 Min
    potonganDendaLupaFinger: 1000, // Denda Lupa Finger
    potonganKoperasi: 26000, // Pot. Koperasi
    potonganKasBon: 20000, // Gaji Diambil Dimuka
    totalDiterima: 2163000, // Gaji Bersih
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'BCA 8291029381'
  },
  {
    id: 'gaji-002',
    penerimaId: 'staf-102',
    penerimaNama: 'NOUFAL ZAINUDIN ZIDANE',
    penerimaTipe: 'staf',
    penerimaNipNik: '327601002010002',
    jabatan: 'IT ENGINEERING',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 4500000,
    tunjangan: 1000000, // Tunjangan Fungsional
    tunjanganWalas: 0,
    tunjanganKetepatanWaktu: 1170000, // Ketetapan Waktu
    tunjanganKehadiran: 910000, // TJ Kehadiran
    tunjanganPiket: 100000, // Piket
    tunjanganExcessTime: 0,
    potongan: 0,
    potonganDendaTerlambat: 0,
    potonganDendaTerlambatLebih: 0,
    potonganDendaLupaFinger: 0,
    potonganKoperasi: 0,
    potonganKasBon: 5233000, // Gaji Diambil Dimuka
    totalDiterima: 2447000, // Gaji Bersih
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'Mandiri 137001928371'
  },
  {
    id: 'gaji-003',
    penerimaId: 'staf-103',
    penerimaNama: 'MUHAMMAD LUTHFI HAKIM',
    penerimaTipe: 'staf',
    penerimaNipNik: '327601002010003',
    jabatan: 'OPERATOR',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 2000000,
    tunjangan: 50000,
    tunjanganWalas: 50000,
    tunjanganKetepatanWaktu: 50000,
    tunjanganKehadiran: 50000,
    tunjanganPiket: 0,
    tunjanganExcessTime: 0,
    potongan: 0,
    potonganDendaTerlambat: 10000,
    potonganDendaTerlambatLebih: 0,
    potonganDendaLupaFinger: 0,
    potonganKoperasi: 26000,
    potonganKasBon: 20000,
    totalDiterima: 2144000,
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'BRI 092819281726'
  },
  {
    id: 'gaji-004',
    penerimaId: 'gur-1',
    penerimaNama: 'MOCHAMAD ASRORU PAHALA, S.PD.I',
    penerimaTipe: 'guru',
    penerimaNipNik: '327601002010009',
    jabatan: 'GURU MATA PELAJARAN',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 1500000,
    tunjangan: 300000,
    tunjanganWalas: 200000,
    tunjanganKetepatanWaktu: 100000,
    tunjanganKehadiran: 100000,
    tunjanganPiket: 100000,
    tunjanganExcessTime: 0,
    potongan: 0,
    potonganDendaTerlambat: 20000,
    potonganDendaTerlambatLebih: 0,
    potonganDendaLupaFinger: 10000,
    potonganKoperasi: 20000,
    potonganKasBon: 0,
    totalDiterima: 2250000,
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'BSI 7123984712'
  },
  {
    id: 'gaji-005',
    penerimaId: 'gur-2',
    penerimaNama: 'GIAR HERMAWAN, S.KOM',
    penerimaTipe: 'guru',
    penerimaNipNik: '3276010410820010',
    jabatan: 'GURU INFORMATIKA',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 3500000,
    tunjangan: 500000,
    tunjanganWalas: 200000,
    tunjanganKetepatanWaktu: 100000,
    tunjanganKehadiran: 100000,
    tunjanganPiket: 0,
    tunjanganExcessTime: 22000,
    potongan: 0,
    potonganDendaTerlambat: 0,
    potonganDendaTerlambatLebih: 0,
    potonganDendaLupaFinger: 0,
    potonganKoperasi: 0,
    potonganKasBon: 0,
    totalDiterima: 4422000,
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'BCA 7712349182'
  },
  {
    id: 'gaji-006',
    penerimaId: 'gur-3',
    penerimaNama: 'AULIA SAFITRI, S.PD',
    penerimaTipe: 'guru',
    penerimaNipNik: '3276016103820011',
    jabatan: 'GURU SENI & BUDAYA',
    bulan: 'Juli',
    tahun: '2026',
    gajiPokok: 3500000,
    tunjangan: 400000,
    tunjanganWalas: 200000,
    tunjanganKetepatanWaktu: 100000,
    tunjanganKehadiran: 100000,
    tunjanganPiket: 0,
    tunjanganExcessTime: 0,
    potongan: 0,
    potonganDendaTerlambat: 0,
    potonganDendaTerlambatLebih: 0,
    potonganDendaLupaFinger: 0,
    potonganKoperasi: 0,
    potonganKasBon: 0,
    totalDiterima: 4300000,
    tanggalBayar: '2026-07-28',
    metodePembayaran: 'Transfer Bank',
    status: 'Paid',
    penerimaRekening: 'BRI 58291039182'
  }
];
