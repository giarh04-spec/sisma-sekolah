
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AttendanceStatus } from '../types';

const data = [
  { name: AttendanceStatus.PRESENT, value: 400 },
  { name: AttendanceStatus.ABSENT, value: 20 },
  { name: AttendanceStatus.SICK, value: 30 },
  { name: AttendanceStatus.PERMISSION, value: 15 },
];

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6'];

const barData = [
  { name: 'Senin', hadir: 120, alfa: 5 },
  { name: 'Selasa', hadir: 115, alfa: 8 },
  { name: 'Rabu', hadir: 125, alfa: 2 },
  { name: 'Kamis', hadir: 122, alfa: 4 },
  { name: 'Jumat', hadir: 110, alfa: 12 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Siswa', value: '450', icon: 'fa-users', color: 'bg-indigo-500' },
          { label: 'Hadir Hari Ini', value: '412', icon: 'fa-user-check', color: 'bg-emerald-500' },
          { label: 'Tanpa Keterangan', value: '12', icon: 'fa-user-times', color: 'bg-rose-500' },
          { label: 'Sakit/Izin', value: '26', icon: 'fa-briefcase-medical', color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Kehadiran Mingguan</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="hadir" fill="#6366f1" radius={[4, 4, 0, 0]} name="Hadir" />
                <Bar dataKey="alfa" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Alfa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{Math.round((item.value/465)*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Siswa Tidak Hadir (Hari Ini)</h3>
          <button className="text-indigo-600 text-sm font-semibold hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-slate-400 font-bold">
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Waktu Lapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Ani Wijaya', class: 'X-IPA-1', status: 'Sakit', time: '07:15' },
                { name: 'Bambang Kusuma', class: 'XI-IPS-2', status: 'Izin', time: '06:45' },
                { name: 'Citra Dewi', class: 'XII-IPA-3', status: 'Alfa', time: '-' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-slate-500">{row.class}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Sakit' ? 'bg-amber-100 text-amber-700' : 
                      row.status === 'Izin' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
