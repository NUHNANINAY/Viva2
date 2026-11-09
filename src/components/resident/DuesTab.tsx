/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DueItem, DuePaymentStatus } from '../../types';
import {
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldAlert,
  Info,
  DollarSign,
  Download,
  Receipt,
} from 'lucide-react';

export const DuesTab: React.FC = () => {
  const { duesList, residentUser, siteInfo } = useApp();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2026);
  const [selectedStatus, setSelectedStatus] = useState<DuePaymentStatus | 'all'>('all');
  const [expandedDueId, setExpandedDueId] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  // STRICT DATA ISOLATION: Resident only sees dues for their exact block & apartment
  const residentDues = duesList.filter(
    (d) => d.block === residentUser.block && d.apartment === residentUser.apartment
  );

  const filteredDues = residentDues.filter((d) => {
    const matchesYear = selectedYear === 'all' || d.year === selectedYear;
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    return matchesYear && matchesStatus;
  });

  // Financial aggregates
  const totalRemainingDebt = residentDues.reduce((sum, d) => sum + (d.remainingAmount || 0), 0);
  const totalPaidYtd = residentDues
    .filter((d) => d.year === 2026)
    .reduce((sum, d) => sum + (d.paidAmount || 0), 0);
  const currentPeriodDue = residentDues.find((d) => d.period === 'Şubat 2026' || d.period.includes('Şubat 2026'));

  const siteIban = 'TR56 0006 2000 0001 2345 6789 01';
  const paymentDescription = `Blok ${residentUser.block} Daire ${residentUser.apartment} - ${residentUser.fullName} Aidat`;

  const handleCopy = (text: string, isIban: boolean) => {
    navigator.clipboard.writeText(text);
    if (isIban) {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const getStatusBadge = (status: DuePaymentStatus) => {
    switch (status) {
      case 'odendi':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            ÖDENDİ
          </span>
        );
      case 'kismi_odendi':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            KISMİ ÖDENDİ
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            ÖDENMEDİ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#294C3C] text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#294C3C]">Aidat & Borç Durumum</h2>
              <p className="text-xs text-[#26342C]/70">
                {siteInfo.name} · {residentUser.block} Blok, Daire {residentUser.apartment} ({residentUser.fullName})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#DDE5DF] text-[#294C3C]">
            Kişisel Ekstre
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Debt */}
        <div
          className={`p-5 rounded-3xl border-2 transition-all shadow-xs ${
            totalRemainingDebt > 0
              ? 'bg-red-50/70 border-red-200 text-red-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
              Toplam Borç Bakiyesi
            </span>
            <AlertCircle className={`w-4 h-4 ${totalRemainingDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
            {totalRemainingDebt.toLocaleString('tr-TR')} TL
          </div>
          <p className="text-[11px] opacity-75 mt-1">
            {totalRemainingDebt > 0 ? 'Gecikmiş veya vadesi gelen aidatlar' : 'Tüm aidat ve harcamalarınız güncel'}
          </p>
        </div>

        {/* Current Period Due */}
        <div className="p-5 rounded-3xl border-2 border-[#DDE5DF] bg-white text-[#26342C] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26342C]/60">
              Şubat 2026 Aidatı
            </span>
            <Calendar className="w-4 h-4 text-[#648875]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#294C3C]">
            {currentPeriodDue ? `${currentPeriodDue.amount.toLocaleString('tr-TR')} TL` : '2.850 TL'}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-[#26342C]/70">Son Ödeme: 15.02.2026</span>
            {currentPeriodDue && getStatusBadge(currentPeriodDue.status)}
          </div>
        </div>

        {/* Paid YTD */}
        <div className="p-5 rounded-3xl border-2 border-[#DDE5DF] bg-white text-[#26342C] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26342C]/60">
              2026 Ödenen Toplam
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
            {totalPaidYtd.toLocaleString('tr-TR')} TL
          </div>
          <p className="text-[11px] text-[#26342C]/70 mt-1">
            Bu yıl banka ve kasa üzerinden ödenen toplam
          </p>
        </div>
      </div>

      {/* Bank Account & Quick EFT / Havale Box */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#294C3C] to-[#1E372B] text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm font-bold">Site Yönetimi Banka Hesap Bilgileri</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
            Garanti BBVA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* IBAN */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">Site Resmi IBAN Numarası</div>
              <div className="font-mono font-bold text-xs sm:text-sm tracking-wider text-white mt-0.5">
                {siteIban}
              </div>
            </div>
            <button
              onClick={() => handleCopy(siteIban, true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              title="IBAN'ı Kopyala"
            >
              {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIban ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">EFT / Havale Açıklaması</div>
              <div className="font-semibold text-xs text-white mt-0.5 truncate max-w-[200px] sm:max-w-[260px]">
                {paymentDescription}
              </div>
            </div>
            <button
              onClick={() => handleCopy(paymentDescription, false)}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Açıklamayı Kopyala"
            >
              {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedDesc ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls: Year & Payment Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Year Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F7F8F5] border border-[#DDE5DF] rounded-2xl w-fit">
          <button
            onClick={() => setSelectedYear(2026)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 2026 ? 'bg-[#294C3C] text-white shadow-xs' : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            2026 Yılı
          </button>
          <button
            onClick={() => setSelectedYear(2025)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 2025 ? 'bg-[#294C3C] text-white shadow-xs' : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            2025 Yılı
          </button>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 'all' ? 'bg-[#294C3C] text-white shadow-xs' : 'text-[#26342C]/70 hover:bg-[#E8EDE9]'
            }`}
          >
            Tüm Yıllar
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'odenmedi', 'kismi_odendi', 'odendi'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-[#648875] text-white shadow-xs'
                  : 'bg-[#F7F8F5] text-[#26342C]/70 hover:bg-[#E8EDE9]'
              }`}
            >
              {st === 'all'
                ? 'Tümü'
                : st === 'odenmedi'
                ? 'Ödenmedi'
                : st === 'kismi_odendi'
                ? 'Kısmi Ödendi'
                : 'Ödendi'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Statement Cards List */}
      <div className="space-y-3">
        {filteredDues.map((item) => {
          const isExpanded = expandedDueId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-3xl border-2 transition-all overflow-hidden ${
                item.status === 'odenmedi'
                  ? 'border-red-200 bg-white hover:border-red-300'
                  : item.status === 'kismi_odendi'
                  ? 'border-amber-200 bg-white hover:border-amber-300'
                  : 'border-[#DDE5DF] bg-white hover:border-[#648875]'
              }`}
            >
              {/* Header row */}
              <div
                onClick={() => setExpandedDueId(isExpanded ? null : item.id)}
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8F5]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      item.status === 'odendi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'kismi_odendi'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    ₺
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-[#294C3C]">{item.period}</h4>
                      {item.isDemo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                          [DEMO VERİSİ]
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DDE5DF] text-[#26342C]">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#26342C]/70 font-medium">
                      <span>Son Ödeme: {item.dueDate}</span>
                      {item.paidDate && (
                        <span className="text-emerald-700 font-bold">
                          Ödeme Tarihi: {item.paidDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side amounts & status pill */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F7F8F5]">
                  <div className="text-right">
                    <div className="text-lg font-extrabold font-mono text-[#294C3C]">
                      {item.amount.toLocaleString('tr-TR')} TL
                    </div>
                    {item.remainingAmount > 0 && (
                      <div className="text-xs font-bold text-red-600 font-mono">
                        Kalan: {item.remainingAmount.toLocaleString('tr-TR')} TL
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    <button className="p-1 rounded-full text-[#26342C]/40 hover:text-[#26342C]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Accordion Details: Breakdown & Payment Method */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 bg-[#F7F8F5]/70 border-t border-[#DDE5DF] space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item breakdown */}
                    <div className="p-4 rounded-2xl bg-white border border-[#DDE5DF]">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#294C3C] mb-2">
                        Aidat Gider Dağılımı
                      </h5>
                      <div className="space-y-1.5 text-xs text-[#26342C]/80">
                        {item.breakdown && item.breakdown.length > 0 ? (
                          item.breakdown.map((b, idx) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-[#F7F8F5]">
                              <span>{b.label}</span>
                              <span className="font-mono font-bold">{b.amount.toLocaleString('tr-TR')} TL</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                              <span>Güvenlik Personeli Payı</span>
                              <span className="font-mono font-bold">1.250 TL</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                              <span>Temizlik & Ortak Alan Hizmeti</span>
                              <span className="font-mono font-bold">650 TL</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                              <span>Ortak Alan Elektrik & Aydınlatma</span>
                              <span className="font-mono font-bold">450 TL</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
                              <span>Asansör Bakım & Teknik Onarım</span>
                              <span className="font-mono font-bold">300 TL</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Peyzaj & Bahçe Bakımı</span>
                              <span className="font-mono font-bold">200 TL</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Payment info & method */}
                    <div className="p-4 rounded-2xl bg-white border border-[#DDE5DF] flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#294C3C] mb-2">
                          Ödeme ve Dekont Bilgileri
                        </h5>
                        <div className="space-y-2 text-xs text-[#26342C]/80">
                          <div>
                            <span className="text-[#26342C]/60 block">Ödeme Kanalı:</span>
                            <span className="font-bold text-[#294C3C]">
                              {item.paymentMethod || 'Banka Havalesi / Dekontlu'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#26342C]/60 block">Kayıt Kaynağı:</span>
                            <span className="inline-flex items-center gap-1 font-semibold">
                              {item.paymentSource === 'bank' ? (
                                <span className="text-sky-700 font-bold">🏦 Otomatik Banka Entegrasyonu</span>
                              ) : (
                                <span className="text-[#294C3C] font-bold">🏢 Yönetim Kasa / Muhasebe Girişi</span>
                              )}
                            </span>
                          </div>
                          {item.description && (
                            <div>
                              <span className="text-[#26342C]/60 block">Açıklama:</span>
                              <span className="text-xs text-[#26342C]/80 italic">{item.description}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.remainingAmount > 0 && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Ödeme yaptıktan sonra dekontunuz otomatik olarak eşleşir.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredDues.length === 0 && (
          <div className="p-10 text-center rounded-3xl bg-white border border-[#DDE5DF]">
            <Receipt className="w-10 h-10 text-[#26342C]/30 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#26342C]">Bu filtrelere ait aidat kaydı bulunamadı</h4>
            <p className="text-xs text-[#26342C]/60 mt-1">
              Filtre seçeneklerini değiştirerek geçmiş dönem aidatlarınızı inceleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
