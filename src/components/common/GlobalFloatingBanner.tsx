/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Volume2, CheckCircle, AlertTriangle, Package, Users, X } from 'lucide-react';

export const GlobalFloatingBanner: React.FC = () => {
  const { floatingAlert, dismissFloatingAlert } = useApp();

  if (!floatingAlert) return null;

  const getIcon = () => {
    switch (floatingAlert.type) {
      case 'order':
        return <Package className="w-6 h-6 text-amber-300 animate-bounce" />;
      case 'guest':
        return <Users className="w-6 h-6 text-emerald-300 animate-pulse" />;
      case 'cargo':
        return <Package className="w-6 h-6 text-sky-300 animate-pulse" />;
      default:
        return <Bell className="w-6 h-6 text-emerald-300 animate-bounce" />;
    }
  };

  const getBorderColor = () => {
    switch (floatingAlert.type) {
      case 'order':
        return 'border-amber-400 bg-[#1e2a22] text-amber-50';
      case 'guest':
        return 'border-emerald-400 bg-[#1d3529] text-emerald-50';
      case 'cargo':
        return 'border-sky-400 bg-[#1c2c36] text-sky-50';
      default:
        return 'border-[#648875] bg-[#294C3C] text-white';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-top-6 shadow-2xl"
    >
      <div
        className={`flex items-start justify-between gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md ${getBorderColor()}`}
      >
        {/* Pulsing Audio Wave Icon */}
        <div className="flex items-center gap-2 mt-0.5 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black/30 border border-white/10">
            {getIcon()}
            {/* Audio wave pulse ring */}
            <span className="absolute -inset-1 rounded-xl bg-white/20 animate-ping pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20 text-white">
              <Volume2 className="w-3 h-3 animate-pulse" />
              CANLI UYARI
            </span>
            <h4 className="text-sm sm:text-base font-bold truncate leading-tight">
              {floatingAlert.title}
            </h4>
          </div>
          <p className="text-xs sm:text-sm font-medium opacity-90 leading-snug break-words">
            {floatingAlert.message}
          </p>
        </div>

        {/* Action & Dismiss buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
          {floatingAlert.actionLabel && floatingAlert.onAction && (
            <button
              onClick={() => {
                floatingAlert.onAction?.();
                dismissFloatingAlert();
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-[#294C3C] hover:bg-[#F7F8F5] text-xs font-black shadow-md transition-transform active:scale-95"
            >
              {floatingAlert.actionLabel}
            </button>
          )}

          <button
            onClick={dismissFloatingAlert}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-bold border border-white/20 transition-all active:scale-95"
            title="Sesi Sustur ve Bildirimi Kapat"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>TAMAM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
