/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Package,
  Car,
  MessageSquareQuote,
  Shield,
  Cloud,
  Plus,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateToTab: (tabKey: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateToTab }) => {
  const {
    currentSite,
    adminUser,
    cargoList,
    guestList,
    suggestionList,
    announcements,
  } = useApp();

  const [announcementList, setAnnouncementList] = useState(announcements);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [isAddingAnn, setIsAddingAnn] = useState(false);

  // Metrics
  const pendingCargos = cargoList.filter((c) => c.status === 'guvenlikte_emanet').length;
  const activeGuests = guestList.filter((g) => g.status === 'bekleniyor').length;
  const insideGuests = guestList.filter((g) => g.status === 'giris_yapti').length;
  const openSuggestions = suggestionList.filter(
    (s) => s.status === 'yeni' || s.status === 'inceleniyor'
  ).length;

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    setAnnouncementList([
      {
        id: `ann-${Date.now()}`,
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        date: 'Bugün',
        author: 'Site Yönetimi',
        category: 'Duyuru',
      },
      ...announcementList,
    ]);

    setNewAnnTitle('');
    setNewAnnContent('');
    setIsAddingAnn(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Card */}
      <div className="p-5 rounded-3xl bg-[#1B1D25] border border-[#C5A66A]/30 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-[#C5A66A] uppercase">
                Yönetici Konsolu
              </span>
              <span className="text-[#EEE9DE]/40">·</span>
              <span className="text-xs text-[#DFC38E] font-medium">{currentSite.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-luxury font-bold text-[#EEE9DE] mt-1">
              {adminUser.name}
            </h1>
            <p className="text-xs text-[#EEE9DE]/70 mt-0.5">{adminUser.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateToTab('cargo')}
              className="px-3.5 py-2 rounded-xl bg-[#C5A66A] text-[#111318] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Hızlı Kargo Kaydı</span>
            </button>
            <button
              onClick={() => setIsAddingAnn(!isAddingAnn)}
              className="px-3.5 py-2 rounded-xl bg-[#292B36] hover:bg-[#242732] border border-[#292B36] text-xs font-semibold text-[#DFC38E] transition-colors touch-target flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C5A66A]" />
              <span>Duyuru Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigateToTab('cargo')}
          className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A]/50 cursor-pointer transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#EEE9DE]/60">Emanet Kargo</span>
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#EEE9DE]">{pendingCargos}</p>
          <p className="text-[11px] text-[#DFC38E]">Güvenlikte bekleyen paket</p>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => onNavigateToTab('requests')}
          className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A]/50 cursor-pointer transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#EEE9DE]/60">Beklenen Misafir</span>
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#EEE9DE]">{activeGuests}</p>
          <p className="text-[11px] text-amber-400">Kapıda beklenen araç/ziyaretçi</p>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => onNavigateToTab('requests')}
          className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A]/50 cursor-pointer transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#EEE9DE]/60">İçerideki Misafir</span>
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#EEE9DE]">{insideGuests}</p>
          <p className="text-[11px] text-emerald-400">Sitede park halinde / içeride</p>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => onNavigateToTab('suggestions')}
          className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A]/50 cursor-pointer transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#EEE9DE]/60">Açık Talepler</span>
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-[#EEE9DE]">{openSuggestions}</p>
          <p className="text-[11px] text-[#DFC38E]">İncelenmeyi bekleyen mesaj</p>
        </div>
      </div>

      {/* Add Announcement Drawer */}
      {isAddingAnn && (
        <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-luxury font-bold text-[#DFC38E]">Yeni Site Duyurusu Yayınla</h3>
            <button
              onClick={() => setIsAddingAnn(false)}
              className="text-xs text-[#EEE9DE]/60 hover:text-[#EEE9DE]"
            >
              Vazgeç
            </button>
          </div>

          <form onSubmit={handleAddAnnouncement} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Duyuru Başlığı"
              value={newAnnTitle}
              onChange={(e) => setNewAnnTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
            />
            <textarea
              required
              rows={2}
              placeholder="Duyuru metni ve sakinlere iletilecek detaylar..."
              value={newAnnContent}
              onChange={(e) => setNewAnnContent(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs shadow-md"
              >
                Tüm Sakinlere Yayınla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C5A66A]" />
            <h2 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Site Duyuru Panosu ({announcementList.length})
            </h2>
          </div>
          <span className="text-[11px] text-[#EEE9DE]/50">Sakinler tarafından görülebilir</span>
        </div>

        <div className="space-y-2.5">
          {announcementList.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#292B36] text-[#DFC38E]">
                  {ann.category}
                </span>
                <span className="text-[11px] text-[#EEE9DE]/50">{ann.date}</span>
              </div>
              <h3 className="text-sm font-bold text-[#EEE9DE]">{ann.title}</h3>
              <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
