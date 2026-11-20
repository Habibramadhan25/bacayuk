import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import type { Book } from '../../lib/mockData';
import { api } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';
import { useLanguage } from '../../lib/language';

const DashboardSiswa = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get<Book[]>('/api/books?status=Published');
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        setRecommendedBooks(list.slice(-5).reverse());
      } catch {
        if (mounted) setRecommendedBooks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = recommendedBooks.filter((b) =>
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto text-[#2a160b] dark:text-[#f3e9dc]">
      <div>
        <h1 className="text-3xl font-black font-serif text-[#3a2012] dark:text-[#f6eadc] mb-2">{t('siswa.home.greeting')}</h1>
        <p className="text-[#5a3a22] dark:text-[#d9c6b2] text-lg">{t('siswa.home.subtitle')}</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6d1c] dark:text-[#d4b07a]" />
        <input
          type="text"
          placeholder={t('siswa.home.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-2xl focus:ring-4 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40 focus:border-[#8a6d1c] dark:focus:border-[#d4b07a] outline-none transition-all shadow-sm text-[#2a160b] dark:text-[#f3e9dc] placeholder:text-[#9a7a55] dark:placeholder:text-[#a78967] font-medium"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc]">{t('siswa.home.recommended')}</h2>
          <button onClick={() => navigate('/siswa/katalog')} className="text-sm font-bold text-[#8a6d1c] dark:text-[#d4b07a] hover:underline">
            {t('siswa.home.viewAll')}
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">Memuat...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filtered.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/siswa/buku/${book.id}`)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 border border-[#eadfcd] dark:border-[#3a2e27] bg-[#f3e7d3] dark:bg-[#26201c]">
                  <img src={resolveBookCover(book)} alt={book.title} onError={handleBookCoverError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="w-full flex items-center justify-center bg-white/90 text-[#3a2012] text-xs font-bold py-2 rounded-lg backdrop-blur-sm shadow-sm">{t('siswa.home.viewDetail')}</span>
                  </div>
                </div>
                <h3 className="font-bold text-[#2a160b] dark:text-[#f6eadc] line-clamp-2 leading-tight mb-1 group-hover:text-[#8a6d1c] dark:group-hover:text-[#e4d2bb] transition-colors">{book.title}</h3>
                <p className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2] line-clamp-1 mb-1">{book.author}</p>
                <div className="flex items-center gap-1 mt-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2]">{Number(book.rating || 0).toFixed(1)}</span>
                  <span className="text-xs text-[#9a7a55] dark:text-[#a78967] ml-1">• {book.category}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#6b4a2d] dark:text-[#d9c6b2] bg-[#f7f1e7] dark:bg-[#211b17] rounded-2xl border border-dashed border-[#d8c3a6] dark:border-[#4a3a31]">
                {t('siswa.home.empty')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSiswa;
