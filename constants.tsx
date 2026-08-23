
import { Student, ClassData, AttendanceStatus } from './types';

export const CLASSES: ClassData[] = [
  { id: '1', name: 'X-IPA-1', totalStudents: 30 },
  { id: '2', name: 'X-IPA-2', totalStudents: 28 },
  { id: '3', name: 'XI-IPS-1', totalStudents: 32 },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Budi Santoso', nis: '12345', className: 'X-IPA-1' },
  { id: 's2', name: 'Siti Aminah', nis: '12346', className: 'X-IPA-1' },
  { id: 's3', name: 'Agus Setiawan', nis: '12347', className: 'X-IPA-1' },
  { id: 's4', name: 'Dewi Lestari', nis: '12348', className: 'X-IPA-2' },
  { id: 's5', name: 'Rahmat Hidayat', nis: '12349', className: 'X-IPA-2' },
];

export const STATUS_COLORS = {
  [AttendanceStatus.PRESENT]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [AttendanceStatus.ABSENT]: 'bg-rose-100 text-rose-700 border-rose-200',
  [AttendanceStatus.SICK]: 'bg-amber-100 text-amber-700 border-amber-200',
  [AttendanceStatus.PERMISSION]: 'bg-blue-100 text-blue-700 border-blue-200',
  [AttendanceStatus.LATE]: 'bg-violet-100 text-violet-700 border-violet-200',
};
