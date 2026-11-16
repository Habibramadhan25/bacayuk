import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Flame, Search, CheckCircle } from 'lucide-react';
import { HistoryItem, initialHistory } from '../../lib/mockData';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';

function formatDateSafe(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const RiwayatSiswa = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'reading' | 'done'>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bacayuk_history');
      const data = saved ? JSON.parse(saved) : initialHistory;
      setHistory(Array.isArray(data) ? data : initialHistory);
    } catch {
      setHistory(initialHistory);
    }
  }, []);

  const stats = useMemo(() => {
    const done = history.filter(h => h.status === 'Selesai').length;
    const reading = history.filter(h => h.status === 'Sedang Dibaca').length;
    const pages = history.reduce((acc, h) => acc + (Number(h.currentPage) || 0), 0);
    const hours = Math.max(1, Math.round(pages / 30));
    return { done, reading, pages, hours, streak: Math.max(1, Math.min(7, history.length || 1)) };
  }, [history]);

  const filtered = history.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (item.bookTitle || '').toLowerCase().includes(q) || (item.author || '').toLowerCase().includes(q);
    const matchFilter = filter === 'all' ? true : filter === 'reading' ? item.status === 'Sedang Dibaca' : item.status === 'Selesai';
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#8a6d1c] dark:text-[#d4b07a] tracking-widest uppercase">Arsip & Jejak Literasi</span>
          </div>
          <h1 className="text-4xl font-black font-serif text-[#2a160b] dark:text-[#f6eadc] mb-2">Riwayat Bacaan</h1>
          <p className="text-[#5a3a22] dark:text-[#d9c6b2] text-sm md:text-base max-w-xl">Pantau progres baca, waktu membaca, dan buku yang telah kamu selesaikan.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f4f0e6] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2]">Tersimpan lokal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f7f1e7] dark:bg-[#211b17] rounded-2xl p-6 border border-[#eadfcd] dark:border-[#3a2e27]">
          <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-[#5a3a22] dark:text-[#d9c6b2]">Waktu Baca</h3><Clock className="w-5 h-5 text-[#8a6d1c] dark:text-[#d4b07a]" /></div>
          <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stats.hours}</span><span className="text-lg font-medium text-[#5a3a22] dark:text-[#d9c6b2]">Jam</span></div>
          <p className="text-xs text-[#8a6d1c] dark:text-[#d4b07a] font-bold mt-1">Estimasi dari progres</p>
        </div>
        <div className="bg-[#f7f1e7] dark:bg-[#211b17] rounded-2xl p-6 border border-[#eadfcd] dark:border-[#3a2e27]">
          <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-[#5a3a22] dark:text-[#d9c6b2]">Buku Selesai</h3><CheckCircle className="w-5 h-5 text-[#8a6d1c] dark:text-[#d4b07a]" /></div>
          <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stats.done}</span><span className="text-lg font-medium text-[#5a3a22] dark:text-[#d9c6b2]">Buku</span></div>
          <p className="text-xs text-[#5a3a22] dark:text-[#d9c6b2] font-medium mt-1">Dari riwayat tersimpan</p>
        </div>
        <div className="bg-[#f7f1e7] dark:bg-[#211b17] rounded-2xl p-6 border border-[#eadfcd] dark:border-[#3a2e27]">
          <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-[#5a3a22] dark:text-[#d9c6b2]">Halaman Dibaca</h3><BookOpen className="w-5 h-5 text-[#8a6d1c] dark:text-[#d4b07a]" /></div>
          <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stats.pages}</span><span className="text-lg font-medium text-[#5a3a22] dark:text-[#d9c6b2]">Hal</span></div>
          <p className="text-xs text-[#5a3a22] dark:text-[#d9c6b2] font-medium mt-1">{stats.reading} buku sedang dibaca</p>
        </div>
        <div className="bg-[#f7f1e7] dark:bg-[#211b17] rounded-2xl p-6 border border-[#eadfcd] dark:border-[#3a2e27]">
          <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-[#5a3a22] dark:text-[#d9c6b2]">Streak Harian</h3><Flame className="w-5 h-5 text-orange-500" /></div>
          <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stats.streak}</span><span className="text-lg font-medium text-[#5a3a22] dark:text-[#d9c6b2]">Hari</span></div>
          <p className="text-xs text-[#8a6d1c] dark:text-[#d4b07a] font-bold mt-1">Semangat membaca!</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-[#eadfcd] dark:border-[#3a2e27]">
        <div className="relative w-full max-w-2xl">
          <input type="text" placeholder="Cari judul atau penulis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#f7f1e7] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] rounded-2xl text-[#2a160b] dark:text-[#f3e9dc] placeholder-[#a49373] dark:placeholder-[#8f7a62] focus:outline-none focus:ring-2 focus:ring-[#d4c3a3] dark:focus:ring-[#5b4636] text-sm font-medium" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a49373] dark:text-[#8f7a62]" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[{id:'all',label:`Semua (${history.length})`},{id:'reading',label:`Sedang Dibaca (${stats.reading})`},{id:'done',label:`Selesai (${stats.done})`}].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${filter===f.id ? 'bg-[#e8d6b8] dark:bg-[#5a422e] text-[#2a160b] dark:text-[#f6eadc] border-[#e0caa6] dark:border-[#6d5238]' : 'bg-transparent text-[#5a3a22] dark:text-[#d9c6b2] border-transparent hover:bg-[#f7f1e7] dark:hover:bg-[#26201c]'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-[#2a160b] dark:text-[#f6eadc]" />
          <h2 className="text-xl font-bold font-serif text-[#2a160b] dark:text-[#f6eadc]">Daftar Riwayat</h2>
          <span className="text-xs font-medium text-[#8a6d1c] dark:text-[#d4b07a] ml-auto">{filtered.length} item</span>
        </div>
        {filtered.length === 0 ? (
          <div className="bg-[#f7f1e7] dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-2xl p-8 text-center text-[#5a3a22] dark:text-[#d9c6b2]">
            Belum ada riwayat bacaan yang cocok.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="bg-white dark:bg-[#211b17] rounded-2xl border border-[#eadfcd] dark:border-[#3a2e27] p-4 flex gap-4 shadow-sm">
                <img src={resolveBookCover(item)} onError={handleBookCoverError} alt={item.bookTitle} className="w-20 h-28 object-cover rounded-lg border border-[#eadfcd] dark:border-[#3a2e27]" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#2a160b] dark:text-[#f6eadc] truncate">{item.bookTitle}</h3>
                  <p className="text-sm text-[#5a3a22] dark:text-[#d9c6b2] truncate">{item.author}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1 text-[#6b4a2d] dark:text-[#cdb89f]"><span>{item.progress}%</span><span>{item.currentPage}/{item.totalPages} hal</span></div>
                    <div className="w-full h-2 bg-[#f1e6d6] dark:bg-[#332823] rounded-full overflow-hidden"><div className="h-full bg-[#8b5e34] dark:bg-[#caa06b] rounded-full" style={{ width: `${Math.max(0, Math.min(100, item.progress || 0))}%` }} /></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : item.status === 'Sedang Dibaca' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>{item.status}</span>
                    <button onClick={() => item.bookId && navigate(`/siswa/buku/${item.bookId}`)} className="text-xs font-semibold text-[#8b5e34] dark:text-[#d4b07a] hover:underline">Lihat Buku</button>
                  </div>
                  <p className="text-[11px] text-[#8a6d1c] dark:text-[#a78967] mt-2">Terakhir dibaca: {formatDateSafe(item.lastRead)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatSiswa;
