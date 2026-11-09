/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  PhoneCall,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Building,
  KeyRound,
  UserPlus,
  X,
  Phone,
  Lock,
  UserCheck,
  Search,
  HelpCircle,
  Cloud,
  Mail,
  LogIn,
} from 'lucide-react';
import { hashString } from '../utils/crypto';
import { claimInviteCode, bootstrapAdmin } from '../services/inviteService';
import { loginWithEmailPassword, registerWithEmailPassword, resetPasswordForEmail } from '../services/firebase';
import { SecurityLoginScreen } from './security/SecurityLoginScreen';
import { StaffTerminalModal } from './staff/StaffTerminalModal';
import { Clock, Briefcase } from 'lucide-react';

export const SiteSelectionScreen: React.FC = () => {
  const {
    setCurrentRole,
    siteInfo,
    sites,
    switchSite,
    residentUser,
    setResidentUser,
    siteResidents,
    addResidentToSite,
    setShowNewSiteModal,
    setShowAdModal,
    cloudSyncStatus,
    cloudSyncError,
    refreshCloudSites,
  } = useApp();

  // Self Registration Modal State
  const [showSelfRegister, setShowSelfRegister] = useState(false);
  const [regCode, setRegCode] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [regError, setRegError] = useState('');

  // Email/Password Login Modal State
  const [showAuthLogin, setShowAuthLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTargetRole, setLoginTargetRole] = useState<'resident' | 'admin'>('resident');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authConsoleNotice, setAuthConsoleNotice] = useState('');

  // Switch Resident Modal State
  const [showSwitchResident, setShowSwitchResident] = useState(false);
  const [searchResidentQuery, setSearchResidentQuery] = useState('');

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotApartment, setForgotApartment] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Security Login Modal State
  const [showSecurityLoginModal, setShowSecurityLoginModal] = useState(false);

  // Staff Terminal Modal State
  const [showStaffTerminalModal, setShowStaffTerminalModal] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);

    if (forgotEmail.trim()) {
      const res = await resetPasswordForEmail(forgotEmail.trim());
      setForgotLoading(false);
      if (res.success) {
        setForgotMsg(res.message);
      } else {
        setForgotError(res.message);
      }
      return;
    }

    const clean = forgotPhone.replace(/\s/g, '');
    const found = siteResidents.find(
      (r) => r.apartment === forgotApartment.trim() && r.phone?.replace(/\s/g, '') === clean
    );

    setForgotLoading(false);
    if (!found) {
      setForgotError('Daire ve telefon bilgisi eşleşen kayıtlı sakin bulunamadı.');
      return;
    }

    setForgotMsg(`${found.fullName} için doğrulama yapıldı. Lütfen güvenlik masasına veya site yönetimine başvurarak geçici şifre talep ediniz veya kayıtlı e-posta adresinizi giriniz.`);
  };

  const handleSelfRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    if (!regCode.trim()) {
      setRegError('Lütfen yönetim tarafından dairenize iletilen tek kullanımlık davet kodunu giriniz.');
      setRegLoading(false);
      return;
    }

    if (!regFullName.trim() || !regPhone.trim()) {
      setRegError('Ad Soyad ve Telefon numarası zorunludur.');
      setRegLoading(false);
      return;
    }

    let authUid = `user-${Date.now()}`;
    let authEmail = regEmail.trim();

    // If email and password provided, try registering with Firebase Auth
    if (regEmail.trim() && regPassword.trim()) {
      try {
        const { user } = await registerWithEmailPassword(regEmail.trim(), regPassword.trim(), {
          role: 'resident',
          siteId: siteInfo.id,
          name: regFullName.trim(),
          isActive: true,
        });
        authUid = user.uid;
        authEmail = user.email || regEmail.trim();
      } catch (authErr: any) {
        if (authErr.code === 'auth/operation-not-allowed') {
          setRegError('Firebase Console üzerinde E-posta/Şifre sağlayıcısı henüz aktif edilmemiştir. Lütfen konsoldan Authentication -> Sign-in method -> Email/Password seçeneğini etkinleştiriniz.');
          setRegLoading(false);
          return;
        } else if (authErr.code === 'auth/email-already-in-use') {
          setRegError('Bu e-posta adresi zaten kayıtlı. Lütfen "E-posta / Şifre ile Giriş" seçeneğini kullanınız.');
          setRegLoading(false);
          return;
        } else {
          setRegError(`Kimlik doğrulama uyarısı: ${authErr.message || authErr.code}`);
          setRegLoading(false);
          return;
        }
      }
    }

    // Call server-authoritative atomic claim invite endpoint
    const claimRes = await claimInviteCode({
      siteId: siteInfo.id,
      code: regCode.trim().toUpperCase(),
      authUid,
      authEmail,
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
    });

    if (!claimRes.success) {
      setRegError(claimRes.error || 'Davet kodu doğrulanamadı.');
      setRegLoading(false);
      return;
    }

    // Set active resident with server-verified unit info
    const activeRes = {
      id: claimRes.residentId || `res-${Date.now()}`,
      siteId: siteInfo.id,
      fullName: regFullName.trim(),
      block: claimRes.block || 'A',
      apartment: claimRes.apartment || '1',
      phone: regPhone.trim(),
      username: regEmail.trim() || regFullName.toLowerCase().replace(/\s+/g, '.'),
      notificationPreference: 'app' as const,
    };
    setResidentUser(activeRes);

    if (rememberMe) {
      try {
        localStorage.setItem(`viva_remembered_resident_${siteInfo.id}`, JSON.stringify(activeRes));
      } catch (err) {
        console.warn('Remember me save failed', err);
      }
    }

    setRegLoading(false);
    setShowSelfRegister(false);
    setCurrentRole('resident');
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAuthConsoleNotice('');
    setLoginLoading(true);

    try {
      const { user, profile } = await loginWithEmailPassword(loginEmail.trim(), loginPassword.trim());

      // If Super Admin logs in
      if (loginEmail.trim().toLowerCase() === 'nuhnaninay@gmail.com') {
        try {
          await bootstrapAdmin({ authUid: user.uid, email: 'nuhnaninay@gmail.com' });
        } catch (bsErr) {
          console.warn('Bootstrap notice:', bsErr);
        }
        setLoginLoading(false);
        setShowAuthLogin(false);
        setCurrentRole('admin');
        return;
      }

      // If resident logs in
      if (profile && profile.role === 'resident') {
        const activeRes = {
          id: profile.uid || `res-${Date.now()}`,
          siteId: profile.siteId || siteInfo.id,
          fullName: profile.name || loginEmail.split('@')[0],
          block: profile.block || 'A',
          apartment: profile.apartment || '1',
          phone: '',
          username: loginEmail.trim(),
          notificationPreference: 'app' as const,
        };
        setResidentUser(activeRes);
        if (rememberMe) {
          localStorage.setItem(`viva_remembered_resident_${siteInfo.id}`, JSON.stringify(activeRes));
        }
        setLoginLoading(false);
        setShowAuthLogin(false);
        setCurrentRole('resident');
        return;
      }

      // Default role redirect
      setLoginLoading(false);
      setShowAuthLogin(false);
      if (loginTargetRole === 'admin') {
        setCurrentRole('admin');
      } else {
        setCurrentRole('resident');
      }
    } catch (err: any) {
      setLoginLoading(false);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthConsoleNotice(
          'Firebase Console üzerinde E-posta/Şifre sağlayıcısı henüz aktif edilmemiştir. Lütfen Firebase Console -> Authentication -> Sign-in method sekmesinden "Email/Password" seçeneğini etkinleştiriniz.'
        );
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setLoginError('E-posta adresi veya şifre hatalı.');
      } else {
        setLoginError(err.message || 'Giriş yapılamadı.');
      }
    }
  };

  const handleSelectExistingResident = (res: typeof siteResidents[0]) => {
    const updated = {
      id: res.id,
      siteId: siteInfo.id,
      fullName: res.fullName,
      block: res.block,
      apartment: res.apartment,
      phone: res.phone || '',
      username: res.username || '',
      notificationPreference: res.notificationPreference || 'app',
    };
    setResidentUser(updated);
    try {
      localStorage.setItem(`viva_remembered_resident_${siteInfo.id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Remember me save failed', err);
    }
    setShowSwitchResident(false);
    setCurrentRole('resident');
  };


  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#648875] text-white flex items-center justify-center font-luxury font-black text-lg shadow-md">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-luxury font-extrabold text-[#294C3C] tracking-wide">
                {siteInfo.name}
              </h1>
              {siteInfo.isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Demo Site
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#26342C]/65 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#648875]" />
              <span>
                {siteInfo.address}, {siteInfo.district ? `${siteInfo.district} / ` : ''}{siteInfo.city}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Cloud Synchronization Indicator */}
          <button
            onClick={refreshCloudSites}
            title={
              cloudSyncStatus === 'connected'
                ? 'Bulut veritabanı aktif (Cihazlar arası anlık senkronizasyon açık)'
                : cloudSyncStatus === 'connecting'
                ? 'Buluta bağlanılıyor...'
                : `Bağlantı uyarısı: ${cloudSyncError || 'Tekrar deneyin'}`
            }
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : cloudSyncStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <Cloud className="w-3.5 h-3.5 text-[#648875]" />
            <span className="text-[11px] font-bold text-[#26342C]">
              {cloudSyncStatus === 'connected'
                ? 'Bulut: Canlı'
                : cloudSyncStatus === 'connecting'
                ? 'Bağlanıyor...'
                : 'Çevrimdışı'}
            </span>
          </button>

          {/* 8s Intro trigger */}
          <button
            onClick={() => setShowAdModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
            title="Tanıtım Ekranını Göster"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#648875]" />
            <span className="hidden sm:inline">Tanıtım</span>
          </button>

          {/* (+) NEW SITE BUTTON */}
          <button
            onClick={() => setShowNewSiteModal(true)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white transition-all flex items-center gap-1.5 shadow-md touch-target"
            title="Yeni Site Ekle ve Kurulum Sihirbazını Başlat"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Yeni Site Ekle (+)</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome Card & Site Switcher */}
      <div className="max-w-4xl w-full mx-auto my-6 space-y-6">
        {/* If multiple sites exist, show quick site switcher */}
        {sites.length > 1 && (
          <div className="p-4 rounded-3xl bg-white border-2 border-[#648875]/40 shadow-xs space-y-2">
            <span className="text-xs font-bold text-[#294C3C] flex items-center gap-1.5 uppercase tracking-wider">
              <Building className="w-4 h-4 text-[#648875]" />
              <span>Kayıtlı Siteler Arasında Geçiş Yap:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {sites.map((s) => {
                const isActive = s.id === siteInfo.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => switchSite(s.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                        : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.isDemo && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20">Demo</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-3 text-center sm:text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#A8BCAF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#648875]/15 border border-[#648875]/30 text-[#294C3C] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#648875]" />
            <span>Gerçek Zamanlı Rezidans & Site Yönetimi — Ücretsiz Temel Sürüm</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-luxury font-extrabold text-[#294C3C] leading-tight">
            Hoş Geldiniz. Giriş Yapmak İstediğiniz Paneli Seçiniz
          </h2>

          <p className="text-xs sm:text-sm text-[#26342C]/75 max-w-2xl leading-relaxed">
            Site sakinleri için tek dokunuşla kurye & teslimat tercihi, araçlı/yaya misafir karşılama ve kargo takibi; güvenlik için nizamiye kurye karşılama, sesli firma algılama ve kargo emanet konsolu.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#26342C]/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#648875]" />
              <span>{siteInfo.blockCount} Blok · {siteInfo.apartmentCount} Daire</span>
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#648875]" />
              <span>Daireye Özel Davet Sistemi: <strong className="text-[#294C3C] ml-1">Korumalı & Aktif</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#648875]" />
              <span>Nizamiye: {siteInfo.securityPhone}</span>
            </span>
          </div>
        </div>

        {/* 4 Main Role Portals (Strict Authentication - Zero Bypass) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. SAKİN PORTALI */}
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] hover:border-[#648875] shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                  <Users className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowSelfRegister(true)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Kayıt Ol</span>
                </button>
              </div>

              <h3 className="text-base font-luxury font-bold text-[#294C3C]">
                Sakin Portalı
              </h3>
              <p className="text-[11px] text-[#26342C]/70 leading-relaxed">
                Kurye veya misafir geldiğinde anlık sesli bildirim alın; kargolarınızı takip edin.
              </p>

              {residentUser && (
                <div className="p-2 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs">
                  <span className="text-[9px] text-gray-500 block">Kayıtlı Profil:</span>
                  <strong className="text-[#294C3C] text-[11px] block truncate">{residentUser.fullName} ({residentUser.block}{residentUser.apartment})</strong>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#DDE5DF]">
              {residentUser ? (
                <button
                  onClick={() => setCurrentRole('resident')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer"
                >
                  <span>Hemen Devam Et</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLoginTargetRole('resident');
                    setShowAuthLogin(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer"
                >
                  <span>Sakin Girişi Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setLoginTargetRole('resident');
                  setShowAuthLogin(true);
                }}
                className="w-full py-2 px-2.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-[11px] font-bold text-[#294C3C] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#648875]" />
                <span>E-posta / Şifre</span>
              </button>

              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-center text-[10px] text-gray-500 hover:text-[#294C3C] pt-0.5 cursor-pointer"
              >
                Şifremi Unuttum
              </button>
            </div>
          </div>

          {/* 2. GÜVENLİK KONSOLU (PIN Korumalı) */}
          <div
            onClick={() => setShowSecurityLoginModal(true)}
            className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#648875] hover:border-[#294C3C] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#294C3C] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-luxury font-bold text-[#294C3C]">
                  Güvenlik Konsolu
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#648875] text-white">
                  Nizamiye
                </span>
              </div>
              <p className="text-[11px] text-[#26342C]/70 leading-relaxed">
                Nizamiye kapısına gelen kurye, misafir ve kargo kabulü. 4 haneli nöbetçi PIN kodu gereklidir.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-[#648875]">
              <span>PIN ile Giriş Yap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. YÖNETİM KURULU (E-posta/Şifre Korumalı) */}
          <div
            onClick={() => {
              setLoginTargetRole('admin');
              setShowAuthLogin(true);
            }}
            className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] hover:border-[#648875] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] group-hover:bg-[#294C3C] group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-luxury font-bold text-[#294C3C]">
                Yönetim Kurulu
              </h3>
              <p className="text-[11px] text-[#26342C]/70 leading-relaxed">
                Kayıtlı sakinler, aidat & harcamalar, fatura OCR, personel puantajı ve site ayarları.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-[#648875]">
              <span>Yönetici Girişi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. PERSONEL & HİZMET PORTALI */}
          <div
            onClick={() => setShowStaffTerminalModal(true)}
            className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-emerald-300 hover:border-[#294C3C] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5 text-emerald-800" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-luxury font-bold text-[#294C3C]">
                  Hizmet Masası
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-700 text-white">
                  Puantaj
                </span>
              </div>
              <p className="text-[11px] text-[#26342C]/70 leading-relaxed">
                Temizlik, Cafe, Teknik Bakım, Bahçıvan ve Meydancı personeli nöbet ve mola takip terminali.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-emerald-700">
              <span>Nöbet Terminali</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Self-Registration Modal */}
      {showSelfRegister && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C]">Site Sakiniyim – Kayıt Ol</h3>
                  <p className="text-[11px] text-gray-500">Yönetici onayı beklemeden hemen kullanmaya başlayın</p>
                </div>
              </div>
              <button
                onClick={() => setShowSelfRegister(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {regError}
              </div>
            )}

            <form onSubmit={handleSelfRegister} className="space-y-3.5">
              {/* One-Time Invite Code */}
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Daireye Özel Tek Kullanımlık Davet Kodu *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                    placeholder="Örn: VIVA-A-1-ABCD"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#648875]"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  Yönetim tarafından dairenize iletilen tek kullanımlık kayıt kodudur. Blok ve daire bilginiz sunucu tarafından bu koda bağlı olarak otomatik atanır; yetkisiz daire kaydı yapılamaz.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Örn: Ayşe Demir"
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Cep Telefonu *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0533 123 45 67"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                    required
                  />
                </div>
              </div>

              {/* Email (Optional for Auth) */}
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">E-posta (Kalıcı Giriş Hesabı İçin)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sakin@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Parola</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="En az 6 karakterli parola"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DDE5DF] text-[#294C3C] focus:ring-[#648875]"
                />
                <span className="text-xs text-[#26342C]">Bu cihazda beni hatırla</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSelfRegister(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-sm disabled:opacity-60"
                >
                  {regLoading ? 'Doğrulanıyor...' : 'Davet Kodunu Doğrula & Kaydol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email / Password Login Modal (For Residents & Managers) */}
      {showAuthLogin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center font-bold">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C]">
                    {loginTargetRole === 'admin' ? 'Yönetici Girişi' : 'Kayıtlı Hesap Girişi'}
                  </h3>
                  <p className="text-[11px] text-gray-500">Firebase Authentication E-posta & Şifre</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthLogin(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {loginError}
              </div>
            )}

            {authConsoleNotice && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                <span className="font-bold block">Firebase Console Yapılandırma Bildirimi:</span>
                <p className="text-[11px] leading-relaxed">{authConsoleNotice}</p>
              </div>
            )}

            <form onSubmit={handleAuthLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Şifrenizi giriniz"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthLogin(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{loginLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switch / Select Resident Modal */}
      {showSwitchResident && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#648875]" />
                <h3 className="text-base font-bold text-[#294C3C]">Kayıtlı Sakin Seç</h3>
              </div>
              <button
                onClick={() => setShowSwitchResident(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchResidentQuery}
                onChange={(e) => setSearchResidentQuery(e.target.value)}
                placeholder="İsim veya daire ara..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DDE5DF] text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {siteResidents
                .filter((r) =>
                  `${r.fullName} ${r.block}${r.apartment}`
                    .toLocaleLowerCase('tr')
                    .includes(searchResidentQuery.toLocaleLowerCase('tr'))
                )
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectExistingResident(r)}
                    className="w-full p-3 rounded-xl border border-[#DDE5DF] hover:border-[#648875] bg-white hover:bg-[#F7F8F5] text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <strong className="text-xs text-[#294C3C] block">{r.fullName}</strong>
                      <span className="text-[11px] text-gray-500">
                        {r.block} Blok · Daire {r.apartment}
                      </span>
                    </div>
                    <span className="text-xs text-[#648875] font-bold">Giriş Yap →</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#648875]" />
                <h3 className="text-base font-bold text-[#294C3C]">Parola Sıfırlama</h3>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {forgotError}
              </div>
            )}
            {forgotMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">E-posta ile Şifre Sıfırlama (Önerilen)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                  />
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="shrink mx-2 text-[10px] text-gray-400 font-bold uppercase">veya daire & telefon ile</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Daire Numarası</label>
                <input
                  type="text"
                  value={forgotApartment}
                  onChange={(e) => setForgotApartment(e.target.value)}
                  placeholder="Örn: 12"
                  className="w-full p-2 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Kayıtlı Telefon Numarası</label>
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="0533 123 45 67"
                  className="w-full p-2 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold disabled:opacity-60"
                >
                  {forgotLoading ? 'İşleniyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Login Modal (PIN Required - No Bypass) */}
      {showSecurityLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm animate-in fade-in zoom-in-95">
            <SecurityLoginScreen
              onSuccess={() => {
                setShowSecurityLoginModal(false);
                setCurrentRole('security');
              }}
              onBack={() => setShowSecurityLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* Staff Terminal Modal (For Cleaning, Cafe, Maintenance) */}
      <StaffTerminalModal
        isOpen={showStaffTerminalModal}
        onClose={() => setShowStaffTerminalModal(false)}
      />

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-[#26342C]/50 border-t border-[#DDE5DF]">
        © 2026 {siteInfo.name} · %100 Ücretsiz Lüks Site ve Rezidans Yönetim Platformu
      </footer>
    </div>
  );
};
