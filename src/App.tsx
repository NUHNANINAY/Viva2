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
import { Smartphone, Monitor } from 'lucide-react';

const MainView: React.FC = () => {
  const { currentRole, isMobilePreview, setIsMobilePreview } = useApp();

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

  if (isMobilePreview) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] py-6 px-4 flex flex-col items-center justify-center">
        {/* Frame Toggle Floating Indicator */}
        <div className="mb-4 flex items-center gap-3 bg-[#1B1D25] border border-[#C5A66A]/30 px-4 py-2 rounded-full text-xs text-[#DFC38E] shadow-xl">
          <Smartphone className="w-4 h-4 text-[#C5A66A]" />
          <span>Mobil Önizleme Çerçevesi (390×844)</span>
          <button
            onClick={() => setIsMobilePreview(false)}
            className="ml-2 px-2.5 py-1 rounded-md bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-[#EEE9DE] text-[11px] font-semibold transition-all"
          >
            Tam Ekrana Dön
          </button>
        </div>

        {/* Smartphone Shell */}
        <div className="relative w-full max-w-[400px] h-[844px] bg-[#111318] border-[10px] border-[#292B36] rounded-[48px] overflow-hidden shadow-2xl shadow-black/80 flex flex-col ring-1 ring-[#C5A66A]/40">
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-28 h-4 bg-black rounded-b-2xl mx-auto absolute top-0 left-0 right-0 z-50 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
          </div>

          {/* Screen Content */}
          <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-3">
            {renderContent()}
          </div>
        </div>

        <AdScreenModal />
        <GoogleDriveSetupModal />
      </div>
    );
  }

  return (
    <>
      {renderContent()}
      <AdScreenModal />
      <GoogleDriveSetupModal />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
