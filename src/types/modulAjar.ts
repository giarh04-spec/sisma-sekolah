export interface InclusionStudent {
  no: number;
  nama: string;
  kebutuhan: string;
  karakteristik: string;
  akomodasi: string;
  pendamping: string;
}

export interface KKTPTerdiferensiasi {
  nama: string;
  kebutuhan: string;
  kktp: string;
  targetSolo: string;
}

export interface DesainPembelajaran {
  capaianElemen: string;
  lintasDisiplin: string;
  tujuanPembelajaran: string;
  kktpRegular: string[];
  kktpTerdiferensiasi: KKTPTerdiferensiasi[];
  topik: string;
  praktikPedagogis: string;
  lingkungan: string;
  pemanfaatanDigital: string;
  integrasiNilaiIslami: string;
  zakatPerdagangan: string;
}

export interface PengalamanBelajar {
  pendahuluan: string[];
  kegiatanInti: string[];
  penutup: string[];
}

export interface ModulAjarData {
  id: string;
  identitas: {
    namaPenyusun: string;
    namaSekolah: string;
    mataPelajaran: string;
    faseKelas: string;
    semester: string;
    materiPokok: string;
    alokasiWaktu: string;
    tahunPelajaran: string;
  };
  identifikasi: {
    muridDeskripsi: string;
    inclusionStudents: InclusionStudent[];
  };
  materi: string;
  dimensiProfil: string[];
  desainPembelajaran: DesainPembelajaran;
  pengalamanBelajar: PengalamanBelajar;
  updatedAt: string;
  authorId: string;
}
