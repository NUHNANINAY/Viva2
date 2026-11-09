/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const AdScreenModal: React.FC = () => {
  const { showAdModal, setShowAdModal, siteInfo } = useApp();
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (!showAdModal) {
      setTimeLeft(8);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowAdModal(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showAdModal, setShowAdModal]);

  if (!showAdModal) return null;

  const progressPercent = ((8 - timeLeft) / 8) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#648875] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-[#26342C] relative overflow-hidden">
        {/* Countdown Progress Bar (8 Seconds) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#DDE5DF]">
          <div
            className="h-full bg-[#294C3C] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Header with Skip Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#648875]/20 text-[#294C3C] flex items-center justify-center text-xs font-black">
              {timeLeft}s
            </span>
            <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider">
              Tanıtım / Bilgilendirme
            </span>
          </div>

          <button
            onClick={() => setShowAdModal(false)}
            className="text-xs font-bold text-[#26342C]/70 hover:text-[#26342C] px-3 py-1 rounded-xl border border-[#DDE5DF] bg-[#F7F8F5] hover:bg-white transition-all flex items-center gap-1.5"
            title="Tanıtımı Atla"
          >
            <span>Atla ({timeLeft})</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Presentation Content */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#648875]/15 border-2 border-[#648875]/30 flex items-center justify-center mx-auto text-[#294C3C] shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#294C3C]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C] text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-[#648875]" />
              <span>VİVA SİTE — %100 Ücretsiz ve Bağımsız</span>
            </div>
            <h3 className="text-lg font-bold text-[#294C3C] font-luxury">
              {siteInfo.name}
            </h3>
            <p className="text-xs text-[#26342C]/75 mt-1 leading-relaxed max-w-sm mx-auto">
              Lüks rezidans yönetiminde kurye karşılama, anlık daire teslimat tercihi, araçlı/yaya misafir ve kargo kabulü tek bir ücretsiz çatı altında.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-[#F7F8F5] p-3.5 rounded-2xl border border-[#DDE5DF] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#294C3C]">
            <CheckCircle2 className="w-4 h-4 text-[#648875] shrink-0" />
            <span>Zorunlu abonelik ve gizli ücretlendirme yoktur.</span>
          </div>
          <div className="flex items-center gap-2 text-[#294C3C]">
            <CheckCircle2 className="w-4 h-4 text-[#648875] shrink-0" />
            <span>Dış ücretli servislere bağımlı olmadan tam işlevsellik.</span>
          </div>
          <div className="flex items-center gap-2 text-[#294C3C]">
            <CheckCircle2 className="w-4 h-4 text-[#648875] shrink-0" />
            <span>Nizamiye ile sakin arasında anlık sesli bildirim döngüsü.</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAdModal(false)}
          className="w-full py-3.5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 touch-target"
        >
          <span>Uygulamaya Devam Et</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
