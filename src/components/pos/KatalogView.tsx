import React, { useState } from 'react';
import { Search, Plus, ShoppingBag, ArrowUpDown, Filter } from 'lucide-react';
import { Product, Category, CartItem } from '../../types/pos';

interface KatalogViewProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
}

export const KatalogView: React.FC<KatalogViewProps> = ({
  products,
  categories,
  onAddToCart
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'stock'>('name');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.sellingPrice - b.sellingPrice;
    if (sortBy === 'price-high') return b.sellingPrice - a.sellingPrice;
    if (sortBy === 'stock') return b.stock - a.stock;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Katalog Produk Minimarket</h2>
          <p className="text-xs text-slate-400">Jelajahi seluruh item produk dalam tampilan card interaktif.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk katalog..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-[#121214] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="name">Urutkan: Nama (A-Z)</option>
            <option value="price-low">Harga Termurah</option>
            <option value="price-high">Harga Tertinggi</option>
            <option value="stock">Stok Terbanyak</option>
          </select>
        </div>
      </div>

      {/* Horizontal Category Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-[#121214] border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#121214] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(p => (
          <div
            key={p.id}
            className="bg-[#121214] border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-blue-500/50 transition-all group"
          >
            <div>
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider">
                  {p.unit}
                </div>
                {p.stock <= p.minStock && (
                  <div className="absolute top-2 right-2 bg-red-500/90 px-2 py-0.5 rounded-lg text-[9px] font-bold text-white animate-pulse">
                    ⚠️ Stok Tipis
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-1">
                <p className="text-[10px] text-slate-400 font-semibold uppercase truncate">
                  {categories.find(c => c.id === p.categoryId)?.name}
                </p>
                <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">{p.name}</h3>
                <p className="text-sm font-extrabold font-mono text-blue-400 pt-1">
                  Rp {p.sellingPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0">
              <button
                onClick={() => onAddToCart(p)}
                disabled={p.stock <= 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> TAMBAH
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
