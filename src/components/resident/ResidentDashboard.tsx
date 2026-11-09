/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResidentOrderNotificationBanner } from './ResidentOrderNotificationBanner';
import { ResidentCargoNotificationModal } from './ResidentCargoNotificationModal';
import { ResidentGuestNotificationModal } from './ResidentGuestNotificationModal';
import { OrderTab } from './OrderTab';
import { GuestTab } from './GuestTab';
import { CargoTab } from './CargoTab';
import { SuggestionTab } from './SuggestionTab';
import { CafeTab } from './CafeTab';
import { DuesTab } from './DuesTab';
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
  Receipt,
  Megaphone,
  Briefcase,
  Key,
  Lock,
  Plus,
  Search,
  Phone,
  Check,
} from 'lucide-react';
import { NotificationChannelPreference, ResidentBusinessProfile } from '../../types';
import { changeCurrentUserPassword } from '../../services/firebase';

export const ResidentDashboard: React.FC = () => {
  const {
    residentUser,
    siteInfo,
    setCurrentRole,
    orderList,
    cargoList,
    updateResidentNotificationPreference,
    cloudSyncStatus,
    announcements,
    markAnnouncementAsRead,
    businessProfiles,
    saveBusinessProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'guests' | 'cargo' | 'dues' | 'announcements' | 'business' | 'suggestions' | 'cafe'
  >('orders');
  const [showNotificationPrefModal, setShowNotificationPrefModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Business Profile modal & filters
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<string>('all');
  const existingMyProfile = businessProfiles.find((b) => b.residentId === residentUser.id);
  const [bizProfession, setBizProfession] = useState(existingMyProfile?.title || existingMyProfile?.profession || '');
  const [bizCategory, setBizCategory] = useState<any>(existingMyProfile?.category || 'Bilişim & Yazılım');
  const [bizDescription, setBizDescription] = useState(existingMyProfile?.description || '');
  const [bizPhone, setBizPhone] = useState(existingMyProfile?.phone || residentUser.phone || '');
  const [bizIsPublic, setBizIsPublic] = useState(existingMyProfile ? (existingMyProfile.showPhone ?? existingMyProfile.isPhonePublic ?? true) : true);
  const [bizContactMethod, setBizContactMethod] = useState<'whatsapp' | 'phone' | 'email'>(
    existingMyProfile?.preferredContactMethod || 'whatsapp'
  );

  // Count active pending items for badges
  const myOrders = orderList.filter(
    (o) => o.block === residentUser.block && o.apartment === residentUser.apartment
  );
  const myPendingOrders = myOrders.filter((o) => o.status === 'bekleniyor');
  const myCargoInLobby = cargoList.filter(
    (c) => c.block === residentUser.block && c.apartment === residentUser.apartment && c.deliveryStatus === 'guvenlikte'
  );

  // Targeted announcements
  const myAnnouncements = announcements.filter((a) => {
    if (a.isActive === false) return false;
    if (a.targetAudience === 'all' || a.targetType === 'tum_site' || !a.targetType) return true;
    if (a.targetAudience === 'block' || a.targetType === 'blok') return a.targetBlock === residentUser.block;
    if (a.targetAudience === 'unit' || a.targetType === 'daire') {
      return a.targetBlock === residentUser.block && a.targetApartment === residentUser.apartment;
    }
    return true;
  });
  const unreadAnnouncements = myAnnouncements.filter((a) => !a.readByUids?.includes(residentUser.id));

  const currentPref = residentUser.notificationPreference || 'app';

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col">
      {/* SİTE SAKİNİNE GİDEN BİLDİRİM BANNERLARI */}
      <ResidentOrderNotificationBanner />
      <ResidentCargoNotificationModal />
      <ResidentGuestNotificationModal />

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
                <span
                  title={cloudSyncStatus === 'connected' ? 'Bulut Senkronize: Canlı' : 'Buluta bağlanıyor...'}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cloudSyncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="hidden sm:inline">{cloudSyncStatus === 'connected' ? 'Canlı Senkron' : 'Bağlanıyor'}</span>
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                {residentUser.fullName} · {residentUser.block} Blok Daire {residentUser.apartment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Password Change Button */}
            <button
              onClick={() => {
                setPassMsg('');
                setPassErr('');
                setShowPasswordChangeModal(true);
              }}
              className="p-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-semibold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Şifremi Değiştir"
            >
              <Key className="w-4 h-4 text-[#648875]" />
              <span className="hidden md:inline">Şifre Değiştir</span>
            </button>

            {/* Notification Preference Quick Button (Requirement 7) */}
            <button
              onClick={() => setShowNotificationPrefModal(true)}
              className="p-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-semibold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Bildirim Kanalı Tercihi (Uygulama / WhatsApp)"
            >
              <Bell className="w-4 h-4 text-[#648875]" />
              <span className="hidden md:inline">Bildirimler</span>
            </button>

            {/* UNIVERSAL "Ana Menüye Dön" BUTTON (Requirement 1) */}
            <button
              onClick={() => setCurrentRole('guest')}
              className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Ana Menüye / Rol Seçimine Dön"
            >
              <HomeIcon className="w-3.5 h-3.5 text-[#648875]" />
              <span className="hidden sm:inline">Ana Menüye Dön</span>
            </button>

            {/* SAFE LOGOUT ICON */}
            <button
              onClick={() => setCurrentRole('guest')}
              title="Güvenli Çıkış (Kayıtlar silinmez)"
              className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation with Neon Glow & Underline Accent */}
      <nav className="bg-[#FFFFFF] border-b border-[#DDE5DF] sticky top-[61px] z-30 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 flex items-center justify-between sm:justify-start gap-1 sm:gap-2">
          {/* 1. Siparişlerim */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'orders'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#648875]" />
            <span>Siparişlerim</span>
            {myPendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            )}
          </button>

          {/* 2. Duyurular */}
          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'announcements'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Megaphone className="w-4 h-4 text-[#648875]" />
            <span>Duyurular</span>
            {unreadAnnouncements.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadAnnouncements.length}
              </span>
            )}
          </button>

          {/* 3. Misafir Kaydı */}
          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'guests'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Users className="w-4 h-4 text-[#648875]" />
            <span>Misafir Kaydı</span>
          </button>

          {/* 4. Kargolarım */}
          <button
            onClick={() => setActiveTab('cargo')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'cargo'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
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

          {/* 5. Aidat & Borçlarım */}
          <button
            onClick={() => setActiveTab('dues')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'dues'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#648875]" />
            <span>Aidat & Borçlarım</span>
          </button>

          {/* 6. Komşu & İş Ağı */}
          <button
            onClick={() => setActiveTab('business')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'business'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#648875]" />
            <span>Komşu & İş Ağı</span>
            {businessProfiles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#648875]/20 text-[#294C3C] text-[10px] font-bold">
                {businessProfiles.length}
              </span>
            )}
          </button>

          {/* 7. Lounge Cafe */}
          <button
            onClick={() => setActiveTab('cafe')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'cafe'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Coffee className="w-4 h-4 text-[#648875]" />
            <span>Lounge Cafe</span>
          </button>

          {/* 8. Öneri & Talep */}
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer neon-glow-hover ${
              activeTab === 'suggestions'
                ? 'border-[#294C3C] text-[#294C3C] neon-glow-active'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-[#648875]" />
            <span>Öneri & Talep</span>
          </button>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeTab === 'orders' && <OrderTab />}
        {activeTab === 'guests' && <GuestTab />}
        {activeTab === 'cargo' && <CargoTab />}
        {activeTab === 'dues' && <DuesTab />}
        {activeTab === 'suggestions' && <SuggestionTab />}
        {activeTab === 'cafe' && <CafeTab />}

        {/* ------------------------------------------- */}
        {/* DUYURULAR (SITE ANNOUNCEMENTS TAB) */}
        {/* ------------------------------------------- */}
        {activeTab === 'announcements' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
              <div>
                <h2 className="text-lg font-luxury font-bold text-[#294C3C]">Site Duyuruları</h2>
                <p className="text-xs text-gray-500">Yönetim ve bina kurulları tarafından iletilen resmi bildirimler</p>
              </div>
              <span className="text-xs font-bold text-[#648875] bg-[#648875]/10 px-2.5 py-1 rounded-full">
                {myAnnouncements.length} Aktif Duyuru
              </span>
            </div>

            {myAnnouncements.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-[#DDE5DF] text-gray-500 space-y-2">
                <Megaphone className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs">Şu anda dairenize yönelik yayınlanmış bir duyuru bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAnnouncements.map((a) => {
                  const isRead = a.readByUids?.includes(residentUser.id);
                  const isUrgent = a.priority === 'urgent' || a.priority === 'acil';
                  const isHigh = a.priority === 'high' || a.priority === 'onemli';
                  const isLow = a.priority === 'low' || a.priority === 'bilgi';

                  const priorityColor = isUrgent
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : isHigh
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : isLow
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300';

                  const priorityLabel = isUrgent
                    ? 'ACİL'
                    : isHigh
                    ? 'ÖNEMLİ'
                    : isLow
                    ? 'BİLGİ'
                    : 'NORMAL';

                  return (
                    <div
                      key={a.id}
                      className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                        isRead
                          ? 'bg-white border-[#DDE5DF]'
                          : 'bg-white border-[#648875] shadow-md ring-1 ring-[#648875]/20'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColor}`}>
                            {priorityLabel}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            {(a.category || 'Duyuru').toUpperCase()}
                          </span>
                          {!isRead && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                              YENİ / OKUNMADI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#294C3C]">{a.title}</h3>
                      <p className="text-xs text-[#26342C]/80 leading-relaxed whitespace-pre-line">{a.content}</p>

                      <div className="pt-2 border-t border-[#DDE5DF]/60 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">
                          Yayınlayan: <strong>{a.authorName}</strong>
                        </span>

                        {!isRead ? (
                          <button
                            onClick={() => markAnnouncementAsRead(a.id, residentUser.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Okundu Olarak İşaretle</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Okundu</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* KOMŞU & İŞ AĞI (BUSINESS NETWORK TAB) */}
        {/* ------------------------------------------- */}
        {activeTab === 'business' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]">
              <div>
                <h2 className="text-lg font-luxury font-bold text-[#294C3C]">Komşu & Dayanışma İş Ağı</h2>
                <p className="text-xs text-gray-500">
                  Sitemiz sakinlerinin mesleki hizmetleri, serbest meslek ve komşular arası iş birliği rehberi
                </p>
              </div>
              <button
                onClick={() => setShowBusinessModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>{existingMyProfile ? 'İlanımı Düzenle' : 'Kendi Hizmetimi Ekle (+)'}</span>
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={businessSearchQuery}
                  onChange={(e) => setBusinessSearchQuery(e.target.value)}
                  placeholder="Meslek, komşu adı veya hizmet ara (örn: avukat, mimar, tesisat, ders)..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] bg-white text-xs focus:outline-none focus:border-[#648875]"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'avukat', label: 'Hukuk & Avukat' },
                  { id: 'doktor', label: 'Sağlık & Doktor' },
                  { id: 'muhendis', label: 'Mühendislik' },
                  { id: 'mimar', label: 'Mimarlık & Tasarım' },
                  { id: 'yazilim', label: 'Yazılım & Bilişim' },
                  { id: 'tamirat', label: 'Tamirat & Usta' },
                  { id: 'ders', label: 'Özel Ders' },
                  { id: 'diger', label: 'Diğer' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setBusinessCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      businessCategoryFilter === cat.id
                        ? 'bg-[#294C3C] text-white shadow-xs'
                        : 'bg-white border border-[#DDE5DF] text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Profiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {businessProfiles
                .filter((p) => {
                  if (businessCategoryFilter !== 'all' && p.category !== businessCategoryFilter) return false;
                  if (!businessSearchQuery.trim()) return true;
                  const q = businessSearchQuery.toLocaleLowerCase('tr');
                  return (
                    p.fullName.toLocaleLowerCase('tr').includes(q) ||
                    (p.title || p.profession || '').toLocaleLowerCase('tr').includes(q) ||
                    (p.description || '').toLocaleLowerCase('tr').includes(q)
                  );
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs hover:border-[#648875] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                          {p.category}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {p.block} Blok · No {p.apartment}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#294C3C]">{p.fullName}</h4>
                      <div className="text-xs font-semibold text-[#648875]">{p.title || p.profession}</div>
                      <p className="text-xs text-[#26342C]/75 leading-relaxed line-clamp-3">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#DDE5DF]/60 flex items-center justify-between">
                      {(p.showPhone ?? p.isPhonePublic) && p.phone ? (
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/90${p.phone.replace(/[^0-9]/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${p.phone}`}
                            className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] hover:bg-gray-50 text-xs font-bold text-[#294C3C] flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#648875]" />
                            <span>Ara</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">İletişim: Güvenlik / Komşu Mesajı</span>
                      )}

                      {p.residentId === residentUser.id && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Sizin İlanınız
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
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

      {/* PASSWORD CHANGE MODAL */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#294C3C]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                    Şifremi Değiştir
                  </h3>
                  <p className="text-xs text-[#26342C]/65">
                    {residentUser.fullName} ({residentUser.block} Blok D{residentUser.apartment})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordChangeModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F8F5] text-[#26342C]/50 hover:text-[#26342C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {passMsg}
              </div>
            )}
            {passErr && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {passErr}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPassMsg('');
                setPassErr('');
                if (newPassword.length < 6) {
                  setPassErr('Yeni şifreniz en az 6 karakterden oluşmalıdır.');
                  return;
                }
                setPassLoading(true);
                const res = await changeCurrentUserPassword(newPassword);
                setPassLoading(false);
                if (res.success) {
                  setPassMsg('Şifreniz başarıyla güncellendi.');
                  setNewPassword('');
                  setTimeout(() => setShowPasswordChangeModal(false), 2000);
                } else {
                  setPassErr(res.message);
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Yeni Parola *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 6 karakterli güçlü parola"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {passLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESIDENT BUSINESS PROFILE EDITOR MODAL */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-[#26342C] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                    Komşu & İş Ağı İlanım
                  </h3>
                  <p className="text-xs text-[#26342C]/65">
                    Diğer komşularınızın size ulaşabilmesi için mesleğinizi ve hizmetinizi tanımlayın
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBusinessModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F8F5] text-[#26342C]/50 hover:text-[#26342C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBusinessProfile({
                  residentId: residentUser.id,
                  fullName: residentUser.fullName,
                  block: residentUser.block,
                  apartment: residentUser.apartment,
                  title: bizProfession.trim(),
                  profession: bizProfession.trim(),
                  category: bizCategory,
                  description: bizDescription.trim(),
                  phone: bizPhone.trim(),
                  showPhone: bizIsPublic,
                  isPhonePublic: bizIsPublic,
                  showEmail: false,
                  showApartment: true,
                  isAvailableForNetworking: true,
                  preferredContactMethod: bizContactMethod,
                });
                setShowBusinessModal(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Meslek / Uzmanlık Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={bizProfession}
                  onChange={(e) => setBizProfession(e.target.value)}
                  placeholder="Örn: Avukat / Gayrimenkul & Miras Hukuku Danışmanı"
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Kategori *</label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                >
                  <option value="avukat">Hukuk & Avukat</option>
                  <option value="doktor">Sağlık & Doktor</option>
                  <option value="muhendis">Mühendislik</option>
                  <option value="mimar">Mimarlık & Tasarım</option>
                  <option value="yazilim">Yazılım & Bilişim</option>
                  <option value="tamirat">Tamirat & Usta</option>
                  <option value="ders">Özel Ders / Eğitmenlik</option>
                  <option value="diger">Diğer Serbest Meslek</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Hizmet Açıklaması & Detaylar *
                </label>
                <textarea
                  rows={3}
                  required
                  value={bizDescription}
                  onChange={(e) => setBizDescription(e.target.value)}
                  placeholder="Komşularınıza sunduğunuz hizmetler, tecrübeniz veya iş birliği alanlarınız..."
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">İletişim Telefonu</label>
                  <input
                    type="tel"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Tercih Edilen İletişim</label>
                  <select
                    value={bizContactMethod}
                    onChange={(e) => setBizContactMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                  >
                    <option value="whatsapp">WhatsApp Mesajı</option>
                    <option value="phone">Telefon Araması</option>
                    <option value="app">Uygulama İçi / Güvenlik</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={bizIsPublic}
                  onChange={(e) => setBizIsPublic(e.target.checked)}
                  className="rounded border-[#DDE5DF] text-[#294C3C] focus:ring-[#648875]"
                />
                <span className="text-xs text-[#26342C]">
                  Telefon numaram site sakinleri iş ağında görünür olsun
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBusinessModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  İlanımı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
