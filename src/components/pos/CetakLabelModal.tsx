import React, { useState } from 'react';
import { X, Printer, Barcode, Layers, FileText } from 'lucide-react';
import { Product } from '../../types/pos';
import { BarcodeSvg, generateBarcodeHtml } from './BarcodeSvg';

interface CetakLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const CetakLabelModal: React.FC<CetakLabelModalProps> = ({
  isOpen,
  onClose,
  products
}) => {
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [labelCount, setLabelCount] = useState<number>(1);
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=700');
    if (!printWindow) return;

    let labelsHtml = '';

    if (printMode === 'single' && currentProduct) {
      labelsHtml = Array.from({ length: labelCount }).map(() => `
        <div style="border: 1px solid #cbd5e1; padding: 10px; margin: 6px; width: 200px; text-align: center; font-family: sans-serif; display: inline-block; vertical-align: top; border-radius: 6px; background: #fff;">
          <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 1px;">KOPERASI SEKOLAH</div>
          <div style="font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 4px 0; color: #0f172a;">${currentProduct.name}</div>
          <div style="font-size: 13px; font-weight: 900; color: #2563eb; margin: 4px 0;">Rp ${currentProduct.sellingPrice.toLocaleString('id-ID')}</div>
          <div style="margin-top: 4px;">${generateBarcodeHtml(currentProduct.barcode || '8990001', 38)}</div>
        </div>
      `).join('');
    } else {
      labelsHtml = products.map(p => `
        <div style="border: 1px solid #cbd5e1; padding: 10px; margin: 6px; width: 200px; text-align: center; font-family: sans-serif; display: inline-block; vertical-align: top; border-radius: 6px; background: #fff;">
          <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 1px;">KOPERASI SEKOLAH</div>
          <div style="font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 4px 0; color: #0f172a;">${p.name}</div>
          <div style="font-size: 13px; font-weight: 900; color: #2563eb; margin: 4px 0;">Rp ${p.sellingPrice.toLocaleString('id-ID')}</div>
          <div style="margin-top: 4px;">${generateBarcodeHtml(p.barcode || '8990001', 38)}</div>
        </div>
      `).join('');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Label Barcode - ${printMode === 'single' ? currentProduct?.name : 'Semua Produk'}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${labelsHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalLabelsToPrint = printMode === 'single' ? labelCount : products.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121214]">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-base">Cetak Label Barcode Produk</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPrintMode('single')}
              className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                printMode === 'single'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Pilih 1 Produk
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('all')}
              className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                printMode === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Cetak Semua Produk ({products.length})
            </button>
          </div>

          {printMode === 'single' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Pilih Produk:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.barcode}) - Rp {p.sellingPrice.toLocaleString('id-ID')}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {printMode === 'single' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Jumlah Label:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={labelCount}
                  onChange={(e) => setLabelCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
            <div className={`space-y-1.5 ${printMode === 'all' ? 'col-span-2' : ''}`}>
              <label className="text-xs font-semibold text-slate-400">Ukuran Label:</label>
              <select
                value={labelSize}
                onChange={(e: any) => setLabelSize(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="small">Kecil (30x20mm)</option>
                <option value="medium">Sedang (50x30mm)</option>
                <option value="large">Besar (70x40mm)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-400">Pratinjau Label ({printMode === 'single' ? `${labelCount} pcs` : `${products.length} produk`}):</label>
            <div className="p-4 bg-white rounded-xl text-slate-900 flex flex-wrap gap-3 justify-center max-h-52 overflow-y-auto">
              {printMode === 'single' ? (
                Array.from({ length: Math.min(labelCount, 6) }).map((_, idx) => (
                  <div key={idx} className="border border-slate-300 p-2 rounded-lg w-44 text-center space-y-1 shadow-sm bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-wider truncate text-slate-700">KOPERASI SEKOLAH</p>
                    <p className="text-[11px] font-bold truncate text-slate-900">{currentProduct?.name}</p>
                    <BarcodeSvg value={currentProduct?.barcode || '8990001'} height={36} className="w-full h-10 bg-transparent" />
                    <p className="text-xs font-extrabold text-blue-600">Rp {currentProduct?.sellingPrice.toLocaleString('id-ID')}</p>
                  </div>
                ))
              ) : (
                products.slice(0, 6).map((p) => (
                  <div key={p.id} className="border border-slate-300 p-2 rounded-lg w-44 text-center space-y-1 shadow-sm bg-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-wider truncate text-slate-700">KOPERASI SEKOLAH</p>
                    <p className="text-[11px] font-bold truncate text-slate-900">{p.name}</p>
                    <BarcodeSvg value={p.barcode || '8990001'} height={36} className="w-full h-10 bg-transparent" />
                    <p className="text-xs font-extrabold text-blue-600">Rp {p.sellingPrice.toLocaleString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>
            {printMode === 'all' && products.length > 6 && (
              <p className="text-[11px] text-slate-400 text-center italic">Menampilkan 6 dari {products.length} produk (semua akan dicetak).</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#121214] border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Label ({totalLabelsToPrint} pcs)
          </button>
        </div>
      </div>
    </div>
  );
};
