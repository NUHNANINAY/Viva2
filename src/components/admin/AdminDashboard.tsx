/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OverviewTab } from './OverviewTab';
import { ResidentsTab } from './ResidentsTab';
import { AdminCargoTab } from './AdminCargoTab';
import { AdminSuggestionsTab } from './AdminSuggestionsTab';
import { RequestsTab } from './RequestsTab';
import { SettingsTab } from './SettingsTab';
import { DriveReportsTab } from './DriveReportsTab';
import {
  Building2,
  BarChart3,
  Package,
  MessageSquareQuote,
  Users,
  UserCheck,
  ShieldCheck,
  Settings,
  HardDrive,
  LogOut,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { SecurityGuardsTab } from './SecurityGuardsTab';
import { OperationsTab } from './OperationsTab';
import { StaffManagementTab } from './StaffManagementTab';

export const AdminDashboard: React.FC = () => {
  const { siteInfo, setCurrentRole, cloudSyncStatus, theme, setTheme } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'staff' | 'operations' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DDE5DF] px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <Building2 className="w-5 h-5 text-[#294C3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-luxury font-bold text-[#294C3C]">
                  {siteInfo.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Yönetim Kurulu Paneli
                </span>
                <span
                  title={cloudSyncStatus === 'connected' ? 'Bulut Senkronize: Canlı' : 'Buluta bağlanıyor...'}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cloudSyncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="hidden sm:inline">{cloudSyncStatus === 'connected' ? 'Canlı Senkron' : 'Bağlanıyor'}</span>
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                Site Müdürü: {siteInfo.adminName} · {siteInfo.adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Selector Dropdown */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white text-[11px] font-bold text-[#294C3C] cursor-pointer"
              title="Kişisel Tema Seçimi"
            >
              <option value="sage">🌿 Adaçayı Yeşili</option>
              <option value="fuchsia">🌸 Fuchsia</option>
              <option value="rose">🌷 Açık Pembe</option>
              <option value="pearl">🤍 İnci Beyaz</option>
            </select>

            {/* UNIVERSAL "Ana Menüye Dön" BUTTON (Requirement 1) */}
            <button
              onClick={() => setCurrentRole('guest')}
              className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Ana Menüye / Rol Seçimine Dön"
            >
              <Building2 className="w-3.5 h-3.5 text-[#648875]" />
              <span className="hidden sm:inline">Ana Menüye Dön</span>
            </button>

            {/* SAFE LOGOUT ICON */}
            <button
              onClick={() => {
                localStorage.removeItem('viva_auth_session');
                setCurrentRole('guest');
              }}
              title="Güvenli Çıkış"
              className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation - 5 Consolidated Master Tabs with Neon Glow */}
      <div className="bg-[#FFFFFF] border-b border-[#DDE5DF] sticky top-[61px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 sm:gap-2">
          {/* Tab 1: Genel Bakış */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'overview'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/65 hover:text-[#26342C]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#648875]" />
            <span>Genel Bakış</span>
          </button>

          {/* Tab 2: Sakinler & Aidat */}
          <button
            onClick={() => setActiveTab('residents')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'residents'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/65 hover:text-[#26342C]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#648875]" />
            <span>Sakinler & Aidat & Finans</span>
          </button>

          {/* Tab 3: Personel & Puantaj */}
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'staff'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/65 hover:text-[#26342C]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#648875]" />
            <span>Personel & Puantaj</span>
          </button>

          {/* Tab 4: Operasyon */}
          <button
            onClick={() => setActiveTab('operations')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'operations'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/65 hover:text-[#26342C]'
            }`}
          >
            <Package className="w-4 h-4 text-[#648875]" />
            <span>Operasyon & Kapı Akışı</span>
          </button>

          {/* Tab 5: Ayarlar & Raporlar */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'settings'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/65 hover:text-[#26342C]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#648875]" />
            <span>Ayarlar & Modüller & Raporlar</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'residents' && <ResidentsTab />}
        {activeTab === 'staff' && <StaffManagementTab />}
        {activeTab === 'operations' && <OperationsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};
