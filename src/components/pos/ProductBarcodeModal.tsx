import React, { useState } from 'react';
import { X, Printer, Barcode as BarcodeIcon, Check, Download } from 'lucide-react';
import { Product } from '../../types/pos';
import { BarcodeSvg, generateBarcodeHtml, getBarcodeBars } from './BarcodeSvg';

interface ProductBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductBarcodeModal: React.FC<ProductBarcodeModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [copies, setCopies] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    const labelsHtml = Array.from({ length: copies }).map(() => `
      <div style="border: 1px dashed #cbd5e1; padding: 10px; margin: 6px; width: 190px; text-align: center; font-family: sans-serif; display: inline-block; vertical-align: top; border-radius: 6px; background: #fff;">
        <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 1px;">KOPERASI SEKOLAH / MART</div>
        <div style="font-size: 11px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 3px 0; color: #0f172a;">${product.name}</div>
        <div style="font-size: 13px; font-weight: 900; color: #059669; margin: 3px 0;">Rp ${product.sellingPrice.toLocaleString('id-ID')}</div>
        <div style="margin-top: 4px; background: #fff; padding: 2px;">${generateBarcodeHtml(product.barcode, 42)}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Barcode - ${product.name}</title>
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

  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Header
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOPERASI SEKOLAH / KASIR MART', canvas.width / 2, 42);

    // Product Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(product.name, canvas.width / 2, 70);

    // Price
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Rp ${product.sellingPrice.toLocaleString('id-ID')} / ${product.unit}`, canvas.width / 2, 95);

    // Barcode Container Box
    const startX = 50;
    const startY = 115;
    const barWidth = 500;
    const barHeight = 175;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, startY, barWidth, barHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, barWidth, barHeight);

    // Draw actual bars
    const barcodeStr = product.barcode || '8990001';
    let currX = startX + 25;
    const svgBars = getBarcodeBars(barcodeStr);
    const scaleX = 3.0;

    svgBars.forEach(bar => {
      if (bar.isBlack) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(currX, startY + 15, bar.width * scaleX, barHeight - 55);
      }
      currX += bar.width * scaleX;
    });

    // Barcode number text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`*${barcodeStr}*`, canvas.width / 2, startY + barHeight - 16);

    // Stock
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Stok Tersedia: ${product.stock} ${product.unit}`, canvas.width / 2, canvas.height - 22);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Barcode-${product.sku || product.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121214]">
          <div className="flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold text-base">Barcode Produk</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Product Header Info */}
          <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <img
              src={product.photo || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4c?w=300&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
              <p className="text-xs text-slate-400">SKU: <span className="font-mono text-slate-300">{product.sku}</span></p>
              <p className="text-xs font-extrabold text-emerald-400">Rp {product.sellingPrice.toLocaleString('id-ID')} / {product.unit}</p>
            </div>
          </div>

          {/* Barcode Preview Box */}
          <div className="bg-white p-6 rounded-2xl text-slate-900 flex flex-col items-center justify-center space-y-3 shadow-inner">
            <div className="text-[10px] font-black tracking-widest text-slate-600 uppercase">KOPERASI SEKOLAH / KASIR MART</div>
            <div className="text-sm font-bold text-slate-900 text-center">{product.name}</div>
            
            {/* Realistic Barcode SVG */}
            <div className="w-full max-w-[280px]">
              <BarcodeSvg value={product.barcode} height={64} />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono font-bold tracking-widest text-sm text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                {product.barcode}
              </span>
              <button
                onClick={handleCopyBarcode}
                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                title="Salin Barcode"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : 'Salin'}
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-medium">Stok Tersedia: {product.stock} {product.unit}</div>
          </div>

          {/* Print Copies Config */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Jumlah Cetak Label:</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={50}
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                className="w-24 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs text-center font-bold"
              />
              <span className="text-xs text-slate-400">lembar label barcode untuk produk ini</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#121214] border-t border-slate-800 flex justify-between items-center gap-3">
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            title="Download PNG"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak ({copies})
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

