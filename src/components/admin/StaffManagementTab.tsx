/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffCategory, StaffMember, StaffSalaryType, TimeRecord } from '../../types';
import {
  Users,
  Shield,
  Clock,
  DollarSign,
  Download,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Calendar,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react';

import { SecurityGuardsTab } from './SecurityGuardsTab';

const CATEGORIES: StaffCategory[] = [
  'Güvenlik',
  'Temizlik',
  'Cafeterya / Lounge Cafe',
  'Meydancı',
  'Teknik bakım',
  'Diğer',
];

export const StaffManagementTab: React.FC = () => {
  const {
    staffList,
    siteGuards,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    toggleStaffActiveStatus,
    resetStaffPin,
    timeRecords,
    adminAdjustTimeRecord,
    payrollRecords,
    calculateStaffPayroll,
    approvePayrollRecord,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'attendance' | 'payroll' | 'guards' | 'export'>('roster');
  const [selectedCategory, setSelectedCategory] = useState<StaffCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [resetPinStaff, setResetPinStaff] = useState<StaffMember | null>(null);
  const [newPinValue, setNewPinValue] = useState('1234');
  const [adjustingRecord, setAdjustingRecord] = useState<TimeRecord | null>(null);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustClockIn, setAdjustClockIn] = useState('');
  const [adjustClockOut, setAdjustClockOut] = useState('');

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formSurname, setFormSurname] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategory, setFormCategory] = useState<StaffCategory>('Güvenlik');
  const [formSalaryType, setFormSalaryType] = useState<StaffSalaryType>('monthly');
  const [formBaseSalary, setFormBaseSalary] = useState<number>(24000);
  const [formHourlyRate, setFormHourlyRate] = useState<number>(150);
  const [formShift, setFormShift] = useState('Gündüz (08:00 - 16:00)');
  const [formNotes, setFormNotes] = useState('');
  const [formPin, setFormPin] = useState('1234');

  // Selected Month for Payroll
  const [payrollMonth, setPayrollMonth] = useState('2026-02');

  const filteredStaff = staffList.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      `${s.name} ${s.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormSurname('');
    setFormPhone('+90 53');
    setFormCategory('Güvenlik');
    setFormSalaryType('monthly');
    setFormBaseSalary(24000);
    setFormHourlyRate(150);
    setFormShift('Gündüz (08:00 - 16:00)');
    setFormNotes('');
    setFormPin('1234');
    setShowAddModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormSurname(staff.surname);
    setFormPhone(staff.phone || '');
    setFormCategory(staff.category || 'Güvenlik');
    setFormSalaryType(staff.salaryType || 'monthly');
    setFormBaseSalary(staff.baseSalary || 24000);
    setFormHourlyRate(staff.hourlyRate || 150);
    setFormShift(staff.shift || 'Gündüz (08:00 - 16:00)');
    setFormNotes(staff.notes || '');
    setShowAddModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSurname.trim()) return;

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name: formName.trim(),
        surname: formSurname.trim(),
        phone: formPhone.trim(),
        category: formCategory,
        salaryType: formSalaryType,
        baseSalary: Number(formBaseSalary) || 24000,
        hourlyRate: Number(formHourlyRate) || 150,
        shift: formShift,
        notes: formNotes.trim(),
      });
    } else {
      await addStaffMember(
        {
          name: formName.trim(),
          surname: formSurname.trim(),
          phone: formPhone.trim(),
          category: formCategory,
          salaryType: formSalaryType,
          baseSalary: Number(formBaseSalary) || 24000,
          hourlyRate: Number(formHourlyRate) || 150,
          shift: formShift,
          notes: formNotes.trim(),
          isActive: true,
        },
        formPin.trim() || '1234'
      );
    }

    setShowAddModal(false);
  };

  const handleResetPinSubmit = async () => {
    if (!resetPinStaff || !newPinValue.trim()) return;
    await resetStaffPin(resetPinStaff.id, newPinValue.trim());
    setResetPinStaff(null);
    setNewPinValue('1234');
  };

  const handleAdjustAttendanceSubmit = () => {
    if (!adjustingRecord || !adjustReason.trim()) return;
    adminAdjustTimeRecord(
      adjustingRecord.id,
      {
        clockIn: adjustClockIn,
        clockOut: adjustClockOut,
        status: 'admin_adjusted',
      },
      adjustReason.trim()
    );
    setAdjustingRecord(null);
    setAdjustReason('');
  };

  const exportCsv = (type: 'attendance' | 'payroll') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Turkish character support

    if (type === 'attendance') {
      csvContent += 'Tarih,Personel,Kategori,Giriş Saati,Çıkış Saati,Toplam Saat,Fazla Mesai,Durum,Yönetici Düzeltmesi,Düzeltme Nedeni\n';
      timeRecords.forEach((r) => {
        csvContent += `"${r.date}","${r.staffName}","${r.category}","${r.clockIn}","${r.clockOut || '-'}","${r.totalHours || 0}","${r.overtimeHours || 0}","${r.status}","${r.editedBy || '-'}","${r.editReason || '-'}"\n`;
      });
    } else {
      csvContent += 'Dönem,Personel,Kategori,Normal Saat,Fazla Mesai Saati,Taban Ücret (TL),Mesai Ücreti (TL),Net Ödenecek (TL),Onay Durumu,Onaylayan\n';
      staffList.forEach((s) => {
        const record = calculateStaffPayroll(s.id, payrollMonth);
        csvContent += `"${payrollMonth}","${record.staffName}","${record.category}","${record.totalRegularHours}","${record.totalOvertimeHours}","${record.baseAmount}","${record.overtimeAmount}","${record.netPayable}","${record.isApprovedByAdmin ? 'Onaylandı' : 'Taslak'}","${record.approvedBy || '-'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VivaSite_${type === 'attendance' ? 'Puantaj' : 'Bordro'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#294C3C]" />
            <h2 className="text-xl font-extrabold text-[#294C3C]">Merkezi Personel Yönetimi</h2>
          </div>
          <p className="text-xs text-[#26342C]/70 mt-1">
            Güvenlik, Temizlik, Cafe, Teknik ve Meydancı kadroları, vardiya puantajı ve yönetimsel bordro
          </p>
        </div>

        {/* Sub-tab navigation pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F8F5] border border-[#DDE5DF] rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'roster'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personel Kadrosu ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'attendance'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Puantaj & Vardiya ({timeRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'payroll'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Bordro & Ücret</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'guards'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Nizamiye Güvenlik Ekibi ({siteGuards.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('export')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'export'
                ? 'bg-[#294C3C] text-white shadow-xs'
                : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Excel Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STAFF ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          {/* Controls: Search, Category Filter, and Add Staff */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#648875] text-white'
                    : 'bg-[#F7F8F5] text-[#26342C]/80 hover:bg-[#E8EDE9]'
                }`}
              >
                Tümü ({staffList.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = staffList.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#648875] text-white'
                        : 'bg-[#F7F8F5] text-[#26342C]/80 hover:bg-[#E8EDE9]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search & Add Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#26342C]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Personel ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE5DF] bg-[#FFFFFF] text-xs font-medium focus:outline-none focus:border-[#294C3C]"
                />
              </div>

              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#203c2f] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Personel Ekle</span>
              </button>
            </div>
          </div>

          {/* Staff Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className={`p-5 rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between ${
                  staff.isActive
                    ? 'bg-[#FFFFFF] border-[#DDE5DF] hover:border-[#648875]'
                    : 'bg-red-50/50 border-red-200 opacity-80'
                }`}
              >
                <div>
                  {/* Top line: Name & Category badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-[#294C3C]">
                        {staff.name} {staff.surname}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#DDE5DF] text-[#294C3C]">
                          {staff.category || 'Personel'}
                        </span>
                        {staff.shift && (
                          <span className="text-[11px] text-[#26342C]/60 truncate max-w-[150px]">
                            {staff.shift}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active/Passive Switch */}
                    <button
                      onClick={() => toggleStaffActiveStatus(staff.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 ${
                        staff.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title={staff.isActive ? 'Tıkla: Pasife Al' : 'Tıkla: Aktif Yap'}
                    >
                      {staff.isActive ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AKTİF</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>PASİF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Contact & Salary details */}
                  <div className="space-y-1 my-3 text-xs text-[#26342C]/80 border-t border-b border-[#F7F8F5] py-2">
                    <div className="flex justify-between">
                      <span className="text-[#26342C]/60">İletişim:</span>
                      <span className="font-semibold">{staff.phone || 'Girilmedi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#26342C]/60">Taban Ücret:</span>
                      <span className="font-bold text-[#294C3C]">
                        {Number(staff.baseSalary || 24000).toLocaleString('tr-TR')} TL
                        {staff.salaryType === 'hourly' ? '/saat' : '/ay'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#26342C]/60">Mesai Saatlik:</span>
                      <span className="font-semibold text-emerald-700">
                        {staff.hourlyRate || 150} TL/saat
                      </span>
                    </div>
                    {staff.notes && (
                      <div className="text-[11px] text-[#26342C]/60 italic mt-1 line-clamp-1">
                        Not: {staff.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      setResetPinStaff(staff);
                      setNewPinValue('1234');
                    }}
                    className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F7F8F5] text-[#26342C]/80 text-xs font-bold flex items-center gap-1"
                    title="PIN Kodunu Sıfırla"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#648875]" />
                    <span>PIN</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(staff)}
                      className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#F7F8F5] text-[#26342C]/80"
                      title="Bilgileri Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`${staff.name} ${staff.surname} personelini arşivlemek ve silmek istiyor musunuz? Geçmiş vardiya ve nöbet kayıtları saklanacaktır.`)) {
                          deleteStaffMember(staff.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                      title="Arşivle / Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-[#F7F8F5] border border-dashed border-[#DDE5DF]">
              <Users className="w-8 h-8 text-[#26342C]/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#26342C]/70">Personel bulunamadı</p>
              <p className="text-xs text-[#26342C]/50 mt-1">Filtrelerinizi temizleyin veya yeni personel ekleyin.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ATTENDANCE & PUANTAJ */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#294C3C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#648875]" />
              <span>Canlı Puantaj ve Vardiya Kayıtları</span>
            </h3>
            <button
              onClick={() => exportCsv('attendance')}
              className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-[#648875]" />
              <span>CSV İndir</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DDE5DF] bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] text-[#26342C]/80 font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Personel & Kategori</th>
                  <th className="py-3 px-4">Giriş Saati</th>
                  <th className="py-3 px-4">Çıkış Saati</th>
                  <th className="py-3 px-4">Toplam Süre</th>
                  <th className="py-3 px-4">Fazla Mesai</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Yönetici İşlemi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {timeRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#294C3C]">{r.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#26342C]">{r.staffName}</div>
                      <div className="text-[11px] text-[#26342C]/60">{r.category}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{r.clockIn}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#26342C]/80">
                      {r.clockOut || (
                        <span className="text-amber-600 animate-pulse font-sans font-bold">Devam Ediyor</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold">{r.totalHours ? `${r.totalHours} saat` : '-'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {r.overtimeHours ? `+${r.overtimeHours} saat` : '0 saat'}
                    </td>
                    <td className="py-3 px-4">
                      {r.status === 'working' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          MESAİDE
                        </span>
                      ) : r.status === 'admin_adjusted' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800" title={`Düzeltme: ${r.editReason} (${r.editedBy})`}>
                          YÖNETİCİ DÜZELTTİ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          TAMAMLANDI
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingRecord(r);
                          setAdjustClockIn(r.clockIn);
                          setAdjustClockOut(r.clockOut || '16:00');
                          setAdjustReason('');
                        }}
                        className="p-1.5 rounded-lg border border-[#DDE5DF] hover:bg-[#E8EDE9] text-[#294C3C] font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Düzelt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MANAGERIAL PAYROLL */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#294C3C]" />
              <div>
                <label className="text-xs font-bold text-[#26342C]/70 block">Bordro Hesaplama Ayı</label>
                <select
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] bg-white font-bold text-xs text-[#294C3C]"
                >
                  <option value="2026-02">Şubat 2026</option>
                  <option value="2026-01">Ocak 2026</option>
                  <option value="2025-12">Aralık 2025</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium max-w-md">
              <span className="font-bold">Bilgilendirme:</span> Bu ekran site yönetiminin iç puantaj ve mesai hakediş takibi içindir; resmi SGK e-bildirge bordrosu yerine geçmez.
            </div>
          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#DDE5DF] bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F5] text-[#26342C]/80 font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-3 px-4">Personel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Normal Saat</th>
                  <th className="py-3 px-4">Fazla Mesai</th>
                  <th className="py-3 px-4">Taban Ücret</th>
                  <th className="py-3 px-4">Mesai Tutarı (1.5x)</th>
                  <th className="py-3 px-4 font-extrabold text-[#294C3C]">Net Hakediş</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]">
                {staffList.map((s) => {
                  const pay = calculateStaffPayroll(s.id, payrollMonth);
                  return (
                    <tr key={s.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#26342C]">
                        {pay.staffName}
                      </td>
                      <td className="py-3 px-4 text-[#26342C]/70">{pay.category}</td>
                      <td className="py-3 px-4 font-semibold">{pay.totalRegularHours} sa</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">+{pay.totalOvertimeHours} sa</td>
                      <td className="py-3 px-4">{pay.baseAmount.toLocaleString('tr-TR')} TL</td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">
                        {pay.overtimeAmount.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="py-3 px-4 font-extrabold text-sm text-[#294C3C]">
                        {pay.netPayable.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="py-3 px-4">
                        {pay.isApprovedByAdmin ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            ONAYLANDI
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                            TASLAK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!pay.isApprovedByAdmin ? (
                          <button
                            onClick={() => approvePayrollRecord(pay.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#294C3C] hover:bg-[#203c2f] text-white font-bold text-[11px] shadow-xs inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Onayla</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">✓ Onaylı</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EXPORT */}
      {activeSubTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border-2 border-[#DDE5DF] bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#294C3C]">Vardiya ve Puantaj Çizelgesi</h3>
              <p className="text-xs text-[#26342C]/70 mt-1">
                Tüm personelin günlük giriş-çıkış saatleri, çalışma süreleri ve fazla mesai kayıtlarını Excel formatında indirin.
              </p>
            </div>
            <button
              onClick={() => exportCsv('attendance')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#294C3C] hover:bg-[#203c2f] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Puantaj Tablosunu İndir (.CSV)</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl border-2 border-[#DDE5DF] bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DDE5DF] text-[#294C3C] flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#294C3C]">Yönetimsel Bordro Pusulası</h3>
              <p className="text-xs text-[#26342C]/70 mt-1">
                Seçili aya ait toplam çalışma saatleri, fazla mesai hakedişleri ve net ödenecek tutarları Excel formatında indirin.
              </p>
            </div>
            <button
              onClick={() => exportCsv('payroll')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#648875] hover:bg-[#527061] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Bordro Listesini İndir (.CSV)</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: SECURITY GUARDS ROSTER */}
      {activeSubTab === 'guards' && <SecurityGuardsTab />}

      {/* MODAL: Add / Edit Staff */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-3xl shadow-2xl border-2 border-[#DDE5DF] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#294C3C] text-white">
              <h3 className="text-base font-bold">
                {editingStaff ? 'Personel Bilgilerini Düzenle' : 'Yeni Personel Tanımla'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    value={formSurname}
                    onChange={(e) => setFormSurname(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StaffCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Telefon</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Ücret Tipi</label>
                  <select
                    value={formSalaryType}
                    onChange={(e) => setFormSalaryType(e.target.value as StaffSalaryType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  >
                    <option value="monthly">Aylık Sabit</option>
                    <option value="hourly">Saatlik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Taban Ücret (TL)</label>
                  <input
                    type="number"
                    value={formBaseSalary}
                    onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Mesai Saatlik (TL)</label>
                  <input
                    type="number"
                    value={formHourlyRate}
                    onChange={(e) => setFormHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Vardiya / Çalışma Saati</label>
                <input
                  type="text"
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  placeholder="Gündüz (08:00 - 16:00)"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                />
              </div>

              {!editingStaff && (
                <div>
                  <label className="text-xs font-bold text-[#26342C]/80 block mb-1">
                    Giriş PIN Kodu (4 Hane)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold tracking-widest text-center"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Yönetim Notu</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Personel hakkında görev notları..."
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#294C3C] hover:bg-[#203c2f] text-white text-xs font-bold shadow-xs"
                >
                  {editingStaff ? 'Değişiklikleri Kaydet' : 'Personeli Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset PIN */}
      {resetPinStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#DDE5DF]">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-[#294C3C]" />
              <h3 className="text-sm font-bold text-[#294C3C]">PIN Sıfırla</h3>
            </div>
            <p className="text-xs text-[#26342C]/70 mb-4">
              <strong>{resetPinStaff.name} {resetPinStaff.surname}</strong> için yeni 4 haneli puantaj PIN kodunu belirleyin.
            </p>
            <input
              type="text"
              maxLength={6}
              value={newPinValue}
              onChange={(e) => setNewPinValue(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#DDE5DF] text-center text-lg font-bold tracking-widest text-[#294C3C] mb-4"
              placeholder="1234"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetPinStaff(null)}
                className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleResetPinSubmit}
                className="px-4 py-2 rounded-xl bg-[#294C3C] text-white text-xs font-bold shadow-xs"
              >
                PIN'i Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Attendance */}
      {adjustingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#DDE5DF]">
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="w-5 h-5 text-[#294C3C]" />
              <h3 className="text-sm font-bold text-[#294C3C]">Vardiya Saatini Düzelt</h3>
            </div>
            <p className="text-xs text-[#26342C]/70 mb-4">
              {adjustingRecord.staffName} ({adjustingRecord.date})
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Giriş Saati</label>
                <input
                  type="text"
                  value={adjustClockIn}
                  onChange={(e) => setAdjustClockIn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Çıkış Saati</label>
                <input
                  type="text"
                  value={adjustClockOut}
                  onChange={(e) => setAdjustClockOut(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-[#26342C]/80 block mb-1">Düzeltme Nedeni *</label>
              <input
                type="text"
                required
                placeholder="Örn: Unutulan çıkış kaydı tamamlandı"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE5DF] text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingRecord(null)}
                className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] text-xs font-bold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleAdjustAttendanceSubmit}
                className="px-4 py-2 rounded-xl bg-[#294C3C] text-white text-xs font-bold shadow-xs"
              >
                Kaydet ve Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
