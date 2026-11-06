/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquareQuote,
  CheckCircle2,
  Send,
  Building,
  User,
  Filter,
  AlertCircle,
  X,
} from 'lucide-react';
import { SuggestionCategory, SuggestionOrComplaint } from '../../types';

export const AdminSuggestionsTab: React.FC = () => {
  const { suggestionList, replyToSuggestion } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<SuggestionOrComplaint['status']>('yanitlandi');

  const categories: SuggestionCategory[] = [
    'Temizlik',
    'Teknik & Bakım',
    'Güvenlik',
    'Peyzaj & Bahçe',
    'Otopark Düzeni',
    'Genel Öneri',
  ];

  const handleOpenReply = (item: SuggestionOrComplaint) => {
    setActiveReplyId(item.id);
    setReplyText(item.adminResponse || '');
    setNewStatus(item.status === 'yeni' ? 'yanitlandi' : item.status);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplyId || !replyText.trim()) return;

    replyToSuggestion(activeReplyId, replyText.trim(), newStatus);
    setActiveReplyId(null);
    setReplyText('');
  };

  const filtered = suggestionList.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#1B1D25] border border-[#292B36] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#292B36] text-[#C5A66A] flex items-center justify-center border border-[#C5A66A]/20">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEE9DE]">Sakin Öneri & Talep Kutusu</h2>
            <p className="text-xs text-[#EEE9DE]/60">Sakinlerden gelen geri bildirimler ve yanıtlar</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#1B1D25] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#1B1D25] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="yeni">Yeni</option>
          <option value="inceleniyor">İnceleniyor</option>
          <option value="yanitlandi">Yanıtlandı</option>
          <option value="cozuldu">Çözüldü</option>
        </select>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-[#1B1D25] border border-[#292B36] text-[#EEE9DE]/50 text-xs">
            Seçili kriterlere uygun öneri bulunamadı.
          </div>
        ) : (
          filtered.map((item) => {
            const statusLabels: Record<string, { label: string; color: string }> = {
              yeni: { label: 'Yeni', color: 'text-amber-300 bg-amber-950/40 border-amber-500/30' },
              inceleniyor: { label: 'İnceleniyor', color: 'text-blue-300 bg-blue-950/40 border-blue-500/30' },
              yanitlandi: { label: 'Yanıtlandı', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' },
              cozuldu: { label: 'Çözüldü', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50' },
            };
            const st = statusLabels[item.status] || statusLabels.yeni;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#1B1D25] border border-[#292B36] space-y-3 hover:border-[#C5A66A]/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#292B36] text-[#DFC38E]">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-[#EEE9DE]">
                        {item.residentBlock} Blok · D:{item.residentApartment} ({item.residentName})
                      </span>
                      {item.urgency === 'acil' && (
                        <span className="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/40">
                          Acil
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#EEE9DE] mt-1.5">{item.title}</h3>
                    <p className="text-[11px] text-[#EEE9DE]/50">{item.createdAt}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <p className="text-xs text-[#EEE9DE]/80 leading-relaxed bg-[#111318] p-3 rounded-xl border border-[#292B36]">
                  {item.message}
                </p>

                {item.adminResponse && (
                  <div className="p-3.5 rounded-xl bg-[#292B36]/80 border border-[#C5A66A]/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#DFC38E] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#C5A66A]" />
                        Mevcut Yönetici Yanıtınız
                      </span>
                      <span className="text-[#EEE9DE]/50">{item.respondedAt}</span>
                    </div>
                    <p className="text-xs text-[#EEE9DE]">{item.adminResponse}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#292B36] flex justify-end">
                  <button
                    onClick={() => handleOpenReply(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#292B36] hover:bg-[#C5A66A] hover:text-[#111318] text-xs font-semibold text-[#DFC38E] transition-all touch-target"
                  >
                    {item.adminResponse ? 'Yanıtı Düzenle' : 'Sakin Mesajını Yanıtla'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {activeReplyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#1B1D25] border border-[#C5A66A]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-[#EEE9DE]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-luxury font-bold text-[#DFC38E]">
                Sakin Bildirimini Yanıtla
              </h3>
              <button
                onClick={() => setActiveReplyId(null)}
                className="text-[#EEE9DE]/60 hover:text-[#EEE9DE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1.5">
                  Yeni Durum
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none"
                >
                  <option value="inceleniyor">İnceleniyor (Teknik / İdari incelemede)</option>
                  <option value="yanitlandi">Yanıtlandı (Bilgi verildi)</option>
                  <option value="cozuldu">Çözüldü (İşlem tamamlandı)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#DFC38E] uppercase mb-1.5">
                  Yönetim Kurulu Yanıt Metni
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Daire sakinine iletilecek yanıt ve yapılan işlemler..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] text-xs text-[#EEE9DE] focus:border-[#C5A66A] focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#292B36]">
                <button
                  type="button"
                  onClick={() => setActiveReplyId(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#EEE9DE]/60 hover:bg-[#292B36]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] font-bold text-xs shadow-md"
                >
                  Yanıtı Sakine İlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
