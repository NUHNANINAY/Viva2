/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SiteSelectionScreen } from './components/SiteSelectionScreen';
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SecurityDashboard } from './components/security/SecurityDashboard';
import { AdScreenModal } from './components/AdScreenModal';
import { GoogleDriveSetupModal } from './components/GoogleDriveSetupModal';
import { NewSiteModal } from './components/NewSiteModal';
import { Smartphone, Monitor, ShieldCheck, Users, Building2, Home } from 'lucide-react';

const MainView: React.FC = () => {
  const { currentRole, setCurrentRole, isMobilePreview, setIsMobilePreview } = useApp();

  const renderContent = () => {
    switch (currentRole) {
      case 'resident':
        return <ResidentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'security':
        return <SecurityDashboard />;
      default:
        return <SiteSelectionScreen />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F8F5] text-[#26342C]">
      {/* Role Switcher Floating Bar (Quick Demo Bar) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] border-2 border-[#648875] rounded-2xl shadow-xl backdrop-blur-md">
        <button
          onClick={() => setCurrentRole('guest')}
          title="Giriş Ekranı"
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            currentRole === 'guest'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Home className="w-4 h-4 text-[#648875]" />
          <span className="hidden sm:inline">Giriş</span>
        </button>

        <button
          onClick={() => setCurrentRole('resident')}
          title="Sakin Portalı"
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            currentRole === 'resident'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Users className="w-4 h-4 text-[#648875]" />
          <span className="hidden sm:inline">Sakin</span>
        </button>

        <button
          onClick={() => setCurrentRole('security')}
          title="Güvenlik Konsolu"
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            currentRole === 'security'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#648875]" />
          <span className="hidden sm:inline">Güvenlik</span>
        </button>

        <button
          onClick={() => setCurrentRole('admin')}
          title="Yönetim Kurulu"
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            currentRole === 'admin'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#648875]" />
          <span className="hidden sm:inline">Yönetim</span>
        </button>

        <div className="w-[1px] h-5 bg-[#DDE5DF] mx-1" />

        <button
          onClick={() => setIsMobilePreview(!isMobilePreview)}
          title="Mobil Çerçeve Değiştir"
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            isMobilePreview
              ? 'bg-[#648875] text-white'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          {isMobilePreview ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          <span className="hidden md:inline">{isMobilePreview ? 'Geniş Ekran' : 'Mobil Tel'}</span>
        </button>
      </div>

      {/* Screen Render */}
      {isMobilePreview ? (
        <div className="min-h-screen bg-[#F0F2EE] py-6 px-4 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[400px] h-[850px] bg-[#FFFFFF] rounded-[48px] border-[10px] border-[#294C3C] shadow-2xl overflow-hidden flex flex-col">
            {/* Phone Notch */}
            <div className="w-32 h-5 bg-[#294C3C] rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-[#A8BCAF]/40 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto pt-6 pb-20 no-scrollbar">
              {renderContent()}
            </div>
          </div>
        </div>
      ) : (
        renderContent()
      )}

      {/* Global Modals */}
      <NewSiteModal />
      <GoogleDriveSetupModal />
      <AdScreenModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
