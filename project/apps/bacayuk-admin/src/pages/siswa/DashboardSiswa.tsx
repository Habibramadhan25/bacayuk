import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Book, initialBooks } from '../../lib/mockData';
import { getApiUrl } from '../../lib/api';
import { handleBookCoverError, resolveBookCover } from '../../lib/bookCover';

const DashboardSiswa = () => {
  const navigate = useNavigate();
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Coba ambil dari Backend (Real API via Vercel binding / proxy)
    fetch(getApiUrl('/api/books'))
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(data => {
        setRecommendedBooks(data.slice(-5).reverse());
      })
      .catch(() => {
        // Fallback ke data lokal jika server mati
        try {
          const savedBooks = localStorage.getItem('bacayuk_books');
          const allBooks = savedBooks ? JSON.parse(savedBooks) : initialBooks;
          const list = Array.isArray(allBooks) ? allBooks : initialBooks;
          const published = list.filter((b: Book) => b.status === 'Published');
          setRecommendedBooks(published.slice(-5).reverse());
        } catch {
          setRecommendedBooks(initialBooks.filter((b) => b.status === 'Published').slice(-5).reverse());
        }
      });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto text-[#2a160b] dark:text-[#f3e9dc]">
      
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black font-serif text-[#2a160b] dark:text-[#f6eadc] mb-1">
          Selamat datang kembali!
        </h1>
        <p className="text-[#5a3a22] dark:text-[#d9c6b2] text-sm">
          Lanjutkan membaca dan temukan buku baru hari ini di ruang baca pribadimu.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <input 
          type="text" 
          placeholder="Cari buku, penulis, atau kategori..." 
          className="w-full pl-12 pr-4 py-4 bg-[#f4f0e6] dark:bg-[#26201c] border border-[#ebdcb8] dark:border-[#3a2e27] rounded-full text-[#2a160b] dark:text-[#f3e9dc] placeholder-[#a49373] dark:placeholder-[#8f7a62] focus:outline-none focus:ring-2 focus:ring-[#d4c3a3] dark:focus:ring-[#5b4636] transition-shadow"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a49373]" />
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#ecdcbf] to-[#e3ceb0] dark:from-[#3a2e24] dark:to-[#2d241d] border border-[#ddc8a7] dark:border-[#4a3a2e] rounded-3xl p-8 sm:p-10 relative overflow-hidden flex items-center shadow-sm">
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-black font-serif text-[#2a160b] dark:text-[#f6eadc] mb-3">
            Temukan Buku Favoritmu
          </h2>
          <p className="text-[#5a3a22] dark:text-[#d9c6b2] text-sm md:text-base mb-6">
            Baca kapan saja, di mana saja. Perluas wawasan, hidup lebih bermakna.
          </p>
          <button 
            onClick={() => navigate('/siswa/katalog')}
            className="bg-[#3a2012] hover:bg-[#2a160b] text-[#f9f6f0] px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#3a2012]/20"
          >
            Jelajahi Koleksi
          </button>
        </div>
        
        {/* Placeholder image representation for the banner */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:block w-48 h-56 rounded-2xl overflow-hidden shadow-2xl rotate-6">
          <img
            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"
            alt="Banner book"
            loading="lazy"
            onError={handleBookCoverError}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Buku Terbaru Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-serif text-[#2a160b] dark:text-[#f6eadc]">
            Buku Terbaru
          </h2>
          <button 
            onClick={() => navigate('/siswa/katalog')}
            className="text-sm font-medium text-[#5a3a22] dark:text-[#d9c6b2] hover:text-[#2a160b] dark:hover:text-white transition-colors"
          >
            Lihat semua
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {recommendedBooks.map((book) => (
            <div 
              key={book.id} 
              onClick={() => navigate(`/siswa/buku/${book.id}`)}
              className="group cursor-pointer bg-white dark:bg-[#211b17] p-3 rounded-2xl border border-[#efe5d8] dark:border-[#3a2e27] shadow-sm hover:shadow-md transition-all hover:border-[#d8c3a6] dark:hover:border-[#5b4636]"
            >
              <div className="relative overflow-hidden rounded-xl mb-3 aspect-[2/3] border border-gray-50">
                <img
                  src={resolveBookCover(book)}
                  alt={book.title}
                  loading="lazy"
                  onError={handleBookCoverError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-[#3a2012] shadow-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {book.rating}
                </div>
              </div>
              <div className="px-1">
                <h3 className="font-bold text-[#2a160b] dark:text-[#f3e9dc] text-sm leading-tight group-hover:text-[#8a6d1c] dark:group-hover:text-[#d4b07a] transition-colors line-clamp-1">{book.title}</h3>
                <p className="text-[11px] text-[#8a6d1c] dark:text-[#d4b07a] font-medium mt-1 truncate uppercase tracking-wide">{book.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default DashboardSiswa;
