/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Check,
  CheckCircle2,
  Clock,
  Car,
  Home,
  Coffee,
  Volume2,
  Building,
  Edit3,
} from 'lucide-react';
import {
  startGuestAlertAlarm,
  stopGuestAlertAlarm,
  playSuccessChime,
} from '../../utils/audio';

interface QuickGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickGuestModal: React.FC<QuickGuestModalProps> = ({ isOpen, onClose }) => {
  const { siteInfo, siteResidents, addSecurityGuest, guestList, updateResidentGuest } = useApp();

  const siteBlocks = siteInfo.blocks?.map((b) => b.block) || ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I'];

  const [selectedBlock, setSelectedBlock] = useState<string>(siteBlocks[0] || 'A');
  const [selectedApartment, setSelectedApartment] = useState<string>('1');
  const [currentStep, setCurrentStep] = useState<'block' | 'apartment' | 'resident' | 'waiting' | 'answered'>('block');

  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);

  // Optional plate & name entry
  const [showPlateInput, setShowPlateInput] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [quickPlate, setQuickPlate] = useState('');
  const [quickName, setQuickName] = useState('');

  // Apartment count for selected block
  const blockConfig = siteInfo.blocks?.find((b) => b.block === selectedBlock);
  const totalApartments = blockConfig ? blockConfig.apartmentCount : 15;
  const apartmentsArray = Array.from({ length: totalApartments }, (_, i) => (i + 1).toString());

  // Residents registered in this unit
  const unitResidents = siteResidents.filter(
    (r) => r.block === selectedBlock && r.apartment === selectedApartment
  );

  // Active created guest record
  const currentGuest = guestList.find((g) => g.id === activeGuestId);

  // Watch for resident response
  useEffect(() => {
    if (currentGuest?.residentResponse && currentStep === 'waiting') {
      setCurrentStep('answered');
      startGuestAlertAlarm(3000);
    }
  }, [currentGuest?.residentResponse, currentStep]);

  useEffect(() => {
    if (!isOpen) {
      stopGuestAlertAlarm();
      setCurrentStep('block');
      setActiveGuestId(null);
      setShowPlateInput(false);
      setShowNameInput(false);
      setQuickPlate('');
      setQuickName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendToResident = (residentName: string) => {
    const res = addSecurityGuest({
      guestType: 'yaya',
      firstName: 'Misafir',
      lastName: '',
      block: selectedBlock,
      apartment: selectedApartment,
      residentName,
    });

    if (res.guest) {
      setActiveGuestId(res.guest.id);
      setCurrentStep('waiting');
    }
  };

  const handleAcknowledge = () => {
    stopGuestAlertAlarm();
    playSuccessChime();
    if (activeGuestId) {
      updateResidentGuest(activeGuestId, {
        guardAcknowledged: true,
        status: 'giris_yapti',
        plateNumber: quickPlate.trim() || undefined,
        fullName: quickName.trim() || currentGuest?.fullName,
      });
    }
    onClose();
  };

  const handleSaveOptionalPlate = () => {
    if (activeGuestId && quickPlate.trim()) {
      updateResidentGuest(activeGuestId, {
        plateNumber: quickPlate.trim().toUpperCase(),
        guestType: 'aracli',
      });
      setShowPlateInput(false);
    }
  };

  const handleSaveOptionalName = () => {
    if (activeGuestId && quickName.trim()) {
      updateResidentGuest(activeGuestId, {
        fullName: quickName.trim(),
        firstName: quickName.trim(),
      });
      setShowNameInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-4 border-[#648875] w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#26342C]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDE5DF] bg-[#F7F8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#648875] text-white flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#648875] text-white">
                Hızlı Nizamiye Girişi
              </span>
              <h2 className="text-base sm:text-lg font-luxury font-extrabold text-[#294C3C]">
                Misafir Yönlendirme (3 Dokunuş)
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              stopGuestAlertAlarm();
              onClose();
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* STEP 1: BLOK SEÇİMİ */}
          {currentStep === 'block' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#294C3C]">
                  1. ADIM: GİDİLECEK BLOĞU SEÇİNİZ
                </span>
                <span className="text-xs text-gray-500">Büyük butonlara dokunun</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
                {siteBlocks.map((blk) => (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => {
                      setSelectedBlock(blk);
                      setCurrentStep('apartment');
                    }}
                    className={`py-5 rounded-2xl text-2xl font-black font-luxury border-2 transition-all shadow-sm ${
                      selectedBlock === blk
                        ? 'bg-[#648875] text-white border-[#294C3C]'
                        : 'bg-white text-[#294C3C] border-[#DDE5DF] hover:border-[#648875] hover:bg-[#F7F8F5]'
                    }`}
                  >
                    {blk} BLOK
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DAİRE SEÇİMİ */}
          {currentStep === 'apartment' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#294C3C] block">
                    2. ADIM: {selectedBlock} BLOK – DAİRE NUMARASINI SEÇİNİZ
                  </span>
                  <span className="text-[11px] text-gray-500">1 ile {totalApartments} arası daireler</span>
                </div>
                <button
                  onClick={() => setCurrentStep('block')}
                  className="text-xs font-bold text-[#648875] underline"
                >
                  Bloğu Değiştir
                </button>
              </div>

              {/* Grid 5 columns on mobile for easy thumb reach */}
              <div className="grid grid-cols-5 gap-2">
                {apartmentsArray.map((apt) => (
                  <button
                    key={apt}
                    type="button"
                    onClick={() => {
                      setSelectedApartment(apt);
                      setCurrentStep('resident');
                    }}
                    className={`py-4 rounded-xl text-lg font-black border-2 transition-all ${
                      selectedApartment === apt
                        ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md'
                        : 'bg-white text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-[#F7F8F5]'
                    }`}
                  >
                    {apt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SAKİN SEÇİMİ VE BİLDİRİM GÖNDERME */}
          {currentStep === 'resident' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#294C3C] block">
                    3. ADIM: SAKİNE ANINDA SESLİ BİLDİRİM GÖNDER
                  </span>
                  <span className="text-xs text-gray-600">
                    Seçilen: <strong>{selectedBlock} Blok · Daire {selectedApartment}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setCurrentStep('apartment')}
                  className="text-xs font-bold text-[#648875] underline"
                >
                  Daireyi Değiştir
                </button>
              </div>

              <div className="space-y-2">
                {unitResidents.length > 0 ? (
                  unitResidents.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSendToResident(res.fullName)}
                      className="w-full p-4 rounded-2xl bg-emerald-50 hover:bg-[#294C3C] border-2 border-[#648875] text-[#294C3C] hover:text-white transition-all text-left flex items-center justify-between group shadow-sm"
                    >
                      <div>
                        <span className="text-base font-extrabold block">{res.fullName}</span>
                        <span className="text-xs text-gray-500 group-hover:text-white/80">
                          {res.phone || 'Telefon kayıtlı'}
                        </span>
                      </div>
                      <span className="text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-[#648875] text-white group-hover:bg-white group-hover:text-[#294C3C]">
                        ZİLİ ÇAL & BİLDİR →
                      </span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendToResident(`Daire ${selectedApartment} Sakini`)}
                    className="w-full p-4 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white transition-all text-center space-y-1 shadow-md"
                  >
                    <span className="text-base font-black block">
                      {selectedBlock} Blok Daire {selectedApartment} Sakinine Bildir
                    </span>
                    <span className="text-xs text-white/80 block">
                      (Daireye otomatik uygulama bildirimi gönderilecektir)
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* WAITING FOR RESIDENT RESPONSE (90s) */}
          {currentStep === 'waiting' && (
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-center space-y-4 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-amber-950">
                  {selectedBlock} Blok Daire {selectedApartment} Sakininin Yanıtı Bekleniyor...
                </h3>
                <p className="text-xs text-amber-900/80 mt-1">
                  Sakinin telefonuna sesli bildirim ulaştı. 90 saniye içinde yanıt gelmezse otomatik zaman aşımı kaydedilecektir.
                </p>
              </div>

              {/* Simulation fast buttons for testing if user tests on 1 screen */}
              <div className="pt-2 border-t border-amber-200 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeGuestId) {
                      updateResidentGuest(activeGuestId, { residentResponse: 'EVDEYIM' });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-[11px] font-bold text-emerald-800"
                >
                  Test: Sakin EVDEYİM Dedi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeGuestId) {
                      updateResidentGuest(activeGuestId, { residentResponse: 'CAFEDEYIM' });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-[11px] font-bold text-amber-800"
                >
                  Test: Sakin CAFEDEYİM Dedi
                </button>
              </div>
            </div>
          )}

          {/* RESIDENT ANSWERED: HUGE TAMAM BUTTON & OPTIONAL ENTRY */}
          {currentStep === 'answered' && (
            <div className="space-y-4 text-center">
              <div className="p-5 rounded-3xl bg-emerald-50 border-4 border-emerald-500 space-y-2 ring-8 ring-emerald-100 animate-bounce">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <Volume2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-700 text-white inline-block">
                  SAKİN YANIT VERDİ (SESLİ UYARI ÇALIYOR)
                </span>
                <h2 className="text-2xl font-black font-luxury text-[#294C3C] pt-1">
                  TERCİH: {currentGuest?.residentResponse === 'EVDEYIM' ? 'EVDEYİM (İÇERİ ALINIZ)' : 'CAFEDEYİM (KAFEYE YÖNLENDİRİNİZ)'}
                </h2>
                <p className="text-xs text-emerald-900 font-semibold">
                  {selectedBlock} Blok Daire {selectedApartment} ({currentGuest?.residentName})
                </p>
              </div>

              {/* GIANT TAMAM BUTTON */}
              <button
                type="button"
                onClick={handleAcknowledge}
                className="w-full py-5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white text-base font-black uppercase tracking-wider shadow-2xl transition-all flex items-center justify-center gap-3 touch-target"
              >
                <Check className="w-6 h-6 text-emerald-400" />
                <span>TAMAM (SESİ SUSTUR & İÇERİ AL)</span>
              </button>

              {/* Optional Plate & Name buttons */}
              <div className="pt-2 border-t border-[#DDE5DF] space-y-2">
                <span className="text-[11px] font-bold text-gray-500 block">
                  İsteğe Bağlı Bilgiler (Zorunlu Değildir):
                </span>

                <div className="flex justify-center gap-2">
                  {!showPlateInput && (
                    <button
                      type="button"
                      onClick={() => setShowPlateInput(true)}
                      className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#294C3C] hover:bg-[#F7F8F5] flex items-center gap-1.5"
                    >
                      <Car className="w-4 h-4 text-[#648875]" />
                      <span>+ Plaka Gir</span>
                    </button>
                  )}

                  {!showNameInput && (
                    <button
                      type="button"
                      onClick={() => setShowNameInput(true)}
                      className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#294C3C] hover:bg-[#F7F8F5] flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4 text-[#648875]" />
                      <span>+ Misafir Adı Gir</span>
                    </button>
                  )}
                </div>

                {showPlateInput && (
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <input
                      type="text"
                      value={quickPlate}
                      onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                      placeholder="Plaka (Örn: 34 ABC 123)"
                      className="flex-1 p-2 rounded-xl border border-[#DDE5DF] text-xs font-bold uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleSaveOptionalPlate}
                      className="px-3 py-2 rounded-xl bg-[#648875] text-white text-xs font-bold"
                    >
                      Kaydet
                    </button>
                  </div>
                )}

                {showNameInput && (
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Misafir Adı Soyadı"
                      className="flex-1 p-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSaveOptionalName}
                      className="px-3 py-2 rounded-xl bg-[#648875] text-white text-xs font-bold"
                    >
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
