/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  KeyRound,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'security' | 'admin' | 'resident';
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'security',
  initialIdentifier = '',
}) => {
  const { requestPasswordResetSms, verifyAndResetPassword } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<'security' | 'admin' | 'resident'>(defaultRole);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Lütfen kullanıcı adı veya telefon numaranızı giriniz.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordResetSms(role, identifier.trim());
      setIsLoading(false);
      if (res.success) {
        setDemoCode(res.demoCode || '5832');
        setMaskedPhone(res.maskedPhone || '+90 532 *** ** 44');
        setStep(2);
      } else {
        setErrorMessage(res.error || 'Doğrulama kodu gönderilemedi.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      setErrorMessage('Lütfen 4 haneli SMS doğrulama kodunu eksiksiz giriniz.');
      return;
    }
    if (code.trim() !== '5832' && code.trim() !== '1234') {
      setErrorMessage('Geçersiz SMS doğrulama kodu. Demo kodu: 5832');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setErrorMessage('Yeni şifre en az 4 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Girdiğiniz yeni şifreler birbiriyle uyuşmuyor.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await verifyAndResetPassword(role, identifier.trim(), code.trim(), newPassword.trim());
      setIsLoading(false);
      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.error || 'Şifre güncellenemedi.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Şifre güncellenirken bir hata oluştu.');
    }
  };

  const handleResetModal = () => {
    setStep(1);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#1B1D25] border-2 border-[#C5A66A]/40 rounded-3xl p-6 text-[#EEE9DE] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#292B36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#292B36] border border-[#C5A66A]/30 text-[#C5A66A] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wide">
                Şifre Sıfırlama
              </h3>
              <p className="text-[11px] text-[#EEE9DE]/60">SMS ile güvenli kimlik doğrulama</p>
            </div>
          </div>
          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-xl bg-[#111318] text-[#EEE9DE]/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 text-[11px] text-[#EEE9DE]/50 border-b border-[#292B36] pb-3">
          <span className={step >= 1 ? 'text-[#DFC38E] font-bold' : ''}>1. Kullanıcı Bilgisi</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-[#DFC38E] font-bold' : ''}>2. SMS Doğrulama</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-[#DFC38E] font-bold' : ''}>3. Yeni Şifre</span>
        </div>

        {/* Step 1: Identifier Input */}
        {step === 1 && (
          <form onSubmit={handleRequestSms} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                Kullanıcı Rolü
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('security')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'security'
                      ? 'bg-[#C5A66A] text-[#111318]'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border border-[#292B36]'
                  }`}
                >
                  Güvenlik
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'admin'
                      ? 'bg-[#C5A66A] text-[#111318]'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border border-[#292B36]'
                  }`}
                >
                  Yönetici
                </button>
                <button
                  type="button"
                  onClick={() => setRole('resident')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    role === 'resident'
                      ? 'bg-[#C5A66A] text-[#111318]'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border border-[#292B36]'
                  }`}
                >
                  Sakin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                Kullanıcı Adı veya Kayıtlı Telefon
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder={
                    role === 'security'
                      ? 'Örn: murat.demir veya soyad'
                      : 'Örn: admin veya 0532...'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
              </div>
              <p className="text-[10px] text-[#EEE9DE]/50 mt-1">
                Hesabınıza tanımlı cep telefonuna 4 haneli SMS doğrulama kodu iletilecektir.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-2"
            >
              <span>SMS Doğrulama Kodu Gönder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: SMS OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="p-3 rounded-2xl bg-[#111318] border border-[#292B36] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#DFC38E]">
                <span className="font-semibold">SMS Gönderilen Numara:</span>
                <span className="font-mono">{maskedPhone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
                <strong>Demo SMS Uyarısı:</strong> Gerçek SMS operatörü simüle edilmektedir. Lütfen aşağıdaki tek kullanımlık demo kodunu giriniz:
                <div className="font-mono font-bold text-sm text-[#DFC38E] mt-1 text-center bg-[#111318] py-1 rounded-lg">
                  {demoCode || '5832'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1">
                4 Haneli SMS Kodu
              </label>
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="5832"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-xl bg-[#111318] border border-[#C5A66A]/40 focus:border-[#C5A66A] focus:outline-none text-[#DFC38E]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE]/70 hover:text-white"
              >
                Geri
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kodu Doğrula</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="En az 4 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#EEE9DE]/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase">
                Yeni Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifrenizi tekrar giriniz"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#EEE9DE]/50">
              {role === 'security'
                ? 'Yeni şifreniz SHA-256 algoritmasıyla güvenli olarak şifrelenip kaydedilecektir.'
                : 'Yeni şifreniz başarıyla güncellenecektir.'}
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Şifre Kaydediliyor...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Şifremi Güncelle & Kaydet</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div className="text-center space-y-4 py-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#EEE9DE]">Şifreniz Başarıyla Güncellendi</h4>
              <p className="text-xs text-[#EEE9DE]/65 leading-relaxed">
                Yeni şifreniz sisteme kaydedildi. Şimdi yeni şifreniz ile oturum açabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetModal}
              className="w-full py-3 rounded-xl bg-[#C5A66A] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
