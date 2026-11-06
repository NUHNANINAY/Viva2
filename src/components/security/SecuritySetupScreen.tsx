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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Home,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { SecurityGuardAccount } from '../../types';
import { hashPassword } from '../../utils/crypto';

interface SecuritySetupScreenProps {
  onSetupCompleted: () => void;
  onBackToRoles: () => void;
}

interface GuardDraft {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  shift: string;
}

const DEFAULT_SHIFTS = [
  'Gündüz Vardiyası (08:00 - 16:00)',
  'Akşam Vardiyası (16:00 - 00:00)',
  'Gece Vardiyası (00:00 - 08:00)',
  'Hafta Sonu Gündüz (08:00 - 20:00)',
  'Hafta Sonu Gece (20:00 - 08:00)',
  'Joker / Genel Devriye',
];

const PRESET_SAMPLE_GUARDS: GuardDraft[] = [
  {
    firstName: 'Kemal',
    lastName: 'Yılmaz',
    username: 'kemal.yilmaz',
    password: 'guvenlik123',
    shift: 'Gündüz Vardiyası (08:00 - 16:00)',
  },
  {
    firstName: 'Burak',
    lastName: 'Kaya',
    username: 'burak.kaya',
    password: 'guvenlik123',
    shift: 'Akşam Vardiyası (16:00 - 00:00)',
  },
  {
    firstName: 'Serdar',
    lastName: 'Yıldız',
    username: 'serdar.yildiz',
    password: 'guvenlik123',
    shift: 'Gece Vardiyası (00:00 - 08:00)',
  },
  {
    firstName: 'Ali',
    lastName: 'Öztürk',
    username: 'ali.ozturk',
    password: 'guvenlik123',
    shift: 'Hafta Sonu Gündüz (08:00 - 20:00)',
  },
  {
    firstName: 'Emre',
    lastName: 'Şahin',
    username: 'emre.sahin',
    password: 'guvenlik123',
    shift: 'Hafta Sonu Gece (20:00 - 08:00)',
  },
  {
    firstName: 'Hakan',
    lastName: 'Çelik',
    username: 'hakan.celik',
    password: 'guvenlik123',
    shift: 'Joker / Genel Devriye',
  },
];

export const SecuritySetupScreen: React.FC<SecuritySetupScreenProps> = ({
  onSetupCompleted,
  onBackToRoles,
}) => {
  const { currentSite, saveGuardsForSite, returnToMainMenu } = useApp();

  const [guards, setGuards] = useState<GuardDraft[]>([
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[0] },
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[1] },
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[2] },
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[3] },
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[4] },
    { firstName: '', lastName: '', username: '', password: '', shift: DEFAULT_SHIFTS[5] },
  ]);

  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleShowPassword = (idx: number) => {
    setShowPasswords((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const updateGuard = (index: number, field: keyof GuardDraft, value: string) => {
    setGuards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrorMessage(null);
  };

  const handleFillDemoData = () => {
    setGuards([...PRESET_SAMPLE_GUARDS]);
    setErrorMessage(null);
  };

  const isSlotComplete = (g: GuardDraft) => {
    return (
      g.firstName.trim().length > 0 &&
      g.lastName.trim().length > 0 &&
      g.username.trim().length > 0 &&
      g.password.trim().length > 0
    );
  };

  const completedCount = guards.filter(isSlotComplete).length;
  const isAllComplete = completedCount === 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate 6 guards
    for (let i = 0; i < guards.length; i++) {
      const g = guards[i];
      if (!g.firstName.trim() || !g.lastName.trim() || !g.username.trim() || !g.password.trim()) {
        setErrorMessage(
          `Lütfen ${i + 1}. Güvenlik Görevlisinin tüm alanlarını (Ad, Soyad, Kullanıcı Adı, Şifre) doldurunuz.`
        );
        return;
      }
    }

    // Check duplicate usernames
    const usernames = guards.map((g) => g.username.trim().toLowerCase());
    const uniqueUsernames = new Set(usernames);
    if (uniqueUsernames.size !== 6) {
      setErrorMessage('Kullanıcı adları birbirinden farklı ve benzersiz olmalıdır.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Hash all passwords using SHA-256 for secure storage
      const formattedGuards: SecurityGuardAccount[] = [];
      for (let i = 0; i < guards.length; i++) {
        const g = guards[i];
        const hash = await hashPassword(g.password.trim());
        formattedGuards.push({
          id: `guard-${currentSite.id}-${i + 1}-${Date.now()}`,
          siteId: currentSite.id,
          firstName: g.firstName.trim(),
          lastName: g.lastName.trim(),
          username: g.username.trim().toLowerCase(),
          passwordHash: hash,
          shift: g.shift,
          gateName: 'A Kapısı Ana Giriş Nizamiyesi',
          createdAt: new Date().toISOString(),
        });
      }

      saveGuardsForSite(currentSite.id, formattedGuards);
      setIsSubmitting(false);
      onSetupCompleted();
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Kayıt oluşturulurken bir hata meydana geldi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111318] text-[#EEE9DE] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      {/* Top Header with Prominent Ana Menü Button */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 mb-6 border-b border-[#292B36]/80 text-xs">
        <div className="flex items-center gap-2">
          {/* Prominent Ana Menü Button */}
          <button
            onClick={returnToMainMenu}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#292B36] border border-[#C5A66A]/40 hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-bold text-[#DFC38E] transition-all touch-target shadow-md shadow-black/40"
            title="Uygulamanın ana giriş ve site seçimi ekranına dön"
          >
            <Home className="w-4 h-4 text-[#C5A66A]" />
            <span>Ana Menü</span>
          </button>

          <span className="text-[#EEE9DE]/40">·</span>
          <span className="text-xs text-[#EEE9DE]/60 hidden sm:inline">İlk Kurulum Aşaması</span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#C5A66A]" />
          <span className="font-semibold text-[#DFC38E] truncate max-w-[200px]">
            {currentSite.name}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col space-y-6">
        {/* Title and Hero Description */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1B1D25] border border-[#C5A66A]/30 text-xs text-[#DFC38E]">
            <ShieldCheck className="w-4 h-4 text-[#C5A66A]" />
            <span className="font-semibold uppercase tracking-wider">Güvenlik Personeli İlk Kurulumu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-luxury font-bold text-[#EEE9DE] tracking-wide">
            6 Güvenlik Görevlisini Tanımlayın
          </h1>
          <p className="text-xs sm:text-sm text-[#EEE9DE]/70 max-w-2xl mx-auto leading-relaxed">
            Seçili siteye ({currentSite.name}) ait 6 güvenlik görevlisi tanımlanmadan güvenlik modülü açılamaz.
            Tüm görevliler kaydedildikten sonra bu kurulum ekranı bir daha gösterilmeyecek ve doğrudan kullanıcı adı / şifre sorgulanacaktır.
          </p>
        </div>

        {/* Security & Password Standard Note */}
        <div className="p-3.5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/25 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C5A66A] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-[#DFC38E]">
              Güvenlik & Şifre Standardı Bilgilendirmesi
            </p>
            <p className="text-[#EEE9DE]/80 leading-relaxed">
              Girilen şifreler açık metin (plain text) olarak saklanmaz. Tarayıcı içi SHA-256 standardı ile hash'lenerek şifreli biçimde kaydedilir. Demo sürümünde istemci taraflı doğrulama simülasyonu çalışmaktadır.
            </p>
          </div>
        </div>

        {/* Status Bar & Quick Fill Tool */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1B1D25] p-4 rounded-2xl border border-[#292B36]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#DFC38E]">
                Tamamlanan Kayıt: {completedCount} / 6
              </span>
              {isAllComplete ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                  ✓ 6 Görevli Eksiksiz Hazır
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                  {6 - completedCount} Görevli Bekleniyor
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#EEE9DE]/60">
              Bitti düğmesinin aktif olması için 6 görevlinin tamamı eksiksiz girilmelidir.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemoData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-bold text-[#DFC38E] transition-all touch-target border border-[#C5A66A]/30 shrink-0"
            title="Test amacıyla 6 farklı örnek güvenlik görevlisini otomatik doldurur"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A66A]" />
            <span>Örnek 6 Görevliyi Doldur (Hızlı Test)</span>
          </button>
        </div>

        {/* 6 SEPARATE REGISTRATION SLOTS */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guards.map((guard, index) => {
              const isComplete = isSlotComplete(guard);
              return (
                <div
                  key={index}
                  className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 ${
                    isComplete
                      ? 'bg-[#1B1D25] border-emerald-500/40 shadow-sm'
                      : 'bg-[#1B1D25]/70 border-[#292B36] hover:border-[#C5A66A]/30'
                  }`}
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#292B36]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#292B36] text-[#C5A66A] text-xs font-bold flex items-center justify-center border border-[#C5A66A]/30">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-bold text-[#EEE9DE]">
                        {index + 1}. Güvenlik Görevlisi
                      </h3>
                    </div>

                    {isComplete ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hazır</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-medium">
                        Zorunlu Alanlar Eksik
                      </span>
                    )}
                  </div>

                  {/* Inputs for Guard */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFC38E] uppercase mb-1">
                        Ad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Kemal"
                        value={guard.firstName}
                        onChange={(e) => updateGuard(index, 'firstName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFC38E] uppercase mb-1">
                        Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Yılmaz"
                        value={guard.lastName}
                        onChange={(e) => updateGuard(index, 'lastName', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFC38E] uppercase mb-1">
                        Kullanıcı Adı *
                      </label>
                      <div className="relative">
                        <span className="text-[#C5A66A] font-mono text-xs absolute left-2.5 top-2">@</span>
                        <input
                          type="text"
                          required
                          placeholder="kemal.yilmaz"
                          value={guard.username}
                          onChange={(e) => updateGuard(index, 'username', e.target.value.toLowerCase())}
                          className="w-full pl-6 pr-3 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#DFC38E] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#DFC38E] uppercase mb-1">
                        Şifre *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords[index] ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={guard.password}
                          onChange={(e) => updateGuard(index, 'password', e.target.value)}
                          className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(index)}
                          className="absolute right-2.5 top-2 text-[#EEE9DE]/60 hover:text-[#EEE9DE]"
                        >
                          {showPasswords[index] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#EEE9DE]/70 mb-1">
                      Vardiya Tanımı
                    </label>
                    <select
                      value={guard.shift}
                      onChange={(e) => updateGuard(index, 'shift', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#111318] border border-[#292B36] text-[11px] text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
                    >
                      {DEFAULT_SHIFTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#EEE9DE]/70 text-center sm:text-left">
              {isAllComplete ? (
                <span className="text-emerald-400 font-bold">
                  ✓ 6 güvenlik personeli hazır. Kaydedip giriş ekranına geçebilirsiniz.
                </span>
              ) : (
                <span>
                  Bitti düğmesinin aktif olması için <strong>{6 - completedCount}</strong> görevlinin bilgileri bekleniyor.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isAllComplete || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl touch-target flex items-center justify-center gap-2 ${
                isAllComplete && !isSubmitting
                  ? 'bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] hover:brightness-110 active:scale-95 cursor-pointer shadow-[#C5A66A]/20'
                  : 'bg-[#292B36] text-[#EEE9DE]/40 border border-[#292B36] cursor-not-allowed opacity-50'
              }`}
            >
              {isSubmitting ? (
                <span>Kaydediliyor...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Bitti – Görevlileri Kaydet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
