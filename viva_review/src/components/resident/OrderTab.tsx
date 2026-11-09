/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Clock,
  Home,
  Coffee,
  DoorOpen,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { DeliveryPreference } from '../../types';

export const OrderTab: React.FC = () => {
  const {
    orderList,
    residentUser,
    respondToOrderDeliveryPreference,
    setCurrentRole,
  } = useApp();

  // Filter orders for current resident or show all if in testing
  const myOrders = orderList.filter(
    (o) => o.block === residentUser.block && o.apartment === residentUser.apartment
  );

  const getPreferenceLabel = (pref?: DeliveryPreference) => {
    switch (pref) {
      case 'evdeyim':
        return { label: 'EVDEYİM (Daireme Getirsinler)', icon: Home, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'cafedeyim':
        return { label: 'CAFEDEYİM (Lounge / Kafeye Bıraksınlar)', icon: Coffee, color: 'text-amber-800 bg-amber-50 border-amber-300' };
      case 'kapiya_biraksinlar':
        return { label: 'KAPIYA BIRAKSINLAR (Kapı Önü)', icon: DoorOpen, color: 'text-blue-800 bg-blue-50 border-blue-200' };
      default:
        return { label: 'Tercih Belirtilmedi', icon: Clock, color: 'text-neutral-600 bg-neutral-100 border-neutral-200' };
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center border border-[#648875]/30">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-luxury font-bold text-[#294C3C]">
              Sipariş & Kurye Karşılama
            </h2>
            <p className="text-xs text-[#26342C]/65">
              Nizamiyeye gelen yemek ve kurye siparişleriniz anında burada görünür
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#648875]/15 text-[#294C3C] border border-[#648875]/30">
            {residentUser.block} Blok Daire {residentUser.apartment}
          </span>
        </div>
      </div>

      {/* Orders List / Clean Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
            Gelen Siparişlerim ({myOrders.length})
          </h3>
          <span className="text-[11px] text-[#26342C]/60">
            Otomatik güvenlik senkronizasyonu
          </span>
        </div>

        {/* 2. SİPARİŞ EKRANINI TEMİZLE: Gerçek kayıt oluşana kadar boş durum ekranı */}
        {myOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-center mx-auto text-[#648875]">
              <ShoppingBag className="w-7 h-7 text-[#648875]" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-[#294C3C]">
                Şu Anda Bekleyen Bir Siparişiniz Yok
              </h4>
              <p className="text-xs text-[#26342C]/65 leading-relaxed">
                Trendyol, Getir, Migros, Yemeksepeti veya diğer firmalardan gelen kuryeler nizamiyeye ulaştığında güvenlik kaydı açar ve telefonunuza anında teslimat tercihi bildirimi düşer.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCurrentRole('security')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7F8F5] hover:bg-[#648875] hover:text-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C] transition-all"
              >
                <span>Güvenlik Ekranına Geç ve Sipariş Oluştur</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((ord) => {
              const prefInfo = getPreferenceLabel(ord.deliveryPreference);
              const PrefIcon = prefInfo.icon;

              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-[#294C3C] text-white">
                        {ord.company}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#294C3C]">
                          Kurye Kapıda ({ord.createdAt})
                        </h4>
                        <p className="text-[11px] text-[#26342C]/60">
                          {ord.courierName || 'Kurye'} tarafından getirildi
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {ord.status === 'bekleniyor' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          <span>Tercihiniz Bekleniyor</span>
                        </span>
                      )}
                      {ord.status === 'cevaplandi' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                          <span>Güvenlik Kuryeyi Yönlendiriyor</span>
                        </span>
                      )}
                      {ord.status === 'onaylandi' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#648875]/15 text-[#294C3C] border border-[#648875]/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#294C3C]" />
                          <span>İşlem Onaylandı</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. Preference Prompt if not answered yet */}
                  {ord.status === 'bekleniyor' ? (
                    <div className="space-y-3 bg-[#F7F8F5] p-4 rounded-2xl border border-[#648875]/30">
                      <div className="text-center">
                        <p className="text-xs font-extrabold text-[#294C3C] uppercase tracking-wide">
                          SİPARİŞİNİZ GELDİ. NASIL TESLİM ALMAK İSTERSİNİZ?
                        </p>
                        <p className="text-[11px] text-[#26342C]/70 mt-0.5">
                          Güvenliğin kuryeyi yönlendirebilmesi için seçiminizi yapınız
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <button
                          onClick={() => respondToOrderDeliveryPreference(ord.id, 'evdeyim')}
                          className="p-3 rounded-xl bg-white hover:bg-[#294C3C] hover:text-white border border-[#DDE5DF] font-bold text-xs text-[#294C3C] transition-all flex items-center justify-center gap-2 group shadow-xs touch-target"
                        >
                          <Home className="w-4 h-4 text-[#648875] group-hover:text-white" />
                          <span>EVDEYİM</span>
                        </button>

                        <button
                          onClick={() => respondToOrderDeliveryPreference(ord.id, 'cafedeyim')}
                          className="p-3 rounded-xl bg-white hover:bg-[#294C3C] hover:text-white border border-[#DDE5DF] font-bold text-xs text-[#294C3C] transition-all flex items-center justify-center gap-2 group shadow-xs touch-target"
                        >
                          <Coffee className="w-4 h-4 text-[#648875] group-hover:text-white" />
                          <span>CAFEDEYİM</span>
                        </button>

                        <button
                          onClick={() => respondToOrderDeliveryPreference(ord.id, 'kapiya_biraksinlar')}
                          className="p-3 rounded-xl bg-white hover:bg-[#294C3C] hover:text-white border border-[#DDE5DF] font-bold text-xs text-[#294C3C] transition-all flex items-center justify-center gap-2 group shadow-xs touch-target"
                        >
                          <DoorOpen className="w-4 h-4 text-[#648875] group-hover:text-white" />
                          <span>KAPIYA BIRAKSINLAR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Selected Preference */
                    <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <PrefIcon className="w-4 h-4 text-[#648875]" />
                        <span className="font-semibold text-[#26342C]/80">Verdiğiniz Tercih:</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${prefInfo.color}`}>
                          {prefInfo.label}
                        </span>
                      </div>

                      {ord.answeredAt && (
                        <span className="text-[11px] text-[#26342C]/60">
                          {ord.answeredAt} tarihinde iletildi
                        </span>
                      )}
                    </div>
                  )}

                  {ord.approvedBySecurityAt && (
                    <div className="text-[11px] text-[#648875] font-semibold flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Güvenlik görevlisi kuryeyi tercihinize göre yönlendirdi ({ord.approvedBySecurityAt}).</span>
                    </div>
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
