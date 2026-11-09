/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResidentOrderNotificationBanner } from './ResidentOrderNotificationBanner';
import { ResidentCargoNotificationModal } from './ResidentCargoNotificationModal';
import { OrderTab } from './OrderTab';
import { GuestTab } from './GuestTab';
import { CargoTab } from './CargoTab';
import { SuggestionTab } from './SuggestionTab';
import { CafeTab } from './CafeTab';
import {
  ShoppingBag,
  Users,
  Package,
  MessageSquareQuote,
  Coffee,
  LogOut,
  Bell,
  Sparkles,
  CheckCircle2,
  Home as HomeIcon,
  MessageCircle,
  Smartphone,
  Info,
  X,
} from 'lucide-react';
import { NotificationChannelPreference } from '../../types';

export const ResidentDashboard: React.FC = () => {
  const {
    residentUser,
    siteInfo,
    setCurrentRole,
    orderList,
    cargoList,
    updateResidentNotificationPreference,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'guests' | 'cargo' | 'suggestions' | 'cafe'>('orders');
  const [showNotificationPrefModal, setShowNotificationPrefModal] = useState(false);

  // Count active pending items for badges
  const myOrders = orderList.filter(
    (o) => o.block === residentUser.block && o.apartment === residentUser.apartment
  );
  const myPendingOrders = myOrders.filter((o) => o.status === 'bekleniyor');
  const myCargoInLobby = cargoList.filter(
    (c) => c.block === residentUser.block && c.apartment === residentUser.apartment && c.deliveryStatus === 'guvenlikte'
  );

  const currentPref = residentUser.notificationPreference || 'app';

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col">
      {/* SİTE SAKİNİNE GİDEN BİLDİRİM BANNERLARI */}
      <ResidentOrderNotificationBanner />
      <ResidentCargoNotificationModal />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DDE5DF] px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] font-luxury font-bold text-sm">
              {residentUser.block}{residentUser.apartment}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-luxury font-bold text-[#294C3C]">
                  {siteInfo.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Sakin Portalı
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                {residentUser.fullName} · {residentUser.block} Blok Daire {residentUser.apartment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Preference Quick Button (Requirement 7) */}
            <button
              onClick={() => setShowNotificationPrefModal(true)}
              className="p-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-semibold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
              title="Bildirim Kanalı Tercihi (Uygulama / WhatsApp)"
            >
              <Bell className="w-4 h-4 text-[#648875]" />
              <span className="hidden md:inline">Bildirimler</span>
            </button>

            {/* UNIVERSAL "Ana Menüye Dön" BUTTON (Requirement 1) */}
            <button
              onClick={() => setCurrentRole('guest')}
              className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
              title="Ana Menüye / Rol Seçimine Dön"
            >
              <HomeIcon className="w-3.5 h-3.5 text-[#648875]" />
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

      {/* Tab Navigation */}
      <nav className="bg-[#FFFFFF] border-b border-[#DDE5DF] sticky top-[61px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 flex items-center justify-between sm:justify-start gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#648875]" />
            <span>Siparişlerim</span>
            {myPendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'guests'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Users className="w-4 h-4 text-[#648875]" />
            <span>Misafir Kaydı</span>
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
            <span>Kargolarım</span>
            {myCargoInLobby.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#648875] text-white">
                {myCargoInLobby.length}
              </span>
            )}
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
            <span>Öneri & Talep</span>
          </button>

          <button
            onClick={() => setActiveTab('cafe')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'cafe'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Coffee className="w-4 h-4 text-[#648875]" />
            <span>Lounge Cafe</span>
          </button>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeTab === 'orders' && <OrderTab />}
        {activeTab === 'guests' && <GuestTab />}
        {activeTab === 'cargo' && <CargoTab />}
        {activeTab === 'suggestions' && <SuggestionTab />}
        {activeTab === 'cafe' && <CafeTab />}
      </main>

      {/* NOTIFICATION CHANNEL PREFERENCE MODAL (Requirement 7) */}
      {showNotificationPrefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                    Bildirim Kanalı Tercihi
                  </h3>
                  <p className="text-xs text-[#26342C]/65">
                    Kurye ve kargo bildirimlerini nasıl almak istersiniz?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationPrefModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F8F5] text-[#26342C]/50 hover:text-[#26342C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: VİVA SİTE Mobil Bildirimi */}
              <button
                type="button"
                onClick={() => updateResidentNotificationPreference('app')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  currentPref === 'app'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentPref === 'app' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">1. VİVA SİTE Mobil Bildirimi</p>
                  <p className={`text-[11px] mt-0.5 ${currentPref === 'app' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Tarayıcı ve mobil uygulama içi sesli banner ve modal bildirimleri
                  </p>
                </div>
                {currentPref === 'app' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-1" />}
              </button>

              {false && (<>
              {/* WhatsApp is disabled for the free first release */}
              {/* Option 2: WhatsApp Bildirimi */}
              <button
                type="button"
                onClick={() => updateResidentNotificationPreference('whatsapp')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  currentPref === 'whatsapp'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentPref === 'whatsapp' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold">2. WhatsApp Bildirimi</p>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-700 text-white">
                      WhatsApp
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${currentPref === 'whatsapp' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Meta WhatsApp Business Cloud API üzerinden telefonunuza anlık mesaj
                  </p>
                </div>
                {currentPref === 'whatsapp' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-1" />}
              </button>

              {/* Option 3: Her İkisi */}
              <button
                type="button"
                onClick={() => updateResidentNotificationPreference('both')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  currentPref === 'both'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentPref === 'both' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">3. Her İkisi (Uygulama + WhatsApp)</p>
                  <p className={`text-[11px] mt-0.5 ${currentPref === 'both' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Hem uygulama içi sesli alarm hem de WhatsApp üzerinden çifte bildirim
                  </p>
                </div>
                {currentPref === 'both' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-1" />}
              </button>
              </>)}
            </div>

            {/* Transparent Cloud API Integration Status Disclaimer */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  ENTEGRASYON BEKLİYOR
                </span>
                <span>Meta WhatsApp Business Cloud API</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Canlı WhatsApp mesajları için Meta Cloud API belirteci ve doğrulanmış telefon numarası gerekir. Harici servis bağlantısı yapılana kadar bildirimler uygulama içi sesli sistemle kesintisiz iletilir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNotificationPrefModal(false)}
              className="w-full py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
