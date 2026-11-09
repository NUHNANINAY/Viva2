/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HardDrive, X, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const GoogleDriveSetupModal: React.FC = () => {
  const { showDriveSetupModal, setShowDriveSetupModal } = useApp();
  const [folderId, setFolderId] = useState('1A2b3C4d5E6F_viva_backups');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSaved, setIsSaved] = useState(false);

  if (!showDriveSetupModal) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowDriveSetupModal(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFFFF] border-2 border-[#DDE5DF] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-[#26342C]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#294C3C] font-luxury">
                Google Drive Entegrasyonu
              </h3>
              <p className="text-xs text-[#26342C]/65">
                Bulut yedekleme ve rapor senkronizasyonu
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDriveSetupModal(false)}
            className="text-[#26342C]/40 hover:text-[#26342C] p-1.5 rounded-full hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Drive yedekleme ayarları kaydedildi.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
              Google Drive Hedef Klasör Kimliği (Folder ID)
            </label>
            <input
              type="text"
              required
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1">
              Otomatik Yedekleme Sıklığı
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  frequency === 'daily'
                    ? 'bg-[#294C3C] text-white border-[#294C3C]'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                }`}
              >
                Her Gece (Günlük)
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  frequency === 'weekly'
                    ? 'bg-[#294C3C] text-white border-[#294C3C]'
                    : 'bg-[#F7F8F5] text-[#26342C] border-[#DDE5DF]'
                }`}
              >
                Haftalık
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F8F5] border border-[#DDE5DF] text-[11px] text-[#26342C]/70">
            Kurye kayıtları, misafir listeleri ve sakin talepleri Google Workspace API üzerinden otomatik Excel formatında aktarılır.
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDriveSetupModal(false)}
              className="flex-1 py-3 rounded-xl border border-[#DDE5DF] text-xs font-bold text-[#26342C]/70 hover:bg-[#F7F8F5] transition-colors"
            >
              Kapat
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Bağlantıyı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
