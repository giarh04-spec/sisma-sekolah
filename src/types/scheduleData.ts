import { Guru } from './school';

export interface ScheduleEntry {
  day: string;
  time: string;
  classId: string;
  subject: string;
  teacherCode: string;
  guruName?: string;
}

export interface TeacherMapping {
  code: string;
  name: string;
  subject: string;
}

export interface PiketSchedule {
  day: string;
  jamKe: string;
  gedungSmp: string;
  gedungSd: string;
}

export const TEACHER_MAPPINGS: TeacherMapping[] = [
  { code: '002', name: 'Deny Rahmat, S.Sos.I', subject: 'Bahasa Indonesia 9' },
  { code: '003', name: 'Arifah Hilyati, S.S, M.Pd', subject: 'Bahasa Inggris 9 & Public Speaking 7,8' },
  { code: '004', name: 'Muhammad Faisal, S.Sos', subject: 'Fiqih 9 & Al Qur\'an 8,9' },
  { code: '005', name: 'Nur Faidah Djaelani, S.Pd', subject: 'Al Qur\'an 7,9' },
  { code: '006', name: 'Aulia Safitri, S.Pd', subject: 'Matematika 7' },
  { code: '008', name: 'Syarifatu Zahro, S.Pd', subject: 'Pendidikan Pancasila 7,8,9' },
  { code: '009', name: 'Mochamad Asroru Pahala, S.Pd', subject: 'IPA 7,8 & Research 8' },
  { code: '010', name: 'Mutiara Indah Pratiwi, S.Pd', subject: 'PABP 7,8,9' },
  { code: '011', name: 'Reny Suci Rochyati, M.Pd', subject: 'Bahasa Jepang 7,8,9' },
  { code: '012', name: 'Nur Alfiyyah Lail, S.Pd', subject: 'Seni Budaya 7,8,9' },
  { code: '013', name: 'Ahmad Marzuki Nasution', subject: 'Fiqih 7,8, Al Qur\'an 7 & Bahasa Arab 7' },
  { code: '014', name: 'Dedi Setiadi', subject: 'Al-Qur\'an 7,8' },
  { code: '015', name: 'Ariyanto, SE', subject: 'Matematika 8,9' },
  { code: '016', name: 'Thio Pratama, S.Kom', subject: 'Informatika 7,8' },
  { code: '018', name: 'Wulan Apriningtyas, S.Pd', subject: 'IPA 9' },
  { code: '021', name: 'Nabilla, S.Pd', subject: 'Bahasa Indonesia 7,8' },
  { code: '022', name: 'Nabilla, S.Pd', subject: 'Fiqih 7,8,9 & Al Qur\'an 8' },
  { code: '023', name: 'Halwa Khalisa, S.Pd', subject: 'Bahasa Inggris 7,8 & Public Speaking 8' },
  { code: '024', name: 'Nazly Qurotul \'Aini', subject: 'Al Qur\'an 7,8,9' },
  { code: '025', name: 'Rizky Dwi Arista, S.Pd', subject: 'IPS 7,8,9 & Kewirausahaan 7' },
  { code: '028', name: 'Abdul Malik', subject: 'Bahasa Arab 8,9' },
  { code: '029', name: 'Nadia Andhalia Salsabila, S.Pd', subject: 'Bahasa Korea 7,8,9' },
  { code: '030', name: 'Giar Hermawan, S.Kom', subject: 'Informatika' },
];

export const SCHEDULE_CLASSES = [
  { id: '7is', name: 'VII - Ibnu Sina' },
  { id: '7ik', name: 'VII - Ibnu Khaldun' },
  { id: '7ih', name: 'VII - Ibnu Al Haytam' },
  { id: '7ir', name: 'VII - Ibnu Rusyd' },
  { id: '8k', name: 'VIII - Al Kindi' },
  { id: '8kh', name: 'VIII - Al Khawarizmi' },
  { id: '8f', name: 'VIII - Al Farabi' },
  { id: '8b', name: 'VIII - Al Biruni' },
  { id: '9u', name: 'IX - Umar bin Khattab' },
  { id: '9ut', name: 'IX - Utsman bin Affan' },
];

export const TIME_SLOTS = [
  '07.15 - 07.35',
  '07.35 - 08.55',
  '08.55 - 09.35',
  '09.35 - 10.15',
  '10.15 - 10.35',
  '10.35 - 11.15',
  '11.15 - 11.55',
  '11.55 - 13.00',
  '13.00 - 13.40',
  '13.40 - 14.20',
  '14.20 - 15.00',
  '15.00 - 15.40',
];

// Simplified mock data based on the image
// I'll only populate some to demonstrate the UI
export const MASTER_SCHEDULE: ScheduleEntry[] = [];

export const PIKET_SCHEDULE: PiketSchedule[] = [
  { day: 'SENIN', jamKe: '1-3', gedungSmp: 'Ust Marzuki', gedungSd: 'Halwa Khalisa, S.Pd' },
  { day: 'SENIN', jamKe: '4-5', gedungSmp: 'Thio Pratama, S.Kom', gedungSd: 'Ust. Dedi Setiadi' },
  { day: 'SELASA', jamKe: '1-3', gedungSmp: 'Nur Alfiyyah Lail, S.Pd', gedungSd: 'Syarifatu Zahro, S.Pd' },
  { day: 'SELASA', jamKe: '4-5', gedungSmp: 'Mutiara Indah Pratiwi, S.Pd', gedungSd: 'Nabila, S.Pd' },
];
