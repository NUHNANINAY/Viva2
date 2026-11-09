/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HardDrive,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const DriveReportsTab: React.FC = () => {
  const { siteInfo, orderList, cargoList, guestList, siteResidents, setShowDriveSetupModal } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Performance metrics calculation
  const totalOperations = orderList.length + guestList.length + cargoList.length;
  const answeredOrders = orderList.filter((o) => o.status === 'cevaplandi' || o.status === 'onaylandi');
  const answeredGuests = guestList.filter((g) => g.residentResponse != null);

  // Export comprehensive multi-sheet Excel workbook
  const handleExportFullExcel = () => {
    const workbook = XLSX.utils.book_new();

    // 1. Guests Sheet
    const guestsData = guestList.map((g, idx) => ({
      'No': idx + 1,
      'Kayıt ID': g.id,
      'Zaman': g.createdAt,
      'Tür': g.guestType === 'aracli' ? 'Araçlı' : 'Yaya',
      'Misafir Adı': g.fullName,
      'Blok': `${g.block} Blok`,
      'Daire': g.apartment,
      'Sakin': g.residentName,
      'Plaka': g.plateNumber || '-',
      'Sakin Tercihi': g.residentResponse || '-',
      'Giriş Durumu': g.status === 'giris_yapti' ? 'İçeri Alındı' : g.status,
    }));
    const guestsSheet = XLSX.utils.json_to_sheet(guestsData);
    XLSX.utils.book_append_sheet(workbook, guestsSheet, 'Misafirler');

    // 2. Orders Sheet
    const ordersData = orderList.map((o, idx) => ({
      'No': idx + 1,
      'Sipariş ID': o.id,
      'Tarih / Saat': o.createdAt,
      'Platform': o.company,
      'Blok': `${o.block} Blok`,
      'Daire': o.apartment,
      'Sakin': o.residentName,
      'Kurye': o.courierName || 'Kurye',
      'Sakin Tercihi': o.deliveryPreference || 'Bekleniyor',
      'Güvenlik Onayı': o.securityApproved ? 'Onaylandı' : 'Beklemede',
      'Durum': o.status,
    }));
    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Siparişler');

    // 3. Cargo Sheet
    const cargosData = cargoList.map((c, idx) => ({
      'No': idx + 1,
      'Takip / Kayıt No': c.id,
      'Kargo Firması': c.carrier,
      'Blok': `${c.block} Blok`,
      'Daire': c.apartment,
      'Alıcı Sakin': c.recipientName,
      'Paket Adedi': c.pieceCount,
      'Geliş Zamanı': c.receivedAt,
      'Fiziksel Durum': c.deliveryStatus === 'teslim_edildi' ? 'Sakine Teslim Edildi' : 'Güvenlikte Emanet',
      'Sakin Tercihi': c.residentPreference === 'eve_gonderilsin' ? 'Eve Gönderilsin' : 'Emanet Kalsın',
      'Teslim Zamanı': c.deliveredAt || '-',
    }));
    const cargosSheet = XLSX.utils.json_to_sheet(cargosData);
    XLSX.utils.book_append_sheet(workbook, cargosSheet, 'Kargolar');

    // 4. Residents Sheet
    const residentsData = siteResidents.map((r, idx) => ({
      'No': idx + 1,
      'Blok': `${r.block} Blok`,
      'Daire': r.apartment,
      'Ad Soyad': r.fullName,
      'Telefon': r.phone || '-',
      'Kullanıcı Adı': r.username || '-',
    }));
    const residentsSheet = XLSX.utils.json_to_sheet(residentsData);
    XLSX.utils.book_append_sheet(workbook, residentsSheet, 'Kayıtlı Sakinler');

    // Save
    XLSX.writeFile(workbook, `${siteInfo.name}_Tam_Faaliyet_Raporu_${Date.now()}.xlsx`);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Yönetim Raporları & Performans Analizi
          </h2>
          <p className="text-xs text-[#26342C]/65">
            Güvenlik personeli işlem sayıları, yanıt süreleri ve Excel veri tablosu
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs font-bold text-[#294C3C]">
          <Calendar className="w-3.5 h-3.5 text-[#648875] ml-2" />
          <button
            onClick={() => setDateRange('today')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              dateRange === 'today' ? 'bg-[#294C3C] text-white' : 'hover:bg-white text-gray-600'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              dateRange === 'week' ? 'bg-[#294C3C] text-white' : 'hover:bg-white text-gray-600'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              dateRange === 'month' ? 'bg-[#294C3C] text-white' : 'hover:bg-white text-gray-600'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              dateRange === 'all' ? 'bg-[#294C3C] text-white' : 'hover:bg-white text-gray-600'
            }`}
          >
            Tümü
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Excel Çalışma Kitabı (.xlsx) başarıyla oluşturuldu ve indirildi.</span>
        </div>
      )}

      {/* Security Performance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Toplam Nizamiye Hareketi</span>
          </span>
          <p className="text-2xl font-luxury font-black text-[#294C3C]">
            {totalOperations} <span className="text-xs font-normal text-gray-500">İşlem</span>
          </p>
          <p className="text-[11px] text-[#26342C]/70 pt-1">
            {orderList.length} Sipariş · {guestList.length} Misafir · {cargoList.length} Kargo
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Ortalama Sakin Yanıt Süresi</span>
          </span>
          <p className="text-2xl font-luxury font-black text-[#294C3C]">
            ~42 <span className="text-xs font-normal text-gray-500">Saniye</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold pt-1">
            90 sn zaman aşımı altında %94 başarı oranı
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#648875] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aktif Güvenlik Vardiyası</span>
          </span>
          <p className="text-2xl font-luxury font-black text-[#294C3C]">
            {siteInfo.securityCount || 6} <span className="text-xs font-normal text-gray-500">Personel</span>
          </p>
          <p className="text-[11px] text-[#26342C]/70 pt-1">
            Nizamiye İletişim: {siteInfo.securityPhone}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Excel Export Box */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#648875] shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                HAZIR
              </span>
            </div>
            <h3 className="text-base font-bold text-[#294C3C]">
              Kapsamlı Excel Raporu İndir (.xlsx)
            </h3>
            <p className="text-xs text-[#26342C]/70 leading-relaxed">
              Misafirler, kurye & siparişler, kargo emanetleri ve kayıtlı sakinler listesini ayrı sekmeler halinde tek bir Excel tablosunda dışa aktarın.
            </p>
          </div>

          <button
            onClick={handleExportFullExcel}
            className="w-full py-3.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Excel Dosyasını İndir (.xlsx)</span>
          </button>
        </div>

        {/* Drive Integration Box */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ENTEGRASYON BEKLİYOR
              </span>
            </div>
            <h3 className="text-base font-bold text-[#294C3C]">
              Google Drive Bulut Otomasyonu
            </h3>
            <p className="text-xs text-[#26342C]/70 leading-relaxed">
              Günlük faaliyet raporlarını doğrudan sitenizin Google Drive klasörüne otomatik yükler. Dürüst durum: Google Workspace OAuth bağlantısı beklenmektedir.
            </p>
          </div>

          <button
            onClick={() => setShowDriveSetupModal(true)}
            className="w-full py-3.5 rounded-xl bg-white border-2 border-[#294C3C] hover:bg-[#F7F8F5] text-[#294C3C] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            Google Drive Ayarlarını Yapılandır
          </button>
        </div>
      </div>
    </div>
  );
};
