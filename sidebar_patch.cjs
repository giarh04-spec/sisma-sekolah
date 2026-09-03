const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

const perizinanBtn = `
                      {/* Perizinan */}
                      {currentRole !== 'guru' && (
                        <button
                          onClick={() => {
                            setActiveTab('absensi');
                            if (setAbsensiSubTab) setAbsensiSubTab('perizinan');
                          }}
                          className={\`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-all \${
                            absensiSubTab === 'perizinan'
                              ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }\`}
                        >
                          <div className="flex items-center gap-2">
                            <FileSignature className="w-3.5 h-3.5 text-orange-400" />
                            <span>Pengajuan Izin / Cuti</span>
                          </div>
                        </button>
                      )}`;

code = code.replace(
  "{/* 5. Redaksi Notifikasi WA */}",
  perizinanBtn + "\n\n                      {/* 5. Redaksi Notifikasi WA */}"
);

// We need to import FileSignature if it's not imported.
if (!code.includes('FileSignature')) {
  code = code.replace(/lucide-react';/, "FileSignature,\n} from 'lucide-react';");
}

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Sidebar patched.');
