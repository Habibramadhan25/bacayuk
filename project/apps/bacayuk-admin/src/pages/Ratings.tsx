import { useState, useEffect } from 'react';
import type { Book } from '../lib/mockData';
import { Star, MessageSquare, Search } from 'lucide-react';
import { handleBookCoverError, resolveBookCover } from '../lib/bookCover';
import { useLanguage } from '../lib/language';
import { api } from '../lib/api';

type Review = {
  id: string;
  bookId: string;
  studentId?: string | null;
  name: string;
  rating: number;
  text: string;
  date?: string;
  createdAt?: string;
};

const Ratings = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [booksData, reviewsData] = await Promise.all([
          api.get<Book[]>('/api/books'),
          api.get<Review[]>('/api/reviews').catch(() => []),
        ]);
        if (!mounted) return;
        setBooks(Array.isArray(booksData) ? booksData : []);
        setAllReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch {
        if (mounted) { setBooks([]); setAllReviews([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openBookReviews = async (book: Book) => {
    setSelectedBook(book);
    setLoadingReviews(true);
    try {
      const data = await api.get<Review[]>(`/api/reviews?bookId=${encodeURIComponent(book.id)}`);
      const list = Array.isArray(data) ? data : [];
      // merge/replace reviews for this book in cache
      setAllReviews((prev) => {
        const others = prev.filter((r) => r.bookId !== book.id);
        return [...others, ...list];
      });
    } catch {
      // keep cached
    } finally {
      setLoadingReviews(false);
    }
  };

  const filtered = books.filter(b => (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const renderStars = (rating: number) => Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < Math.round(rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-[#dfeee5] text-[#dfeee5] dark:fill-[#355244] dark:text-[#355244]'}`} />
  ));

  const reviewDate = (r: Review) => r.date || r.createdAt || '';
  const reviewsForSelected = selectedBook
    ? allReviews.filter(r => r.bookId === selectedBook.id).sort((a,b)=> new Date(reviewDate(b)).getTime()-new Date(reviewDate(a)).getTime())
    : [];

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">{t('admin.ratings.title')}</h1>
        <p className="text-[#567564] dark:text-[#9ec0ad]">{t('admin.ratings.desc')}</p>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
            <input
              type="text"
              placeholder={t('admin.ratings.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl text-sm bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#edf4ef] dark:bg-[#1b2923] border-b border-[#d7e3da] dark:border-[#2a3d34] text-[#567564] dark:text-[#9ec0ad] text-sm">
                <th className="p-4 font-medium w-96">{t('admin.ratings.col.book')}</th>
                <th className="p-4 font-medium">{t('admin.ratings.col.avg')}</th>
                <th className="p-4 font-medium">{t('admin.ratings.col.reviews')}</th>
                <th className="p-4 font-medium text-right">{t('admin.ratings.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e3da] dark:divide-[#2a3d34]">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-[#567564] dark:text-[#9ec0ad]">Memuat...</td></tr>
              ) : filtered.map(book => {
                const count = allReviews.filter(r => r.bookId === book.id).length;
                return (
                  <tr key={book.id} className="hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <img src={resolveBookCover(book)} alt={book.title} onError={handleBookCoverError} className="w-20 h-28 object-cover rounded-md shadow-sm border border-[#d7e3da] dark:border-[#2a3d34]" />
                      <div>
                        <div className="font-semibold text-[#183126] dark:text-[#edf7f1]">{book.title}</div>
                        <div className="text-xs text-[#567564] dark:text-[#9ec0ad] mt-1">{book.author}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(book.rating || 0)}</div>
                        <span className="font-bold text-[#183126] dark:text-[#edf7f1]">{Number(book.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[#355243] dark:text-[#dcebe2]">
                      <span className="bg-[#e7f1ea] dark:bg-[#22352d] px-3 py-1 rounded-full text-xs font-medium text-[#355243] dark:text-[#cfead9] border border-[#cfe0d4] dark:border-[#355244]">
                        {count} {t('admin.ratings.reviewsCount')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => void openBookReviews(book)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg text-sm font-medium text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] transition-colors">
                        <MessageSquare className="w-4 h-4" /> {t('admin.ratings.viewReviews')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <Star className="w-12 h-12 text-[#cfe0d4] dark:text-[#355244] mb-3" />
              <p className="text-[#567564] dark:text-[#9ec0ad] font-medium">{t('admin.ratings.empty')}</p>
            </div>
          )}
        </div>
      </div>

      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-5 border-b border-[#d7e3da] dark:border-[#2a3d34] flex items-center justify-between bg-[#edf4ef] dark:bg-[#1b2923]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e7f1ea] dark:bg-[#22352d] rounded-full flex items-center justify-center text-[#2f5b43] dark:text-[#cfead9]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] leading-tight">{t('admin.ratings.modalTitle')}</h3>
                  <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">{selectedBook.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-full transition-colors">
                <span className="sr-only">{t('admin.common.close')}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingReviews ? (
                <div className="flex items-center justify-center py-12 text-[#567564] dark:text-[#9ec0ad]">Memuat...</div>
              ) : reviewsForSelected.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-[#567564] dark:text-[#9ec0ad] flex-col text-center">
                  <MessageSquare className="w-12 h-12 mb-3 text-[#cfe0d4] dark:text-[#355244]" />
                  <p>{t('admin.ratings.noReviews')}</p>
                  <p className="text-sm mt-1">{t('admin.ratings.avgRating')} <strong className="text-[#2f5b43] dark:text-[#cfead9]">{Number(selectedBook.rating || 0).toFixed(1)}</strong>.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsForSelected.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] bg-white dark:bg-[#182621]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-[#183126] dark:text-[#edf7f1]">{r.name}</p>
                          <p className="text-xs text-[#567564] dark:text-[#9ec0ad]">{reviewDate(r) ? new Date(reviewDate(r)).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID') : '-'}</p>
                        </div>
                        <div className="flex">{Array.from({length:5}).map((_,i)=>(<Star key={i} className={`w-4 h-4 ${i<r.rating?'fill-amber-400 text-amber-400':'fill-[#dfeee5] text-[#dfeee5] dark:fill-[#355244] dark:text-[#355244]'}`} />))}</div>
                      </div>
                      <p className="text-sm text-[#355243] dark:text-[#dcebe2]">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923] text-right">
              <button onClick={() => setSelectedBook(null)} className="px-5 py-2 bg-[#163126] text-[#f4fbf7] font-medium hover:bg-[#204437] rounded-xl transition-colors">{t('admin.ratings.closeWindow')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Ratings;
