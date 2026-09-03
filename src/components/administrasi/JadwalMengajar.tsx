import React, { useState, useEffect } from 'react';
import { Clock, Plus, AlertCircle, Save, Trash2, Grid, List, Settings, Pencil } from 'lucide-react';
import { Guru, MataPelajaranItem, RombelKelas, Role } from '../../types/school';
import { JadwalReview } from './JadwalReview';
import { JadwalSettings } from './JadwalSettings';
import { TIME_SLOTS, TEACHER_MAPPINGS, MASTER_SCHEDULE, SCHEDULE_CLASSES } from '../../types/scheduleData';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc
} from 'firebase/firestore';

interface JadwalMengajarProps {
  guruList: Guru[];
  mapelList: MataPelajaranItem[];
  rombelList: RombelKelas[];
  currentRole?: Role;
}

export interface JadwalMengajarItem {
  id: string;
  guruName: string;
  teacherCode?: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelas: string;
  mataPelajaran: string;
  ruang: string;
  isKegiatan?: boolean;
}

export const JadwalMengajar: React.FC<JadwalMengajarProps> = ({ guruList, mapelList, rombelList, currentRole = 'admin' }) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'review' | 'settings'>('review');
  const [jadwalList, setJadwalList] = useState<JadwalMengajarItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>(TIME_SLOTS);
  const [teacherMappings, setTeacherMappings] = useState(TEACHER_MAPPINGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto redirect to review if non-admin tries to access manage or settings
  useEffect(() => {
    if (currentRole !== 'admin' && activeTab !== 'review') {
      setActiveTab('review');
    }
  }, [currentRole, activeTab]);

  // Firestore Listeners
  useEffect(() => {
    setLoading(true);
    
    // 1. Sync Jadwal List
    const qJadwal = query(collection(db, 'edu_jadwalList'));
    const unsubJadwal = onSnapshot(qJadwal, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as JadwalMengajarItem[];
      setJadwalList(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'edu_jadwalList');
    });

    // 2. Sync Settings
    const unsubSettings = onSnapshot(doc(db, 'edu_jadwalSettings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.timeSlots) setTimeSlots(data.timeSlots);
        if (data.teacherMappings) setTeacherMappings(data.teacherMappings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'edu_jadwalSettings/global');
    });

    return () => {
      unsubJadwal();
      unsubSettings();
    };
  }, []);

  const refreshSettings = () => {
    // This is now handled by onSnapshot
  };

  const [form, setForm] = useState<Omit<JadwalMengajarItem, 'id'>>({
    guruName: '',
    teacherCode: '',
    hari: 'Senin',
    jamMulai: '07:00',
    jamSelesai: '08:30',
    kelas: '',
    mataPelajaran: '',
    ruang: '',
    isKegiatan: false
  });

  const kegiatanOptions = [
    'Upacara',
    'Sholat Dhuha & Muraja\'ah',
    'Ekstrakurikuler',
    'Pramuka',
    'Muhadhoroh',
    'Temu Walas',
    'Istirahat ke-1',
    'Istirahat ke-2'
  ];

  const [error, setError] = useState('');

  // Conflict detection
  const isTimeConflict = (start1: string, end1: string, start2: string, end2: string) => {
    return (start1 < end2 && end1 > start2);
  };

  const handleAddJadwal = async () => {
    setError('');
    
    if (!form.isKegiatan && (!form.guruName || !form.kelas || !form.mataPelajaran)) {
      setError('Harap lengkapi data Guru, Kelas, dan Mata Pelajaran.');
      return;
    }

    if (form.isKegiatan && !form.mataPelajaran) {
      setError('Harap pilih jenis Kegiatan.');
      return;
    }

    if (form.jamMulai >= form.jamSelesai) {
      setError('Jam Mulai harus lebih awal dari Jam Selesai.');
      return;
    }

    // Conflict detection
    const conflict = jadwalList.find(
      (j) => 
        j.id !== editingId && 
        (j.isKegiatan ? true : j.guruName === form.guruName) && 
        j.hari === form.hari && 
        (j.kelas === form.kelas || form.kelas === 'SEMUA KELAS' || j.kelas === 'SEMUA KELAS') &&
        isTimeConflict(form.jamMulai, form.jamSelesai, j.jamMulai, j.jamSelesai)
    );

    if (conflict && !form.isKegiatan) {
      setError(`Konflik Jadwal! ${form.guruName} sudah memiliki jadwal di kelas ${conflict.kelas} pada jam ${conflict.jamMulai} - ${conflict.jamSelesai}.`);
      return;
    }

    try {
      const submissionData = {
        ...form,
        kelas: form.isKegiatan ? 'SEMUA KELAS' : form.kelas,
        ruang: form.isKegiatan ? 'SEMUA KELAS' : form.ruang,
        guruName: form.isKegiatan ? '-' : form.guruName,
        teacherCode: form.isKegiatan ? '-' : form.teacherCode,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await setDoc(doc(db, 'edu_jadwalList', editingId), submissionData, { merge: true });
        alert('Jadwal berhasil diperbarui!');
      } else {
        await addDoc(collection(db, 'edu_jadwalList'), {
          ...submissionData,
          createdAt: new Date().toISOString()
        });
        alert('Jadwal berhasil disimpan!');
      }
      
      // success message
      setError('');
      setEditingId(null);
      
      // reset form but keep guruName to make it easier for adding multiple classes
      setForm(prev => ({
        ...prev,
        kelas: '',
        mataPelajaran: '',
        ruang: '',
        isKegiatan: false
      }));
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'edu_jadwalList');
    }
  };

  const handleDelete = async (id: string) => {
    if (editingId === id) setEditingId(null);
    try {
      await deleteDoc(doc(db, 'edu_jadwalList', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `edu_jadwalList/${id}`);
    }
  };

  const handleEdit = (item: JadwalMengajarItem) => {
    setEditingId(item.id);
    setForm({
      guruName: item.guruName,
      teacherCode: item.teacherCode || '',
      hari: item.hari,
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
      kelas: item.kelas,
      mataPelajaran: item.mataPelajaran,
      ruang: item.ruang,
      isKegiatan: item.isKegiatan || false
    });
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const tingkatList = ['VII (SMP)', 'VIII (SMP)', 'IX (SMP)', 'X (SMA)', 'XI (SMA)', 'XII (SMA)'];
  
  const displayRombel = rombelList && rombelList.length > 0 
    ? rombelList.map(r => r.namaRombel)
    : SCHEDULE_CLASSES.map(c => c.name);
  
  const defaultMapel = [
    'Bahasa Indonesia',
    'Matematika',
    'Bahasa Inggris',
    'IPA (Ilmu Pengetahuan Alam)',
    'IPS (Ilmu Pengetahuan Sosial)',
    'Pendidikan Agama & Budi Pekerti',
    'Pendidikan Pancasila (PKN)',
    'Seni Budaya',
    'PJOK (Olahraga)',
    'Informatika / TIK',
    'Prakarya',
    'Bahasa Daerah / Sunda',
    'Bimbingan Konseling (BK)',
    'Ekstrakurikuler',
    'Upacara',
    'Sholat Dhuha & Muraja\'ah',
    'Pramuka',
    'Muhadhoroh',
    'Istirahat ke-1',
    'Istirahat ke-2'
  ];

  const displayMapel = mapelList && mapelList.length > 0 
    ? mapelList.map(m => m.namaMapel) 
    : defaultMapel;

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Only visible for admin role */}
      {currentRole === 'admin' && (
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'review' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" /> Review Jadwal
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'manage' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" /> Kelola Data
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" /> Pengaturan
          </button>
        </div>
      )}

      {activeTab === 'review' || currentRole !== 'admin' ? (
        <JadwalReview 
          timeSlots={timeSlots}
          teacherMappings={teacherMappings}
          masterSchedule={[
            ...MASTER_SCHEDULE,
            ...jadwalList.map(j => {
              // Ensure time format is normalized to "HH.mm - HH.mm"
              const normalizeTime = (t: string) => t.replace(':', '.');
              const timeRange = `${normalizeTime(j.jamMulai)} - ${normalizeTime(j.jamSelesai)}`;
              
              return {
                day: j.hari.toUpperCase(),
                time: timeRange,
                classId: j.ruang || j.kelas,
                subject: j.mataPelajaran,
                teacherCode: j.teacherCode || ''
              };
            })
          ]}
        />
      ) : activeTab === 'settings' ? (
        <JadwalSettings onSettingsChange={refreshSettings} />
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Kelola Jadwal Mengajar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-semibold text-slate-700 text-sm mb-4">
                  {editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
                </h4>
                
                {editingId && (
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg mb-2">
                    <span className="text-[10px] font-bold text-blue-700">Sedang Mengedit...</span>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setForm(prev => ({ ...prev, kelas: '', mataPelajaran: '', ruang: '', isKegiatan: false }));
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-start gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-2 p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tipe:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-md">
                    <button
                      onClick={() => setForm(prev => ({ ...prev, isKegiatan: false, guruName: '', mataPelajaran: '', ruang: '', kelas: '' }))}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!form.isKegiatan ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      MATA PELAJARAN
                    </button>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, isKegiatan: true, guruName: '-', teacherCode: '-', ruang: 'SEMUA KELAS', kelas: 'SEMUA KELAS', mataPelajaran: '' }))}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${form.isKegiatan ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      KEGIATAN SEKOLAH
                    </button>
                  </div>
                </div>

                {!form.isKegiatan ? (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Guru Pengajar</label>
                    <select 
                      value={form.guruName} 
                      onChange={(e) => {
                        const name = e.target.value;
                        const mapping = teacherMappings.find((t: any) => t.name === name);
                        setForm({...form, guruName: name, teacherCode: mapping?.code || '', isKegiatan: false});
                      }}
                      className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="">-- Pilih Guru --</option>
                      {guruList.map(g => (
                        <option key={g.id} value={g.nama}>{g.nama}</option>
                      ))}
                      {teacherMappings.filter((tm: any) => !guruList.find(g => g.nama === tm.name)).map((tm: any) => (
                        <option key={tm.code} value={tm.name}>{tm.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Pilih Kegiatan</label>
                    <select 
                      value={form.mataPelajaran}
                      onChange={(e) => setForm({...form, mataPelajaran: e.target.value, isKegiatan: true})}
                      className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-blue-600 bg-blue-50"
                    >
                      <option value="">-- Pilih Kegiatan --</option>
                      {kegiatanOptions.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Waktu / Jam Pelajaran</label>
                    <select 
                      onChange={(e) => {
                        const [start, end] = e.target.value.split(' - ');
                        setForm({...form, jamMulai: start, jamSelesai: end});
                      }}
                      className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="">-- Pilih Jam Pelajaran --</option>
                      {timeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Hari</label>
                    <select 
                      value={form.hari}
                      onChange={(e) => setForm({...form, hari: e.target.value})}
                      className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Tingkat</label>
                    <select 
                      value={form.kelas}
                      onChange={(e) => setForm({...form, kelas: e.target.value})}
                      className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="">-- Pilih Tingkat --</option>
                      <option value="SEMUA">(SEMUA)</option>
                      {tingkatList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Mata Pelajaran</label>
                    <select 
                      value={form.mataPelajaran}
                      onChange={(e) => setForm({...form, mataPelajaran: e.target.value})}
                      disabled={form.isKegiatan}
                      className={`w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold ${form.isKegiatan ? 'bg-slate-100 text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="">-- Pilih Mapel --</option>
                      {displayMapel.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Kelas / Rombel</label>
                    <select 
                      value={form.ruang}
                      onChange={(e) => setForm({...form, ruang: e.target.value})}
                      disabled={form.isKegiatan}
                      className={`w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold ${form.isKegiatan ? 'bg-slate-100 text-slate-400' : 'text-slate-800'}`}
                    >
                      <option value="">-- Pilih Rombel --</option>
                      {form.isKegiatan && <option value="SEMUA KELAS">SEMUA KELAS</option>}
                      {displayRombel.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleAddJadwal}
                  className={`w-full mt-2 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${
                    editingId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full max-h-[500px]">
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between items-center">
                <span>Daftar Jadwal (Semua Guru)</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{jadwalList.length} Jadwal</span>
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-2">
                {jadwalList.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm py-8">
                    Belum ada jadwal tersimpan.
                  </div>
                ) : (
                  jadwalList.sort((a,b) => {
                    const dayWeight: Record<string, number> = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
                    if (dayWeight[a.hari] !== dayWeight[b.hari]) return dayWeight[a.hari] - dayWeight[b.hari];
                    return a.jamMulai.localeCompare(b.jamMulai);
                  }).map(j => (
                    <div key={j.id} className="bg-white border border-slate-200 p-3 rounded-lg flex justify-between items-start gap-2 shadow-sm hover:border-blue-300 transition-colors">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{j.mataPelajaran} - {j.kelas}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{j.guruName}</div>
                        <div className="flex gap-2 mt-1.5">
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100">
                            {j.hari}
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-100">
                            {j.jamMulai} - {j.jamSelesai}
                          </span>
                          {j.ruang && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
                              {j.ruang}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleEdit(j)} className="text-slate-400 hover:text-blue-500 p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(j.id)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
