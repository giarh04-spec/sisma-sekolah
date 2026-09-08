import React from 'react';
import { ShoppingCart, FileText, Package, LayoutGrid, Boxes, Users, Truck, BarChart3, Shield, Settings, LogOut, Store } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onLogout
}) => {
  const menuItems = [
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart },
    { id: 'transaksi', label: 'Transaksi', icon: FileText },
    { id: 'produk', label: 'Produk', icon: Package },
    { id: 'katalog', label: 'Katalog', icon: LayoutGrid },
    { id: 'stok', label: 'Stok', icon: Boxes },
    { id: 'pelanggan', label: 'Pelanggan', icon: Users },
    { id: 'supplier', label: 'Supplier', icon: Truck },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
    { id: 'pengguna', label: 'Pengguna', icon: Shield },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#121214] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-wider">KASIR MART</h1>
          <p className="text-[10px] text-slate-400 font-medium">Minimarket POS & Inventory</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-none">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
};
