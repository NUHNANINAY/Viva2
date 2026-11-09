/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, X, Home, Shield, Sparkles, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResidentCargoPreference } from '../../types';

export const ResidentCargoNotificationModal: React.FC = () => {
  const {
    activeResidentCargoPrompt,
    respondToCargoPreference,
    dismissResidentCargoPrompt,
    residentUser,
  } = useApp();

  // SMS Code Modal state when "Güvenlikte emanet kalsın" is clicked
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCode, setSmsCode] = useState('');

  if (!activeResidentCargoPrompt) return null;

  const handleChoice = (pref: ResidentCargoPreference) => {
    if (pref === 'emanet_kalsin') {
      setShowSmsModal(true);
    } else {
      respondToCargoPreference(activeResidentCargoPrompt.id, 'eve_gonderilsin');
    }
  };

  const handleConfirmEmanetWithSms = () => {
    respondToCargoPreference(activeResidentCargoPrompt.id, 'emanet_kalsin', smsCode.trim());
    setShowSmsModal(false);
    setSmsCode('');
  };

  const isForThisResident =
    activeResidentCargoPrompt.block === residentUser.block &&
    activeResidentCargoPrompt.apartment === residentUser.apartment;

  return (
    <>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 animate-in slide-in-from-top-4 duration-300">
        <div className="bg-[#FFFFFF] border-2 border-[#648875] rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] shrink-0">
                <Package className="w-5 h-5 text-[#294C3C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#648875] text-white">
                    Kargonuz Nizamiyede
                  </span>
                  <span className="text-xs font-bold text-[#648875]">
                    {activeResidentCargoPrompt.carrier}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#294C3C] mt-0.5">
                  {activeResidentCargoPrompt.block} Blok D:{activeResidentCargoPrompt.apartment} – {activeResidentCargoPrompt.recipientName} ({activeResidentCargoPrompt.pieceCount} Adet)
                </h3>
              </div>
            </div>

            <button
              onClick={dismissResidentCargoPrompt}
              aria-label="Kapat"
              className="text-[#26342C]/40 hover:text-[#26342C] p-1.5 rounded-full hover:bg-[#F7F8F5] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Required Question */}
          <div className="bg-[#F7F8F5] rounded-2xl p-3 border border-[#DDE5DF] mb-3.5 text-center">
            <p className="text-xs font-extrabold text-[#294C3C] tracking-wide">
              KARGONUZ EVE Mİ GELSİN, GÜVENLİKTE EMANET Mİ KALSIN?
            </p>
            <p className="text-[11px] text-[#26342C]/70 mt-0.5">
              Lütfen nizamiye teslimat tercihinizi seçiniz
            </p>
          </div>

          {/* 2 Seçenek */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleChoice('eve_gonderilsin')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-[#294C3C] border border-[#DDE5DF] hover:border-[#294C3C] transition-all group touch-target shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-1.5 transition-colors">
                <Home className="w-4 h-4 text-[#648875] group-hover:text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-center">Eve Gönderilsin</span>
              <span className="text-[10px] text-[#26342C]/60 group-hover:text-white/80 mt-0.5">Daire Kapısına</span>
            </button>

            <button
              onClick={() => handleChoice('emanet_kalsin')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-[#294C3C] border border-[#DDE5DF] hover:border-[#294C3C] transition-all group touch-target shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-1.5 transition-colors">
                <Shield className="w-4 h-4 text-[#648875] group-hover:text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-center">Güvenlikte Emanet Kalsın</span>
              <span className="text-[10px] text-[#26342C]/60 group-hover:text-white/80 mt-0.5">Nizamiyeden Alacağım</span>
            </button>
          </div>

          {!isForThisResident && (
            <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-center mt-2">
              Not: Önizleme modunda test amaçlı görüntülenmektedir.
            </p>
          )}
        </div>
      </div>

      {/* SMS KODU MODALI (Birebir İstenen Metinle) */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-[#FFFFFF] border-2 border-[#294C3C] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#294C3C]">Güvenlikte Emanet Kodu</h4>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-[#26342C]/50 hover:text-[#26342C] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#294C3C] mb-1">
                4 Haneli SMS Teslimat Kodu (İsteğe Bağlı)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="Örn: 4892"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] focus:border-[#648875] text-center text-lg font-mono font-bold tracking-widest text-[#294C3C]"
              />
            </div>

            {/* EXACT REQUIRED TEXT */}
            <p className="text-xs text-[#26342C]/75 bg-[#F7F8F5] p-3 rounded-xl border border-[#DDE5DF] leading-relaxed">
              SMS kodunuz yoksa alanı boş bırakarak Devam Et butonuna basınız.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSmsModal(false)}
                className="py-3 px-4 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
              >
                Geri
              </button>

              <button
                type="button"
                onClick={handleConfirmEmanetWithSms}
                className="flex-1 py-3 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 touch-target"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Devam Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
