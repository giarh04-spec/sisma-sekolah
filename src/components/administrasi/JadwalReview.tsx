import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Search, 
  User, 
  Grid, 
  Clock, 
  Info,
  ChevronRight,
  Filter,
  CalendarDays
} from 'lucide-react';
import { 
  TEACHER_MAPPINGS, 
  SCHEDULE_CLASSES, 
  TIME_SLOTS, 
  MASTER_SCHEDULE, 
  PIKET_SCHEDULE,
  ScheduleEntry,
  TeacherMapping
} from '../../types/scheduleData';

interface JadwalReviewProps {
  timeSlots?: string[];
  teacherMappings?: TeacherMapping[];
  masterSchedule?: ScheduleEntry[];
}

export const JadwalReview: React.FC<JadwalReviewProps> = ({ 
  timeSlots = TIME_SLOTS, 
  teacherMappings = TEACHER_MAPPINGS,
  masterSchedule = MASTER_SCHEDULE
}) => {
  const [selectedTeacherCode, setSelectedTeacherCode] = useState<string>('');
  const [viewMode, setViewMode] = useState<'master' | 'personal'>('master');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute to keep highlighting fresh
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
  
  const currentDayName = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'][currentTime.getDay()];
  const currentClock = `${currentTime.getHours().toString().padStart(2, '0')}.${currentTime.getMinutes().toString().padStart(2, '0')}`;

  const isCurrentSession = (day: string, timeRange: string) => {
    if (day !== currentDayName) return false;
    
    const [start, end] = timeRange.split(' - ');
    // Handle both HH.mm and HH:mm formats
    const normalize = (t: string) => t.replace(':', '.');
    return normalize(currentClock) >= normalize(start) && normalize(currentClock) <= normalize(end);
  };

  const timeToMinutes = (t: string) => {
    if (!t) return 0;
    const clean = t.replace(/[:.]/g, '.').trim();
    const [h, m] = clean.split('.').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  const getEntry = (day: string, time: string, classId: string, className: string): ScheduleEntry | undefined => {
    const normalize = (s: string) => s.trim().toUpperCase();
    const targetDay = normalize(day);
    const targetClassId = classId.toLowerCase();
    const targetClassName = className.toLowerCase();
    
    const [sStartStr, sEndStr] = time.split(' - ');
    const sS = timeToMinutes(sStartStr);
    const sE = timeToMinutes(sEndStr);

    return masterSchedule.find(e => {
      const eDay = normalize(e.day);
      const eClass = (e.classId || '').toLowerCase();
      
      const [eStartStr, eEndStr] = e.time.split(' - ');
      const eS = timeToMinutes(eStartStr);
      const eE = timeToMinutes(eEndStr);
      
      const isTimeMatch = eS < sE && eE > sS;
      
      return eDay === targetDay && 
             isTimeMatch && 
             (eClass === targetClassId || eClass === targetClassName || targetClassName.includes(eClass) || eClass.includes(targetClassName));
    });
  };

  const getTeacherColor = (code: string, subject?: string) => {
    if (selectedTeacherCode && selectedTeacherCode !== code) return 'bg-slate-100 opacity-30';
    
    const s = (subject || '').toUpperCase();
    const cInt = parseInt(code);

    // Subject name based colors (fallback for when code is missing)
    if (s.includes('BAHASA INDONESIA')) return 'bg-blue-100 border-blue-200 text-blue-800';
    if (s.includes('MATEMATIKA')) return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    if (s.includes('IPA') || s.includes('ALAM')) return 'bg-green-100 border-green-200 text-green-800';
    if (s.includes('SENI') || s.includes('BUDAYA')) return 'bg-red-100 border-red-200 text-red-800';
    if (s.includes('KOREA')) return 'bg-cyan-100 border-cyan-200 text-cyan-800';
    if (s.includes('JEPANG')) return 'bg-indigo-100 border-indigo-200 text-indigo-800';
    if (s.includes('AGAMA') || s.includes('PABP') || s.includes('FIQIH') || s.includes('QUR\'AN')) return 'bg-emerald-100 border-emerald-200 text-emerald-800';
    if (s.includes('IPS') || s.includes('SOSIAL')) return 'bg-amber-100 border-amber-200 text-amber-800';
    if (s.includes('INGGRIS')) return 'bg-sky-100 border-sky-200 text-sky-800';
    if (s.includes('INFORMATIKA') || s.includes('TIK')) return 'bg-purple-100 border-purple-200 text-purple-800';
    if (s.includes('OLAHRAGA') || s.includes('PJOK')) return 'bg-lime-100 border-lime-200 text-lime-800';

    // Code based colors (legacy support)
    if (cInt === 29) return 'bg-cyan-100 border-cyan-200 text-cyan-800'; // Bahasa Korea
    if (cInt === 11) return 'bg-indigo-100 border-indigo-200 text-indigo-800'; // Bahasa Jepang
    if (cInt === 9) return 'bg-green-100 border-green-200 text-green-800'; // IPA
    if (cInt === 6) return 'bg-yellow-100 border-yellow-200 text-yellow-800'; // Matematika
    if (cInt === 12) return 'bg-red-100 border-red-200 text-red-800'; // Seni Budaya
    if (cInt === 21 || cInt === 2) return 'bg-blue-100 border-blue-200 text-blue-800'; // B. Indo
    
    if (!code) return 'bg-slate-50 text-slate-400';
    
    return 'bg-slate-50 border-slate-100 text-slate-800';
  };

  const resolveTeacherCode = (entry: ScheduleEntry | undefined) => {
    if (!entry) return '';
    
    // Primary: look up in teacherMappings by exact name
    const mappingByName = teacherMappings.find(t => 
      t.name.trim().toUpperCase() === (entry.guruName || '').trim().toUpperCase()
    );
    if (mappingByName) return mappingByName.code;

    // Secondary: if entry has a code, use it
    if (entry.teacherCode && entry.teacherCode !== '-' && entry.teacherCode !== '') return entry.teacherCode;
    
    // Fallback: look up in teacherMappings by subject keywords
    const subject = entry.subject.toUpperCase();
    const mappingBySubject = teacherMappings.find(t => {
      const tSub = t.subject.toUpperCase();
      // Improved matching: avoid picking 'B. Indo 9' for 'B. Indo' if possible
      if (subject === 'BAHASA INDONESIA' && tSub.includes('BAHASA INDONESIA 7,8')) return true;
      return tSub === subject || tSub.startsWith(subject + " ");
    }) || teacherMappings.find(t => {
      const tSub = t.subject.toUpperCase();
      return tSub.includes(subject) || subject.includes(tSub.split(' ')[0]);
    });
    
    return mappingBySubject?.code || '';
  };

  const handlePrint = () => {
    window.print();
  };

  const getClassColors = (className: string) => {
    const name = className.toUpperCase();
    let gradeColor = 'text-slate-900';
    
    // Priority check: VIII before VII to avoid substring overlap conflict
    if (name.includes('VIII')) gradeColor = 'text-blue-700';
    else if (name.includes('VII')) gradeColor = 'text-red-700';
    else if (name.includes('IX')) gradeColor = 'text-orange-700';

    if (name.includes('IBNU SINA')) return `bg-blue-50 ${gradeColor} border-blue-200`;
    if (name.includes('IBNU KHALDUN')) return `bg-indigo-50 ${gradeColor} border-indigo-200`;
    if (name.includes('IBNU AL HAYTAM')) return `bg-sky-50 ${gradeColor} border-sky-200`;
    if (name.includes('IBNU RUSYD')) return `bg-violet-50 ${gradeColor} border-violet-200`;
    if (name.includes('AL KINDI')) return `bg-cyan-50 ${gradeColor} border-cyan-200`;
    if (name.includes('AL KHAWARIZMI')) return `bg-green-50 ${gradeColor} border-green-200`;
    if (name.includes('AL FARABI')) return `bg-emerald-50 ${gradeColor} border-emerald-200`;
    if (name.includes('AL BIRUNI')) return `bg-lime-50 ${gradeColor} border-lime-200`;
    if (name.includes('UMAR BIN KHATTAB')) return `bg-teal-50 ${gradeColor} border-teal-200`;
    if (name.includes('UTSMAN BIN AFFAN')) return `bg-amber-50 ${gradeColor} border-amber-200`;
    return `bg-slate-50 ${gradeColor} border-slate-200`;
  };

  const getColumnTint = (className: string) => {
    const name = className.toUpperCase();
    if (name.includes('IBNU SINA')) return 'bg-blue-50/10';
    if (name.includes('IBNU KHALDUN')) return 'bg-indigo-50/10';
    if (name.includes('IBNU AL HAYTAM')) return 'bg-sky-50/10';
    if (name.includes('IBNU RUSYD')) return 'bg-violet-50/10';
    if (name.includes('AL KINDI')) return 'bg-cyan-50/10';
    if (name.includes('AL KHAWARIZMI')) return 'bg-green-50/10';
    if (name.includes('AL FARABI')) return 'bg-emerald-50/10';
    if (name.includes('AL BIRUNI')) return 'bg-lime-50/10';
    if (name.includes('UMAR BIN KHATTAB')) return 'bg-teal-50/10';
    if (name.includes('UTSMAN BIN AFFAN')) return 'bg-amber-50/10';
    return 'bg-slate-50/10';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Review Jadwal Pelajaran</h3>
            <p className="text-xs text-slate-500">T.A. 2026-2027 • SMP Islam Modern Al Fakhir</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedTeacherCode}
              onChange={(e) => setSelectedTeacherCode(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
            >
              <option value="">-- Filter Berdasarkan Guru --</option>
              {teacherMappings.map(t => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'master' ? 'personal' : 'master')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            {viewMode === 'master' ? <User className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            {viewMode === 'master' ? 'Lihat Jadwal Personal' : 'Lihat Jadwal Master'}
          </button>

          <button
            onClick={handlePrint}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Cetak Jadwal"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Table Header / Title */}
        <div className="p-8 text-center space-y-2 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">JADWAL PELAJARAN</h1>
          <h2 className="text-xl font-bold text-slate-700">SMP ISLAM MODERN AL FAKHIR</h2>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Semester 1 (Ganjil) • Tahun Pelajaran 2026-2027</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-200">
                <th rowSpan={2} className="p-2 border-r border-slate-200 text-center uppercase font-bold text-slate-600 w-16">Hari</th>
                <th rowSpan={2} className="p-2 border-r border-slate-200 text-center uppercase font-bold text-slate-600 w-24">Waktu</th>
                {SCHEDULE_CLASSES.map(c => (
                  <th key={c.id} colSpan={2} className={`p-2 border-r border-slate-200 text-center font-black border-b ${getClassColors(c.name)}`}>
                    {c.name}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200">
                {SCHEDULE_CLASSES.map(c => (
                  <React.Fragment key={c.id}>
                    <th className="p-1 border-r border-slate-200 text-center font-bold text-slate-500">Mapel</th>
                    <th className="p-1 border-r border-slate-200 text-center font-bold text-slate-500">Kode</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dIdx) => (
                <React.Fragment key={day}>
                  {timeSlots.map((time, tIdx) => {
                    // Check if there's any special activity in the schedule entries for this slot
                    const [sStartStr, sEndStr] = time.split(' - ');
                    const sS = timeToMinutes(sStartStr);
                    const sE = timeToMinutes(sEndStr);

                    const rowEntries = masterSchedule.filter(e => {
                      const [eStartStr, eEndStr] = e.time.split(' - ');
                      const eS = timeToMinutes(eStartStr);
                      const eE = timeToMinutes(eEndStr);
                      const isTimeMatch = eS < sE && eE > sS;

                      return e.day.toUpperCase() === day.toUpperCase() && isTimeMatch;
                    });
                    
                    const isSpecialActivity = (keyword: string) => 
                      rowEntries.some(e => e.subject.toUpperCase().includes(keyword.toUpperCase()));

                    // Find the first special activity to display its name
                    const specialEntry = rowEntries.find(e => 
                      ['UPACARA', 'SHOLAT', 'ISTIRAHAT', 'PRAMUKA', 'MUHADHOROH', 'TEMU WALAS', 'EKSTRAKURIKULER', 'EKSKUL'].some(kw => 
                        e.subject.toUpperCase().includes(kw)
                      )
                    );

                    const isRest = specialEntry?.subject.toUpperCase().includes('ISTIRAHAT');
                    const isUpacara = specialEntry?.subject.toUpperCase().includes('UPACARA');
                    const isSholat = specialEntry?.subject.toUpperCase().includes('SHOLAT');
                    const isPramuka = specialEntry?.subject.toUpperCase().includes('PRAMUKA');
                    const isMuhadhoroh = specialEntry?.subject.toUpperCase().includes('MUHADHOROH');
                    const isTemuWalas = specialEntry?.subject.toUpperCase().includes('TEMU WALAS');
                    const isEkskul = specialEntry?.subject.toUpperCase().includes('EKSTRAKURIKULER') || specialEntry?.subject.toUpperCase().includes('EKSKUL');
                    
                    const isActive = isCurrentSession(day, time);

                    return (
                      <tr key={`${day}-${time}`} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${isActive ? 'bg-amber-50 ring-2 ring-inset ring-amber-400 z-10' : ''}`}>
                        {tIdx === 0 && (
                          <td rowSpan={timeSlots.length} className={`p-2 border-r border-slate-200 text-center font-black text-slate-800 rotate-180 [writing-mode:vertical-lr] ${day === currentDayName ? 'bg-amber-100' : 'bg-slate-50'}`}>
                            {day}
                          </td>
                        )}
                        <td className={`p-2 border-r border-slate-200 text-center font-bold text-slate-600 ${isActive ? 'bg-amber-400 text-white' : 'bg-slate-50'}`}>
                          {time}
                        </td>

                        {isRest ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                            {specialEntry?.subject || 'ISTIRAHAT'}
                          </td>
                        ) : isUpacara ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-indigo-50 text-indigo-400'}`}>
                            {specialEntry?.subject || 'UPACARA'}
                          </td>
                        ) : isSholat ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-emerald-50 text-emerald-400'}`}>
                            {specialEntry?.subject || 'SHOLAT DHUHA DAN MURAJA\'AH'}
                          </td>
                        ) : isPramuka ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-orange-50 text-orange-400'}`}>
                            {specialEntry?.subject || 'PRAMUKA'}
                          </td>
                        ) : isMuhadhoroh ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-purple-50 text-purple-400'}`}>
                            {specialEntry?.subject || 'MUHADHOROH'}
                          </td>
                        ) : isTemuWalas ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-sky-50 text-sky-400'}`}>
                            {specialEntry?.subject || 'TEMU WALAS'}
                          </td>
                        ) : isEkskul ? (
                          <td colSpan={20} className={`p-1 text-center font-black uppercase tracking-[0.5em] ${isActive ? 'bg-amber-200 text-amber-800' : 'bg-pink-50 text-pink-400'}`}>
                            {specialEntry?.subject || 'EKSTRAKURIKULER'}
                          </td>
                        ) : (
                          SCHEDULE_CLASSES.map(cls => {
                            const entry = getEntry(day, time, cls.id, cls.name);
                            const cellColor = entry ? getTeacherColor(entry.teacherCode, entry.subject) : 'bg-transparent';
                            
                            const tint = getColumnTint(cls.name);
                            
                            return (
                              <React.Fragment key={cls.id}>
                                <td className={`p-1 border-r border-slate-100 text-center font-medium ${isActive && entry ? 'ring-1 ring-inset ring-amber-500' : ''} ${cellColor} ${!entry ? tint : ''}`}>
                                  {entry?.subject || ''}
                                </td>
                                <td className={`p-1 border-r border-slate-200 text-center font-bold ${isActive && entry ? 'ring-1 ring-inset ring-amber-500' : ''} ${cellColor} ${!entry ? tint : ''}`}>
                                  {resolveTeacherCode(entry)}
                                </td>
                              </React.Fragment>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Tables: Teacher List & Piket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher List Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Daftar Guru & Kode
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">T.A 2026-2027</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200 text-left">NO</th>
                  <th className="p-2 border-r border-slate-200 text-left">Kode</th>
                  <th className="p-2 border-r border-slate-200 text-left">Nama Guru</th>
                  <th className="p-2 text-left">Mata Pelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherMappings.map((t, idx) => (
                  <tr 
                    key={t.code} 
                    className={`hover:bg-blue-50 transition-colors ${selectedTeacherCode === t.code ? 'bg-blue-100 font-bold' : ''}`}
                    onClick={() => setSelectedTeacherCode(t.code === selectedTeacherCode ? '' : t.code)}
                  >
                    <td className="p-2 border-r border-slate-100 text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-100 font-black text-blue-600">{t.code}</td>
                    <td className="p-2 border-r border-slate-100 font-bold text-slate-800">{t.name}</td>
                    <td className="p-2 text-slate-600 italic">{t.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Piket Schedule Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" /> Jadwal Piket Guru
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gedung SMP & SD</span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="p-2 border-r border-slate-200 text-left">WAKTU</th>
                <th className="p-2 border-r border-slate-200 text-left">JAM KE</th>
                <th className="p-2 border-r border-slate-200 text-left">GEDUNG SMP</th>
                <th className="p-2 text-left">GEDUNG SD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PIKET_SCHEDULE.map((p, idx) => {
                const showDay = idx === 0 || PIKET_SCHEDULE[idx-1].day !== p.day;
                return (
                  <tr key={idx} className="hover:bg-emerald-50 transition-colors">
                    <td className="p-2 border-r border-slate-100 font-black text-emerald-700">
                      {showDay ? p.day : ''}
                    </td>
                    <td className="p-2 border-r border-slate-100 text-slate-600 font-medium">{p.jamKe}</td>
                    <td className="p-2 border-r border-slate-100 font-bold text-slate-800">{p.gedungSmp}</td>
                    <td className="p-2 text-slate-800">{p.gedungSd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 border-t border-slate-200 italic text-[10px] text-slate-500 text-center">
            * Jadwal dapat berubah sewaktu-waktu sesuai kebijakan kepala sekolah.
          </div>
        </div>
      </div>
    </div>
  );
};
