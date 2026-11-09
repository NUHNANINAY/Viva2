/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Search,
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Save,
  UserCheck,
  CreditCard,
  DollarSign,
  AlertCircle,
  Clock,
  Calendar,
  Check,
  CheckCircle,
  Receipt,
  Sparkles,
  Upload,
  FileText,
  Camera,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { SiteResident, DueItem, DuePaymentStatus, DueCategory, ExpenseRecord } from '../../types';

export const ResidentsTab: React.FC = () => {
  const {
    siteResidents,
    siteInfo,
    addResidentToSite,
    updateResident,
    deleteResident,
    duesList,
    addDueItem,
    updateDuePayment,
    expenses,
    addExpense,
    updateExpensePayment,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'residents' | 'dues' | 'expenses'>('residents');
  const [query, setQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('all');

  // Expense & OCR State
  const [expenseCatFilter, setExpenseCatFilter] = useState<string>('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseInvoiceNo, setExpenseInvoiceNo] = useState('');
  const [expenseTaxId, setExpenseTaxId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseDueDate, setExpenseDueDate] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseVat, setExpenseVat] = useState<number>(0);
  const [expenseTotal, setExpenseTotal] = useState<number>(0);
  const [expenseCat, setExpenseCat] = useState<any>('elektrik');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');

  // Dues state
  const [duePeriodFilter, setDuePeriodFilter] = useState<string>('all');
  const [dueStatusFilter, setDueStatusFilter] = useState<string>('all');
  const [dueQuery, setDueQuery] = useState('');

  // Bulk assessment modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPeriod, setBulkPeriod] = useState('Şubat 2026');
  const [bulkYear, setBulkYear] = useState(2026);
  const [bulkMonth, setBulkMonth] = useState(2);
  const [bulkAmount, setBulkAmount] = useState(1850);
  const [bulkCategory, setBulkCategory] = useState<DueCategory>('Aidat');
  const [bulkDueDate, setBulkDueDate] = useState('15.02.2026');
  const [bulkMsg, setBulkMsg] = useState('');

  // Payment recording modal state
  const [recordingDue, setRecordingDue] = useState<DueItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<DueItem['paymentMethod']>('Banka Havalesi / EFT');

  // Add resident modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBlock, setNewBlock] = useState(siteInfo.blocks?.[0]?.block || 'A');
  const [newApartment, setNewApartment] = useState('1');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addError, setAddError] = useState('');

  // Edit resident state
  const [editingResident, setEditingResident] = useState<SiteResident | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editApartment, setEditApartment] = useState('');

  // Filtered residents list
  const filteredResidents = useMemo(() => {
    return siteResidents.filter((r) => {
      const matchBlock = blockFilter === 'all' || r.block === blockFilter;
      const q = query.toLocaleLowerCase('tr').trim();
      const matchQuery =
        !q ||
        r.fullName.toLocaleLowerCase('tr').includes(q) ||
        r.block.toLocaleLowerCase('tr').includes(q) ||
        r.apartment.toLocaleLowerCase('tr').includes(q) ||
        (r.phone && r.phone.toLocaleLowerCase('tr').includes(q));
      return matchBlock && matchQuery;
    });
  }, [siteResidents, query, blockFilter]);

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newFullName.trim() || !newPhone.trim()) {
      setAddError('Ad Soyad ve Telefon numarası zorunludur.');
      return;
    }

    const cleanPhone = newPhone.replace(/\s/g, '');
    const isDuplicate = siteResidents.some(
      (r) => r.phone?.replace(/\s/g, '') === cleanPhone
    );
    if (isDuplicate) {
      setAddError('Bu telefon numarası bu sitede zaten kayıtlı.');
      return;
    }

    addResidentToSite({
      block: newBlock,
      apartment: newApartment,
      fullName: newFullName.trim(),
      phone: newPhone.trim(),
      notificationPreference: 'app',
    });

    setNewFullName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const handleStartEdit = (resident: SiteResident) => {
    setEditingResident(resident);
    setEditFullName(resident.fullName);
    setEditPhone(resident.phone || '');
    setEditApartment(resident.apartment);
  };

  const handleSaveEdit = () => {
    if (!editingResident) return;
    updateResident(editingResident.id, {
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      apartment: editApartment.trim(),
    });
    setEditingResident(null);
  };

  const exportToExcel = () => {
    const dataToExport = siteResidents.map((r, idx) => ({
      'No': idx + 1,
      'Site Adı': siteInfo.name,
      'Blok': `${r.block} Blok`,
      'Daire': r.apartment,
      'Sakin Adı Soyadı': r.fullName,
      'Telefon': r.phone || '-',
      'Kullanıcı Adı': r.username || '-',
      'Bildirim Tercihi': r.notificationPreference === 'app' ? 'Uygulama İçi' : 'Kapalı',
      'Kayıt Durumu': 'Aktif',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kayıtlı Sakinler');
    XLSX.writeFile(workbook, `${siteInfo.name}_Sakin_Listesi.xlsx`);
  };

  // Filtered dues
  const filteredDues = useMemo(() => {
    return duesList.filter((d) => {
      const matchPeriod = duePeriodFilter === 'all' || d.period === duePeriodFilter;
      const matchStatus = dueStatusFilter === 'all' || d.status === dueStatusFilter;
      const q = dueQuery.toLocaleLowerCase('tr').trim();
      const matchQ =
        !q ||
        d.residentName?.toLocaleLowerCase('tr').includes(q) ||
        d.block.toLocaleLowerCase('tr').includes(q) ||
        d.apartment.toLocaleLowerCase('tr').includes(q) ||
        d.category.toLocaleLowerCase('tr').includes(q) ||
        d.period.toLocaleLowerCase('tr').includes(q);
      return matchPeriod && matchStatus && matchQ;
    });
  }, [duesList, duePeriodFilter, dueStatusFilter, dueQuery]);

  // Distinct periods in dues
  const distinctPeriods = useMemo(() => {
    const set = new Set<string>();
    duesList.forEach((d) => {
      if (d.period) set.add(d.period);
    });
    return Array.from(set);
  }, [duesList]);

  // Dues aggregates
  const dueStats = useMemo(() => {
    const totalAccrued = duesList.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalCollected = duesList.reduce(
      (acc, d) => acc + (d.paidAmount || (d.status === 'odendi' ? d.amount : 0)),
      0
    );
    const totalPending = Math.max(0, totalAccrued - totalCollected);
    const overdueCount = duesList.filter((d) => d.status === 'odenmedi').length;
    return { totalAccrued, totalCollected, totalPending, overdueCount };
  }, [duesList]);

  // Bulk assessment handler with duplicate prevention
  const handleBulkAssess = () => {
    setBulkMsg('');
    let addedCount = 0;
    let skippedCount = 0;

    const units: { block: string; apartment: string; residentName: string }[] = [];
    if (siteInfo.blocks && siteInfo.blocks.length > 0) {
      siteInfo.blocks.forEach((b) => {
        for (let i = 1; i <= b.apartmentCount; i++) {
          const aptStr = i.toString();
          const matchRes = siteResidents.find((r) => r.block === b.block && r.apartment === aptStr);
          units.push({
            block: b.block,
            apartment: aptStr,
            residentName: matchRes ? matchRes.fullName : `${b.block} Blok No:${aptStr}`,
          });
        }
      });
    } else {
      siteResidents.forEach((r) => {
        units.push({
          block: r.block,
          apartment: r.apartment,
          residentName: r.fullName,
        });
      });
    }

    units.forEach((u) => {
      const exists = duesList.some(
        (d) => d.block === u.block && d.apartment === u.apartment && d.period === bulkPeriod
      );
      if (exists) {
        skippedCount++;
      } else {
        addDueItem({
          block: u.block,
          apartment: u.apartment,
          residentName: u.residentName,
          period: bulkPeriod,
          year: bulkYear,
          month: bulkMonth,
          category: bulkCategory,
          amount: bulkAmount,
          paidAmount: 0,
          remainingAmount: bulkAmount,
          dueDate: bulkDueDate,
          status: 'odenmedi',
        });
        addedCount++;
      }
    });

    setBulkMsg(
      `${addedCount} daireye ${bulkPeriod} tahakkuku oluşturuldu. ${
        skippedCount > 0 ? `(${skippedCount} mükerrer daire korundu)` : ''
      }`
    );
    setTimeout(() => {
      setShowBulkModal(false);
      setBulkMsg('');
    }, 2000);
  };

  const handleSavePayment = () => {
    if (!recordingDue) return;
    updateDuePayment(recordingDue.id, payAmount, payMethod, 'admin_manual');
    setRecordingDue(null);
  };

  const exportDuesToExcel = () => {
    const dataToExport = duesList.map((d, idx) => ({
      No: idx + 1,
      'Site Adı': siteInfo.name,
      Blok: `${d.block} Blok`,
      Daire: d.apartment,
      'Sakin Adı': d.residentName || '-',
      Kategori: d.category,
      Dönem: d.period,
      'Son Ödeme Tarihi': d.dueDate || '-',
      'Tahakkuk (TL)': d.amount,
      'Ödenen (TL)': d.paidAmount || 0,
      'Kalan Borç (TL)': d.remainingAmount ?? d.amount - (d.paidAmount || 0),
      Durum:
        d.status === 'odendi'
          ? 'Ödendi'
          : d.status === 'kismi_odendi'
          ? 'Kısmi Ödendi'
          : 'Ödenmedi',
      'Ödeme Tarihi': d.paidDate || '-',
      'Ödeme Yöntemi': d.paymentMethod || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aidat ve Borçlar');
    XLSX.writeFile(workbook, `${siteInfo.name}_Aidat_Listesi.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Subtab Switcher: Sakinler vs Aidat & Borç */}
      <div className="flex items-center gap-2 border-b border-[#DDE5DF] pb-3">
        <button
          onClick={() => setActiveSection('residents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeSection === 'residents'
              ? 'bg-[#294C3C] text-white shadow-sm'
              : 'bg-white text-[#294C3C] border border-[#DDE5DF] hover:bg-[#F7F8F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kayıtlı Sakinler ({siteResidents.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('dues')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'dues'
              ? 'bg-[#294C3C] text-white shadow-sm'
              : 'bg-white text-[#294C3C] border border-[#DDE5DF] hover:bg-[#F7F8F5]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Aidat & Borç Takibi ({duesList.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'expenses'
              ? 'bg-[#294C3C] text-white shadow-sm'
              : 'bg-white text-[#294C3C] border border-[#DDE5DF] hover:bg-[#F7F8F5]'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-600" />
          <span>Giderler & Fatura OCR ({expenses.length})</span>
        </button>
      </div>

      {/* SECTION 1: RESIDENTS */}
      {activeSection === 'residents' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-luxury font-extrabold text-[#294C3C]">
                  Kayıtlı Site Sakinleri
                </h2>
                <span className="rounded-full bg-[#648875]/15 text-[#294C3C] text-xs font-bold px-2.5 py-0.5 border border-[#648875]/30">
                  {siteResidents.length} Sakin
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70 mt-1">
                {siteInfo.name} sakinleri · Site kayıt ve yönetim listesi
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-2 shadow-2xs"
                title="Excel formatında indir"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel'e Aktar</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Sakin Ekle</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#26342C]/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İsim, telefon, blok veya daire ile ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDE5DF] bg-white text-xs text-[#26342C] focus:outline-none focus:border-[#648875]"
              />
            </div>

            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#294C3C] focus:outline-none focus:border-[#648875]"
            >
              <option value="all">Tüm Bloklar</option>
              {siteInfo.blocks?.map((b) => (
                <option key={b.block} value={b.block}>
                  {b.block} Blok
                </option>
              ))}
            </select>
          </div>

          {/* Residents Grid / Cards */}
          {filteredResidents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredResidents.map((resident) => (
                <div
                  key={resident.id}
                  className="p-4 rounded-2xl border border-[#DDE5DF] bg-white shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#648875]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#648875]/15 border border-[#648875]/30 text-[#294C3C] flex items-center justify-center font-bold text-sm">
                        {resident.block}
                        {resident.apartment}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#294C3C]">
                          {resident.fullName}
                        </h3>
                        <p className="text-xs text-[#26342C]/65 flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#648875]" />
                          <span>
                            {resident.block} Blok · Daire {resident.apartment}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Kayıtlı
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#DDE5DF]/60 flex items-center justify-between text-xs text-[#26342C]/75">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#648875]" />
                      <span>{resident.phone || 'Telefon yok'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(resident)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#294C3C] hover:bg-[#F7F8F5]"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `${resident.fullName} adlı sakini silmek istediğinize emin misiniz?`
                            )
                          ) {
                            deleteResident(resident.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#DDE5DF] text-center space-y-3">
              <Users className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-[#294C3C]">
                Bu filtrede sakin kaydı bulunamadı
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Arama kriterlerinizi değiştirebilir veya yeni sakin kaydı ekleyebilirsiniz.
              </p>
            </div>
          )}
        </>
      )}

      {/* SECTION 2: DUES & DEBT MANAGEMENT */}
      {activeSection === 'dues' && (
        <div className="space-y-6">
          {/* Aggregates Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Toplam Tahakkuk
              </p>
              <p className="text-xl font-extrabold text-[#294C3C] mt-1">
                ₺{dueStats.totalAccrued.toLocaleString('tr-TR')}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{duesList.length} kayıt</p>
            </div>

            <div className="p-4 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Tahsil Edilen
              </p>
              <p className="text-xl font-extrabold text-emerald-900 mt-1">
                ₺{dueStats.totalCollected.toLocaleString('tr-TR')}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-1">Kasa / Banka</p>
            </div>

            <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Kalan Borç
              </p>
              <p className="text-xl font-extrabold text-amber-900 mt-1">
                ₺{dueStats.totalPending.toLocaleString('tr-TR')}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-1">Bekleyen Tahsilat</p>
            </div>

            <div className="p-4 rounded-3xl bg-rose-50/60 border border-rose-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                Ödenmemiş Daire
              </p>
              <p className="text-xl font-extrabold text-rose-900 mt-1">
                {dueStats.overdueCount} Daire
              </p>
              <p className="text-[11px] text-rose-700/80 mt-1">Gecikmiş / Bekleyen</p>
            </div>
          </div>

          {/* Dues Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-luxury font-extrabold text-[#294C3C]">
                  Aidat & Borç Takip Portalı
                </h2>
                <span className="rounded-full bg-[#648875]/15 text-[#294C3C] text-xs font-bold px-2.5 py-0.5 border border-[#648875]/30">
                  {filteredDues.length} Kayıt
                </span>
              </div>
              <p className="text-xs text-[#26342C]/70 mt-1">
                Aylık aidat tahakkukları, tahsilat kayıtları ve daire bazlı bakiye dökümü
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportDuesToExcel}
                className="px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-white hover:bg-[#F7F8F5] text-xs font-bold text-[#294C3C] transition-all flex items-center gap-2 shadow-2xs"
                title="Excel formatında indir"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel'e Aktar</span>
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Toplu Aidat Borçlandır</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#26342C]/40" />
              <input
                type="text"
                value={dueQuery}
                onChange={(e) => setDueQuery(e.target.value)}
                placeholder="Daire, sakin adı veya kategori ile ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DDE5DF] bg-white text-xs text-[#26342C] focus:outline-none focus:border-[#648875]"
              />
            </div>

            <select
              value={duePeriodFilter}
              onChange={(e) => setDuePeriodFilter(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#294C3C] focus:outline-none focus:border-[#648875]"
            >
              <option value="all">Tüm Dönemler</option>
              {distinctPeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={dueStatusFilter}
              onChange={(e) => setDueStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#294C3C] focus:outline-none focus:border-[#648875]"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="odenmedi">Ödenmedi / Beklemede</option>
              <option value="kismi_odendi">Kısmi Ödendi</option>
              <option value="odendi">Ödendi</option>
            </select>
          </div>

          {/* Dues Table */}
          {filteredDues.length > 0 ? (
            <div className="overflow-x-auto rounded-3xl border border-[#DDE5DF] bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F5] border-b border-[#DDE5DF] text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Daire & Blok</th>
                    <th className="py-3 px-4">Sakin Adı</th>
                    <th className="py-3 px-4">Dönem & Kategori</th>
                    <th className="py-3 px-4">Son Ödeme</th>
                    <th className="py-3 px-4 text-right">Tahakkuk</th>
                    <th className="py-3 px-4 text-right">Ödenen</th>
                    <th className="py-3 px-4 text-right">Kalan</th>
                    <th className="py-3 px-4 text-center">Durum</th>
                    <th className="py-3 px-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5DF]/60 text-xs text-[#26342C]">
                  {filteredDues.map((due) => {
                    const remaining =
                      due.remainingAmount ??
                      Math.max(0, due.amount - (due.paidAmount || 0));
                    return (
                      <tr key={due.id} className="hover:bg-[#F7F8F5]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#294C3C]">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-[#648875]/15 border border-[#648875]/30">
                            {due.block} Blok · D:{due.apartment}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">{due.residentName || '-'}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800">{due.period}</p>
                          <p className="text-[11px] text-gray-500">{due.category}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{due.dueDate || '-'}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          ₺{due.amount.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          ₺{(due.paidAmount || 0).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700">
                          ₺{remaining.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {due.status === 'odendi' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle className="w-3 h-3" />
                              Ödendi
                            </span>
                          ) : due.status === 'kismi_odendi' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3" />
                              Kısmi Ödendi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertCircle className="w-3 h-3" />
                              Ödenmedi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setRecordingDue(due);
                              setPayAmount(remaining);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-[11px] font-bold transition-all shadow-2xs"
                          >
                            Tahsilat Gir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#DDE5DF] text-center space-y-3">
              <CreditCard className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-[#294C3C]">
                Bu filtrede aidat kaydı bulunamadı
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                "Toplu Aidat Borçlandır" butonuna basarak tüm dairelere dönemsel aidat tahakkuku yapabilirsiniz.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bulk Assessment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#648875]/20 text-[#294C3C] flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#294C3C]">
                    Toplu Aidat Borçlandır
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sitedeki tüm daireler için otomatik tahakkuk oluşturur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                {bulkMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">
                    Dönem Adı
                  </label>
                  <input
                    type="text"
                    value={bulkPeriod}
                    onChange={(e) => setBulkPeriod(e.target.value)}
                    placeholder="Şubat 2026"
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">
                    Kategori
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value as DueCategory)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  >
                    <option value="Aidat">Aidat</option>
                    <option value="Ortak Alan Elektrik">Ortak Alan Elektrik</option>
                    <option value="Demirbaş / Ek Bütçe">Demirbaş / Ek Bütçe</option>
                    <option value="Isınma / Yakıt">Isınma / Yakıt</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">
                    Daire Başı Tutar (TL)
                  </label>
                  <input
                    type="number"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">
                    Son Ödeme Tarihi
                  </label>
                  <input
                    type="text"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                    placeholder="15.02.2026"
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-[11px] text-gray-600 space-y-1">
                <p className="font-bold text-[#294C3C]">🔒 Güvenlik & Mükerrer Kayıt Koruması:</p>
                <p>
                  Aynı dönem için daha önce tahakkuk oluşturulmuş daireler atlanır, mevcut ödeme kayıtları veya bakiyeler korunur.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleBulkAssess}
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs"
                >
                  Tüm Dairelere Tahakkuk Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recordingDue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#294C3C]">Tahsilat Kaydı Gir</h3>
              </div>
              <button
                onClick={() => setRecordingDue(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] space-y-1 text-xs">
              <p className="font-bold text-[#294C3C]">
                {recordingDue.block} Blok · Daire {recordingDue.apartment} - {recordingDue.residentName}
              </p>
              <p className="text-gray-600">
                Dönem: <span className="font-semibold">{recordingDue.period}</span> ({recordingDue.category})
              </p>
              <p className="text-gray-600">
                Tahakkuk Tutarı: <span className="font-semibold">₺{recordingDue.amount}</span> | Daha Önce Ödenen:{' '}
                <span className="font-semibold text-emerald-700">₺{recordingDue.paidAmount || 0}</span>
              </p>
              <p className="text-rose-700 font-bold">
                Kalan Borç: ₺{recordingDue.remainingAmount ?? (recordingDue.amount - (recordingDue.paidAmount || 0))}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Tahsil Edilen Tutar (TL)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  min={1}
                  max={recordingDue.amount}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#294C3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">
                  Ödeme Yöntemi
                </label>
                <select
                  value={payMethod}
                  onChange={(e) =>
                    setPayMethod(e.target.value as DueItem['paymentMethod'])
                  }
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                >
                  <option value="Banka Havalesi / EFT">Banka Havalesi / EFT</option>
                  <option value="Kredi Kartı">Kredi Kartı</option>
                  <option value="Yönetim Elden / Kasa">Yönetim Elden / Kasa</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordingDue(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Tahsilatı Onayla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: EXPENSES & GEMINI INVOICE OCR */}
      {activeSection === 'expenses' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-[#294C3C]">Site Giderleri & Fatura OCR Masası</h3>
              </div>
              <p className="text-xs text-gray-500">
                Gemini 2.5 Flash ile otomatik fatura okuma, elektrik, su, asansör ve hizmet harcamaları
              </p>
            </div>
            <button
              onClick={() => {
                setOcrStatus('');
                setShowAddExpenseModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Yeni Fatura / Gider Ekle (OCR)</span>
            </button>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-[#DDE5DF] shadow-xs">
              <span className="text-[11px] font-bold text-gray-500 block uppercase">Toplam Gider</span>
              <div className="text-xl font-black text-[#294C3C] mt-1">
                ₺{expenses.reduce((acc, e) => acc + (e.totalAmount || e.amount || 0), 0).toLocaleString('tr-TR')}
              </div>
              <span className="text-[10px] text-gray-400">{expenses.length} adet fatura/gider kaydı</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 block uppercase">Ödenen Faturalar</span>
              <div className="text-xl font-black text-emerald-800 mt-1">
                ₺{expenses.filter((e) => e.isPaid || e.status === 'paid').reduce((acc, e) => acc + (e.totalAmount || e.amount || 0), 0).toLocaleString('tr-TR')}
              </div>
              <span className="text-[10px] text-emerald-600">{expenses.filter((e) => e.isPaid || e.status === 'paid').length} fatura ödendi</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-700 block uppercase">Ödeme Bekleyen</span>
              <div className="text-xl font-black text-rose-800 mt-1">
                ₺{expenses.filter((e) => !e.isPaid && e.status !== 'paid').reduce((acc, e) => acc + (e.totalAmount || e.amount || 0), 0).toLocaleString('tr-TR')}
              </div>
              <span className="text-[10px] text-rose-600">{expenses.filter((e) => !e.isPaid && e.status !== 'paid').length} fatura bekliyor</span>
            </div>
          </div>

          {/* Expenses List */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-[#DDE5DF] text-gray-500">
                <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs">Kayıtlı gider veya fatura bulunmamaktadır.</p>
              </div>
            ) : (
              expenses.map((exp) => {
                const isExpensePaid = exp.isPaid || exp.status === 'paid';
                return (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-white border border-[#DDE5DF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#294C3C]">{exp.vendorName}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border">
                          {exp.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isExpensePaid
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {isExpensePaid ? 'Ödendi' : 'Ödeme Bekliyor'}
                        </span>
                        {exp.invoiceNumber && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.2 rounded border">
                            {exp.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{exp.description || `${exp.vendorName} ${exp.category}`}</p>
                      <p className="text-[10px] text-gray-400">
                        Tarih: {exp.invoiceDate || exp.date} {(exp.taxId || exp.taxNumber) && `· VKN: ${exp.taxId || exp.taxNumber}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-base font-black text-[#294C3C]">
                          ₺{(exp.totalAmount || exp.amount || 0).toLocaleString('tr-TR')}
                        </div>
                        {exp.vatAmount ? (
                          <span className="text-[10px] text-gray-400">KDV Dahil (₺{exp.vatAmount})</span>
                        ) : null}
                      </div>

                      <button
                        onClick={() => updateExpensePayment(exp.id, isExpensePaid ? 'pending' : 'paid')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isExpensePaid
                            ? 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                        }`}
                      >
                        {isExpensePaid ? 'Bekliyor Olarak Değiştir' : 'Ödendi Olarak İşle'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#648875]/20 text-[#294C3C] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#294C3C]">Yeni Sakin Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateResident} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Blok</label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  >
                    {siteInfo.blocks?.map((b) => (
                      <option key={b.block} value={b.block}>
                        {b.block} Blok
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Daire No</label>
                  <input
                    type="text"
                    value={newApartment}
                    onChange={(e) => setNewApartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Örn: Ayşe Yılmaz"
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Cep Telefonu</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0532 000 00 00"
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {editingResident && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#DDE5DF] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#294C3C]">Sakin Bilgilerini Düzenle</h3>
              <button
                onClick={() => setEditingResident(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Daire No</label>
                <input
                  type="text"
                  value={editApartment}
                  onChange={(e) => setEditApartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Cep Telefonu</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingResident(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE & GEMINI OCR MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#DDE5DF] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#294C3C]">Fatura Girişi & Gemini AI OCR</h3>
              </div>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI OCR SCAN DROPZONE */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 space-y-2 text-center">
              <Camera className="w-6 h-6 text-emerald-700 mx-auto" />
              <div className="text-xs font-bold text-emerald-950">
                Fatura Görselini Yükle (Gemini 2.5 Flash ile Otomatik Doldur)
              </div>
              <p className="text-[11px] text-emerald-800">
                Fatura kesen firma, vergi no, seri no, KDV ve tutarlar anında taranır
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                id="invoice-ocr-file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setOcrLoading(true);
                  setOcrStatus('Görsel okunuyor ve Gemini 2.5 Flash ile analiz ediliyor...');
                  try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = reader.result as string;
                      const res = await fetch('/api/ocr-invoice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          imageBase64: base64,
                          mimeType: file.type || 'image/jpeg',
                        }),
                      });
                      const data = await res.json();
                      setOcrLoading(false);
                      if (data.success && data.data) {
                        const d = data.data;
                        if (d.vendorName) setExpenseVendor(d.vendorName);
                        if (d.invoiceNumber) setExpenseInvoiceNo(d.invoiceNumber);
                        if (d.taxId) setExpenseTaxId(d.taxId);
                        if (d.date) setExpenseDate(d.date);
                        if (d.dueDate) setExpenseDueDate(d.dueDate);
                        if (d.amount) setExpenseAmount(Number(d.amount) || 0);
                        if (d.vatAmount) setExpenseVat(Number(d.vatAmount) || 0);
                        if (d.totalAmount) setExpenseTotal(Number(d.totalAmount) || 0);
                        if (d.category) setExpenseCat(d.category);
                        if (d.description) setExpenseDesc(d.description);
                        setOcrStatus('✅ Fatura başarıyla ayrıştırıldı ve alanlar otomatik dolduruldu.');
                      } else {
                        setOcrStatus(`⚠️ OCR uyarısı: ${data.error || 'Alanlar okunamadı'}`);
                      }
                    };
                    reader.readAsDataURL(file);
                  } catch (err: any) {
                    setOcrLoading(false);
                    setOcrStatus(`Hata: ${err.message}`);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="invoice-ocr-file"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#294C3C] text-white text-xs font-bold cursor-pointer hover:bg-[#648875] transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{ocrLoading ? 'Taranıyor...' : 'Fatura Fotoğrafı / PDF Seç'}</span>
              </label>

              {ocrStatus && (
                <div className="text-[11px] font-semibold text-emerald-900 bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                  {ocrStatus}
                </div>
              )}
            </div>

            {/* Expense Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addExpense({
                  vendorName: expenseVendor.trim() || 'Tedarikçi Firma',
                  invoiceNumber: expenseInvoiceNo.trim() || undefined,
                  taxId: expenseTaxId.trim() || undefined,
                  taxNumber: expenseTaxId.trim() || undefined,
                  category: expenseCat,
                  date: expenseDate,
                  invoiceDate: expenseDate,
                  dueDate: expenseDueDate || undefined,
                  amount: Number(expenseTotal) || Number(expenseAmount) || 0,
                  vatAmount: Number(expenseVat) || 0,
                  totalAmount: Number(expenseTotal) || Number(expenseAmount) || 0,
                  description: expenseDesc.trim() || `${expenseVendor} ${expenseCat} faturası`,
                  isPaid: false,
                  status: 'pending',
                  createdBy: 'Site Yönetimi',
                });
                setShowAddExpenseModal(false);
                setExpenseVendor('');
                setExpenseInvoiceNo('');
                setExpenseTotal(0);
                setExpenseDesc('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Tedarikçi / Kurum Adı *</label>
                <input
                  type="text"
                  required
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                  placeholder="Örn: UEDAŞ Elektrik Dağıtım A.Ş."
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Gider Kategorisi</label>
                  <select
                    value={expenseCat}
                    onChange={(e) => setExpenseCat(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                  >
                    <option value="elektrik">Elektrik</option>
                    <option value="su">Su</option>
                    <option value="dogalgaz">Doğalgaz / Isınma</option>
                    <option value="asansor">Asansör Bakımı</option>
                    <option value="guvenlik">Güvenlik Hizmeti</option>
                    <option value="temizlik">Temizlik & Sarf</option>
                    <option value="bakim_onarım">Bakım & Onarım</option>
                    <option value="peyzaj">Bahçe & Peyzaj</option>
                    <option value="havuz">Havuz Bakımı</option>
                    <option value="yonetim">Yönetim & Danışmanlık</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Fatura Numarası</label>
                  <input
                    type="text"
                    value={expenseInvoiceNo}
                    onChange={(e) => setExpenseInvoiceNo(e.target.value)}
                    placeholder="Örn: GIB20260000412"
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Matrah (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">KDV (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseVat}
                    onChange={(e) => setExpenseVat(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Genel Toplam (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseTotal}
                    onChange={(e) => setExpenseTotal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Fatura Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Son Ödeme Tarihi</label>
                  <input
                    type="date"
                    value={expenseDueDate}
                    onChange={(e) => setExpenseDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Açıklama</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Gider detay açıklaması..."
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gider Defterine Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
