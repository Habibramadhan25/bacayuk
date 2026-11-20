import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, HeartCrack, Search, Star } from 'lucide-react';
import type { Book } from '../../lib/mockData';
import { api } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';
import { useLanguage } from '../../lib/language';
import { getStudentSession } from '../../lib/session';

const FavoritSiswa = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const studentId = getStudentSession()?.id;

  const load = async () => {
    if (!studentId) { setLoading(false); return; }
    try {
      const [favIds, allBooks] = await Promise.all([
        api.get<string[]>(`/api/favorites?studentId=${encodeURIComponent(studentId)}`),
        api.get<Book[]>('/api/books'),
      ]);
      const safeFavs = Array.isArray(favIds) ? favIds : [];
      const safeBooks = Array.isArray(allBooks) ? allBooks : [];
      setFavorites(safeFavs);
      setBooks(safeBooks.filter(b => safeFavs.includes(b.id)));
    } catch {
      setFavorites([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [studentId]);

  const toggleFavorite = async (bookId: string) => {
    if (!studentId) return;
    try {
      await api.post('/api/favorites/toggle', { studentId, bookId });
      setFavorites(prev => prev.filter(id => id !== bookId));
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch {
      // ignore
    }
  };

  const filteredBooks = books.filter(book =>
    (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-serif text-[#3a2012] dark:text-[#f6eadc] flex items-center gap-3"><Bookmark className="w-8 h-8 text-[#8a6d1c] dark:text-[#d4b07a]" /> {t('fav.title')}</h1>
          <p className="text-[#5a3a22] dark:text-[#d9c6b2] mt-2">{t('fav.desc')}</p>
        </div>
        {favorites.length > 0 && (
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6d1c] dark:text-[#d4b07a]" />
            <input type="text" placeholder={t('fav.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#211b17] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl text-sm focus:ring-2 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40 focus:border-[#8a6d1c] dark:focus:border-[#d4b07a] outline-none transition-all placeholder:text-[#9a7a55] dark:placeholder:text-[#a78967] text-[#2a160b] dark:text-[#f3e9dc]" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">Memuat...</div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="group flex flex-col bg-white dark:bg-[#211b17] rounded-2xl p-3 border border-[#eadfcd] dark:border-[#3a2e27] hover:border-rose-200 dark:hover:border-rose-900/60 hover:shadow-lg transition-all relative">
              <button onClick={() => void toggleFavorite(book.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-[#26201c] border border-rose-100 dark:border-rose-900/60 text-rose-500 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" title={t('fav.removeTitle')}><HeartCrack className="w-4 h-4" /></button>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-sm cursor-pointer border border-[#eadfcd] dark:border-[#3a2e27]" onClick={() => navigate(`/siswa/buku/${book.id}`)}>
                <img src={resolveBookCover(book)} alt={book.title} onError={handleBookCoverError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 onClick={() => navigate(`/siswa/buku/${book.id}`)} className="font-bold text-[#2a160b] dark:text-[#f6eadc] line-clamp-2 leading-snug mb-1 cursor-pointer hover:text-[#8a6d1c] dark:hover:text-[#e4d2bb] transition-colors">{book.title}</h3>
              <p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] line-clamp-1 mb-3">{book.author}</p>
              <button onClick={() => navigate(`/siswa/buku/${book.id}`)} className="mt-auto w-full py-2 bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] font-bold text-xs rounded-lg hover:bg-[#8b5e34] hover:text-white dark:hover:bg-[#4a3a31] transition-colors flex items-center justify-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {t('fav.readNow')}</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#211b17] rounded-3xl p-12 text-center border border-dashed border-[#d8c3a6] dark:border-[#4a3a31] shadow-sm">
          <div className="w-20 h-20 bg-[#f7f1e7] dark:bg-[#26201c] rounded-full flex items-center justify-center mx-auto mb-4"><HeartCrack className="w-10 h-10 text-[#c9a97d] dark:text-[#8a6d1c]" /></div>
          <h3 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc] mb-2">{t('fav.emptyTitle')}</h3>
          <p className="text-[#6b4a2d] dark:text-[#d9c6b2] max-w-sm mx-auto mb-6">{t('fav.emptyDesc')}</p>
          <button onClick={() => navigate('/siswa/katalog')} className="inline-flex items-center justify-center px-6 py-2.5 bg-[#8b5e34] text-white font-bold rounded-xl hover:bg-[#734c2a] transition-colors">{t('fav.browse')}</button>
        </div>
      )}
    </div>
  );
};

export default FavoritSiswa;
