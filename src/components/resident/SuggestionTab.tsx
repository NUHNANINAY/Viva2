/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquareQuote,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Building,
  Check,
} from 'lucide-react';
import { SuggestionCategory, UrgencyLevel } from '../../types';

export const SuggestionTab: React.FC = () => {
  const { suggestionList, addSuggestion, residentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SuggestionCategory>('Genel Öneri');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [message, setMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Resident's own suggestions
  const mySuggestions = suggestionList.filter(
    (s) => s.residentBlock === residentUser.block && s.residentApartment === residentUser.apartment
  );

  const categories: SuggestionCategory[] = [
    'Temizlik',
    'Teknik & Bakım',
    'Güvenlik',
    'Peyzaj & Bahçe',
    'Otopark Düzeni',
    'Genel Öneri',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addSuggestion({
      title: title.trim(),
      category,
      urgency,
      message: message.trim(),
    });

    setTitle('');
    setMessage('');
    setUrgency('normal');
    setCategory('Genel Öneri');

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Öneri, Talep ve Bildirim</h2>
            <p className="text-xs text-[#EEE9DE]/60">Site yönetimine doğrudan mesaj gönderin</p>
          </div>
        </div>
        <span className="text-xs text-[#DFC38E] font-medium hidden sm:inline">
          {residentUser.block} Blok D:{residentUser.apartment}
        </span>
      </div>

      {showSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Mesajınız yönetim kurulu gelen kutusuna iletildi. İncelendiğinde bu ekrandan yanıtı görebilirsiniz.</span>
        </div>
      )}

      {/* Suggestion Form */}
      <div className="p-5 rounded-2xl bg-[#1B1D25] border border-[#C5A66A]/25 space-y-4">
        <h3 className="text-sm font-luxury font-bold text-[#DFC38E] uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-[#C5A66A]" />
          <span>Yönetime Mesaj Gönder</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
              Konu Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Otopark -2 katı aydınlatması hakkında..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SuggestionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
                Aciliyet Durumu
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setUrgency('normal')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    urgency === 'normal'
                      ? 'bg-[#292B36] text-[#DFC38E] border-[#C5A66A]'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border-[#292B36]'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('oncelikli')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    urgency === 'oncelikli'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border-[#292B36]'
                  }`}
                >
                  Öncelikli
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('acil')}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    urgency === 'acil'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                      : 'bg-[#111318] text-[#EEE9DE]/60 border-[#292B36]'
                  }`}
                >
                  Acil
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#EEE9DE]/80 mb-1.5">
              Mesajınız / Öneriniz *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Görüş, öneri veya teknik talep detaylarınızı buraya yazınız..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-xs text-[#EEE9DE] leading-relaxed resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-md touch-target flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-[#111318]" />
            <span>Yönetime İlet</span>
          </button>
        </form>
      </div>

      {/* Past Submissions & Responses */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#DFC38E] uppercase tracking-wider">
          Önceki Bildirimlerim & Yönetici Yanıtları ({mySuggestions.length})
        </h3>

        {mySuggestions.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
            Henüz site yönetimine ilettiğiniz bir bildirim bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((item) => {
              const statusLabels: Record<string, { label: string; color: string }> = {
                yeni: { label: 'Yeni İletildi', color: 'text-amber-300 bg-amber-950/40 border-amber-500/30' },
                inceleniyor: { label: 'İnceleniyor', color: 'text-blue-300 bg-blue-950/40 border-blue-500/30' },
                yanitlandi: { label: 'Yanıtlandı', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' },
                cozuldu: { label: 'Çözüldü', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50' },
              };

              const st = statusLabels[item.status] || statusLabels.yeni;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#DFC38E] px-2 py-0.5 rounded bg-[#111318] border border-[#292B36]">
                          {item.category}
                        </span>
                        {item.urgency === 'acil' && (
                          <span className="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/40">
                            Acil
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#EEE9DE] mt-1.5">{item.title}</h4>
                      <p className="text-[11px] text-[#EEE9DE]/50">{item.createdAt}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <p className="text-xs text-[#EEE9DE]/80 leading-relaxed bg-[#111318]/70 p-3 rounded-xl border border-[#292B36]">
                    {item.message}
                  </p>

                  {/* Admin reply card */}
                  {item.adminResponse && (
                    <div className="p-3.5 rounded-xl bg-[#292B36]/80 border border-[#C5A66A]/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#DFC38E] flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#C5A66A]" />
                          Yönetim Kurulu Yanıtı
                        </span>
                        <span className="text-[#EEE9DE]/50">{item.respondedAt}</span>
                      </div>
                      <p className="text-xs text-[#EEE9DE] leading-relaxed">
                        {item.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
