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
import { GlobalFloatingBanner } from './components/common/GlobalFloatingBanner';
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
      {/* Mobile Frame Toggle Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMobilePreview(!isMobilePreview)}
          title="Mobil Çerçeve Değiştir"
          className="p-2.5 rounded-2xl bg-white border border-[#DDE5DF] hover:border-[#648875] text-[#294C3C] text-xs font-bold transition-all flex items-center gap-2 shadow-lg backdrop-blur-md"
        >
          {isMobilePreview ? <Monitor className="w-4 h-4 text-[#648875]" /> : <Smartphone className="w-4 h-4 text-[#648875]" />}
          <span className="hidden md:inline">{isMobilePreview ? 'Masaüstü Görünüm' : 'Mobil Önizleme'}</span>
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

      {/* Global Floating Banner for Alarms & Chimes */}
      <GlobalFloatingBanner />

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
