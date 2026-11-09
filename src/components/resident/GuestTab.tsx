/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Car,
  Clock,
  CheckCircle2,
  Calendar,
  Warehouse,
  Shield,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  Mic,
  MicOff,
  PlusCircle,
} from 'lucide-react';
import { GuestEntry, ResidentGuestOption, ParkingEscortPreference } from '../../types';

export const GuestTab: React.FC = () => {
  const { guestList, addResidentGuest, updateResidentGuest, cancelResidentGuest, residentUser } = useApp();

  // Show form toggle: Prominent "Misafirim Gelecek" button
  const [showForm, setShowForm] = useState(false);

  // Selected Option
  const [selectedOption, setSelectedOption] = useState<ResidentGuestOption>('misafirim_gelecek');
  const [parkingEscort, setParkingEscort] = useState<ParkingEscortPreference>('eslik_edin');

  // Form Fields
  const [titlePrefix, setTitlePrefix] = useState<'Bey' | 'Hanım' | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleBrandModel, setVehicleBrandModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [isImmediate, setIsImmediate] = useState(true);
  const [expectedDate, setExpectedDate] = useState('Bugün');
  const [expectedTime, setExpectedTime] = useState('14:30');
  const [notes, setNotes] = useState('');

  // Editing state
  const [editingGuest, setEditingGuest] = useState<GuestEntry | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechTarget, setSpeechTarget] = useState<'fullName' | 'plate' | null>(null);
  const recognitionRef = useRef<any>(null);

  // Feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resident's own guests
  const myGuests = guestList.filter(
    (g) => g.block === residentUser.block && g.apartment === residentUser.apartment
  );

  // Speech Recognition Handlers
  const startSpeechRecognition = (target: 'fullName' | 'plate') => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Tarayıcınız sesli metin girişini desteklemiyor. Lütfen klavyeyle yazınız.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTarget(target);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        if (target === 'fullName') {
          const parts = transcript.split(' ');
          if (parts.length >= 2) {
            setFirstName(parts.slice(0, parts.length - 1).join(' '));
            setLastName(parts[parts.length - 1]);
          } else {
            setFirstName(transcript);
          }
        } else if (target === 'plate') {
          setPlateNumber(transcript.toUpperCase().replace(/\s+/g, ' '));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechTarget(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechTarget(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech init failed', err);
      setIsListening(false);
      setSpeechTarget(null);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setSpeechTarget(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Lütfen misafir adı ve soyadını giriniz.');
      return;
    }

    const guestType = selectedOption === 'misafirim_gelecek' ? 'yaya' : 'aracli';

    if (editingGuest) {
      updateResidentGuest(editingGuest.id, {
        titlePrefix,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        guestType,
        plateNumber: plateNumber.trim() || undefined,
        vehicleBrandModel: vehicleBrandModel.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        isImmediate,
        expectedDate: isImmediate ? 'Bugün' : expectedDate,
        expectedTime: isImmediate ? 'Şimdi' : expectedTime,
        residentOption: selectedOption,
        parkingEscort: selectedOption === 'otopark_yerim_var' ? parkingEscort : undefined,
        notes: notes.trim() || undefined,
      });

      setToastMsg('Misafir bildiriminiz güncellendi.');
      setEditingGuest(null);
      setShowForm(false);
    } else {
      addResidentGuest({
        guestType,
        titlePrefix,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        block: residentUser.block,
        apartment: residentUser.apartment,
        residentName: residentUser.fullName,
        expectedDate: isImmediate ? 'Bugün' : expectedDate,
        expectedTime: isImmediate ? 'Şimdi' : expectedTime,
        isImmediate,
        plateNumber: plateNumber.trim() || undefined,
        vehicleBrandModel: vehicleBrandModel.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        notes: notes.trim() || undefined,
        residentOption: selectedOption,
        parkingEscort: selectedOption === 'otopark_yerim_var' ? parkingEscort : undefined,
      });

      setToastMsg('Misafir bildiriminiz nizamiyeye başarıyla iletildi.');
      setShowForm(false);
    }

    // Reset Form
    setTitlePrefix('');
    setFirstName('');
    setLastName('');
    setPlateNumber('');
    setVehicleBrandModel('');
    setVehicleColor('');
    setNotes('');
    setIsImmediate(true);

    setTimeout(() => setToastMsg(null), 4000);
  };

  const startEdit = (guest: GuestEntry) => {
    setEditingGuest(guest);
    setShowForm(true);
    setSelectedOption(guest.residentOption || (guest.guestType === 'aracli' ? 'aracli_misafirim' : 'misafirim_gelecek'));
    if (guest.parkingEscort) setParkingEscort(guest.parkingEscort);
    setTitlePrefix(guest.titlePrefix || '');
    setFirstName(guest.firstName || guest.fullName.split(' ')[0] || '');
    setLastName(guest.lastName || guest.fullName.split(' ').slice(1).join(' ') || '');
    setPlateNumber(guest.plateNumber || '');
    setVehicleBrandModel(guest.vehicleBrandModel || '');
    setVehicleColor(guest.vehicleColor || '');
    setIsImmediate(guest.isImmediate ?? true);
    setExpectedDate(guest.expectedDate || 'Bugün');
    setExpectedTime(guest.expectedTime || '14:30');
    setNotes(guest.notes || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingGuest(null);
    setShowForm(false);
    setTitlePrefix('');
    setFirstName('');
    setLastName('');
    setPlateNumber('');
    setVehicleBrandModel('');
    setVehicleColor('');
    setNotes('');
    setIsImmediate(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center border border-[#648875]/30">
            <Users className="w-6 h-6 text-[#294C3C]" />
          </div>
          <div>
            <h2 className="text-base font-luxury font-bold text-[#294C3C]">
              Misafir Bildirimi ve Karşılama
            </h2>
            <p className="text-xs text-[#26342C]/70">
              {residentUser.block} Blok Daire {residentUser.apartment} · Ziyaretçilerinizi nizamiyeye önceden bildirip beklemeden geçiş sağlayın
            </p>
          </div>
        </div>

        {/* PROMINENT "MİSAFİRİM GELECEK" BUTTON */}
        {!showForm && (
          <button
            onClick={() => {
              setEditingGuest(null);
              setShowForm(true);
            }}
            className="py-3.5 px-6 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 touch-target shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>MİSAFİRİM GELECEK</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Registration Form Modal / Panel */}
      {showForm && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#648875] shadow-lg space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
            <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#648875]" />
              <span>{editingGuest ? 'Misafir Bildirimini Düzenle' : 'Yeni Misafir Bildirimi'}</span>
            </h3>

            <button
              onClick={cancelEdit}
              className="text-xs font-bold text-[#26342C]/60 hover:text-red-600 flex items-center gap-1 p-1 rounded-lg hover:bg-[#F7F8F5] transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Kapat</span>
            </button>
          </div>

          {/* 4 Sakin Bildirim Seçeneği */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#294C3C]">
              Bildirim Türünü Seçiniz *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. Misafirim gelecek */}
              <button
                type="button"
                onClick={() => setSelectedOption('misafirim_gelecek')}
                className={`p-3.5 rounded-2xl text-left border transition-all touch-target flex items-start gap-3 ${
                  selectedOption === 'misafirim_gelecek'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md ring-2 ring-[#648875]/30'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedOption === 'misafirim_gelecek' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">1. Misafirim Gelecek</p>
                  <p className={`text-[11px] mt-0.5 ${selectedOption === 'misafirim_gelecek' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Misafir adı ve soyadı belirtilerek doğrudan yönlendirme
                  </p>
                </div>
              </button>

              {/* 2. Araçlı misafirim */}
              <button
                type="button"
                onClick={() => setSelectedOption('aracli_misafirim')}
                className={`p-3.5 rounded-2xl text-left border transition-all touch-target flex items-start gap-3 ${
                  selectedOption === 'aracli_misafirim'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md ring-2 ring-[#648875]/30'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedOption === 'aracli_misafirim' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'
                  }`}
                >
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">2. Araçlı Misafirim</p>
                  <p className={`text-[11px] mt-0.5 ${selectedOption === 'aracli_misafirim' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Plaka ve misafir bilgileriyle bahçe kısmına yönlendirme
                  </p>
                </div>
              </button>

              {/* 3. Kısa süreli kapalı otopark */}
              <button
                type="button"
                onClick={() => setSelectedOption('kisa_sureli_otopark')}
                className={`p-3.5 rounded-2xl text-left border transition-all touch-target flex items-start gap-3 ${
                  selectedOption === 'kisa_sureli_otopark'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md ring-2 ring-[#648875]/30'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedOption === 'kisa_sureli_otopark' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">3. Kısa Süreli Kapalı Otopark</p>
                  <p className={`text-[11px] mt-0.5 ${selectedOption === 'kisa_sureli_otopark' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Eşya bırakıp çıkacak misafir için kapalı otopark geçişi
                  </p>
                </div>
              </button>

              {/* 4. Kapalı otoparkta yerim var */}
              <button
                type="button"
                onClick={() => setSelectedOption('otopark_yerim_var')}
                className={`p-3.5 rounded-2xl text-left border transition-all touch-target flex items-start gap-3 ${
                  selectedOption === 'otopark_yerim_var'
                    ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-md ring-2 ring-[#648875]/30'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF] hover:border-[#648875] hover:bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedOption === 'otopark_yerim_var' ? 'bg-white/20 text-white' : 'bg-[#648875]/15 text-[#294C3C]'
                  }`}
                >
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">4. Kapalı Otoparkta 1 Kişilik Yerim Var</p>
                  <p className={`text-[11px] mt-0.5 ${selectedOption === 'otopark_yerim_var' ? 'text-white/80' : 'text-[#26342C]/65'}`}>
                    Tahsisli park alanıma yönlendirme
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Seçenek İçin Alt Seçenekler */}
          {selectedOption === 'otopark_yerim_var' && (
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875]/40 space-y-2.5 animate-in fade-in">
              <span className="text-xs font-bold text-[#294C3C] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#648875]" />
                <span>Otopark Eşlik Tercihi:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setParkingEscort('eslik_edin')}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                    parkingEscort === 'eslik_edin'
                      ? 'bg-[#294C3C] text-white border-[#294C3C]'
                      : 'bg-white text-[#26342C] border-[#DDE5DF]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center">
                    {parkingEscort === 'eslik_edin' && <span className="w-1.5 h-1.5 bg-current rounded-full" />}
                  </span>
                  <span>Lütfen eşlik edip yerimi gösterin.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setParkingEscort('eslik_etmeyin')}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                    parkingEscort === 'eslik_etmeyin'
                      ? 'bg-[#294C3C] text-white border-[#294C3C]'
                      : 'bg-white text-[#26342C] border-[#DDE5DF]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center">
                    {parkingEscort === 'eslik_etmeyin' && <span className="w-1.5 h-1.5 bg-current rounded-full" />}
                  </span>
                  <span>Eşlik etmenize gerek yok, yerimi biliyor.</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hızlı Hitap Butonları (Bey / Hanım) ve Sesli Mikrofon Girişi */}
            <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#294C3C]">Hitap Unvanı:</span>
                <button
                  type="button"
                  onClick={() => setTitlePrefix(titlePrefix === 'Bey' ? '' : 'Bey')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    titlePrefix === 'Bey'
                      ? 'bg-[#294C3C] text-white border-[#294C3C]'
                      : 'bg-white text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                  }`}
                >
                  Bey
                </button>
                <button
                  type="button"
                  onClick={() => setTitlePrefix(titlePrefix === 'Hanım' ? '' : 'Hanım')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    titlePrefix === 'Hanım'
                      ? 'bg-[#294C3C] text-white border-[#294C3C]'
                      : 'bg-white text-[#26342C] border-[#DDE5DF] hover:border-[#648875]'
                  }`}
                >
                  Hanım
                </button>
              </div>

              {/* Sesli Giriş Butonu */}
              <button
                type="button"
                onClick={
                  isListening
                    ? stopSpeechRecognition
                    : () => startSpeechRecognition('fullName')
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  isListening && speechTarget === 'fullName'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#648875] hover:bg-[#294C3C] text-white'
                }`}
              >
                {isListening && speechTarget === 'fullName' ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Dinleniyor... (Durdur)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Sesle Söyle (Ad & Soyad)</span>
                  </>
                )}
              </button>
            </div>

            {/* Ad & Soyad (Zorunlu) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Misafir Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Selim"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Misafir Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yılmaz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C] font-semibold"
                />
              </div>
            </div>

            {/* Araç Alanları (İsteğe bağlı, plaka zorunlu değil) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Araç Plakası (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: 34 VİV 1907"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C] uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Marka / Model (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: BMW 320"
                  value={vehicleBrandModel}
                  onChange={(e) => setVehicleBrandModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                  Araç Rengi (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Beyaz, Gri..."
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C]"
                />
              </div>
            </div>

            {/* Zamanlama: Hemen veya İleri Tarih */}
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-3">
              <label className="block text-xs font-bold text-[#294C3C]">
                Ziyaret Zamanı *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsImmediate(true)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    isImmediate
                      ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                      : 'bg-white text-[#26342C] border-[#DDE5DF]'
                  }`}
                >
                  Hemen / Şimdi Geliyor
                </button>

                <button
                  type="button"
                  onClick={() => setIsImmediate(false)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    !isImmediate
                      ? 'bg-[#294C3C] text-white border-[#294C3C] shadow-xs'
                      : 'bg-white text-[#26342C] border-[#DDE5DF]'
                  }`}
                >
                  İleri Tarih & Saat
                </button>
              </div>

              {!isImmediate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                      Beklenen Gün / Tarih
                    </label>
                    <input
                      type="text"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      placeholder="Örn: Bugün, Yarın veya 12.11.2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26342C]/70 mb-1">
                      Tahmini Saat
                    </label>
                    <input
                      type="time"
                      value={expectedTime}
                      onChange={(e) => setExpectedTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Güvenlik Notu */}
            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
                Güvenlik Personeli İçin Not (İsteğe Bağlı)
              </label>
              <input
                type="text"
                placeholder="Örn: Misafirim daireye doğrudan çıkabilir"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C]"
              />
            </div>

            {/* Form Submit & Cancel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="py-3 px-5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md touch-target flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>{editingGuest ? 'Güncellemeyi Kaydet' : 'Bildirimi Güvenliğe Gönder'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Önceden Oluşturulan Bildirimler (Değiştir / İptal Et) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
            Kayıtlı Misafir Bildirimlerim ({myGuests.length})
          </h3>
          <span className="text-[11px] text-[#26342C]/60">
            Nizamiye ile anlık senkronize
          </span>
        </div>

        {myGuests.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-[#FFFFFF] border-2 border-dashed border-[#DDE5DF] space-y-2">
            <Users className="w-8 h-8 text-[#648875] mx-auto opacity-70" />
            <p className="text-xs text-[#26342C]/60">
              Henüz nizamiyeye bildirdiğiniz bir misafir bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myGuests.map((guest) => {
              const optionLabels: Record<ResidentGuestOption, string> = {
                misafirim_gelecek: 'Misafirim Gelecek (Doğrudan Yönlendirme)',
                aracli_misafirim: 'Araçlı Misafir (Bahçe Yönlendirme)',
                kisa_sureli_otopark: 'Kısa Süreli Kapalı Otopark',
                otopark_yerim_var: 'Kapalı Otoparkta Yerim Var',
              };

              return (
                <div
                  key={guest.id}
                  className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#294C3C]">{guest.fullName}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
                          {guest.guestType === 'aracli' ? 'Araçlı' : 'Yaya'}
                        </span>
                      </div>
                      <p className="text-xs text-[#648875] font-semibold">
                        {guest.residentOption ? optionLabels[guest.residentOption] : 'Misafir Bildirimi'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {guest.status === 'bekleniyor' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          <span>Giriş Bekleniyor</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>İçeri Alındı ({guest.entryTime})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#F7F8F5] p-3 rounded-2xl border border-[#DDE5DF]">
                    <div>
                      <p className="text-[#26342C]/70">
                        Zaman: <strong className="text-[#26342C]">{guest.expectedDate} {guest.expectedTime}</strong>
                      </p>
                      {guest.plateNumber && (
                        <p className="text-[#26342C]/70">
                          Plaka: <strong className="text-[#648875]">{guest.plateNumber}</strong>
                          {guest.vehicleBrandModel && ` (${guest.vehicleBrandModel})`}
                        </p>
                      )}
                    </div>

                    <div>
                      {guest.parkingEscort && (
                        <p className="text-[#26342C]/70">
                          Eşlik: <span className="font-semibold text-[#294C3C]">
                            {guest.parkingEscort === 'eslik_edin' ? 'Eşlik edilerek gösterilsin' : 'Kendi yerimi biliyor'}
                          </span>
                        </p>
                      )}
                      {guest.notes && (
                        <p className="text-[#26342C]/70 italic">
                          Not: "{guest.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Değiştir / İptal Et */}
                  {guest.status === 'bekleniyor' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => startEdit(guest)}
                        className="px-3.5 py-1.5 rounded-xl border border-[#DDE5DF] hover:border-[#648875] text-xs font-semibold text-[#26342C] flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#648875]" />
                        <span>Değiştir / Düzenle</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`${guest.fullName} için oluşturulan bildirimi iptal etmek istiyor musunuz?`)) {
                            cancelResidentGuest(guest.id);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>İptal Et</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
