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
  ToggleLeft,
  ToggleRight,
  MapPin,
  Radio,
  ShieldAlert,
  Cpu,
  Smartphone,
  Check,
} from 'lucide-react';
import { SiteResident, SecurityGuard } from '../../types';
import { InviteCodesTab } from './InviteCodesTab';
import { DriveReportsTab } from './DriveReportsTab';

export const SettingsTab: React.FC = () => {
  const {
    siteInfo,
    setSiteInfo,
    updateSiteModules,
    updateSiteWhatsapp,
    updateSiteGeofence,
    updateSiteHardware,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'site' | 'modules' | 'invite_codes' | 'reports' | 'notifications'>('site');

  // Site Info State
  const [name, setName] = useState(siteInfo.name);
  const [address, setAddress] = useState(siteInfo.address);
  const [city, setCity] = useState(siteInfo.city);
  const [district, setDistrict] = useState(siteInfo.district || 'Merkez');
  const [adminPhone, setAdminPhone] = useState(siteInfo.adminPhone);
  const [securityPhone, setSecurityPhone] = useState(siteInfo.securityPhone);
  const [securityPasswordHash, setSecurityPasswordHash] = useState(siteInfo.securityPasswordHash || '1234');
  const [saved, setSaved] = useState(false);

  // Modules State
  const [modules, setModules] = useState({
    cafe: siteInfo.modules?.cafe ?? true,
    facilities: siteInfo.modules?.facilities ?? true,
    businessNetwork: siteInfo.modules?.businessNetwork ?? true,
    keyHandover: siteInfo.modules?.keyHandover ?? true,
    whatsapp: siteInfo.modules?.whatsapp ?? false,
    faceRecognition: siteInfo.modules?.faceRecognition ?? false,
    nfc: siteInfo.modules?.nfc ?? false,
    geofence: siteInfo.modules?.geofence ?? false,
  });

  // Geofence State
  const [geofenceEnabled, setGeofenceEnabled] = useState(siteInfo.geofenceConfig?.enabled ?? false);

  // Hardware & KVKK State
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(siteInfo.hardwareConfig?.faceRecognitionEnabled ?? false);
  const [nfcGateEnabled, setNfcGateEnabled] = useState(siteInfo.hardwareConfig?.nfcGateEnabled ?? false);
  const [cameraCount, setCameraCount] = useState(siteInfo.hardwareConfig?.cameraCount ?? 4);
  const [kvkkConsentApproved, setKvkkConsentApproved] = useState(siteInfo.hardwareConfig?.kvkkConsentApproved ?? false);

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

  const handleSaveModules = () => {
    updateSiteModules(siteInfo.id, modules);
    updateSiteGeofence(siteInfo.id, {
      enabled: geofenceEnabled,
      boundaryPoints: siteInfo.geofenceConfig?.boundaryPoints || [{ lat: 40.2185, lng: 28.9328 }],
    });
    updateSiteHardware(siteInfo.id, {
      faceRecognitionEnabled,
      nfcGateEnabled,
      cameraCount: Number(cameraCount) || 0,
      kvkkConsentApproved,
    });
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
            {siteInfo.name} · Site kimliği, modüller, KVKK donanımları, tek kullanımlık davet kodları ve raporlar
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] rounded-2xl border border-[#DDE5DF] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('site')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'site'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Site Bilgileri
          </button>
          <button
            onClick={() => setActiveSection('modules')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'modules'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Modüller & Donanım (KVKK)
          </button>
          <button
            onClick={() => setActiveSection('invite_codes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'invite_codes'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Tek Kullanımlık Davet Kodları
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === 'reports'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:text-[#26342C]'
            }`}
          >
            Drive & Raporlar
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* SECTION 2: MODÜLLER, GEOFENCE & DONANIM (KVKK) */}
      {activeSection === 'modules' && (
        <div className="space-y-6">
          {/* 1. Modül Anahtarları */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE5DF]">
              <div>
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#648875]" />
                  <span>Site Modül Yönetimi (Aç / Kapa)</span>
                </h3>
                <p className="text-xs text-[#26342C]/70">
                  Sitenizin sakin ve güvenlik portallarında görünmesini istediğiniz modülleri tek tıkla aktif edin veya gizleyin.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Cafe */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">Cafe & Lounge Sipariş Modülü</h4>
                  <p className="text-[11px] text-[#26342C]/65">Sakinlerin sipariş tercihlerinde "Cafedeyim" opsiyonunu ve cafe menüsünü açar</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, cafe: !modules.cafe })}
                  className={`p-1 rounded-xl transition-colors ${modules.cafe ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.cafe ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              {/* Tesisler */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">Ortak Tesis & Rezervasyon</h4>
                  <p className="text-[11px] text-[#26342C]/65">Fitness, havuz, tenis kortu ve barbekü alanı rezervasyon takibi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, facilities: !modules.facilities })}
                  className={`p-1 rounded-xl transition-colors ${modules.facilities ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.facilities ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              {/* İş Ağı */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">Komşu & İş Ağı (Rehber)</h4>
                  <p className="text-[11px] text-[#26342C]/65">Sakinler arası mesleki tanışma ve ticari iş birliği dizini</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, businessNetwork: !modules.businessNetwork })}
                  className={`p-1 rounded-xl transition-colors ${modules.businessNetwork ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.businessNetwork ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              {/* Anahtar & Zimmet */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">Anahtar & Zimmet Takibi</h4>
                  <p className="text-[11px] text-[#26342C]/65">Güvenlik kulübesinde emanet anahtar ve teknik ekipman teslim logları</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, keyHandover: !modules.keyHandover })}
                  className={`p-1 rounded-xl transition-colors ${modules.keyHandover ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.keyHandover ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              {/* WhatsApp */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">WhatsApp Otomasyonu</h4>
                  <p className="text-[11px] text-[#26342C]/65">Meta Business Cloud API üzerinden anlık kargo/sipariş mesajlaşması</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, whatsapp: !modules.whatsapp })}
                  className={`p-1 rounded-xl transition-colors ${modules.whatsapp ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.whatsapp ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              {/* Geofence */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#294C3C]">Geofence (Sanal Sınır)</h4>
                  <p className="text-[11px] text-[#26342C]/65">GPS konum tabanlı kurye yaklaşma ve devriye denetimi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModules({ ...modules, geofence: !modules.geofence })}
                  className={`p-1 rounded-xl transition-colors ${modules.geofence ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {modules.geofence ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Geofence Yapılandırması */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#648875]" />
              <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                Geofence & Site Çevre Sınırı Yapılandırması
              </h3>
            </div>
            <p className="text-xs text-[#26342C]/70">
              Site nizamiyesine yaklaşan kayıtlı kurye ve ziyaretçilerin otomatik algılanması ve güvenlik bildirimlerinin tetiklenmesi için koordinat alanı.
            </p>

            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#294C3C]">Geofence Kontrolü:</span>
                  <p className="text-[11px] text-[#26342C]/65">Kurye yaklaştığında güvenlik tabletinde sesli/görsel flaş uyarısı</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeofenceEnabled(!geofenceEnabled)}
                  className={`p-1 rounded-xl transition-colors ${geofenceEnabled ? 'text-[#294C3C]' : 'text-slate-400'}`}
                >
                  {geofenceEnabled ? <ToggleRight className="w-7 h-7 text-[#294C3C]" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#294C3C] mb-1">Merkez Enlem (Lat)</label>
                  <input
                    type="text"
                    disabled
                    value="40.218500 (Dikencik Penta Nizamiye)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] font-mono text-xs text-[#26342C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#294C3C] mb-1">Merkez Boylam (Lng)</label>
                  <input
                    type="text"
                    disabled
                    value="28.932800 (Nilüfer / Bursa)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] font-mono text-xs text-[#26342C]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Donanım, Biyometri (Yüz Tanıma & NFC) & KVKK Madde 6 Güvencesi */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#DDE5DF] shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#648875]" />
              <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                Donanım & Biyometrik Entegrasyon (KVKK Madde 6 Uyumluluğu)
              </h3>
            </div>
            <p className="text-xs text-[#26342C]/70">
              Kapı turnikesi, bariyer motorları, NFC kart okuyucuları ve IP kamera terminallerinin yönetim onayları.
            </p>

            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#294C3C]">Yüz Tanıma Terminali</h5>
                    <p className="text-[11px] text-[#26342C]/60">Nizamiye yüz tarama</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaceRecognitionEnabled(!faceRecognitionEnabled)}
                    className={`p-1 rounded-xl transition-colors ${faceRecognitionEnabled ? 'text-[#294C3C]' : 'text-slate-400'}`}
                  >
                    {faceRecognitionEnabled ? <ToggleRight className="w-6 h-6 text-[#294C3C]" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#294C3C]">NFC Kapı / Turnike</h5>
                    <p className="text-[11px] text-[#26342C]/60">Kart & tag geçişleri</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNfcGateEnabled(!nfcGateEnabled)}
                    className={`p-1 rounded-xl transition-colors ${nfcGateEnabled ? 'text-[#294C3C]' : 'text-slate-400'}`}
                  >
                    {nfcGateEnabled ? <ToggleRight className="w-6 h-6 text-[#294C3C]" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#DDE5DF]">
                  <label className="block text-[11px] font-bold text-[#294C3C] mb-1">Bağlı Kamera Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={cameraCount}
                    onChange={(e) => setCameraCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                  />
                </div>
              </div>

              {/* KVKK Biyometrik Veri Uyarısı ve Onay */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    KVKK Madde 6 Biyometrik Veri Zorunlu Bildirimi
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Madde 6 uyarınca biyometrik veri (yüz tanıma geometrisi) 
                  <strong> "Özel Nitelikli Kişisel Veri"</strong> statüsündedir. Sakinlerin ve ziyaretçilerin açık rızası alınmadan 
                  veya alternatif klasik geçiş yöntemi (NFC kart, PIN, resepsiyon teyidi) sunulmadan zorunlu tutulamaz.
                </p>
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kvkkConsentApproved}
                    onChange={(e) => setKvkkConsentApproved(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#294C3C] rounded border-[#DDE5DF] focus:ring-[#648875]"
                  />
                  <span className="text-[11px] font-semibold text-amber-950">
                    Site Yönetim Kurulu olarak KVKK Madde 6 gerekliliklerini sağladığımızı, sakinlerimize alternatif kartlı geçiş sunduğumuzu ve biyometrik verileri yerel şifrelenmiş donanımda sakladığımızı taahhüt ederiz.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveModules}
                className="px-6 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 touch-target"
              >
                <Save className="w-4 h-4" />
                <span>Modül & Donanım Ayarlarını Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: TEK KULLANIMLIK DAVET KODLARI */}
      {activeSection === 'invite_codes' && <InviteCodesTab />}

      {/* SECTION 3: DRIVE & RAPORLAR */}
      {activeSection === 'reports' && <DriveReportsTab />}

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
