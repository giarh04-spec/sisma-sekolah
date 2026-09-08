import React, { useState } from 'react';
import { Search, Plus, UserCheck, Award, Phone, Mail } from 'lucide-react';
import { Customer } from '../../types/pos';

interface PelangganViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
}

export const PelangganView: React.FC<PelangganViewProps> = ({
  customers,
  onAddCustomer
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.memberCode.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nama dan nomor HP wajib diisi!');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      memberCode: `MEM-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '-',
      points: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    onAddCustomer(newCust);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Manajemen Pelanggan & Member</h2>
          <p className="text-xs text-slate-400">Kelola data member, poin reward, dan riwayat belanja pelanggan.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Member Baru
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama member, kode, atau no HP..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold rounded-lg">
                  {c.memberCode}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{c.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#18181b] p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Poin Reward</p>
                <p className="text-sm font-black text-amber-400">{c.points} Poin</p>
              </div>
              <div className="bg-[#18181b] p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Total Belanja</p>
                <p className="text-xs font-black text-emerald-400">Rp {c.totalSpent.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121214]">
              <h3 className="text-white font-bold text-base">Tambah Member Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Nomor HP / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
