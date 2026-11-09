/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, Send } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-[#26342C]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                Şifre / PIN Sıfırlama
              </h3>
              <p className="text-xs text-[#26342C]/65">
                Kayıtlı telefonunuza doğrulama kodu gönderilir
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

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Doğrulama SMS kodu iletildi. Lütfen telefonunuzu kontrol ediniz.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                Kayıtlı Telefon veya E-posta
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 0532 100 20 30"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kod Gönder</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
