/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  UserX,
  UserCheck,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import { SecurityGuard, SecurityShift, SecurityDutyStatus } from '../../types';

export const SecurityGuardsTab: React.FC = () => {
  const {
    siteGuards,
    addSecurityGuard,
    updateSecurityGuard,
    deleteSecurityGuard,
    toggleGuardActiveStatus,
    resetSecurityGuardPin,
  } = useApp();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'passive' | 'schedule'>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuard, setEditingGuard] = useState<SecurityGuard | null>(null);
  const [resetPinGuard, setResetPinGuard] = useState<SecurityGuard | null>(null);

  // New Guard Form State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState<SecurityShift>('Gündüz (08:00 - 16:00)');
  const [dutyStatus, setDutyStatus] = useState<SecurityDutyStatus>('gorevde');
  const [pin, setPin] = useState('1234');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Reset PIN Form State
  const [newPin, setNewPin] = useState('');
  const [pinResetError, setPinResetError] = useState('');
  const [pinResetSuccess, setPinResetSuccess] = useState('');

  // Auto-dismiss success notification
  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Filtered Guards
  const filteredGuards = siteGuards.filter((guard) => {
    // Search query
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchesSearch =
      guard.name.toLowerCase().includes(cleanSearch) ||
      guard.surname.toLowerCase().includes(cleanSearch) ||
      (guard.phone && guard.phone.includes(cleanSearch)) ||
      (guard.username && guard.username.toLowerCase().includes(cleanSearch));

    if (!matchesSearch) return false;

    // Shift Filter
    if (shiftFilter !== 'all' && guard.shift !== shiftFilter) {
      return false;
    }

    // Status Tab
    if (filterTab === 'active') return guard.isActive;
    if (filterTab === 'passive') return !guard.isActive;
    return true;
  });

  // Shift Stats
  const activeCount = siteGuards.filter((g) => g.isActive).length;
  const onDutyCount = siteGuards.filter((g) => g.isActive && g.dutyStatus === 'gorevde').length;
  const onBreakCount = siteGuards.filter((g) => g.isActive && (g.dutyStatus === 'molada' || g.dutyStatus === 'izinli')).length;
  const passiveCount = siteGuards.filter((g) => !g.isActive).length;

  // Handle Add Guard
  const handleAddGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !surname.trim()) {
      setFormError('Personel adı ve soyadı zorunludur.');
      return;
    }

    if (pin.trim().length !== 4 || isNaN(Number(pin))) {
      setFormError('PIN kodu tam olarak 4 haneli sayı olmalıdır (Örn: 1234).');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSecurityGuard(
        {
          name: name.trim(),
          surname: surname.trim(),
          phone: phone.trim() || '+90 532 000 00 00',
          username: `${name.toLowerCase()}.${surname.toLowerCase()}`.replace(/\s+/g, ''),
          shift,
          dutyStatus,
          isActive: true,
          notes: notes.trim(),
        },
        pin.trim()
      );

      triggerSuccess(`Güvenlik görevlisi ${name} ${surname} başarıyla eklendi ve şifresi güvenli (SHA-256) olarak tanımlandı.`);
      setShowAddModal(false);
      setName('');
      setSurname('');
      setPhone('');
      setPin('1234');
      setNotes('');
    } catch {
      setFormError('Personel kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Guard
  const handleUpdateGuard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuard) return;

    updateSecurityGuard(editingGuard.id, {
      name: editingGuard.name.trim(),
      surname: editingGuard.surname.trim(),
      phone: editingGuard.phone?.trim(),
      shift: editingGuard.shift,
      dutyStatus: editingGuard.dutyStatus,
      notes: editingGuard.notes?.trim(),
    });

    triggerSuccess(`${editingGuard.name} ${editingGuard.surname} bilgileri güncellendi.`);
    setEditingGuard(null);
  };

  // Handle Reset PIN
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinResetError('');
    setPinResetSuccess('');

    if (!resetPinGuard) return;
    if (newPin.trim().length !== 4 || isNaN(Number(newPin))) {
      setPinResetError('Yeni PIN kodu tam olarak 4 haneli rakamlardan oluşmalıdır.');
      return;
    }

    const success = await resetSecurityGuardPin(resetPinGuard.id, newPin.trim());
    if (success) {
      setPinResetSuccess(`${resetPinGuard.name} için yeni 4 haneli PIN kodu SHA-256 ile şifrelenerek kaydedildi.`);
      setTimeout(() => {
        setResetPinGuard(null);
        setNewPin('');
        setPinResetSuccess('');
      }, 1500);
    } else {
      setPinResetError('PIN güncellenemedi. Lütfen tekrar deneyiniz.');
    }
  };

  // Auto Generate Random 4-digit PIN
  const generateRandomPin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(random);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#648875]">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#26342C]/60">Toplam</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#294C3C]">{siteGuards.length}</p>
          <p className="text-xs text-[#26342C]/60">Kayıtlı Güvenlik Personeli</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <UserCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#26342C]/60">Nöbette</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{onDutyCount}</p>
          <p className="text-xs text-[#26342C]/60">Şu An Görevde</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#26342C]/60">Molada / İzin</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700">{onBreakCount}</p>
          <p className="text-xs text-[#26342C]/60">İzinli veya Molada</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <UserX className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#26342C]/60">Erişim Kapalı</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-700">{passiveCount}</p>
          <p className="text-xs text-[#26342C]/60">Pasif / Engellenen</p>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#26342C]/40" />
            <input
              type="text"
              placeholder="Personel adı, soyadı veya telefon numarasıyla ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-medium focus:bg-white focus:border-[#648875] outline-none transition-all"
            />
          </div>

          {/* Add Staff Button (Requirement: No 6-person limit) */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all touch-target cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-emerald-300" />
            <span>Yeni Güvenlik Personeli Ekle (+)</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DDE5DF]/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-[#294C3C] text-white'
                  : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
              }`}
            >
              Tüm Personel ({siteGuards.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'active'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
              }`}
            >
              Aktif Görevliler ({activeCount})
            </button>
            <button
              onClick={() => setFilterTab('passive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'passive'
                  ? 'bg-rose-700 text-white'
                  : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
              }`}
            >
              Pasif / Engellenen ({passiveCount})
            </button>
            <button
              onClick={() => setFilterTab('schedule')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterTab === 'schedule'
                  ? 'bg-[#648875] text-white'
                  : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#DDE5DF]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vardiya Çizelgesi</span>
            </button>
          </div>

          {/* Shift Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#26342C]/60 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vardiya:</span>
            </span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-bold text-[#294C3C] outline-none cursor-pointer"
            >
              <option value="all">Tüm Vardiyalar</option>
              <option value="Gündüz (08:00 - 16:00)">Gündüz (08:00 - 16:00)</option>
              <option value="Akşam (16:00 - 00:00)">Akşam (16:00 - 00:00)</option>
              <option value="Gece (00:00 - 08:00)">Gece (00:00 - 08:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode: SCHEDULE VIEW */}
      {filterTab === 'schedule' && (
        <div className="p-6 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-luxury font-bold text-[#294C3C]">Bugünkü Vardiya & Nöbet Çizelgesi</h3>
              <p className="text-xs text-[#26342C]/65">Güvenlik personelinin günlük görev dağılımı</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#648875]/15 text-[#294C3C]">
              Bugün: 24 Saat Kesintisiz Güvenlik
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shift 1 */}
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Gündüz Vardiyası</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  08:00 - 16:00
                </span>
              </div>
              <div className="space-y-2">
                {siteGuards
                  .filter((g) => g.shift?.includes('Gündüz') && g.isActive)
                  .map((g) => (
                    <div key={g.id} className="p-2.5 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#294C3C]">{g.name} {g.surname}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.dutyStatus === 'gorevde' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.dutyStatus === 'gorevde' ? 'Nöbette' : g.dutyStatus === 'molada' ? 'Molada' : 'İzinli'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Shift 2 */}
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-[#648875]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#294C3C] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#648875]" />
                  <span>Akşam Vardiyası</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#648875]/15 text-[#294C3C]">
                  16:00 - 00:00
                </span>
              </div>
              <div className="space-y-2">
                {siteGuards
                  .filter((g) => g.shift?.includes('Akşam') && g.isActive)
                  .map((g) => (
                    <div key={g.id} className="p-2.5 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#294C3C]">{g.name} {g.surname}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.dutyStatus === 'gorevde' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.dutyStatus === 'gorevde' ? 'Nöbette' : g.dutyStatus === 'molada' ? 'Molada' : 'İzinli'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Shift 3 */}
            <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Gece Vardiyası</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                  00:00 - 08:00
                </span>
              </div>
              <div className="space-y-2">
                {siteGuards
                  .filter((g) => g.shift?.includes('Gece') && g.isActive)
                  .map((g) => (
                    <div key={g.id} className="p-2.5 rounded-xl bg-white border border-[#DDE5DF] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#294C3C]">{g.name} {g.surname}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.dutyStatus === 'gorevde' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.dutyStatus === 'gorevde' ? 'Nöbette' : g.dutyStatus === 'molada' ? 'Molada' : 'İzinli'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGuards.map((guard) => {
          return (
            <div
              key={guard.id}
              className={`p-5 rounded-3xl bg-white border-2 transition-all space-y-4 shadow-xs ${
                guard.isActive
                  ? 'border-[#DDE5DF] hover:border-[#648875]'
                  : 'border-rose-200 bg-rose-50/20 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-luxury font-black text-base shadow-xs ${
                      guard.isActive
                        ? 'bg-[#648875] text-white'
                        : 'bg-rose-200 text-rose-800'
                    }`}
                  >
                    {guard.name[0]}
                    {guard.surname[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#294C3C]">
                        {guard.name} {guard.surname}
                      </h4>
                      {guard.isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          Erişimi Engellendi (Pasif)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#26342C]/70 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#648875]" />
                      <span>{guard.phone || 'Telefon Kayıtsız'}</span>
                      <span className="text-[#26342C]/40">·</span>
                      <span className="font-mono text-[11px] text-[#26342C]/60">@{guard.username}</span>
                    </p>
                  </div>
                </div>

                {/* Duty Status Badge */}
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl tracking-wider ${
                    guard.dutyStatus === 'gorevde'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : guard.dutyStatus === 'molada'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {guard.dutyStatus === 'gorevde'
                    ? 'GÖREVDE'
                    : guard.dutyStatus === 'molada'
                    ? 'MOLADA'
                    : 'İZİNLİ'}
                </span>
              </div>

              {/* Shift & Notes Info Box */}
              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#26342C]">
                  <span className="font-semibold text-[#26342C]/70 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#648875]" />
                    <span>Çalışma Vardiyası:</span>
                  </span>
                  <span className="font-bold text-[#294C3C]">{guard.shift || 'Gündüz (08:00 - 16:00)'}</span>
                </div>
                {guard.notes && (
                  <p className="text-[11px] text-[#26342C]/65 border-t border-[#DDE5DF]/60 pt-1.5">
                    <strong>Görev Notu:</strong> {guard.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DDE5DF]/70">
                <div className="flex items-center gap-2">
                  {/* Reset PIN Button */}
                  <button
                    onClick={() => {
                      setResetPinGuard(guard);
                      setNewPin('');
                      setPinResetError('');
                      setPinResetSuccess('');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
                    title="4 Haneli Güvenlik PIN Kodunu Sıfırla"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#648875]" />
                    <span>PIN Sıfırla</span>
                  </button>

                  {/* Edit Guard Details */}
                  <button
                    onClick={() => setEditingGuard(guard)}
                    className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-1.5 shadow-2xs"
                    title="Personel Bilgilerini Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#648875]" />
                    <span>Düzenle</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Active / Passive */}
                  <button
                    onClick={() => toggleGuardActiveStatus(guard.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      guard.isActive
                        ? 'border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                        : 'border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                    }`}
                    title={guard.isActive ? 'Personeli geçici olarak pasife al' : 'Personeli aktifleştir'}
                  >
                    {guard.isActive ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pasife Al</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aktifleştir</span>
                      </>
                    )}
                  </button>

                  {/* Archive / Delete Guard (Soft delete protects records) */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `${guard.name} ${guard.surname} hesabını arşivlemek/silmek istediğinize emin misiniz? Geçmiş misafir ve kargo işlem kayıtları silinmeyecek, korunacaktır.`
                        )
                      ) {
                        deleteSecurityGuard(guard.id);
                        triggerSuccess(`${guard.name} ${guard.surname} arşive kaldırıldı.`);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                    title="Hesabı Güvenle Arşivle / Sil (Geçmiş kayıtlar kaybolmaz)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredGuards.length === 0 && (
          <div className="col-span-full p-8 rounded-3xl bg-white border border-[#DDE5DF] text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#648875] mx-auto opacity-40" />
            <h4 className="text-base font-bold text-[#294C3C]">Personel Bulunamadı</h4>
            <p className="text-xs text-[#26342C]/65 max-w-sm mx-auto">
              Arama kriterlerine uygun güvenlik personeli bulunmamaktadır. Yeni personel ekleyebilir veya filtreleri temizleyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: YENİ GÜVENLİK PERSONELİ EKLE                    */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-[#DDE5DF] w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                  <UserPlus className="w-5 h-5 text-[#294C3C]" />
                </div>
                <div>
                  <h3 className="text-base font-luxury font-bold text-[#294C3C]">Yeni Güvenlik Personeli Ekle</h3>
                  <p className="text-xs text-[#26342C]/65">Nizamiye ekibine yeni personel tanımlayın</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </p>
            )}

            <form onSubmit={handleAddGuard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Personel Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kemal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Soyadı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Arslan"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Telefon Numarası</label>
                  <input
                    type="tel"
                    placeholder="+90 532 000 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Giriş PIN Kodu (4 Hane)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-mono font-bold text-[#294C3C] focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Vardiya</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as SecurityShift)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold text-[#294C3C] outline-none"
                  >
                    <option value="Gündüz (08:00 - 16:00)">Gündüz (08:00 - 16:00)</option>
                    <option value="Akşam (16:00 - 00:00)">Akşam (16:00 - 00:00)</option>
                    <option value="Gece (00:00 - 08:00)">Gece (00:00 - 08:00)</option>
                    <option value="Hafta Sonu Nöbeti">Hafta Sonu Nöbeti</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Başlangıç Durumu</label>
                  <select
                    value={dutyStatus}
                    onChange={(e) => setDutyStatus(e.target.value as SecurityDutyStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold text-[#294C3C] outline-none"
                  >
                    <option value="gorevde">Görevde (Nöbette)</option>
                    <option value="molada">Molada</option>
                    <option value="izinli">İzinli</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#294C3C]">Görev Bölgesi / Notlar (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: 2 Nolu Nizamiye Kapısı & Bariyer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-medium focus:bg-white focus:border-[#648875] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center gap-2 text-[11px] text-[#26342C]/70">
                <Lock className="w-4 h-4 text-[#648875] shrink-0" />
                <span>PIN kodları açık metin olarak saklanmaz, doğrudan SHA-256 algoritmasıyla şifrelenir.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-md transition-all touch-target disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Personeli Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: GÜVENLİK PERSONELİ DÜZENLE                      */}
      {/* ======================================================== */}
      {editingGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-[#DDE5DF] w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                  <Edit2 className="w-5 h-5 text-[#294C3C]" />
                </div>
                <div>
                  <h3 className="text-base font-luxury font-bold text-[#294C3C]">Personel Bilgilerini Düzenle</h3>
                  <p className="text-xs text-[#26342C]/65">{editingGuard.name} {editingGuard.surname}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingGuard(null)}
                className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGuard} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Adı</label>
                  <input
                    type="text"
                    required
                    value={editingGuard.name}
                    onChange={(e) => setEditingGuard({ ...editingGuard, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Soyadı</label>
                  <input
                    type="text"
                    required
                    value={editingGuard.surname}
                    onChange={(e) => setEditingGuard({ ...editingGuard, surname: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Telefon</label>
                  <input
                    type="tel"
                    value={editingGuard.phone || ''}
                    onChange={(e) => setEditingGuard({ ...editingGuard, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold focus:bg-white focus:border-[#648875] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#294C3C]">Vardiya</label>
                  <select
                    value={editingGuard.shift || 'Gündüz (08:00 - 16:00)'}
                    onChange={(e) => setEditingGuard({ ...editingGuard, shift: e.target.value as SecurityShift })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold text-[#294C3C] outline-none"
                  >
                    <option value="Gündüz (08:00 - 16:00)">Gündüz (08:00 - 16:00)</option>
                    <option value="Akşam (16:00 - 00:00)">Akşam (16:00 - 00:00)</option>
                    <option value="Gece (00:00 - 08:00)">Gece (00:00 - 08:00)</option>
                    <option value="Hafta Sonu Nöbeti">Hafta Sonu Nöbeti</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#294C3C]">Görev Durumu</label>
                <select
                  value={editingGuard.dutyStatus || 'gorevde'}
                  onChange={(e) => setEditingGuard({ ...editingGuard, dutyStatus: e.target.value as SecurityDutyStatus })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-semibold text-[#294C3C] outline-none"
                >
                  <option value="gorevde">Görevde (Nöbette)</option>
                  <option value="molada">Molada</option>
                  <option value="izinli">İzinli</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#294C3C]">Notlar</label>
                <input
                  type="text"
                  value={editingGuard.notes || ''}
                  onChange={(e) => setEditingGuard({ ...editingGuard, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-medium focus:bg-white focus:border-[#648875] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGuard(null)}
                  className="flex-1 py-3 rounded-2xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-md transition-all touch-target"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: GÜVENLİK PIN SIFIRLA                            */}
      {/* ======================================================== */}
      {resetPinGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border-2 border-[#DDE5DF] w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 text-[#26342C]">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                  <KeyRound className="w-5 h-5 text-[#294C3C]" />
                </div>
                <div>
                  <h3 className="text-base font-luxury font-bold text-[#294C3C]">PIN Kodunu Sıfırla</h3>
                  <p className="text-xs text-[#26342C]/65">{resetPinGuard.name} {resetPinGuard.surname}</p>
                </div>
              </div>
              <button
                onClick={() => setResetPinGuard(null)}
                className="p-2 rounded-xl text-[#26342C]/60 hover:text-[#26342C] hover:bg-[#F7F8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinResetError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinResetError}</span>
              </p>
            )}

            {pinResetSuccess && (
              <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{pinResetSuccess}</span>
              </p>
            )}

            <form onSubmit={handleResetPin} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#294C3C]">Yeni 4 Haneli PIN Kodu</label>
                  <button
                    type="button"
                    onClick={generateRandomPin}
                    className="text-[11px] font-bold text-[#648875] hover:text-[#294C3C] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rastgele Üret</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="Örn: 5821"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-center text-lg font-mono font-black text-[#294C3C] tracking-widest focus:bg-white focus:border-[#648875] outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-1 text-xs text-[#26342C]/70">
                <div className="flex items-center gap-1.5 font-bold text-[#294C3C]">
                  <Lock className="w-4 h-4 text-[#648875]" />
                  <span>Güvenlik Doğrulaması</span>
                </div>
                <p className="text-[11px]">
                  Tanımladığınız yeni PIN anında SHA-256 ile şifrelenir. Güvenlik personeli güvenlik konsolu ekranında bu PIN ile oturum açabilir.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPinGuard(null)}
                  className="flex-1 py-3 rounded-2xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-md transition-all touch-target"
                >
                  PIN'i Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
