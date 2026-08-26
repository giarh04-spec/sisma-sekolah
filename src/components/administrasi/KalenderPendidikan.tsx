import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';

interface KalenderEventItem {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  namaAcara: string;
  tipeAcara: string;
}

export const KalenderPendidikan: React.FC = () => {
  const [events, setEvents] = useState<KalenderEventItem[]>(() => {
    const saved = localStorage.getItem('edu_kalenderList');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState<Omit<KalenderEventItem, 'id'>>({
    tanggalMulai: '',
    tanggalSelesai: '',
    namaAcara: '',
    tipeAcara: 'Libur'
  });

  useEffect(() => {
    localStorage.setItem('edu_kalenderList', JSON.stringify(events));
  }, [events]);

  const handleAddEvent = () => {
    if (!form.tanggalMulai || !form.namaAcara) return;
    
    // Default tanggalSelesai to tanggalMulai if empty
    const end = form.tanggalSelesai || form.tanggalMulai;
    
    const newEvent: KalenderEventItem = {
      ...form,
      tanggalSelesai: end,
      id: Date.now().toString()
    };
    
    setEvents([...events, newEvent]);
    setForm({
      ...form,
      namaAcara: '',
      tanggalMulai: '',
      tanggalSelesai: ''
    });
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const tipeColors: Record<string, string> = {
    'Libur': 'bg-red-50 text-red-700 border-red-200',
    'Ujian': 'bg-orange-50 text-orange-700 border-orange-200',
    'Kegiatan Khusus': 'bg-purple-50 text-purple-700 border-purple-200',
    'Lainnya': 'bg-slate-50 text-slate-700 border-slate-200'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">Kalender Pendidikan</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-700 text-sm mb-2">Tambah Agenda</h4>
            
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Acara / Kegiatan</label>
              <input 
                type="text" 
                placeholder="Misal: Libur Semester Ganjil"
                value={form.namaAcara}
                onChange={e => setForm({...form, namaAcara: e.target.value})}
                className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Tipe Kegiatan</label>
              <select
                value={form.tipeAcara}
                onChange={e => setForm({...form, tipeAcara: e.target.value})}
                className="w-full text-sm p-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500 font-bold text-slate-800"
              >
                <option value="Libur">Libur</option>
                <option value="Ujian">Ujian (PTS/PAS)</option>
                <option value="Kegiatan Khusus">Kegiatan Khusus (Porseni dll)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Tgl Mulai</label>
                <input 
                  type="date" 
                  value={form.tanggalMulai}
                  onChange={e => setForm({...form, tanggalMulai: e.target.value})}
                  className="w-full text-[11px] p-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Tgl Selesai</label>
                <input 
                  type="date" 
                  value={form.tanggalSelesai}
                  onChange={e => setForm({...form, tanggalSelesai: e.target.value})}
                  className="w-full text-[11px] p-2 rounded-lg border border-slate-300 outline-none focus:border-emerald-500 font-bold text-slate-800"
                />
              </div>
            </div>

            <button 
              onClick={handleAddEvent}
              disabled={!form.namaAcara || !form.tanggalMulai}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Simpan Agenda
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between items-center">
              <span>Daftar Agenda Pendidikan</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{events.length} Acara</span>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {events.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">
                  Belum ada agenda pendidikan yang disimpan.
                </div>
              ) : (
                events.sort((a,b) => a.tanggalMulai.localeCompare(b.tanggalMulai)).map(e => {
                  // Format Date to short string
                  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
                  const startStr = new Date(e.tanggalMulai).toLocaleDateString('id-ID', dateOpts);
                  const endStr = new Date(e.tanggalSelesai).toLocaleDateString('id-ID', dateOpts);
                  const dateDisplay = startStr === endStr ? startStr : `${startStr} - ${endStr}`;
                  
                  return (
                    <div key={e.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{e.namaAcara}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-xs font-semibold text-slate-500">📅 {dateDisplay}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${tipeColors[e.tipeAcara] || tipeColors['Lainnya']}`}>
                            {e.tipeAcara}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(e.id)} className="text-slate-400 hover:text-red-500 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
