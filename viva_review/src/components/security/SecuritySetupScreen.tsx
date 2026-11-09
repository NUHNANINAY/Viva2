/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, KeyRound, Check, ArrowLeft } from 'lucide-react';

interface SecuritySetupScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const SecuritySetupScreen: React.FC<SecuritySetupScreenProps> = ({ onComplete, onCancel }) => {
  const { siteInfo, setSiteInfo } = useApp();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setError('PIN kodu 4 haneli rakam olmalıdır.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Girdiğiniz PIN kodları birbiriyle eşleşmiyor.');
      return;
    }

    setSiteInfo({
      ...siteInfo,
      securityPasswordHash: newPin,
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-[#FFFFFF] border-2 border-[#DDE5DF] rounded-3xl p-6 shadow-xl space-y-5 text-center">
        <button
          onClick={onCancel}
          className="self-start text-xs text-[#26342C]/60 hover:text-[#26342C] flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>İptal</span>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center mx-auto text-[#294C3C]">
          <KeyRound className="w-6 h-6 text-[#294C3C]" />
        </div>

        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Güvenlik PIN Kodu Belirle
          </h2>
          <p className="text-xs text-[#26342C]/65 mt-1">
            Nizamiye masasına özel 4 haneli erişim şifresi
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
              Yeni PIN (4 Rakam)
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-center text-lg tracking-widest font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
              PIN Tekrar
            </label>
            <input
              type="password"
              maxLength={4}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-center text-lg tracking-widest font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};
