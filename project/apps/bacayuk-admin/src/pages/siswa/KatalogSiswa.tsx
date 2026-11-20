import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Heart } from 'lucide-react';
import type { Book } from '../../lib/mockData';
import { api } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';
import { useLanguage } from '../../lib/language';
import { getStudentSession } from '../../lib/session';

const KatalogSiswa = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const studentId = getStudentSession()?.id;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const booksPromise = api.get<Book[]>('/api/books?status=Published');
        const favPromise = studentId ? api.get<string[]>(`/api/favorites?studentId=${encodeURIComponent(studentId)}`).catch(() => []) : Promise.resolve([]);
        const [booksData, favData] = await Promise.all([booksPromise, favPromise]);
        if (!mounted) return;
        setBooks(Array.isArray(booksData) ? booksData : []);
        setFavorites(Array.isArray(favData) ? favData : []);
      } catch {
        if (mounted) { setBooks([]); setFavorites([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [studentId]);

  const toggleFavorite = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (!studentId) return;
    try {
      const res = await api.post<{ isFavorite: boolean }>('/api/favorites/toggle', { studentId, bookId });
      const isFav = !!res?.isFavorite;
      setFavorites((prev) => isFav ? (prev.includes(bookId) ? prev : [...prev, bookId]) : prev.filter((id) => id !== bookId));
    } catch {
      // ignore
    }
  };

  const categories = [t('siswa.catalog.all'), ...Array.from(new Set(books.map(b => b.category).filter(Boolean)))];
  const filteredBooks = books.filter(book => {
    const matchesSearch = (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (book.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isAll = selectedCategory === t('siswa.catalog.all') || selectedCategory === 'Semua';
    const matchesCategory = isAll || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27]">
        <h1 className="text-3xl font-black font-serif text-[#3a2012] dark:text-[#f6eadc] mb-2">{t('siswa.catalog.title')}</h1>
        <p className="text-[#5a3a22] dark:text-[#d9c6b2] mb-6">{t('siswa.catalog.desc')}</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8a6d1c] dark:text-[#d4b07a]" />
            <input type="text" placeholder={t('siswa.catalog.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-[#f7f1e7] dark:bg-[#26201c] border border-transparent rounded-xl focus:bg-white dark:focus:bg-[#211b17] focus:ring-4 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40 focus:border-[#8a6d1c] dark:focus:border-[#d4b07a] outline-none transition-all placeholder:text-[#9a7a55] dark:placeholder:text-[#a78967] font-medium text-[#2a160b] dark:text-[#f3e9dc]" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-[#8b5e34] text-white border-[#8b5e34] shadow-sm' : 'bg-white dark:bg-[#26201c] text-[#5a3a22] dark:text-[#d9c6b2] border-[#eadfcd] dark:border-[#3a2e27] hover:border-[#d4c3a3] dark:hover:border-[#5b4636] hover:bg-[#fdf8f1] dark:hover:bg-[#2f2722]'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc]">{t('siswa.catalog.listTitle')}</h2>
          <span className="text-sm font-medium text-[#6b4a2d] dark:text-[#d9c6b2] bg-[#f3e7d3] dark:bg-[#332823] px-3 py-1 rounded-full">{filteredBooks.length} {t('siswa.catalog.booksUnit')}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">Memuat...</div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} onClick={() => navigate(`/siswa/buku/${book.id}`)} className="group cursor-pointer flex flex-col bg-[#f7f1e7] dark:bg-[#26201c] rounded-2xl p-3 border border-[#eadfcd] dark:border-[#3a2e27] hover:border-[#d4c3a3] dark:hover:border-[#5b4636] hover:shadow-md transition-all">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27]">
                  <img src={resolveBookCover(book)} alt={book.title} onError={handleBookCoverError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={(e) => void toggleFavorite(e, book.id)} className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors ${favorites.includes(book.id) ? 'bg-rose-500/90 text-white shadow-sm' : 'bg-black/30 text-white hover:bg-black/50'}`} title={favorites.includes(book.id) ? t('siswa.catalog.removeFav') : t('siswa.catalog.addFav')}>
                    <Heart className={`w-4 h-4 ${favorites.includes(book.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <h3 className="font-bold text-[#2a160b] dark:text-[#f6eadc] line-clamp-2 leading-snug mb-1 group-hover:text-[#8a6d1c] dark:group-hover:text-[#e4d2bb] transition-colors">{book.title}</h3>
                <p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] line-clamp-1 mb-2">{book.author}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2]">{Number(book.rating || 0).toFixed(1)}</span></div>
                  <span className="text-[10px] font-bold text-[#8a6d1c] dark:text-[#d4b07a] bg-[#f3e7d3] dark:bg-[#332823] px-2 py-0.5 rounded-md">{book.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#6b4a2d] dark:text-[#d9c6b2] bg-[#f7f1e7] dark:bg-[#26201c] rounded-2xl border border-dashed border-[#d8c3a6] dark:border-[#4a3a31]">
            <Search className="w-12 h-12 text-[#d4c3a3] dark:text-[#5b4636] mx-auto mb-3" />
            <p className="font-medium">{t('siswa.catalog.notFoundTitle')}</p>
            <p className="text-sm mt-1">{t('siswa.catalog.notFoundDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KatalogSiswa;
