/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, ChevronRight, ShieldCheck, Crown } from 'lucide-react';

export const AdScreenModal: React.FC = () => {
  const { showAdModal, closeAdModal } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(8);

  useEffect(() => {
    if (!showAdModal) {
      setSecondsLeft(8);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          closeAdModal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showAdModal, closeAdModal]);

  if (!showAdModal) return null;

  const progressPercent = ((8 - secondsLeft) / 8) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#1B1D25] border border-[#C5A66A]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Progress bar */}
        <div className="w-full bg-[#111318] h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Bar with Skip Button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#292B36] bg-[#111318]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A66A] animate-pulse" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#C5A66A]">
              Sponsorlu Tanıtım · {secondsLeft} sn
            </span>
          </div>
          <button
            onClick={closeAdModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-semibold text-[#EEE9DE] transition-all duration-200 touch-target"
            aria-label="Reklamı Atla"
          >
            <span>Atla</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ad Visual Media */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#111318]">
          <img
            src="/src/assets/images/viva_residence_night_1793969308867.jpg"
            alt="Viva Prive Luxury Residence"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1D25] via-transparent to-black/30" />
          
          <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-[#C5A66A]/40 text-[11px] text-[#DFC38E]">
            <Crown className="w-3.5 h-3.5 text-[#C5A66A]" />
            <span className="font-semibold tracking-wide">VİVA PRIVÉ</span>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#C5A66A]">Ayrıcalıklı Yaşam</p>
            <h2 className="text-xl font-luxury font-bold text-[#EEE9DE] leading-tight">
              Rezidans Kulübü & Özel Concierge
            </h2>
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-[#EEE9DE]/80 leading-relaxed">
            VİVA SİTE sakinlerine özel: 7/24 özel şoförlü transfer, VIP cafe & lounge rezervasyonu, özel spa paketleri ve kuru temizleme vale servisinde %25 hoş geldin indirimi.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#292B36]/60 border border-[#C5A66A]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DFC38E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A66A]" />
                <span>Vale & Transfer</span>
              </div>
              <p className="text-[11px] text-[#EEE9DE]/70">Havalimanı ve şehir içi özel VIP transfer</p>
            </div>

            <div className="p-3 rounded-xl bg-[#292B36]/60 border border-[#C5A66A]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DFC38E] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A66A]" />
                <span>Özel Lounge</span>
              </div>
              <p className="text-[11px] text-[#EEE9DE]/70">Sakinlere özel barista kahve ve toplantı odaları</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 bg-[#111318]/90 border-t border-[#292B36] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#EEE9DE]/60">
            <span>Tek seferlik ilk açılış gösterimi</span>
          </div>
          <button
            onClick={closeAdModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
          >
            <span>Uygulamaya Geç</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
