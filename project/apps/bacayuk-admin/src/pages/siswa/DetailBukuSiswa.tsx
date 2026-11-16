import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Clock, Info, MessageSquare, Star } from 'lucide-react';
import { Book, initialBooks } from '../../lib/mockData';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';

const DetailBukuSiswa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('bacayuk_books');
      const allBooks = savedBooks ? JSON.parse(savedBooks) : initialBooks;
      const list = Array.isArray(allBooks) ? allBooks : initialBooks;
      const foundBook = list.find((b: Book) => b.id === id) || null;
      setBook(foundBook);
      const savedFavorites = localStorage.getItem('bacayuk_favorites');
      const favIds = savedFavorites ? JSON.parse(savedFavorites) : [];
      if (foundBook && Array.isArray(favIds)) setIsFavorite(favIds.includes(foundBook.id));
    } catch {
      setBook(null);
    }
  }, [id]);

  const toggleFavorite = () => {
    if (!book) return;
    try {
      const savedFavorites = localStorage.getItem('bacayuk_favorites');
      let favorites: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];
      if (!Array.isArray(favorites)) favorites = [];
      if (isFavorite) favorites = favorites.filter(favId => favId !== book.id);
      else favorites.push(book.id);
      localStorage.setItem('bacayuk_favorites', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch {}
  };

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#2a160b] dark:text-[#f3e9dc]">
        <h2 className="text-2xl font-bold mb-2">Buku tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="text-[#8b5e34] dark:text-[#d4b07a] font-bold hover:underline">Kembali</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#2a160b] dark:text-[#f3e9dc]">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6b4a2d] dark:text-[#d9c6b2] hover:text-[#8b5e34] dark:hover:text-[#f0dfc8] transition-colors font-bold">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>

      <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 sm:p-10 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-[#f3e7d3] dark:bg-[#332823] rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
          <div className="w-48 sm:w-64 shrink-0 relative group">
            <img src={resolveBookCover(book)} alt={book.title} loading="lazy" onError={handleBookCoverError} className="w-full h-auto aspect-[2/3] object-cover rounded-2xl shadow-xl border border-[#eadfcd] dark:border-[#3a2e27]" />
            <button onClick={toggleFavorite} className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-[#2b241f]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#8a6d1c] dark:text-[#d4b07a] hover:scale-105 shadow-md transition-all z-10 border border-[#eadfcd] dark:border-[#3a2e27]">
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex-1 space-y-6 w-full text-center md:text-left">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] text-xs font-bold mb-4 uppercase tracking-wider border border-[#eadfcd] dark:border-[#4a3a31]">{book.category}</div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#2a160b] dark:text-[#f6eadc] mb-2 leading-tight">{book.title}</h1>
              <p className="text-lg text-[#6b4a2d] dark:text-[#d9c6b2] font-medium">Oleh <span className="text-[#8b5e34] dark:text-[#d4b07a]">{book.author}</span></p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-[#f7f1e7] dark:bg-[#26201c] px-4 py-2 rounded-xl border border-[#eadfcd] dark:border-[#3a2e27]"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /><span className="font-bold text-[#2a160b] dark:text-[#f6eadc]">{book.rating || 0} <span className="text-[#8a6d1c] dark:text-[#d4b07a] font-normal text-sm">/ 5</span></span></div>
              <div className="flex items-center gap-2 bg-[#f7f1e7] dark:bg-[#26201c] px-4 py-2 rounded-xl border border-[#eadfcd] dark:border-[#3a2e27]"><BookOpen className="w-5 h-5 text-[#8b5e34] dark:text-[#d4b07a]" /><span className="font-bold text-[#2a160b] dark:text-[#f6eadc]">{book.readers || 0} <span className="text-[#8a6d1c] dark:text-[#d4b07a] font-normal text-sm">Pembaca</span></span></div>
              <div className="flex items-center gap-2 bg-[#f7f1e7] dark:bg-[#26201c] px-4 py-2 rounded-xl border border-[#eadfcd] dark:border-[#3a2e27]"><Clock className="w-5 h-5 text-emerald-500" /><span className="font-bold text-[#2a160b] dark:text-[#f6eadc]">{book.status || 'Tersedia'}</span></div>
            </div>

            <div className="pt-4 space-y-4">
              <h3 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] flex items-center gap-2 justify-center md:justify-start"><Info className="w-5 h-5 text-[#8a6d1c] dark:text-[#d4b07a]" /> Sinopsis</h3>
              <p className="text-[#5a3a22] dark:text-[#d9c6b2] leading-relaxed">
                {book.description || `Buku "${book.title}" karya ${book.author} adalah bacaan menarik dalam kategori ${book.category}. Jelajahi ceritanya dan temukan wawasan baru di dalamnya.`}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button onClick={() => navigate(`/siswa/baca/${book.id}`)} className="px-8 py-4 bg-[#8b5e34] text-white font-bold rounded-xl hover:bg-[#734c2a] transition-colors shadow-lg shadow-[#8b5e34]/20 flex items-center justify-center gap-2 text-lg">
                <BookOpen className="w-6 h-6" /> Mulai Baca
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 sm:p-10 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] mt-8">
        <h3 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-[#8b5e34] dark:text-[#d4b07a]" /> Ulasan Pembaca</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{ name: 'Siti Nurhaliza', avatar: 'SN', rating: 5, text: 'Buku yang sangat menginspirasi! Saya tidak bisa berhenti membacanya.', time: '2 hari lalu' },{ name: 'Budi Santoso', avatar: 'BS', rating: 4, text: 'Bagus untuk mengisi waktu luang, bahasanya mudah dipahami.', time: '1 minggu lalu' }].map((review, i) => (
            <div key={i} className="bg-[#f7f1e7] dark:bg-[#26201c] p-5 rounded-2xl border border-[#eadfcd] dark:border-[#3a2e27]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e8d6b8] dark:bg-[#3a2e27] text-[#8b5e34] dark:text-[#d4b07a] font-bold rounded-full flex items-center justify-center">{review.avatar}</div>
                  <div><p className="font-bold text-[#2a160b] dark:text-[#f6eadc] text-sm">{review.name}</p><p className="text-xs text-[#8a6d1c] dark:text-[#a78967]">{review.time}</p></div>
                </div>
                <div className="flex gap-0.5">{[...Array(5)].map((_, j) => (<Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-[#eadfcd] text-[#eadfcd] dark:fill-[#4a3a31] dark:text-[#4a3a31]'}`} />))}</div>
              </div>
              <p className="text-sm text-[#5a3a22] dark:text-[#d9c6b2] italic">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailBukuSiswa;
