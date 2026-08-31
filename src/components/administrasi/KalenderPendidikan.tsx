import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight, CalendarDays, Info } from 'lucide-react';

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

  // Current viewed month & year
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Default to August 2026 based on metadata
    return new Date(2026, 7, 31);
  });

  // Highlighted/Selected date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date(2026, 7, 31);
  });

  const [form, setForm] = useState<Omit<KalenderEventItem, 'id'>>({
    tanggalMulai: '2026-08-31',
    tanggalSelesai: '2026-08-31',
    namaAcara: '',
    tipeAcara: 'Libur'
  });

  useEffect(() => {
    localStorage.setItem('edu_kalenderList', JSON.stringify(events));
  }, [events]);

  const toLocalISOString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Pre-fill form dates when selectedDate changes
  useEffect(() => {
    const formatted = toLocalISOString(selectedDate);
    setForm(f => ({
      ...f,
      tanggalMulai: formatted,
      tanggalSelesai: formatted
    }));
  }, [selectedDate]);

  const handleAddEvent = () => {
    if (!form.tanggalMulai || !form.namaAcara) return;
    
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
      tanggalMulai: toLocalISOString(selectedDate),
      tanggalSelesai: toLocalISOString(selectedDate)
    });
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  // Color mappings for UI badges and event indicators
  const tipeColors: Record<string, { bg: string, text: string, border: string, dot: string, light: string }> = {
    'Libur': { 
      bg: 'bg-rose-50 text-rose-700 border-rose-200', 
      text: 'text-rose-700',
      border: 'border-rose-100',
      dot: 'bg-rose-500', 
      light: 'bg-rose-500/10' 
    },
    'Ujian': { 
      bg: 'bg-amber-50 text-amber-700 border-amber-200', 
      text: 'text-amber-700',
      border: 'border-amber-100',
      dot: 'bg-amber-500', 
      light: 'bg-amber-500/10' 
    },
    'Kegiatan Khusus': { 
      bg: 'bg-purple-50 text-purple-700 border-purple-200', 
      text: 'text-purple-700',
      border: 'border-purple-100',
      dot: 'bg-purple-500', 
      light: 'bg-purple-500/10' 
    },
    'Lainnya': { 
      bg: 'bg-blue-50 text-blue-700 border-blue-200', 
      text: 'text-blue-700',
      border: 'border-blue-100',
      dot: 'bg-blue-500', 
      light: 'bg-blue-500/10' 
    }
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => {
    const date = new Date(y, m, 1);
    const days = [];
    
    // Find previous month padding
    const firstDayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const prevMonthDate = new Date(y, m, 0);
    const prevMonthDaysCount = prevMonthDate.getDate();
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(y, m - 1, prevMonthDaysCount - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    const currentMonthDaysCount = new Date(y, m + 1, 0).getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push({
        date: new Date(y, m, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month padding to complete 42 days (6 rows of 7 days)
    const totalSlots = 42;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(y, m + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(year, month);

  // Helper to find events falling on a given day
  const getEventsForDate = (d: Date) => {
    const targetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return events.filter(e => {
      const start = new Date(e.tanggalMulai);
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const end = new Date(e.tanggalSelesai);
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return targetTime >= startTime && targetTime <= endTime;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const selectedDayEvents = getEventsForDate(selectedDate);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Kalender Pendidikan</h3>
            <p className="text-xs text-slate-500 font-bold">Kelola agenda akademik, hari libur, jadwal ujian, dan kegiatan khusus sekolah.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add Event & Selected Day Events */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form Tambah Agenda */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 space-y-4">
            <h4 className="font-black text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Tambah Agenda Pendidikan
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Nama Acara / Kegiatan</label>
                <input 
                  type="text" 
                  placeholder="Misal: Ujian Semester, Libur Lebaran..."
                  value={form.namaAcara}
                  onChange={e => setForm({...form, namaAcara: e.target.value})}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Tipe Kegiatan</label>
                <select
                  value={form.tipeAcara}
                  onChange={e => setForm({...form, tipeAcara: e.target.value})}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-800 transition-all"
                >
                  <option value="Libur">Libur</option>
                  <option value="Ujian">Ujian (PTS/PAS)</option>
                  <option value="Kegiatan Khusus">Kegiatan Khusus (Porseni dll)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Tgl Mulai</label>
                  <input 
                    type="date" 
                    value={form.tanggalMulai}
                    onChange={e => setForm({...form, tanggalMulai: e.target.value})}
                    className="w-full text-[11px] p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Tgl Selesai</label>
                  <input 
                    type="date" 
                    value={form.tanggalSelesai}
                    onChange={e => setForm({...form, tanggalSelesai: e.target.value})}
                    className="w-full text-[11px] p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddEvent}
                disabled={!form.namaAcara || !form.tanggalMulai}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-lg shadow-emerald-600/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Agenda
              </button>
            </div>
          </div>

          {/* Selected Date Detail */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detail Agenda Terpilih</span>
              <span className="text-xs font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  Tidak ada agenda pada tanggal ini. Ketuk tanggal pada kalender untuk merencanakan agenda baru.
                </div>
              ) : (
                selectedDayEvents.map(e => {
                  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                  const sDisp = new Date(e.tanggalMulai).toLocaleDateString('id-ID', opts);
                  const eDisp = new Date(e.tanggalSelesai).toLocaleDateString('id-ID', opts);
                  const isSingle = sDisp === eDisp;
                  const colors = tipeColors[e.tipeAcara] || tipeColors['Lainnya'];

                  return (
                    <div key={e.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 group">
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">{e.namaAcara}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-bold">📅 {isSingle ? sDisp : `${sDisp} - ${eDisp}`}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider border ${colors.bg}`}>
                            {e.tipeAcara}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(e.id)} 
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: The interactive monthly calendar grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h4 className="font-black text-sm uppercase tracking-widest">{monthNames[month]} {year}</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Sistem Manajemen Kalender Akademik</p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid Boxed */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/60 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 py-3">
              <div className="text-red-500">Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            {/* Date cells grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/80 bg-slate-200/40">
              {calendarDays.map((cell, index) => {
                const dayEvents = getEventsForDate(cell.date);
                const isSelected = selectedDate.toDateString() === cell.date.toDateString();
                const isToday = new Date().toDateString() === cell.date.toDateString();
                const isSunday = cell.date.getDay() === 0;

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`min-h-[96px] bg-white p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-50/80 relative group ${
                      !cell.isCurrentMonth ? 'opacity-35' : ''
                    } ${isSelected ? 'ring-2 ring-emerald-600 ring-inset bg-emerald-500/5' : ''}`}
                  >
                    {/* Day number & Today badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                        isToday ? 'bg-emerald-600 text-white' : 
                        isSunday ? 'text-rose-600' : 'text-slate-700'
                      }`}>
                        {cell.date.getDate()}
                      </span>
                      {isToday && (
                        <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Hari Ini</span>
                      )}
                    </div>

                    {/* Day events visual indicators */}
                    <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end">
                      {dayEvents.slice(0, 2).map((e) => {
                        const colors = tipeColors[e.tipeAcara] || tipeColors['Lainnya'];
                        return (
                          <div 
                            key={e.id}
                            title={`${e.namaAcara} (${e.tipeAcara})`}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate max-w-full border ${colors.bg} ${colors.text}`}
                          >
                            {e.namaAcara}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-black text-slate-400 pl-1">
                          +{dayEvents.length - 2} Lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Legend & Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Petunjuk Tipe Kegiatan:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-700">Libur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-amber-700">Ujian</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-purple-700">Kegiatan Khusus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-blue-700">Lainnya</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

