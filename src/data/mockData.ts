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
  TarifBiaya
} from '../types/school';

export const INITIAL_ROMBEL: RombelKelas[] = [
  { id: 'rom-1', namaRombel: 'VII-A', tingkatKelas: 'Kelas 7', jurusanPeminatan: 'Umum (Kurikulum Merdeka)', waliKelasNama: 'Budi Santoso, S.Pd', ruangan: 'R. 101', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-2', namaRombel: 'VII-B', tingkatKelas: 'Kelas 7', jurusanPeminatan: 'Umum (Kurikulum Merdeka)', waliKelasNama: 'Siti Aminah, S.Pd', ruangan: 'R. 102', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-3', namaRombel: 'VIII-A', tingkatKelas: 'Kelas 8', jurusanPeminatan: 'Umum (Kurikulum Merdeka)', waliKelasNama: 'Drs. H. Bambang Sutrisno', ruangan: 'R. 201', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 32 },
  { id: 'rom-4', namaRombel: 'IX-A', tingkatKelas: 'Kelas 9', jurusanPeminatan: 'Umum (Kurikulum Merdeka)', waliKelasNama: 'Nurhidayati, S.Pd', ruangan: 'R. 301', kurikulum: 'Kurikulum Merdeka', tahunAjaran: '2026/2027', semester: 'Ganjil', kapasitas: 30 }
];

export const INITIAL_SISWA: Siswa[] = [
  {
    id: 'sis-001',
    nisn: '3109281000',
    nis: '10200',
    nik: '3276031101120000',
    nama: 'BAYU ADITYA RIFAI',
    kelas: 'Ibnu Al haytam',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-01-10',
    agama: 'Islam',
    alamat: 'Jl. Ahmad Dahlan No. 12',
    namaWali: 'Rifai Ahmad',
    teleponWali: '081234567890',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281000',
    email: 'bayu.aditya@siswa.sch.id',
    username: 'bayu.aditya',
    password: 'password123'
  },
  {
    id: 'sis-002',
    nisn: '3109281009',
    nis: '10209',
    nik: '3276031101120009',
    nama: 'Alya Salsabila Amani',
    kelas: 'Ibnu Al haytam',
    jenisKelamin: 'P',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-03-15',
    agama: 'Islam',
    alamat: 'Jl. Radio Dalam No. 8',
    namaWali: 'Amani Hidayat',
    teleponWali: '081398765432',
    status: 'Aktif',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    kodeBarcode: 'SIS-3109281009',
    email: 'alya.salsabila@siswa.sch.id',
    username: 'alya.salsabila',
    password: 'password123'
  },
  {
    id: 'sis-101',
    nisn: '3109281001',
    nis: '10201',
    nik: '3276031101120001',
    nama: 'Ahmad Fauzan Al-Fikri',
    kelas: 'VII-A',
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
    kelas: 'VII-A',
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
    kelas: 'VII-B',
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
    kelas: 'VII-B',
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
    kelas: 'VIII-A',
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
    kelas: 'VIII-A',
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
    kelas: 'IX-A',
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
    kelas: 'IX-A',
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

export const INITIAL_ABSENSI_GURU: AbsensiGuru[] = [];

export const INITIAL_ABSENSI_SISWA_HARIAN: AbsensiSiswaHarian[] = [];

export const INITIAL_ABSENSI_SISWA_KELAS: AbsensiSiswaKelas[] = [];

export const INITIAL_BANK_SOAL: BankSoal[] = [];

export const INITIAL_UJIAN: UjianCBT[] = [];

export const INITIAL_JADWAL_UJIAN: JadwalUjianItem[] = [];

export const INITIAL_ADMINISTRASI: AdministrasiGuru[] = [];

export const INITIAL_TAGIHAN: TagihanKeuangan[] = [
  // SPP Bills
  {
    id: 'tag-001',
    siswaId: 'sis-001',
    siswaNama: 'BAYU ADITYA RIFAI',
    kelas: 'Ibnu Al haytam',
    tipe: 'spp',
    namaTagihan: 'SPP Bulanan Kelas 7 (Agustus 2026)',
    bulanTahun: 'Agustus 2026',
    nominal: 350000,
    terbayar: 350000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-002',
    siswaId: 'sis-002',
    siswaNama: 'Alya Salsabila Amani',
    kelas: 'Ibnu Al haytam',
    tipe: 'spp',
    namaTagihan: 'SPP Bulanan Kelas 7 (Agustus 2026)',
    bulanTahun: 'Agustus 2026',
    nominal: 350000,
    terbayar: 0,
    status: 'Belum Lunas',
    tanggalBayar: '',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-003',
    siswaId: 'sis-101',
    siswaNama: 'Ahmad Fauzan Al-Fikri',
    kelas: 'VII-A',
    tipe: 'spp',
    namaTagihan: 'SPP Bulanan Kelas 7 (Agustus 2026)',
    bulanTahun: 'Agustus 2026',
    nominal: 350000,
    terbayar: 0,
    status: 'Belum Lunas',
    tanggalBayar: '',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-004',
    siswaId: 'sis-102',
    siswaNama: 'Nabila Zahra Maharani',
    kelas: 'VII-A',
    tipe: 'spp',
    namaTagihan: 'SPP Bulanan Kelas 7 (Agustus 2026)',
    bulanTahun: 'Agustus 2026',
    nominal: 350000,
    terbayar: 350000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    jatuhTempo: '2026-08-10'
  },
  // UKT / Uang Gedung Bills
  {
    id: 'tag-ukt-001',
    siswaId: 'sis-001',
    siswaNama: 'BAYU ADITYA RIFAI',
    kelas: 'Ibnu Al haytam',
    tipe: 'ukt',
    namaTagihan: 'Uang Gedung & Pengembangan (UKT) (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 2500000,
    terbayar: 2500000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-ukt-002',
    siswaId: 'sis-002',
    siswaNama: 'Alya Salsabila Amani',
    kelas: 'Ibnu Al haytam',
    tipe: 'ukt',
    namaTagihan: 'Uang Gedung & Pengembangan (UKT) (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 2500000,
    terbayar: 0,
    status: 'Belum Lunas',
    tanggalBayar: '',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-ukt-101',
    siswaId: 'sis-101',
    siswaNama: 'Ahmad Fauzan Al-Fikri',
    kelas: 'VII-A',
    tipe: 'ukt',
    namaTagihan: 'Uang Gedung & Pengembangan (UKT) (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 2500000,
    terbayar: 0,
    status: 'Belum Lunas',
    tanggalBayar: '',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-ukt-102',
    siswaId: 'sis-102',
    siswaNama: 'Nabila Zahra Maharani',
    kelas: 'VII-A',
    tipe: 'ukt',
    namaTagihan: 'Uang Gedung & Pengembangan (UKT) (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 2500000,
    terbayar: 2500000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    jatuhTempo: '2026-08-10'
  },
  // Ekskul / Kegiatan Bills
  {
    id: 'tag-eks-001',
    siswaId: 'sis-001',
    siswaNama: 'BAYU ADITYA RIFAI',
    kelas: 'Ibnu Al haytam',
    tipe: 'ekskul',
    namaTagihan: 'Kegiatan Ekstrakurikuler & Pramuka (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 100000,
    terbayar: 100000,
    status: 'Lunas',
    tanggalBayar: '2026-08-09',
    jatuhTempo: '2026-08-10'
  },
  {
    id: 'tag-eks-002',
    siswaId: 'sis-002',
    siswaNama: 'Alya Salsabila Amani',
    kelas: 'Ibnu Al haytam',
    tipe: 'ekskul',
    namaTagihan: 'Kegiatan Ekstrakurikuler & Pramuka (T.A 2026/2027)',
    bulanTahun: 'T.A 2026/2027',
    nominal: 100000,
    terbayar: 0,
    status: 'Belum Lunas',
    tanggalBayar: '',
    jatuhTempo: '2026-08-10'
  }
];

export const INITIAL_TRANSAKSI: TransaksiKeuangan[] = [
  {
    id: 'tx-001',
    tagihanId: 'tag-ukt-001',
    siswaNama: 'BAYU ADITYA RIFAI',
    pembayaran: 'Uang Gedung & Pengembangan (UKT) (T.A 2026/2027)',
    tipe: 'ukt',
    nominal: 2500000,
    tanggal: '09/08/2026',
    metodePembayaran: 'Cash / Kasir',
    penerima: 'Kasir / Bendahara Sekolah'
  },
  {
    id: 'tx-002',
    tagihanId: 'tag-001',
    siswaNama: 'BAYU ADITYA RIFAI',
    pembayaran: 'SPP - T.A 2026/2027 (Januari)',
    tipe: 'spp',
    nominal: 500000,
    tanggal: '09/08/2026',
    metodePembayaran: 'Cash / Kasir',
    penerima: 'Kasir / Bendahara Sekolah'
  }
];

export const INITIAL_FONNTE_CONFIG: FonnteConfig = {
  apiKey: 'FONNTE_EDU_TOKEN_2026_SMP_MODERN_AL_FAKHIR',
  senderName: 'SMP Modern Al Fakhir',
  enabled: true,
  autoSendAbsensi: true,
  autoSendKeuangan: true,
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

Menginformasikan tagihan {TAGIHAN} sebesar Rp {NOMINAL} akan jatuh tempo pada {JATUH_TEMPO}.
Status saat ini: {STATUS}.
Mohon dapat melakukan pembayaran melalui Rekening Kasir Sekolah / QRIS / Transfer Bank.

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
  tahunAjaran: '2026/2027',
  semesterAktif: 'Ganjil',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g transform="translate(100,100)"><polygon points="0,-85 24,-60 60,-60 60,-24 85,0 60,24 60,60 24,60 0,85 -24,60 -60,60 -60,24 -85,0 -60,-24 -60,-60 -24,-60" fill="%23ffffff" stroke="%230f766e" stroke-width="8"/><circle cx="0" cy="0" r="55" fill="%230f766e"/><path d="M-30 10 Q0 -25 30 10 L20 20 Q0 -5 -20 20 Z" fill="%23fbbf24"/><circle cx="0" cy="-8" r="4" fill="%23fbbf24"/><path d="M-35 22 Q0 35 35 22 L35 28 Q0 42 -35 28 Z" fill="%23ffffff"/><text x="0" y="42" font-size="9" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">SMP ISLAM MODERN</text><text x="0" y="55" font-size="13" font-family="sans-serif" font-weight="extrabold" fill="%23fbbf24" text-anchor="middle">AL FAKHİR</text></g></svg>',
  fonnteToken: 'FONNTE_EDU_TOKEN_2026_SMP_ISLAM_MODERN_AL_FAKHIR',
  fonnteConfig: INITIAL_FONNTE_CONFIG,
  jadwalPresensi: {
    jamMasuk: '07:00',
    jamToleransi: '07:15',
    jamPulang: '14:30',
    hariKerja: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    autoSwitchScanMode: true
  },
  googleSyncEmail: 'giar.hermawan4@guru.smp.belajar.id',
  adminEmails: ['giar.hermawan4@guru.smp.belajar.id'],
  googleSyncEnabled: false,
  googleSyncSpreadsheetId: '',
  googleSyncSpreadsheetUrl: '',
  googleSyncLastTime: '',
  googleSyncStatus: 'idle'
};

export const INITIAL_MAPEL: MataPelajaranItem[] = [
  { id: 'mapel-1', kodeMapel: 'MP-MAT-01', namaMapel: 'Matematika', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Budi Santoso, S.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-2', kodeMapel: 'MP-BIN-02', namaMapel: 'Bahasa Indonesia', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Siti Aminah, S.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-3', kodeMapel: 'MP-IPA-03', namaMapel: 'Ilmu Pengetahuan Alam (IPA)', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Drs. H. Bambang Sutrisno', alokasiJamPerMinggu: 5, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-4', kodeMapel: 'MP-IPS-04', namaMapel: 'Ilmu Pengetahuan Sosial (IPS)', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Rina Marlina, M.Pd', alokasiJamPerMinggu: 4, kkm: 70, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] },
  { id: 'mapel-5', kodeMapel: 'MP-ENG-05', namaMapel: 'Bahasa Inggris', kategori: 'Wajib Umum', tingkatKelas: 'Semua Tingkat', guruPengampuNama: 'Rina Marlina, M.Pd', alokasiJamPerMinggu: 4, kkm: 75, kurikulum: 'Kurikulum Merdeka', jadwalMengajar: [] }
];

export const INITIAL_TARIF_BIAYA: TarifBiaya[] = [
  { id: 'trf-1', namaBiaya: 'SPP Bulanan Kelas 7', tipe: 'spp', tingkatKelas: 'Kelas 7', nominal: 350000, periode: 'Bulanan', status: 'Aktif' },
  { id: 'trf-2', namaBiaya: 'SPP Bulanan Kelas 8 & 9', tipe: 'spp', tingkatKelas: 'Kelas 8', nominal: 375000, periode: 'Bulanan', status: 'Aktif' },
  { id: 'trf-3', namaBiaya: 'Uang Gedung & Pembangunan', tipe: 'ukt', tingkatKelas: 'Kelas 7', nominal: 2500000, periode: 'Sekali Bayar (Uang Masuk / UKT)', status: 'Aktif' },
  { id: 'trf-4', namaBiaya: 'Kegiatan Ekstrakurikuler', tipe: 'ekskul', tingkatKelas: 'Semua Tingkat', nominal: 100000, periode: 'Per Semester', status: 'Aktif' }
];
