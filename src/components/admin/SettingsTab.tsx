/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Shield,
  Phone,
  User,
  CheckCircle2,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { SITE_BLOCKS } from '../../data/initialData';

export const SettingsTab: React.FC = () => {
  const { currentSite, adminUser, securityUser, resetDemoData, getGuardsForSite } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [managerName, setManagerName] = useState(currentSite.managerName);
  const [managerPhone, setManagerPhone] = useState(currentSite.managerPhone);
  const [securityPhone, setSecurityPhone] = useState(currentSite.securityPhone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Site ve Personel Ayarları</h2>
            <p className="text-xs text-[#EEE9DE]/60">Mülk konfigürasyonu ve güvenlik vardiyaları</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Ayarlar başarıyla güncellendi.</span>
        </div>
      )}

      {/* Property Details */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-4">
        <h3 className="text-xs font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#C5A66A]" />
          <span>Mülk Bilgileri</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36]">
            <p className="text-[#EEE9DE]/60 text-[11px]">Site Adı</p>
            <p className="font-bold text-[#EEE9DE] text-sm mt-0.5">{currentSite.name}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36]">
            <p className="text-[#EEE9DE]/60 text-[11px]">Konum</p>
            <p className="font-bold text-[#EEE9DE] text-sm mt-0.5">
              {currentSite.district}, {currentSite.city}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36] sm:col-span-2">
            <p className="text-[#EEE9DE]/60 text-[11px]">Açık Adres</p>
            <p className="text-[#EEE9DE] mt-0.5">{currentSite.address}</p>
          </div>
        </div>

        {/* Blocks Layout */}
        <div className="space-y-1.5 pt-2 border-t border-[#292B36]">
          <p className="text-xs font-semibold text-[#DFC38E]">
            Aktif Blok Konfigürasyonu ({currentSite.blocks.length} Blok)
          </p>
          <div className="flex flex-wrap gap-2">
            {currentSite.blocks.map((blk) => (
              <span
                key={blk}
                className="px-3 py-1 rounded-lg bg-[#111318] border border-[#292B36] text-xs font-semibold text-[#EEE9DE]"
              >
                {blk} Blok (1-15 Daire)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Security Staff Details */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-4">
        <h3 className="text-xs font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#C5A66A]" />
          <span>Nöbetçi Güvenlik & Nizamiye Ekibi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36]">
            <p className="text-[#EEE9DE]/60 text-[11px]">Nöbetçi Görevli</p>
            <p className="font-bold text-[#EEE9DE] text-sm mt-0.5">{securityUser.name}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36]">
            <p className="text-[#EEE9DE]/60 text-[11px]">Aktif Vardiya</p>
            <p className="font-bold text-[#DFC38E] text-xs mt-0.5">{securityUser.shift}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36]">
            <p className="text-[#EEE9DE]/60 text-[11px]">Nizamiye Noktası</p>
            <p className="font-bold text-[#EEE9DE] text-xs mt-0.5">{securityUser.gateName}</p>
          </div>
        </div>

        {getGuardsForSite(currentSite.id).length > 0 && (
          <div className="pt-2 border-t border-[#292B36] space-y-2">
            <p className="text-xs font-semibold text-[#DFC38E]">
              Kayıtlı 6 Güvenlik Görevlisi
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {getGuardsForSite(currentSite.id).map((g) => (
                <div key={g.id} className="p-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-[11px] space-y-0.5">
                  <p className="font-bold text-[#EEE9DE]">{g.firstName} {g.lastName}</p>
                  <p className="text-[#C5A66A] font-mono text-[10px]">@{g.username}</p>
                  <p className="text-[#EEE9DE]/50 text-[10px] truncate">{g.shift}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Configuration Form */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-4">
        <h3 className="text-xs font-luxury font-bold text-[#DFC38E] uppercase tracking-wider">
          Yönetici & Güvenlik İletişim Numaraları
        </h3>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
              Site Müdürü Adı
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                Yönetim İletişim Telefonu
              </label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                Nizamiye / Güvenlik Masası Tel
              </label>
              <input
                type="text"
                value={securityPhone}
                onChange={(e) => setSecurityPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider shadow-md touch-target"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Reset Demo State Section */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-[#EEE9DE]">Demo Verilerini Sıfırla</p>
          <p className="text-[11px] text-[#EEE9DE]/60">
            Tüm kargo, misafir ve talep verilerini orijinal fabrika ayarlarına döndürür.
          </p>
        </div>
        <button
          onClick={resetDemoData}
          className="px-3.5 py-2 rounded-xl bg-[#292B36] hover:bg-rose-950/80 hover:text-rose-300 border border-transparent hover:border-rose-500/30 text-xs font-semibold text-[#EEE9DE]/80 transition-all touch-target flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sıfırla</span>
        </button>
      </div>
    </div>
  );
};
