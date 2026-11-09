/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_POSSIBLE_BLOCKS } from '../data/initialData';
import { SiteBlockConfig, SecurityGuard, SiteAdmin, SiteResident } from '../types';
import {
  Building2,
  X,
  CheckCircle2,
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  Layers,
  PhoneCall,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface GuardDraft {
  id: string;
  name: string;
  surname: string;
  username: string;
  password?: string;
  phone?: string;
}

interface ManagerDraft {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
}

interface ResidentDraft {
  id: string;
  block: string;
  apartment: string;
  fullName: string;
  phone: string;
  username?: string;
  password?: string;
}

export const SiteSetupWizardModal: React.FC = () => {
  const { showNewSiteModal, setShowNewSiteModal, createAndRegisterSite } = useApp();

  // Wizard Step: 1 = Site Info, 2 = Blocks & Units, 3 = Manager, 4 = Security (6 guards), 5 = Residents, 6 = Confirm
  const [step, setStep] = useState<number>(1);

  // Step 1: Site Info
  const [siteName, setSiteName] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Kadıköy');
  const [address, setAddress] = useState('');
  const [securityPhone, setSecurityPhone] = useState('+90 532 999 00 00');

  // Step 2: Blocks (A..N) & Apartment Counts
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['A', 'B', 'C', 'D']);
  const [apartmentCounts, setApartmentCounts] = useState<Record<string, number>>({
    A: 15,
    B: 15,
    C: 15,
    D: 15,
  });

  // Step 3: Manager Setup
  const [managers, setManagers] = useState<ManagerDraft[]>([
    {
      id: 'mgr-1',
      name: 'Murat',
      surname: 'Yıldız',
      email: 'yonetim@site.com',
      phone: '+90 532 100 00 01',
      role: 'Bina Yöneticisi',
      password: 'admin',
    },
  ]);
  const [mgrName, setMgrName] = useState('');
  const [mgrSurname, setMgrSurname] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrRole, setMgrRole] = useState('Müdür Yardımcısı');

  // Step 4: 6 Security Guards (Requirement 4-B)
  const [guards, setGuards] = useState<GuardDraft[]>([
    { id: 'g-1', name: 'Ahmet', surname: 'Kaya', username: 'guvenlik1', phone: '+90 532 999 00 01' },
    { id: 'g-2', name: 'Mehmet', surname: 'Demir', username: 'guvenlik2', phone: '+90 532 999 00 02' },
    { id: 'g-3', name: 'Ali', surname: 'Öztürk', username: 'guvenlik3', phone: '+90 532 999 00 03' },
    { id: 'g-4', name: 'Mustafa', surname: 'Yılmaz', username: 'guvenlik4', phone: '+90 532 999 00 04' },
    { id: 'g-5', name: 'Serkan', surname: 'Çelik', username: 'guvenlik5', phone: '+90 532 999 00 05' },
    { id: 'g-6', name: 'Onur', surname: 'Şahin', username: 'guvenlik6', phone: '+90 532 999 00 06' },
  ]);
  const [guardsSaved, setGuardsSaved] = useState(false);

  // Step 5: Resident Setup
  const [residents, setResidents] = useState<ResidentDraft[]>([]);
  const [resBlock, setResBlock] = useState('A');
  const [resApartment, setResApartment] = useState('1');
  const [resFullName, setResFullName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resUsername, setResUsername] = useState('');

  // Error state
  const [stepError, setStepError] = useState<string | null>(null);

  if (!showNewSiteModal) return null;

  // Toggle a block in Step 2
  const toggleBlock = (blockLetter: string) => {
    if (selectedBlocks.includes(blockLetter)) {
      if (selectedBlocks.length <= 1) {
        setStepError('En az 1 blok seçili olmalıdır.');
        return;
      }
      setSelectedBlocks((prev) => prev.filter((b) => b !== blockLetter));
      const nextCounts = { ...apartmentCounts };
      delete nextCounts[blockLetter];
      setApartmentCounts(nextCounts);
    } else {
      setSelectedBlocks((prev) => [...prev, blockLetter].sort());
      setApartmentCounts((prev) => ({
        ...prev,
        [blockLetter]: prev[blockLetter] || 15,
      }));
    }
    setStepError(null);
  };

  const handleApartmentCountChange = (blk: string, count: number) => {
    const val = Math.max(1, count);
    setApartmentCounts((prev) => ({
      ...prev,
      [blk]: val,
    }));
  };

  // Add extra manager
  const handleAddManager = () => {
    if (!mgrName.trim() || !mgrSurname.trim() || !mgrEmail.trim()) {
      setStepError('Lütfen yönetici adı, soyadı ve e-posta adresini giriniz.');
      return;
    }
    const newMgr: ManagerDraft = {
      id: `mgr-${Date.now()}`,
      name: mgrName.trim(),
      surname: mgrSurname.trim(),
      email: mgrEmail.trim(),
      phone: mgrPhone.trim() || '+90 532 000 00 00',
      role: mgrRole,
    };
    setManagers((prev) => [...prev, newMgr]);
    setMgrName('');
    setMgrSurname('');
    setMgrEmail('');
    setMgrPhone('');
    setStepError(null);
  };

  const handleRemoveManager = (id: string) => {
    if (managers.length <= 1) {
      setStepError('En az bir ana yönetici bulunmalıdır.');
      return;
    }
    setManagers((prev) => prev.filter((m) => m.id !== id));
  };

  // Update guard details
  const handleUpdateGuard = (index: number, field: keyof GuardDraft, value: string) => {
    setGuards((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setGuardsSaved(false);
  };

  // Add resident
  const handleAddResident = () => {
    if (!resFullName.trim()) {
      setStepError('Lütfen sakin adı ve soyadını giriniz.');
      return;
    }
    const newRes: ResidentDraft = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      block: resBlock,
      apartment: resApartment,
      fullName: resFullName.trim(),
      phone: resPhone.trim() || '+90 530 000 00 00',
      username: resUsername.trim() || resFullName.trim().toLowerCase().replace(/\s+/g, '.'),
    };
    setResidents((prev) => [...prev, newRes]);
    setResFullName('');
    setResPhone('');
    setResUsername('');
    setStepError(null);
  };

  const handleRemoveResident = (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
  };

  // Navigation validation
  const handleNextStep = () => {
    setStepError(null);

    if (step === 1) {
      if (!siteName.trim()) {
        setStepError('Lütfen site / rezidans adını giriniz.');
        return;
      }
      if (!address.trim()) {
        setStepError('Lütfen site açık adresini giriniz.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedBlocks.length === 0) {
        setStepError('Lütfen en az bir blok seçiniz.');
        return;
      }
      setResBlock(selectedBlocks[0]);
      setResApartment('1');
      setStep(3);
    } else if (step === 3) {
      if (managers.length === 0) {
        setStepError('En az 1 yönetici hesabı tanımlanmalıdır.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!guardsSaved) {
        setGuardsSaved(true);
      }
      // Residents self-register after site launch; no bulk resident entry during setup.
      setStep(6);
    } else if (step === 5) {
      setStep(6);
    }
  };

  // Complete and Launch Site
  const handleCompleteSetup = () => {
    const blockConfigs: SiteBlockConfig[] = selectedBlocks.map((blk) => ({
      block: blk,
      apartmentCount: apartmentCounts[blk] || 15,
    }));

    const totalApartments = blockConfigs.reduce((acc, curr) => acc + curr.apartmentCount, 0);

    const primaryManager = managers[0];

    createAndRegisterSite({
      siteInfo: {
        id: `site-${Date.now().toString(36)}`,
        name: siteName.trim().toUpperCase(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        securityPhone: securityPhone.trim() || '+90 532 999 88 77',
        blockCount: selectedBlocks.length,
        apartmentCount: totalApartments,
        securityCount: 6,
        adminName: `${primaryManager.name} ${primaryManager.surname}`,
        adminEmail: primaryManager.email,
        adminPhone: primaryManager.phone,
        securityPasswordHash: '1234',
        blocks: blockConfigs,
        isDemo: false,
      },
      managers: managers.map((m, idx) => ({
        id: `adm-${idx + 1}-${Date.now()}`,
        siteId: '', // AppContext assigns newly created siteId
        name: m.name,
        surname: m.surname,
        email: m.email,
        phone: m.phone,
        role: m.role,
        permissions: ['all', 'security_manage', 'resident_manage', 'reports', 'settings'],
      })),
      securityGuards: guards.map((g, idx) => ({
        id: `sec-${idx + 1}-${Date.now()}`,
        siteId: '', // AppContext assigns newly created siteId
        name: g.name,
        surname: g.surname,
        username: g.username,
        phone: g.phone,
        isActive: true,
      })),
      residents: residents.map((r, idx) => ({
        id: `res-${idx + 1}-${Date.now()}`,
        siteId: '', // AppContext assigns newly created siteId
        block: r.block,
        apartment: r.apartment,
        fullName: r.fullName,
        phone: r.phone,
        username: r.username,
        smsVerified: true,
        notificationPreference: 'app',
      })),
    });

    setShowNewSiteModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-2xl max-h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#26342C]">
        {/* Wizard Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <Building2 className="w-5 h-5 text-[#294C3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-luxury font-bold text-[#294C3C]">
                  Yeni Site Kurulum Sihirbazı
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Adım {step} / 6
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                Sıfırdan temiz ve bağımsız yeni bir site veritabanı başlatın
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewSiteModal(false)}
            className="p-2 rounded-xl text-[#26342C]/50 hover:text-[#26342C] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-6 border-b border-[#DDE5DF] bg-white text-[10px] font-bold text-center">
          <div className={`py-2 px-1 border-r border-[#DDE5DF] ${step === 1 ? 'bg-[#294C3C] text-white' : step > 1 ? 'bg-[#648875]/15 text-[#294C3C]' : 'text-[#26342C]/40'}`}>
            1. Site Bilgisi
          </div>
          <div className={`py-2 px-1 border-r border-[#DDE5DF] ${step === 2 ? 'bg-[#294C3C] text-white' : step > 2 ? 'bg-[#648875]/15 text-[#294C3C]' : 'text-[#26342C]/40'}`}>
            2. Bloklar & Daire
          </div>
          <div className={`py-2 px-1 border-r border-[#DDE5DF] ${step === 3 ? 'bg-[#294C3C] text-white' : step > 3 ? 'bg-[#648875]/15 text-[#294C3C]' : 'text-[#26342C]/40'}`}>
            3. Yöneticiler
          </div>
          <div className={`py-2 px-1 border-r border-[#DDE5DF] ${step === 4 ? 'bg-[#294C3C] text-white' : step > 4 ? 'bg-[#648875]/15 text-[#294C3C]' : 'text-[#26342C]/40'}`}>
            4. 6 Güvenlik
          </div>
          <div className={`py-2 px-1 border-r border-[#DDE5DF] ${step === 5 ? 'bg-[#294C3C] text-white' : step > 5 ? 'bg-[#648875]/15 text-[#294C3C]' : 'text-[#26342C]/40'}`}>
            5. Sakinler
          </div>
          <div className={`py-2 px-1 ${step === 6 ? 'bg-[#294C3C] text-white' : 'text-[#26342C]/40'}`}>
            6. Onay & Başlat
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {stepError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* STEP 1: Site Adı, Şehir, İlçe, Adres, Tel */}
          {/* ========================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                  Adım 1: Site Temel İletişim ve Konum Bilgileri
                </h3>
                <p className="text-xs text-[#26342C]/65">
                  Yeni site/rezidansın resmi adını ve nizamiye güvenlik iletişim numarasını giriniz.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Site / Rezidans Tam Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: VİVA GREEN PARK KONUTLARI"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C] uppercase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                    İl / Şehir *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                    İlçe *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Açık Adres (Cadde, Mahalle, No) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Örn: Atatürk Mah. Çamlıca Cad. No: 48"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Güvenlik / Nizamiye İletişim Telefonu *
                </label>
                <input
                  type="text"
                  required
                  value={securityPhone}
                  onChange={(e) => setSecurityPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#294C3C] font-semibold"
                />
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* STEP 2: BLOK SEÇİMİ (A..N) & DAİRE SAYISI  */}
          {/* ========================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                  Adım 2: Sitenizde Bulunan Bloklar ve Daire Sayıları
                </h3>
                <p className="text-xs text-[#26342C]/65">
                  A'dan N'ye kadar bloklardan sadece sitenizde mevcut olanları işaretleyiniz ve her blok için bağımsız daire sayısını giriniz.
                </p>
              </div>

              {/* Blok Seçim Izgarası A..N */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#294C3C]">
                  Blokları İşaretleyiniz ({selectedBlocks.length} Seçili):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ALL_POSSIBLE_BLOCKS.map((blk) => {
                    const isSelected = selectedBlocks.includes(blk);
                    return (
                      <button
                        key={blk}
                        type="button"
                        onClick={() => toggleBlock(blk)}
                        className={`py-3 rounded-2xl text-sm font-extrabold font-luxury border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-sm ring-2 ring-[#648875]/30'
                            : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                        }`}
                      >
                        <span>{blk}</span>
                        <span className="text-[9px] font-normal opacity-80">
                          {isSelected ? 'Seçili' : 'Yok'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Her Blok İçin Daire Sayısı Belirleme */}
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#294C3C] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#648875]" />
                    <span>Seçilen Blokların Daire Sayıları</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#648875]">
                    Toplam:{' '}
                    {selectedBlocks.reduce(
                      (acc, blk) => acc + (apartmentCounts[blk] || 15),
                      0
                    )}{' '}
                    Daire
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedBlocks.map((blk) => (
                    <div
                      key={blk}
                      className="p-2.5 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-extrabold text-[#294C3C]">
                        {blk} Blok:
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={apartmentCounts[blk] || 15}
                          onChange={(e) =>
                            handleApartmentCountChange(blk, parseInt(e.target.value) || 1)
                          }
                          className="w-16 px-2 py-1 rounded-lg border border-[#DDE5DF] text-xs font-bold text-[#294C3C] text-center"
                        />
                        <span className="text-[10px] text-[#26342C]/60">Daire</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* STEP 3: YÖNETİCİ HESAPLARI                */}
          {/* ========================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                  Adım 3: Site Yöneticisi ve Kurul Hesapları
                </h3>
                <p className="text-xs text-[#26342C]/65">
                  Site yönetim paneline erişebilecek ana yönetici ve varsa diğer kurul üyelerini tanımlayınız.
                </p>
              </div>

              {/* Mevcut Yöneticiler Listesi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#294C3C]">
                  Kayıtlı Yöneticiler ({managers.length}):
                </label>
                <div className="space-y-2">
                  {managers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-white border border-[#DDE5DF] flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-[#294C3C]">{m.name} {m.surname}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
                            {m.role}
                          </span>
                        </div>
                        <p className="text-[#26342C]/65 text-[11px]">
                          {m.email} · {m.phone}
                        </p>
                      </div>

                      {managers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManager(m.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yeni Yönetici Ekle Formu */}
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
                <span className="text-xs font-bold text-[#294C3C] uppercase tracking-wider block">
                  + Yeni Yönetici Ekle
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Ad"
                    value={mgrName}
                    onChange={(e) => setMgrName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <input
                    type="text"
                    placeholder="Soyad"
                    value={mgrSurname}
                    onChange={(e) => setMgrSurname(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={mgrEmail}
                    onChange={(e) => setMgrEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <input
                    type="text"
                    placeholder="Telefon"
                    value={mgrPhone}
                    onChange={(e) => setMgrPhone(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <select
                    value={mgrRole}
                    onChange={(e) => setMgrRole(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-semibold text-[#294C3C]"
                  >
                    <option value="Müdür Yardımcısı">Müdür Yardımcısı</option>
                    <option value="Muhasebe">Muhasebe</option>
                    <option value="Teknik Sorumlu">Teknik Sorumlu</option>
                    <option value="Denetçi">Denetçi</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddManager}
                    className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yöneticiyi Ekle</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* STEP 4: 6 GÜVENLİK GÖREVLİSİ KURULUMU     */}
          {/* ========================================== */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                    Adım 4: 6 Güvenlik Görevlisi Kurulumu
                  </h3>
                  {guardsSaved ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Görevliler Kaydedildi</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Kaydedilmedi
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#26342C]/65">
                  Nizamiye masasında vardiyalı görev yapacak 6 güvenlik personelinin kullanıcı adı ve isimlerini düzenleyiniz.
                </p>
              </div>

              {/* 6 Güvenlik Kartı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {guards.map((g, idx) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-2xl bg-white border border-[#DDE5DF] shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#294C3C] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#648875]" />
                        <span>Görevli #{idx + 1}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#648875]">
                        Kullanıcı: {g.username}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Ad"
                        value={g.name}
                        onChange={(e) => handleUpdateGuard(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#DDE5DF] text-xs text-[#26342C]"
                      />
                      <input
                        type="text"
                        placeholder="Soyad"
                        value={g.surname}
                        onChange={(e) => handleUpdateGuard(idx, 'surname', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#DDE5DF] text-xs text-[#26342C]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        value={g.username}
                        onChange={(e) => handleUpdateGuard(idx, 'username', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-mono text-[#26342C]"
                      />
                      <input
                        type="text"
                        placeholder="Telefon"
                        value={g.phone || ''}
                        onChange={(e) => handleUpdateGuard(idx, 'phone', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#DDE5DF] text-xs text-[#26342C]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirement 4-B Explicit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setGuardsSaved(true)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    guardsSaved
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#294C3C] hover:bg-[#648875] text-white shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bitti – Görevlileri Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* STEP 5: SİTE SAKİNİ KURULUMU              */}
          {/* ========================================== */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                  Adım 5: Site Sakinleri Tanımlama
                </h3>
                <p className="text-xs text-[#26342C]/65">
                  Sakinler site açıldıktan sonra kendi telefonlarından kayıt olacak. Yönetici onayı gerekmeyecek.
                </p>
              </div>

              {/* SMS Verification Disclaimer (Requirement 4-A) */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>SMS Doğrulama Bildirimi:</strong> Gerçek SMS gönderimleri için harici SMS ağ geçidi (Netgsm, İletiMerkezi vb.) entegrasyonu gereklidir. VİVA SİTE ücretsiz kullanım kapsamında SMS simülasyonu devrededir, kullanıcılar doğrudan doğrulanmış kabul edilir.
                </p>
              </div>

              {/* Sakin Ekle Formu */}
              <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
                <span className="text-xs font-bold text-[#294C3C] uppercase tracking-wider block">
                  + Yeni Sakin Kaydı
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                      Blok
                    </label>
                    <select
                      value={resBlock}
                      onChange={(e) => {
                        setResBlock(e.target.value);
                        setResApartment('1');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                    >
                      {selectedBlocks.map((blk) => (
                        <option key={blk} value={blk}>{blk} Blok</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                      Daire No
                    </label>
                    <select
                      value={resApartment}
                      onChange={(e) => setResApartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                    >
                      {Array.from(
                        { length: apartmentCounts[resBlock] || 15 },
                        (_, i) => (i + 1).toString()
                      ).map((apt) => (
                        <option key={apt} value={apt}>Daire {apt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Sakin Adı Soyadı (Örn: Caner Yılmaz)"
                    value={resFullName}
                    onChange={(e) => setResFullName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                  <input
                    type="text"
                    placeholder="Telefon (+90 53...)"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddResident}
                    className="px-4 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sakini Listeye Ekle</span>
                  </button>
                </div>
              </div>

              {/* Eklenen Sakinler Listesi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#294C3C]">
                    Eklenen Sakinler ({residents.length}):
                  </label>
                  {residents.length === 0 && (
                    <span className="text-[11px] text-[#26342C]/50 italic">
                      Henüz sakin eklenmedi (Sonradan yönetimden eklenebilir)
                    </span>
                  )}
                </div>

                {residents.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {residents.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#294C3C]">{r.block} Blok D:{r.apartment}</span>
                          <span className="text-[#26342C]/70">· {r.fullName}</span>
                          <span className="text-[10px] text-[#648875]">({r.phone})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveResident(r.id)}
                          className="text-red-500 hover:text-red-700 p-1"
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

          {/* ========================================== */}
          {/* STEP 6: KONTROL, ONAY VE SİTEYİ BAŞLAT     */}
          {/* ========================================== */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#294C3C] font-luxury">
                  Adım 6: Kurulum Özeti ve Temiz Veritabanı Onayı
                </h3>
                <p className="text-xs text-[#26342C]/65">
                  Aşağıdaki yapılandırmayı kontrol ediniz. Yeni site tamamen temiz, önceki siteden bağımsız ve izole olarak başlatılacaktır.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#F7F8F5] border-2 border-[#648875]/30 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                  <span className="text-[#26342C]/70">Site Adı:</span>
                  <strong className="text-sm font-luxury text-[#294C3C]">{siteName.toUpperCase()}</strong>
                </div>

                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                  <span className="text-[#26342C]/70">Konum & Nizamiye:</span>
                  <span className="font-semibold text-[#294C3C]">{district}, {city} · {securityPhone}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                  <span className="text-[#26342C]/70">Bloklar & Daire Sayısı:</span>
                  <span className="font-bold text-[#648875]">
                    {selectedBlocks.join(', ')} ({selectedBlocks.length} Blok · {selectedBlocks.reduce((acc, b) => acc + (apartmentCounts[b] || 15), 0)} Daire)
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                  <span className="text-[#26342C]/70">Yönetim Kurulu:</span>
                  <span className="font-semibold text-[#294C3C]">{managers.length} Yetkili Hesap</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-2">
                  <span className="text-[#26342C]/70">Güvenlik Personeli:</span>
                  <span className="font-semibold text-[#294C3C]">6 Nizamiye Görevlisi</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#26342C]/70">Tanımlı Sakinler:</span>
                  <span className="font-semibold text-[#294C3C]">{residents.length} Daire Sakini</span>
                </div>
              </div>

              {/* Data Isolation Guarantee */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="leading-relaxed">
                  <strong>Veri İzolasyonu Garantisi:</strong> Yeni site başlatıldığında sipariş, misafir ve kargo kayıtları sıfırlanmış olarak tamamen boş açılır. Eski sitenin verileriyle karışmaz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setStepError(null);
                setStep(step - 1);
              }}
              className="px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Geri</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewSiteModal(false)}
              className="px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-white transition-colors"
            >
              İptal
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 touch-target"
            >
              <span>Sonraki Adım</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSetup}
              className="px-6 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 touch-target"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Site Kurulumunu Tamamla ve Başlat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
