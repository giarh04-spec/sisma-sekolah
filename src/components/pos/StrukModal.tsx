import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Transaction, StoreSettings } from '../../types/pos';

interface StrukModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  settings: StoreSettings;
  onNewTransaction: () => void;
}

export const StrukModal: React.FC<StrukModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings,
  onNewTransaction
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }
    const receiptHtml = document.getElementById('receipt-print-area')?.innerHTML || '';
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran - ${transaction.trxNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 15px; width: 300px; margin: 0 auto; color: #000; background: #fff; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; }
            .pb-2 { padding-bottom: 8px; }
            .pb-3 { padding-bottom: 12px; }
            .pt-1 { padding-top: 4px; }
            .pt-3 { padding-top: 12px; }
            .space-y-0.5 > * + * { margin-top: 2px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="background: white; padding: 10px;">
            ${receiptHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }
    const receiptHtml = document.getElementById('receipt-print-area')?.innerHTML || '';
    printWindow.document.write(`
      <html>
        <head>
          <title>Simpan PDF - ${transaction.trxNumber}</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; width: 300px; margin: 0 auto; color: #000; background: #fff; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="background: white; padding: 10px;">
            ${receiptHtml}
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #666;">
            Tips: Pilih "Save as PDF" / "Simpan sebagai PDF" pada opsi printer.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header Success notification */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Pembayaran Berhasil!</h3>
              <p className="text-[10px] text-emerald-400 font-medium">Transaksi telah disimpan & stok otomatis berkurang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container */}
        <div className="p-6 overflow-y-auto max-h-[60vh] flex justify-center">
          <div id="receipt-print-area" className="w-full max-w-[320px] bg-white text-slate-900 p-4 font-mono text-[11px] shadow-lg rounded-lg space-y-3">
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <h2 className="font-bold text-sm tracking-wider">{settings.storeName}</h2>
              <p className="text-[10px] text-slate-600 whitespace-pre-line">{settings.storeAddress}</p>
              <p className="text-[10px] text-slate-600">Telp: {settings.storePhone}</p>
            </div>

            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>No: {transaction.trxNumber}</span>
                <span>{transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir: {transaction.cashierName}</span>
                <span>Member: {transaction.customerName || 'Umum'}</span>
              </div>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-semibold">{item.productName}</p>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>{item.qty} x {item.price.toLocaleString('id-ID')}</span>
                    <span className="font-semibold text-slate-900">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon</span>
                <span>Rp {transaction.discount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>TOTAL</span>
                <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Tunai ({transaction.paymentMethod.toUpperCase()})</span>
                <span>Rp {transaction.amountReceived.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Kembalian</span>
                <span>Rp {transaction.change.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-600 pt-3 border-t border-dashed border-slate-300 space-y-1 whitespace-pre-line">
              <p>{settings.receiptHeader}</p>
              <p className="font-bold">*** TERIMA KASIH ***</p>
              <p>{settings.receiptFooter}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#121214] border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> PDF / Simpan
          </button>
          <button
            onClick={() => {
              onNewTransaction();
              onClose();
            }}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
