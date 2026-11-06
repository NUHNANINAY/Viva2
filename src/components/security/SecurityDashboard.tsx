/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Car,
  Package,
  ShoppingBag,
  LogOut,
  Search,
  CheckCircle2,
  ParkingCircle,
  Plus,
  Smartphone,
  Phone,
  DoorOpen,
  Home,
  UserCheck,
  Footprints,
  Bell,
  Volume2,
  X,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Building,
  User,
  History,
  AlertTriangle,
} from 'lucide-react';
import { AdminCargoTab } from '../admin/AdminCargoTab';
import { PermissionGuideModal } from './PermissionGuideModal';
import { ParkingType } from '../../types';

type SecurityTab = 'gate_lookup' | 'cargo_intake' | 'courier_passes';

export const SecurityDashboard: React.FC = () => {
  const {
    currentSite,
    securityUser,
    activeGuard,
    logoutRole,
    returnToMainMenu,
    guestList,
    orderList,
    updateGuestStatus,
    updateOrderStatus,
    isMobilePreview,
    setIsMobilePreview,
    latestGuestAlert,
    clearGuestAlert,
    markGuestEntry,
    markGuestAsSeen,
    addSecurityGuest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SecurityTab>('gate_lookup');
  const [plateSearch, setPlateSearch] = useState('');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isNewGuestModalOpen, setIsNewGuestModalOpen] = useState(false);

  // New guest modal state
  const [newGuestType, setNewGuestType] = useState<'yaya' | 'aracli'>('aracli');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newTargetBlock, setNewTargetBlock] = useState('A');
  const [newTargetApartment, setNewTargetApartment] = useState('5');
  const [newPlateNumber, setNewPlateNumber] = useState('');
  const [newVehicleBrandModel, setNewVehicleBrandModel] = useState('');
  const [newVehicleColor, setNewVehicleColor] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newGuestError, setNewGuestError] = useState<string | null>(null);

  // Active officer display name (strictly based on the authenticated security guard)
  const officerName = activeGuard
    ? `${activeGuard.firstName} ${activeGuard.lastName}`
    : securityUser.name || 'Nöbetçi Güvenlik Görevlisi';
  const officerUsername = activeGuard?.username || securityUser.username || '';
  const officerShift = activeGuard?.shift || securityUser.shift || 'Gündüz Vardiyası';

  // Filter guests by search
  const filteredGuests = guestList.filter((g) => {
    if (!plateSearch.trim()) return true;
    const query = plateSearch.toLowerCase();
    return (
      (g.plateNumber && g.plateNumber.toLowerCase().includes(query)) ||
      g.guestName.toLowerCase().includes(query) ||
      `${g.residentBlock} ${g.residentApartment}`.toLowerCase().includes(query) ||
      (g.vehicleBrandModel && g.vehicleBrandModel.toLowerCase().includes(query))
    );
  });

  const pendingExpectedGuests = filteredGuests.filter((g) => g.status === 'bekleniyor');
  const pastEnteredGuests = filteredGuests.filter((g) => g.status === 'giris_yapti' || g.status === 'ayrildi');

  const handleOpenNewGuestModal = () => {
    setNewGuestError(null);
    setNewFirstName('');
    setNewLastName('');
    setNewPlateNumber('');
    setNewVehicleBrandModel('');
    setNewVehicleColor('');
    setNewNote('');
    setIsNewGuestModalOpen(true);
  };

  const handleSaveSecurityGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setNewGuestError(null);

    if (!newFirstName.trim() || !newLastName.trim()) {
      setNewGuestError('Lütfen misafir adını ve soyadını giriniz.');
      return;
    }
    if (!newTargetBlock || !newTargetApartment) {
      setNewGuestError('Lütfen ziyaret edilecek blok ve daire numarasını belirtiniz.');
      return;
    }

    const res = addSecurityGuest({
      guestFirstName: newFirstName.trim(),
      guestLastName: newLastName.trim(),
      targetBlock: newTargetBlock,
      targetApartment: Number(newTargetApartment),
      hasVehicle: newGuestType === 'aracli',
      plateNumber: newGuestType === 'aracli' ? newPlateNumber.trim() : undefined,
      vehicleBrandModel: newGuestType === 'aracli' ? newVehicleBrandModel.trim() : undefined,
      vehicleColor: newGuestType === 'aracli' ? newVehicleColor.trim() : undefined,
      note: newNote.trim() || undefined,
    });

    if (res.success) {
      setIsNewGuestModalOpen(false);
    } else {
      setNewGuestError(res.error || 'Misafir kaydedilemedi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center">
      {/* Top Header Bar */}
      <header className="w-full bg-[#1B1D25] border-b border-[#292B36] sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A] shrink-0 font-luxury font-bold text-base shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-luxury font-bold text-sm tracking-wide text-[#DFC38E]">
                  VİVA SİTE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-300 border border-amber-500/40 uppercase font-semibold">
                  Güvenlik Nizamiyesi
                </span>
              </div>
              <p className="text-xs text-[#EEE9DE]/60 truncate max-w-[180px] sm:max-w-xs">
                {currentSite.name} · {securityUser.gateName || 'Ana Giriş Kapısı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Ana Menü Button */}
            <button
              onClick={returnToMainMenu}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] border border-[#C5A66A]/40 text-xs font-bold text-[#DFC38E] transition-all touch-target shadow-sm active:scale-95"
              title="Uygulama Ana Giriş Ekranına Dön"
            >
              <Home className="w-4 h-4 text-[#C5A66A] shrink-0" />
              <span>Ana Menü</span>
            </button>

            {/* Permission Guide Trigger */}
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="p-2 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-[#DFC38E] border border-[#C5A66A]/30 transition-colors touch-target"
              title="Bildirim & Ses Rehberini Aç"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobilePreview((prev) => !prev)}
              className="p-2 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-[#EEE9DE]/70 transition-colors touch-target hidden sm:block"
              title="Mobil görünümü aç/kapat"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Logout Button (Distinct from Ana Menü) */}
            <button
              onClick={logoutRole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-rose-950/80 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold text-rose-300/80 transition-all touch-target"
              title="Güvenlik Oturumunu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>

        {/* Security Officer Info Bar */}
        <div className="bg-[#111318] border-t border-[#292B36] px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs animate-pulse" />
              <UserCheck className="w-3.5 h-3.5 text-[#C5A66A]" />
              <span className="font-bold text-[#EEE9DE]">{officerName}</span>
              {officerUsername && (
                <span className="text-[11px] text-[#C5A66A] font-mono">
                  (@{officerUsername})
                </span>
              )}
              <span className="text-[#EEE9DE]/30">·</span>
              <span className="text-[#DFC38E] font-medium">{officerShift}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(true)}
                className="text-[11px] text-[#C5A66A] hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ses & Arka Plan Ayarı</span>
              </button>
              <span className="text-[11px] text-[#EEE9DE]/50 hidden sm:inline">
                Nizamiye Kontrol Noktası
              </span>
            </div>
          </div>
        </div>

        {/* Fast Action Tabs */}
        <div className="max-w-4xl mx-auto px-4 py-1.5 flex items-center gap-2 border-t border-[#292B36]/60">
          <button
            onClick={() => setActiveTab('gate_lookup')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all touch-target flex items-center justify-center gap-1.5 ${
              activeTab === 'gate_lookup'
                ? 'bg-[#C5A66A] text-[#111318] font-bold shadow-sm'
                : 'text-[#EEE9DE]/70 hover:bg-[#292B36]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Misafir & Plaka Sorgulama</span>
          </button>

          <button
            onClick={() => setActiveTab('cargo_intake')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all touch-target flex items-center justify-center gap-1.5 ${
              activeTab === 'cargo_intake'
                ? 'bg-[#C5A66A] text-[#111318] font-bold shadow-sm'
                : 'text-[#EEE9DE]/70 hover:bg-[#292B36]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Hızlı Kargo Kabulü</span>
          </button>

          <button
            onClick={() => setActiveTab('courier_passes')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all touch-target flex items-center justify-center gap-1.5 ${
              activeTab === 'courier_passes'
                ? 'bg-[#C5A66A] text-[#111318] font-bold shadow-sm'
                : 'text-[#EEE9DE]/70 hover:bg-[#292B36]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Kurye & Sipariş</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 py-5 flex-1 space-y-5">
        {/* Real-time Guest Alert Banner (Repeats until acknowledged or admitted) */}
        {latestGuestAlert && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#1B251E] to-[#162019] border-2 border-emerald-500 shadow-2xl text-xs space-y-3 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 fill-current animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-300">
                      YENİ MİSAFİR BİLDİRİMİ!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 uppercase font-semibold">
                      Anlık Zil Uyarısı
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    Sakin tarafından nizamiyeye giriş yetkisi tanımlandı
                  </p>
                </div>
              </div>
              <button
                onClick={clearGuestAlert}
                className="p-1 rounded-lg bg-emerald-950 text-emerald-300 hover:text-white"
                title="Uyarıyı Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-white">{latestGuestAlert.guest.guestName}</strong>
                  {latestGuestAlert.guest.hasVehicle ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                      Araçlı {latestGuestAlert.guest.plateNumber ? `(${latestGuestAlert.guest.plateNumber})` : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                      Yaya
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-200">
                  <strong>Daire:</strong> {latestGuestAlert.guest.residentBlock} Blok · D:{latestGuestAlert.guest.residentApartment} ({latestGuestAlert.guest.residentName})
                </p>
                {latestGuestAlert.guest.parkingType && latestGuestAlert.guest.parkingType !== 'none' && (
                  <p className="text-[11px] text-emerald-200/90">
                    <strong>Otopark:</strong> {latestGuestAlert.guest.parkingType === 'kapali_otopark' ? 'Kapalı Otopark' : 'Açık Otopark'}
                    {latestGuestAlert.guest.indoorEscortOption === 'escort_needed'
                      ? ' · Refakat istendi'
                      : latestGuestAlert.guest.indoorEscortOption === 'knows_spot_no_escort'
                      ? ' · Park yerini biliyor'
                      : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => markGuestAsSeen(latestGuestAlert.guestId)}
                  className="px-3 py-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-500/40 transition-all touch-target"
                >
                  Gördüm (Sesi Durdur)
                </button>
                <button
                  onClick={() => markGuestEntry(latestGuestAlert.guestId)}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center gap-1.5"
                >
                  <DoorOpen className="w-4 h-4 text-black" />
                  <span>GİRİŞ YAPTI</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Gate Lookup & Expected Guests */}
        {activeTab === 'gate_lookup' && (
          <div className="space-y-6">
            {/* Action Bar: Search & "YENİ MİSAFİR" Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Plaka (örn: 34 AB), misafir adı veya daire no sorgula..."
                  value={plateSearch}
                  onChange={(e) => setPlateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/30 focus:border-[#C5A66A] focus:outline-none text-xs sm:text-sm text-[#DFC38E] font-medium"
                />
              </div>

              {/* BÜYÜK "YENİ MİSAFİR" BUTONU (Güvenlik doğrudan kapıda kayıt yapabilsin) */}
              <button
                type="button"
                onClick={handleOpenNewGuestModal}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#C5A66A]/10 touch-target flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#111318]" />
                <span>YENİ MİSAFİR</span>
              </button>
            </div>

            {/* 1. BEKLENEN MİSAFİRLER (Yeşil Vurgulu Bölüm) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs animate-pulse" />
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>BEKLENEN MİSAFİRLER</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] text-emerald-300">
                      {pendingExpectedGuests.length}
                    </span>
                  </h3>
                </div>
                <span className="text-[11px] text-[#EEE9DE]/50">
                  Sakinler tarafından önceden bildirilenler
                </span>
              </div>

              {pendingExpectedGuests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#162019] border border-emerald-500/30 space-y-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-sm">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-200">Şu Anda Beklenen Misafir Yok</h4>
                  <p className="text-[11px] text-[#EEE9DE]/65 max-w-sm mx-auto leading-relaxed">
                    Sakinler "MİSAFİRİM GELECEK" butonuyla bildirim yaptığında burada yeşil vurgulu kartlar olarak listelenecek ve sesli zil çalacaktır.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {pendingExpectedGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-[#17231A] to-[#1B271F] border-2 border-emerald-500/50 shadow-lg text-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base font-bold text-white tracking-wide">
                            {guest.guestName}
                          </span>
                          {guest.hasVehicle ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Car className="w-3 h-3 text-emerald-400" />
                              <span>ARAÇLI</span>
                              {guest.plateNumber && (
                                <span className="font-mono ml-1 font-bold">[{guest.plateNumber}]</span>
                              )}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <Footprints className="w-3 h-3 text-emerald-400" />
                              <span>YAYA</span>
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-black/40 text-[#DFC38E] border border-[#C5A66A]/30">
                            {guest.residentBlock} Blok · D:{guest.residentApartment} ({guest.residentName})
                          </span>
                        </div>

                        <span className="text-[10px] text-emerald-300/80 font-mono">
                          {guest.createdAt}
                        </span>
                      </div>

                      {/* Details row: Vehicle, Parking, Escort */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#EEE9DE]/85">
                        <div className="space-y-1">
                          {guest.hasVehicle && (
                            <p>
                              <strong className="text-[#DFC38E]">Araç: </strong>
                              {guest.vehicleBrandModel || 'Belirtilmedi'} {guest.vehicleColor ? `(${guest.vehicleColor})` : ''}
                            </p>
                          )}
                          <p>
                            <strong className="text-[#DFC38E]">Otopark Tercihi: </strong>
                            <span className="text-emerald-300 font-semibold">
                              {guest.parkingType === 'kapali_otopark'
                                ? 'Kapalı Otopark (Daireye Tahsisli)'
                                : guest.parkingType === 'acik_otopark'
                                ? 'Açık Misafir Otoparkı'
                                : 'Otopark Kullanılmayacak'}
                            </span>
                          </p>
                        </div>

                        <div className="space-y-1">
                          {guest.indoorEscortOption && (
                            <p className="p-1.5 rounded-lg bg-black/30 border border-emerald-500/20 text-emerald-200">
                              <strong className="text-white">Refakat: </strong>
                              {guest.indoorEscortOption === 'escort_needed'
                                ? '⚠️ Güvenlik refakat etsin, park yerini göstersin'
                                : '✓ Park yerini biliyor, refakat gerekmiyor'}
                            </p>
                          )}
                          {guest.note && (
                            <p className="italic text-[#EEE9DE]/70">
                              "{guest.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* "GİRİŞ YAPTI" Butonu: Tıklanınca geçmiş girişlere taşır ve beklenenlerden kaldırır */}
                      <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300/70">
                          {guest.registrationSource === 'security' ? 'Güvenlik tarafından oluşturuldu' : 'Sakin bildirimi'}
                        </span>

                        <button
                          type="button"
                          onClick={() => markGuestEntry(guest.id)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center gap-1.5"
                        >
                          <DoorOpen className="w-4 h-4 text-black" />
                          <span>GİRİŞ YAPTI</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. GEÇMİŞ GİRİŞLER */}
            <div className="space-y-3 pt-4 border-t border-[#292B36]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C5A66A]" />
                  <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
                    Geçmiş Girişler ({pastEnteredGuests.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#EEE9DE]/50">
                  Nizamiyeden içeri alınmış misafirler
                </span>
              </div>

              {pastEnteredGuests.length === 0 ? (
                <div className="p-4 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-xs text-[#EEE9DE]/50">
                  Henüz içeri alınmış geçmiş misafir kaydı bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2">
                  {pastEnteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="p-3.5 rounded-xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#EEE9DE]">{guest.guestName}</span>
                          {guest.plateNumber && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#111318] text-[#DFC38E] border border-[#292B36]">
                              {guest.plateNumber}
                            </span>
                          )}
                          <span className="text-[11px] text-[#EEE9DE]/70">
                            {guest.residentBlock} Blok · D:{guest.residentApartment} ({guest.residentName})
                          </span>
                        </div>
                        <p className="text-[10px] text-[#EEE9DE]/50">
                          Giriş Zamanı: {guest.entryTime || guest.createdAt} · {guest.registrationSource === 'security' ? 'Nizamiyede Güvenlik Kaydetti' : 'Sakin Bildirimi'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 justify-end">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                          İçeride (Giriş Yaptı)
                        </span>
                        {guest.status === 'giris_yapti' && (
                          <button
                            type="button"
                            onClick={() => updateGuestStatus(guest.id, 'ayrildi')}
                            className="px-2.5 py-1 rounded-lg bg-[#292B36] hover:bg-rose-950/60 text-[#EEE9DE]/70 hover:text-rose-300 text-[11px] transition-colors"
                          >
                            Çıkış Yaptı
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Cargo Intake */}
        {activeTab === 'cargo_intake' && <AdminCargoTab />}

        {/* Tab 3: Courier Passes */}
        {activeTab === 'courier_passes' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Kurye Geçiş İzinleri
            </h3>

            {orderList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-3 my-2">
                <div className="w-12 h-12 rounded-2xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A] mx-auto shadow-sm">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#EEE9DE]">Bekleyen Kurye / Sipariş Bildirimi Yok</h4>
                  <p className="text-xs text-[#EEE9DE]/65 max-w-md mx-auto leading-relaxed">
                    Sakinler tarafından kapıya veya lobimize yönlendirilmiş aktif bir kurye/sipariş kaydı bulunmuyor.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {orderList.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#EEE9DE]">{ord.company}</span>
                          <span className="px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E]">
                            {ord.residentBlock} Blok · D:{ord.residentApartment} ({ord.residentName})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#EEE9DE]/60 mt-0.5">{ord.createdAt}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ord.status === 'teslim_edildi'
                            ? 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
                            : 'text-amber-300 bg-amber-950/40 border-amber-500/30'
                        }`}
                      >
                        {ord.status === 'teslim_edildi' ? 'Teslim Edildi' : 'Kurye Bekleniyor'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs">
                      <span className="text-[#C5A66A] font-semibold">Sakin Yönlendirmesi: </span>
                      <strong className="text-[#EEE9DE]">
                        {ord.deliveryLocation === 'direct_home'
                          ? 'Doğrudan Eve Çıksın'
                          : ord.deliveryLocation === 'leave_at_door'
                          ? 'Kapıya Bıraksın'
                          : "Lobi Cafe'ye Bıraksın"}
                      </strong>
                      {ord.courierNote && (
                        <p className="text-[11px] italic text-[#EEE9DE]/60 mt-1">"{ord.courierNote}"</p>
                      )}
                    </div>

                    {ord.status !== 'teslim_edildi' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'teslim_edildi')}
                          className="px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition-all touch-target"
                        >
                          Kuryeyi Kapıdan İçeri Al
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* YENİ MİSAFİR GİRİŞİ MODALI (Güvenlik Personeli Tarafından Kapıda Kayıt) */}
      {isNewGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#1B1D25] border-2 border-[#C5A66A]/40 rounded-3xl p-6 text-[#EEE9DE] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#292B36] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#292B36] border border-[#C5A66A]/30 text-[#C5A66A] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wide">
                    Nizamiyede Yeni Misafir Kaydı
                  </h3>
                  <p className="text-[11px] text-[#EEE9DE]/60">Kapıda bizzat başvuran misafirler için</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewGuestModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#111318] text-[#EEE9DE]/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* YAYA vs ARAÇLI SEÇİMİ */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewGuestType('yaya')}
                className={`p-3 rounded-2xl border text-left transition-all touch-target flex items-center gap-3 ${
                  newGuestType === 'yaya'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60'
                }`}
              >
                <Footprints className="w-5 h-5 text-[#C5A66A]" />
                <div>
                  <p className="font-bold text-xs">YAYA MİSAFİR</p>
                  <p className="text-[10px] opacity-70">Kapıdan geçiş</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewGuestType('aracli')}
                className={`p-3 rounded-2xl border text-left transition-all touch-target flex items-center gap-3 ${
                  newGuestType === 'aracli'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60'
                }`}
              >
                <Car className="w-5 h-5 text-[#C5A66A]" />
                <div>
                  <p className="font-bold text-xs">ARAÇLI MİSAFİR</p>
                  <p className="text-[10px] opacity-70">Bariyer ve otopark</p>
                </div>
              </button>
            </div>

            <form onSubmit={handleSaveSecurityGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                    Misafir Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                    Misafir Soyadı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kaya"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                  />
                </div>
              </div>

              {/* Gidilecek Blok ve Daire No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                    Gidilecek Blok *
                  </label>
                  <select
                    value={newTargetBlock}
                    onChange={(e) => setNewTargetBlock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#DFC38E]"
                  >
                    <option value="A">A Blok</option>
                    <option value="B">B Blok</option>
                    <option value="C">C Blok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                    Daire No *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    required
                    value={newTargetApartment}
                    onChange={(e) => setNewTargetApartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                  />
                </div>
              </div>

              {/* Araçlı ise Plaka & Model */}
              {newGuestType === 'aracli' && (
                <div className="p-3.5 rounded-2xl bg-[#111318] border border-[#292B36] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                        Plaka <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: 34 VR 999"
                        value={newPlateNumber}
                        onChange={(e) => setNewPlateNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#DFC38E] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                        Marka/Model
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: BMW 320"
                        value={newVehicleBrandModel}
                        onChange={(e) => setNewVehicleBrandModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                        Renk
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Beyaz"
                        value={newVehicleColor}
                        onChange={(e) => setNewVehicleColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                  Güvenlik Notu <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: Kimlik kontrolü yapıldı, sakin teyit etti"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
              </div>

              {newGuestError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{newGuestError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewGuestModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE]/70 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-2"
                >
                  <DoorOpen className="w-4 h-4 text-[#111318]" />
                  <span>Kaydet & İçeri Al</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Guide Modal */}
      <PermissionGuideModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
      />
    </div>
  );
};
