import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Hash,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Pencil,
  X
} from 'lucide-react';
import { 
  TEACHER_MAPPINGS, 
  TIME_SLOTS, 
  SCHEDULE_CLASSES,
  TeacherMapping
} from '../../types/scheduleData';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface JadwalSettingsProps {
  onSettingsChange: () => void;
}

export const JadwalSettings: React.FC<JadwalSettingsProps> = ({ onSettingsChange }) => {
  const [timeSlots, setTimeSlots] = useState<string[]>(TIME_SLOTS);
  const [teacherMappings, setTeacherMappings] = useState<TeacherMapping[]>(TEACHER_MAPPINGS);
  const [loading, setLoading] = useState(true);
  const [editingTeacherCode, setEditingTeacherCode] = useState<string | null>(null);

  // Sync from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'edu_jadwalSettings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.timeSlots) setTimeSlots(data.timeSlots);
        if (data.teacherMappings) setTeacherMappings(data.teacherMappings);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'edu_jadwalSettings/global');
    });

    return () => unsub();
  }, []);

  const [newTime, setNewTime] = useState('');
  const [newTeacher, setNewTeacher] = useState<TeacherMapping>({ code: '', name: '', subject: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const saveToFirestore = async (updatedTimeSlots: string[], updatedTeacherMappings: TeacherMapping[]) => {
    try {
      await setDoc(doc(db, 'edu_jadwalSettings', 'global'), {
        timeSlots: updatedTimeSlots,
        teacherMappings: updatedTeacherMappings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      onSettingsChange();
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan ke Database!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'edu_jadwalSettings/global');
    }
  };

  const handleAddTimeSlot = () => {
    if (!newTime) return;
    const updated = [...timeSlots, newTime];
    setTimeSlots(updated);
    setNewTime('');
    saveToFirestore(updated, teacherMappings);
  };

  const handleDeleteTimeSlot = (index: number) => {
    const updated = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updated);
    saveToFirestore(updated, teacherMappings);
  };

  const handleAddTeacher = () => {
    if (!newTeacher.code || !newTeacher.name) return;
    
    let updated;
    if (editingTeacherCode) {
      updated = teacherMappings.map(t => t.code === editingTeacherCode ? newTeacher : t);
      setEditingTeacherCode(null);
    } else {
      updated = [...teacherMappings, newTeacher];
    }
    
    setTeacherMappings(updated);
    setNewTeacher({ code: '', name: '', subject: '' });
    saveToFirestore(timeSlots, updated);
  };

  const handleDeleteTeacher = (code: string) => {
    const updated = teacherMappings.filter(t => t.code !== code);
    setTeacherMappings(updated);
    saveToFirestore(timeSlots, updated);
  };

  const handleEditTeacher = (teacher: TeacherMapping) => {
    setEditingTeacherCode(teacher.code);
    setNewTeacher(teacher);
  };

  const moveSlot = (index: number, direction: 'up' | 'down') => {
    const newSlots = [...timeSlots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlots.length) return;
    
    [newSlots[index], newSlots[targetIndex]] = [newSlots[targetIndex], newSlots[index]];
    setTimeSlots(newSlots);
    saveToFirestore(newSlots, teacherMappings);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <Save className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Slots Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pengaturan Jam (Time Slots)</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Contoh: 07.15 - 08.00"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleAddTimeSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-300 transition-all">
                  <span className="font-bold text-slate-700">{slot}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveSlot(idx, 'up')} className="p-1 hover:bg-slate-200 rounded text-slate-500"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveSlot(idx, 'down')} className="p-1 hover:bg-slate-200 rounded text-slate-500"><ArrowDown className="w-4 h-4" /></button>
                    <button 
                      onClick={() => handleDeleteTimeSlot(idx)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher Mappings Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pengaturan Kode Guru</h3>
            </div>
          </div>

          <div className="space-y-4">
            {editingTeacherCode && (
              <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                <span className="text-sm font-black text-emerald-900">Mode Edit: {editingTeacherCode}</span>
                <button 
                  onClick={() => {
                    setEditingTeacherCode(null);
                    setNewTeacher({ code: '', name: '', subject: '' });
                  }}
                  className="p-1 hover:bg-emerald-100 rounded text-emerald-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text"
                  placeholder="Kode"
                  value={newTeacher.code}
                  onChange={(e) => setNewTeacher({...newTeacher, code: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text"
                  placeholder="Nama Guru"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text"
                  placeholder="Mata Pelajaran (Opsional)"
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button 
                onClick={handleAddTeacher}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${editingTeacherCode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {editingTeacherCode ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {teacherMappings.map((t) => (
                <div key={t.code} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 font-black rounded-lg text-xs">
                      {t.code}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                      <div className="text-[10px] text-slate-500 italic">{t.subject}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEditTeacher(t)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(t.code)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
