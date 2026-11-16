import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bookmark, HeartCrack, Search, Star } from 'lucide-react';
import { Book, initialBooks } from '../../lib/mockData';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';

const FavoritSiswa = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('bacayuk_books');
      const allBooks: Book[] = savedBooks ? JSON.parse(savedBooks) : initialBooks;
      const published = (Array.isArray(allBooks) ? allBooks : initialBooks).filter((b: Book) => b.status === 'Published');
      const savedFavorites = localStorage.getItem('bacayuk_favorites');
      const favIds: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];
      const safeFavs = Array.isArray(favIds) ? favIds : [];
      setFavorites(safeFavs);
      setBooks(published.filter(b => safeFavs.includes(b.id)));
    } catch {
      setBooks([]);
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (bookId: string) => {
    const newFavorites = favorites.filter(id => id !== bookId);
    setFavorites(newFavorites);
    localStorage.setItem('bacayuk_favorites', JSON.stringify(newFavorites));
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const filteredBooks = books.filter(book =>
    (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-[#2a160b] dark:text-[#f6eadc]">Buku Favorit</h1>
          <p className="text-[#6b4a2d] dark:text-[#d9c6b2] text-sm mt-1">Koleksi buku yang kamu simpan untuk dibaca nanti.</p>
        </div>
      </div>

      {books.length > 0 && (
        <div className="bg-white dark:bg-[#211b17] p-4 rounded-2xl shadow-sm border border-[#eadfcd] dark:border-[#3a2e27]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a49373] dark:text-[#8f7a62]">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl bg-[#f7f1e7] dark:bg-[#26201c] text-[#2a160b] dark:text-[#f3e9dc] placeholder-[#a49373] dark:placeholder-[#8f7a62] focus:bg-white dark:focus:bg-[#2b241f] focus:ring-2 focus:ring-[#d4c3a3] dark:focus:ring-[#5b4636] focus:border-transparent outline-none transition-all"
              placeholder="Cari buku favoritmu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {books.length === 0 ? (
        <div className="bg-white dark:bg-[#211b17] rounded-2xl p-16 border border-[#eadfcd] dark:border-[#3a2e27] text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[#f3e7d3] dark:bg-[#332823] text-[#8a6d1c] dark:text-[#d4b07a] rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc] mb-2">Belum Ada Favorit</h3>
          <p className="text-[#6b4a2d] dark:text-[#d9c6b2] max-w-sm mb-6">Kamu belum menambahkan buku ke daftar favorit. Jelajahi katalog untuk menemukan bacaan menarik.</p>
          <a href="/siswa/katalog" className="px-6 py-3 bg-[#8b5e34] text-white font-bold rounded-xl hover:bg-[#734c2a] transition-colors shadow-md">Jelajahi Katalog</a>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} onClick={() => navigate(`/siswa/buku/${book.id}`)} className="bg-white dark:bg-[#211b17] rounded-2xl p-4 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-4 right-4 z-10">
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book.id); }} className="w-8 h-8 bg-[#8b5e34] rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-500 transition-colors" title="Hapus dari favorit">
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl">
                <img src={resolveBookCover(book)} alt={book.title} loading="lazy" onError={handleBookCoverError} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full py-2 bg-white/95 text-[#2a160b] rounded-lg text-sm font-medium flex items-center justify-center gap-2"><BookOpen className="w-4 h-4" /> Baca Sekarang</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-xs font-medium text-[#8a6d1c] dark:text-[#d4b07a] mb-2"><Star className="w-3.5 h-3.5 fill-current" /><span>{book.rating || 0}</span></div>
                <h3 className="font-bold text-[#2a160b] dark:text-[#f3e9dc] line-clamp-2 mb-1 group-hover:text-[#8a6d1c] dark:group-hover:text-[#d4b07a] transition-colors">{book.title}</h3>
                <p className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2] line-clamp-1 mt-auto">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#211b17] rounded-2xl p-12 border border-[#eadfcd] dark:border-[#3a2e27] text-center">
          <div className="w-16 h-16 bg-[#f3e7d3] dark:bg-[#332823] text-[#8a6d1c] dark:text-[#d4b07a] rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-2">Buku tidak ditemukan</h3>
          <p className="text-[#6b4a2d] dark:text-[#d9c6b2]">Tidak ada buku yang cocok di daftar favoritmu.</p>
        </div>
      )}
    </div>
  );
};

export default FavoritSiswa;
