/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, CheckCircle2, Clock, Shield, Home, Key, X, Info } from 'lucide-react';
import { ResidentCargoPreference } from '../../types';

export const CargoTab: React.FC = () => {
  const { cargoList, residentUser, respondToCargoPreference } = useApp();

  // SMS Modal for inline response
  const [activeCargoIdForSms, setActiveCargoIdForSms] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState('');

  const myCargos = cargoList.filter(
    (c) => c.block === residentUser.block && c.apartment === residentUser.apartment
  );

  const handleSelectPreference = (cargoId: string, pref: ResidentCargoPreference) => {
    if (pref === 'emanet_kalsin') {
      setActiveCargoIdForSms(cargoId);
    } else {
      respondToCargoPreference(cargoId, 'eve_gonderilsin');
    }
  };

  const handleConfirmSms = () => {
    if (activeCargoIdForSms) {
      respondToCargoPreference(activeCargoIdForSms, 'emanet_kalsin', smsCode.trim());
      setActiveCargoIdForSms(null);
      setSmsCode('');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center border border-[#648875]/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-luxury font-bold text-[#294C3C]">
              Kargo ve Emanet Paketlerim
            </h2>
            <p className="text-xs text-[#26342C]/65">
              Nizamiyede teslim alınan paketlerinizi takip edin ve teslimat tercihinizi belirtin
            </p>
          </div>
        </div>
        <span className="text-xs text-[#648875] font-semibold bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#DDE5DF] self-start sm:self-auto">
          {residentUser.block} Blok D:{residentUser.apartment}
        </span>
      </div>

      {/* Cargo List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
            Paketlerim ({myCargos.length})
          </h3>
          <span className="text-[11px] text-[#26342C]/60">
            Sürekli kargo kayıt kütüğü
          </span>
        </div>

        {myCargos.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-center mx-auto text-[#648875]">
              <Package className="w-7 h-7 text-[#648875]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-[#294C3C]">Bekleyen Kargonuz Yok</h4>
              <p className="text-xs text-[#26342C]/65 leading-relaxed">
                Nizamiyeye kargonuz ulaştığında güvenlik tarafından sisteme işlenir ve kargonuzun eve mi gelmesi yoksa güvenlikte emanet mi kalması gerektiği size sorulur.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {myCargos.map((cargo) => (
              <div
                key={cargo.id}
                className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#294C3C]">{cargo.carrier}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#294C3C] text-white">
                          {cargo.pieceCount} Adet
                        </span>
                      </div>
                      <p className="text-xs text-[#648875] font-semibold">
                        Kayıt No: {cargo.id} · Giriş: {cargo.receivedAt}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Status */}
                  <div>
                    {cargo.deliveryStatus === 'guvenlikte' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>Nizamiyede Güvende</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fiziksel Teslim Edildi ({cargo.deliveredAt})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Soru ve Tercih Alanı */}
                {!cargo.residentPreference ? (
                  <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875]/40 space-y-3">
                    <div className="text-center">
                      <p className="text-xs font-extrabold text-[#294C3C] uppercase tracking-wide">
                        KARGONUZ EVE Mİ GELSİN, GÜVENLİKTE EMANET Mİ KALSIN?
                      </p>
                      <p className="text-[11px] text-[#26342C]/70 mt-0.5">
                        Lütfen nizamiyenin teslimat sürecini yönetmesi için seçiminizi yapınız
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => handleSelectPreference(cargo.id, 'eve_gonderilsin')}
                        className="p-3 rounded-xl bg-white hover:bg-[#294C3C] hover:text-white border border-[#DDE5DF] font-bold text-xs text-[#294C3C] transition-all flex items-center justify-center gap-2 group shadow-xs touch-target"
                      >
                        <Home className="w-4 h-4 text-[#648875] group-hover:text-white" />
                        <span>Eve Gönderilsin</span>
                      </button>

                      <button
                        onClick={() => handleSelectPreference(cargo.id, 'emanet_kalsin')}
                        className="p-3 rounded-xl bg-white hover:bg-[#294C3C] hover:text-white border border-[#DDE5DF] font-bold text-xs text-[#294C3C] transition-all flex items-center justify-center gap-2 group shadow-xs touch-target"
                      >
                        <Shield className="w-4 h-4 text-[#648875] group-hover:text-white" />
                        <span>Güvenlikte Emanet Kalsın</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#26342C]/70">Bildirdiğiniz Tercih:</span>
                      <span
                        className={`px-3 py-1 rounded-xl font-bold border ${
                          cargo.residentPreference === 'eve_gonderilsin'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-blue-50 text-blue-900 border-blue-300'
                        }`}
                      >
                        {cargo.residentPreference === 'eve_gonderilsin'
                          ? 'Eve Gönderilsin (Daireye Çıkarılacak)'
                          : 'Güvenlikte Emanet Kalsın (Nizamiyeden Alınacak)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cargo.smsCode && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#DDE5DF] text-[#294C3C]">
                          Kod: {cargo.smsCode}
                        </span>
                      )}
                      {cargo.answeredAt && (
                        <span className="text-[11px] text-[#26342C]/60">
                          {cargo.answeredAt} tarihinde iletildi
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center justify-between text-[11px] text-[#26342C]/60 pt-1">
                  <span>Kabul Eden: {cargo.securityOfficerName || 'Nizamiye Güvenlik'}</span>
                  <span>
                    Durum:{' '}
                    <strong className="text-[#294C3C]">
                      {cargo.deliveryStatus === 'teslim_edildi'
                        ? 'Teslim Tamamlandı'
                        : cargo.residentPreference
                        ? 'Güvenlik Yönlendiriyor'
                        : 'Cevap Bekleniyor'}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SMS Modal */}
      {activeCargoIdForSms && (
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
                onClick={() => setActiveCargoIdForSms(null)}
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
                placeholder="Örn: 5194"
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
                onClick={() => setActiveCargoIdForSms(null)}
                className="py-3 px-4 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
              >
                Geri
              </button>

              <button
                type="button"
                onClick={handleConfirmSms}
                className="flex-1 py-3 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 touch-target"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Devam Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
