/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HardDrive, Download, FileSpreadsheet, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DriveReportsTab: React.FC = () => {
  const { siteInfo, orderList, cargoList, guestList, setShowDriveSetupModal } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    // Generate simple CSV of orders and cargo
    const headers = ['Tur', 'ID', 'Firma/Tasiyici', 'Blok', 'Daire', 'Sakin', 'Zaman', 'Durum', 'Tercih'];
    const rows = [
      ...orderList.map((o) => [
        'Siparis',
        o.id,
        o.company,
        o.block,
        o.apartment,
        o.residentName,
        o.createdAt,
        o.status,
        o.deliveryPreference || 'Yok',
      ]),
      ...cargoList.map((c) => [
        'Kargo',
        c.id,
        c.carrier,
        c.block,
        c.apartment,
        c.recipientName,
        c.receivedAt,
        c.deliveryStatus || c.status || 'guvenlikte',
        c.residentPreference || 'Yok',
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Viva_Rapor_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-base font-luxury font-bold text-[#294C3C]">
          Google Drive Yedekleme & CSV Raporlama
        </h2>
        <p className="text-xs text-[#26342C]/65">
          Sipariş, kargo ve güvenlik hareketlerinin bulut yedeği ve dışa aktarımı
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>CSV Raporu başarıyla bilgisayarınıza indirildi.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <h3 className="text-sm font-bold text-[#294C3C]">
              Google Drive Otomatik Senkronizasyon
            </h3>
            <p className="text-xs text-[#26342C]/70 leading-relaxed">
              Tüm kurye kayıtları, sakin tercih logları ve ziyaretçi defteri her gece otomatik olarak Google Drive klasörünüze yedeklenir. (OAuth bağlantısı bekleniyor).
            </p>
          </div>

          <button
            onClick={() => setShowDriveSetupModal(true)}
            className="w-full py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            Google Drive Ayarlarını Yapılandır
          </button>
        </div>

        {/* Instant CSV Export Box */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#294C3C]">
              Anlık Excel / CSV Dışa Aktarımı
            </h3>
            <p className="text-xs text-[#26342C]/70 leading-relaxed">
              Sistemdeki tüm canlı verileri (siparişler, kargolar, sakin tercihleri) tek tıklamayla CSV formatında indirin.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full py-3 rounded-xl bg-white border-2 border-[#294C3C] hover:bg-[#F7F8F5] text-[#294C3C] text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#648875]" />
            <span>CSV Raporunu İndir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
