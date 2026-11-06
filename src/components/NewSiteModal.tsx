/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building2, MapPin, User, Phone, Check } from 'lucide-react';
import { SITE_BLOCKS } from '../data/initialData';

interface NewSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (siteId: string) => void;
}

export const NewSiteModal: React.FC<NewSiteModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { addNewSite } = useApp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([...SITE_BLOCKS]);
  const [maxApartments, setMaxApartments] = useState(15);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [securityPhone, setSecurityPhone] = useState('');

  if (!isOpen) return null;

  const toggleBlock = (block: string) => {
    if (selectedBlocks.includes(block)) {
      if (selectedBlocks.length > 1) {
        setSelectedBlocks(selectedBlocks.filter((b) => b !== block));
      }
    } else {
      setSelectedBlocks([...selectedBlocks, block].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = addNewSite({
      name: name.trim(),
      city: city.trim(),
      district: district.trim() || 'Merkez',
      address: address.trim() || `${district} / ${city}`,
      blocks: selectedBlocks,
      maxApartmentsPerBlock: maxApartments,
      managerName: managerName.trim() || 'Site Müdürü',
      managerPhone: managerPhone.trim() || '+90 532 000 0000',
      securityPhone: securityPhone.trim() || '+90 532 000 0001',
    });

    onCreated(newId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1B1D25] border border-[#C5A66A]/35 rounded-3xl p-6 shadow-2xl my-8 text-[#EEE9DE]">
        <div className="flex items-center justify-between pb-4 border-b border-[#292B36]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#292B36] border border-[#C5A66A]/30 flex items-center justify-center text-[#C5A66A]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-luxury font-bold text-[#EEE9DE]">Yeni Site Kaydı</h3>
              <p className="text-xs text-[#EEE9DE]/70">VİVA SİTE Ağına Yeni Mülk Ekle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#EEE9DE]/60 hover:text-[#EEE9DE] hover:bg-[#292B36] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
              Site / Rezidans Adı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Viva Vadi Konakları"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE] placeholder:text-[#EEE9DE]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                İl
              </label>
              <input
                type="text"
                required
                placeholder="İstanbul"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                İlçe
              </label>
              <input
                type="text"
                placeholder="Örn: Sarıyer"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
              Açık Adres
            </label>
            <input
              type="text"
              placeholder="Cadde, Mahalle, No"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
            />
          </div>

          {/* Blocks selector */}
          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
              Sitedeki Bloklar ({selectedBlocks.length} Seçili)
            </label>
            <div className="flex flex-wrap gap-2">
              {SITE_BLOCKS.map((blk) => {
                const isSelected = selectedBlocks.includes(blk);
                return (
                  <button
                    key={blk}
                    type="button"
                    onClick={() => toggleBlock(blk)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#C5A66A] text-[#111318] border-[#C5A66A]'
                        : 'bg-[#111318] text-[#EEE9DE]/60 border-[#292B36] hover:border-[#C5A66A]/50'
                    }`}
                  >
                    {blk} Blok
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit capacity */}
          <div>
            <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
              Blok Başına Daire Kapasitesi
            </label>
            <select
              value={maxApartments}
              onChange={(e) => setMaxApartments(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
            >
              <option value={15}>15 Daire (Standart Lüks Modül: 1 - 15)</option>
              <option value={20}>20 Daire</option>
              <option value={30}>30 Daire</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                Yönetici Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Hakan Yılmaz"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#DFC38E] uppercase tracking-wider mb-1.5">
                Nizamiye / Güvenlik Tel
              </label>
              <input
                type="text"
                placeholder="0212..."
                value={securityPhone}
                onChange={(e) => setSecurityPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111318] border border-[#292B36] focus:border-[#C5A66A] focus:outline-none text-sm text-[#EEE9DE]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#292B36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#EEE9DE]/70 hover:bg-[#292B36] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A66A] to-[#DFC38E] text-[#111318] text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md touch-target"
            >
              <Check className="w-4 h-4" />
              <span>Siteyi Kaydet ve Başla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
