/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Shield,
  MessageSquareQuote,
  Settings,
  Cloud,
  LogOut,
  Building2,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { AdminCargoTab } from './AdminCargoTab';
import { RequestsTab } from './RequestsTab';
import { AdminSuggestionsTab } from './AdminSuggestionsTab';
import { SettingsTab } from './SettingsTab';
import { DriveReportsTab } from './DriveReportsTab';

type AdminMenuTab = 'overview' | 'cargo' | 'requests' | 'suggestions' | 'settings' | 'drive';

export const AdminDashboard: React.FC = () => {
  const {
    currentSite,
    adminUser,
    logoutRole,
    cargoList,
    suggestionList,
    isMobilePreview,
    setIsMobilePreview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');

  const pendingCargos = cargoList.filter((c) => c.status === 'guvenlikte_emanet').length;
  const openSuggestions = suggestionList.filter(
    (s) => s.status === 'yeni' || s.status === 'inceleniyor'
  ).length;

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center">
      {/* Top Header Bar */}
      <header className="w-full bg-[#1B1D25] border-b border-[#292B36] sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A] shrink-0 font-luxury font-bold text-base">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-luxury font-bold text-sm tracking-wide text-[#DFC38E]">
                  VİVA SİTE
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 uppercase font-semibold">
                  Yönetim Kurulu
                </span>
              </div>
              <p className="text-xs text-[#EEE9DE]/60 truncate max-w-[200px] sm:max-w-xs">
                {currentSite.name} · Site Müdürlüğü
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobilePreview((prev) => !prev)}
              className="p-2 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-[#EEE9DE]/70 transition-colors touch-target"
              title="Görünüm modu değiştir"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={logoutRole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-rose-950/80 hover:text-rose-300 border border-transparent hover:border-rose-500/30 text-xs font-semibold text-[#EEE9DE]/80 transition-all touch-target"
              title="Çıkış yap veya profil değiştir"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {/* Manager Identity Bar (Strictly separated from resident info) */}
        <div className="bg-[#111318] border-t border-[#292B36] px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-[#EEE9DE]">{adminUser.name}</span>
              <span className="text-[#EEE9DE]/40">·</span>
              <span className="text-[#DFC38E] font-medium hidden sm:inline">
                {adminUser.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#EEE9DE]/60">
              <span className="hidden sm:inline">Sakin Profilinden Bağımsız</span>
              {adminUser.driveConnected && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Drive Aktif
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Menu */}
        <div className="max-w-4xl mx-auto px-2 overflow-x-auto no-scrollbar border-t border-[#292B36]/60">
          <div className="flex items-center gap-1 py-1 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kontrol Paneli</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cargo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'cargo'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Kargo Kaydı</span>
              {pendingCargos > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#111318] text-[#DFC38E] text-[10px] font-bold">
                  {pendingCargos}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Talepler</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'suggestions'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Öneriler</span>
              {openSuggestions > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#111318] text-[#DFC38E] text-[10px] font-bold">
                  {openSuggestions}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Site Ayarları</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all touch-target whitespace-nowrap ${
                activeTab === 'drive'
                  ? 'bg-[#C5A66A] text-[#111318] shadow-sm font-bold'
                  : 'text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36]/50'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Google Drive ve Raporlar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl px-4 py-5 flex-1">
        {activeTab === 'overview' && (
          <OverviewTab onNavigateToTab={(tab) => setActiveTab(tab as AdminMenuTab)} />
        )}
        {activeTab === 'cargo' && <AdminCargoTab />}
        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'suggestions' && <AdminSuggestionsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'drive' && <DriveReportsTab />}
      </main>
    </div>
  );
};
