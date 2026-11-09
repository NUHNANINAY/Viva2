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
    <div className="space-y-6 pb-8">
      {/* Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#DDE5DF] shadow-md bg-gradient-to-br from-[#294C3C] via-[#3B6653] to-[#648875] text-white p-6 sm:p-8">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#A8BCAF]" />
            <span className="font-bold uppercase tracking-wider">Çok Yakında Hizmetinizde</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[#A8BCAF] font-bold">
              Rezidans Sakinlerine Özel
            </p>
            <h2 className="text-2xl sm:text-3xl font-luxury font-bold text-white leading-tight">
              Viva Privé Cafe & Lounge
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              Rezidans iç avlusunda yalnızca sakinlerimiz ve davetli misafirlerine özel barista kahveleri, gurme atıştırmalıklar ve çalışma alanları hazırlanıyor.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
            <Coffee className="w-5 h-5 text-[#294C3C]" />
          </div>
          <h3 className="text-sm font-bold text-[#294C3C]">Artisan Barista Kahveleri</h3>
          <p className="text-xs text-[#26342C]/70 leading-relaxed">
            Honduras ve Etiyopya tek köken çekirdekler, cold brew, latte çeşitleri ve bitkisel süt alternatifleri.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-[#294C3C]" />
          </div>
          <h3 className="text-sm font-bold text-[#294C3C]">Daireye Hızlı Servis</h3>
          <p className="text-xs text-[#26342C]/70 leading-relaxed">
            Uygulama üzerinden tek dokunuşla kahvaltılık kruvasan ve taze kahveniz 10 dakikada kapınızda.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#294C3C]" />
          </div>
          <h3 className="text-sm font-bold text-[#294C3C]">Çalışma & Toplantı Köşesi</h3>
          <p className="text-xs text-[#26342C]/70 leading-relaxed">
            Sakinlerimizin iş görüşmeleri ve sessiz çalışma saatleri için tasarlanmış izole localar.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-2 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#294C3C]" />
          </div>
          <h3 className="text-sm font-bold text-[#294C3C]">Hizmet Saatleri</h3>
          <p className="text-xs text-[#26342C]/70 leading-relaxed">
            Haftanın 7 günü 07:30 - 23:00 saatleri arasında kesintisiz concierge destekli ikramlar.
          </p>
        </div>
      </div>

      {/* Tasting Event Invitation RSVP */}
      <div className="p-5 rounded-3xl bg-white border-2 border-[#648875]/30 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#648875]" />
          <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
            Açılış & Tadım Daveti (Ön Kayıt)
          </h3>
        </div>
        <p className="text-xs text-[#26342C]/75 leading-relaxed">
          Viva Privé açılış kokteyline katılmak ve barista tadım menüsünü ilk deneyenlerden olmak için ön kayıt oluşturun.
        </p>

        {isRegistered ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kaydınız alındı! {residentUser.block} Blok D:{residentUser.apartment} adına davetiyeniz oluşturuldu.</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsRegistered(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm touch-target"
          >
            Açılış Kokteyline Katılacağım
          </button>
        )}
      </div>
    </div>
  );
};
