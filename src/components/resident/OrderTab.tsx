/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  DoorOpen,
  Coffee,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Home,
} from 'lucide-react';
import { DeliveryLocation, NotificationPreference } from '../../types';

export const OrderTab: React.FC = () => {
  const { orderList, addOrder, residentUser } = useApp();

  const [company, setCompany] = useState('Yemeksepeti');
  const [customCompany, setCustomCompany] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>('direct_home');
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference>('call_on_arrival');
  const [courierNote, setCourierNote] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Filter orders for this resident
  const myOrders = orderList.filter(
    (o) => o.residentBlock === residentUser.block && o.residentApartment === residentUser.apartment
  );

  const quickCompanies = [
    'Yemeksepeti',
    'Getir',
    'Trendyol Yemek',
    'Migros Hemen',
    'Su Servisi (Damacana)',
    'Diğer',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompany = company === 'Diğer' ? customCompany.trim() || 'Özel Sipariş' : company;

    addOrder({
      company: finalCompany,
      deliveryLocation,
      notificationPreference,
      courierNote: courierNote.trim() || undefined,
    });

    setCourierNote('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Tab Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Sipariş & Kurye Talimatı</h2>
            <p className="text-xs text-[#EEE9DE]/60">Nizamiyeye teslimat yeri ve bildirim tercihi iletin</p>
          </div>
        </div>
        <span className="text-xs text-[#DFC38E] font-medium hidden sm:inline">
          {residentUser.block} Blok D:{residentUser.apartment}
        </span>
      </div>

      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Sipariş talimatınız kaydedildi. Kurye geldiğinde nizamiyedeki güvenlik görevlisi seçtiğiniz şekilde yönlendirecektir.</span>
        </div>
      )}

      {/* Order Instruction Form */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/25 space-y-5">
        <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#C5A66A]" />
          <span>Yeni Sipariş & Kurye Bildirimi</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-2">
              Sipariş Firması / Hizmet
            </label>
            <div className="flex flex-wrap gap-2">
              {quickCompanies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompany(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    company === c
                      ? 'bg-[#C5A66A] text-[#111318] border-[#C5A66A] font-bold shadow-sm'
                      : 'bg-[#111318] text-[#EEE9DE]/70 border-[#292B36] hover:border-[#C5A66A]/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {company === 'Diğer' && (
              <input
                type="text"
                required
                placeholder="Firma veya kurye adını yazın..."
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                className="w-full mt-2.5 px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
              />
            )}
          </div>

          {/* 1. Teslimat Yeri Tercihi */}
          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-2">
              1. Teslimat Yeri Tercihi *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setDeliveryLocation('direct_home')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryLocation === 'direct_home'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE] shadow-sm'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Home className="w-4 h-4 text-[#C5A66A]" />
                  <input
                    type="radio"
                    name="deliveryLoc"
                    checked={deliveryLocation === 'direct_home'}
                    onChange={() => setDeliveryLocation('direct_home')}
                    className="accent-[#C5A66A]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#EEE9DE]">Doğrudan Eve</p>
                  <p className="text-[11px] text-[#EEE9DE]/60 mt-0.5">Kurye daireye çıksın, zili çalsın</p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryLocation('leave_at_door')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryLocation === 'leave_at_door'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE] shadow-sm'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <DoorOpen className="w-4 h-4 text-[#C5A66A]" />
                  <input
                    type="radio"
                    name="deliveryLoc"
                    checked={deliveryLocation === 'leave_at_door'}
                    onChange={() => setDeliveryLocation('leave_at_door')}
                    className="accent-[#C5A66A]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#EEE9DE]">Kapıya Bırak</p>
                  <p className="text-[11px] text-[#EEE9DE]/60 mt-0.5">Temassız, kapı önüne bıraksın</p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryLocation('redirect_to_cafe')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  deliveryLocation === 'redirect_to_cafe'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE] shadow-sm'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Coffee className="w-4 h-4 text-[#C5A66A]" />
                  <input
                    type="radio"
                    name="deliveryLoc"
                    checked={deliveryLocation === 'redirect_to_cafe'}
                    onChange={() => setDeliveryLocation('redirect_to_cafe')}
                    className="accent-[#C5A66A]"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#EEE9DE]">Cafe'ye Yönlendir</p>
                  <p className="text-[11px] text-[#EEE9DE]/60 mt-0.5">Lobi / Cafe barına teslim edilsin</p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Bildirim Tercihi */}
          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-2">
              2. Bildirim Tercihi *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                onClick={() => setNotificationPreference('call_on_arrival')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  notificationPreference === 'call_on_arrival'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE]'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-[#C5A66A] shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EEE9DE]">Geldiğinde Aranmak İstiyorum</p>
                  <p className="text-[10px] text-[#EEE9DE]/60">Nizamiye veya kurye arasın</p>
                </div>
                <input
                  type="radio"
                  name="notifPref"
                  checked={notificationPreference === 'call_on_arrival'}
                  onChange={() => setNotificationPreference('call_on_arrival')}
                  className="accent-[#C5A66A]"
                />
              </label>

              <label
                onClick={() => setNotificationPreference('whatsapp_message')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  notificationPreference === 'whatsapp_message'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE]'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#C5A66A] shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EEE9DE]">WhatsApp Mesajı İstiyorum</p>
                  <p className="text-[10px] text-[#EEE9DE]/60">Sessiz bildirim mesajı</p>
                </div>
                <input
                  type="radio"
                  name="notifPref"
                  checked={notificationPreference === 'whatsapp_message'}
                  onChange={() => setNotificationPreference('whatsapp_message')}
                  className="accent-[#C5A66A]"
                />
              </label>

              <label
                onClick={() => setNotificationPreference('both')}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  notificationPreference === 'both'
                    ? 'bg-[#292B36] border-[#C5A66A] text-[#EEE9DE]'
                    : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/70 hover:border-[#C5A66A]/40'
                }`}
              >
                <div className="flex items-center gap-1 text-[#C5A66A] shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#EEE9DE]">Arama ve WhatsApp</p>
                  <p className="text-[10px] text-[#EEE9DE]/60">Çift yönlü bildirim</p>
                </div>
                <input
                  type="radio"
                  name="notifPref"
                  checked={notificationPreference === 'both'}
                  onChange={() => setNotificationPreference('both')}
                  className="accent-[#C5A66A]"
                />
              </label>
            </div>
          </div>

          {/* Courier Note */}
          <div>
            <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
              Kurye ve Güvenlik İçin Özel Not
            </label>
            <input
              type="text"
              placeholder="Örn: Bebek uyuyor zile basmayın, kapı önündeki paspasa bırakın."
              value={courierNote}
              onChange={(e) => setCourierNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-md touch-target flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#111318]" />
            <span>Sipariş Talimatını İlet</span>
          </button>
        </form>
      </div>

      {/* Existing Orders List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
          Sipariş Bildirimlerim ({myOrders.length})
        </h3>

        {myOrders.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
            Kayıtlı sipariş bildiriminiz bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2.5">
            {myOrders.map((ord) => {
              const deliveryLabels: Record<DeliveryLocation, string> = {
                direct_home: 'Doğrudan Eve',
                leave_at_door: 'Kapıya Bırak',
                redirect_to_cafe: "Cafe'ye Yönlendir",
              };

              const prefLabels: Record<NotificationPreference, string> = {
                call_on_arrival: 'Telefonla Arama',
                whatsapp_message: 'WhatsApp Mesajı',
                both: 'Arama + WhatsApp',
              };

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#EEE9DE]">{ord.company}</h4>
                      <p className="text-xs text-[#EEE9DE]/60 mt-0.5">{ord.createdAt}</p>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        ord.status === 'teslim_edildi'
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                          : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                      }`}
                    >
                      {ord.status === 'teslim_edildi' ? 'Teslim Edildi' : 'Kurye Bekleniyor'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#292B36] flex flex-wrap items-center gap-3 text-xs text-[#EEE9DE]/70">
                    <span className="flex items-center gap-1">
                      <span className="text-[#C5A66A]">Teslimat:</span>
                      <strong className="text-[#EEE9DE]">{deliveryLabels[ord.deliveryLocation]}</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#C5A66A]">Bildirim:</span>
                      <strong className="text-[#EEE9DE]">{prefLabels[ord.notificationPreference]}</strong>
                    </span>
                  </div>

                  {ord.courierNote && (
                    <p className="text-[11px] italic text-[#EEE9DE]/60 pt-1">
                      "{ord.courierNote}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
