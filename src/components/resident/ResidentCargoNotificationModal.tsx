/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Truck,
  Shield,
  Volume2,
  VolumeX,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { startRepeatingNotificationChime } from '../../utils/audio';
import { CargoPackage } from '../../types';

export const ResidentCargoNotificationModal: React.FC = () => {
  const { cargoList, residentUser, respondCargoDelivery } = useApp();

  // Find unanswered cargos for this resident's apartment
  const pendingCargos = cargoList.filter(
    (c) =>
      c.block === residentUser.block &&
      c.apartment === residentUser.apartment &&
      c.status === 'yanit_bekliyor'
  );

  // Active target cargo being processed
  const activeCargo = pendingCargos[0] as CargoPackage | undefined;

  // View phase: 'prompt' (Eve Gönderilsin / Güvenlikte Emanet) or 'sms_approval' (4 Haneli SMS Kodu)
  const [viewPhase, setViewPhase] = useState<'prompt' | 'sms_approval'>('prompt');
  const [smsCode, setSmsCode] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(50);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Audio chime repeating up to 50 seconds when a new cargo arrives
  useEffect(() => {
    if (!activeCargo) {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      return;
    }

    // Reset countdown and view phase
    setRemainingSeconds(50);
    setViewPhase('prompt');
    setSmsCode('');

    if (!isMuted) {
      const stopFn = startRepeatingNotificationChime(50, 4000, () => {
        setRemainingSeconds(0);
      });
      stopAudioRef.current = stopFn;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
    };
  }, [activeCargo?.id, isMuted]);

  const handleStopAudio = () => {
    setIsMuted(true);
    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
  };

  if (!activeCargo) {
    return null;
  }

  // 1. EVE GÖNDERİLSİN SEÇİMİ
  const handleSelectSendToApartment = () => {
    handleStopAudio();
    respondCargoDelivery(activeCargo.id, 'send_to_apartment');
  };

  // 2. GÜVENLİKTE EMANET KALSIN SEÇİMİ -> SMS ONAY EKRANINI AÇ
  const handleSelectHoldAtSecurity = () => {
    handleStopAudio();
    setViewPhase('sms_approval');
  };

  // 3. SMS ONAY EKRANINDA "DEVAM ET" BUTONUNA BASILDIĞINDA
  const handleCompleteSmsStep = (e: React.FormEvent) => {
    e.preventDefault();
    handleStopAudio();
    const cleanCode = smsCode.trim();
    // Kod girildiyse kodlu onay, boş bırakıldıysa kodsuz onay
    respondCargoDelivery(activeCargo.id, 'hold_at_security', cleanCode || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#1B1D25] border-2 border-[#C5A66A] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#111318] px-5 py-4 border-b border-[#292B36] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#292B36] border border-[#C5A66A]/40 flex items-center justify-center text-[#C5A66A] font-luxury font-bold text-sm shadow-sm">
              V
            </div>
            <div>
              <span className="font-luxury font-bold text-xs tracking-wider text-[#DFC38E] uppercase">
                VİVA SİTE · Kargo Bildirimi
              </span>
              <p className="text-[11px] text-[#EEE9DE]/60">
                {residentUser.block} Blok · Daire {residentUser.apartment}
              </p>
            </div>
          </div>

          {/* Sound Mute / Active Audio Indicator */}
          <div className="flex items-center gap-2">
            {!isMuted && remainingSeconds > 0 ? (
              <button
                type="button"
                onClick={handleStopAudio}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-300 font-bold hover:bg-amber-900/60 transition-colors"
                title="Sesi Sustur"
              >
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>{remainingSeconds}s (Sustur)</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-[#EEE9DE]/40">
                <VolumeX className="w-3.5 h-3.5" />
                <span>Sessiz</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {viewPhase === 'prompt' ? (
            /* AŞAMA 1: TERCİH EKRANI (EVE GÖNDERİLSİN VEYA GÜVENLİKTE EMANET KALSIN) */
            <div className="space-y-5">
              {/* Kargo Bilgi Kartı */}
              <div className="p-4 rounded-2xl bg-[#111318] border border-[#292B36] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[#292B36] text-[#DFC38E] font-bold text-xs border border-[#C5A66A]/30">
                    {activeCargo.carrier}
                  </span>
                  <span className="text-[11px] text-[#EEE9DE]/60">{activeCargo.receivedAt}</span>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[#EEE9DE]/70">Takip Numarası:</span>
                  <span className="font-mono text-[#DFC38E] font-semibold">
                    {activeCargo.trackingCode}
                  </span>
                </div>
                {activeCargo.notes && (
                  <p className="text-[11px] italic text-[#EEE9DE]/50 pt-1 border-t border-[#292B36]">
                    "{activeCargo.notes}"
                  </p>
                )}
              </div>

              {/* Exact Requested Notification Message */}
              <div className="text-center space-y-1.5 py-1">
                <h3 className="text-base sm:text-lg font-bold text-[#EEE9DE] leading-snug">
                  "VİVA SİTE – Kargonuz güvenliğe ulaştı. Lütfen teslimat tercihinizi belirtiniz."
                </h3>
                <p className="text-xs text-[#EEE9DE]/60">
                  Kuryenin doğrudan dairenize yönlendirilmesini mi yoksa nizamiyede emanet kalmasını mı istersiniz?
                </p>
              </div>

              {/* Two Big Options: EVE GÖNDERİLSİN & GÜVENLİKTE EMANET KALSIN */}
              <div className="grid grid-cols-1 gap-3 pt-1">
                {/* 1. Büyük Seçenek: EVE GÖNDERİLSİN */}
                <button
                  type="button"
                  onClick={handleSelectSendToApartment}
                  className="w-full py-4 px-5 rounded-2xl bg-[#1B2234] hover:bg-blue-900/60 border-2 border-blue-500/50 hover:border-blue-400 text-blue-100 font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-950/40 touch-target flex items-center justify-between group active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-200">EVE GÖNDERİLSİN</p>
                      <p className="text-[11px] text-blue-300/70 font-normal">
                        Kurye doğrudan daire kapınıza çıksın
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Büyük Seçenek: GÜVENLİKTE EMANET KALSIN */}
                <button
                  type="button"
                  onClick={handleSelectHoldAtSecurity}
                  className="w-full py-4 px-5 rounded-2xl bg-[#1E251E] hover:bg-emerald-950/70 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-100 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 touch-target flex items-center justify-between group active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-emerald-200">GÜVENLİKTE EMANET KALSIN</p>
                      <p className="text-[11px] text-emerald-300/70 font-normal">
                        Nizamiyede güvenle muhafaza edilsin
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Technical Operating System Disclaimer */}
              <div className="p-3 rounded-2xl bg-[#111318] border border-[#292B36] text-[10px] text-[#EEE9DE]/50 space-y-1">
                <p className="font-semibold text-[#DFC38E]">İşletim Sistemi Bildirim Bilgisi:</p>
                <p className="leading-relaxed">
                  Bildirim sesi 50 saniyeye kadar tekrarlı uyarı verir. Android ve iOS işletim sistemi
                  kısıtlamaları nedeniyle arka plan bildirim ve ses davranışları yerel mobil servisler (FCM/APNs)
                  gerektirir. Demo önizleme ortamında Web Audio API uyarısı çalışmaktadır.
                </p>
              </div>
            </div>
          ) : (
            /* AŞAMA 2: DÖRT HANELİ SMS KODU EKRANI */
            <form onSubmit={handleCompleteSmsStep} className="space-y-5 animate-in slide-in-from-right-2">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center mx-auto border border-[#C5A66A]/30">
                  <KeyRound className="w-6 h-6" />
                </div>
                {/* Başlık: KARGO EMANET ONAYI */}
                <h3 className="text-lg font-luxury font-bold text-[#EEE9DE] tracking-wide">
                  KARGO EMANET ONAYI
                </h3>
                {/* Açıklama: SMS ile gönderilen dört haneli kodu giriniz. */}
                <p className="text-xs text-[#EEE9DE]/75">
                  SMS ile gönderilen dört haneli kodu giriniz.
                </p>
              </div>

              {/* Dört haneli kod giriş alanı */}
              <div className="space-y-2">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="••••"
                    value={smsCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setSmsCode(val);
                    }}
                    className="w-44 py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] rounded-2xl bg-[#111318] border-2 border-[#C5A66A]/50 focus:border-[#C5A66A] focus:outline-none text-[#DFC38E] placeholder:text-[#EEE9DE]/20 shadow-inner"
                    autoFocus
                  />
                </div>

                {/* Exact Required Explanation */}
                <p className="text-[11px] text-center text-[#EEE9DE]/70 leading-relaxed font-medium px-2">
                  "SMS kodunuz yoksa alanı boş bırakarak Devam Et butonuna basınız."
                </p>
              </div>

              {/* Bilgilendirme Notu */}
              <div className="p-3 rounded-2xl bg-[#111318] border border-[#292B36] text-[10px] text-[#EEE9DE]/60 space-y-1">
                <p className="font-semibold text-[#DFC38E]">Doğrulama Durumu:</p>
                <p className="leading-relaxed">
                  {smsCode.trim() ? (
                    <span className="text-emerald-300">
                      Kod girildi. Güvenlik ekranında <strong>KODLU ONAY</strong> olarak kaydedilecektir.
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Alan boş bırakıldı. Güvenlik ekranında <strong>KODSUZ ONAY</strong> olarak işaretlenecektir.
                    </span>
                  )}
                </p>
              </div>

              {/* DEVAM ET Butonu */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg touch-target flex items-center justify-center gap-2"
                >
                  <span>DEVAM ET</span>
                  <ArrowRight className="w-4 h-4 text-[#111318]" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
