/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coffee,
  Sparkles,
  Clock,
  CupSoda,
  UtensilsCrossed,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';

export const CafeTab: React.FC = () => {
  const { residentUser } = useApp();
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      {/* Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#C5A66A]/30 shadow-2xl bg-[#111318]">
        <div className="relative h-60 sm:h-72 w-full">
          <img
            src="/src/assets/images/viva_lounge_cafe_1793969309296.jpg"
            alt="Viva Prive Cafe & Lounge"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/40 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C5A66A]/40 text-xs text-[#DFC38E]">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A66A]" />
          <span className="font-semibold uppercase tracking-wider">Çok Yakında</span>
        </div>

        <div className="p-6 space-y-2 -mt-16 relative z-10">
          <p className="text-xs uppercase tracking-widest text-[#C5A66A] font-semibold">
            Rezidans Sakinlerine Özel
          </p>
          <h2 className="text-2xl sm:text-3xl font-luxury font-bold text-[#EEE9DE] leading-tight">
            Viva Privé Cafe & Lounge
          </h2>
          <p className="text-xs sm:text-sm text-[#EEE9DE]/80 leading-relaxed">
            Rezidans iç avlusunda yalnızca sakinler ve misafirlerine hizmet verecek olan özel cafe & bar alanımız hazırlanıyor.
          </p>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#EEE9DE]">Artisan Barista Kahveleri</h3>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Honduras ve Etiyopya tek köken çekirdekler, cold brew, latte çeşitleri ve bitkisel süt alternatifleri.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#EEE9DE]">Daireye Hızlı Servis</h3>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Uygulama üzerinden tek dokunuşla kahvaltılık kruvasan ve taze kahveniz 10 dakikada kapınızda.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#EEE9DE]">Çalışma & Toplantı Köşesi</h3>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Sakinlerimizin iş görüşmeleri ve sessiz çalışma saatleri için tasarlanmış izole localar.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#EEE9DE]">Hizmet Saatleri</h3>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Haftanın 7 günü 07:30 - 23:00 saatleri arasında kesintisiz concierge destekli ikramlar.
          </p>
        </div>
      </div>

      {/* Tasting Event Invitation RSVP */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/30 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C5A66A]" />
          <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
            Açılış Öncesi Özel Tadım Daveti
          </h3>
        </div>
        <p className="text-xs text-[#EEE9DE]/80 leading-relaxed">
          Sayın {residentUser.name} ({residentUser.block} Blok D:{residentUser.apartment}), açılış öncesi barista tadım gününe sınırlı kontenjanla davetlisiniz.
        </p>

        {isRegistered ? (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Kaydınız alındı! Açılış haftası özel davetiyeniz kapınıza ulaştırılacaktır.</span>
          </div>
        ) : (
          <button
            onClick={() => setIsRegistered(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
          >
            Özel Tadım Gününe Ön Kayıt Ol
          </button>
        )}
      </div>
    </div>
  );
};
