/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewOrderModal } from './NewOrderModal';
import { CARGO_CARRIERS } from '../../data/initialData';
import {
  ShieldCheck,
  ShoppingBag,
  PlusCircle,
  Users,
  Package,
  CheckCircle2,
  Clock,
  Home,
  Coffee,
  DoorOpen,
  Volume2,
  Check,
  Building,
  Car,
  LogOut,
  Sparkles,
  Search,
  UserCheck,
  UserPlus,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  X,
  Layers,
  Key,
  HomeIcon,
} from 'lucide-react';
import { OrderNotification, DeliveryPreference, CargoCarrier, CargoItem, GuestEntry } from '../../types';

interface PreparedCargoItem {
  id: string;
  carrier: CargoCarrier | string;
  block: string;
  apartment: string;
  recipientName: string;
  pieceCount: number;
  trackingCode?: string;
  notes?: string;
}

export const SecurityDashboard: React.FC = () => {
  const {
    siteInfo,
    siteResidents,
    // Orders Module (UNCHANGED)
    orderList,
    securityOrderAlert,
    confirmSecurityOrderApproval,
    respondToOrderDeliveryPreference,
    // Guest Module
    guestList,
    addSecurityGuest,
    checkInGuest,
    securityGuestAlert,
    dismissSecurityGuestAlert,
    // Cargo Module
    cargoList,
    addBatchCargo,
    deliverCargo,
    securityCargoAlert,
    confirmSecurityCargoSeen,
    setCurrentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'guests' | 'cargo'>('guests');
  const [quickBlock, setQuickBlock] = useState('A');
  const [quickApartment, setQuickApartment] = useState('1');
  const [quickResidentId, setQuickResidentId] = useState('');
  const [quickGuestType, setQuickGuestType] = useState<'yaya' | 'aracli'>('yaya');
  const [showQuickGuestFlow, setShowQuickGuestFlow] = useState(false);
  const [quickGuestId, setQuickGuestId] = useState<string | null>(null);
  const [quickPlate, setQuickPlate] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Available blocks from active site
  const siteBlocks = siteInfo.blocks?.map((b) => b.block) || ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'];

  // ==========================================
  // GUEST MODULE STATE (NİZAMİYE)
  // ==========================================
  const [guestSubTab, setGuestSubTab] = useState<'expected' | 'history'>('expected');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [showNewGuestModal, setShowNewGuestModal] = useState(false);

  // New Guest Form Fields (Zorunlu & İsteğe Bağlı)
  const [newGuestType, setNewGuestType] = useState<'yaya' | 'aracli'>('yaya');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestBlock, setGuestBlock] = useState(siteBlocks[0] || 'A');
  const [guestApartment, setGuestApartment] = useState('1');
  const [guestPlate, setGuestPlate] = useState(''); // İsteğe bağlı
  const [guestVehicleModel, setGuestVehicleModel] = useState(''); // İsteğe bağlı
  const [guestVehicleColor, setGuestVehicleColor] = useState(''); // İsteğe bağlı
  const [guestNotes, setGuestNotes] = useState(''); // İsteğe bağlı
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const [guestSuccessMsg, setGuestSuccessMsg] = useState<string | null>(null);

  // Find resident of selected block & apartment
  const getResidentForUnit = (blk: string, apt: string) => {
    const found = siteResidents.find((r) => r.block === blk && r.apartment === apt);
    return found ? found.fullName : 'Site Sakini';
  };

  const handleCreateSecurityGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestFormError(null);

    if (!guestFirstName.trim() || !guestLastName.trim()) {
      setGuestFormError('Misafir adı ve soyadı zorunludur.');
      return;
    }
    if (!guestBlock || !guestApartment) {
      setGuestFormError('Gidilecek blok ve daire numarası zorunludur.');
      return;
    }

    const residentName = getResidentForUnit(guestBlock, guestApartment);

    const res = addSecurityGuest({
      guestType: newGuestType,
      firstName: guestFirstName.trim(),
      lastName: guestLastName.trim(),
      block: guestBlock,
      apartment: guestApartment,
      residentName,
      plateNumber: guestPlate.trim() || undefined,
      vehicleBrandModel: guestVehicleModel.trim() || undefined,
      vehicleColor: guestVehicleColor.trim() || undefined,
      notes: guestNotes.trim() || undefined,
    });

    if (res.success) {
      setGuestSuccessMsg(`${guestFirstName} ${guestLastName} girişi kaydedildi ve içeri alındı.`);
      setShowNewGuestModal(false);
      setGuestFirstName('');
      setGuestLastName('');
      setGuestPlate('');
      setGuestVehicleModel('');
      setGuestVehicleColor('');
      setGuestNotes('');
      setGuestSubTab('history');
      setTimeout(() => setGuestSuccessMsg(null), 4000);
    } else {
      setGuestFormError(res.error || 'Misafir kaydedilemedi.');
    }
  };

  // Filter Guests (Arama: Plaka, Misafir Adı veya Daire No)
  const filteredGuests = guestList.filter((g) => {
    const q = guestSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchName = g.fullName.toLowerCase().includes(q);
    const matchPlate = g.plateNumber ? g.plateNumber.toLowerCase().includes(q) : false;
    const matchApt = `${g.block}${g.apartment}`.toLowerCase().includes(q) || g.apartment.includes(q);
    const matchResident = g.residentName.toLowerCase().includes(q);
    return matchName || matchPlate || matchApt || matchResident;
  });

  const expectedGuests = filteredGuests.filter((g) => g.status === 'bekleniyor');
  const historyGuests = filteredGuests.filter((g) => g.status === 'giris_yapti');

  // ==========================================
  // CARGO MODULE STATE (GÜVENLİK KARGO KABUL)
  // ==========================================
  const [cargoSubTab, setCargoSubTab] = useState<'eve' | 'emanet' | 'bekleyen'>('eve');
  const [selectedCarrier, setSelectedCarrier] = useState<CargoCarrier>(CARGO_CARRIERS[0]);
  const [selectedCargoBlock, setSelectedCargoBlock] = useState(siteBlocks[0] || 'A');
  const [selectedCargoApartment, setSelectedCargoApartment] = useState('1');
  const [cargoPieceCount, setCargoPieceCount] = useState<number>(1);
  const [cargoTrackingCode, setCargoTrackingCode] = useState('');
  const [cargoNotes, setCargoNotes] = useState('');

  // Hazırlık Sepeti / Listesi
  const [preparedCargoList, setPreparedCargoList] = useState<PreparedCargoItem[]>([]);
  const [cargoSuccessMsg, setCargoSuccessMsg] = useState<string | null>(null);
  const [cargoSearchQuery, setCargoSearchQuery] = useState('');

  // Max apartments for current block
  const blockConfig = siteInfo.blocks?.find((b) => b.block === selectedCargoBlock);
  const maxApartmentCount = blockConfig ? blockConfig.apartmentCount : 15;

  // Ekle butonuna bas
  const handleAddToBatch = () => {
    const recipient = getResidentForUnit(selectedCargoBlock, selectedCargoApartment);
    const newItem: PreparedCargoItem = {
      id: `prep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      carrier: selectedCarrier,
      block: selectedCargoBlock,
      apartment: selectedCargoApartment,
      recipientName: recipient,
      pieceCount: Number(cargoPieceCount) || 1,
      trackingCode: cargoTrackingCode.trim() || undefined,
      notes: cargoNotes.trim() || undefined,
    };
    setPreparedCargoList((prev) => [...prev, newItem]);
    setCargoPieceCount(1);
    setCargoTrackingCode('');
    setCargoNotes('');
  };

  const handleRemoveFromBatch = (id: string) => {
    setPreparedCargoList((prev) => prev.filter((item) => item.id !== id));
  };

  // TOPLU KAYDI TAMAMLA
  const handleDispatchBatch = () => {
    if (preparedCargoList.length === 0) return;

    addBatchCargo(
      preparedCargoList.map((item) => ({
        carrier: item.carrier,
        block: item.block,
        apartment: item.apartment,
        recipientName: item.recipientName,
        pieceCount: item.pieceCount,
        notes: item.notes,
        trackingCode: item.trackingCode,
      }))
    );

    setCargoSuccessMsg(`${preparedCargoList.length} adet kargo girişi kaydedildi ve dairelere bildirim gönderildi.`);
    setPreparedCargoList([]);
    setTimeout(() => setCargoSuccessMsg(null), 4000);
  };

  // Cargo 3 Tab Filters
  const filteredAllCargo = cargoList.filter((c) => {
    const q = cargoSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchCarrier = c.carrier.toLowerCase().includes(q);
    const matchApt = `${c.block}${c.apartment}`.toLowerCase().includes(q) || c.apartment.includes(q);
    const matchRecipient = c.recipientName.toLowerCase().includes(q);
    const matchId = c.id.toLowerCase().includes(q);
    return matchCarrier || matchApt || matchRecipient || matchId;
  });

  // 1. Eve gönderilecekler
  const cargoEveGonderilecekler = filteredAllCargo.filter(
    (c) => c.residentPreference === 'eve_gonderilsin'
  );
  // 2. Güvenlikte emanet kalacaklar
  const cargoEmanetKalacaklar = filteredAllCargo.filter(
    (c) => c.residentPreference === 'emanet_kalsin'
  );
  // 3. Yanıt bekleyenler
  const cargoYanitBekleyenler = filteredAllCargo.filter(
    (c) => !c.residentPreference
  );

  const getPreferenceLabel = (pref?: DeliveryPreference) => {
    switch (pref) {
      case 'evdeyim':
        return { label: 'EVDEYİM (Daireye Çıkabilir)', icon: Home, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'cafedeyim':
        return { label: 'CAFEDEYİM (Lounge/Kafeye)', icon: Coffee, color: 'text-amber-800 bg-amber-50 border-amber-300' };
      case 'kapiya_biraksinlar':
        return { label: 'KAPIYA BIRAKSINLAR (Daire Önü)', icon: DoorOpen, color: 'text-blue-800 bg-blue-50 border-blue-200' };
      default:
        return { label: 'Cevap Bekleniyor', icon: Clock, color: 'text-neutral-600 bg-neutral-100 border-neutral-200' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26342C]">
      {/* ========================================================= */}
      {/* 1. ORDERS ALARM POPUP (PROTECTED - KORUMA KURALI)        */}
      {/* ========================================================= */}
      {securityOrderAlert && securityOrderAlert.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-[#FFFFFF] border-4 border-[#294C3C] w-full max-w-md rounded-3xl p-6 shadow-2xl text-center space-y-5 ring-8 ring-[#648875]/20 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-[#648875]/15 border-2 border-[#294C3C] flex items-center justify-center mx-auto text-[#294C3C]">
              <Volume2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#294C3C] text-white">
                SİPARİŞ TERCİHİ GELDİ
              </span>
              <h2 className="text-2xl font-black font-luxury text-[#294C3C] pt-2">
                {securityOrderAlert.order.block}{securityOrderAlert.order.apartment} – {securityOrderAlert.order.residentName.toUpperCase()}
              </h2>
              <p className="text-xs text-[#26342C]/70">
                Firma: <strong className="text-[#648875]">{securityOrderAlert.order.company}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875] space-y-1">
              <span className="text-[11px] font-bold text-[#26342C]/70 uppercase tracking-wider block">
                Sakinin Teslimat Tercihi:
              </span>
              <p className="text-lg font-black text-[#294C3C] uppercase tracking-wide">
                TERCİH: {securityOrderAlert.order.deliveryPreference === 'evdeyim' ? 'EVDEYİM' : securityOrderAlert.order.deliveryPreference === 'cafedeyim' ? 'CAFEDEYİM' : 'KAPIYA BIRAKSINLAR'}
              </p>
              <p className="text-xs text-[#648875] font-semibold">
                {securityOrderAlert.order.deliveryPreference === 'evdeyim'
                  ? 'Kurye doğrudan daireye yönlendirilebilir.'
                  : securityOrderAlert.order.deliveryPreference === 'cafedeyim'
                  ? 'Kurye veya sipariş site içi Viva Lounge / Kafeye yönlendirilmeli.'
                  : 'Kurye daire kapısının önüne bırakabilir.'}
              </p>
            </div>

            <p className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1.5">
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>Siz TAMAM butonuna basana kadar sesli uyarı çalmaya devam eder.</span>
            </p>

            <button
              onClick={() => confirmSecurityOrderApproval(securityOrderAlert.order.id)}
              className="w-full py-4 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 touch-target"
            >
              <Check className="w-5 h-5" />
              <span>TAMAM (Bildirimi Onayla & Sesi Sustur)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SAKİN KARGO TERCİHİ GELDİ ALARMI                      */}
      {/* ========================================================= */}
      {securityCargoAlert && securityCargoAlert.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-[#FFFFFF] border-4 border-[#294C3C] w-full max-w-md rounded-3xl p-6 shadow-2xl text-center space-y-4 ring-8 ring-[#648875]/20">
            <div className="w-14 h-14 rounded-2xl bg-[#648875]/15 border-2 border-[#294C3C] flex items-center justify-center mx-auto text-[#294C3C]">
              <Package className="w-7 h-7 text-[#294C3C]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#294C3C] text-white">
                KARGO TERCİHİ GELDİ
              </span>
              <h2 className="text-xl font-bold font-luxury text-[#294C3C] pt-2">
                {securityCargoAlert.cargo.block}{securityCargoAlert.cargo.apartment} – {securityCargoAlert.cargo.recipientName}
              </h2>
              <p className="text-xs text-[#26342C]/70">
                Firma: <strong className="text-[#648875]">{securityCargoAlert.cargo.carrier}</strong> ({securityCargoAlert.cargo.pieceCount} Adet)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875] space-y-1">
              <span className="text-[10px] font-bold text-[#26342C]/70 uppercase tracking-wider block">
                Sakinin Teslimat Tercihi:
              </span>
              <p className="text-base font-black text-[#294C3C] uppercase tracking-wide">
                TERCİH:{' '}
                {securityCargoAlert.cargo.residentPreference === 'eve_gonderilsin'
                  ? 'EVE GÖNDERİLSİN'
                  : 'GÜVENLİKTE EMANET KALSIN'}
              </p>
              {securityCargoAlert.cargo.smsCode && (
                <p className="text-xs font-mono font-bold text-[#294C3C] bg-white p-1 rounded-md border border-[#DDE5DF] inline-block">
                  Sakin SMS Kodu: {securityCargoAlert.cargo.smsCode}
                </p>
              )}
            </div>

            <button
              onClick={() => confirmSecurityCargoSeen(securityCargoAlert.cargo.id)}
              className="w-full py-3.5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 touch-target"
            >
              <Check className="w-4 h-4" />
              <span>TAMAM (Bildirimi Onayla)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SAKİN YENİ MİSAFİR BİLDİRDİ ALARMI                     */}
      {/* ========================================================= */}
      {securityGuestAlert && securityGuestAlert.active && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4">
          <div className="bg-white border-2 border-[#294C3C] rounded-3xl p-5 shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C] shrink-0 mt-0.5">
                <Users className="w-5 h-5 text-[#294C3C]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#294C3C] text-white">
                  Yeni Misafir Bildirimi
                </span>
                <h4 className="text-sm font-bold text-[#294C3C] mt-1">
                  {securityGuestAlert.guest.fullName}
                </h4>
                <p className="text-xs text-[#26342C]/70">
                  Daire: <strong>{securityGuestAlert.guest.block}{securityGuestAlert.guest.apartment}</strong> ({securityGuestAlert.guest.residentName})
                </p>
                {securityGuestAlert.guest.plateNumber && (
                  <p className="text-xs text-[#648875] font-semibold">
                    Plaka: {securityGuestAlert.guest.plateNumber}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={dismissSecurityGuestAlert}
              className="px-3 py-1.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar with UNIVERSAL "Ana Menüye Dön" & Safe Logout */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DDE5DF] px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <ShieldCheck className="w-5 h-5 text-[#294C3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-luxury font-bold text-[#294C3C]">
                  {siteInfo.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875] text-white">
                  Güvenlik Konsolu
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70">
                Nizamiye & Kurye & Misafir Karşılama Masası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* UNIVERSAL "Ana Menüye Dön" BUTTON (Requirement 1) */}
            <button
              onClick={() => setCurrentRole('guest')}
              className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
              title="Ana Menüye / Rol Seçimine Dön"
            >
              <HomeIcon className="w-3.5 h-3.5 text-[#648875]" />
              <span className="hidden sm:inline">Ana Menüye Dön</span>
            </button>

            {/* SAFE LOGOUT ICON (Does NOT delete site records) */}
            <button
              onClick={() => setCurrentRole('guest')}
              title="Güvenli Çıkış (Kayıtlar silinmez)"
              className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Two large, low-effort actions for the gate staff */}
      <section className="max-w-6xl mx-auto w-full px-4 pt-4 grid grid-cols-2 gap-3">
        <button onClick={() => { setActiveTab('guests'); setShowQuickGuestFlow(true); }} className="min-h-[112px] rounded-3xl bg-[#648875] text-white shadow-lg flex flex-col items-center justify-center gap-2 active:scale-[0.98]">
          <Users className="w-9 h-9"/><span className="text-xl font-black tracking-wide">MİSAFİR</span><span className="text-[10px] font-semibold">Daireye yönlendir</span>
        </button>
        <button onClick={() => { setActiveTab('orders'); setIsNewOrderModalOpen(true); }} className="min-h-[112px] rounded-3xl bg-[#294C3C] text-white shadow-lg flex flex-col items-center justify-center gap-2 active:scale-[0.98]">
          <ShoppingBag className="w-9 h-9"/><span className="text-xl font-black tracking-wide">SİPARİŞ</span><span className="text-[10px] font-semibold">Kurye kaydı</span>
        </button>
      </section>

      {showQuickGuestFlow && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-3">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black text-[#294C3C]">Hızlı Misafir Yönlendirme</h2><button onClick={()=>setShowQuickGuestFlow(false)} className="text-2xl">×</button></div>
            <p className="text-sm text-gray-600">Önce daireyi bul. Misafir adı ve plaka şu anda zorunlu değil; daha sonra kayda eklenebilir.</p>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>setQuickGuestType('yaya')} className={`p-3 rounded-xl border font-bold ${quickGuestType==='yaya'?'bg-[#294C3C] text-white':'bg-gray-50'}`}>YAYA</button><button onClick={()=>setQuickGuestType('aracli')} className={`p-3 rounded-xl border font-bold ${quickGuestType==='aracli'?'bg-[#294C3C] text-white':'bg-gray-50'}`}>ARAÇLI</button></div>
            <div><p className="text-sm font-bold mb-2">1. Blok seç</p><div className="grid grid-cols-4 gap-2">{siteBlocks.map(b=><button key={b} onClick={()=>{setQuickBlock(b);setQuickApartment('1');setQuickResidentId('')}} className={`p-3 rounded-xl font-black ${quickBlock===b?'bg-[#294C3C] text-white':'bg-[#E8F0EB] text-[#294C3C]'}`}>{b}</button>)}</div></div>
            <div><p className="text-sm font-bold mb-2">2. Daire seç</p><div className="grid grid-cols-5 gap-2">{Array.from({length:siteInfo.blocks?.find(b=>b.block===quickBlock)?.apartmentCount||15},(_,i)=>String(i+1)).map(a=><button key={a} onClick={()=>{setQuickApartment(a);setQuickResidentId('')}} className={`p-3 rounded-xl font-bold ${quickApartment===a?'bg-[#648875] text-white':'bg-gray-100 text-[#294C3C]'}`}>{a}</button>)}</div></div>
            <div><p className="text-sm font-bold mb-2">3. Sakin seç</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{siteResidents.filter(r=>r.block===quickBlock&&r.apartment===quickApartment).map(r=><button key={r.id} onClick={()=>setQuickResidentId(r.id)} className={`p-3 rounded-xl border text-left font-bold ${quickResidentId===r.id?'bg-[#294C3C] text-white border-[#294C3C]':'bg-white text-[#294C3C]'}`}>{r.fullName}</button>)}</div>{!siteResidents.some(r=>r.block===quickBlock&&r.apartment===quickApartment)&&<p className="text-xs text-amber-700">Bu daireye henüz sakin kaydı yapılmamış.</p>}</div>
            <button disabled={!quickResidentId} onClick={()=>{const r=siteResidents.find(x=>x.id===quickResidentId);if(!r)return;const result=addSecurityGuest({guestType:quickGuestType,firstName:'Misafir',lastName:'(Bilgi sonradan girilecek)',block:quickBlock,apartment:quickApartment,residentName:r.fullName});if(result.success&&result.guest){setQuickGuestId(result.guest.id);setShowQuickGuestFlow(false);setGuestSuccessMsg(`${r.fullName} · ${quickBlock} Blok Daire ${quickApartment} için hızlı giriş kaydı oluşturuldu.`);setGuestSubTab('history');}}} className="w-full py-4 rounded-2xl bg-[#294C3C] text-white font-black disabled:opacity-40">SAKİNİ SEÇ – GİRİŞİ KAYDET</button>
            <p className="text-[10px] text-gray-500">Bu sürümde bu işlem yerel kayıt oluşturur. Sakin telefonuna gerçek zamanlı arama/bildirim ve güvenlik cihazlarına ortak alarm için sunucu + push altyapısı henüz bağlı değildir.</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-[#FFFFFF] border-b border-[#DDE5DF]">
        <div className="max-w-6xl mx-auto px-4 flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#648875]" />
            <span>Sipariş & Kurye Takibi</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
              {orderList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'guests'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Users className="w-4 h-4 text-[#648875]" />
            <span>Misafir Girişleri</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
              {guestList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cargo')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'cargo'
                ? 'border-[#294C3C] text-[#294C3C]'
                : 'border-transparent text-[#26342C]/60 hover:text-[#26342C]'
            }`}
          >
            <Package className="w-4 h-4 text-[#648875]" />
            <span>Kargo Kabul & Emanet</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
              {cargoList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: SİPARİŞLER (PROTECTED - KESİNLİKLE MÜDAHALE EDİLMEDİ) */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider">
                  Kurye Giriş İşlemleri
                </span>
                <h2 className="text-lg font-bold font-luxury text-[#294C3C]">
                  Nizamiye Kurye ve Paket Karşılama
                </h2>
                <p className="text-xs text-[#26342C]/70">
                  Site kapısına gelen siparişler için hemen kayıt oluşturup sakine tercih bildirimini iletin.
                </p>
              </div>

              <button
                onClick={() => setIsNewOrderModalOpen(true)}
                className="py-4 px-6 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2.5 touch-target active:scale-95"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>YENİ SİPARİŞ GELDİ</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
                  Kayıtlı Siparişler ({orderList.length})
                </h3>
                <span className="text-[11px] text-[#26342C]/60">
                  Gerçek zamanlı sakin tercih takibi
                </span>
              </div>

              {orderList.length === 0 ? (
                <div className="p-10 sm:p-12 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-center mx-auto text-[#648875]">
                    <ShoppingBag className="w-7 h-7 text-[#648875]" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-sm font-bold text-[#294C3C]">Henüz Kayıtlı Sipariş Yok</h4>
                    <p className="text-xs text-[#26342C]/65 leading-relaxed">
                      Kapıya yeni bir kurye geldiğinde yukarıdaki <strong>"YENİ SİPARİŞ GELDİ"</strong> butonuna basarak firma, blok ve sakin seçimi yapabilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsNewOrderModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#648875] text-white text-xs font-bold hover:bg-[#294C3C] transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>İlk Siparişi Kaydet</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderList.map((ord) => {
                    const prefInfo = getPreferenceLabel(ord.deliveryPreference);
                    const PrefIcon = prefInfo.icon;

                    return (
                      <div
                        key={ord.id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-[#294C3C] text-white">
                              {ord.company}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-[#294C3C]">
                                {ord.block}{ord.apartment} – {ord.residentName}
                              </h4>
                              <p className="text-[11px] text-[#26342C]/60">
                                Kayıt Zamanı: {ord.createdAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status === 'bekleniyor' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                <span>Sakin cevabı bekleniyor</span>
                              </span>
                            )}

                            {ord.status === 'cevaplandi' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                                <span>Sakin cevap verdi / Onay Bekliyor</span>
                              </span>
                            )}

                            {ord.status === 'onaylandi' && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#648875]/15 text-[#294C3C] border border-[#648875]/40 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#294C3C]" />
                                <span>İşlem Onaylandı</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <PrefIcon className="w-4 h-4 text-[#648875]" />
                            <span className="font-semibold text-[#26342C]/80">Teslimat Tercihi:</span>
                            <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${prefInfo.color}`}>
                              {prefInfo.label}
                            </span>
                          </div>

                          {ord.answeredAt && (
                            <span className="text-[11px] text-[#26342C]/60">
                              Cevaplandı: {ord.answeredAt}
                            </span>
                          )}
                        </div>

                        {ord.status === 'cevaplandi' && !ord.securityApproved && (
                          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-sky-600" />
                              <span>Sakin yanıt verdi! Kuryeyi bilgilendirip işlemi tamamlayınız:</span>
                            </span>
                            <button
                              onClick={() => confirmSecurityOrderApproval(ord.id)}
                              className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>TAMAM (Onayla)</span>
                            </button>
                          </div>
                        )}

                        {ord.status === 'bekleniyor' && (
                          <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs flex flex-wrap items-center justify-between gap-2 text-neutral-600">
                            <span className="text-[11px] font-semibold">
                              (Demo Test Simülatörü): Sakin yerine cevapla:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => respondToOrderDeliveryPreference(ord.id, 'evdeyim')}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-neutral-300 text-[10px] font-bold text-neutral-800 transition-colors"
                              >
                                Evdeyim
                              </button>
                              <button
                                onClick={() => respondToOrderDeliveryPreference(ord.id, 'cafedeyim')}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-600 hover:text-white border border-neutral-300 text-[10px] font-bold text-neutral-800 transition-colors"
                              >
                                Cafedeyim
                              </button>
                              <button
                                onClick={() => respondToOrderDeliveryPreference(ord.id, 'kapiya_biraksinlar')}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-neutral-300 text-[10px] font-bold text-neutral-800 transition-colors"
                              >
                                Kapıya Bıraksınlar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MİSAFİR MODÜLÜ (GÜVENLİK / NİZAMİYE EKRANI)        */}
        {/* ========================================================= */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider">
                  Nizamiye Misafir Karşılama
                </span>
                <h2 className="text-lg font-bold font-luxury text-[#294C3C]">
                  Misafir Giriş Kontrol & Geçiş Yönetimi
                </h2>
                <p className="text-xs text-[#26342C]/70">
                  Önceden bildirilen misafirleri onaylayın veya kapıda yeni araçlı/yaya misafir kaydı oluşturun.
                </p>
              </div>

              <button
                onClick={() => setShowQuickGuestFlow(true)}
                className="py-3.5 px-5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 touch-target"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hızlı Misafir Yönlendirme</span>
              </button>
            </div>

            {guestSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{guestSuccessMsg}</span>
              </div>
            )}

            {/* Arama Kutusu: Plaka, Misafir Adı veya Daire No */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE5DF]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#26342C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Plaka, misafir adı veya daire no ile ara... (Örn: '34 VİV', 'Selim' veya '12')"
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C]"
                />
                {guestSearchQuery && (
                  <button
                    onClick={() => setGuestSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#26342C]/50 hover:text-[#26342C]"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Sub-tabs: Beklenen Misafirler vs Geçmiş Kayıtlar */}
              <div className="flex items-center gap-1.5 p-1 bg-[#F7F8F5] rounded-xl border border-[#DDE5DF] self-start sm:self-auto">
                <button
                  onClick={() => setGuestSubTab('expected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    guestSubTab === 'expected'
                      ? 'bg-[#294C3C] text-white shadow-xs'
                      : 'text-[#26342C]/70 hover:text-[#26342C]'
                  }`}
                >
                  Beklenen Misafirler ({expectedGuests.length})
                </button>
                <button
                  onClick={() => setGuestSubTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    guestSubTab === 'history'
                      ? 'bg-[#294C3C] text-white shadow-xs'
                      : 'text-[#26342C]/70 hover:text-[#26342C]'
                  }`}
                >
                  Geçmiş Girişler ({historyGuests.length})
                </button>
              </div>
            </div>

            {/* List Content */}
            {guestSubTab === 'expected' ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
                  Beklenen Misafirler ({expectedGuests.length})
                </h3>

                {expectedGuests.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-2">
                    <Users className="w-8 h-8 text-[#648875] mx-auto opacity-70" />
                    <p className="text-xs text-[#26342C]/60">
                      Şu anda giriş bekleyen bir misafir bildirimi bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expectedGuests.map((g) => (
                      <div
                        key={g.id}
                        className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#294C3C]">{g.fullName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
                              {g.guestType === 'aracli' ? 'Araçlı' : 'Yaya'}
                            </span>
                            {g.source === 'sakin' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                                Sakin Bildirimi
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#26342C]/75">
                            Gidilecek Daire:{' '}
                            <strong className="text-[#294C3C]">{g.block} Blok D:{g.apartment}</strong> ({g.residentName})
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#26342C]/60 pt-0.5">
                            <span>Beklenen: <strong>{g.expectedDate} {g.expectedTime}</strong></span>
                            {g.plateNumber && (
                              <span>Plaka: <strong className="text-[#648875]">{g.plateNumber}</strong></span>
                            )}
                            {g.vehicleBrandModel && <span>Araç: {g.vehicleBrandModel}</span>}
                            {g.vehicleColor && <span>Renk: {g.vehicleColor}</span>}
                          </div>

                          {g.parkingEscort && (
                            <p className="text-[11px] text-[#648875] font-semibold">
                              Otopark Yönlendirmesi: {g.parkingEscort === 'eslik_edin' ? 'Lütfen eşlik edip yerimi gösterin' : 'Eşlik gerekmez, yerini biliyor'}
                            </p>
                          )}

                          {g.notes && (
                            <p className="text-[11px] text-[#26342C]/70 italic bg-[#F7F8F5] p-2 rounded-lg border border-[#DDE5DF]">
                              Not: "{g.notes}"
                            </p>
                          )}
                        </div>

                        {/* Action: İçeri Al / Giriş Yaptı */}
                        <div className="shrink-0">
                          <button
                            onClick={() => checkInGuest(g.id)}
                            className="px-5 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 touch-target"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>İçeri Al & Giriş Ver</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
                  Geçmiş Giriş Kayıtları ({historyGuests.length})
                </h3>

                {historyGuests.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-2">
                    <p className="text-xs text-[#26342C]/60">
                      Henüz geçmiş bir misafir girişi kaydedilmedi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {historyGuests.map((g) => (
                      <div
                        key={g.id}
                        className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DDE5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#294C3C]">{g.fullName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#648875]/15 text-[#294C3C]">
                              {g.guestType === 'aracli' ? 'Araçlı' : 'Yaya'}
                            </span>
                            {g.plateNumber && (
                              <span className="font-bold text-[#648875]">({g.plateNumber})</span>
                            )}
                          </div>
                          <p className="text-[#26342C]/70">
                            Ziyaret: {g.block} Blok D:{g.apartment} ({g.residentName})
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                            Giriş Saati: {g.entryTime || 'Kayıtlı'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal: Yeni Misafir Kaydı */}
            {showNewGuestModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
                <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 text-[#26342C] max-h-[92vh] overflow-y-auto">
                  <div className="flex items-start justify-between border-b border-[#DDE5DF] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                        <UserPlus className="w-5 h-5 text-[#294C3C]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                          Yeni Misafir Giriş Kaydı
                        </h3>
                        <p className="text-xs text-[#26342C]/65">
                          Kapıya gelen ziyaretçi için giriş formu
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNewGuestModal(false)}
                      className="text-[#26342C]/40 hover:text-[#26342C] p-1.5 rounded-full hover:bg-[#F7F8F5] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {guestFormError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{guestFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateSecurityGuest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#294C3C] mb-1.5">
                        Misafir Türü *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewGuestType('yaya')}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            newGuestType === 'yaya'
                              ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                              : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>1. Yaya Misafir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewGuestType('aracli')}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            newGuestType === 'aracli'
                              ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                              : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                          }`}
                        >
                          <Car className="w-4 h-4" />
                          <span>2. Araçlı Misafir</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                          Misafir Adı *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Mehmet"
                          value={guestFirstName}
                          onChange={(e) => setGuestFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                          Misafir Soyadı *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Kaya"
                          value={guestLastName}
                          onChange={(e) => setGuestLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                          Gidilecek Blok *
                        </label>
                        <select
                          value={guestBlock}
                          onChange={(e) => setGuestBlock(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C]"
                        >
                          {siteBlocks.map((blk) => (
                            <option key={blk} value={blk}>{blk} Blok</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                          Daire Numarası *
                        </label>
                        <select
                          value={guestApartment}
                          onChange={(e) => setGuestApartment(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C]"
                        >
                          {Array.from({ length: maxApartmentCount }, (_, i) => (i + 1).toString()).map((apt) => {
                            const res = getResidentForUnit(guestBlock, apt);
                            return (
                              <option key={apt} value={apt}>
                                Daire {apt} ({res})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
                      <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider block">
                        Araç & Not Bilgileri (İsteğe Bağlı)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                            Araç Plakası
                          </label>
                          <input
                            type="text"
                            placeholder="34 ABC 123"
                            value={guestPlate}
                            onChange={(e) => setGuestPlate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C] uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                            Marka / Model
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Renault Megane"
                            value={guestVehicleModel}
                            onChange={(e) => setGuestVehicleModel(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                            Renk
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Beyaz"
                            value={guestVehicleColor}
                            onChange={(e) => setGuestVehicleColor(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                          Güvenlik Notu
                        </label>
                        <input
                          type="text"
                          placeholder="Örn: Misafir otoparkına yönlendirildi"
                          value={guestNotes}
                          onChange={(e) => setGuestNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewGuestModal(false)}
                        className="flex-1 py-3 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
                      >
                        Vazgeç
                      </button>

                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md touch-target flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kaydet & İçeri Al</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KARGO MODÜLÜ (3 SEKME: EVE, EMANET, YANIT BEKLEYEN) */}
        {/* ========================================================= */}
        {activeTab === 'cargo' && (
          <div className="space-y-6">
            {/* Güvenlik Kargo Kabul & Hazırlık Bölümü */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider">
                    Kargo Kabul Masası
                  </span>
                  <h2 className="text-base font-bold font-luxury text-[#294C3C]">
                    Adım Adım Paket Kabul & Toplu Bildirim
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#26342C]/65">
                  12 Kargo Firması Destekli
                </span>
              </div>

              {cargoSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{cargoSuccessMsg}</span>
                </div>
              )}

              {/* Step 1: Kargo Firması Seç (12 Seçenek) */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span>Kargo Firmasını Seçiniz *</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {CARGO_CARRIERS.map((car) => {
                    const isSelected = selectedCarrier === car;
                    return (
                      <button
                        key={car}
                        type="button"
                        onClick={() => setSelectedCarrier(car)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center touch-target ${
                          isSelected
                            ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                            : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                        }`}
                      >
                        {car}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 & 3 & 4: Blok, Daire Numarası ve Adet Seçimi */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* 2. Blok Seç */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    <span>Blok Seç *</span>
                  </label>
                  <select
                    value={selectedCargoBlock}
                    onChange={(e) => {
                      setSelectedCargoBlock(e.target.value);
                      setSelectedCargoApartment('1');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C]"
                  >
                    {siteBlocks.map((blk) => (
                      <option key={blk} value={blk}>{blk} Blok</option>
                    ))}
                  </select>
                </div>

                {/* 3. Daire Numarası Seç */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    <span>Daire Numarası Seç *</span>
                  </label>
                  <select
                    value={selectedCargoApartment}
                    onChange={(e) => setSelectedCargoApartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C]"
                  >
                    {Array.from({ length: maxApartmentCount }, (_, i) => (i + 1).toString()).map((apt) => {
                      const res = getResidentForUnit(selectedCargoBlock, apt);
                      return (
                        <option key={apt} value={apt}>
                          Daire {apt} — {res}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 4. Kargo Takip Kodu (İsteğe Bağlı) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                      4
                    </span>
                    <span>Takip No (Opsiyonel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 2718903"
                    value={cargoTrackingCode}
                    onChange={(e) => setCargoTrackingCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                  />
                </div>

                {/* 5. Kargo Adedi & Ekle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                      5
                    </span>
                    <span>Kargo Adedi *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={cargoPieceCount}
                      onChange={(e) => setCargoPieceCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs font-bold text-[#294C3C] text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddToBatch}
                      className="px-4 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hazırlık Listesi & TOPLU KAYDI TAMAMLA (Requirement 9) */}
              {preparedCargoList.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875]/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#294C3C] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#648875]" />
                      <span>Kabul Hazırlık Sepeti ({preparedCargoList.length} Daire/Paket)</span>
                    </span>
                    <span className="text-[11px] text-[#26342C]/65">
                      Hatalı kayıtları listeden silebilirsiniz
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {preparedCargoList.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#648875]/15 text-[#294C3C] font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-[#294C3C]">{item.carrier}</span>
                            <span className="mx-1 text-[#26342C]/40">·</span>
                            <strong className="text-[#648875]">{item.block} Blok D:{item.apartment}</strong>
                            <span className="mx-1 text-[#26342C]/40">·</span>
                            <span className="text-[#26342C]/80">{item.recipientName}</span>
                            {item.trackingCode && (
                              <span className="ml-1 text-[10px] font-mono text-[#26342C]/60">
                                (Takip: {item.trackingCode})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#294C3C] text-white text-[10px] font-bold">
                            {item.pieceCount} Adet
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromBatch(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title="Listeden Çıkar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PROMINENT BUTTON: TOPLU KAYDI TAMAMLA */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleDispatchBatch}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 touch-target"
                    >
                      <Send className="w-4 h-4 text-emerald-300" />
                      <span>TOPLU KAYDI TAMAMLA ({preparedCargoList.length} Paket)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3 SEPARATE TABS FOR CARGO (Requirement 9):
                1. Eve gönderilecekler
                2. Güvenlikte emanet kalacaklar
                3. Yanıt bekleyenler
            */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#DDE5DF]">
                {/* 3 Tab Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-[#F7F8F5] rounded-xl border border-[#DDE5DF] overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setCargoSubTab('eve')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      cargoSubTab === 'eve'
                        ? 'bg-[#294C3C] text-white shadow-xs'
                        : 'text-[#26342C]/70 hover:text-[#26342C]'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>1. Eve Gönderilecekler ({cargoEveGonderilecekler.length})</span>
                  </button>

                  <button
                    onClick={() => setCargoSubTab('emanet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      cargoSubTab === 'emanet'
                        ? 'bg-[#294C3C] text-white shadow-xs'
                        : 'text-[#26342C]/70 hover:text-[#26342C]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>2. Güvenlikte Emanet ({cargoEmanetKalacaklar.length})</span>
                  </button>

                  <button
                    onClick={() => setCargoSubTab('bekleyen')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      cargoSubTab === 'bekleyen'
                        ? 'bg-[#294C3C] text-white shadow-xs'
                        : 'text-[#26342C]/70 hover:text-[#26342C]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>3. Yanıt Bekleyenler ({cargoYanitBekleyenler.length})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[#26342C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Kargo ara... (Firma, Daire)"
                    value={cargoSearchQuery}
                    onChange={(e) => setCargoSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs text-[#26342C]"
                  />
                </div>
              </div>

              {/* Render items based on active sub tab */}
              {(() => {
                const currentSubList =
                  cargoSubTab === 'eve'
                    ? cargoEveGonderilecekler
                    : cargoSubTab === 'emanet'
                    ? cargoEmanetKalacaklar
                    : cargoYanitBekleyenler;

                if (currentSubList.length === 0) {
                  return (
                    <div className="p-10 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-2">
                      <Package className="w-8 h-8 text-[#648875] mx-auto opacity-70" />
                      <p className="text-xs text-[#26342C]/60">
                        {cargoSubTab === 'eve'
                          ? 'Daire kapısına çıkarılacak paket bulunmuyor.'
                          : cargoSubTab === 'emanet'
                          ? 'Güvenlik emanet odasında bekleyen paket bulunmuyor.'
                          : 'Sakin yanıtı bekleyen kargo bulunmuyor.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {currentSubList.map((cargo) => (
                      <div
                        key={cargo.id}
                        className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-2.5">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-[#294C3C] text-white">
                              {cargo.carrier}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-[#294C3C]">
                                {cargo.block}{cargo.apartment} – {cargo.recipientName}
                              </h4>
                              <p className="text-[11px] text-[#26342C]/60">
                                Kayıt No: <strong>{cargo.id}</strong> · Giriş: {cargo.receivedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#648875]/15 text-[#294C3C] border border-[#648875]/30">
                              {cargo.pieceCount} Adet Paket
                            </span>

                            {cargo.smsCode && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Key className="w-3 h-3 text-amber-700" />
                                <span>SMS Kodu: {cargo.smsCode}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sakin Tercihi & Teslimat Durumu Detay Barı */}
                        <div className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#26342C]/75">Sakinin Tercihi:</span>
                              {cargo.residentPreference === 'eve_gonderilsin' ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-300">
                                  Eve Gönderilsin (Daireye Çıkarılacak)
                                </span>
                              ) : cargo.residentPreference === 'emanet_kalsin' ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 font-bold border border-blue-300">
                                  Güvenlikte Emanet Kalsın (Nizamiyeden Alacak)
                                </span>
                              ) : (
                                <span className="text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                  Sakin henüz tercih belirtmedi (Yanıt Bekleniyor)
                                </span>
                              )}
                            </div>
                            {cargo.answeredAt && (
                              <p className="text-[10px] text-[#26342C]/60">
                                Cevap Zamanı: {cargo.answeredAt}
                              </p>
                            )}
                          </div>

                          {/* Fiziksel Teslimat Doğrulama Butonu (Requirement 9) */}
                          <div>
                            {cargo.deliveryStatus === 'guvenlikte' ? (
                              <button
                                onClick={() => deliverCargo(cargo.id)}
                                className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 touch-target"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Fiziksel Teslim Edildi</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Teslim Edildi ({cargo.deliveredAt})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* New Order Registration Modal (Orders - UNCHANGED) */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </div>
  );
};
