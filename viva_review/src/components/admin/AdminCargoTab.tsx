/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Package, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const AdminCargoTab: React.FC = () => {
  const { cargoList, deliverCargo } = useApp();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Kargo ve Paket Yönetimi
          </h2>
          <p className="text-xs text-[#26342C]/65">
            Sitede teslim alınan tüm kargo ve paket hareketleri
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#648875]/15 text-[#294C3C] border border-[#648875]/30">
          Toplam: {cargoList.length} Paket
        </span>
      </div>

      <div className="space-y-3">
        {cargoList.map((c) => {
          const isPending = (c.deliveryStatus || c.status) === 'guvenlikte';
          return (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#294C3C]">{c.carrier}</span>
                  <span className="text-xs text-[#648875] font-semibold">Kayıt: {c.id}</span>
                  {c.pieceCount && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#294C3C] text-white">
                      {c.pieceCount} Adet
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#26342C]/70">
                  Alıcı: <strong>{c.recipientName}</strong> ({c.block} Blok D:{c.apartment})
                </p>
                <p className="text-[11px] text-[#26342C]/60">
                  Kabul: {c.receivedAt} · Tercih:{' '}
                  <strong>
                    {c.residentPreference === 'eve_gonderilsin'
                      ? 'Eve Gönderilsin'
                      : c.residentPreference === 'emanet_kalsin'
                      ? 'Güvenlikte Emanet'
                      : 'Bekleniyor'}
                  </strong>
                </p>
              </div>

              <div>
                {isPending ? (
                  <button
                    onClick={() => deliverCargo(c.id)}
                    className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-colors"
                  >
                    Fiziksel Teslim Edildi Yap
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Teslim Edildi ({c.deliveredAt || 'Tamamlandı'})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
