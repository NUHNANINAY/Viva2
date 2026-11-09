/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Droplets,
  Truck,
  Sparkles,
  TreePine,
  Layers,
  X,
  CheckCircle2,
  Clock,
  LogOut,
  Mic,
  MicOff,
  Car,
  Building,
  AlertCircle,
} from 'lucide-react';
import { FacilityCategory } from '../../types';

interface QuickFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: FacilityCategory; icon: typeof Wrench; hint: string }[] = [
  { label: 'Su / Tüp Dağıtım', icon: Droplets, hint: 'Damacana su, mutfak tüpü' },
  { label: 'Teknik Servis', icon: Wrench, hint: 'Asansör, elektrik, klima, kazan' },
  { label: 'Nakliye & Taşınma', icon: Truck, hint: 'Ev taşıma, eşya getirme' },
  { label: 'Temizlik & Hizmet', icon: Sparkles, hint: 'Genel temizlik, ilaçlama' },
  { label: 'Peyzaj & Bahçe', icon: TreePine, hint: 'Bahçıvan, çim biçme, havuz' },
  { label: 'Diğer Tedarikçi', icon: Layers, hint: 'Toptan malzeme, kurye kamyonu' },
];

const POPULAR_COMPANIES = [
  'Saka Su',
  'Erikli Su',
  'Kone Asansör',
  'Otis Asansör',
  'Teknik Elektrik',
  'Bursagaz / İgdaş',
  'İklimsa Klima',
];

export const QuickFacilityModal: React.FC<QuickFacilityModalProps> = ({ isOpen, onClose }) => {
  const { siteInfo, facilityList, addFacilityEntry, checkOutFacilityEntry } = useApp();

  const [activeTab, setActiveTab] = useState<'new' | 'inside'>('new');
  const [category, setCategory] = useState<FacilityCategory>('Su / Tüp Dağıtım');
  const [companyName, setCompanyName] = useState('');
  const [targetArea, setTargetArea] = useState<'ortak_alan' | 'daire'>('ortak_alan');
  const [block, setBlock] = useState(siteInfo.blocks?.[0]?.block || 'A');
  const [apartment, setApartment] = useState('1');
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const siteBlocks = siteInfo.blocks?.map((b) => b.block) || ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'];
  const insideEntries = facilityList.filter((f) => f.status === 'iceride');

  // Voice Input simulation/recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCompanyName(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      setIsListening(true);
      setTimeout(() => {
        setCompanyName('Teknik Servis Görevlisi');
        setIsListening(false);
      }, 1500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Lütfen firma veya tedarikçi adı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      addFacilityEntry({
        category,
        companyName: companyName.trim(),
        targetArea,
        block: targetArea === 'daire' ? block : undefined,
        apartment: targetArea === 'daire' ? apartment : undefined,
        plateNumber: plateNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`${companyName.trim()} tesise giriş yaptı olarak kaydedildi.`);
      setCompanyName('');
      setPlateNumber('');
      setNotes('');

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white border-2 border-[#DDE5DF] w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#26342C]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#648875]/20 border border-[#648875]/40 flex items-center justify-center text-[#294C3C]">
              <Wrench className="w-6 h-6 text-[#294C3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-luxury font-extrabold text-[#294C3C]">
                  Tesis & Tedarikçi Girişi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#294C3C] text-white">
                  Hızlı Hizmet Girişi
                </span>
              </div>
              <p className="text-xs text-[#26342C]/65">
                Su dağıtım, teknik servis, nakliye, temizlik ve bakım araçları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Yeni Giriş vs. Şu An İçeride Olanlar */}
        <div className="px-5 pt-3 pb-2 border-b border-[#DDE5DF] flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'new'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
            }`}
          >
            + Yeni Tedarikçi Girişi
          </button>
          <button
            onClick={() => setActiveTab('inside')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inside'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
            }`}
          >
            <span>Şu An İçeride Olanlar</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/20">
              {insideEntries.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: NEW ENTRY */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#294C3C] block">
                  1. Hizmet Kategorisini Seçin:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.label;
                    return (
                      <button
                        type="button"
                        key={cat.label}
                        onClick={() => setCategory(cat.label)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#294C3C] border-[#294C3C] text-white shadow-sm'
                            : 'bg-[#F7F8F5] border-[#DDE5DF] text-[#26342C] hover:border-[#648875]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-[#648875]'}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        </div>
                        <span className="text-xs font-black">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company / Person Name with voice input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#294C3C]">
                    2. Firma veya Görevli Adı *
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-[#648875]/15 text-[#294C3C] hover:bg-[#648875]/25'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? 'Dinleniyor...' : 'Sesle Söyle'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Örn: Saka Su, Kone Asansör, Nakliye Ekibi..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-bold text-[#294C3C] focus:bg-white focus:border-[#648875] outline-none"
                />

                {/* Quick popular chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_COMPANIES.map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setCompanyName(comp)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F8F5] hover:bg-[#DDE5DF] text-[#294C3C] border border-[#DDE5DF]"
                    >
                      + {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Area (Ortak Alan vs. Daire) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#294C3C] block">
                  3. Gidilecek Alan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetArea('ortak_alan')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      targetArea === 'ortak_alan'
                        ? 'bg-[#294C3C] text-white border-[#294C3C]'
                        : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Tüm Tesis / Ortak Alan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetArea('daire')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      targetArea === 'daire'
                        ? 'bg-[#294C3C] text-white border-[#294C3C]'
                        : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                    }`}
                  >
                    <span>Belirli Bir Daireye</span>
                  </button>
                </div>

                {/* If Daire is selected, show Block & Apartment picker */}
                {targetArea === 'daire' && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] animate-in fade-in">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#26342C]/70">Blok:</span>
                      <select
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C] outline-none"
                      >
                        {siteBlocks.map((blk) => (
                          <option key={blk} value={blk}>
                            {blk} Blok
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#26342C]/70">Daire No:</span>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white border border-[#DDE5DF] text-xs font-bold text-[#294C3C] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Plate and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C] flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-[#648875]" />
                    <span>Araç Plakası (İsteğe Bağlı)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 34 ABC 123"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-bold font-mono text-[#294C3C] focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Açıklama / Not (İsteğe Bağlı)</label>
                  <input
                    type="text"
                    placeholder="Örn: Asansör periyodik kontrol"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-medium focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 touch-target disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{isSubmitting ? 'Kaydediliyor...' : 'GİRİŞİ ONAYLA (İÇERİ AL)'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CURRENTLY INSIDE */}
          {activeTab === 'inside' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#294C3C]/70">
                  Şu an sitede aktif çalışma yapan tedarikçiler:
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {insideEntries.length} Araç / Ekip İçeride
                </span>
              </div>

              {insideEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#DDE5DF] hover:border-[#648875] transition-all flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#294C3C]">{item.companyName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#26342C]/70">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#648875]" />
                        <span>Giriş: {item.entryTime}</span>
                      </span>
                      {item.plateNumber && (
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#DDE5DF]">
                          {item.plateNumber}
                        </span>
                      )}
                      <span>
                        {item.targetArea === 'daire'
                          ? `Hedef: ${item.block} Blok D:${item.apartment}`
                          : 'Tüm Tesis / Ortak Alan'}
                      </span>
                    </div>
                    {item.notes && <p className="text-[11px] text-[#26342C]/65 italic">"{item.notes}"</p>}
                  </div>

                  <button
                    onClick={() => {
                      checkOutFacilityEntry(item.id);
                      setSuccessMsg(`${item.companyName} çıkışı onaylandı.`);
                      setTimeout(() => setSuccessMsg(''), 2000);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all touch-target shrink-0"
                    title="Tedarikçinin siteden ayrıldığını onayla"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Ayrıldı (Çıkış)</span>
                  </button>
                </div>
              ))}

              {insideEntries.length === 0 && (
                <div className="p-8 rounded-2xl bg-white border border-[#DDE5DF] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#648875] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#294C3C]">Şu an içeride tedarikçi bulunmamaktadır.</p>
                  <p className="text-xs text-[#26342C]/60">Yeni giriş olduğunda sol sekmeden hızlıca kaydedebilirsiniz.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
