/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Volume2,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  X,
  BatteryMedium,
  Apple,
  Info,
  Play,
  Check,
} from 'lucide-react';
import { playGateAlertChime, playLuxuryChime } from '../../utils/audio';

interface PermissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionGuideModal: React.FC<PermissionGuideModalProps> = ({ isOpen, onClose }) => {
  const { permissionsState, requestPushPermission, markBackgroundGuideSeen } = useApp();

  const [testedAudio, setTestedAudio] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>(permissionsState.push || 'default');
  const [activeOsTab, setActiveOsTab] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  const handleTestChime = () => {
    playGateAlertChime();
    setTestedAudio(true);
  };

  const handleEnablePush = async () => {
    const res = await requestPushPermission();
    setPushStatus(res);
  };

  const handleDismiss = () => {
    markBackgroundGuideSeen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#1B1D25] border-2 border-[#C5A66A]/40 rounded-3xl p-6 text-[#EEE9DE] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#292B36] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#292B36] border border-[#C5A66A]/30 text-[#C5A66A] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wide">
                Nizamiye Bildirim & Arka Plan Rehberi
              </h3>
              <p className="text-[11px] text-[#EEE9DE]/60">Anlık misafir & kargo uyarıları için kılavuz</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-[#111318] text-[#EEE9DE]/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Ses Çalma & Tarayıcı İzni */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[#292B36] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#C5A66A]" />
              <span className="text-xs font-bold text-[#DFC38E] uppercase">1. Nizamiye Zil Sesi Testi</span>
            </div>
            {testedAudio && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Test Edildi
              </span>
            )}
          </div>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Mobil tarayıcılar (Safari, Chrome) kullanıcı ekrana dokunana kadar otomatik ses çalmayı kısıtlar. Zil sesini aktifleştirmek için aşağıdaki test butonuna basınız:
          </p>
          <button
            type="button"
            onClick={handleTestChime}
            className="w-full py-2.5 px-4 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-bold text-[#DFC38E] border border-[#C5A66A]/30 transition-all touch-target flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Nizamiye Zil Sesini Çal (880Hz Çift Ton)</span>
          </button>
        </div>

        {/* 2. Web Push Bildirim İzni */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[#292B36] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C5A66A]" />
              <span className="text-xs font-bold text-[#DFC38E] uppercase">2. Tarayıcı Bildirim İzni</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pushStatus === 'granted'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
              }`}
            >
              {pushStatus === 'granted' ? 'İzin Verildi' : 'İzin Bekleniyor'}
            </span>
          </div>
          <p className="text-xs text-[#EEE9DE]/70 leading-relaxed">
            Sakin yeni bir misafir veya kargo bildirdiğinde ekranda pop-up ve sistem bildirimi alabilmek için bildirim izni gereklidir.
          </p>
          {pushStatus !== 'granted' && (
            <button
              type="button"
              onClick={handleEnablePush}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bildirim İznini Etkinleştir</span>
            </button>
          )}
        </div>

        {/* 3. Mobil İşletim Sistemi Arka Plan Kısıtlamaları ve Rehber */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[#C5A66A]/30 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#C5A66A]" />
            <span className="text-xs font-bold text-[#DFC38E] uppercase">
              3. Mobil Arka Plan Ayarları (Önemli)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
            <strong className="block text-amber-200 mb-0.5">İşletim Sistemi Sınırlaması:</strong>
            Mobil cihazlarda (Android / iOS) ekran kilitlendiğinde veya tarayıcı arka plana alındığında, pil tasarrufu algoritmaları JavaScript'i durdurur. Kesintisiz uyarı almak için aşağıdaki ayarları uygulayınız:
          </div>

          {/* OS Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveOsTab('android')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeOsTab === 'android'
                  ? 'bg-[#C5A66A] text-[#111318]'
                  : 'bg-[#1B1D25] text-[#EEE9DE]/60 border border-[#292B36]'
              }`}
            >
              <BatteryMedium className="w-3.5 h-3.5" />
              <span>Android Cihazlar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveOsTab('ios')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeOsTab === 'ios'
                  ? 'bg-[#C5A66A] text-[#111318]'
                  : 'bg-[#1B1D25] text-[#EEE9DE]/60 border border-[#292B36]'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iOS / iPhone</span>
            </button>
          </div>

          {/* Android Steps */}
          {activeOsTab === 'android' && (
            <div className="p-3 rounded-xl bg-[#1B1D25] text-xs text-[#EEE9DE]/80 space-y-2 border border-[#292B36]">
              <p className="font-semibold text-[#DFC38E]">Android Pil Optimizasyonunu Devre Dışı Bırakma:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#EEE9DE]/70 leading-relaxed">
                <li>Cihazınızda <strong>Ayarlar</strong> &gt; <strong>Uygulamalar</strong> menüsüne girin.</li>
                <li>Kullandığınız tarayıcıyı (Chrome vb.) veya ana ekrana eklediğiniz VİVA SİTE uygulamasını seçin.</li>
                <li><strong>Pil / Güç Tüketimi</strong> bölümüne dokunun.</li>
                <li><strong>"Kısıtlamasız" (Unrestricted)</strong> veya "Arka planda çalışmaya izin ver" seçeneğini işaretleyin.</li>
                <li>Nöbet esnasında cihaz ekran zaman aşımını "Hiçbir zaman" veya uzun bir süreye ayarlayınız.</li>
              </ol>
            </div>
          )}

          {/* iOS Steps */}
          {activeOsTab === 'ios' && (
            <div className="p-3 rounded-xl bg-[#1B1D25] text-xs text-[#EEE9DE]/80 space-y-2 border border-[#292B36]">
              <p className="font-semibold text-[#DFC38E]">iOS / Safari Bildirim & Ana Ekrana Ekleme:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#EEE9DE]/70 leading-relaxed">
                <li>Safari'de paylaş butonuna basarak <strong>"Ana Ekrana Ekle"</strong> yapın.</li>
                <li>Cihaz <strong>Ayarlar</strong> &gt; <strong>Safari</strong> &gt; <strong>Bildirimler</strong> izinlerini kontrol edin.</li>
                <li><strong>Ayarlar</strong> &gt; <strong>Genel</strong> &gt; <strong>Arka Planda Uygulama Yenileme</strong> seçeneğini açık tutun.</li>
                <li>Nöbetçi güvenlik tablet veya telefonunu prizde ve ekranı açık konumda tutunuz.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
        >
          Rehberi Anladım & Nizamiyeye Devam Et
        </button>
      </div>
    </div>
  );
};
