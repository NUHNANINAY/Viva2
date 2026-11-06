/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Plus,
  Inbox,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { CARGO_CARRIERS } from '../../data/initialData';
import { CargoCarrier, CargoDeliveryOption, CargoPackage } from '../../types';

export const CargoTab: React.FC = () => {
  const {
    cargoList,
    deliverCargoToResident,
    respondCargoDelivery,
    addCargo,
    residentUser,
  } = useApp();

  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [carrier, setCarrier] = useState<CargoCarrier>('Trendyol');
  const [deliveryOption, setDeliveryOption] = useState<CargoDeliveryOption>('hold_at_security');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // In-tab SMS Modal state if resident answers from this tab
  const [smsModalCargo, setSmsModalCargo] = useState<CargoPackage | null>(null);
  const [smsInput, setSmsInput] = useState('');

  // Resident's cargos for their specific block & apartment
  const myCargos = cargoList.filter(
    (c) => c.block === residentUser.block && c.apartment === residentUser.apartment
  );

  const pendingResponse = myCargos.filter((c) => c.status === 'yanit_bekliyor');
  const holdAtSecurity = myCargos.filter(
    (c) =>
      c.status === 'guvenlikte_emanet' ||
      c.status === 'kodlu_onay' ||
      c.status === 'kodsuz_onay' ||
      c.status === 'fiziksel_teslim_alindi'
  );
  const outForDelivery = myCargos.filter(
    (c) => c.status === 'eve_gonderilecek' || c.status === 'kurye_dagitimda'
  );
  const completed = myCargos.filter((c) => c.status === 'teslim_edildi');

  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    addCargo({
      trackingCode: trackingCode.trim() || `TY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      carrier,
      block: residentUser.block,
      apartment: residentUser.apartment,
      recipientName: residentUser.name,
      deliveryOption,
      notes: notes.trim() || 'Sakin tarafından önceden bildirildi.',
    });

    setTrackingCode('');
    setNotes('');
    setIsPreOrderOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsModalCargo) return;
    respondCargoDelivery(smsModalCargo.id, 'hold_at_security', smsInput.trim() || undefined);
    setSmsModalCargo(null);
    setSmsInput('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Tab Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20 shadow-inner">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Kargolarım & Emanet Takibi</h2>
            <p className="text-xs text-[#EEE9DE]/60">Nizamiyeye gelen ve bekleyen paketleriniz</p>
          </div>
        </div>
        <button
          onClick={() => setIsPreOrderOpen(!isPreOrderOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-semibold text-[#DFC38E] transition-all touch-target"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Kargo Bekliyorum</span>
        </button>
      </div>

      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Kargo ön bildiriminiz güvenlik konsoluna eklendi. Paket ulaştığında talimatınız uygulanacaktır.</span>
        </div>
      )}

      {/* Pre-Register Cargo Drawer */}
      {isPreOrderOpen && (
        <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/40 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wider">
              Beklenen Kargo Ön Bildirimi
            </h3>
            <button
              onClick={() => setIsPreOrderOpen(false)}
              className="text-xs text-[#EEE9DE]/60 hover:text-[#EEE9DE]"
            >
              Kapat
            </button>
          </div>

          <form onSubmit={handlePreRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
                Kargo Taşıyıcı Firma
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value as CargoCarrier)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              >
                {CARGO_CARRIERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                Takip Numarası / Sipariş Kodu (Varsa)
              </label>
              <input
                type="text"
                placeholder="Örn: 984210452"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#DFC38E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
                Geldiğinde Ne Yapılsın?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('hold_at_security')}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    deliveryOption === 'hold_at_security'
                      ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                      : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60'
                  }`}
                >
                  <p className="font-bold">Güvenlikte Emanet</p>
                  <p className="text-[10px] text-[#EEE9DE]/50">Geldiğimde teslim alırım</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryOption('send_to_apartment')}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                    deliveryOption === 'send_to_apartment'
                      ? 'bg-[#292B36] border-[#C5A66A] text-[#DFC38E]'
                      : 'bg-[#111318] border-[#292B36] text-[#EEE9DE]/60'
                  }`}
                >
                  <p className="font-bold">Eve Gönderilsin</p>
                  <p className="text-[10px] text-[#EEE9DE]/50">Kurye daireye çıksın</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1">
                Açıklama / Kurye Notu
              </label>
              <input
                type="text"
                placeholder="Örn: Kırılabilir ürün, lütfen düz tutun."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
            >
              Kargo Bildirimini Kaydet
            </button>
          </form>
        </div>
      )}

      {/* 0. TERCİH BEKLEYEN YENİ KARGOLAR (YANIT BEKLİYOR) */}
      {pendingResponse.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Teslimat Tercihi Bekleyenler ({pendingResponse.length})
            </h3>
          </div>

          <div className="space-y-3">
            {pendingResponse.map((cargo) => (
              <div
                key={cargo.id}
                className="p-5 rounded-2xl bg-[#1E1B18] border-2 border-[#C5A66A] space-y-3 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#292B36] text-[#DFC38E] text-xs font-bold border border-[#C5A66A]/30">
                        {cargo.carrier}
                      </span>
                      <span className="font-mono text-xs text-[#EEE9DE]/80">{cargo.trackingCode}</span>
                    </div>
                    <p className="text-xs text-[#EEE9DE]/60 mt-1">Ulaştı: {cargo.receivedAt}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    Yanıtınız Bekleniyor
                  </span>
                </div>

                <p className="text-xs font-bold text-[#EEE9DE] leading-snug">
                  "VİVA SİTE – Kargonuz güvenliğe ulaştı. Lütfen teslimat tercihinizi belirtiniz."
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => respondCargoDelivery(cargo.id, 'send_to_apartment')}
                    className="py-2.5 px-3 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/50 text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>EVE GÖNDERİLSİN</span>
                  </button>

                  <button
                    onClick={() => setSmsModalCargo(cargo)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>GÜVENLİKTE EMANET</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. GÜVENLİKTE EMANET KALACAKLAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C5A66A]" />
            <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Güvenlikte Emanet Bekleyenler ({holdAtSecurity.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#EEE9DE]/50">Nizamiyeden teslim alabilirsiniz</span>
        </div>

        {holdAtSecurity.length === 0 ? (
          <div className="p-5 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
            Şu anda güvenlikte bekleyen emanet kargonuz bulunmamaktadır.
          </div>
        ) : (
          <div className="space-y-2.5">
            {holdAtSecurity.map((cargo) => (
              <div
                key={cargo.id}
                className="p-4 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/40 space-y-3 shadow-lg shadow-[#C5A66A]/5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#292B36] text-[#DFC38E] text-xs font-bold border border-[#C5A66A]/30">
                        {cargo.carrier}
                      </span>
                      <span className="font-mono text-xs text-[#EEE9DE]/80">{cargo.trackingCode}</span>
                    </div>
                    <p className="text-xs text-[#EEE9DE]/60 mt-1">
                      Kayıt: {cargo.receivedAt} · {cargo.registeredBy}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {cargo.approvalType === 'kodlu_onay' || cargo.status === 'kodlu_onay' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>KODLU ONAY</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span>KODSUZ ONAY</span>
                      </span>
                    )}

                    {cargo.status === 'fiziksel_teslim_alindi' && (
                      <span className="text-[10px] text-emerald-300 font-semibold">
                        Güvenlik Dolabına Alındı
                      </span>
                    )}
                  </div>
                </div>

                {cargo.notes && (
                  <p className="text-xs text-[#EEE9DE]/70 bg-[#111318] p-2.5 rounded-xl border border-[#292B36]">
                    "{cargo.notes}"
                  </p>
                )}

                <div className="pt-2 border-t border-[#292B36] flex items-center justify-between">
                  <span className="text-[11px] text-[#EEE9DE]/60">
                    {residentUser.block} Blok D:{residentUser.apartment} adınıza kayıtlı
                  </span>
                  <button
                    onClick={() => deliverCargoToResident(cargo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all touch-target"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Elden Teslim Aldım</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. EVE GÖNDERİLECEKLER (KURYE İLE DAĞITIMDA) */}
      {outForDelivery.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Eve Gönderilecekler / Kurye Dağıtımında ({outForDelivery.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {outForDelivery.map((cargo) => (
              <div
                key={cargo.id}
                className="p-4 rounded-2xl bg-[#1B1D25] border-2 border-blue-500/30 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E] text-xs font-bold">
                        {cargo.carrier}
                      </span>
                      <span className="font-mono text-xs text-[#EEE9DE]/80">{cargo.trackingCode}</span>
                    </div>
                    <p className="text-xs text-[#EEE9DE]/60 mt-1">
                      Kurye daire kapınıza doğru yönlendirildi ({cargo.receivedAt})
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                    Eve Gönderiliyor
                  </span>
                </div>

                <div className="pt-2 border-t border-[#292B36] flex justify-end">
                  <button
                    onClick={() => deliverCargoToResident(cargo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all touch-target"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kapıda Teslim Aldım</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GEÇMİŞ TESLİM ALINANLAR */}
      {completed.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#EEE9DE]/50" />
            <h3 className="text-xs font-bold text-[#EEE9DE]/60 uppercase tracking-wider">
              Geçmiş Teslim Alınan Kargolar ({completed.length})
            </h3>
          </div>

          <div className="space-y-2">
            {completed.map((cargo) => (
              <div
                key={cargo.id}
                className="p-3.5 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#EEE9DE]">{cargo.carrier}</span>
                    <span className="text-[#EEE9DE]/50 font-mono text-[11px]">{cargo.trackingCode}</span>
                  </div>
                  <p className="text-[11px] text-[#EEE9DE]/50 mt-0.5">
                    Teslim: {cargo.deliveredAt || 'Tamamlandı'}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Teslim Edildi
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS MODAL IF TRIGGERED DIRECTLY FROM TAB */}
      {smsModalCargo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#1B1D25] border-2 border-[#C5A66A] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center mx-auto border border-[#C5A66A]/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-luxury font-bold text-[#EEE9DE]">KARGO EMANET ONAYI</h3>
              <p className="text-xs text-[#EEE9DE]/70">SMS ile gönderilen dört haneli kodu giriniz.</p>
            </div>

            <form onSubmit={handleSmsSubmit} className="space-y-4">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="••••"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-40 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.5em] rounded-2xl bg-[#111318] border-2 border-[#C5A66A]/50 text-[#DFC38E] focus:outline-none"
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-center text-[#EEE9DE]/70 leading-relaxed font-medium">
                "SMS kodunuz yoksa alanı boş bırakarak Devam Et butonuna basınız."
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSmsModalCargo(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#292B36] text-xs font-semibold text-[#EEE9DE]/70 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider"
                >
                  DEVAM ET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
