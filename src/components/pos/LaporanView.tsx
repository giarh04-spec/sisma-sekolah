import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Download, Printer } from 'lucide-react';
import { Transaction, Product, Category, StockMovement } from '../../types/pos';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';

interface LaporanViewProps {
  transactions: Transaction[];
  products: Product[];
  categories: Category[];
  stockMovements: StockMovement[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  transactions,
  products,
  categories,
  stockMovements
}) => {
  const [reportType, setReportType] = useState<'sales' | 'profit' | 'product' | 'stock'>('sales');

  // Calculate profit: (sellingPrice - purchasePrice) * qty
  const totalProfit = transactions.reduce((acc, t) => {
    const trxProfit = t.items.reduce((itemAcc, item) => {
      const profitPerUnit = item.price - item.purchasePrice;
      return itemAcc + (profitPerUnit * item.qty);
    }, 0);
    return acc + trxProfit;
  }, 0);

  const totalSalesAmount = transactions.reduce((acc, t) => acc + t.total, 0);

  // Chart data for daily sales
  const chartData = [
    { day: 'Senin', sales: 450000 },
    { day: 'Selasa', sales: 620000 },
    { day: 'Rabu', sales: 580000 },
    { day: 'Kamis', sales: 710000 },
    { day: 'Jumat', sales: 890000 },
    { day: 'Sabtu', sales: 1250000 },
    { day: 'Minggu', sales: 980000 },
  ];

  const exportExcel = async () => {
    const workbook = new XLSX.Workbook();
    const sheet = workbook.addWorksheet('Laporan Kasir Mart');
    sheet.columns = [
      { header: 'No TRX', key: 'trxNumber', width: 20 },
      { header: 'Tanggal', key: 'date', width: 20 },
      { header: 'Kasir', key: 'cashierName', width: 15 },
      { header: 'Total (Rp)', key: 'total', width: 15 },
    ];
    transactions.forEach(t => sheet.addRow(t));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Laporan_Penjualan_KasirMart.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Laporan & Analisis Keuangan</h2>
          <p className="text-xs text-slate-400">Analisis penjualan, laba rugi, pergerakan stok, dan performa kasir.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'sales', label: 'Laporan Penjualan', icon: TrendingUp },
          { id: 'profit', label: 'Laporan Laba / Keuntungan', icon: DollarSign },
          { id: 'product', label: 'Laporan Produk Terlaris', icon: Package },
          { id: 'stock', label: 'Laporan Stok Barang', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                reportType === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#121214] border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-slate-400">Total Penjualan Keseluruhan</p>
              <p className="text-xl font-black text-white mt-1">Rp {totalSalesAmount.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-slate-400">Total Transaksi Berhasil</p>
              <p className="text-xl font-black text-blue-400 mt-1">{transactions.length} Transaksi</p>
            </div>
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-slate-400">Rata-rata Nilai Transaksi</p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                Rp {transactions.length ? Math.round(totalSalesAmount / transactions.length).toLocaleString('id-ID') : 0}
              </p>
            </div>
          </div>

          <div className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Grafik Penjualan 7 Hari Terakhir</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'profit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-semibold text-slate-400">Estimasi Total Laba / Keuntungan Bersih</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">Rp {totalProfit.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500 mt-2">Dihitung dari selisih Harga Jual dikurangi Harga Beli dikali kuantitas terjual.</p>
            </div>
            <div className="bg-[#121214] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-semibold text-slate-400">Persentase Margin Keuntungan</p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {totalSalesAmount ? ((totalProfit / totalSalesAmount) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {reportType === 'product' && (
        <div className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Produk Terlaris Berdasarkan Volume Penjualan</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#18181b]">
                <th className="p-4">Nama Produk</th>
                <th className="p-4">Barcode</th>
                <th className="p-4 text-center">Stok Saat Ini</th>
                <th className="p-4 text-right">Harga Jual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4 font-mono text-slate-400">{p.barcode}</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">{p.stock} {p.unit}</td>
                  <td className="p-4 text-right font-mono text-white">Rp {p.sellingPrice.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'stock' && (
        <div className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Laporan Audit Pergerakan Stok</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#18181b]">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Produk</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 text-center">Perubahan</th>
                <th className="p-4 text-center">Stok Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stockMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-900/50">
                  <td className="p-4 text-slate-400">{m.date}</td>
                  <td className="p-4 font-bold text-white">{m.productName}</td>
                  <td className="p-4 text-slate-300">{m.note}</td>
                  <td className={`p-4 text-center font-bold ${m.qtyChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                  </td>
                  <td className="p-4 text-center text-white font-mono">{m.stockAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
