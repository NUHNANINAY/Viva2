import React, { useState } from 'react';
import { RequestsTab } from './RequestsTab';
import { AdminCargoTab } from './AdminCargoTab';
import { AdminSuggestionsTab } from './AdminSuggestionsTab';
import { Users, Package, MessageSquareQuote, KeyRound, Megaphone, Plus, CheckCircle2, Clock, Trash2, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteAnnouncement } from '../../types';

export const OperationsTab: React.FC = () => {
  const {
    siteInfo,
    keyHandovers,
    addKeyHandover,
    returnKeyHandover,
    announcements,
    addAnnouncement,
  } = useApp();

  const [subTab, setSubTab] = useState<'guests' | 'cargos' | 'suggestions' | 'keys' | 'announcements'>('guests');

  // New Announcement Modal State
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'genel' | 'bakim' | 'guvenlik' | 'toplanti' | 'aidat'>('genel');
  const [annPriority, setAnnPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [annTarget, setAnnTarget] = useState<'all' | 'block' | 'unit'>('all');
  const [annBlock, setAnnBlock] = useState('A');
  const [annApartment, setAnnApartment] = useState('1');

  // Key Handover state
  const [keyFilter, setKeyFilter] = useState<'all' | 'held' | 'returned'>('held');

  return (
    <div className="space-y-6">
      {/* Subtab Navigator */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#DDE5DF] shadow-xs">
        <button
          onClick={() => setSubTab('guests')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'guests'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Misafir Girişleri</span>
        </button>

        <button
          onClick={() => setSubTab('cargos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'cargos'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Emanet Kargolar</span>
        </button>

        <button
          onClick={() => setSubTab('keys')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'keys'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Anahtar & Zimmet</span>
          {keyHandovers.filter((k) => k.status === 'held' || k.status === 'teslim_edildi').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
              {keyHandovers.filter((k) => k.status === 'held' || k.status === 'teslim_edildi').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'announcements'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <Megaphone className="w-4 h-4 text-[#648875]" />
          <span>Site Duyuruları ({announcements.length})</span>
        </button>

        <button
          onClick={() => setSubTab('suggestions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'suggestions'
              ? 'bg-[#294C3C] text-white shadow-xs'
              : 'text-[#26342C]/70 hover:bg-[#F7F8F5]'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Sakin Talepleri & Şikayetler</span>
        </button>
      </div>

      {/* Render Subtab */}
      <div>
        {subTab === 'guests' && <RequestsTab />}
        {subTab === 'cargos' && <AdminCargoTab />}
        {subTab === 'suggestions' && <AdminSuggestionsTab />}

        {/* 1. KEY HANDOVER ADMIN SUBTAB */}
        {subTab === 'keys' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#294C3C]">Anahtar & Ortak Alan Zimmet Defteri</h3>
                <p className="text-xs text-gray-500">
                  Nizamiye tarafından teslim edilen anahtar, bariyer kumandası ve teçhizatların merkezi kaydı
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setKeyFilter('held')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    keyFilter === 'held' ? 'bg-[#294C3C] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Teslimde ({keyHandovers.filter((k) => k.status === 'held' || k.status === 'teslim_edildi').length})
                </button>
                <button
                  onClick={() => setKeyFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    keyFilter === 'all' ? 'bg-[#294C3C] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Tümü ({keyHandovers.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keyHandovers
                .filter((k) => {
                  const isHeld = k.status === 'held' || k.status === 'teslim_edildi';
                  if (keyFilter === 'held') return isHeld;
                  return true;
                })
                .map((k) => {
                  const isHeld = k.status === 'held' || k.status === 'teslim_edildi';
                  return (
                    <div
                      key={k.id}
                      className="p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#294C3C]">{k.keyName || k.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isHeld
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {isHeld ? 'Dışarıda / Teslimde' : 'İade Alındı'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Teslim Alan: <strong>{k.recipientName || k.holderName}</strong> {k.holderRole && `(${k.holderRole})`} · Tel: {k.recipientPhone || k.holderPhone}
                          {k.block && ` · Blok ${k.block} Daire ${k.apartment}`}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Güvenlik Görevlisi: {k.handedOverBy || k.securityGuardName} · {k.handedOverAt || (k.givenAt ? new Date(k.givenAt).toLocaleString('tr-TR') : '')}
                        </p>
                      </div>

                      {isHeld && (
                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                          <button
                            onClick={() => returnKeyHandover(k.id, 'Site Yönetimi')}
                            className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>İade Edildi Olarak Onayla</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 2. ANNOUNCEMENTS ADMIN SUBTAB */}
        {subTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#294C3C]">Resmi Site Duyuruları</h3>
                <p className="text-xs text-gray-500">
                  Tüm siteye, belirli bir bloğa veya daireye hedeflenmiş duyuru yayını
                </p>
              </div>
              <button
                onClick={() => setShowNewAnnouncementModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-emerald-300" />
                <span>Yeni Duyuru Yayınla (+)</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="p-5 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {a.priority.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{a.category || 'Duyuru'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Hedef: {a.targetAudience === 'all' || a.targetType === 'tum_site' || !a.targetType ? 'Tüm Site' : (a.targetAudience === 'block' || a.targetType === 'blok') ? `${a.targetBlock} Blok` : `${a.targetBlock} Blok D${a.targetApartment}`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#294C3C]">{a.title}</h4>
                  <p className="text-xs text-[#26342C]/80 leading-relaxed whitespace-pre-line">{a.content}</p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Yayınlayan: <strong>{a.authorName}</strong></span>
                    <span className="font-semibold text-emerald-800">
                      Okuyan Sakin Sayısı: {a.readByUids?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NEW ANNOUNCEMENT MODAL */}
      {showNewAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#DDE5DF] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDE5DF]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#648875]" />
                <h3 className="text-base font-bold text-[#294C3C]">Yeni Site Duyurusu Oluştur</h3>
              </div>
              <button onClick={() => setShowNewAnnouncementModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addAnnouncement({
                  title: annTitle.trim(),
                  content: annContent.trim(),
                  category: annCategory,
                  priority: annPriority,
                  targetAudience: annTarget,
                  targetBlock: annTarget !== 'all' ? annBlock : undefined,
                  targetApartment: annTarget === 'unit' ? annApartment : undefined,
                  authorName: siteInfo.adminName || 'Site Yönetimi',
                });
                setShowNewAnnouncementModal(false);
                setAnnTitle('');
                setAnnContent('');
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Duyuru Başlığı *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Örn: Asansör Periyodik Bakımı ve Kesinti Bilgilendirmesi"
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Kategori</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                  >
                    <option value="genel">Genel</option>
                    <option value="bakim">Bakım & Onarım</option>
                    <option value="guvenlik">Güvenlik</option>
                    <option value="toplanti">Genel Kurul & Toplantı</option>
                    <option value="aidat">Aidat & Muhasebe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#294C3C] mb-1">Önem / Aciliyet</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek (Önemli)</option>
                    <option value="urgent">Acil / Kırmızı Uyarı</option>
                    <option value="low">Düşük (Bilgilendirme)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Hedef Kitle</label>
                <select
                  value={annTarget}
                  onChange={(e) => setAnnTarget(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs bg-white"
                >
                  <option value="all">Tüm Site Sakinleri</option>
                  <option value="block">Belirli Blok</option>
                  <option value="unit">Tekil Daire</option>
                </select>
              </div>

              {annTarget !== 'all' && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-[#294C3C] mb-1">Blok</label>
                    <select
                      value={annBlock}
                      onChange={(e) => setAnnBlock(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-300 text-xs bg-white"
                    >
                      {(siteInfo.blocks?.map((b) => b.block) || ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I']).map((b) => (
                        <option key={b} value={b}>
                          {b} Blok
                        </option>
                      ))}
                    </select>
                  </div>
                  {annTarget === 'unit' && (
                    <div>
                      <label className="block text-xs font-bold text-[#294C3C] mb-1">Daire No</label>
                      <input
                        type="text"
                        value={annApartment}
                        onChange={(e) => setAnnApartment(e.target.value)}
                        placeholder="Örn: 4"
                        className="w-full p-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#294C3C] mb-1">Duyuru Metni *</label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Duyurunun detaylarını buraya yazınız..."
                  className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs focus:outline-none focus:border-[#648875]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAnnouncementModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DDE5DF] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Duyuruyu Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
