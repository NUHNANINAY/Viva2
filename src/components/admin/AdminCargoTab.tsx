/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Truck,
  Shield,
  Clock,
  Send,
  AlertCircle,
  Bell,
  X,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Inbox,
} from 'lucide-react';
import { SITE_BLOCKS, APARTMENT_NUMBERS, CARGO_CARRIERS } from '../../data/initialData';
import { CargoCarrier, CargoPackage } from '../../types';

interface DraftPackageItem {
  id: string;
  block: string;
  apartment: number;
  carrier: CargoCarrier;
  otherCarrierName?: string;
  trackingCode: string;
  notes?: string;
}

export const AdminCargoTab: React.FC = () => {
  const {
    cargoList,
    addBatchCargo,
    physicallyReceiveCargo,
    deliverCargoToResident,
    deleteCargo,
    latestResidentResponse,
    clearLatestResidentResponse,
  } = useApp();

  // Active viewing tab in security screen:
  // 'pending_response' (Yanıt Bekleyenler)
  // 'send_to_apartment' (Eve Gönderilecekler - Mavi)
  // 'hold_at_security' (Güvenlikte Emanet Kalacaklar - Yeşil)
  // 'completed' (Sakinine Teslim Edilenler)
  const [activeListTab, setActiveListTab] = useState<
    'pending_response' | 'send_to_apartment' | 'hold_at_security' | 'completed'
  >('pending_response');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  const [showSuccessNotice, setShowSuccessNotice] = useState<string | null>(null);

  // Toplu Kargo Ekleme - Form Ekleme Durumu
  const [currentBlock, setCurrentBlock] = useState('A');
  const [currentApartment, setCurrentApartment] = useState(5);
  const [currentCarrier, setCurrentCarrier] = useState<CargoCarrier>('Trendyol');
  const [currentOtherCarrier, setCurrentOtherCarrier] = useState('');
  const [currentTracking, setCurrentTracking] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');

  // Toplu gönderilmek üzere hazırlanan geçici taslak liste
  const [draftList, setDraftList] = useState<DraftPackageItem[]>([]);

  // Bir kargo paketini taslak listeye ekleme
  const handleAddDraftItem = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: DraftPackageItem = {
      id: `draft-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      block: currentBlock,
      apartment: Number(currentApartment),
      carrier: currentCarrier,
      otherCarrierName: currentCarrier === 'Diğer' ? currentOtherCarrier.trim() : undefined,
      trackingCode: currentTracking.trim(),
      notes: currentNotes.trim() || undefined,
    };

    setDraftList((prev) => [...prev, newItem]);
    // Bir sonraki paket için takip no ve notu temizle, blok/daire kolaylık için kalsın
    setCurrentTracking('');
    setCurrentNotes('');
    if (currentCarrier === 'Diğer') setCurrentOtherCarrier('');
  };

  // Taslaktan hatalı kaydı silme
  const handleRemoveDraftItem = (id: string) => {
    setDraftList((prev) => prev.filter((item) => item.id !== id));
  };

  // Toplu kaydı tamamlama ve ilgili dairelere bildirim tetikleme
  const handleCompleteBatchIntake = () => {
    if (draftList.length === 0) return;

    addBatchCargo(
      draftList.map((d) => ({
        block: d.block,
        apartment: d.apartment,
        carrier: d.carrier,
        otherCarrierName: d.otherCarrierName,
        trackingCode: d.trackingCode || undefined,
        notes: d.notes,
      }))
    );

    const count = draftList.length;
    setDraftList([]);
    setShowSuccessNotice(
      `TOPLU KAYIT TAMAMLANDI: ${count} adet kargo sisteme işlendi. İlgili daire sakinlerine teslimat tercihi bildirimi anlık olarak iletildi.`
    );
    setTimeout(() => setShowSuccessNotice(null), 5000);
    // Yeni eklenenler yanıt bekleyenler listesinde görünür
    setActiveListTab('pending_response');
  };

  // Kargo listelerini filtreleme
  const filteredCargos = cargoList.filter((c) => {
    const matchesBlock = selectedBlockFilter === 'all' || c.block === selectedBlockFilter;
    const matchesSearch =
      searchTerm === '' ||
      c.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.block} ${c.apartment}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.recipientName && c.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesBlock && matchesSearch;
  });

  // 1. Yanıt Bekleyenler: status === 'yanit_bekliyor'
  const pendingResponseList = filteredCargos.filter((c) => c.status === 'yanit_bekliyor');

  // 2. Eve Gönderilecekler (Mavi): status === 'eve_gonderilecek'
  const sendToApartmentList = filteredCargos.filter((c) => c.status === 'eve_gonderilecek');

  // 3. Güvenlikte Emanet Kalacaklar (Yeşil): status === 'guvenlikte_emanet' | 'kodlu_onay' | 'kodsuz_onay' | 'fiziksel_teslim_alindi'
  const holdAtSecurityList = filteredCargos.filter(
    (c) =>
      c.status === 'guvenlikte_emanet' ||
      c.status === 'kodlu_onay' ||
      c.status === 'kodsuz_onay' ||
      c.status === 'fiziksel_teslim_alindi'
  );

  // 4. Sakinine Teslim Edilenler: status === 'teslim_edildi'
  const completedList = filteredCargos.filter((c) => c.status === 'teslim_edildi');

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/30 shadow-inner">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#EEE9DE]">Güvenlik Kargo Kabul Konsolu</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A66A]/20 text-[#DFC38E] border border-[#C5A66A]/40 uppercase font-semibold">
                Yalnızca Toplu Giriş Modu
              </span>
            </div>
            <p className="text-xs text-[#EEE9DE]/60">
              Bloklar: A, B, C, E, F, G, H, I · Daireler: 1 - 15 · Gerçek Zamanlı Sakin Bildirimi
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#EEE9DE]/60 bg-[#111318] px-3 py-1.5 rounded-xl border border-[#292B36] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#C5A66A]" />
          <span>Kayıtlar Toplu Gönderilene Kadar Sakine Bildirim Gitmez</span>
        </div>
      </div>

      {/* Live Resident Response Toast/Alert */}
      {latestResidentResponse && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#292B36] to-[#1B1D25] border-2 border-[#C5A66A] text-[#EEE9DE] shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A66A] text-[#111318] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
                Yeni Sakin Yanıtı Alındı (Sesli Bildirim)
              </p>
              <p className="text-xs text-[#EEE9DE]">{latestResidentResponse.message}</p>
            </div>
          </div>
          <button
            onClick={clearLatestResidentResponse}
            className="p-1.5 rounded-lg bg-[#111318] hover:bg-[#292B36] text-[#EEE9DE]/70 hover:text-white transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium leading-relaxed">{showSuccessNotice}</span>
        </div>
      )}

      {/* 1. TOPLU KARGO GİRİŞİ ALANI (YALNIZCA TOPLU KARGO EKLEME MEVCUTTUR) */}
      <div className="p-5 rounded-3xl bg-[#1B1D25] border border-[#C5A66A]/35 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#292B36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#292B36] text-[#C5A66A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wider">
                Toplu Kargo Ekle (Nizamiye Kabulü)
              </h3>
              <p className="text-[11px] text-[#EEE9DE]/60">
                Sırayla blok, daire, kargo firması ve takip numarasını belirleyip listeye ekleyin.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#111318] text-[#DFC38E] border border-[#292B36]">
            Taslakta {draftList.length} Paket
          </span>
        </div>

        {/* Sırayla Giriş Formu */}
        <form onSubmit={handleAddDraftItem} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Sıra: Blok Seçimi */}
            <div>
              <label className="block text-[11px] font-bold text-[#DFC38E] uppercase tracking-wider mb-1">
                1. Blok *
              </label>
              <select
                value={currentBlock}
                onChange={(e) => setCurrentBlock(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs font-semibold text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              >
                {SITE_BLOCKS.map((blk) => (
                  <option key={blk} value={blk}>
                    {blk} Blok
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Sıra: Daire Seçimi (1..15) */}
            <div>
              <label className="block text-[11px] font-bold text-[#DFC38E] uppercase tracking-wider mb-1">
                2. Daire (1-15) *
              </label>
              <select
                value={currentApartment}
                onChange={(e) => setCurrentApartment(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs font-semibold text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              >
                {APARTMENT_NUMBERS.map((apt) => (
                  <option key={apt} value={apt}>
                    Daire {apt} {currentBlock === 'A' && apt === 5 ? '(Ufuk Gültekin)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sıra: Kargo Firması */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#DFC38E] uppercase tracking-wider mb-1">
                3. Kargo Firması *
              </label>
              <select
                value={currentCarrier}
                onChange={(e) => setCurrentCarrier(e.target.value as CargoCarrier)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs font-semibold text-[#DFC38E] focus:border-[#C5A66A] focus:outline-none"
              >
                {CARGO_CARRIERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentCarrier === 'Diğer' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                Özel Firma Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Özel Kurye, Çiçek Dağıtım vb."
                value={currentOtherCarrier}
                onChange={(e) => setCurrentOtherCarrier(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE]"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 4. Sıra: Takip No */}
            <div>
              <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                4. Takip No / Barkod (Varsa)
              </label>
              <input
                type="text"
                placeholder="Varsa girin, yoksa otomatik üretilir"
                value={currentTracking}
                onChange={(e) => setCurrentTracking(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#DFC38E] font-mono focus:border-[#C5A66A] focus:outline-none"
              />
            </div>

            {/* Paket Notu / Dolap */}
            <div>
              <label className="block text-[11px] font-semibold text-[#EEE9DE]/80 mb-1">
                Paket Notu / Açıklama (İsteğe Bağlı)
              </label>
              <input
                type="text"
                placeholder="Örn: 2 koli, kırılabilir, büyük paket"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              />
            </div>
          </div>

          {/* Listeye Ekle Butonu */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-[#DFC38E] text-xs font-bold transition-all shadow-md touch-target flex items-center gap-2 active:scale-95 border border-[#C5A66A]/30"
            >
              <Plus className="w-4 h-4" />
              <span>Paketi Taslak Listesine Ekle</span>
            </button>
          </div>
        </form>

        {/* Taslak Kargo Tablosu / Listesi */}
        {draftList.length > 0 && (
          <div className="pt-3 border-t border-[#292B36] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#DFC38E] uppercase tracking-wider">
                Gönderilmeyi Bekleyen Paketler ({draftList.length})
              </span>
              <span className="text-[11px] text-[#EEE9DE]/50">
                Aynı daireye birden fazla paket eklenebilir
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {draftList.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#C5A66A] w-5 font-bold">
                      #{index + 1}
                    </span>
                    <span className="font-bold px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E] border border-[#C5A66A]/20">
                      {item.block} Blok · D:{item.apartment}
                    </span>
                    <span className="font-semibold text-[#EEE9DE]">{item.carrier}</span>
                    {item.trackingCode && (
                      <span className="font-mono text-[11px] text-[#EEE9DE]/60">
                        ({item.trackingCode})
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-[11px] text-[#EEE9DE]/50 italic truncate max-w-[150px]">
                        "{item.notes}"
                      </span>
                    )}
                  </div>

                  {/* Silme Düğmesi */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDraftItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
                    title="Bu paketi listeden çıkar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Toplu Kaydı Tamamla Butonu */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111318] p-4 rounded-2xl border border-[#292B36]">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#EEE9DE]">
                  Toplam {draftList.length} adet kargo paketi tanımlandı.
                </p>
                <p className="text-[11px] text-[#EEE9DE]/60">
                  Bu butona basıldığında yalnızca ilgili dairelerin sakinlerine bildirim gider.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCompleteBatchIntake}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#C5A66A]/10 touch-target flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#111318]" />
                <span>TOPLU KAYDI TAMAMLA ({draftList.length} Kargo)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. GÜVENLİK EKRANINDA İKİ AYRI LİSTE + YANIT BEKLEYENLER */}
      <div className="space-y-4">
        {/* Arama ve Blok Filtreleme */}
        <div className="p-3.5 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#C5A66A] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Daire, sakin adı, kargo firması veya takip no sorgula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBlockFilter}
              onChange={(e) => setSelectedBlockFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
            >
              <option value="all">Tüm Bloklar</option>
              {SITE_BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b} Blok
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste Sekmeleri: Eve Gönderilecekler (Mavi), Güvenlikte Emanet Kalacaklar (Yeşil), Yanıt Bekleyenler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* YANIT BEKLEYENLER */}
          <button
            type="button"
            onClick={() => setActiveListTab('pending_response')}
            className={`p-3 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
              activeListTab === 'pending_response'
                ? 'bg-[#292B36] border-amber-500/50 shadow-md'
                : 'bg-[#1B1D25] border-[#292B36] hover:bg-[#20232c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Yanıt Bekleyenler
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                {pendingResponseList.length}
              </span>
            </div>
            <p className="text-[10px] text-[#EEE9DE]/50 mt-1">Sakin henüz tercih yapmadı</p>
          </button>

          {/* A) EVE GÖNDERİLECEKLER (MAVİ) */}
          <button
            type="button"
            onClick={() => setActiveListTab('send_to_apartment')}
            className={`p-3 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
              activeListTab === 'send_to_apartment'
                ? 'bg-[#292B36] border-blue-500/60 shadow-md'
                : 'bg-[#1B1D25] border-[#292B36] hover:bg-[#20232c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                A) Eve Gönderilecekler
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-500/40">
                {sendToApartmentList.length}
              </span>
            </div>
            <p className="text-[10px] text-[#EEE9DE]/50 mt-1">Mavi durum · Kurye yönlendirilecek</p>
          </button>

          {/* B) GÜVENLİKTE EMANET KALACAKLAR (YEŞİL) */}
          <button
            type="button"
            onClick={() => setActiveListTab('hold_at_security')}
            className={`p-3 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
              activeListTab === 'hold_at_security'
                ? 'bg-[#292B36] border-emerald-500/60 shadow-md'
                : 'bg-[#1B1D25] border-[#292B36] hover:bg-[#20232c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                B) Güvenlikte Emanet
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                {holdAtSecurityList.length}
              </span>
            </div>
            <p className="text-[10px] text-[#EEE9DE]/50 mt-1">Yeşil durum · Kodlu / Kodsuz</p>
          </button>

          {/* SAKİNİNE TESLİM EDİLENLER */}
          <button
            type="button"
            onClick={() => setActiveListTab('completed')}
            className={`p-3 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
              activeListTab === 'completed'
                ? 'bg-[#292B36] border-[#C5A66A]/60 shadow-md'
                : 'bg-[#1B1D25] border-[#292B36] hover:bg-[#20232c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#DFC38E]">
                Teslim Edilenler
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111318] text-[#DFC38E] border border-[#292B36]">
                {completedList.length}
              </span>
            </div>
            <p className="text-[10px] text-[#EEE9DE]/50 mt-1">Sakinine teslim edilen arşiv</p>
          </button>
        </div>

        {/* LİSTE İÇERİĞİ */}

        {/* 1. YANIT BEKLEYENLER LİSTESİ */}
        {activeListTab === 'pending_response' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Yanıt Bekleyen Kargolar:</strong> Sakin tercihini belirtmediği sürece kargo
                otomatik olarak teslim edilmiş veya güvenliğe fiziksel olarak alınmış sayılmaz. Sakin
                seçim yaptığında güvenlik konsoluna anlık sesli bildirim düşecektir.
              </p>
            </div>

            {pendingResponseList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
                <Clock className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="text-sm font-bold text-[#EEE9DE]">Yanıt Bekleyen Kargo Yok</p>
                <p className="text-xs text-[#EEE9DE]/50 max-w-sm mx-auto">
                  Tüm kargo bildirimleri sakinler tarafından yanıtlanmış veya henüz sisteme paket
                  eklenmemiştir.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingResponseList.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="p-4 rounded-2xl bg-[#1B1D25] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#EEE9DE]">
                          {cargo.block} Blok · Daire {cargo.apartment}
                        </span>
                        <span className="text-xs text-[#DFC38E] font-medium">
                          ({cargo.recipientName || 'Sakin'})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E] font-semibold">
                          {cargo.carrier}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#EEE9DE]/60">
                        <span className="font-mono text-[#DFC38E]">{cargo.trackingCode}</span>
                        <span>·</span>
                        <span>Giriş: {cargo.receivedAt}</span>
                        <span>·</span>
                        <span className="text-amber-300 font-semibold">Sakinden Yanıt Bekleniyor</span>
                      </div>

                      {cargo.notes && (
                        <p className="text-[11px] text-[#EEE9DE]/50 italic">"{cargo.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-950/50 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                        Bildirim Gönderildi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. A) EVE GÖNDERİLECEKLER (MAVİ LİSTE) */}
        {activeListTab === 'send_to_apartment' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-200">
              <Truck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Eve Gönderilecekler:</strong> Sakin kuryenin doğrudan daire kapısına
                çıkmasını talep etmiştir. Kurye kapıya ulaştığında ve teslim tamamlandığında{' '}
                <strong>"Sakinine Teslim Edildi"</strong> butonuna basınız.
              </p>
            </div>

            {sendToApartmentList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
                <Truck className="w-8 h-8 text-blue-400/50 mx-auto" />
                <p className="text-sm font-bold text-[#EEE9DE]">Eve Gönderilecek Kargo Yok</p>
                <p className="text-xs text-[#EEE9DE]/50 max-w-sm mx-auto">
                  Şu anda doğrudan daireye yönlendirilecek aktif bir kargo bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sendToApartmentList.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="p-4 rounded-2xl bg-[#1B1D25] border-2 border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg shadow-blue-950/20"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Mavi Renkli Durum Göstergesi */}
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-sm shadow-blue-400" />
                        <span className="font-bold text-sm text-[#EEE9DE]">
                          {cargo.block} Blok · Daire {cargo.apartment}
                        </span>
                        <span className="text-xs text-blue-300 font-semibold">
                          ({cargo.recipientName || 'Sakin'})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E] font-bold border border-[#C5A66A]/20">
                          {cargo.carrier}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#EEE9DE]/70">
                        <span className="font-mono text-[#DFC38E]">{cargo.trackingCode}</span>
                        <span>·</span>
                        <span>Yanıt: {cargo.residentResponseAt || cargo.receivedAt}</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-500/40">
                          EVE GÖNDERİLSİN TERCİHİ
                        </span>
                      </div>

                      {cargo.notes && (
                        <p className="text-[11px] text-[#EEE9DE]/50 italic">"{cargo.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Sakinine teslim edilmeden teslim edildi durumuna geçilmez */}
                      <button
                        onClick={() => deliverCargoToResident(cargo.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md touch-target flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sakinine Teslim Edildi</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. B) GÜVENLİKTE EMANET KALACAKLAR (YEŞİL LİSTE) */}
        {activeListTab === 'hold_at_security' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Güvenlikte Emanet Kalacaklar:</strong> Sakin kargonun güvenlikte emanet
                kalmasını onaylamıştır. Kargo kuryeden fiziksel teslim alınmadan "Fiziksel Teslim Alındı"
                yapılamaz; sakine elden verilmeden "Teslim Edildi" yapılamaz.
              </p>
            </div>

            {holdAtSecurityList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
                <Shield className="w-8 h-8 text-emerald-400/50 mx-auto" />
                <p className="text-sm font-bold text-[#EEE9DE]">Güvenlikte Emanet Kargo Yok</p>
                <p className="text-xs text-[#EEE9DE]/50 max-w-sm mx-auto">
                  Şu anda güvenlikte emanet olarak bekleyen kargo bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {holdAtSecurityList.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="p-4 rounded-2xl bg-[#1B1D25] border-2 border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg shadow-emerald-950/20"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Yeşil Renkli Durum Göstergesi */}
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                        <span className="font-bold text-sm text-[#EEE9DE]">
                          {cargo.block} Blok · Daire {cargo.apartment}
                        </span>
                        <span className="text-xs text-emerald-300 font-semibold">
                          ({cargo.recipientName || 'Sakin'})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E] font-bold border border-[#C5A66A]/20">
                          {cargo.carrier}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#EEE9DE]/70">
                        <span className="font-mono text-[#DFC38E]">{cargo.trackingCode}</span>
                        <span>·</span>
                        <span>Yanıt: {cargo.residentResponseAt || cargo.receivedAt}</span>

                        {/* KODLU ONAY veya KODSUZ ONAY Rozeti */}
                        {cargo.approvalType === 'kodlu_onay' || cargo.status === 'kodlu_onay' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-emerald-400" />
                            <span>KODLU ONAY</span>
                            {cargo.smsCodeEntered && (
                              <span className="font-mono text-[10px]">({cargo.smsCodeEntered})</span>
                            )}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                            <span>KODSUZ ONAY</span>
                          </span>
                        )}

                        {/* Fiziksel Teslim Alındı Durumu */}
                        {cargo.status === 'fiziksel_teslim_alindi' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-200 border border-emerald-400/30 font-semibold">
                            Güvenlik Dolabında ({cargo.physicallyReceivedAt})
                          </span>
                        )}
                      </div>

                      {cargo.notes && (
                        <p className="text-[11px] text-[#EEE9DE]/50 italic">"{cargo.notes}"</p>
                      )}
                    </div>

                    {/* Aşamalı İşlem Butonları */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {cargo.status !== 'fiziksel_teslim_alindi' ? (
                        /* Aşama 1: Kuryeden Fiziksel Olarak Alınma */
                        <button
                          onClick={() => physicallyReceiveCargo(cargo.id)}
                          className="px-3.5 py-2 rounded-xl bg-[#292B36] hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold text-xs transition-all shadow-md touch-target flex items-center gap-1.5 border border-emerald-500/30"
                          title="Kuryeden paketi fiziksel olarak teslim aldığınızda tıklayınız"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Güvenlikte Fiziksel Teslim Al</span>
                        </button>
                      ) : (
                        /* Aşama 2: Sakin Geldiğinde Elden Teslim */
                        <button
                          onClick={() => deliverCargoToResident(cargo.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs transition-all shadow-md touch-target flex items-center gap-1.5 active:scale-95"
                          title="Sakin nizamiyeye geldiğinde paketi elden teslim et"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#111318]" />
                          <span>Sakinine Teslim Et</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TESLİM EDİLENLER (GEÇMİŞ) */}
        {activeListTab === 'completed' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
              Sakinine Teslim Edilmiş Kargolar ({completedList.length})
            </h4>

            {completedList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-2">
                <Inbox className="w-8 h-8 text-[#EEE9DE]/40 mx-auto" />
                <p className="text-sm font-bold text-[#EEE9DE]">Teslim Edilmiş Kargo Yok</p>
                <p className="text-xs text-[#EEE9DE]/50 max-w-sm mx-auto">
                  Henüz teslimatı tamamlanan kargo hareketi bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {completedList.map((cargo) => (
                  <div
                    key={cargo.id}
                    className="p-3.5 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#EEE9DE]">
                          {cargo.block} Blok · Daire {cargo.apartment}
                        </span>
                        <span className="text-xs text-[#EEE9DE]/70">
                          ({cargo.recipientName || 'Sakin'})
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#111318] text-[#DFC38E] font-medium">
                          {cargo.carrier}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#EEE9DE]/50 mt-0.5">
                        Takip No: <span className="font-mono text-[#DFC38E]">{cargo.trackingCode}</span> ·
                        Teslim: {cargo.deliveredAt || 'Tamamlandı'}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Teslim Edildi</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Demo Technical Disclaimer */}
      <div className="p-3 rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[11px] text-[#EEE9DE]/60 space-y-1">
        <p className="font-semibold text-[#DFC38E] flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#C5A66A]" />
          <span>Demo Entegrasyon Bilgilendirmesi</span>
        </p>
        <p className="leading-relaxed">
          Sakin bildirimleri ve güvenlik konsolu arasındaki tercih senkronizasyonu gerçek zamanlı yerel durum
          ve Web Audio API ses çanı ile simüle edilmektedir. Gerçek SMS gönderimi ve mobil işletim sistemi
          (iOS APNs / Android FCM) arka plan anlık push bildirimleri sunucu altyapısı gerektirir.
        </p>
      </div>
    </div>
  );
};
