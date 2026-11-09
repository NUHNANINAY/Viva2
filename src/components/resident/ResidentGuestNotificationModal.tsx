/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Home, Coffee, X, Clock, AlertCircle } from 'lucide-react';
import { playMysticGuestAlertChime } from '../../utils/audio';

export const ResidentGuestNotificationModal: React.FC = () => {
  const { guestList, residentUser, respondToGuestArrival } = useApp();
  const [timeLeft, setTimeLeft] = useState(90);

  // Find if there is a pending gate guest for this resident
  const pendingGateGuest = guestList.find(
    (g) =>
      g.source === 'guvenlik' &&
      g.status === 'bekleniyor' &&
      !g.residentResponse &&
      g.block === residentUser.block &&
      g.apartment === residentUser.apartment
  );

  useEffect(() => {
    if (pendingGateGuest) {
      playMysticGuestAlertChime();
      setTimeLeft(90);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto timeout
            respondToGuestArrival(pendingGateGuest.id, 'YOKUM');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [pendingGateGuest?.id]);

  if (!pendingGateGuest) return null;

  const handleResponse = (choice: 'EVDEYIM' | 'CAFEDEYIM') => {
    respondToGuestArrival(pendingGateGuest.id, choice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95">
      <div className="bg-[#FFFFFF] border-4 border-[#294C3C] w-full max-w-md rounded-3xl p-6 shadow-2xl text-center space-y-4 ring-8 ring-[#648875]/20 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-[#648875]/15 border-2 border-[#294C3C] flex items-center justify-center mx-auto text-[#294C3C]">
          <Users className="w-8 h-8 text-[#294C3C] animate-bounce" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#294C3C] text-white">
            NİZAMİYE KAPISINDA MİSAFİRİNİZ VAR
          </span>
          <h2 className="text-xl font-bold font-luxury text-[#294C3C] pt-1">
            {pendingGateGuest.fullName || 'Misafiriniz'} Giriş Yapmak İstiyor
          </h2>
          <p className="text-xs text-[#26342C]/70">
            Daire: <strong>{pendingGateGuest.block} Blok Daire {pendingGateGuest.apartment}</strong>
          </p>
        </div>

        {/* 90-second countdown */}
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Yanıt Süresi: {timeLeft} saniye</span>
        </div>

        {/* 2 Big Options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleResponse('EVDEYIM')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#294C3C] hover:bg-[#648875] text-white transition-all shadow-md group touch-target"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">EVDEYİM</span>
            <span className="text-[10px] text-white/80 mt-1">Daireme Gelebilir</span>
          </button>

          <button
            onClick={() => handleResponse('CAFEDEYIM')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#648875] hover:bg-[#294C3C] text-white transition-all shadow-md group touch-target"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-extrabold uppercase tracking-wider">CAFEDEYİM</span>
            <span className="text-[10px] text-white/80 mt-1">Lounge/Kafedeyim</span>
          </button>
        </div>

        <p className="text-[10px] text-gray-500 pt-1">
          Bildirim Notu: Güvenlik görevlisine anında sesli olarak tercihiniz iletilecektir.
        </p>
      </div>
    </div>
  );
};
