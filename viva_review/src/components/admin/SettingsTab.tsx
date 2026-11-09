/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Building2,
  Layers,
  MessageCircle,
  Sparkles,
  Plus,
} from 'lucide-react';
import { SiteResident, SecurityGuard } from '../../types';

export const SettingsTab: React.FC = () => {
  const {
    siteInfo,
    setSiteInfo,
    siteResidents,
    addResidentToSite,
    updateResident,
    deleteResident,
    siteGuards,
    addSecurityGuard,
    updateSecurityGuard,
    deleteSecurityGuard,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'site' | 'residents' | 'guards' | 'notifications'>('site');

  // Site Info State
  const [name, setName] = useState(siteInfo.name);
  const [address, setAddress] = useState(siteInfo.address);
  const [city, setCity] = useState(siteInfo.city);
  const [district, setDistrict] = useState(siteInfo.district || 'Merkez');
  const [adminPhone, setAdminPhone] = useState(siteInfo.adminPhone);
  const [securityPhone, setSecurityPhone] = useState(siteInfo.securityPhone);
  const [securityPasswordHash, setSecurityPasswordHash] = useState(siteInfo.securityPasswordHash || '1234');
  const [saved, setSaved] = useState(false);

  // New Resident Form State
  const [newResBlock, setNewResBlock] = useState(siteInfo.blocks?.[0]?.block || 'A');
  const [newResApartment, setNewResApartment] = useState('1');
  const [newResFullName, setNewResFullName] = useState('');
  const [newResPhone, setNewResPhone] = useState('');

  // New Guard Form State
  const [newGuardName, setNewGuardName] = useState('');
  const [newGuardSurname, setNewGuardSurname] = useState('');
  const [newGuardUsername, setNewGuardUsername] = useState('');
  const [newGuardPhone, setNewGuardPhone] = useState('');

  const siteBlocks = siteInfo.blocks?.map((b) => b.block) || ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'];

  const handleSubmitSiteInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteInfo({
      ...siteInfo,
      name,
      address,
      city,
      district,
      adminPhone,
      securityPhone,
      securityPasswordHash,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResFullName.trim()) return;

    addResidentToSite({
      block: newResBlock,
      apartment: newResApartment,
      fullName: newResFullName.trim(),
      phone: newResPhone.trim() || undefined,
    });

    setNewResFullName('');
    setNewResPhone('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateGuard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardName.trim() || !newGuardUsername.trim()) return;

    addSecurityGuard({
      name: newGuardName.trim(),
      surname: newGuardSurname.trim(),
      username: newGuardUsername.trim(),
      phone: newGuardPhone.trim() || undefined,
      isActive: true,
    });

    setNewGuardName('');
    setNewGuardSurname('');
    setNewGuardUsername('');
    setNewGuardPhone('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-4">
        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Site Yönetimi & Sistem Ayarları
          </h2>
          <p className="text-xs text-[#26342C]/65">
            {siteInfo.name} · Bloklar, sakin kütüğü, güvenlik personeli ve entegrasyonlar
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] rounded-2xl border border-[#DDE5DF] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('site')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'site'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Site Bilgileri
          </button>
          <button
            onClick={() => setActiveSection('residents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'residents'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Sakinler ({siteResidents.length})
          </button>
          <button
            onClick={() => setActiveSection('guards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'guards'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Güvenlik ({siteGuards.length})
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'notifications'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Bildirim & WhatsApp
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">İşlem başarıyla kaydedildi ve veritabanı güncellendi.</span>
        </div>
      )}

      {/* SECTION 1: SITE BİLGİLERİ */}
      {activeSection === 'site' && (
        <form onSubmit={handleSubmitSiteInfo} className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Site / Rezidans Adı
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Şehir
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                İlçe
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
              Açık Adres
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Yönetim Telefonu
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Nizamiye / Güvenlik Telefonu
              </label>
              <input
                type="text"
                value={securityPhone}
                onChange={(e) => setSecurityPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Güvenlik Masası PIN Kodu
              </label>
              <input
                type="text"
                maxLength={4}
                value={securityPasswordHash}
                onChange={(e) => setSecurityPasswordHash(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C] text-center"
              />
            </div>
          </div>

          {/* Blok Yapılandırması Özeti */}
          {siteInfo.blocks && siteInfo.blocks.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-2">
              <span className="text-xs font-bold text-[#294C3C] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#648875]" />
                <span>Tanımlı Bloklar & Daire Kapasitesi:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {siteInfo.blocks.map((b) => (
                  <div key={b.block} className="p-2 rounded-xl bg-white border border-[#DDE5DF] text-xs">
                    <strong>{b.block} Blok:</strong> {b.apartmentCount} Daire
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 touch-target"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: SAKİNLER CRUD */}
      {activeSection === 'residents' && (
        <div className="space-y-5">
          {/* Yeni Sakin Ekle */}
          <form onSubmit={handleCreateResident} className="p-5 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-sm space-y-3">
            <span className="text-xs font-bold text-[#294C3C] uppercase tracking-wider block">
              + Yeni Sakin Tanımla
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Blok</label>
                <select
                  value={newResBlock}
                  onChange={(e) => setNewResBlock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                >
                  {siteBlocks.map((blk) => (
                    <option key={blk} value={blk}>{blk} Blok</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Daire No</label>
                <input
                  type="text"
                  required
                  placeholder="12"
                  value={newResApartment}
                  onChange={(e) => setNewResApartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ayşe Demir"
                  value={newResFullName}
                  onChange={(e) => setNewResFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Telefon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+90 53..."
                    value={newResPhone}
                    onChange={(e) => setNewResPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Sakinler Listesi */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
              Kayıtlı Site Sakinleri ({siteResidents.length})
            </h3>

            {siteResidents.length === 0 ? (
              <p className="text-xs text-[#26342C]/60 py-4 text-center">
                Bu siteye henüz sakin eklenmedi. Yukarıdaki formdan yeni sakin kaydedebilirsiniz.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {siteResidents.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-[#294C3C]">{res.block}{res.apartment}</strong>
                        <span className="text-[#26342C]/80">· {res.fullName}</span>
                      </div>
                      <p className="text-[11px] text-[#26342C]/60">{res.phone || 'Telefon yok'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`${res.fullName} sakin kaydını silmek istediğinize emin misiniz?`)) {
                          deleteResident(res.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: GÜVENLİK GÖREVLİLERİ */}
      {activeSection === 'guards' && (
        <div className="space-y-5">
          <form onSubmit={handleCreateGuard} className="p-5 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-sm space-y-3">
            <span className="text-xs font-bold text-[#294C3C] uppercase tracking-wider block">
              + Yeni Güvenlik Görevlisi Ekle
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Ad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hasan"
                  value={newGuardName}
                  onChange={(e) => setNewGuardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Soyad</label>
                <input
                  type="text"
                  placeholder="Örn: Çetin"
                  value={newGuardSurname}
                  onChange={(e) => setNewGuardSurname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Kullanıcı Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="guvenlik7"
                  value={newGuardUsername}
                  onChange={(e) => setNewGuardUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-mono text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">Telefon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+90 53..."
                    value={newGuardPhone}
                    onChange={(e) => setNewGuardPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shrink-0 transition-colors"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Görevliler Listesi */}
          <div className="p-5 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
              Nizamiye Güvenlik Görevlileri ({siteGuards.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {siteGuards.map((g, idx) => (
                <div
                  key={g.id}
                  className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#648875]" />
                      <strong className="text-[#294C3C]">{g.name} {g.surname}</strong>
                    </div>
                    <p className="text-[11px] font-mono text-[#648875]">@{g.username}</p>
                    <p className="text-[10px] text-[#26342C]/60">{g.phone || 'Telefon yok'}</p>
                  </div>

                  {siteGuards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`${g.name} ${g.surname} görevli kaydını silmek istiyor musunuz?`)) {
                          deleteSecurityGuard(g.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: BİLDİRİM & WHATSAPP ENTEGRASYONLARI */}
      {activeSection === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-md space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ENTEGRASYON BEKLİYOR
              </span>
              <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                Meta WhatsApp Business Cloud API & SMS Ağ Geçidi
              </h3>
            </div>
            <p className="text-xs text-[#26342C]/70">
              WhatsApp üzerinden anlık sipariş & kargo bildirimi göndermek için dış servis parametreleri
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3 text-xs">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#294C3C]">
                WhatsApp Cloud API Access Token
              </label>
              <input
                type="password"
                placeholder="EAAGm0PX4ZC... (Kullanıcı tarafından tanımlandığında aktifleşir)"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-mono"
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#294C3C]">
                WhatsApp Phone Number ID
              </label>
              <input
                type="text"
                placeholder="109283748291..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-mono"
                disabled
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Şeffaflık Notu:</strong> Meta WhatsApp Cloud API veya harici SMS servisleri ücretli kotalara sahip olabileceği için kullanıcının açık onayı ve kendi API anahtarı olmadan dış ücretli servisler devreye sokulmaz. VİVA SİTE, kendi dahili sesli ve görsel bildirim mekanizmasıyla %100 ücretsiz çalışır.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
