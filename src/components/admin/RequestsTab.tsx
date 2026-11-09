/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Car, CheckCircle2, Clock, LogOut } from 'lucide-react';

export const RequestsTab: React.FC = () => {
  const { guestList, checkOutGuest } = useApp();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Misafir & Ziyaretçi Girişleri
          </h2>
          <p className="text-xs text-[#26342C]/65">
            Sitede gerçekleşen araç ve yaya ziyaretçi kayıtları
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#648875]/15 text-[#294C3C] border border-[#648875]/30">
          Toplam: {guestList.length} Misafir
        </span>
      </div>

      <div className="space-y-3">
        {guestList.map((g) => (
          <div
            key={g.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#294C3C]">{g.fullName}</span>
                <span className="text-xs text-[#648875] font-semibold">Plaka: {g.plateNumber}</span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                Ziyaret Edilen: <strong>{g.residentName}</strong> ({g.block} Blok D:{g.apartment})
              </p>
              <p className="text-[11px] text-[#26342C]/60">
                Beklenen: {g.expectedDate} {g.expectedTime} {g.entryTime && `· Giriş: ${g.entryTime}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {g.status === 'giris_yapti' && (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    İçeri Alındı ({g.entryTime})
                  </span>
                  <button
                    onClick={() => checkOutGuest(g.id, 'Yönetim')}
                    className="px-2.5 py-1 rounded-lg border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-amber-800 flex items-center gap-1 shadow-2xs"
                    title="Çıkış kaydını tamamla"
                  >
                    <LogOut className="w-3 h-3 text-amber-600" />
                    <span>Çıkış Yap</span>
                  </button>
                </>
              )}
              {g.status === 'ayrildi' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1">
                  <LogOut className="w-3 h-3 text-neutral-600" />
                  <span>Ayrıldı {g.exitTime ? `(${g.exitTime})` : ''}</span>
                </span>
              )}
              {g.status === 'bekleniyor' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Giriş Bekleniyor
                </span>
              )}
              {g.status === 'iptal' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
                  İptal Edildi
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
