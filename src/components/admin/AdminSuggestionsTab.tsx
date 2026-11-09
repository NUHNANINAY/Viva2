/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquareQuote, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminSuggestionsTab: React.FC = () => {
  const { suggestionList, respondToSuggestion } = useApp();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (id: string) => {
    if (!replyText.trim()) return;
    respondToSuggestion(id, replyText.trim());
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-luxury font-bold text-[#294C3C]">
            Sakin Öneri & Talep Kutusu
          </h2>
          <p className="text-xs text-[#26342C]/65">
            Daire sakinlerinin yönetim kuruluna ilettiği geri bildirimler
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#648875]/15 text-[#294C3C] border border-[#648875]/30">
          Toplam: {suggestionList.length} Talep
        </span>
      </div>

      <div className="space-y-4">
        {suggestionList.map((sug) => (
          <div
            key={sug.id}
            className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#DDE5DF] shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DF] pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-[#294C3C]">{sug.title}</h4>
                <p className="text-xs text-[#26342C]/65">
                  Gönderen: <strong>{sug.residentName}</strong> ({sug.residentBlock} Blok D:{sug.residentApartment}) · {sug.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#648875]/15 text-[#294C3C]">
                  {sug.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    sug.status === 'yanitlandi'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {sug.status === 'yanitlandi' ? 'Yanıtlandı' : 'İnceleniyor'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#26342C]/85 bg-[#F7F8F5] p-3 rounded-xl border border-[#DDE5DF]">
              "{sug.message}"
            </p>

            {sug.adminResponse ? (
              <div className="p-3 rounded-xl bg-[#648875]/10 border border-[#648875]/30 text-xs">
                <span className="text-[10px] font-bold text-[#294C3C] uppercase tracking-wider block">
                  Yönetim Kurulu Cevabı ({sug.respondedAt}):
                </span>
                <p className="text-[#26342C] font-medium mt-1">{sug.adminResponse}</p>
              </div>
            ) : (
              <div>
                {activeReplyId === sug.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      placeholder="Sakine iletilecek cevabı yazınız..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE5DF] focus:border-[#648875] text-xs text-[#26342C]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="px-3 py-1.5 rounded-xl border border-[#DDE5DF] text-xs font-semibold text-[#26342C]/60"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleReplySubmit(sug.id)}
                        className="px-4 py-1.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Cevabı Gönder</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveReplyId(sug.id);
                      setReplyText('');
                    }}
                    className="text-xs font-bold text-[#294C3C] hover:text-[#648875] flex items-center gap-1 pt-1"
                  >
                    <Send className="w-3.5 h-3.5 text-[#648875]" />
                    <span>Bu Talebe Cevap Yaz</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
