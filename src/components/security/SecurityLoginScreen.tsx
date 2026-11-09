/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, UserCheck, ShieldAlert } from 'lucide-react';
import { hashString } from '../../utils/crypto';

interface SecurityLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const SecurityLoginScreen: React.FC<SecurityLoginScreenProps> = ({ onSuccess, onBack }) => {
  const { siteInfo, siteGuards, setActiveGuard } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleKeyClick = (digit: string) => {
    if (isVerifying) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const verifyPin = async (testPin: string) => {
    setIsVerifying(true);
    try {
      const testPinHash = await hashString(testPin);

      // Check specific guard PINs
      const matchedGuard = siteGuards.find(
        (g) => !g.isArchived && g.pinHash === testPinHash
      );

      if (matchedGuard) {
        if (!matchedGuard.isActive) {
          setErrorMessage(
            `"${matchedGuard.name}" hesabı yönetici tarafından pasife alınmıştır. Nizamiye giriş yetkisi engellendi.`
          );
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
            setErrorMessage('');
          }, 3000);
          setIsVerifying(false);
          return;
        }

        setActiveGuard(matchedGuard);
        setIsVerifying(false);
        onSuccess();
        return;
      }

      // NO 1234 BACKDOOR: Reject invalid PIN strictly
      setErrorMessage('Hatalı güvenlik PIN kodu! Lütfen size atanan 4 haneli PIN kodunuzu giriniz.');
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
        setErrorMessage('');
      }, 1500);
      setIsVerifying(false);
    } catch {
      setErrorMessage('Doğrulama sırasında bir hata oluştu.');
      setError(true);
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-[#FFFFFF] border-2 border-[#DDE5DF] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 text-center">
        <button
          onClick={onBack}
          className="self-start text-xs font-bold text-[#26342C]/70 hover:text-[#26342C] flex items-center gap-1.5 transition-colors p-1 -ml-1 rounded-lg hover:bg-[#F7F8F5]"
        >
          <ArrowLeft className="w-4 h-4 text-[#648875]" />
          <span>Ana Menüye Dön</span>
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center mx-auto text-[#294C3C]">
          <ShieldCheck className="w-8 h-8 text-[#294C3C]" />
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#648875] bg-[#648875]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
            {siteInfo.name || 'VİVA SİTE'}
          </span>
          <h2 className="text-xl font-luxury font-black text-[#294C3C]">
            Güvenlik Konsolu Girişi
          </h2>
          <p className="text-xs text-[#26342C]/65 mt-1">
            Nizamiye görevlisi 4 haneli PIN kodunuzu giriniz
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? error
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-[#294C3C] border-[#294C3C] scale-110'
                  : 'border-[#DDE5DF] bg-[#F7F8F5]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleKeyClick(digit)}
              className="py-3.5 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-base font-bold text-[#294C3C] border border-[#DDE5DF] transition-all touch-target shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => {
              setPin('');
              setError(false);
              setErrorMessage('');
            }}
            className="py-3.5 rounded-2xl bg-[#F7F8F5] hover:bg-neutral-200 text-xs font-bold text-[#26342C]/60 border border-[#DDE5DF] transition-colors cursor-pointer"
          >
            Sil
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleKeyClick('0')}
            className="py-3.5 rounded-2xl bg-[#F7F8F5] hover:bg-[#294C3C] hover:text-white text-base font-bold text-[#294C3C] border border-[#DDE5DF] transition-all touch-target shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-[#F7F8F5] hover:bg-neutral-200 text-xs font-bold text-[#26342C]/60 border border-[#DDE5DF] transition-colors cursor-pointer"
          >
            ⌫
          </button>
        </div>

        <div className="pt-2 border-t border-[#DDE5DF]/60 text-[11px] text-[#26342C]/60 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-[#648875]" />
          <span>Şifreler SHA-256 ile korunmaktadır</span>
        </div>
      </div>
    </div>
  );
};
