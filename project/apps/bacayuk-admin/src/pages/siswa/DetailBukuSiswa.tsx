import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Clock, Info, MessageSquare, Star } from 'lucide-react';
import type { Book } from '../../lib/mockData';
import { api } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';
import { useLanguage } from '../../lib/language';
import { getStudentSession } from '../../lib/session';
import { addNotification } from '../../lib/notifications';

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

const DetailBukuSiswa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const student = getStudentSession();
  const studentId = student?.id;

  const reviewDate = (r: Review) => r.date || r.createdAt || '';

  const loadReviews = async (bookId: string) => {
    try {
      const data = await api.get<Review[]>(`/api/reviews?bookId=${encodeURIComponent(bookId)}`);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(reviewDate(b)).getTime() - new Date(reviewDate(a)).getTime());
      setReviews(list);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const name = student?.name || student?.username || 'Siswa';
    setReviewName(name);
    (async () => {
      try {
        const [bookData, favData] = await Promise.all([
          api.get<Book>(`/api/books/${id}`),
          studentId ? api.get<string[]>(`/api/favorites?studentId=${encodeURIComponent(studentId)}`).catch(() => []) : Promise.resolve([]),
        ]);
        if (!mounted) return;
        setBook(bookData || null);
        const favs = Array.isArray(favData) ? favData : [];
        setIsFavorite(favs.includes(id));
        await loadReviews(id);
      } catch {
        if (mounted) setBook(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, studentId]);

  const toggleFavorite = async () => {
    if (!id || !studentId) return;
    try {
      const res = await api.post<{ isFavorite: boolean }>('/api/favorites/toggle', { studentId, bookId: id });
      setIsFavorite(!!res?.isFavorite);
    } catch {
      // ignore
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const text = reviewText.trim();
    const name = reviewName.trim() || 'Siswa';
    if (!text) return;
    setSubmitting(true);
    try {
      await api.post('/api/reviews', { bookId: id, studentId: studentId || null, name, rating: reviewRating, text });
      setReviewText('');
      await loadReviews(id);
      // refresh book for updated avg rating
      try {
        const updatedBook = await api.get<Book>(`/api/books/${id}`);
        if (updatedBook) setBook(updatedBook);
      } catch {}
      void addNotification({
        title: 'Ulasan baru',
        message: `${name} memberi ulasan untuk "${book?.title || 'buku'}" (${reviewRating}/5).`,
        type: 'book',
        audience: 'admin',
      });
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">Memuat...</div>;
  }

  if (!book) {
    return <div className="p-10 text-center text-[#6b4a2d] dark:text-[#d9c6b2]">{t('siswa.detail.notFound')}</div>;
  }

  const synopsis = book.description && String(book.description).trim()
    ? String(book.description).trim()
    : `${book.title} — ${book.author} (${book.year}). ${t('siswa.detail.synopsisFallback')}`;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#5a3a22] dark:text-[#d9c6b2] hover:text-[#8a6d1c] dark:hover:text-[#e4d2bb] font-medium mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> {t('siswa.detail.back')}
      </button>

      <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 sm:p-10 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-[#eadfcd] dark:border-[#3a2e27] relative group">
            <img src={resolveBookCover(book)} alt={book.title} onError={handleBookCoverError} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => navigate(`/siswa/baca/${book.id}`)} className="w-full flex items-center justify-center gap-2 bg-[#8b5e34] hover:bg-[#734c2a] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#8b5e34]/20 transition-all active:scale-[0.98]"><BookOpen className="w-5 h-5" /> {t('siswa.detail.readNow')}</button>
            <button onClick={() => void toggleFavorite()} className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl border transition-all active:scale-[0.98] ${isFavorite ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50' : 'bg-[#f7f1e7] dark:bg-[#26201c] border-[#eadfcd] dark:border-[#3a2e27] text-[#5a3a22] dark:text-[#d9c6b2] hover:bg-[#f1e6d6] dark:hover:bg-[#2f2722]'}`}>
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} /> {isFavorite ? t('siswa.detail.saved') : t('siswa.detail.save')}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] border border-[#eadfcd] dark:border-[#3a2e27] mb-4">{book.category}</div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#3a2012] dark:text-[#f6eadc] mb-3 leading-tight">{book.title}</h1>
          <p className="text-lg text-[#5a3a22] dark:text-[#d9c6b2] font-medium mb-6">{book.author}</p>

          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-[#eadfcd] dark:border-[#3a2e27]">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#2a160b] dark:text-[#f6eadc] text-lg">{Number(book.rating || 0).toFixed(1)}</span>
              <span className="text-[#6b4a2d] dark:text-[#d9c6b2] text-sm">({reviews.length} {t('siswa.detail.reviewsCount')})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5a3a22] dark:text-[#d9c6b2]"><Clock className="w-5 h-5" /><span className="font-medium">{t('siswa.detail.readTime')}</span></div>
            <div className="flex items-center gap-1.5 text-[#5a3a22] dark:text-[#d9c6b2]"><MessageSquare className="w-5 h-5" /><span className="font-medium">{(book.readers || 0).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')} {t('siswa.detail.readers')}</span></div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] flex items-center gap-2 mb-3"><Info className="w-5 h-5 text-[#8a6d1c] dark:text-[#d4b07a]" /> {t('siswa.detail.synopsis')}</h3>
              <p className="text-[#5a3a22] dark:text-[#d9c6b2] leading-relaxed whitespace-pre-line">{synopsis}</p>
            </div>

            <div className="bg-[#f7f1e7] dark:bg-[#26201c] rounded-2xl p-5 border border-[#eadfcd] dark:border-[#3a2e27]">
              <h4 className="font-bold text-[#2a160b] dark:text-[#f6eadc] mb-3 text-sm">{t('siswa.detail.info')}</h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div><p className="text-[#6b4a2d] dark:text-[#d9c6b2] mb-0.5">{t('siswa.detail.publisher')}</p><p className="font-medium text-[#2a160b] dark:text-[#f6eadc]">{book.publisher || '-'}</p></div>
                <div><p className="text-[#6b4a2d] dark:text-[#d9c6b2] mb-0.5">{t('siswa.detail.year')}</p><p className="font-medium text-[#2a160b] dark:text-[#f6eadc]">{book.year}</p></div>
                <div><p className="text-[#6b4a2d] dark:text-[#d9c6b2] mb-0.5">ISBN</p><p className="font-medium text-[#2a160b] dark:text-[#f6eadc]">{book.isbn || '-'}</p></div>
                <div><p className="text-[#6b4a2d] dark:text-[#d9c6b2] mb-0.5">{t('siswa.detail.added')}</p><p className="font-medium text-[#2a160b] dark:text-[#f6eadc]">{book.dateAdded ? new Date(book.dateAdded).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium' }) : '-'}</p></div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#211b17] rounded-2xl p-5 border border-[#eadfcd] dark:border-[#3a2e27]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#2a160b] dark:text-[#f6eadc] text-lg">{t('siswa.detail.reviewsTitle')}</h4>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb]">{reviews.length} {t('siswa.detail.reviewsCount')}</span>
              </div>

              <form onSubmit={submitReview} className="mb-5 p-4 rounded-xl bg-[#f7f1e7] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2] mb-1">{t('siswa.detail.nameLabel')}</label>
                    <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#eadfcd] dark:border-[#3a2e27] bg-white dark:bg-[#211b17] text-sm text-[#2a160b] dark:text-[#f3e9dc] outline-none focus:ring-2 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40" placeholder={t('siswa.detail.namePlaceholder')} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2] mb-1">{t('siswa.detail.ratingLabel')}</label>
                    <div className="flex items-center gap-1 py-1.5">
                      {[1,2,3,4,5].map((n) => (
                        <button type="button" key={n} onClick={() => setReviewRating(n)} className="p-0.5" title={`${n}`}>
                          <Star className={`w-6 h-6 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-[#d8c3a6] dark:text-[#4a3a31]'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5a3a22] dark:text-[#d9c6b2] mb-1">{t('siswa.detail.commentLabel')}</label>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-[#eadfcd] dark:border-[#3a2e27] bg-white dark:bg-[#211b17] text-sm text-[#2a160b] dark:text-[#f3e9dc] outline-none focus:ring-2 focus:ring-[#d4c3a3]/30 dark:focus:ring-[#5b4636]/40" placeholder={t('siswa.detail.commentPlaceholder')} />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-[#8b5e34] text-white text-sm font-bold hover:bg-[#734c2a] transition-colors disabled:opacity-70">{t('siswa.detail.submitReview')}</button>
                </div>
              </form>

              {reviews.length === 0 ? (
                <div className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2] py-4 text-center border border-dashed border-[#eadfcd] dark:border-[#3a2e27] rounded-xl">{t('siswa.detail.noReviews')}</div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-[#eadfcd] dark:border-[#3a2e27] bg-[#fffdf9] dark:bg-[#26201c]">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div>
                          <p className="font-bold text-[#2a160b] dark:text-[#f6eadc] text-sm">{r.name}</p>
                          <p className="text-[11px] text-[#9a7a55] dark:text-[#a78967]">{reviewDate(r) ? new Date(reviewDate(r)).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</p>
                        </div>
                        <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e6d6bf] dark:text-[#4a3a31]'}`} />)}</div>
                      </div>
                      <p className="text-sm text-[#5a3a22] dark:text-[#d9c6b2] leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBukuSiswa;
