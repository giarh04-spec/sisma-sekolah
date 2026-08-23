
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'attendance', icon: 'fa-calendar-check', label: 'Absensi' },
    { id: 'students', icon: 'fa-user-graduate', label: 'Siswa' },
    { id: 'reports', icon: 'fa-file-invoice', label: 'Laporan' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-indigo-900 text-white flex-col sticky top-0 h-screen shadow-xl">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-school text-indigo-400"></i>
            Absensi Pintar
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-700 text-white shadow-lg' 
                : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              <i className={`fas ${tab.icon} w-5`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-indigo-800">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/admin/100" className="w-10 h-10 rounded-full border-2 border-indigo-400" alt="Profile" />
            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-indigo-400">Guru Utama</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 text-xl">
              <i className="fas fa-bars"></i>
            </button>
            <h2 className="text-lg font-bold text-slate-700 md:block hidden">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
                <i className="far fa-bell text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Keluar <i className="fas fa-sign-out-alt ml-1"></i>
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </div>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden flex justify-around bg-white border-t p-3 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
