/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Volume2, Mic, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface PermissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionGuideModal: React.FC<PermissionGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-[#26342C]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                İzinler ve Teknik Mimari Bilgisi
              </h3>
              <p className="text-xs text-[#26342C]/65">
                Sesli bildirim ve mikrofon erişim rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#26342C]/40 hover:text-[#26342C] p-1.5 rounded-full hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-start gap-3">
            <Volume2 className="w-4 h-4 text-[#648875] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#294C3C]">Web Audio API ile Sesli Uyarılar</h4>
              <p className="text-[#26342C]/70 mt-0.5">
                Modern tarayıcı güvenlik politikaları gereğince seslerin çalabilmesi için kullanıcının ekrana ilk dokunuşu gereklidir. Ardından güvenlik ekranında TAMAM butonuna basılana dek tekrarlayan alarm sorunsuz çalar.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-start gap-3">
            <Mic className="w-4 h-4 text-[#648875] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#294C3C]">Web Speech API (Sesle Firma Tanıma)</h4>
              <p className="text-[#26342C]/70 mt-0.5">
                "DİĞER" seçildiğinde mikrofon dinleme başlatılır. Tarayıcının mikrofon izni vermesi durumunda konuşulan firma adı anlık metne dönüştürülür. İzin verilmediğinde hızlı butonlar veya klavye girişi otomatik devreye girer.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-start gap-3">
            <Smartphone className="w-4 h-4 text-[#648875] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#294C3C]">Gerçek Zamanlı İki Yönlü Bildirim</h4>
              <p className="text-[#26342C]/70 mt-0.5">
                Önizleme ortamında sakin ve güvenlik panelleri tek ekrandan senkronize çalışır. Prodüksiyon ortamında ise Firebase Cloud Messaging (FCM) ve Web Push altyapısı kullanılarak telefon kapalıyken dahi anlık sesli push gönderilebilir.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          Anladım
        </button>
      </div>
    </div>
  );
};
