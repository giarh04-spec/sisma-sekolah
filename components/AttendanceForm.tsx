
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_STUDENTS, CLASSES, STATUS_COLORS } from '../constants';
import { AttendanceStatus } from '../types';

const AttendanceForm: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Load data from localStorage or initial state
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const saved = localStorage.getItem(`attendance_${selectedClass}_${date}`);
    if (saved) return JSON.parse(saved);
    return MOCK_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: AttendanceStatus.PRESENT }), {});
  });

  // Effect to handle data loading when class or date changes
  useEffect(() => {
    const key = `attendance_${selectedClass}_${date}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setAttendance(JSON.parse(saved));
    } else {
      // Reset to default present if no record exists for this date/class
      setAttendance(MOCK_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: AttendanceStatus.PRESENT }), {}));
    }
  }, [selectedClass, date]);

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS
      .filter(s => s.className === selectedClass)
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery));
  }, [selectedClass, searchQuery]);

  // Progress calculation
  const stats = useMemo(() => {
    const total = MOCK_STUDENTS.filter(s => s.className === selectedClass).length;
    const filled = Object.keys(attendance).filter(id => {
        const student = MOCK_STUDENTS.find(s => s.id === id);
        return student?.className === selectedClass;
    }).length;
    return { total, filled };
  }, [attendance, selectedClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const newState = { ...prev, [studentId]: status };
      return newState;
    });
  };

  const handleSave = () => {
    const key = `attendance_${selectedClass}_${date}`;
    localStorage.setItem(key, JSON.stringify(attendance));
    
    // Add to a global history for reports (simplified)
    const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
    history.push({ class: selectedClass, date, data: attendance, timestamp: new Date().toISOString() });
    localStorage.setItem('attendance_history', JSON.stringify(history));

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <i className="fas fa-check-circle"></i>
          <span className="font-bold">Data absensi berhasil disimpan!</span>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Pilih Kelas</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              {CLASSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Tanggal</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            Simpan Absensi
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-50">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text"
              placeholder="Cari nama atau NIS siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm text-slate-500 font-medium">Progres: {stats.filled}/{stats.total} Siswa</span>
             <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(stats.filled / stats.total) * 100}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-400">
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{student.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{student.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{student.nis}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.values(AttendanceStatus).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              attendance[student.id] === status 
                                ? STATUS_COLORS[status] + ' shadow-md scale-105 z-10'
                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-search text-5xl mb-4 opacity-10"></i>
                      <p className="text-lg font-medium">Siswa tidak ditemukan</p>
                      <p className="text-sm">Coba kata kunci pencarian lain.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
