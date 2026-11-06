/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  ShoppingBag,
  Package,
  MessageSquareQuote,
  Coffee,
  LogOut,
  Building2,
  User,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { GuestTab } from './GuestTab';
import { OrderTab } from './OrderTab';
import { CargoTab } from './CargoTab';
import { SuggestionTab } from './SuggestionTab';
import { CafeTab } from './CafeTab';
import { ResidentCargoNotificationModal } from './ResidentCargoNotificationModal';

type ResidentMenuTab = 'guest' | 'order' | 'cargo' | 'suggestion' | 'cafe';

export const ResidentDashboard: React.FC = () => {
  const {
    currentSite,
    residentUser,
    logoutRole,
    cargoList,
    guestList,
    isMobilePreview,
    setIsMobilePreview,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ResidentMenuTab>('guest');

  // Badge counts for resident
  const pendingCargos = cargoList.filter(
    (c) =>
      c.block === residentUser.block &&
      c.apartment === residentUser.apartment &&
      c.status !== 'teslim_edildi'
  ).length;

  const activeGuests = guestList.filter(
    (g) =>
      g.residentBlock === residentUser.block &&
      g.residentApartment === residentUser.apartment &&
      g.status === 'bekleniyor'
  ).length;

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center">
      {/* Top Header Bar */}
      <header className="w-full bg-[#1B1D25] border-b border-[#292B36] sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A] shrink-0 font-luxury font-bold text-base">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-luxury font-bold text-sm tracking-wide text-[#DFC38E]">
                  VİVA SİTE
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C5A66A]/20 text-[#DFC38E] border border-[#C5A66A]/40 uppercase font-semibold">
                  Sakin Portalı
                </span>
              </div>
              <p className="text-xs text-[#EEE9DE]/60 truncate max-w-[180px] sm:max-w-xs">
                {currentSite.name}
              </p>
            </div>
          </div>

          {/* Right slot actions */}
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

        {/* Resident Identity Bar */}
        <div className="bg-[#111318] border-t border-[#292B36] px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A66A]" />
              <span className="font-bold text-[#EEE9DE]">{residentUser.name}</span>
              <span className="text-[#EEE9DE]/40">·</span>
              <span className="text-[#DFC38E] font-semibold">
                {residentUser.block} Blok · Daire {residentUser.apartment}
              </span>
            </div>
            <span className="text-[11px] text-[#EEE9DE]/50 hidden sm:inline">
              Demo Sakin Hesabı
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl px-4 py-5 flex-1">
        {activeTab === 'guest' && <GuestTab />}
        {activeTab === 'order' && <OrderTab />}
        {activeTab === 'cargo' && <CargoTab />}
        {activeTab === 'suggestion' && <SuggestionTab />}
        {activeTab === 'cafe' && <CafeTab />}
      </main>

      {/* Cargo Arrival Real-Time Notification & SMS Approval Modal */}
      <ResidentCargoNotificationModal />

      {/* Fixed Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B1D25]/95 backdrop-blur-md border-t border-[#292B36] shadow-2xl pb-safe">
        <div className="max-w-2xl mx-auto grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Misafir */}
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex flex-col items-center justify-center h-full relative transition-all touch-target ${
              activeTab === 'guest' ? 'text-[#DFC38E]' : 'text-[#EEE9DE]/50 hover:text-[#EEE9DE]/80'
            }`}
          >
            <div className="relative">
              <Car className="w-5 h-5" />
              {activeGuests > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#C5A66A] text-[#111318] text-[9px] font-bold flex items-center justify-center">
                  {activeGuests}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-1">Misafir</span>
            {activeTab === 'guest' && (
              <span className="w-5 h-0.5 rounded-full bg-[#C5A66A] absolute bottom-1" />
            )}
          </button>

          {/* Tab 2: Sipariş */}
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`flex flex-col items-center justify-center h-full relative transition-all touch-target ${
              activeTab === 'order' ? 'text-[#DFC38E]' : 'text-[#EEE9DE]/50 hover:text-[#EEE9DE]/80'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Sipariş</span>
            {activeTab === 'order' && (
              <span className="w-5 h-0.5 rounded-full bg-[#C5A66A] absolute bottom-1" />
            )}
          </button>

          {/* Tab 3: Kargo */}
          <button
            type="button"
            onClick={() => setActiveTab('cargo')}
            className={`flex flex-col items-center justify-center h-full relative transition-all touch-target ${
              activeTab === 'cargo' ? 'text-[#DFC38E]' : 'text-[#EEE9DE]/50 hover:text-[#EEE9DE]/80'
            }`}
          >
            <div className="relative">
              <Package className="w-5 h-5" />
              {pendingCargos > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#C5A66A] text-[#111318] text-[9px] font-bold flex items-center justify-center">
                  {pendingCargos}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-1">Kargo</span>
            {activeTab === 'cargo' && (
              <span className="w-5 h-0.5 rounded-full bg-[#C5A66A] absolute bottom-1" />
            )}
          </button>

          {/* Tab 4: Öneri */}
          <button
            type="button"
            onClick={() => setActiveTab('suggestion')}
            className={`flex flex-col items-center justify-center h-full relative transition-all touch-target ${
              activeTab === 'suggestion' ? 'text-[#DFC38E]' : 'text-[#EEE9DE]/50 hover:text-[#EEE9DE]/80'
            }`}
          >
            <MessageSquareQuote className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">Öneri</span>
            {activeTab === 'suggestion' && (
              <span className="w-5 h-0.5 rounded-full bg-[#C5A66A] absolute bottom-1" />
            )}
          </button>

          {/* Tab 5: Cafe (Yakında) */}
          <button
            type="button"
            onClick={() => setActiveTab('cafe')}
            className={`flex flex-col items-center justify-center h-full relative transition-all touch-target ${
              activeTab === 'cafe' ? 'text-[#DFC38E]' : 'text-[#EEE9DE]/50 hover:text-[#EEE9DE]/80'
            }`}
          >
            <div className="relative">
              <Coffee className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-3 text-[8px] px-1 rounded-full bg-[#C5A66A]/30 text-[#DFC38E] border border-[#C5A66A]/50">
                Yakında
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-1">Cafe</span>
            {activeTab === 'cafe' && (
              <span className="w-5 h-0.5 rounded-full bg-[#C5A66A] absolute bottom-1" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
