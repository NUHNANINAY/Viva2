/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SITE_RESIDENTS } from '../../data/initialData';
import { SiteResident } from '../../types';
import {
  X,
  Mic,
  MicOff,
  Search,
  Check,
  CheckCircle2,
  Building,
  User,
  ShoppingBag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = ['TRENDYOL', 'GETİR', 'MİGROS', 'YEMEKSEPETİ', 'DİĞER (YAZINIZ)'] as const;
type PlatformType = typeof PLATFORMS[number];

const DEFAULT_BLOCKS = ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'] as const;

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { createSecurityOrder, siteResidents, siteInfo } = useApp();

  const activeBlocks = siteInfo.blocks && siteInfo.blocks.length > 0
    ? siteInfo.blocks.map((b) => b.block)
    : (DEFAULT_BLOCKS as unknown as string[]);

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);
  const [customCompany, setCustomCompany] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [selectedBlock, setSelectedBlock] = useState<string | null>(
    activeBlocks.includes('G') ? 'G' : (activeBlocks[0] || 'A')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<SiteResident | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition when modal opens or "DİĞER" is selected
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Tarayıcınız sesli metin girişini desteklemiyor. Lütfen metin olarak yazınız.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setCustomCompany(transcript.trim().toUpperCase());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Mikrofon izni verilmedi. Lütfen manuel olarak firma adını yazınız.');
        } else {
          setSpeechError('Ses algılanamadı, manuel olarak firma adını yazabilirsiniz.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech init failed', err);
      setIsListening(false);
      setSpeechError('Mikrofon başlatılamadı. Lütfen metin olarak yazınız.');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // When platform changes to "DİĞER", start speech recognition automatically
  useEffect(() => {
    if (selectedPlatform === 'DİĞER (YAZINIZ)') {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
      setSpeechError(null);
    }
    return () => {
      stopSpeechRecognition();
    };
  }, [selectedPlatform]);

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeechRecognition();
      setSelectedPlatform(null);
      setCustomCompany('');
      setSearchQuery('');
      setSelectedResident(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter residents based on selected block and search query
  const directoryResidents = siteResidents.length > 0 ? siteResidents : SITE_RESIDENTS;
  const availableResidents = directoryResidents.filter((res) => {
    if (selectedBlock && res.block !== selectedBlock) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = res.fullName.toLowerCase().includes(q);
    const aptMatch = res.apartment.toLowerCase().includes(q);
    const blockAptMatch = `${res.block}${res.apartment}`.toLowerCase().includes(q);
    return nameMatch || aptMatch || blockAptMatch;
  });

  const getFinalCompanyName = () => {
    if (selectedPlatform === 'DİĞER (YAZINIZ)') {
      return customCompany.trim() || 'DİĞER FİRMA';
    }
    return selectedPlatform || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!selectedPlatform) {
      setErrorMsg('Lütfen siparişin geldiği platformu seçiniz.');
      return;
    }

    if (selectedPlatform === 'DİĞER (YAZINIZ)' && !customCompany.trim()) {
      setErrorMsg('Lütfen firma adını sesle söyleyiniz veya metin olarak yazınız.');
      return;
    }

    if (!selectedResident) {
      setErrorMsg('Lütfen siparişin ulaştırılacağı site sakinini seçiniz.');
      return;
    }

    createSecurityOrder({
      company: getFinalCompanyName(),
      block: selectedResident.block,
      apartment: selectedResident.apartment,
      residentName: selectedResident.fullName,
      courierName: 'Kurye',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#26342C]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <ShoppingBag className="w-5 h-5 text-[#294C3C]" />
            </div>
            <div>
              <h2 className="text-base font-luxury font-bold text-[#294C3C]">
                Yeni Sipariş Kaydı
              </h2>
              <p className="text-xs text-[#26342C]/70">
                Güvenlik kurye karşılama ve sakin teslimat yönlendirmesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#FFFFFF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION A: PLATFORM SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                  A
                </span>
                <span>Siparişin Geldiği Platform *</span>
              </label>
              {selectedPlatform && (
                <span className="text-[11px] font-bold text-[#648875]">
                  Seçildi: {getFinalCompanyName()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {PLATFORMS.map((plat) => {
                const isSelected = selectedPlatform === plat;
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(plat);
                      if (plat !== 'DİĞER (YAZINIZ)') {
                        setCustomCompany('');
                      }
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-2 touch-target ${
                      isSelected
                        ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md scale-[1.01]'
                        : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                    }`}
                  >
                    <span>{plat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* DİĞER: VOICE RECOGNITION & MANUAL INPUT */}
            {selectedPlatform === 'DİĞER (YAZINIZ)' && (
              <div className="mt-3 p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875]/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#294C3C] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#648875]" />
                    <span>Sesli veya Manuel Firma Girişi</span>
                  </span>

                  <button
                    type="button"
                    onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-[#648875] hover:bg-[#294C3C] text-white'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Dinleniyor... (Durdur)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Mikrofonu Başlat</span>
                      </>
                    )}
                  </button>
                </div>

                {isListening && (
                  <div className="p-3 rounded-xl bg-white border border-[#648875]/30 flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-[#26342C] font-semibold">
                      Lütfen firma adını söyleyiniz (Örn: "Dominos Pizza", "Çiçeksepeti", "Amazon")...
                    </span>
                  </div>
                )}

                {speechError && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    {speechError}
                  </p>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                    Algılanan / Girilen Firma Adı:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Örn: Domino's Pizza, Starbucks, Çiçeksepeti..."
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs font-bold text-[#294C3C] uppercase tracking-wide"
                    />
                  </div>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-[#26342C]/60 self-center mr-1">Hızlı Seç:</span>
                  {["Domino's", 'Starbucks', 'McDonalds', 'Amazon', 'ÇiçekSepeti', 'Watsons'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setCustomCompany(chip.toUpperCase())}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#648875] hover:text-white border border-[#DDE5DF] text-[10px] font-bold text-[#26342C] transition-colors"
                      >
                        {chip}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: BLOCK SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                  B
                </span>
                <span>Blok Seçimi *</span>
              </label>
              {selectedBlock && (
                <span className="text-[11px] font-bold text-[#648875]">
                  Seçilen Blok: {selectedBlock} Blok
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {activeBlocks.map((blk) => {
                const isSelected = selectedBlock === blk;
                return (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => {
                      setSelectedBlock(blk);
                      setSelectedResident(null); // Reset resident when block switches
                    }}
                    className={`py-3 sm:py-3.5 rounded-2xl text-base font-extrabold font-luxury border transition-all text-center touch-target ${
                      isSelected
                        ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md scale-105 ring-2 ring-[#648875]/40'
                        : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                    }`}
                  >
                    {blk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION C: RESIDENT SELECTION & SEARCH */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#294C3C] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#648875] text-white flex items-center justify-center text-[10px] font-bold">
                  C
                </span>
                <span>Sakin Seçimi ({selectedBlock} Blok) *</span>
              </label>
              {selectedResident && (
                <span className="text-[11px] font-bold text-[#294C3C] bg-[#648875]/15 px-2.5 py-0.5 rounded-full border border-[#648875]/30">
                  {selectedResident.block}{selectedResident.apartment} – {selectedResident.fullName}
                </span>
              )}
            </div>

            {/* Search Box with example placeholder */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#26342C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder='Sakin adı veya daire no ara... (Örn: "Ers" veya "12")'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C] placeholder:text-[#26342C]/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#26342C]/50 hover:text-[#26342C]"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Residents List */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-[#DDE5DF] rounded-2xl p-2 bg-[#F7F8F5]">
              {availableResidents.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#26342C]/50">
                  {searchQuery ? `"${searchQuery}" ile eşleşen sakin bulunamadı.` : 'Bu blokta kayıtlı sakin bulunmuyor.'}
                </div>
              ) : (
                availableResidents.map((res) => {
                  const isSelected = selectedResident?.id === res.id;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setSelectedResident(res)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                          : 'bg-white text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'
                          }`}
                        >
                          {res.block}{res.apartment}
                        </div>
                        <div>
                          <p className="font-bold">{res.fullName}</p>
                          <p
                            className={`text-[10px] ${
                              isSelected ? 'text-white/80' : 'text-[#26342C]/60'
                            }`}
                          >
                            {res.block} Blok · Daire {res.apartment} {res.phone && `· ${res.phone}`}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-[#294C3C] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 border-t border-[#DDE5DF] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={!selectedPlatform || !selectedResident}
              className="flex-1 py-3 px-5 rounded-xl bg-[#294C3C] hover:bg-[#648875] disabled:opacity-40 disabled:hover:bg-[#294C3C] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 touch-target"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Siparişi Kaydet ve Sakine Bildir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
