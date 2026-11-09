/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PackageOpen, Home, Coffee, DoorOpen, X, Sparkles } from 'lucide-react';
import { DeliveryPreference } from '../../types';

export const ResidentOrderNotificationBanner: React.FC = () => {
  const {
    activeResidentOrderPrompt,
    respondToOrderDeliveryPreference,
    dismissResidentOrderPrompt,
    residentUser,
  } = useApp();

  if (!activeResidentOrderPrompt) return null;

  // Verify that notification belongs to this resident's block and apartment (or preview simulation)
  const isForThisResident =
    activeResidentOrderPrompt.block === residentUser.block &&
    activeResidentOrderPrompt.apartment === residentUser.apartment;

  const handleSelect = (preference: DeliveryPreference) => {
    respondToOrderDeliveryPreference(activeResidentOrderPrompt.id, preference);
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#FFFFFF] border-2 border-[#648875] rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] shrink-0">
              <PackageOpen className="w-5 h-5 text-[#294C3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Yeni Sipariş Geldi
                </span>
                <span className="text-xs font-bold text-[#648875]">
                  {activeResidentOrderPrompt.company}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#294C3C] mt-0.5">
                {activeResidentOrderPrompt.block} Blok D:{activeResidentOrderPrompt.apartment} – {activeResidentOrderPrompt.residentName}
              </h3>
            </div>
          </div>

          <button
            onClick={dismissResidentOrderPrompt}
            aria-label="Kapat"
            className="text-[#26342C]/40 hover:text-[#26342C] p-1.5 rounded-full hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Prompt */}
        <div className="bg-[#F7F8F5] rounded-2xl p-3 border border-[#DDE5DF] mb-3.5 text-center">
          <p className="text-xs font-extrabold text-[#294C3C] tracking-wide">
            SİPARİŞİNİZ GELDİ. NASIL TESLİM ALMAK İSTERSİNİZ?
          </p>
          <p className="text-[11px] text-[#26342C]/70 mt-0.5">
            Lütfen kuryenin yönlendirilebilmesi için seçiminizi yapınız
          </p>
        </div>

        {/* 3 Options */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSelect('evdeyim')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-[#294C3C] border border-[#DDE5DF] hover:border-[#294C3C] transition-all group touch-target shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-1.5 transition-colors">
              <Home className="w-4 h-4 text-[#648875] group-hover:text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">EVDEYİM</span>
            <span className="text-[9px] text-[#26342C]/60 group-hover:text-white/80 mt-0.5">Daireye Gelsin</span>
          </button>

          <button
            onClick={() => handleSelect('cafedeyim')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-[#294C3C] border border-[#DDE5DF] hover:border-[#294C3C] transition-all group touch-target shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-1.5 transition-colors">
              <Coffee className="w-4 h-4 text-[#648875] group-hover:text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">CAFEDEYİM</span>
            <span className="text-[9px] text-[#26342C]/60 group-hover:text-white/80 mt-0.5">Lounge / Cafe</span>
          </button>

          <button
            onClick={() => handleSelect('kapiya_biraksinlar')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-[#294C3C] border border-[#DDE5DF] hover:border-[#294C3C] transition-all group touch-target shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-1.5 transition-colors">
              <DoorOpen className="w-4 h-4 text-[#648875] group-hover:text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight">KAPIYA BIRAKSINLAR</span>
            <span className="text-[9px] text-[#26342C]/60 group-hover:text-white/80 mt-0.5">Daire Önü</span>
          </button>
        </div>

        {!isForThisResident && (
          <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-center mt-2">
            Not: Simülasyon modunda diğer dairenin bildirimi test amacıyla görüntüleniyor.
          </p>
        )}
      </div>
    </div>
  );
};
