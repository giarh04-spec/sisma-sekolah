import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Barcode, Printer, Download, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Product, Category, Supplier } from '../../types/pos';
import { CetakLabelModal } from './CetakLabelModal';
import { ProductBarcodeModal } from './ProductBarcodeModal';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';

interface ProdukViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProdukView: React.FC<ProdukViewProps> = ({
  products,
  categories,
  suppliers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    barcode: string;
    sku: string;
    categoryId: string;
    supplierId: string;
    unit: Product['unit'];
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    minStock: number;
    description: string;
    photo: string;
    status: Product['status'];
  }>({
    name: '',
    barcode: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    unit: 'pcs' as const,
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 10,
    description: '',
    photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4c?w=300&auto=format&fit=crop&q=80',
    status: 'active' as const
  });

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: `899${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      unit: 'pcs',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 50,
      minStock: 10,
      description: '',
      photo: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4c?w=300&auto=format&fit=crop&q=80',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      barcode: p.barcode,
      sku: p.sku,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      minStock: p.minStock,
      description: p.description || '',
      photo: p.photo || '',
      status: p.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.sellingPrice <= 0) {
      alert('Nama produk dan harga jual wajib diisi dengan benar!');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
        updatedAt: new Date().toISOString().substring(0, 10)
      });
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        ...formData,
        discount: 0,
        branchId: 'branch-1',
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().substring(0, 10)
      };
      onAddProduct(newProd);
    }
    setIsModalOpen(false);
  };

  const exportExcel = async () => {
    const workbook = new XLSX.Workbook();
    const sheet = workbook.addWorksheet('Data Produk');
    sheet.columns = [
      { header: 'Barcode', key: 'barcode', width: 18 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Nama Produk', key: 'name', width: 30 },
      { header: 'Satuan', key: 'unit', width: 10 },
      { header: 'Harga Beli', key: 'purchasePrice', width: 15 },
      { header: 'Harga Jual', key: 'sellingPrice', width: 15 },
      { header: 'Stok', key: 'stock', width: 10 },
    ];
    products.forEach(p => sheet.addRow(p));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Data_Produk_KasirMart.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Manajemen Data Produk</h2>
          <p className="text-xs text-slate-400">Kelola katalog barang, harga jual, stok minimum, dan cetak label barcode.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLabelModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Label Barcode
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, barcode, atau SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
        >
          <option value="all">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-[#18181b]">
                <th className="p-4">Foto & Produk</th>
                <th className="p-4">Barcode / SKU</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-right">Harga Beli</th>
                <th className="p-4 text-right">Harga Jual</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Produk tidak ditemukan.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0" />
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.unit}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <p className="font-bold text-blue-400">{p.barcode}</p>
                      <p className="text-[10px] text-slate-500">{p.sku}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-semibold rounded-lg text-[10px]">
                        {categories.find(c => c.id === p.categoryId)?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400">Rp {p.purchasePrice.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right font-mono font-extrabold text-emerald-400">Rp {p.sellingPrice.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${p.stock <= p.minStock ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedBarcodeProduct(p);
                            setIsBarcodeModalOpen(true);
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                          title="Lihat & Cetak Barcode Produk"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121214]">
              <h3 className="text-white font-bold text-base">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Barcode *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  >
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="dus">dus</option>
                    <option value="botol">botol</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Stok Awal</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Stok Minimum (Peringatan)</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Foto Produk</span>
                  {formData.photo && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Foto Terpasang
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-4">
                  {formData.photo ? (
                    <div className="relative group">
                      <img src={formData.photo} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-700 bg-slate-900 shadow-md" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: '' })}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 text-[10px] shadow"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg">
                      <Upload className="w-4 h-4" /> Pilih Gambar dari Komputer
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (typeof event.target?.result === 'string') {
                              setFormData({ ...formData, photo: event.target.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">Format: JPG, PNG, atau WEBP. Maks. 2MB.</p>
                  </div>
                </div>
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
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CetakLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        products={products}
      />

      <ProductBarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        product={selectedBarcodeProduct}
      />
    </div>
  );
};
