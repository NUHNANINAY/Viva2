import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ResidentsTab: React.FC = () => {
  const { siteResidents, siteInfo } = useApp();
  const [query, setQuery] = useState('');
  const [block, setBlock] = useState('all');
  const rows = useMemo(() => siteResidents.filter(r =>
    (block === 'all' || r.block === block) &&
    (`${r.fullName} ${r.block}${r.apartment} ${r.phone || ''}`).toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
  ), [siteResidents, query, block]);
  return <section className="space-y-4">
    <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#294C3C]">Kayıtlı Site Sakinleri</h2><p className="text-xs text-gray-500">{siteInfo.name} · Yönetici onayı olmadan kendi kaydını oluşturan sakinler dahil</p></div><span className="rounded-full bg-[#E8F0EB] px-3 py-2 text-sm font-bold text-[#294C3C]">{siteResidents.length} kayıt</span></div>
    <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ad, telefon veya daire ara" className="w-full rounded-xl border p-3 pl-9 text-sm"/></div><select value={block} onChange={e=>setBlock(e.target.value)} className="rounded-xl border px-3 text-sm"><option value="all">Tüm bloklar</option>{siteInfo.blocks?.map(b=><option key={b.block}>{b.block}</option>)}</select></div>
    {rows.length ? rows.map(r=><div key={r.id} className="rounded-2xl border border-[#DDE5DF] bg-white p-4 flex items-center justify-between gap-3"><div><p className="font-bold text-[#294C3C]">{r.fullName}</p><p className="text-xs text-gray-600">{r.block} Blok · Daire {r.apartment} · {r.phone || 'Telefon yok'}</p></div><span className="text-[10px] rounded-full bg-emerald-50 text-emerald-800 px-2 py-1">Kayıtlı</span></div>) : <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500"><Users className="mx-auto mb-2"/>Bu filtrede sakin kaydı bulunamadı.</div>}
  </section>;
};
