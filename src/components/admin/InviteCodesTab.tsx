/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, Plus, Copy, Check, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { collection, doc, getDocs, setDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface InviteCodeItem {
  id: string;
  code: string;
  block: string;
  apartment: string;
  used: boolean;
  usedByEmail?: string;
  expiresAt: string;
  createdAt: string;
}

export const InviteCodesTab: React.FC = () => {
  const { siteInfo } = useApp();
  const [inviteCodes, setInviteCodes] = useState<InviteCodeItem[]>([]);
  const [selectedBlock, setSelectedBlock] = useState(siteInfo.blocks?.[0]?.block || 'A');
  const [apartmentNo, setApartmentNo] = useState('1');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<string | null>(null);

  // Load invite codes from Firestore
  useEffect(() => {
    if (!siteInfo.id) return;
    const codesRef = collection(db, 'sites', siteInfo.id, 'inviteCodes');
    const unsub = onSnapshot(
      codesRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as InviteCodeItem));
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setInviteCodes(list);
      },
      (err) => console.warn('Invite codes notice:', err)
    );
    return () => unsub();
  }, [siteInfo.id]);

  const generateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSuccess(null);

    try {
      // Cryptographically random 6-character suffix
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codeString = `VIVA-${selectedBlock}${apartmentNo}-${randomSuffix}`;
      const codeDocRef = doc(db, 'sites', siteInfo.id, 'inviteCodes', codeString);

      // 7 days expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      const newCode: InviteCodeItem = {
        id: codeString,
        code: codeString,
        block: selectedBlock,
        apartment: apartmentNo,
        used: false,
        expiresAt: expires.toISOString(),
        createdAt: new Date().toISOString(),
      };

      await setDoc(codeDocRef, newCode);
      setGeneratedSuccess(codeString);
    } catch (err: any) {
      console.error('Failed to create invite code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white border border-[#DDE5DF] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#648875]/15 border border-[#648875]/30 flex items-center justify-center text-[#294C3C]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#294C3C]">Tek Kullanımlık Daire Davet Kodları</h3>
            <p className="text-xs text-[#26342C]/65">
              Sakinlerin yalnızca kendi dairesine kayıt olabilmesi için süreli, tek kullanımlık güvenlik kodları üretin.
            </p>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={generateCode} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-xs font-bold text-[#294C3C] block mb-1">Blok Seçin</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-semibold bg-[#F7F8F5]"
            >
              {(siteInfo.blocks || [{ block: 'A' }, { block: 'B' }, { block: 'C' }]).map((b) => (
                <option key={b.block} value={b.block}>
                  {b.block} Blok
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#294C3C] block mb-1">Daire No</label>
            <input
              type="text"
              value={apartmentNo}
              onChange={(e) => setApartmentNo(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[#DDE5DF] text-xs font-semibold bg-[#F7F8F5]"
              placeholder="Örn: 12"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#294C3C] hover:bg-[#648875] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Üretiliyor...' : 'Yeni Davet Kodu Üret'}</span>
            </button>
          </div>
        </form>

        {generatedSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                Yeni Kod Üretildi: <strong>{generatedSuccess}</strong> ({selectedBlock} Blok Daire {apartmentNo})
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(generatedSuccess)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors"
            >
              {copiedCode === generatedSuccess ? 'Kopyalandı' : 'Kodu Kopyala'}
            </button>
          </div>
        )}
      </div>

      {/* Code List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#294C3C] uppercase tracking-wider">
          Mevcut Davet Kodları ({inviteCodes.length})
        </h4>

        {inviteCodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-[#DDE5DF]">
            Henüz üretilmiş bir davet kodu bulunmuyor. Yukarıdaki formdan yeni kod oluşturabilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inviteCodes.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  item.used
                    ? 'bg-neutral-50 border-neutral-200 opacity-60'
                    : 'bg-white border-[#DDE5DF] shadow-2xs hover:border-[#648875]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#294C3C]">{item.code}</span>
                    {item.used ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-bold">
                        Kullanıldı
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#26342C]/70">
                    Hedef: <strong>{item.block} Blok Daire {item.apartment}</strong>
                    {item.usedByEmail && <span className="text-[11px] text-gray-500 ml-1">({item.usedByEmail})</span>}
                  </p>
                </div>

                {!item.used && (
                  <button
                    onClick={() => copyToClipboard(item.code)}
                    className="p-2 rounded-xl border border-[#DDE5DF] hover:bg-[#F7F8F5] text-[#294C3C] transition-colors"
                    title="Kodu Kopyala"
                  >
                    {copiedCode === item.code ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#648875]" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
