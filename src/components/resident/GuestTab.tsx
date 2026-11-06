/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Car,
  Footprints,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
  ShieldCheck,
  Clock,
  Sparkles,
  Compass,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import { ParkingType, IndoorEscortOption } from '../../types';

export const GuestTab: React.FC = () => {
  const { guestList, addResidentGuest, residentUser } = useApp();

  // Form display state: closed by default or open after clicking "MİSAFİRİM GELECEK"
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [guestType, setGuestType] = useState<'yaya' | 'aracli'>('aracli');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleBrandModel, setVehicleBrandModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [parkingType, setParkingType] = useState<ParkingType>('kapali_otopark');
  const [indoorEscortOption, setIndoorEscortOption] = useState<IndoorEscortOption>('escort_needed');
  const [note, setNote] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter guests belonging to this resident
  const myGuests = guestList.filter(
    (g) => g.residentBlock === residentUser.block && g.residentApartment === residentUser.apartment
  );

  const pendingGuests = myGuests.filter((g) => g.status === 'bekleniyor');
  const pastGuests = myGuests.filter((g) => g.status === 'giris_yapti' || g.status === 'ayrildi');

  const handleOpenForm = (type?: 'yaya' | 'aracli') => {
    if (type) setGuestType(type);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Lütfen misafirinizin adını ve soyadını eksiksiz giriniz.');
      return;
    }

    const res = addResidentGuest({
      guestFirstName: firstName.trim(),
      guestLastName: lastName.trim(),
      hasVehicle: guestType === 'aracli',
      plateNumber: guestType === 'aracli' ? plateNumber.trim() : undefined,
      vehicleBrandModel: guestType === 'aracli' ? vehicleBrandModel.trim() : undefined,
      vehicleColor: guestType === 'aracli' ? vehicleColor.trim() : undefined,
      parkingType: guestType === 'aracli' ? parkingType : 'none',
      indoorEscortOption:
        guestType === 'aracli' && parkingType === 'kapali_otopark' ? indoorEscortOption : undefined,
      note: note.trim() || undefined,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Misafir kaydı oluşturulamadı.');
      return;
    }

    // Success: reset and close form
    setFirstName('');
    setLastName('');
    setPlateNumber('');
    setVehicleBrandModel('');
    setVehicleColor('');
    setParkingType('kapali_otopark');
    setIndoorEscortOption('escort_needed');
    setNote('');
    setIsFormOpen(false);

    setSuccessNotice(
      'Misafir kaydınız güvenlik nizamiyesine anlık sesli bildirimle iletildi. Misafiriniz ulaştığında doğrudan içeri alınacaktır.'
    );
    setTimeout(() => setSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/30 shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Misafir Bildirim Portalı</h2>
            <p className="text-xs text-[#EEE9DE]/60">
              {residentUser.block} Blok · Daire {residentUser.apartment} ({residentUser.name})
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#292B36] text-[#DFC38E] border border-[#C5A66A]/30 font-semibold hidden sm:inline">
          Anlık Güvenlik Bağlantılı
        </span>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-relaxed font-medium">{successNotice}</span>
        </div>
      )}

      {/* 1. SİTE SAKİNİ ANA BUTONU: MİSAFİRİM GELECEK */}
      {!isFormOpen ? (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1B1D25] to-[#161820] border-2 border-[#C5A66A]/40 shadow-xl text-center space-y-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#292B36] text-[#DFC38E] text-[11px] font-semibold border border-[#C5A66A]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A66A]" />
              <span>Hızlı Nizamiye Bildirimi</span>
            </div>
            <h3 className="text-lg font-luxury font-bold text-[#EEE9DE] tracking-wide">
              Siteye Ziyaretçi Bekliyor musunuz?
            </h3>
            <p className="text-xs text-[#EEE9DE]/60 max-w-sm mx-auto leading-relaxed">
              Önceden bildirilen misafirler nizamiyede bekletilmeden kapıdan veya otopark bariyerinden içeri alınır.
            </p>
          </div>

          {/* BÜYÜK "MİSAFİRİM GELECEK" BUTONU */}
          <button
            type="button"
            onClick={() => handleOpenForm('aracli')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-sm sm:text-base uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-[#C5A66A]/15 touch-target flex items-center justify-center gap-2.5"
          >
            <User className="w-5 h-5 text-[#111318]" />
            <span>MİSAFİRİM GELECEK</span>
            <ArrowRight className="w-5 h-5 text-[#111318]" />
          </button>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleOpenForm('yaya')}
              className="py-2.5 px-3 rounded-xl bg-[#292B36] hover:bg-[#343746] text-[#EEE9DE] text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-[#292B36]"
            >
              <Footprints className="w-4 h-4 text-[#C5A66A]" />
              <span>Yaya Misafir</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenForm('aracli')}
              className="py-2.5 px-3 rounded-xl bg-[#292B36] hover:bg-[#343746] text-[#EEE9DE] text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-[#292B36]"
            >
              <Car className="w-4 h-4 text-[#C5A66A]" />
              <span>Araçlı Misafir</span>
            </button>
          </div>
        </div>
      ) : (
        /* MİSAFİRİM GELECEK KAYIT FORMU */
        <div className="p-6 rounded-3xl bg-[#1B1D25] border-2 border-[#C5A66A]/50 space-y-5 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[#292B36] pb-3">
            <div>
              <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wider">
                Misafirim Gelecek Bildirimi
              </h3>
              <p className="text-[11px] text-[#EEE9DE]/60">Nizamiyeye anlık giriş yetkisi tanımlanır</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-[#EEE9DE]/60 hover:text-white px-2.5 py-1 rounded-lg bg-[#111318]"
            >
              Vazgeç
            </button>
          </div>

          {/* İki Seçenek: YAYA MİSAFİR veya ARAÇLI MİSAFİR */}
          <div>
            <label className="block text-[11px] font-bold text-[#DFC38E] uppercase tracking-wider mb-2">
              Geliş Şekli *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGuestType('yaya')}
                className={`p-3 rounded-2xl border text-left transition-all touch-target flex items-center gap-3 ${
                  guestType === 'yaya'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E] shadow-md'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60 hover:text-[#EEE9DE]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    guestType === 'yaya' ? 'bg-[#C5A66A] text-[#111318]' : 'bg-[#292B36] text-[#EEE9DE]/60'
                  }`}
                >
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs">YAYA MİSAFİR</p>
                  <p className="text-[10px] opacity-70">Yaya giriş kapısı</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGuestType('aracli')}
                className={`p-3 rounded-2xl border text-left transition-all touch-target flex items-center gap-3 ${
                  guestType === 'aracli'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E] shadow-md'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60 hover:text-[#EEE9DE]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    guestType === 'aracli' ? 'bg-[#C5A66A] text-[#111318]' : 'bg-[#292B36] text-[#EEE9DE]/60'
                  }`}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs">ARAÇLI MİSAFİR</p>
                  <p className="text-[10px] opacity-70">Otopark ve bariyer</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ortak Alanlar: Misafir Adı ve Soyadı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                  Misafirin Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                  Misafirin Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yılmaz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
              </div>
            </div>

            {/* ARAÇLI MİSAFİR İÇİN EK BİLGİLER */}
            {guestType === 'aracli' && (
              <div className="p-4 rounded-2xl bg-[#111318] border border-[#292B36] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#292B36] pb-2">
                  <Car className="w-4 h-4 text-[#C5A66A]" />
                  <span className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
                    Araç ve Otopark Bilgileri
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                      Araç Plakası <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 34 ABC 123"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#DFC38E] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                      Araç Marka ve Modeli <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Mercedes C200"
                      value={vehicleBrandModel}
                      onChange={(e) => setVehicleBrandModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                      Araç Rengi <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Füme, Beyaz, Siyah"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1D25] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                    />
                  </div>
                </div>

                {/* Otopark Tercihi */}
                <div className="space-y-2 pt-2 border-t border-[#292B36]">
                  <label className="block text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
                    Otopark Tercihi *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setParkingType('acik_otopark')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        parkingType === 'acik_otopark'
                          ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                          : 'bg-[#1B1D25] border-[#292B36] text-[#EEE9DE]/60'
                      }`}
                    >
                      <p className="font-bold text-xs">Açık Otopark</p>
                      <p className="text-[10px] opacity-70">Açık misafir otopark alanı</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setParkingType('kapali_otopark')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        parkingType === 'kapali_otopark'
                          ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                          : 'bg-[#1B1D25] border-[#292B36] text-[#EEE9DE]/60'
                      }`}
                    >
                      <p className="font-bold text-xs">Kapalı Otopark</p>
                      <p className="text-[10px] opacity-70">Daireme tahsisli kapalı alan</p>
                    </button>
                  </div>

                  {/* Kapalı otopark seçildiğinde iki işaretlenebilir seçenek gösterilir */}
                  {parkingType === 'kapali_otopark' && (
                    <div className="p-3.5 rounded-xl bg-[#1B1D25] border border-[#C5A66A]/30 space-y-2.5 animate-in fade-in">
                      <p className="text-[11px] font-bold text-[#DFC38E] uppercase">
                        Kapalı Otopark Refakat Tercihi:
                      </p>

                      <div className="space-y-2">
                        {/* Seçenek 1: Güvenlik refakat etsin, park yerimi göstersin. */}
                        <label
                          onClick={() => setIndoorEscortOption('escort_needed')}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            indoorEscortOption === 'escort_needed'
                              ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                              : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70'
                          }`}
                        >
                          <input
                            type="radio"
                            name="escort_option"
                            checked={indoorEscortOption === 'escort_needed'}
                            onChange={() => setIndoorEscortOption('escort_needed')}
                            className="mt-0.5 accent-[#C5A66A]"
                          />
                          <span className="text-xs font-semibold leading-relaxed">
                            Güvenlik refakat etsin, park yerimi göstersin.
                          </span>
                        </label>

                        {/* Seçenek 2: Park yerimi biliyor, refakat gerekmiyor. */}
                        <label
                          onClick={() => setIndoorEscortOption('knows_spot_no_escort')}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            indoorEscortOption === 'knows_spot_no_escort'
                              ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                              : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70'
                          }`}
                        >
                          <input
                            type="radio"
                            name="escort_option"
                            checked={indoorEscortOption === 'knows_spot_no_escort'}
                            onChange={() => setIndoorEscortOption('knows_spot_no_escort')}
                            className="mt-0.5 accent-[#C5A66A]"
                          />
                          <span className="text-xs font-semibold leading-relaxed">
                            Park yerimi biliyor, refakat gerekmiyor.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* İsteğe Bağlı Not */}
            <div>
              <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                Güvenliğe Not / Açıklama <span className="text-[#EEE9DE]/40 font-normal">(İsteğe bağlı)</span>
              </label>
              <input
                type="text"
                placeholder="Örn: Saat 15:00 civarı bekleniyor, eşyalı gelecek"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* "KAYDA AL" Butonu */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#C5A66A]/10 touch-target flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#111318]" />
                <span>KAYDA AL</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. SAKİNİN BEKLENEN MİSAFİRLERİ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A66A]" />
            <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Beklenen Misafirlerim ({pendingGuests.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#EEE9DE]/50">Nizamiyede aktif bekleyenler</span>
        </div>

        {pendingGuests.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-1.5 text-xs text-[#EEE9DE]/60">
            <p className="font-semibold text-[#EEE9DE]">Aktif Beklenen Misafir Kaydı Yok</p>
            <p className="text-[11px] text-[#EEE9DE]/50 max-w-sm mx-auto">
              Misafiriniz gelmeden önce yukarıdaki "MİSAFİRİM GELECEK" butonuyla bildirim yapabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-4 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/30 space-y-2.5 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#EEE9DE]">{guest.guestName}</span>
                      {guest.hasVehicle ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#292B36] text-[#DFC38E] border border-[#C5A66A]/30 flex items-center gap-1">
                          <Car className="w-3 h-3 text-[#C5A66A]" />
                          <span>Araçlı</span>
                          {guest.plateNumber && <span className="font-mono">({guest.plateNumber})</span>}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#292B36] text-[#EEE9DE]/80 border border-[#292B36] flex items-center gap-1">
                          <Footprints className="w-3 h-3 text-[#EEE9DE]/60" />
                          <span>Yaya</span>
                        </span>
                      )}
                    </div>

                    {guest.hasVehicle && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#EEE9DE]/70">
                        {guest.vehicleBrandModel && (
                          <span>
                            {guest.vehicleBrandModel} {guest.vehicleColor ? `(${guest.vehicleColor})` : ''}
                          </span>
                        )}
                        <span>·</span>
                        <span className="text-[#DFC38E]">
                          {guest.parkingType === 'kapali_otopark' ? 'Kapalı Otopark' : 'Açık Otopark'}
                        </span>
                        {guest.indoorEscortOption && (
                          <>
                            <span>·</span>
                            <span className="italic text-[#EEE9DE]/60">
                              {guest.indoorEscortOption === 'escort_needed'
                                ? 'Refakat istendi'
                                : 'Refakat gerekmiyor'}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {guest.note && (
                      <p className="text-[11px] italic text-[#EEE9DE]/60">"{guest.note}"</p>
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    Nizamiyede Bekleniyor
                  </span>
                </div>

                <div className="pt-2 border-t border-[#292B36] flex items-center justify-between text-[11px] text-[#EEE9DE]/50">
                  <span>Oluşturulma: {guest.createdAt}</span>
                  <span className="text-[#C5A66A]">Güvenlik ekranında kayıtlı</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. GEÇMİŞ MİSAFİR GİRİŞLERİ */}
      {pastGuests.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-[#EEE9DE]/70 uppercase tracking-wider">
              Geçmiş Misafir Girişleri ({pastGuests.length})
            </h3>
          </div>

          <div className="space-y-2">
            {pastGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-3.5 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#EEE9DE]">{guest.guestName}</span>
                    {guest.plateNumber && (
                      <span className="font-mono text-[11px] text-[#DFC38E]">({guest.plateNumber})</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#EEE9DE]/50 mt-0.5">
                    Giriş: {guest.entryTime || guest.createdAt}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  Giriş Yaptı
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
