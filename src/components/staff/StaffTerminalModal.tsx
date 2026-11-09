/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import { Clock, KeyRound, CheckCircle, AlertCircle, Play, Square, X, UserCheck } from 'lucide-react';
import { hashString } from '../../utils/crypto';

interface StaffTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStaffId?: string;
}

export const StaffTerminalModal: React.FC<StaffTerminalModalProps> = ({
  isOpen,
  onClose,
  defaultStaffId,
}) => {
  const { staffList, timeRecords, clockInStaff, clockOutStaff } = useApp();
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    defaultStaffId || (staffList.length > 0 ? staffList[0].id : '')
  );
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const currentStaff = staffList.find((s) => s.id === selectedStaffId);
  const activeShift = currentStaff
    ? timeRecords.find((r) => r.staffId === currentStaff.id && r.status === 'working')
    : null;

  const handleKeypad = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const verifyPin = async (staff: StaffMember): Promise<boolean> => {
    if (!staff.pinHash) {
      return false; // No PIN configured: require manager to set PIN
    }
    const enteredHash = await hashString(pin);
    return enteredHash === staff.pinHash;
  };

  const handleClockIn = async () => {
    if (!currentStaff) return;
    setError(null);
    setSuccessMsg(null);

    if (!currentStaff.isActive) {
      setError('Bu personel hesabı yöneticiniz tarafından PASİFE alınmıştır. Giriş yapamazsınız.');
      return;
    }

    if (pin.length < 4) {
      setError('Lütfen size atanan 4 haneli güvenlik PIN kodunuzu tuşlayın.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await verifyPin(currentStaff);
      if (!isValid) {
        setError('Hatalı PIN kodu! Lütfen tekrar deneyin.');
        setIsSubmitting(false);
        setPin('');
        return;
      }

      await clockInStaff(currentStaff.id, note);
      setSuccessMsg(`${currentStaff.name} ${currentStaff.surname} için mesai girişi kaydedildi.`);
      setPin('');
      setNote('');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Giriş kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentStaff) return;
    setError(null);
    setSuccessMsg(null);

    if (pin.length < 4) {
      setError('Lütfen 4 haneli PIN kodunuzu tuşlayın.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isValid = await verifyPin(currentStaff);
      if (!isValid) {
        setError('Hatalı PIN kodu! Lütfen tekrar deneyin.');
        setIsSubmitting(false);
        setPin('');
        return;
      }

      const res = await clockOutStaff(currentStaff.id, note);
      if (res) {
        setSuccessMsg(`Mesai tamamlandı! Toplam süre: ${res.totalHours} saat.`);
      } else {
        setSuccessMsg('Mesai çıkışı kaydedildi.');
      }
      setPin('');
      setNote('');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Çıkış kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl shadow-2xl border-2 border-[#DDE5DF] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#294C3C] text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">Personel Puantaj & Nöbet Terminali</h3>
              <p className="text-xs text-emerald-200">Giriş / Çıkış & Mesai Kaydı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Staff Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26342C]/70 mb-1.5">
              Personel Seçimi
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setPin('');
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#DDE5DF] bg-[#F7F8F5] text-[#26342C] font-bold text-sm focus:outline-none focus:border-[#294C3C]"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.surname} — {s.category || 'Personel'} {!s.isActive ? '(PASİF)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Active Shift Status Card */}
          {currentStaff && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                activeShift
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activeShift ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {activeShift ? <UserCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {activeShift ? '🟢 ŞU AN MESAİDE' : '⚪ MESAİDE DEĞİL'}
                  </div>
                  <div className="text-sm font-semibold">
                    {activeShift
                      ? `Giriş: ${activeShift.clockIn} (Bugün)`
                      : 'Şu an aktif mesai kaydı bulunmuyor'}
                  </div>
                </div>
              </div>
              {!currentStaff.isActive && (
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black">
                  HESAP PASİF
                </span>
              )}
            </div>
          )}

          {/* PIN Input & Display */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#26342C]/70">
                4 Haneli Güvenlik PIN Kodu
              </label>
              <span className="text-[11px] text-[#648875] font-medium">Varsayılan: 1234</span>
            </div>
            <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#DDE5DF]">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-10 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-all ${
                    pin[idx]
                      ? 'border-[#294C3C] bg-white text-[#294C3C] shadow-xs'
                      : 'border-[#DDE5DF] bg-white/50 text-transparent'
                  }`}
                >
                  {pin[idx] ? '●' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPin('');
                  else if (k === '⌫') handleBackspace();
                  else handleKeypad(k);
                }}
                className={`h-12 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center justify-center ${
                  k === 'C'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : k === '⌫'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    : 'bg-[#F7F8F5] hover:bg-[#E8EDE9] text-[#26342C] border border-[#DDE5DF] shadow-xs'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {activeShift ? (
              <button
                type="button"
                disabled={isSubmitting || !currentStaff?.isActive}
                onClick={handleClockOut}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>ÇIKIŞ YAP (MESAİ BİTİR)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !currentStaff?.isActive}
                onClick={handleClockIn}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#294C3C] to-[#3B6B55] hover:from-[#213e31] hover:to-[#2f5544] text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>GİRİŞ YAP (MESAİ BAŞLAT)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
