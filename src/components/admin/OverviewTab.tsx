/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Users,
  Package,
  MessageSquareQuote,
  ShieldCheck,
  Building,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const { siteInfo, orderList, guestList, cargoList, suggestionList } = useApp();

  const pendingOrders = orderList.filter((o) => o.status === 'bekleniyor').length;
  const cargoInLobby = cargoList.filter((c) => (c.deliveryStatus || c.status) === 'guvenlikte').length;
  const activeGuests = guestList.filter((g) => g.status === 'giris_yapti').length;
  const pendingSuggestions = suggestionList.filter((s) => s.status === 'inceleniyor').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#26342C]/70 uppercase tracking-wider">
              Toplam Sipariş
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#294C3C]">{orderList.length}</span>
            {pendingOrders > 0 && (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {pendingOrders} beklemede
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#26342C]/70 uppercase tracking-wider">
              Lobi Kargo
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#294C3C]">{cargoInLobby}</span>
            <span className="text-[10px] text-[#26342C]/60 font-semibold">teslim bekliyor</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#26342C]/70 uppercase tracking-wider">
              İçerideki Misafir
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#294C3C]">{activeGuests}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              aktif
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#26342C]/70 uppercase tracking-wider">
              Sakin Talepleri
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#294C3C]">{pendingSuggestions}</span>
            <span className="text-[10px] text-[#26342C]/60 font-semibold">cevap bekleyen</span>
          </div>
        </div>
      </div>

      {/* Site General Summary Card */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-[#648875]" />
            <span>Site & Rezidans Genel Durumu</span>
          </h3>
          <span className="text-xs font-semibold text-[#648875]">
            {siteInfo.city} · {siteInfo.address}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF]">
            <span className="text-[10px] font-bold text-[#26342C]/60 uppercase tracking-wider">
              Kayıtlı Bloklar
            </span>
            <p className="text-base font-bold text-[#294C3C] mt-1">
              {siteInfo.blocks?.map((b) => b.block).join(', ') || 'A, B, C, E, F, G, H, I'} ({siteInfo.blockCount} Blok)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF]">
            <span className="text-[10px] font-bold text-[#26342C]/60 uppercase tracking-wider">
              Toplam Konut Sayısı
            </span>
            <p className="text-base font-bold text-[#294C3C] mt-1">
              {siteInfo.apartmentCount} Bağımsız Bölüm
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF]">
            <span className="text-[10px] font-bold text-[#26342C]/60 uppercase tracking-wider">
              Nizamiye Güvenlik Ekibi
            </span>
            <p className="text-base font-bold text-[#294C3C] mt-1">
              {siteInfo.securityCount} Personel (7/24 Vardiya)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
