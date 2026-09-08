import React from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Transaction, Product } from '../../types/pos';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, products }) => {
  const totalSalesToday = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalItemsSold = transactions.reduce((acc, t) => {
    return acc + t.items.reduce((iAcc, item) => iAcc + item.qty, 0);
  }, 0);

  const totalProfitToday = transactions.reduce((acc, t) => {
    const trxProfit = t.items.reduce((itemAcc, item) => {
      return itemAcc + ((item.price - item.purchasePrice) * item.qty);
    }, 0);
    return acc + trxProfit;
  }, 0);

  const chartData = [
    { name: '08:00', penjualan: 120000 },
    { name: '10:00', penjualan: 350000 },
    { name: '12:00', penjualan: 890000 },
    { name: '14:00', penjualan: 450000 },
    { name: '16:00', penjualan: 670000 },
    { name: '18:00', penjualan: 950000 },
    { name: '20:00', penjualan: 420000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Dashboard Administrator Kasir Mart</h2>
        <p className="text-xs text-slate-400">Ringkasan statistik penjualan, transaksi real-time, dan performa minimarket.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">TOTAL PENJUALAN HARI INI</p>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white font-mono">Rp {totalSalesToday.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3 h-3" /> +12.5% dari kemarin
          </div>
        </div>

        <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">TRANSAKSI HARI INI</p>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white">{transactions.length} Transaksi</p>
          <p className="text-[10px] text-slate-500">Semua kasir aktif</p>
        </div>

        <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">PRODUK TERJUAL</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-white">{totalItemsSold} Item</p>
          <p className="text-[10px] text-slate-500">Stok otomatis berkurang</p>
        </div>

        <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">LABA HARI INI</p>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">Rp {totalProfitToday.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-slate-500">Margin bersih</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Grafik Tren Penjualan Jam ke Jam</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="penjualan" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
