import { useState, useEffect } from 'react';
import type { HistoryItem } from '../lib/mockData';
import { History as HistoryIcon, BookOpen } from 'lucide-react';
import { handleBookCoverError, resolveBookCover } from '../lib/bookCover';
import { useLanguage } from '../lib/language';
import { api } from '../lib/api';

function formatDateSafe(value: string, lang: 'id' | 'en') {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || '-';
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get<HistoryItem[]>('/api/history');
        if (mounted) setHistory(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const statusLabel = (status: string) => {
    if (status === 'Selesai') return t('admin.status.done');
    if (status === 'Sedang Dibaca') return t('admin.status.reading');
    return status;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#183126] dark:text-[#edf7f1]">{t('admin.history.title')}</h1>
          <p className="text-[#567564] dark:text-[#9ec0ad]">{t('admin.history.desc')}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#567564] dark:text-[#9ec0ad]">Memuat...</div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center text-[#567564] dark:text-[#9ec0ad] flex flex-col items-center">
          <HistoryIcon className="w-12 h-12 text-[#cfe0d4] dark:text-[#355244] mb-3" />
          <p>{t('admin.activity.empty')}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map(item => (
          <div key={item.id} className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 flex gap-4">
              <img src={resolveBookCover(item)} onError={handleBookCoverError} alt={item.bookTitle} className="w-20 h-28 object-cover rounded-md shadow-sm border border-[#d7e3da] dark:border-[#2a3d34]" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#183126] dark:text-[#edf7f1] truncate">{item.bookTitle}</h3>
                <p className="text-sm text-[#567564] dark:text-[#9ec0ad] truncate">{item.author}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#567564] dark:text-[#9ec0ad]">{item.progress}%</span>
                    <span className="text-[#567564] dark:text-[#9ec0ad]">{item.currentPage} / {item.totalPages} {t('admin.history.pageUnit')}</span>
                  </div>
                  <div className="w-full bg-[#dfeee5] dark:bg-[#22352d] rounded-full h-1.5">
                    <div className="bg-[#2f7a55] h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#567564] dark:text-[#9ec0ad]">
                  <HistoryIcon className="w-3.5 h-3.5" />
                  {t('admin.history.last')} {formatDateSafe(item.lastRead, lang)}
                </div>
              </div>
            </div>
            <div className="bg-[#edf4ef] dark:bg-[#1b2923] px-5 py-3 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                item.status === 'Sedang Dibaca' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {statusLabel(item.status)}
              </span>
              <button onClick={() => setSelectedHistory(item)} className="text-[#2f5b43] dark:text-[#cfead9] hover:underline text-sm font-medium flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {t('admin.history.detail')}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {selectedHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform scale-100 transition-all border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-5 border-b border-[#d7e3da] dark:border-[#2a3d34] flex items-center justify-between bg-[#edf4ef] dark:bg-[#1b2923]">
              <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#567564] dark:text-[#9ec0ad]" />
                {t('admin.history.modalTitle')}
              </h3>
              <button onClick={() => setSelectedHistory(null)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-full transition-colors" title={t('admin.common.close')}>
                <span className="sr-only">{t('admin.common.close')}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-5 mb-6">
                <img src={resolveBookCover(selectedHistory)} onError={handleBookCoverError} alt={selectedHistory.bookTitle} className="w-24 h-36 object-cover rounded-lg shadow-sm border border-[#d7e3da] dark:border-[#2a3d34]" />
                <div>
                  <h4 className="text-xl font-bold text-[#183126] dark:text-[#edf7f1] leading-tight mb-1">{selectedHistory.bookTitle}</h4>
                  <p className="text-[#567564] dark:text-[#9ec0ad] mb-3">{selectedHistory.author}</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    selectedHistory.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    selectedHistory.status === 'Sedang Dibaca' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {statusLabel(selectedHistory.status)}
                  </span>
                </div>
              </div>
              <div className="bg-[#edf4ef] dark:bg-[#1b2923] p-4 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#355243] dark:text-[#dcebe2] font-medium">{t('admin.history.progress')}</span>
                    <span className="font-bold text-[#2f5b43] dark:text-[#cfead9]">{selectedHistory.progress}%</span>
                  </div>
                  <div className="w-full bg-[#dfeee5] dark:bg-[#22352d] rounded-full h-2">
                    <div className="bg-[#2f7a55] h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, selectedHistory.progress))}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1">{t('admin.history.currentPage')}</p>
                    <p className="font-bold text-[#183126] dark:text-[#edf7f1]">{selectedHistory.currentPage} <span className="text-[#567564] dark:text-[#9ec0ad] font-normal">/ {selectedHistory.totalPages}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1">{t('admin.history.lastActivity')}</p>
                    <p className="font-bold text-[#183126] dark:text-[#edf7f1] flex items-center gap-1.5 text-sm">
                      <HistoryIcon className="w-3.5 h-3.5 text-[#567564] dark:text-[#9ec0ad]" /> {formatDateSafe(selectedHistory.lastRead, lang)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923] flex justify-end">
              <button onClick={() => setSelectedHistory(null)} className="px-5 py-2.5 bg-[#163126] text-[#f4fbf7] font-medium hover:bg-[#204437] rounded-xl transition-colors w-full sm:w-auto">{t('admin.history.closeDetail')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default History;
