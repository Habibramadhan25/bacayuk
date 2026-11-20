import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, List, Moon, Sun } from 'lucide-react';
import type { Book, HistoryItem } from '../../lib/mockData';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme';
import { useLanguage } from '../../lib/language';
import { getStudentSession } from '../../lib/session';

const BacaBukuSiswa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontSize, setFontSize] = useState(18);
  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState(1);
  const historyIdRef = useRef<string | null>(null);
  const historyReadyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const studentId = getStudentSession()?.id;
  const totalPages = 15;

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    historyReadyRef.current = false;
    historyIdRef.current = null;
    (async () => {
      try {
        const data = await api.get<Book>(`/api/books/${id}`);
        if (!mounted) return;
        setBook(data || null);
        // load existing history for this student+book to resume
        if (studentId) {
          try {
            const hist = await api.get<HistoryItem[]>(`/api/history?studentId=${encodeURIComponent(studentId)}`);
            const list = Array.isArray(hist) ? hist : [];
            const existing = list.find((h) => h.bookId === id);
            if (existing) {
              historyIdRef.current = existing.id;
              const p = Number(existing.currentPage || 1);
              if (p >= 1 && p <= totalPages) setPage(p);
            }
          } catch {}
        }
      } catch {
        if (mounted) setBook(null);
      } finally {
        if (mounted) {
          historyReadyRef.current = true;
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [id, studentId]);

  // save progress (after history resolved to avoid duplicates)
  useEffect(() => {
    if (!book || !studentId || !historyReadyRef.current) return;
    const progress = Math.round((page / totalPages) * 100);
    const status = page >= totalPages ? 'Selesai' : 'Sedang Dibaca';
    const payload = {
      studentId,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      progress,
      currentPage: page,
      totalPages,
      lastRead: new Date().toISOString(),
      status,
    };
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      const save = async () => {
        try {
          if (historyIdRef.current) {
            await api.put(`/api/history/${historyIdRef.current}`, payload);
          } else {
            const created = await api.post<HistoryItem>('/api/history', payload);
            if (created?.id) historyIdRef.current = created.id;
          }
        } catch {}
      };
      void save();
    }, 300);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [book, page, studentId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9F7F1] dark:bg-[#171311] text-[#2a160b] dark:text-[#f3e9dc]">Memuat...</div>;
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-[#F9F7F1] dark:bg-[#171311] text-[#2a160b] dark:text-[#f3e9dc] transition-colors">
        <h2 className="text-2xl font-bold mb-2">{t('reader.notFound')}</h2>
        <p className="text-sm text-[#5a3a22] dark:text-[#d9c6b2] mb-6">{t('reader.unavailable')}</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl bg-[#3a2012] dark:bg-[#8b5e34] text-[#f9f6f0] font-bold">{t('reader.back')}</button>
      </div>
    );
  }

  const readerBg = isDark ? 'bg-[#121212]' : 'bg-[#F9F7F1]';
  const readerText = isDark ? 'text-gray-300' : 'text-gray-800';
  const navBg = isDark ? 'bg-[#1E1E1E]/95 border-gray-800' : 'bg-[#f9f6f0]/95 border-gray-200';
  const iconColor = isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#8a6d1c]';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-serif ${readerBg}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 border-b shadow-sm backdrop-blur transition-all duration-300 ${navBg} ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/siswa/buku/${book.id}`)} className={`p-2 rounded-full ${iconColor}`} title={t('reader.backToDetail')}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={`font-sans font-bold truncate max-w-[150px] sm:max-w-xs ${isDark ? 'text-gray-200' : 'text-[#3a2012]'}`}>
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full ${iconColor}`} title={isDark ? t('nav.themeLight') : t('nav.themeDark')} aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className={`items-center rounded-lg p-1 hidden sm:flex ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className={`w-8 h-8 flex items-center justify-center font-sans font-bold rounded-md transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-white'}`}
                title="A-"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(30, fontSize + 2))}
                className={`w-8 h-8 flex items-center justify-center font-sans font-bold rounded-md transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-white'}`}
                title="A+"
              >
                A+
              </button>
            </div>

            <button className={`p-2 rounded-full ${iconColor}`} title="TOC">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 h-24 z-40" onClick={() => setShowMenu(!showMenu)} />

      <main
        className={`flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20 transition-all duration-300 ${readerText} leading-relaxed`}
        style={{ fontSize: `${fontSize}px` }}
        onClick={() => showMenu && setShowMenu(false)}
      >
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 font-sans">{book.title}</h2>
          <p className="text-lg opacity-70 italic">
            Bab {page}: {
              ['Awal dari Segalanya', 'Pertemuan Tak Terduga', 'Bayangan Masa Lalu', 'Perjalanan Dimulai', 'Sebuah Rahasia',
                'Kawan atau Lawan?', 'Menembus Badai', 'Titik Terang', 'Pengkhianatan', 'Jalan Buntu',
                'Secercah Harapan', 'Pengorbanan', 'Pertempuran Akhir', 'Matahari Terbit', 'Akhir Perjalanan'][page - 1] || 'Misteri Berlanjut'
            }
          </p>
        </div>

        <div className="space-y-6 text-justify">
          <p>
            [Halaman {page}] Mentari belum sepenuhnya menampakkan diri, namun desa kecil itu sudah mulai menggeliat. Asap tipis mengepul dari cerobong-cerobong dapur, membawa aroma kayu bakar dan singkong rebus yang khas. Kejadian di hari ke-{page} ini terasa sangat berbeda dari hari-hari sebelumnya.
          </p>
          <p>
            "Tunggu aku di persimpangan itu!" teriaknya memecah keheningan pagi. Sosok yang berjalan di depannya hanya menoleh sekilas lalu mempercepat langkahnya. Di saku bajunya, ia membawa pesan rahasia yang baru saja ditemukan pada bab {page} ini.
          </p>
          <p>
            Buku ini mengajarkan kita bahwa setiap langkah yang kita ambil, sekecil apapun, akan membawa kita menuju suatu tempat. Tidak ada perjalanan yang sia-sia, begitulah petuah lama mengatakan. Terlebih lagi ketika mereka menyadari fakta mengejutkan yang tertulis di halaman {page}.
          </p>
          <p>
            Di tengah perjalanan mereka, langit perlahan berubah warna. Dari ungu kelam, beralih ke jingga kemerahan, hingga akhirnya biru cerah mendominasi cakrawala. Burung-burung mulai bersahutan, seolah menyanyikan melodi tentang rahasia yang terungkap di bagian {page} cerita ini.
          </p>
          <p className={`italic opacity-80 mt-10 p-4 border-l-4 border-[#8a6d1c] rounded-r-lg ${isDark ? 'bg-[#8a6d1c]/20' : 'bg-[#8a6d1c]/10'}`}>
            (Kamu sedang berada di Halaman {page}. Teks sengaja dibuat dinamis agar kamu bisa melihat efek pergantian halamannya bekerja dengan baik. Teruskan membaca ke halaman {Math.min(page + 1, totalPages)} untuk melihat perubahan selanjutnya!)
          </p>
        </div>
      </main>

      <div className={`sticky bottom-0 left-0 right-0 z-40 border-t backdrop-blur ${navBg} px-4 py-3 flex items-center justify-between font-sans`}>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed text-gray-400' : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <ChevronLeft className="w-5 h-5" /> {t('reader.prev')}
        </button>

        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('reader.page')} {page} {t('reader.of')} {totalPages}
        </div>

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${page === totalPages ? 'opacity-50 cursor-not-allowed text-gray-400' : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {page === totalPages ? t('reader.finish') : t('reader.next')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full transition-opacity duration-1000 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} ${showMenu ? 'opacity-0' : 'opacity-50'}`}>
        {t('reader.menuHint')}
      </div>
    </div>
  );
};

export default BacaBukuSiswa;
