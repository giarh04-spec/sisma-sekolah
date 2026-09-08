import React, { useState } from 'react';
import { Search, FileText, Printer, Eye, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { Transaction, StoreSettings } from '../../types/pos';
import { StrukModal } from './StrukModal';

interface TransaksiViewProps {
  transactions: Transaction[];
  settings: StoreSettings;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  transactions,
  settings
}) => {
  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = transactions.filter(t =>
    t.trxNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
    (t.customerName && t.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Riwayat Transaksi Penjualan</h2>
          <p className="text-xs text-slate-400">Daftar seluruh transaksi kasir yang berhasil diproses.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor transaksi, kasir..."
            className="w-full pl-10 pr-4 py-2 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#18181b]">
                <th className="p-4">No. Transaksi</th>
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">Kasir</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Metode</th>
                <th className="p-4 text-right">Total (Rp)</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Belum ada data transaksi.</td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-400">{t.trxNumber}</td>
                    <td className="p-4 text-slate-300">{t.date}</td>
                    <td className="p-4 text-white font-medium">{t.cashierName}</td>
                    <td className="p-4 text-slate-300">{t.customerName || 'Umum'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-lg text-[10px] uppercase">
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-white font-mono">
                      Rp {t.total.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTrx(t);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Struk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StrukModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTrx}
        settings={settings}
        onNewTransaction={() => {}}
      />
    </div>
  );
};
