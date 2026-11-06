/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Plus,
  ArrowRight,
  MapPin,
  ChevronRight,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import { NewSiteModal } from './NewSiteModal';
import { SecuritySetupScreen } from './security/SecuritySetupScreen';
import { SecurityLoginScreen } from './security/SecurityLoginScreen';
import { ForgotPasswordModal } from './auth/ForgotPasswordModal';
import { UserRole } from '../types';

export const SiteSelectionScreen: React.FC = () => {
  const {
    sites,
    currentSite,
    selectSite,
    setRole,
    triggerAdForTesting,
    residentUser,
    isMobilePreview,
    setIsMobilePreview,
    hasGuardsForSite,
    resetGuardsForSite,
  } = useApp();

  const [step, setStep] = useState<'select_site' | 'select_role' | 'security_setup' | 'security_login'>('select_site');
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotRole, setForgotRole] = useState<'admin' | 'security' | 'resident'>('resident');

  const handleSiteChosen = (siteId: string) => {
    selectSite(siteId);
    setStep('select_role');
  };

  const handleRoleChosen = (role: UserRole) => {
    if (role === 'security') {
      const isSetupDone = hasGuardsForSite(currentSite.id);
      if (isSetupDone) {
        setStep('security_login');
      } else {
        setStep('security_setup');
      }
      return;
    }
    setRole(role);
  };

  if (step === 'security_setup') {
    return (
      <SecuritySetupScreen
        onSetupCompleted={() => setStep('security_login')}
        onBackToRoles={() => setStep('select_role')}
      />
    );
  }

  if (step === 'security_login') {
    return (
      <SecurityLoginScreen
        onBackToRoles={() => setStep('select_role')}
        onResetSetup={() => {
          resetGuardsForSite(currentSite.id);
          setStep('security_setup');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      {/* Top Bar for Demo Utilities */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 mb-6 border-b border-[#292B36]/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5A66A]" />
          <span className="font-luxury font-bold tracking-widest text-[#DFC38E] text-sm">
            VİVA SİTE
          </span>
          <span className="text-[#EEE9DE]/40">·</span>
          <span className="text-[#EEE9DE]/60 hidden sm:inline">Lüks Rezidans Platformu</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobilePreview((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A]/50 text-xs text-[#EEE9DE]/80 hover:text-[#DFC38E] transition-colors touch-target"
            title="Mobil telefon çerçeve görünümünü aç/kapat"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C5A66A]" />
            <span className="hidden sm:inline">
              {isMobilePreview ? 'Geniş Ekran' : 'Mobil Çerçeve'}
            </span>
          </button>

          <button
            onClick={triggerAdForTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-medium text-[#EEE9DE] transition-all touch-target"
            title="8 saniyelik ilk açılış reklamını tekrar oynat"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">8sn Reklamı Test Et</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl flex-1 flex flex-col justify-center">
        {step === 'select_site' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B1D25] border border-[#C5A66A]/30 text-xs text-[#DFC38E] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A66A]" />
                <span>1. Aşama: Mülk & Site Seçimi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-luxury font-bold text-[#EEE9DE] tracking-wide">
                Hangi Sitede İşlem Yapıyorsunuz?
              </h1>
              <p className="text-xs sm:text-sm text-[#EEE9DE]/70 max-w-md mx-auto">
                Kayıtlı sitelerden birini seçin veya sitenizi sisteme hemen ekleyin.
              </p>
            </div>

            {/* Site Cards List */}
            <div className="space-y-3">
              {sites.map((site) => {
                const isSelected = site.id === currentSite.id;
                return (
                  <div
                    key={site.id}
                    onClick={() => handleSiteChosen(site.id)}
                    className={`w-full p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 touch-target ${
                      isSelected
                        ? 'bg-[#1B1D25] border-[#C5A66A] shadow-lg shadow-[#C5A66A]/10'
                        : 'bg-[#1B1D25]/60 border-[#292B36] hover:border-[#C5A66A]/50 hover:bg-[#1B1D25]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#C5A66A] text-[#111318] border-[#C5A66A]'
                            : 'bg-[#292B36] text-[#C5A66A] border-[#C5A66A]/20'
                        }`}
                      >
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm sm:text-base font-semibold text-[#EEE9DE]">
                            {site.name}
                          </h2>
                          {site.isCustom && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5A66A]/20 text-[#DFC38E] border border-[#C5A66A]/40">
                              Yeni Kayıt
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#EEE9DE]/60 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A66A] shrink-0" />
                          <span>
                            {site.district}, {site.city}
                          </span>
                          <span>·</span>
                          <span>{site.blocks.length} Blok</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#C5A66A]">
                      <span className="text-xs font-semibold hidden sm:inline">Seç</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Site Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsNewSiteModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1B1D25] border border-dashed border-[#C5A66A]/50 hover:border-[#C5A66A] hover:bg-[#292B36]/60 text-[#DFC38E] text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-target"
              >
                <Plus className="w-4 h-4 text-[#C5A66A]" />
                <span>+ Yeni Site Kaydı Yap</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: SELECT ROLE */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Active Site Kicker */}
            <div className="p-3.5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#292B36] flex items-center justify-center text-[#C5A66A]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#C5A66A] font-semibold">
                    Seçili Site
                  </p>
                  <p className="text-sm font-bold text-[#EEE9DE]">{currentSite.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('select_site')}
                className="text-xs text-[#DFC38E] hover:underline px-2 py-1"
              >
                Siteyi Değiştir
              </button>
            </div>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-luxury font-bold text-[#EEE9DE]">
                Giriş Profilinizi Seçin
              </h2>
              <p className="text-xs text-[#EEE9DE]/70">
                Yönetici ve sakin profilleri sistemde tamamen ayrı tutulmaktadır.
              </p>
            </div>

            {/* Role Options */}
            <div className="space-y-3">
              {/* Option 1: Sakin Girişi */}
              <button
                type="button"
                onClick={() => handleRoleChosen('resident')}
                className="w-full text-left p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A] hover:bg-[#242732] transition-all duration-200 group flex items-start gap-3.5 touch-target"
              >
                <div className="w-12 h-12 rounded-xl bg-[#292B36] group-hover:bg-[#C5A66A] text-[#C5A66A] group-hover:text-[#111318] flex items-center justify-center shrink-0 transition-colors border border-[#C5A66A]/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#EEE9DE] group-hover:text-[#DFC38E] transition-colors">
                      Sakin Girişi
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#C5A66A]/15 text-[#DFC38E] font-medium border border-[#C5A66A]/30">
                      Demo Sakin
                    </span>
                  </div>
                  <p className="text-xs text-[#EEE9DE]/70 mt-1">
                    Misafir bildirme, sipariş kurye talimatı, kargo takibi ve yönetime öneri.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#292B36] flex items-center justify-between text-xs text-[#EEE9DE]/60">
                    <span className="text-[#DFC38E] font-medium">
                      {residentUser.name} · {residentUser.block} Blok, Daire {residentUser.apartment}
                    </span>
                    <span className="flex items-center gap-1 text-[#C5A66A] font-semibold group-hover:translate-x-1 transition-transform">
                      Giriş Yap <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>

              {/* Option 2: Yönetici Girişi */}
              <button
                type="button"
                onClick={() => handleRoleChosen('admin')}
                className="w-full text-left p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A] hover:bg-[#242732] transition-all duration-200 group flex items-start gap-3.5 touch-target"
              >
                <div className="w-12 h-12 rounded-xl bg-[#292B36] group-hover:bg-[#C5A66A] text-[#C5A66A] group-hover:text-[#111318] flex items-center justify-center shrink-0 transition-colors border border-[#C5A66A]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#EEE9DE] group-hover:text-[#DFC38E] transition-colors">
                      Yönetici Girişi
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-medium border border-emerald-500/30">
                      Yönetim Kurulu
                    </span>
                  </div>
                  <p className="text-xs text-[#EEE9DE]/70 mt-1">
                    Kontrol paneli, kargo kayıtları, sakin talep & önerileri, site ayarları ve Drive raporları.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#292B36] flex items-center justify-between text-xs text-[#EEE9DE]/60">
                    <span className="text-[#EEE9DE]/50">
                      Sakin bilgileri gösterilmez (Bağımsız Yönetici)
                    </span>
                    <span className="flex items-center gap-1 text-[#C5A66A] font-semibold group-hover:translate-x-1 transition-transform">
                      Yönetici Paneli <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>

              {/* Option 3: Güvenlik / Nizamiye Girişi */}
              <button
                type="button"
                onClick={() => handleRoleChosen('security')}
                className="w-full text-left p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] hover:border-[#C5A66A] hover:bg-[#242732] transition-all duration-200 group flex items-start gap-3.5 touch-target"
              >
                <div className="w-12 h-12 rounded-xl bg-[#292B36] group-hover:bg-[#C5A66A] text-[#C5A66A] group-hover:text-[#111318] flex items-center justify-center shrink-0 transition-colors border border-[#C5A66A]/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#EEE9DE] group-hover:text-[#DFC38E] transition-colors">
                      Güvenlik / Nizamiye Girişi
                    </h3>
                    {hasGuardsForSite(currentSite.id) ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 font-medium border border-emerald-500/30">
                        Görevli Girişi
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 font-medium border border-amber-500/30">
                        İlk Kurulum (6 Görevli)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#EEE9DE]/70 mt-1">
                    {hasGuardsForSite(currentSite.id)
                      ? 'Tanımlı güvenlik görevlisi kullanıcı adı ve şifrenizle operasyon paneline erişin.'
                      : 'İlk defa giriş yapılıyor. 6 güvenlik görevlisini tanımlayarak kurulumu tamamlayın.'}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#292B36] flex items-center justify-between text-xs text-[#EEE9DE]/60">
                    <span className="text-[#EEE9DE]/50">
                      {hasGuardsForSite(currentSite.id)
                        ? 'Kullanıcı Adı & Şifre ile Doğrulama'
                        : 'İlk Kurulum Ekranı Açılacak'}
                    </span>
                    <span className="flex items-center gap-1 text-[#C5A66A] font-semibold group-hover:translate-x-1 transition-transform">
                      {hasGuardsForSite(currentSite.id) ? 'Oturum Aç' : 'Kuruluma Başla'}{' '}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Şifremi Unuttum Access for all roles */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setForgotRole('resident');
                  setIsForgotModalOpen(true);
                }}
                className="text-xs text-[#DFC38E]/70 hover:text-[#DFC38E] hover:underline"
              >
                Giriş Şifrenizi mi Unuttunuz? (SMS ile Sıfırla)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* New Site Registration Modal */}
      <NewSiteModal
        isOpen={isNewSiteModalOpen}
        onClose={() => setIsNewSiteModalOpen(false)}
        onCreated={() => setStep('select_role')}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultRole={forgotRole}
      />
    </div>
  );
};
