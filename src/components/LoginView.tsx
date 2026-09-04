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

  const demoKepsekUser = 'kepsek';
  const demoKepsekPass = 'kepsek123';

  // Quick fill demo accounts helper
  const handleFillDemo = (role: Role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmailInput('admin');
      setPasswordInput('admin');
    } else if (role === 'kepsek') {
      setEmailInput(demoKepsekUser);
      setPasswordInput(demoKepsekPass);
    } else if (role === 'guru') {
      setEmailInput(demoGuruUser);
      setPasswordInput(demoGuruPass);
    } else if (role === 'staf') {
      setEmailInput(demoStafUser);
      setPasswordInput(demoStafPass);
    } else if (role === 'petugas_absensi') {
      setEmailInput('petugas');
      setPasswordInput('petugas123');
    } else if (role === 'siswa') {
      setEmailInput(demoSiswaUser);
      setPasswordInput(demoSiswaPass);
    }
    setErrorMessage(null);
  };

  // Handle Manual Login Form Submit
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
      // A. Check Kepala Sekolah
      const isKepsekUser = 
        inputIdOrEmail === 'kepsek' ||
        inputIdOrEmail === 'kepala.sekolah' ||
        inputIdOrEmail === 'kepala_sekolah' ||
        inputIdOrEmail === 'ahmad.dahlan' ||
        inputIdOrEmail === '197501152000031001' ||
        inputIdOrEmail === 'kepsek@sekolah.sch.id' ||
        inputIdOrEmail === 'kepala.sekolah@sekolah.sch.id' ||
        (schoolSettings.nipKepalaSekolah && inputIdOrEmail === schoolSettings.nipKepalaSekolah.toLowerCase().trim()) ||
        (schoolSettings.kepalaSekolah && inputIdOrEmail === schoolSettings.kepalaSekolah.toLowerCase().trim());

      if (isKepsekUser) {
        const isValidKepsekPassword = 
          password === 'kepsek' ||
          password === 'kepsek123' ||
          password === 'password' || 
          password === 'password123' || 
          password === 'admin123' ||
          password === '123456';

        if (!isValidKepsekPassword) {
          setErrorMessage('Kata sandi salah untuk akun Kepala Sekolah ini.');
          setLoading(false);
          return;
        }

        onLoginSuccess('kepala.sekolah@sekolah.sch.id', 'gmail_oauth_token_active', 'kepsek');
        setLoading(false);
        return;
      }

      // B. Check Admin
      const adminEmails = (schoolSettings.adminEmails || []).map(e => e.toLowerCase());
      const isAdminUser = 
        inputIdOrEmail === 'admin' ||
        inputIdOrEmail === 'giarh0410' ||
        inputIdOrEmail === 'giarh0410@gmail.com' ||
        adminEmails.includes(inputIdOrEmail) ||
        inputIdOrEmail.includes('giarh0410');

      // C. Check Staf
      const foundStaf = stafList.find(st => 
        (st.username && st.username.toLowerCase() === inputIdOrEmail) ||
        (st.email && st.email.toLowerCase() === inputIdOrEmail)
      );

      // D. Check Guru
      const foundGuru = guruList.find(g => 
        (g.username && g.username.toLowerCase() === inputIdOrEmail) ||
        (g.email && g.email.toLowerCase() === inputIdOrEmail)
      );

      // E. Check Siswa
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

        onLoginSuccess('giarh0410@gmail.com', 'gmail_oauth_token_active', 'admin');
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

      // Check Petugas Absensi
      const isPetugasAbsensi = 
        inputIdOrEmail === 'petugas' ||
        inputIdOrEmail === 'petugas_absensi' ||
        inputIdOrEmail === 'petugas.absensi' ||
        inputIdOrEmail === 'petugas@sekolah.sch.id' ||
        inputIdOrEmail === 'petugas.absensi@sekolah.sch.id';

      if (isPetugasAbsensi) {
        const isValidPetugasPassword = 
          password === 'petugas' ||
          password === 'petugas123' ||
          password === 'password' ||
          password === 'password123' ||
          password === '123456';

        if (!isValidPetugasPassword) {
          setErrorMessage('Kata sandi salah untuk akun Petugas Absensi ini.');
          setLoading(false);
          return;
        }

        onLoginSuccess('petugas.absensi@sekolah.sch.id', 'gmail_oauth_token_active', 'petugas_absensi');
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



        {/* Quick Role Selection Helper */}
        {!schoolSettings.hideQuickDemoLogin && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pilih Akun Demo / Akses Cepat</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('kepsek')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'kepsek'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Kepala Sekolah</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">kepsek / kepsek123</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-200 ring-1 ring-blue-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Administrator</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">admin / admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('guru')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'guru'
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-200 ring-1 ring-purple-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>Guru / Mapel</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{demoGuruUser}</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('staf')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'staf'
                    ? 'bg-amber-600/20 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Staf / Keuangan</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{demoStafUser}</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('petugas_absensi')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'petugas_absensi'
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Petugas Absensi</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">petugas / petugas123</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('siswa')}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                  selectedRole === 'siswa'
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Siswa / Wali</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{demoSiswaUser}</div>
              </button>
            </div>
          </div>
        )}

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

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Atau</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Google Gmail Sign-In for Students & Users */}
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
              const res = await googleSignIn();
              if (res && res.user) {
                const gEmail = (res.user.email || '').toLowerCase();
                const gToken = res.accessToken || 'gmail_oauth_token_active';

                const matchedSiswa = siswaList.find(s => s.email && s.email.toLowerCase() === gEmail);
                const matchedGuru = guruList.find(g => g.email && g.email.toLowerCase() === gEmail);
                const matchedStaf = stafList.find(st => st.email && st.email.toLowerCase() === gEmail);

                if (matchedSiswa) {
                  onLoginSuccess(matchedSiswa.email || gEmail, gToken, 'siswa');
                } else if (matchedGuru) {
                  onLoginSuccess(matchedGuru.email || gEmail, gToken, 'guru');
                } else if (matchedStaf) {
                  onLoginSuccess(matchedStaf.email || gEmail, gToken, 'staf');
                } else if (gEmail.includes('admin') || gEmail.includes('giar')) {
                  onLoginSuccess(gEmail, gToken, 'admin');
                } else {
                  onLoginSuccess(gEmail, gToken, 'siswa');
                }
              } else {
                setErrorMessage('Gagal masuk dengan Google. Silakan coba lagi.');
              }
            } catch (err: any) {
              setErrorMessage(err?.message || 'Terjadi kesalahan saat otentikasi Google.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-xs border border-zinc-700/80 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.23 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.81 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>{loading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Gmail Siswa (Google Sign-In)'}</span>
        </button>



        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Gie Technologi</span>
          <span>v2026.4.1</span>
        </div>

      </div>
    </div>
  );
};

