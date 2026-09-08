import React, { useState } from 'react';
import { Search, PackagePlus, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Product, StockMovement } from '../../types/pos';

interface StokViewProps {
  products: Product[];
  stockMovements: StockMovement[];
  onUpdateStock: (productId: string, qtyChange: number, note: string) => void;
}

export const StokView: React.FC<StokViewProps> = ({
  products,
  stockMovements,
  onUpdateStock
}) => {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [qtyChange, setQtyChange] = useState<number>(10);
  const [note, setNote] = useState('');

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || qtyChange <= 0) {
      alert('Pilih produk dan masukkan jumlah stok yang valid!');
      return;
    }

    const actualChange = movementType === 'out' ? -qtyChange : qtyChange;
    onUpdateStock(selectedProductId, actualChange, note || `Penyesuaian stok (${movementType})`);
    setNote('');
    setQtyChange(10);
    alert('Stok berhasil diperbarui!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Manajemen & Opname Stok</h2>
        <p className="text-xs text-slate-400">Pantau stok barang masuk, keluar, dan peringatan stok menipis secara otomatis.</p>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">⚠️ Perhatian: {lowStockProducts.length} Produk Mencapai Stok Minimum!</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {lowStockProducts.map(p => (
                <span key={p.id} className="px-2.5 py-1 bg-red-900/50 border border-red-500/30 text-red-200 text-[10px] font-bold rounded-lg">
                  {p.name} (Sisa: {p.stock} {p.unit})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Form & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-blue-400" /> Form Penyesuaian Stok
          </h3>
          <form onSubmit={handleStockSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Pilih Produk:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock} {p.unit})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Jenis Pergerakan:</label>
              <select
                value={movementType}
                onChange={(e: any) => setMovementType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              >
                <option value="in">Stok Masuk (Penambahan)</option>
                <option value="out">Stok Keluar (Pengurangan)</option>
                <option value="adjustment">Opname / Koreksi Stok</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Jumlah Qty:</label>
              <input
                type="number"
                min={1}
                value={qtyChange}
                onChange={(e) => setQtyChange(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Catatan / Keterangan:</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Barang dari supplier baru..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Simpan Perubahan Stok
            </button>
          </form>
        </div>

        {/* Stock Movement History */}
        <div className="lg:col-span-7 bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-blue-400" /> Riwayat Perubahan Stok
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-1">
            {stockMovements.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada riwayat pergerakan stok.</p>
            ) : (
              stockMovements.map(m => (
                <div key={m.id} className="bg-[#18181b] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      m.qtyChange > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {m.qtyChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{m.productName}</p>
                      <p className="text-[10px] text-slate-400">{m.note} • {m.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-extrabold font-mono ${m.qtyChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                    </span>
                    <p className="text-[10px] text-slate-500">Stok: {m.stockBefore} ➔ {m.stockAfter}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
