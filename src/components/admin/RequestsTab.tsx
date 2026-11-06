/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ParkingCircle,
  PhoneCall,
  MessageSquare,
  Shield,
  ArrowRight,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { DeliveryLocation, NotificationPreference, ParkingOption } from '../../types';

export const RequestsTab: React.FC = () => {
  const { guestList, orderList, updateGuestStatus, updateOrderStatus } = useApp();
  const [subTab, setSubTab] = useState<'guests' | 'orders'>('guests');

  const parkingLabels: Record<ParkingOption, string> = {
    short_term_indoor: 'Kısa Süreli Kapalı Otopark',
    resident_has_one_spot: 'Dairenin Kapalı Otopark Yeri',
    standard_outdoor: 'Açık Misafir Otoparkı',
    none: 'Otopark Gereksiz (Yaya)',
  };

  const deliveryLabels: Record<DeliveryLocation, string> = {
    direct_home: 'Doğrudan Eve Çıksın',
    leave_at_door: 'Kapıya Bıraksın',
    redirect_to_cafe: "Cafe'ye Yönlendirilsin",
  };

  const notifLabels: Record<NotificationPreference, string> = {
    call_on_arrival: 'Telefonla Arama',
    whatsapp_message: 'WhatsApp Bildirimi',
    both: 'Arama + WhatsApp',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Sakin Giriş & Geçiş Talepleri</h2>
            <p className="text-xs text-[#EEE9DE]/60">Misafir araçları, ziyaretçiler ve kurye izinleri</p>
          </div>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#111318] rounded-xl border border-[#292B36]">
          <button
            type="button"
            onClick={() => setSubTab('guests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'guests'
                ? 'bg-[#C5A66A] text-[#111318] shadow-sm'
                : 'text-[#EEE9DE]/60 hover:text-[#EEE9DE]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Misafirler ({guestList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'orders'
                ? 'bg-[#C5A66A] text-[#111318] shadow-sm'
                : 'text-[#EEE9DE]/60 hover:text-[#EEE9DE]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Kurye & Sipariş ({orderList.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'guests' ? (
        /* GUEST REQUESTS LIST */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Misafir Bildirimleri Listesi
            </h3>
            <span className="text-[11px] text-[#EEE9DE]/50">Nizamiye Kapı Kontrolü</span>
          </div>

          {guestList.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
              Kayıtlı misafir talebi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {guestList.map((guest) => (
                <div
                  key={guest.id}
                  className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-3 hover:border-[#C5A66A]/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#EEE9DE]">{guest.guestName}</span>
                        {guest.hasVehicle && guest.plateNumber && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#111318] text-[#DFC38E] border border-[#292B36]">
                            {guest.plateNumber}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#292B36] text-[#EEE9DE]/80">
                          {guest.residentBlock} Blok · D:{guest.residentApartment} ({guest.residentName})
                        </span>
                      </div>
                      <p className="text-xs text-[#EEE9DE]/60 mt-1">
                        Zamanlama: {guest.isImmediate ? 'Hemen Geliyor' : guest.scheduledDate ? `${guest.scheduledDate} · ${guest.scheduledTime || ''}` : 'Planlı Giriş'} · Bildirim: {guest.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {guest.status === 'bekleniyor' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                          Kapıda Bekleniyor
                        </span>
                      )}
                      {guest.status === 'giris_yapti' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                          Siteye Giriş Yaptı
                        </span>
                      )}
                      {guest.status === 'ayrildi' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/60 text-slate-400 border border-slate-700/30">
                          Ayrıldı
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#292B36] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#EEE9DE]/70">
                      <ParkingCircle className="w-4 h-4 text-[#C5A66A]" />
                      <span>
                        {guest.parkingOption && parkingLabels[guest.parkingOption]
                          ? parkingLabels[guest.parkingOption]
                          : guest.parkingType === 'kapali_otopark'
                          ? 'Kapalı Otopark'
                          : guest.parkingType === 'acik_otopark'
                          ? 'Açık Otopark'
                          : 'Yaya Girişi'}
                      </span>
                    </div>

                    {/* Actions for guards */}
                    <div className="flex items-center gap-2">
                      {guest.status === 'bekleniyor' && (
                        <button
                          onClick={() => updateGuestStatus(guest.id, 'giris_yapti')}
                          className="px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all touch-target"
                        >
                          Bariyeri Aç & Giriş Onayla
                        </button>
                      )}
                      {guest.status === 'giris_yapti' && (
                        <button
                          onClick={() => updateGuestStatus(guest.id, 'ayrildi')}
                          className="px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-[#111318] text-[#EEE9DE]/70 hover:text-[#EEE9DE] text-xs font-semibold transition-all touch-target flex items-center gap-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Çıkış Yaptı</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {guest.note && (
                    <p className="text-[11px] italic text-[#EEE9DE]/60 bg-[#111318] p-2 rounded-lg">
                      Sakin Notu: "{guest.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ORDER REQUESTS LIST */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Kurye Geçiş ve Sipariş Bildirimleri
            </h3>
            <span className="text-[11px] text-[#EEE9DE]/50">Nizamiye Yönlendirme</span>
          </div>

          {orderList.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
              Kayıtlı sipariş bildirimi bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {orderList.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#EEE9DE]">{ord.company}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E]">
                          {ord.residentBlock} Blok · D:{ord.residentApartment} ({ord.residentName})
                        </span>
                      </div>
                      <p className="text-xs text-[#EEE9DE]/60 mt-1">{ord.createdAt}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        ord.status === 'teslim_edildi'
                          ? 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
                          : 'text-amber-300 bg-amber-950/40 border-amber-500/30'
                      }`}
                    >
                      {ord.status === 'teslim_edildi' ? 'Teslim Edildi' : 'Kurye Bekleniyor'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#C5A66A] font-semibold">Sakin Tercihi: </span>
                      <span className="text-[#EEE9DE] font-bold">{deliveryLabels[ord.deliveryLocation]}</span>
                    </div>
                    <div>
                      <span className="text-[#C5A66A] font-semibold">Bildirim Şekli: </span>
                      <span className="text-[#EEE9DE]">{notifLabels[ord.notificationPreference]}</span>
                    </div>
                  </div>

                  {ord.courierNote && (
                    <p className="text-[11px] italic text-[#EEE9DE]/60">
                      Sakin Talimatı: "{ord.courierNote}"
                    </p>
                  )}

                  {ord.status !== 'teslim_edildi' && (
                    <div className="pt-2 border-t border-[#292B36] flex justify-end">
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'teslim_edildi')}
                        className="px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all touch-target"
                      >
                        Kurye Geçişini & Teslimini Onayla
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
