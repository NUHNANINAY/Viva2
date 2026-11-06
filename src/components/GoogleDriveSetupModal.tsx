/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cloud, HardDrive, CheckCircle2, AlertCircle, FileText, ArrowRight, X } from 'lucide-react';

export const GoogleDriveSetupModal: React.FC = () => {
  const { showDriveModal, setShowDriveModal, adminUser, toggleDriveConnection } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!showDriveModal) return null;

  const handleSimulateConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      toggleDriveConnection(true);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setShowDriveModal(false);
      }, 1500);
    }, 1000);
  };

  const handleSkip = () => {
    setShowDriveModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1B1D25] border border-[#C5A66A]/35 rounded-3xl p-6 shadow-2xl space-y-5 text-[#EEE9DE]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A]">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-luxury font-bold text-[#EEE9DE]">Google Drive Kurulumu</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A66A]/20 text-[#DFC38E] border border-[#C5A66A]/40 uppercase tracking-wider">
                  Demo Simülasyon
                </span>
              </div>
              <p className="text-xs text-[#EEE9DE]/70">Yönetici Belge ve Rapor Arşivi</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-full text-[#EEE9DE]/60 hover:text-[#EEE9DE] hover:bg-[#292B36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-[#292B36]/80 border border-[#C5A66A]/25 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#C5A66A] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-[#DFC38E]">Entegrasyon Bilgilendirmesi</p>
            <p className="text-[#EEE9DE]/80 leading-relaxed">
              Bu aşama Google Drive bulut arşivleme sisteminin ön izleme simülasyonudur. Canlı Google OAuth izni henüz bağlanmamıştır. Demo modunda test edebilir veya şimdilik atlayıp daha sonra Site Ayarları / Raporlar bölümünden bağlayabilirsiniz.
            </p>
          </div>
        </div>

        {/* What gets archived */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C5A66A]">
            Otomatik Arşivlenecek Dosyalar:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-center">
              <FileText className="w-4 h-4 text-[#C5A66A] mx-auto mb-1" />
              <p className="text-xs font-medium text-[#EEE9DE]">Kargo Tutanakları</p>
              <p className="text-[10px] text-[#EEE9DE]/60">Günlük teslim logları</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-center">
              <HardDrive className="w-4 h-4 text-[#C5A66A] mx-auto mb-1" />
              <p className="text-xs font-medium text-[#EEE9DE]">Talepler & Öneriler</p>
              <p className="text-[10px] text-[#EEE9DE]/60">Aylık sakin bildirimleri</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-center">
              <Cloud className="w-4 h-4 text-[#C5A66A] mx-auto mb-1" />
              <p className="text-xs font-medium text-[#EEE9DE]">Misafir Araç Logu</p>
              <p className="text-[10px] text-[#EEE9DE]/60">Güvenlik plaka arşivi</p>
            </div>
          </div>
        </div>

        {/* Current status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#111318] border border-[#292B36]">
          <span className="text-xs text-[#EEE9DE]/80">Mevcut Durum:</span>
          {adminUser.driveConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Demo Arşiv Aktif
            </span>
          ) : (
            <span className="text-xs text-[#EEE9DE]/60 font-medium">
              Bağlantı Kurulmadı
            </span>
          )}
        </div>

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs text-center animate-in fade-in">
            ✓ Demo Google Drive bağlantısı simüle edildi! Raporlar sekmesine eklendi.
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-end">
          <button
            onClick={handleSkip}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-[#EEE9DE]/70 hover:text-[#EEE9DE] hover:bg-[#292B36] transition-colors"
          >
            Şimdilik Atla (Sonra Bağlan)
          </button>

          <button
            onClick={handleSimulateConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {isConnecting ? (
              <span>Simüle Ediliyor...</span>
            ) : (
              <>
                <span>Demo Bağlantısını Kur</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
