/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Folder,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const DriveReportsTab: React.FC = () => {
  const { adminUser, toggleDriveConnection, cargoList, guestList, suggestionList, currentSite } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleToggleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toggleDriveConnection(!adminUser.driveConnected);
    }, 600);
  };

  // Helper to trigger simulated real CSV file download
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`${filename} başarıyla indirildi (Demo Veri).`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const handleExportCargoReport = () => {
    const headers = 'Takip No;Firma;Blok;Daire;Teslimat Sekli;Durum;Gelis Tarihi\n';
    const rows = cargoList
      .map(
        (c) =>
          `"${c.trackingCode}";"${c.carrier}";"${c.block}";${c.apartment};"${c.deliveryOption}";"${c.status}";"${c.receivedAt}"`
      )
      .join('\n');
    downloadCSV(`viva_kargo_raporu_${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  const handleExportGuestReport = () => {
    const headers = 'Misafir Adi;Plaka;Sakin Blok;Sakin Daire;Otopark Tercihi;Zamanlama;Durum\n';
    const rows = guestList
      .map(
        (g) =>
          `"${g.guestName}";"${g.plateNumber || 'Yaya'}";"${g.residentBlock}";${g.residentApartment};"${g.parkingType || g.parkingOption || 'yaya'}";"${g.isImmediate ? 'Hemen' : (g.scheduledDate || g.createdAt)}";"${g.status}"`
      )
      .join('\n');
    downloadCSV(`viva_misafir_plaka_raporu_${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  const handleExportSuggestionsReport = () => {
    const headers = 'Kategori;Baslik;Sakin;Blok;Daire;Aciliyet;Durum;Tarih;Yonetim Yaniti\n';
    const rows = suggestionList
      .map(
        (s) =>
          `"${s.category}";"${s.title}";"${s.residentName}";"${s.residentBlock}";${s.residentApartment};"${s.urgency}";"${s.status}";"${s.createdAt}";"${s.adminResponse || 'Henüz yanıtlanmadı'}"`
      )
      .join('\n');
    downloadCSV(`viva_sakin_talepleri_${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#EEE9DE]">Google Drive & Rapor Arşivi</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A66A]/20 text-[#DFC38E] border border-[#C5A66A]/40 uppercase tracking-wider">
                Demo Simülasyon
              </span>
            </div>
            <p className="text-xs text-[#EEE9DE]/60">
              Bulut yedekleme simülasyonu ve CSV/Excel rapor indirme
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleConnect}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all touch-target flex items-center gap-1.5 ${
            adminUser.driveConnected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/40'
              : 'bg-[#292B36] text-[#DFC38E] border-[#C5A66A]/40 hover:bg-[#C5A66A] hover:text-[#111318]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {adminUser.driveConnected ? 'Demo Bağlantısını Kes' : 'Demo Drive Bağlantısını Kur'}
          </span>
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Honest Demo Notification Box */}
      <div className="p-4 rounded-2xl bg-[#292B36]/80 border border-[#C5A66A]/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#C5A66A] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-[#DFC38E]">Entegrasyon ve Güvenlik Bildirimi</p>
          <p className="text-[#EEE9DE]/80 leading-relaxed">
            Bu ekranda görüntülenen Google Drive depolama yapısı prototip aşamasındadır. Canlı Google Cloud Drive API'si bağlanana kadar veriler sahte çalışıyormuş gibi gösterilmez; tüm raporlar doğrudan tarayıcınızda CSV formatında üretilerek cihazınıza indirilebilir.
          </p>
        </div>
      </div>

      {/* Simulated Drive Cloud Folder Structure */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#C5A66A]" />
            <span>Simüle Edilen Drive Klasör Ağacı</span>
          </h3>
          <span className="text-[11px] text-[#EEE9DE]/50">
            {adminUser.driveConnected ? 'Yedekleme Aktif' : 'Yedekleme Beklemede'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-[#C5A66A]" />
              <span className="font-semibold text-[#EEE9DE]">/VİVA_SİTE_YEDEK/Kargo_Tutanaklari</span>
            </div>
            <span className="text-[11px] text-[#EEE9DE]/60">Günlük otomatik yedek</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-[#C5A66A]" />
              <span className="font-semibold text-[#EEE9DE]">/VİVA_SİTE_YEDEK/Misafir_Plaka_Loglari</span>
            </div>
            <span className="text-[11px] text-[#EEE9DE]/60">Bariyer geçiş kayıtları</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111318] border border-[#292B36] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Folder className="w-4 h-4 text-[#C5A66A]" />
              <span className="font-semibold text-[#EEE9DE]">/VİVA_SİTE_YEDEK/Sakin_Talep_Arsivi</span>
            </div>
            <span className="text-[11px] text-[#EEE9DE]/60">Yönetim kurulu kararları</span>
          </div>
        </div>
      </div>

      {/* Report Exports (Fully working CSV downloads!) */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/25 space-y-4">
        <h3 className="text-xs font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#C5A66A]" />
          <span>Yönetim Raporlarını Dışa Aktar</span>
        </h3>
        <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
          Site verilerini Excel / Google Sheets uyumlu Türkçe formatta (.CSV) indirin:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportCargoReport}
            className="p-4 rounded-xl bg-[#111318] border border-[#292B36] hover:border-[#C5A66A] text-left space-y-2 group transition-all touch-target"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#EEE9DE]">Kargo Raporu</p>
              <p className="text-[11px] text-[#EEE9DE]/60">Tüm teslimat ve emanetler</p>
            </div>
          </button>

          <button
            onClick={handleExportGuestReport}
            className="p-4 rounded-xl bg-[#111318] border border-[#292B36] hover:border-[#C5A66A] text-left space-y-2 group transition-all touch-target"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#EEE9DE]">Misafir & Araç Logu</p>
              <p className="text-[11px] text-[#EEE9DE]/60">Plakalar ve otopark tercihleri</p>
            </div>
          </button>

          <button
            onClick={handleExportSuggestionsReport}
            className="p-4 rounded-xl bg-[#111318] border border-[#292B36] hover:border-[#C5A66A] text-left space-y-2 group transition-all touch-target"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292B36] group-hover:bg-[#C5A66A] group-hover:text-[#111318] text-[#C5A66A] flex items-center justify-center transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#EEE9DE]">Sakin Talepleri</p>
              <p className="text-[11px] text-[#EEE9DE]/60">Öneri ve çözüm dökümü</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
