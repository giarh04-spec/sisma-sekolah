export const SUBJECT_OPTIONS = [
  'Informatika',
  'IPA',
  'IPS',
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'PAI',
  'PKn',
  'Seni Budaya',
  'PJOK'
];

export const CLASS_OPTIONS = [
  'VII - A',
  'VII - B',
  'VIII - A',
  'VIII - B',
  'IX - A',
  'IX - B'
];

export const TEACHER_OPTIONS = [
  'Giar Hermawan, S.Kom',
  'Budi Santoso, S.Pd',
  'Siti Aminah, M.Pd',
  'Ahmad Fauzi, S.Ag'
];

export const HOUR_OPTIONS = [
  '1 - 2 (07:00 - 08:30)',
  '3 - 4 (08:45 - 10:15)',
  '5 - 6 (10:30 - 12:00)',
  '7 - 8 (13:00 - 14:30)'
];

export const PROFIL_PANCASILA = [
  {
    id: 'iman_taqwa',
    name: 'Beriman, Bertaqwa kepada Tuhan YME, dan Berakhlak Mulia',
    description: 'Pelajar yang menghayati nilai-nilai agama dan kepercayaan serta menerapkannya dalam kehidupan sehari-hari.'
  },
  {
    id: 'kreatif',
    name: 'Kreatif',
    description: 'Pelajar yang mampu memodifikasi dan menghasilkan sesuatu yang orisinal, bermakna, bermanfaat, dan berdampak.'
  },
  {
    id: 'kritis',
    name: 'Bernalar Kritis',
    description: 'Pelajar yang mampu secara objektif memproses informasi baik kualitatif maupun kuantitatif.'
  },
  {
    id: 'gotong_royong',
    name: 'Gotong Royong',
    description: 'Kemampuan melakukan kolaborasi secara sukarela demi kemaslahatan bersama.'
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    description: 'Bertanggung jawab atas proses dan hasil belajarnya sendiri dengan kesadaran diri.'
  },
  {
    id: 'kebinekaan',
    name: 'Berkebinekaan Global',
    description: 'Mempertahankan budaya luhur, lokalitas, sekaligus berpikiran terbuka dengan budaya lain.'
  }
];

export interface SampleTemplate {
  subject: string;
  topic: string;
  classLevel: string;
  model: string;
  profil: string[];
  duration: string;
  modulAjar: string;
  quiz: string;
  activities: string;
  differentiation: string;
}

export const SAMPLE_TEMPLATES: Record<string, SampleTemplate> = {};
