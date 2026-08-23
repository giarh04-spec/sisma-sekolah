
export enum AttendanceStatus {
  PRESENT = 'Hadir',
  ABSENT = 'Alfa',
  SICK = 'Sakit',
  PERMISSION = 'Izin',
  LATE = 'Terlambat'
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  className: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface ClassData {
  id: string;
  name: string;
  totalStudents: number;
}
