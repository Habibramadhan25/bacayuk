import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Flame, Search, CheckCircle } from 'lucide-react';
import type { HistoryItem } from '../../lib/mockData';
import { api } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';
import { useLanguage } from '../../lib/language';
import { getStudentSession } from '../../lib/session';

function formatDateSafe(value: string, lang: 'id' | 'en') {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || '-';
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const RiwayatSiswa = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'reading' | 'done'>('all');
  const [loading, setLoading] = useState(true);
  const studentId = getStudentSession()?.id;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!studentId) { setLoading(false); return; }
      try {
        const data = await api.get<HistoryItem[]>(`/api/history?studentId=${encodeURIComponent(studentId)}`);
        if (mounted) setHistory(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [studentId]);

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
    const matchFilter = filter === 'all' || (filter === 'done' ? item.status === 'Selesai' : item.status !== 'Selesai');
    return matchSearch && matchFilter;
  });

  const statusLabel = (status: string) => status === 'Selesai' ? t('history.statusDone') : t('history.statusReading');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif text-[#3a2012] dark:text-[#f6eadc] flex items-center gap-3"><Clock className="w-8 h-8 text-[#8a6d1c] dark:text-[#d4b07a]" /> {t('history.title')}</h1>
          <p className="text-[#5a3a22] dark:text-[#d9c6b2] mt-2">{t('history.desc')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl px-4 py-3"><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2]">{t('history.stat.streak')}</p><p className="font-black text-[#8b5e34] dark:text-[#d4b07a] flex items-center gap-1"><Flame className="w-4 h-4" /> {stats.streak} {t('history.daysUnit')}</p></div>
          <div className="bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl px-4 py-3"><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2]">{t('history.stat.finished')}</p><p className="font-black text-emerald-600 dark:text-emerald-400">{stats.done}</p></div>
          <div className="bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl px-4 py-3"><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2]">{t('history.stat.reading')}</p><p className="font-black text-[#8a6d1c] dark:text-[#d4b07a]">{stats.reading}</p></div>
          <div className="bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl px-4 py-3"><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2]">{t('history.stat.time')}</p><p className="font-black text-[#3a2012] dark:text-[#f6eadc]">~{stats.hours} {t('history.hoursUnit')}</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#211b17] p-4 rounded-2xl border border-[#eadfcd] dark:border-[#3a2e27] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6d1c] dark:text-[#d4b07a]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('history.searchPlaceholder')} className="w-full pl-9 pr-3 py-2.5 bg-[#f7f1e7] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40 focus:border-[#8a6d1c] dark:focus:border-[#d4b07a] text-[#2a160b] dark:text-[#f3e9dc] placeholder:text-[#9a7a55] dark:placeholder:text-[#a78967]" />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: t('history.filter.all') },
            { key: 'reading', label: t('history.filter.reading') },
            { key: 'done', label: t('history.filter.done') },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} className={`px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === f.key ? 'bg-[#8b5e34] text-white border-[#8b5e34]' : 'bg-[#f7f1e7] dark:bg-[#26201c] text-[#5a3a22] dark:text-[#d9c6b2] border-[#eadfcd] dark:border-[#3a2e27] hover:border-[#d4c3a3] dark:hover:border-[#5b4636]'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">Memuat...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#211b17] rounded-2xl border border-dashed border-[#d8c3a6] dark:border-[#4a3a31] p-12 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-[#d4c3a3] dark:text-[#5b4636]" />
          <p className="font-medium">{t('history.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('history.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white dark:bg-[#211b17] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] flex flex-col sm:flex-row gap-5">
              <div className="w-24 h-36 sm:w-28 sm:h-40 shrink-0 rounded-xl overflow-hidden shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] cursor-pointer" onClick={() => navigate(`/siswa/buku/${item.bookId}`)}>
                <img src={resolveBookCover(item)} alt={item.bookTitle} onError={handleBookCoverError} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] line-clamp-1">{item.bookTitle}</h3>
                    <p className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2]">{item.author}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-[#f3e7d3] text-[#8b5e34] dark:bg-[#332823] dark:text-[#e4d2bb]'}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="mt-auto space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-[#5a3a22] dark:text-[#d9c6b2]">{item.currentPage} / {item.totalPages} {t('history.pageUnit')}</span>
                      <span className="font-bold text-[#8b5e34] dark:text-[#d4b07a]">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-[#f3e7d3] dark:bg-[#332823] rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${item.status === 'Selesai' ? 'bg-emerald-500' : 'bg-[#8b5e34]'}`} style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('history.lastRead')} {formatDateSafe(item.lastRead, lang)}</span>
                    <button onClick={() => navigate(`/siswa/buku/${item.bookId}`)} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8b5e34] dark:text-[#d4b07a] hover:underline">
                      {item.status === 'Selesai' ? <><CheckCircle className="w-4 h-4" /> {t('history.readAgain')}</> : <><BookOpen className="w-4 h-4" /> {t('history.continue')}</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatSiswa;
