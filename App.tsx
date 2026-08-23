
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendanceForm from './components/AttendanceForm';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceForm />;
      case 'students':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fas fa-user-graduate text-6xl mb-4 opacity-10"></i>
            <h3 className="text-xl font-bold">Manajemen Siswa</h3>
            <p>Fitur penambahan dan pengeditan data siswa sedang dalam pengembangan.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fas fa-file-invoice text-6xl mb-4 opacity-10"></i>
            <h3 className="text-xl font-bold">Laporan Kehadiran</h3>
            <p>Fitur ekspor PDF/Excel laporan bulanan sedang dalam pengembangan.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
