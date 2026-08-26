import React, { useState, useEffect } from 'react';
import { Clock, Plus, AlertCircle, Save, Trash2 } from 'lucide-react';
import { Guru, MataPelajaranItem, RombelKelas } from '../../types/school';

interface JadwalMengajarProps {
  guruList: Guru[];
  mapelList: MataPelajaranItem[];
  rombelList: RombelKelas[];
}

interface JadwalMengajarItem {
  id: string;
  guruName: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kelas: string;
  mataPelajaran: string;
  ruang: string;
}

export const JadwalMengajar: React.FC<JadwalMengajarProps> = ({ guruList, mapelList, rombelList }) => {
  const [jadwalList, setJadwalList] = useState<JadwalMengajarItem[]>(() => {
    const saved = localStorage.getItem('edu_jadwalMengajarList');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState<Omit<JadwalMengajarItem, 'id'>>({
    guruName: '',
    hari: 'Senin',
    jamMulai: '07:00',
    jamSelesai: '08:30',
    kelas: '',
    mataPelajaran: '',
    ruang: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('edu_jadwalMengajarList', JSON.stringify(jadwalList));
  }, [jadwalList]);

  // Check if two times intersect (Format: "HH:mm")
  const isTimeConflict = (start1: string, end1: string, start2: string, end2: string) => {
    return (start1 < end2 && end1 > start2);
  };

  const handleAddJadwal = () => {
    setError('');
    
    if (!form.guruName || !form.kelas || !form.mataPelajaran) {
      setError('Harap lengkapi data Guru, Kelas, dan Mata Pelajaran.');
      return;
    }

    if (form.jamMulai >= form.jamSelesai) {
      setError('Jam Mulai harus lebih awal dari Jam Selesai.');
      return;
    }

    // Conflict detection
    const conflict = jadwalList.find(
      (j) => 
        j.guruName === form.guruName && 
        j.hari === form.hari && 
        isTimeConflict(form.jamMulai, form.jamSelesai, j.jamMulai, j.jamSelesai)
    );

    if (conflict) {
      setError(`Konflik Jadwal! ${form.guruName} sudah memiliki jadwal di kelas ${conflict.kelas} pada jam ${conflict.jamMulai} - ${conflict.jamSelesai}.`);
      return;
    }

    const newItem: JadwalMengajarItem = {
      ...form,
      id: Date.now().toString()
    };

    setJadwalList([...jadwalList, newItem]);
    
    // reset form but keep guruName to make it easier for adding multiple classes
    setForm(prev => ({
      ...prev,
      kelas: '',
      mataPelajaran: '',
      ruang: ''
    }));
  };

  const handleDelete = (id: string) => {
    setJadwalList(jadwalList.filter(j => j.id !== id));
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const tingkatList = ['VII (SMP)', 'VIII (SMP)', 'IX (SMP)', 'X (SMA)', 'XI (SMA)', 'XII (SMA)'];
  
  const displayRombel = rombelList && rombelList.length > 0 
    ? rombelList.map(r => r.namaRombel)
    : ['VII A', 'VII B', 'VII C', 'VIII A', 'VIII B', 'VIII C', 'IX A', 'IX B', 'IX C', 'X-1', 'X-2', 'XI-1', 'XI-2', 'XII-1', 'XII-2'];
  
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
    'Ekstrakurikuler'
  ];

  const displayMapel = mapelList && mapelList.length > 0 
    ? mapelList.map(m => m.namaMapel) 
    : defaultMapel;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">Jadwal Mengajar Guru</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-700 text-sm mb-4">Tambah Jadwal Baru</h4>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-start gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Guru Pengajar</label>
              <select 
                value={form.guruName} 
                onChange={(e) => setForm({...form, guruName: e.target.value})}
                className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
              >
                <option value="">-- Pilih Guru --</option>
                {guruList.map(g => (
                  <option key={g.id} value={g.nama}>{g.nama}</option>
                ))}
              </select>
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
                  {tingkatList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Jam Mulai</label>
                <input 
                  type="time" 
                  value={form.jamMulai}
                  onChange={(e) => setForm({...form, jamMulai: e.target.value})}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Jam Selesai</label>
                <input 
                  type="time" 
                  value={form.jamSelesai}
                  onChange={(e) => setForm({...form, jamSelesai: e.target.value})}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Mata Pelajaran</label>
                <select 
                  value={form.mataPelajaran}
                  onChange={(e) => setForm({...form, mataPelajaran: e.target.value})}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
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
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-blue-500 font-bold text-slate-800"
                >
                  <option value="">-- Pilih Rombel --</option>
                  {displayRombel.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleAddJadwal}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Simpan Jadwal
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
                  <button onClick={() => handleDelete(j.id)} className="text-slate-400 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
