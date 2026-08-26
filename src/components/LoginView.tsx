import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  QrCode, 
  Users, 
  CheckCircle2, 
  KeyRound, 
  UserCheck, 
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { Role, SchoolSettings, Guru, Staf, Siswa } from '../types/school';
import { googleSignIn } from '../lib/firebase';

interface LoginViewProps {
  onLoginSuccess: (email: string, token: string, role: Role) => void;
  onOpenPublicSlip?: (slipId?: string) => void;
  schoolSettings: SchoolSettings;
  guruList?: Guru[];
  stafList?: Staf[];
  siswaList?: Siswa[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenPublicSlip,
  schoolSettings,
  guruList = [],
  stafList = [],
  siswaList = []
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('admin');

  // Dynamic demo helpers based on current lists
  const activeStafKeuangan = stafList.find(s => s.bagian === 'Bendahara / Keuangan') || stafList[0];
  const demoStafUser = activeStafKeuangan?.username || 'nurhidayati';
  const demoStafPass = activeStafKeuangan?.password || 'password';

  const activeGuru = guruList[0];
  const demoGuruUser = activeGuru?.username || 'budi';
  const demoGuruPass = activeGuru?.password || 'password123';

  const activeSiswa = siswaList[0];
  const demoSiswaUser = activeSiswa?.username || 'bayu';
  const demoSiswaPass = activeSiswa?.password || 'password123';

  // Quick fill demo accounts helper
  const handleFillDemo = (role: Role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmailInput('admin');
      setPasswordInput('admin');
    } else if (role === 'guru') {
      setEmailInput(demoGuruUser);
      setPasswordInput(demoGuruPass);
    } else if (role === 'staf') {
      setEmailInput(demoStafUser);
      setPasswordInput(demoStafPass);
    } else if (role === 'siswa') {
      setEmailInput(demoSiswaUser);
      setPasswordInput(demoSiswaPass);
    }
    setErrorMessage(null);
  };

  // Handle Gmail Login Form Submit
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputIdOrEmail = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!inputIdOrEmail) {
      setErrorMessage('Silakan masukkan Username atau Email akun Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi (password) akun Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // A. Check Admin
      const adminEmails = (schoolSettings.adminEmails || []).map(e => e.toLowerCase());
      const isAdminUser = 
        inputIdOrEmail === 'admin' ||
        inputIdOrEmail === 'giar.hermawan4' ||
        inputIdOrEmail === 'giar.hermawan4@guru.smp.belajar.id' ||
        adminEmails.includes(inputIdOrEmail) ||
        inputIdOrEmail.includes('giarh0410');

      // B. Check Staf
      const foundStaf = stafList.find(st => 
        (st.username && st.username.toLowerCase() === inputIdOrEmail) ||
        (st.email && st.email.toLowerCase() === inputIdOrEmail)
      );

      // C. Check Guru
      const foundGuru = guruList.find(g => 
        (g.username && g.username.toLowerCase() === inputIdOrEmail) ||
        (g.email && g.email.toLowerCase() === inputIdOrEmail)
      );

      // D. Check Siswa
      const foundSiswa = siswaList.find(s => 
        (s.username && s.username.toLowerCase() === inputIdOrEmail) ||
        (s.email && s.email.toLowerCase() === inputIdOrEmail) ||
        (s.nis && s.nis.toLowerCase() === inputIdOrEmail) ||
        (s.nisn && s.nisn.toLowerCase() === inputIdOrEmail)
      );

      if (isAdminUser) {
        const isValidAdminPassword = 
          password === 'admin' ||
          password === 'admin123' || 
          password === 'password' || 
          password === 'password123' ||
          password === '123456';

        if (!isValidAdminPassword) {
          setErrorMessage('Kata sandi salah untuk akun Admin Sekolah ini.');
          setLoading(false);
          return;
        }

        onLoginSuccess('giar.hermawan4@guru.smp.belajar.id', 'gmail_oauth_token_active', 'admin');
        setLoading(false);
        return;
      }

      if (foundStaf) {
        const expectedPassword = foundStaf.password || 'password';
        if (password !== expectedPassword) {
          setErrorMessage('Kata sandi salah untuk akun Staf TU / Keuangan ini.');
          setLoading(false);
          return;
        }
        onLoginSuccess(foundStaf.email || `${foundStaf.username || 'staf'}@staf.sch.id`, 'gmail_oauth_token_active', 'staf');
        setLoading(false);
        return;
      }

      if (foundGuru) {
        const expectedPassword = foundGuru.password || 'password123';
        if (password !== expectedPassword) {
          setErrorMessage('Kata sandi salah untuk akun Guru ini.');
          setLoading(false);
          return;
        }
        onLoginSuccess(foundGuru.email || `${foundGuru.username || 'guru'}@guru.sch.id`, 'gmail_oauth_token_active', 'guru');
        setLoading(false);
        return;
      }

      if (foundSiswa) {
        const expectedPassword = foundSiswa.password || 'password123';
        if (password !== expectedPassword) {
          setErrorMessage('Kata sandi salah untuk akun Siswa ini.');
          setLoading(false);
          return;
        }
        onLoginSuccess(foundSiswa.email || `${foundSiswa.nis || foundSiswa.id}@siswa.sch.id`, 'gmail_oauth_token_active', 'siswa');
        setLoading(false);
        return;
      }

      if (inputIdOrEmail.includes('@')) {
        onLoginSuccess(emailInput.trim(), 'gmail_oauth_token_active', selectedRole);
        setLoading(false);
        return;
      }

      setErrorMessage('Akses Ditolak: Akun dengan Username/Email tersebut tidak ditemukan di database.');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#121215]/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* Header: School Logo & Title */}
        <div className="flex items-center gap-4 pb-5 border-b border-zinc-800/80">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-700/60 p-3 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            <img 
              src={schoolSettings.logoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563eb"/></svg>'} 
              alt={schoolSettings.namaSekolah} 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%232563eb"/><text x="50" y="58" font-size="45" fill="white" text-anchor="middle" font-weight="bold">S</text></svg>';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Portal Akademik
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {schoolSettings.namaSekolah}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5 flex items-center gap-2">


              <span className="text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[10px]">Akreditasi A</span>
            </p>
          </div>
        </div>



        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs font-medium flex items-center gap-2">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Username atau Email
            </label>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Masukkan username atau email"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !emailInput.trim() || !passwordInput.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/25 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{loading ? 'Memproses Akses...' : 'Masuk ke Dashboard'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Gie Technologi</span>
          <span>v2026.4.1</span>
        </div>

      </div>
    </div>
  );
};

