import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, Trash2, Plus, Minus, ShoppingCart, CreditCard, Check, Barcode, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Product, CartItem, Customer, Transaction, StoreSettings, PaymentMethod } from '../../types/pos';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { StrukModal } from './StrukModal';

interface KasirPOSViewProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onCompleteTransaction: (trx: Transaction) => void;
  currentUser: { name: string; id: string };
  onUpdateStock: (productId: string, qtyChange: number, note: string) => void;
}

export const KasirPOSView: React.FC<KasirPOSViewProps> = ({
  products,
  customers,
  settings,
  onCompleteTransaction,
  currentUser,
  onUpdateStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-gen');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedTrx, setCompletedTrx] = useState<Transaction | null>(null);
  const [isStrukOpen, setIsStrukOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts (F1, F2, F3, F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsScannerOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        // focus payment input
        const payInput = document.getElementById('payment-amount-input');
        payInput?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCart([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search product filtered list
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Stok produk "${product.name}" habis!`);
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        if (item.qty + 1 > product.stock) {
          alert(`Jumlah melebihi stok tersedia (${product.stock})!`);
          return prevCart;
        }
        const updated = [...prevCart];
        const newQty = item.qty + 1;
        updated[existingIndex] = {
          ...item,
          qty: newQty,
          subtotal: newQty * item.product.sellingPrice * (1 - (item.discount / 100))
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            qty: 1,
            discount: product.discount || 0,
            subtotal: product.sellingPrice * (1 - ((product.discount || 0) / 100))
          }
        ];
      }
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            alert(`Stok tidak mencukupi! Sisa stok: ${item.product.stock}`);
            return item;
          }
          return {
            ...item,
            qty: newQty,
            subtotal: newQty * item.product.sellingPrice * (1 - (item.discount / 100))
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountTotal = 0;
  const tax = Math.round(subtotal * ((settings.taxRate || 0) / 100));
  const grandTotal = subtotal - discountTotal + tax;

  const numericReceived = parseFloat(amountReceived) || 0;
  const changeAmount = numericReceived >= grandTotal ? numericReceived - grandTotal : 0;

  const handleScanSuccess = (code: string) => {
    const cleanCode = code.trim();
    const found = products.find(p => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase() || p.barcode.includes(cleanCode) || cleanCode.includes(p.barcode));
    if (found) {
      addToCart(found);
    } else {
      const tempProduct: Product = {
        id: `prod-scanned-${Date.now()}`,
        name: `Produk Barcode (${cleanCode})`,
        sku: `SKU-${cleanCode}`,
        barcode: cleanCode,
        categoryId: 'cat-umum',
        purchasePrice: 5000,
        sellingPrice: 10000,
        stock: 99,
        unit: 'pcs',
        minStock: 5,
        discount: 0,
        supplierId: 'sup-1',
        branchId: 'branch-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4c?w=300&auto=format&fit=crop&q=80'
      };
      addToCart(tempProduct);
    }
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }
    if (paymentMethod === 'cash' && numericReceived < grandTotal) {
      alert('Uang pembayaran kurang dari total belanja!');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const trxNumber = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      trxNumber,
      date: dateStr,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      branchId: settings.activeBranchId || 'branch-1',
      customerId: selectedCustomerId,
      customerName: customer ? customer.name : 'Pelanggan Umum',
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        price: item.product.sellingPrice,
        purchasePrice: item.product.purchasePrice,
        qty: item.qty,
        discount: item.discount,
        subtotal: item.subtotal
      })),
      subtotal,
      discount: discountTotal,
      tax,
      total: grandTotal,
      amountReceived: paymentMethod === 'cash' ? numericReceived : grandTotal,
      change: paymentMethod === 'cash' ? changeAmount : 0,
      paymentMethod,
      status: 'completed'
    };

    // Update stock for each item
    cart.forEach(item => {
      onUpdateStock(
        item.product.id,
        -item.qty,
        `Penjualan Kasir (${trxNumber})`
      );
    });

    onCompleteTransaction(newTrx);
    setCompletedTrx(newTrx);
    setIsStrukOpen(true);
    setCart([]);
    setAmountReceived('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* LEFT AREA: Product Search & Cart */}
      <div className="lg:col-span-7 flex flex-col gap-4 bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181b] p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-400">Kasir Bertugas:</p>
              <p className="text-sm font-bold text-white">{currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-white">
                {currentTime.toLocaleTimeString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-400">
                {currentTime.toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </p>
            </div>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all shrink-0"
            >
              <Camera className="w-4 h-4" /> SCAN BARCODE [F2]
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, scan barcode, atau SKU... [Tekan F1]"
            className="w-full pl-11 pr-4 py-3 bg-[#18181b] border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Search Results Dropdown / Quick Grid if searching */}
        {searchQuery.trim() !== '' && (
          <div className="max-h-52 overflow-y-auto space-y-1.5 bg-[#18181b] p-2 rounded-xl border border-slate-800 z-10 shadow-lg">
            <p className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Hasil Pencarian Produk:</p>
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 text-center">Produk tidak ditemukan.</p>
            ) : (
              filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => {
                    addToCart(prod);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-600/20 border border-transparent hover:border-blue-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={prod.photo} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">Barcode: {prod.barcode} | Stok: <span className={prod.stock <= prod.minStock ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{prod.stock} {prod.unit}</span></p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-blue-400">Rp {prod.sellingPrice.toLocaleString('id-ID')}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cart Items Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-blue-400" /> Keranjang Belanja ({cart.reduce((a, b) => a + b.qty, 0)} item)
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Kosongkan [F4]
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#18181b]/50 border border-dashed border-slate-800 rounded-xl space-y-2">
              <ShoppingCart className="w-10 h-10 text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-300">Keranjang Belanja Kosong</p>
              <p className="text-[10px] text-slate-500 max-w-xs">Silakan scan barcode, ketik nama produk pada kolom pencarian, atau pilih dari katalog produk.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-[#18181b] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Rp {item.product.sellingPrice.toLocaleString('id-ID')} / {item.product.unit}
                    </p>
                  </div>

                  {/* Qty controller */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.product.id, -1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.product.id, 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-extrabold text-blue-400">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Shopping Summary & Checkout */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" /> Ringkasan Pembayaran
          </h3>

          {/* Member Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pelanggan / Member:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#18181b] border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.memberCode})</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Pembayaran:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash / Tunai' },
                { id: 'qris', label: 'QRIS' },
                { id: 'transfer', label: 'Transfer' },
                { id: 'debit', label: 'Kartu Debit' },
                { id: 'kredit', label: 'Kartu Kredit' },
                { id: 'ewallet', label: 'E-Wallet' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition-all ${
                    paymentMethod === m.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-[#18181b] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-[#18181b] border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Diskon</span>
              <span className="font-mono text-emerald-400">- Rp {discountTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Pajak (PPN {settings.taxRate}%)</span>
              <span className="font-mono text-white">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">Total Tagihan</span>
              <span className="text-lg font-black font-mono text-blue-400">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Cash Received Input */}
          {paymentMethod === 'cash' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uang Pembayaran (Tunai): [F3]</label>
              <input
                id="payment-amount-input"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Masukkan nominal uang..."
                className="w-full px-4 py-3 bg-[#18181b] border border-slate-800 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400">Kembalian:</span>
                <span className={`font-bold font-mono ${changeAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Rp {changeAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Big Checkout Button */}
        <div className="pt-4">
          <button
            onClick={handleProcessPayment}
            disabled={cart.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> PROSES PEMBAYARAN [F3]
          </button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        products={products}
      />

      {/* Receipt Success Modal */}
      <StrukModal
        isOpen={isStrukOpen}
        onClose={() => setIsStrukOpen(false)}
        transaction={completedTrx}
        settings={settings}
        onNewTransaction={() => {
          setCart([]);
          setCompletedTrx(null);
        }}
      />
    </div>
  );
};
