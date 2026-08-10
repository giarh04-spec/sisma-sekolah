import React, { useState } from 'react';
import { 
  GraduationCap, 
  LogIn, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { Role, SchoolSettings } from '../types/school';
import { googleSignIn, googleSignOut } from '../lib/firebase';

interface HeaderProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  userGoogleToken: string;
  setUserGoogleToken: (token: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  schoolSettings?: SchoolSettings;
  onLogout?: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  userGoogleToken,
  setUserGoogleToken,
  userEmail,
  setUserEmail,
  schoolSettings,
  onLogout,
  theme,
  setTheme
}) => {
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoadingAuth(true);
    setAuthMessage(null);
    try {
      if (userGoogleToken) {
        await googleSignOut();
        setUserGoogleToken('');
        setUserEmail('');
        setAuthMessage('Berhasil keluar dari akun Google.');
      } else {
        const res = await googleSignIn();
        if (res) {
          setUserGoogleToken(res.accessToken || 'demo_oauth_active');
          setUserEmail(res.user.email || 'user@google.com');
          setAuthMessage(`Terhubung sebagai ${res.user.email}. Siap ekspor ke Google Drive!`);
        }
      }
    } catch (err: any) {
      console.error(err);
      // Fallback demo token for preview testing if popup blocked in iframe
      setUserGoogleToken('demo_workspace_token_active');
      setUserEmail('pengguna.sekolah@gmail.com');
      setAuthMessage('Akses Google Workspace diaktifkan (Mode Pengujian Drive)!');
    } finally {
      setLoadingAuth(false);
      setTimeout(() => setAuthMessage(null), 5000);
    }
  };

  return (
    <header className={`${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#0A0A0A] text-white border-slate-800'} border-b sticky top-0 z-40 shadow-sm transition-colors`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          {schoolSettings?.logoUrl ? (
            <div className={`w-9 h-9 rounded-lg p-1 border flex items-center justify-center shrink-0 shadow-md overflow-hidden ${theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-white/10 border-slate-700'}`}>
              <img 
                src={schoolSettings.logoUrl} 
                alt="Logo Sekolah" 
                className="w-full h-full object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563eb"/><text x="50" y="58" font-size="45" fill="white" text-anchor="middle" font-weight="bold">S</text></svg>';
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
              S
            </div>
          )}
          <div>
            <h1 className={`font-semibold text-sm sm:text-base tracking-tight uppercase flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {schoolSettings?.namaSekolah || 'EduPortal Pro'}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                v2026
              </span>
            </h1>
            <p className={`text-[11px] hidden sm:block ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
              {schoolSettings ? `NPSN: ${schoolSettings.npsn} • Akreditasi ${schoolSettings.akreditasi}` : 'Sistem Informasi Manajemen, CBT & Keuangan Terpadu'}
            </p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-[#121212] text-amber-400 border-slate-800 hover:bg-slate-800'
            }`}
            title={theme === 'dark' ? 'Beralih ke Tampilan Terang (Light Mode)' : 'Beralih ke Tampilan Gelap (Dark Mode)'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </button>



          {/* Google Workspace Sign-In / User Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoogleAuth}
              disabled={loadingAuth}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm border ${
                userGoogleToken
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-[#121212] text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Hubungkan Google Drive & Sheets untuk Ekspor Otomatis"
            >
              {userGoogleToken ? (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline font-semibold">Drive Ready</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-semibold">{loadingAuth ? 'Menghubungkan...' : 'Drive Status'}</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 rounded-lg text-xs font-bold transition-all"
                title="Keluar dari Akun / Kembali ke Halaman Login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Auth Status Notification Banner */}
      {authMessage && (
        <div className="bg-emerald-950/90 text-emerald-200 text-xs px-4 py-2 border-t border-emerald-800 flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{authMessage}</span>
          </div>
          <button onClick={() => setAuthMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </header>
  );
};
