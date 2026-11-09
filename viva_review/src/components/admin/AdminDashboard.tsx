/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OverviewTab } from './OverviewTab';
import { AdminCargoTab } from './AdminCargoTab';
import { AdminSuggestionsTab } from './AdminSuggestionsTab';
import { RequestsTab } from './RequestsTab';
import { SettingsTab } from './SettingsTab';
import { DriveReportsTab } from './DriveReportsTab';
import { ResidentsTab } from './ResidentsTab';
import {
  Building2,
  BarChart3,
  Package,
  MessageSquareQuote,
  Users,
  Settings,
  HardDrive,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { siteInfo, setCurrentRole } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'cargo' | 'suggestions' | 'requests' | 'reports' | 'settings'>('overview');

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
              </div>
              <p className="text-xs text-[#26342C]/70">
                Site Müdürü: {siteInfo.adminName} · {siteInfo.adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* UNIVERSAL "Ana Menüye Dön" BUTTON (Requirement 1) */}
            <button
              onClick={() => setCurrentRole('guest')}
              className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
              title="Ana Menüye / Rol Seçimine Dön"
            >
              <Building2 className="w-3.5 h-3.5 text-[#648875]" />
              <span className="hidden sm:inline">Ana Menüye Dön</span>
            </button>

            {/* SAFE LOGOUT ICON */}
            <button
              onClick={() => setCurrentRole('guest')}
              title="Güvenli Çıkış (Kayıtlar silinmez)"
              className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="bg-[#FFFFFF] border-b border-[#DDE5DF] sticky top-[61px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#648875]" />
            <span>Genel Bakış</span>
          </button>

          <button onClick={() => setActiveTab('residents')} className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'residents' ? 'border-[#294C3C] text-[#294C3C]' : 'border-transparent text-[#26342C]/60'}`}>
            <Users className="w-4 h-4 text-[#648875]" /><span>Kayıtlı Sakinler</span>
          </button>

          <button
            onClick={() => setActiveTab('cargo')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'cargo'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Package className="w-4 h-4 text-[#648875]" />
            <span>Kargo & Paketler</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'suggestions'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-[#648875]" />
            <span>Sakin Talepleri</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'requests'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Users className="w-4 h-4 text-[#648875]" />
            <span>Misafir Kayıtları</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <HardDrive className="w-4 h-4 text-[#648875]" />
            <span>Drive & Raporlar</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#648875]" />
            <span>Site Ayarları</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'residents' && <ResidentsTab />}
        {activeTab === 'cargo' && <AdminCargoTab />}
        {activeTab === 'suggestions' && <AdminSuggestionsTab />}
        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'reports' && <DriveReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};
