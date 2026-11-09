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
    <div className="space-y-5 pb-8">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#F7F8F5] border border-[#DDE5DF] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 text-[#294C3C] flex items-center justify-center border border-[#648875]/30">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-luxury font-bold text-[#294C3C]">Öneri, Talep ve Bildirim</h2>
            <p className="text-xs text-[#26342C]/65">Site yönetimine doğrudan mesaj iletin</p>
          </div>
        </div>
        <span className="text-xs text-[#648875] font-semibold hidden sm:inline">
          {residentUser.block} Blok D:{residentUser.apartment}
        </span>
      </div>

      {showSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Mesajınız yönetim kurulu gelen kutusuna iletildi. İncelendiğinde bu ekrandan yanıtı görebilirsiniz.</span>
        </div>
      )}

      {/* Suggestion Form */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-md space-y-4">
        <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-[#648875]" />
          <span>Yönetime Mesaj Gönder</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
              Konu Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Kapalı otopark giriş aydınlatması"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SuggestionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#294C3C] font-semibold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
                Öncelik Derecesi
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'oncelikli', label: 'Öncelikli' },
                  { id: 'acil', label: 'Acil' },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id as UrgencyLevel)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      urgency === u.id
                        ? 'bg-[#648875] text-white border-[#294C3C]'
                        : 'bg-[#F7F8F5] text-[#26342C]/70 border-[#DDE5DF]'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26342C]/80 mb-1.5">
              Mesajınız / Talep Detayları *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Yönetim kuruluna iletmek istediğiniz detayları buraya yazınız..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] focus:outline-none text-xs text-[#26342C] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md touch-target flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Yönetime İlet</span>
          </button>
        </form>
      </div>

      {/* Existing Suggestions */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
          İlettiğim Mesajlar ({mySuggestions.length})
        </h3>

        {mySuggestions.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#F7F8F5] border border-[#DDE5DF] text-xs text-[#26342C]/50">
            Henüz yönetime iletilmiş bir talep veya öneriniz bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-4 rounded-2xl bg-white border border-[#DDE5DF] space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#294C3C]">{sug.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#26342C]/60 mt-0.5">
                      <span className="font-semibold text-[#648875]">{sug.category}</span>
                      <span>·</span>
                      <span>{sug.createdAt}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      sug.status === 'yanitlandi' || sug.status === 'cozuldu'
                        ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                        : 'text-amber-800 bg-amber-50 border-amber-300'
                    }`}
                  >
                    {sug.status === 'yanitlandi'
                      ? 'Yanıtlandı'
                      : sug.status === 'cozuldu'
                      ? 'Çözüldü'
                      : 'İnceleniyor'}
                  </span>
                </div>

                <p className="text-xs text-[#26342C]/80 leading-relaxed bg-[#F7F8F5] p-3 rounded-xl border border-[#DDE5DF]">
                  "{sug.message}"
                </p>

                {sug.adminResponse && (
                  <div className="p-3 rounded-xl bg-[#648875]/10 border border-[#648875]/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#294C3C] uppercase tracking-wider block">
                      Yönetim Kurulu Yanıtı ({sug.respondedAt}):
                    </span>
                    <p className="text-xs text-[#26342C] font-medium leading-relaxed">
                      {sug.adminResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
