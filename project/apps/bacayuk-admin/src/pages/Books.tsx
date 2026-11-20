import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, BookOpen, X } from 'lucide-react';
import type { Book } from '../lib/mockData';
import { handleBookCoverError, resolveBookCover } from '../lib/bookCover';
import { addNotification } from '../lib/notifications';
import { useLanguage } from '../lib/language';
import { api } from '../lib/api';

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [deleteId, setDeleteId] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalChapters = 12;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadBooks = async () => {
    try {
      const data = await api.get<Book[]>('/api/books');
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBooks(); }, []);

  const executeDelete = async () => {
    if (!deleteId) return;
    const target = books.find(b => b.id === deleteId);
    try {
      await api.delete(`/api/books/${deleteId}`);
      const updatedBooks = books.filter(b => b.id !== deleteId);
      setBooks(updatedBooks);
      if (target) {
        void addNotification({
          title: t('admin.books.notifDeletedTitle'),
          message: `"${target.title}" ${t('admin.books.notifDeletedMsg')}`,
          type: 'book',
          audience: 'admin',
        });
      }
      const maxPageAfterDelete = Math.max(1, Math.ceil(updatedBooks.length / itemsPerPage));
      setCurrentPage(prev => Math.min(prev, maxPageAfterDelete));
    } catch {
      // ignore
    } finally {
      setDeleteId('');
    }
  };

  const filteredBooks = books.filter(book =>
    (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const statusLabel = (status: string) => status === 'Published' ? t('admin.status.published') : t('admin.status.draft');
  const locale = lang === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">{t('admin.page.books.title')}</h1>
          <p className="text-[#567564] dark:text-[#9ec0ad]">{t('admin.page.books.desc')}</p>
        </div>
        <button onClick={() => navigate('/books/add')} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-4 py-2.5 rounded-xl font-semibold hover:bg-[#204437] transition-colors shadow-sm border border-[#244738]">
          <Plus className="w-5 h-5" /> {t('admin.books.addNew')}
        </button>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] flex flex-col md:flex-row gap-4 justify-between bg-[#edf4ef] dark:bg-[#1b2923]">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
            <input type="text" placeholder={t('admin.books.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl text-sm bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:border-[#d4a94e] focus:ring-2 focus:ring-[#d4a94e]/20 outline-none transition-all" />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl text-sm font-medium text-[#355243] dark:text-[#dcebe2] bg-white dark:bg-[#182621] hover:bg-[#edf4ef] dark:hover:bg-[#22352d] transition-colors">
              <Filter className="w-4 h-4" /> {t('admin.common.filter')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#edf4ef] dark:bg-[#1b2923] text-[#567564] dark:text-[#9ec0ad] text-sm border-b border-[#d7e3da] dark:border-[#2a3d34]">
                <th className="p-4 font-medium">{t('admin.books.col.book')}</th>
                <th className="p-4 font-medium">{t('admin.books.col.category')}</th>
                <th className="p-4 font-medium">{t('admin.books.col.status')}</th>
                <th className="p-4 font-medium">{t('admin.books.col.rating')}</th>
                <th className="p-4 font-medium">{t('admin.books.col.readers')}</th>
                <th className="p-4 font-medium text-center">{t('admin.books.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e3da] dark:divide-[#2a3d34] text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-[#567564] dark:text-[#9ec0ad]">Memuat...</td></tr>
              ) : currentBooks.map((book) => (
                <tr key={book.id} className="hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={resolveBookCover(book)} alt={book.title} loading="lazy" onError={handleBookCoverError} className="w-14 h-20 object-cover rounded-md shadow-sm border border-[#d7e3da] dark:border-[#2a3d34]" />
                      <div>
                        <h4 className="font-bold text-[#183126] dark:text-[#edf7f1] group-hover:text-[#2f5b43] dark:group-hover:text-[#cfead9] transition-colors">{book.title}</h4>
                        <p className="text-[#567564] dark:text-[#9ec0ad] mt-0.5">{book.author} • {book.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] border border-[#cfe0d4] dark:border-[#355244]">{book.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${book.status === 'Published' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-100/70 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>{statusLabel(book.status)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 font-bold text-[#183126] dark:text-[#edf7f1]"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{Number(book.rating || 0).toFixed(1)}</div>
                  </td>
                  <td className="p-4 text-[#355243] dark:text-[#dcebe2] font-medium">{(book.readers || 0).toLocaleString(locale)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button title={t('admin.common.view')} onClick={() => setSelectedBook(book)} className="p-1.5 text-[#567564] dark:text-[#9ec0ad] hover:text-[#2f5b43] hover:bg-[#e7f1ea] dark:hover:bg-[#22352d] rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button title={t('admin.common.edit')} onClick={() => navigate(`/books/edit/${book.id}`)} className="p-1.5 text-[#567564] dark:text-[#9ec0ad] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button title={t('admin.common.delete')} onClick={() => setDeleteId(book.id)} className="p-1.5 text-[#567564] dark:text-[#9ec0ad] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && currentBooks.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-[#567564] dark:text-[#9ec0ad]">{t('admin.books.empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] flex items-center justify-between text-sm text-[#355243] dark:text-[#dcebe2] bg-[#edf4ef] dark:bg-[#1b2923]">
          <div>{t('admin.common.showing')} {filteredBooks.length === 0 ? 0 : startIndex + 1} {t('admin.common.to')} {Math.min(startIndex + itemsPerPage, filteredBooks.length)} {t('admin.common.of')} {filteredBooks.length} {t('admin.common.booksUnit')}</div>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-[#d7e3da] dark:border-[#2a3d34] rounded-md hover:bg-[#dfeee5] dark:hover:bg-[#22352d] disabled:opacity-50 font-medium">{t('admin.common.previous')}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded-md font-medium ${currentPage === page ? 'bg-[#163126] border-[#163126] text-[#f4fbf7]' : 'border-[#d7e3da] dark:border-[#2a3d34] hover:bg-[#dfeee5] dark:hover:bg-[#22352d]'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-[#d7e3da] dark:border-[#2a3d34] rounded-md hover:bg-[#dfeee5] dark:hover:bg-[#22352d] disabled:opacity-50 font-medium">{t('admin.common.next')}</button>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Trash2 className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-[#183126] dark:text-[#edf7f1] mb-2">{t('admin.books.deleteTitle')}</h3>
              <p className="text-[#567564] dark:text-[#9ec0ad] text-sm">{t('admin.books.deleteDesc')}</p>
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-center gap-3 bg-[#edf4ef] dark:bg-[#1b2923]">
              <button onClick={() => setDeleteId('')} className="flex-1 py-2.5 text-[#355243] dark:text-[#dcebe2] font-medium hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-xl">{t('admin.common.cancel')}</button>
              <button onClick={() => void executeDelete()} className="flex-1 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl">{t('admin.common.yesDelete')}</button>
            </div>
          </div>
        </div>
      )}

      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-5 border-b border-[#d7e3da] dark:border-[#2a3d34] flex items-center justify-between bg-[#edf4ef] dark:bg-[#1b2923]">
              <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] flex items-center gap-2"><Eye className="w-5 h-5 text-[#567564] dark:text-[#9ec0ad]" />{t('admin.books.detailTitle')}</h3>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <img src={resolveBookCover(selectedBook)} alt={selectedBook.title} onError={handleBookCoverError} className="w-32 h-48 md:w-40 md:h-60 object-cover rounded-xl shadow-md border border-[#d7e3da] dark:border-[#2a3d34] shrink-0" />
                <div className="flex-1">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] border border-[#cfe0d4] dark:border-[#355244] mb-3">{selectedBook.category}</div>
                  <h4 className="text-2xl font-bold text-[#183126] dark:text-[#edf7f1] leading-tight mb-2">{selectedBook.title}</h4>
                  <p className="text-lg text-[#355243] dark:text-[#dcebe2] mb-4">{selectedBook.author} • {selectedBook.year}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#edf4ef] dark:bg-[#1b2923] p-3 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34]"><p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1 font-medium">{t('admin.common.status')}</p><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${selectedBook.status === 'Published' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-100/70 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'}`}>{statusLabel(selectedBook.status)}</span></div>
                    <div className="bg-[#edf4ef] dark:bg-[#1b2923] p-3 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34]"><p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1 font-medium">{t('admin.books.col.rating')}</p><div className="flex items-center gap-1 font-bold text-[#183126] dark:text-[#edf7f1] text-sm"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{Number(selectedBook.rating || 0).toFixed(1)}</div></div>
                    <div className="bg-[#edf4ef] dark:bg-[#1b2923] p-3 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34]"><p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1 font-medium">{t('admin.books.col.readers')}</p><p className="font-bold text-[#183126] dark:text-[#edf7f1] text-sm">{(selectedBook.readers || 0).toLocaleString(locale)} {t('admin.common.peopleUnit')}</p></div>
                    <div className="bg-[#edf4ef] dark:bg-[#1b2923] p-3 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34]"><p className="text-xs text-[#567564] dark:text-[#9ec0ad] mb-1 font-medium">ISBN</p><p className="font-bold text-[#183126] dark:text-[#edf7f1] text-sm truncate">{selectedBook.isbn || '-'}</p></div>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#d7e3da] dark:border-[#2a3d34] pt-6">
                <h5 className="font-bold text-[#183126] dark:text-[#edf7f1] mb-3">{t('admin.books.synopsis')}</h5>
                <p className="text-[#355243] dark:text-[#dcebe2] text-sm leading-relaxed">{selectedBook.description || `${selectedBook.title} — ${selectedBook.author} (${selectedBook.year}).`}</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923] flex justify-end gap-3">
              <button onClick={() => { setReadingBook(selectedBook); setCurrentChapter(1); setSelectedBook(null); }} className="px-5 py-2.5 bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm"><BookOpen className="w-4 h-4" /> {t('admin.books.read')}</button>
              <button onClick={() => navigate(`/books/edit/${selectedBook.id}`)} className="px-5 py-2.5 bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] font-medium hover:bg-[#dfeee5] dark:hover:bg-[#2a3d34] rounded-xl transition-colors">{t('admin.books.editBook')}</button>
              <button onClick={() => setSelectedBook(null)} className="px-5 py-2.5 bg-[#163126] text-[#f4fbf7] font-medium hover:bg-[#204437] rounded-xl transition-colors">{t('admin.common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {readingBook && (
        <div className="fixed inset-0 bg-[#163126] z-50 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="h-16 bg-[#f8fbf8] dark:bg-[#15211c] border-b border-[#d7e3da] dark:border-[#2a3d34] flex items-center justify-between px-6 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setReadingBook(null)} className="p-2 -ml-2 text-[#567564] dark:text-[#9ec0ad] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] rounded-full"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
              <div>
                <h3 className="font-bold text-[#183126] dark:text-[#edf7f1] text-lg leading-none">{readingBook.title}</h3>
                <p className="text-sm text-[#567564] dark:text-[#9ec0ad] mt-1">{readingBook.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-[#567564] dark:text-[#9ec0ad] mr-4"><span>{t('admin.books.chapter')} {currentChapter} {t('admin.books.ofChapters')} {totalChapters}</span><div className="w-32 h-2 bg-[#dfeee5] dark:bg-[#22352d] rounded-full overflow-hidden"><div className="h-full bg-[#2f7a55] rounded-full transition-all duration-500" style={{ width: `${(currentChapter / totalChapters) * 100}%` }}></div></div></div>
              <button onClick={() => setReadingBook(null)} className="px-4 py-2 bg-[#163126] text-[#f4fbf7] text-sm font-medium rounded-lg hover:bg-[#204437] transition-colors">{t('admin.books.finishReading')}</button>
            </div>
          </div>
          <div className="flex-1 bg-[#fdfcf8] dark:bg-[#111a16] overflow-y-auto px-4 py-12 md:py-16">
            <div key={currentChapter} className={`max-w-2xl mx-auto ${isTransitioning ? 'opacity-0 translate-x-8' : 'animate-in fade-in slide-in-from-right-8 duration-500'}`}>
              <div className="space-y-8 text-[#183126] dark:text-[#e7f0ea] text-lg leading-relaxed font-serif">
                <h1 className="text-4xl font-bold text-center mb-12 text-[#183126] dark:text-[#edf7f1] font-sans">{currentChapter === 1 ? (lang === 'en' ? 'Chapter 1: The Beginning' : 'Bab 1: Awal Mula') : `${t('admin.books.chapter')} ${currentChapter}`}</h1>
                {currentChapter === 1 ? (
                  <>
                    <p>{t('admin.books.preview1')} <strong>{readingBook.title}</strong> — <em>{readingBook.author}</em>. {t('admin.books.preview2')}</p>
                    <p>{t('admin.books.preview3')}</p>
                  </>
                ) : (
                  <>
                    <p>{t('admin.books.preview4')}</p>
                    <p>{t('admin.books.preview5')}</p>
                  </>
                )}
                <div className="flex justify-center py-12"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></span><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></span><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mx-1"></span></div>
              </div>
              <div className="mt-20 pt-10 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-between items-center pb-20 font-sans">
                <button onClick={() => { if (currentChapter > 1) { setIsTransitioning(true); setTimeout(() => { setCurrentChapter(p => p - 1); setIsTransitioning(false); }, 150); } }} disabled={currentChapter === 1} className={`px-6 py-3 border border-[#d7e3da] dark:border-[#2a3d34] font-medium rounded-xl ${currentChapter === 1 ? 'text-[#8eab9b] cursor-not-allowed' : 'text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] bg-white dark:bg-[#182621]'}`}>{t('admin.books.prevChapter')}</button>
                <button onClick={() => { if (currentChapter < totalChapters) { setIsTransitioning(true); setTimeout(() => { setCurrentChapter(p => p + 1); setIsTransitioning(false); }, 150); } }} disabled={currentChapter === totalChapters} className={`px-6 py-3 font-medium rounded-xl ${currentChapter === totalChapters ? 'border border-[#d7e3da] dark:border-[#2a3d34] text-[#8eab9b] cursor-not-allowed' : 'bg-[#163126] text-[#f4fbf7] hover:bg-[#204437]'}`}>{t('admin.books.nextChapter')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
