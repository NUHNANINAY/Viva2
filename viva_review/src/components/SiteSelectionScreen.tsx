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
  Info,
} from 'lucide-react';

export const SiteSelectionScreen: React.FC = () => {
  const {
    setCurrentRole,
    siteInfo,
    sites,
    switchSite,
    residentUser,
    setShowNewSiteModal,
    setShowAdModal,
    siteResidents,
    addResidentToSite,
    setResidentUser,
  } = useApp();
  const [showSelfRegister, setShowSelfRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBlock, setRegBlock] = useState(siteInfo.blocks?.[0]?.block || 'A');
  const [regApartment, setRegApartment] = useState('1');
  const [regError, setRegError] = useState('');
  const [regDone, setRegDone] = useState(false);
  const submitSelfRegistration = () => {
    setRegError('');
    if (!regName.trim() || !regPhone.trim()) { setRegError('Ad soyad ve telefon numarası gerekli.'); return; }
    const phone = regPhone.replace(/\s/g, '');
    if (siteResidents.some(r => r.phone?.replace(/\s/g, '') === phone)) { setRegError('Bu telefon numarası bu siteye zaten kayıtlı.'); return; }
    const resident = addResidentToSite({ block: regBlock, apartment: regApartment, fullName: regName.trim(), phone, notificationPreference: 'app' });
    setResidentUser({ id: resident.id, siteId: resident.siteId, fullName: resident.fullName, block: resident.block, apartment: resident.apartment, phone: resident.phone || phone, username: resident.username, notificationPreference: 'app' });
    setRegDone(true);
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
          {/* 8s Intro trigger */}
          <button
            onClick={() => setShowAdModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
            title="Tanıtım Ekranını Göster"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#648875]" />
            <span className="hidden sm:inline">Tanıtım</span>
          </button>

          {/* (+) NEW SITE BUTTON (Requirement 2: Critical Fix) */}
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
            <span>Yeni Nesil Lüks Rezidans ve Site Yönetimi — Ücretsiz Temel Sürüm</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-luxury font-extrabold text-[#294C3C] leading-tight">
            Hoş Geldiniz. Giriş Yapmak İstediğiniz Paneli Seçiniz
          </h2>

          <p className="text-xs sm:text-sm text-[#26342C]/75 max-w-2xl leading-relaxed">
            Site sakinleri için anlık kurye & teslimat tercihi, araçlı/yaya misafir karşılama ve kargo takibi; güvenlik için nizamiye kurye karşılama, sesli firma algılama ve kargo emanet konsolu.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#26342C]/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#648875]" />
              <span>{siteInfo.blockCount} Blok · {siteInfo.apartmentCount} Daire</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#648875]" />
              <span>7/24 Güvenlik & Kurye Masası</span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#648875]" />
              <span>Nizamiye: {siteInfo.securityPhone}</span>
            </span>
          </div>
        </div>

        {/* 3 Main Role Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* 1. SAKİN PORTALI */}
          <div
            onClick={() => setCurrentRole('resident')}
            className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] hover:border-[#648875] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] group-hover:bg-[#294C3C] group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-luxury font-bold text-[#294C3C]">
                Sakin Portalı
              </h3>
              <p className="text-xs text-[#26342C]/70 leading-relaxed">
                Kurye geldiğinde sesli bildirim alın. <strong>Evdeyim, Cafedeyim veya Kapıya Bıraksınlar</strong> tercihi verin; misafir ve kargo süreçlerinizi yönetin.
              </p>
            </div>

            <div className="pt-4 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-[#648875]">
              <span>Sakin Olarak Giriş Yap ({residentUser.fullName})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. GÜVENLİK KONSOLU */}
          <div
            onClick={() => setCurrentRole('security')}
            className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#648875] hover:border-[#294C3C] shadow-lg hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#294C3C] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-luxury font-bold text-[#294C3C]">
                  Güvenlik Konsolu
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Nizamiye
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70 leading-relaxed">
                Nizamiye kapısına gelen Trendyol, Getir, Migros, Yemeksepeti ve sesli firma siparişlerini kaydedin; misafir ve kargo kabulünü yönetin.
              </p>
            </div>

            <div className="pt-4 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-[#648875]">
              <span>Güvenlik Masasına Geç</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. YÖNETİM KURULU */}
          <div
            onClick={() => setCurrentRole('admin')}
            className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] hover:border-[#648875] shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] group-hover:bg-[#294C3C] group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-luxury font-bold text-[#294C3C]">
                Yönetim Kurulu
              </h3>
              <p className="text-xs text-[#26342C]/70 leading-relaxed">
                Site genel durum raporları, sakin & güvenlik yönetimi, kargo & misafir istatistikleri ve bildirim tercihleri.
              </p>
            </div>

            <div className="pt-4 border-t border-[#DDE5DF] flex items-center justify-between text-xs font-bold text-[#294C3C] group-hover:text-[#648875]">
              <span>Yönetim Paneline Geç</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>


        <div className="text-center">
          <button onClick={() => setShowSelfRegister(true)} className="px-6 py-3 rounded-2xl bg-[#648875] text-white font-bold text-sm shadow-md">
            Site Sakiniyim – İlk Kez Kayıt Ol
          </button>
        </div>
      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-[#26342C]/50 border-t border-[#DDE5DF]">
        © 2026 {siteInfo.name} · %100 Ücretsiz Lüks Site ve Rezidans Yönetim Platformu
      </footer>

      {showSelfRegister && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-[#294C3C]">Sakin Kaydı</h2><button onClick={() => setShowSelfRegister(false)} className="text-2xl">×</button></div>
            <p className="text-sm text-gray-600">Kendi dairenizi seçip bilgilerinizi girin. Kayıt yönetici onayı beklemeden bu cihazda etkinleşir.</p>
            <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Ad Soyad" className="w-full p-3 border rounded-xl" />
            <input value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="Telefon" inputMode="tel" className="w-full p-3 border rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <select value={regBlock} onChange={e=>{setRegBlock(e.target.value);setRegApartment('1')}} className="p-3 border rounded-xl">{(siteInfo.blocks || []).map(b=><option key={b.block} value={b.block}>{b.block} Blok</option>)}</select>
              <select value={regApartment} onChange={e=>setRegApartment(e.target.value)} className="p-3 border rounded-xl">{Array.from({length:siteInfo.blocks?.find(b=>b.block===regBlock)?.apartmentCount || 15},(_,i)=><option key={i+1} value={String(i+1)}>Daire {i+1}</option>)}</select>
            </div>
            {regError && <p className="text-sm text-red-600">{regError}</p>}
            <button onClick={submitSelfRegistration} className="w-full py-3 rounded-xl bg-[#294C3C] text-white font-bold">Kaydı Tamamla</button>
            <p className="text-[11px] text-amber-700">Not: Bu sürümde kayıtlar yalnızca aynı tarayıcıda saklanır. Farklı telefonlardan ortak kullanım için sunucu veritabanı kurulmalıdır.</p>
          </div>
        </div>
      )}
    </div>
  );
};
