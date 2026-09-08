import React from 'react';
import { Users, Shield, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/pos';

interface PenggunaViewProps {
  users: User[];
}

export const PenggunaView: React.FC<PenggunaViewProps> = ({ users }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Manajemen Pengguna & Hak Akses (RBAC)</h2>
        <p className="text-xs text-slate-400">Kelola akun kasir, administrator, dan pemilik minimarket beserta tingkat izin akses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-[#121214] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  u.role === 'owner' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {u.role}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{u.name}</h3>
                <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status Akun</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
