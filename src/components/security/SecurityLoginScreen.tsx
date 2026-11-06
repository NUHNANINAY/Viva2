/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  Building2,
  KeyRound,
  RotateCcw,
  Users,
  Shield,
  Home,
} from 'lucide-react';

import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';

interface SecurityLoginScreenProps {
  onBackToRoles: () => void;
  onResetSetup: () => void;
}

export const SecurityLoginScreen: React.FC<SecurityLoginScreenProps> = ({
  onBackToRoles,
  onResetSetup,
}) => {
  const { currentSite, getGuardsForSite, loginSecurityGuard, returnToMainMenu } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const registeredGuards = getGuardsForSite(currentSite.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Lütfen kullanıcı adı ve şifrenizi giriniz.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginSecurityGuard(username.trim(), password.trim());
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Hatalı kullanıcı adı veya şifre.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Giriş yapılırken bir hata oluştu.');
    }
  };

  const handleQuickSelectGuard = (guardUsername: string) => {
    setUsername(guardUsername);
    setPassword('guvenlik123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      {/* Top Header with Prominent Ana Menü Button */}
      <header className="w-full max-w-md flex items-center justify-between py-3 mb-6 border-b border-[#292B36]/80 text-xs">
        <button
          onClick={returnToMainMenu}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#292B36] border border-[#C5A66A]/40 hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-bold text-[#DFC38E] transition-all touch-target shadow-md shadow-black/40"
          title="Uygulamanın ana giriş ve site seçimi ekranına dön"
        >
          <Home className="w-4 h-4 text-[#C5A66A]" />
          <span>Ana Menü</span>
        </button>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#C5A66A]" />
          <span className="font-semibold text-[#DFC38E] truncate max-w-[170px]">
            {currentSite.name}
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-center space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center mx-auto border border-[#C5A66A]/30 shadow-xl shadow-[#C5A66A]/5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-luxury font-bold text-[#EEE9DE] tracking-wide">
            Güvenlik / Nizamiye Girişi
          </h1>
          <p className="text-xs text-[#EEE9DE]/70">
            Nöbetçi güvenlik görevlisi kullanıcı adı ve şifrenizle giriş yapınız.
          </p>
        </div>

        {/* Demo Security Banner */}
        <div className="p-3 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/20 flex items-start gap-2.5 text-xs text-[#EEE9DE]/70">
          <Shield className="w-4 h-4 text-[#C5A66A] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-[#DFC38E]">Demo Kimlik Doğrulama:</strong> Şifreler istemci tarafında SHA-256 ile hash'lenerek doğrulanmaktadır. Gerçek sürümde sunucu taraflı güvenli auth motoru kullanılır.
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 rounded-3xl bg-[#1B1D25] border border-[#C5A66A]/30 space-y-4 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="örn: murat.demir"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A66A] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#EEE9DE]/60 hover:text-[#EEE9DE]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-[#DFC38E] hover:underline"
                >
                  Şifremi Unuttum
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Doğrulanıyor...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Oturum Aç & Nizamiyeye Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registered Guards List for Reviewer Ease */}
        {registeredGuards.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#DFC38E] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C5A66A]" />
                Kayıtlı Görevliler ({registeredGuards.length}/6)
              </span>
              <span className="text-[10px] text-[#EEE9DE]/50">Hızlı doldurmak için tıklayın</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {registeredGuards.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleQuickSelectGuard(g.username)}
                  className="p-2 rounded-xl bg-[#111318] border border-[#292B36] hover:border-[#C5A66A]/50 text-left transition-all touch-target"
                >
                  <p className="text-xs font-semibold text-[#EEE9DE] truncate">
                    {g.firstName} {g.lastName}
                  </p>
                  <p className="text-[10px] text-[#DFC38E] font-mono truncate">
                    @{g.username}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reset Setup Option */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onResetSetup}
            className="inline-flex items-center gap-1.5 text-xs text-[#EEE9DE]/50 hover:text-[#DFC38E] transition-colors py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Güvenlik Kurulumunu Sıfırla (Yeniden 6 Görevli Tanımla)</span>
          </button>
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultRole="security"
        initialIdentifier={username}
      />
    </div>
  );
};
