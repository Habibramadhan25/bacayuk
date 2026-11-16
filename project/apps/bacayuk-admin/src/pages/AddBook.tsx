import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Book } from '../lib/mockData';
import { handleBookCoverError, resolveBookCover } from '../lib/bookCover';

const AddBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    description: '',
    category: 'Fiksi',
    year: new Date().getFullYear(),
    publisher: '',
    isbn: '',
    status: 'Draft',
    coverUrl: '',
  });

  useEffect(() => {
    if (isEditing) {
      try {
        const books: Book[] = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
        const book = Array.isArray(books) ? books.find(b => b.id === id) : undefined;
        if (book) setFormData(book);
      } catch {}
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' ? (parseInt(value) || new Date().getFullYear()) : value }));
  };

  const handleSubmit = (e: React.FormEvent, status: 'Published' | 'Draft') => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      try {
        const books: Book[] = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
        const arr = Array.isArray(books) ? books : [];
        if (isEditing) {
          const updatedBooks = arr.map(b => b.id === id ? { ...b, ...formData, status } as Book : b);
          localStorage.setItem('bacayuk_books', JSON.stringify(updatedBooks));
          setToastMessage('Data buku berhasil diperbarui.');
        } else {
          const newBook: Book = {
            id: Date.now().toString(),
            title: formData.title || 'Tanpa Judul',
            author: formData.author || '-',
            description: formData.description || '',
            category: formData.category || 'Fiksi',
            year: Number(formData.year) || new Date().getFullYear(),
            publisher: formData.publisher || '',
            isbn: formData.isbn || '',
            status,
            coverUrl: formData.coverUrl || '',
            rating: 0,
            readers: 0,
            dateAdded: new Date().toISOString(),
          };
          localStorage.setItem('bacayuk_books', JSON.stringify([newBook, ...arr]));
          setToastMessage('Buku baru berhasil ditambahkan.');
        }
      } catch {}
      setLoading(false);
      setShowToast(true);
      setTimeout(() => navigate('/books'), 1200);
    }, 600);
  };

  const inputCls = "w-full px-3 py-2 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/books')} className="p-2 hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] rounded-full transition-colors">
          <X className="w-5 h-5 text-[#355243] dark:text-[#dcebe2]" />
        </button>
        <div>
          <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">{isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}</h1>
          <p className="text-[#567564] dark:text-[#9ec0ad]">{isEditing ? 'Perbarui informasi koleksi' : 'Tambahkan koleksi baru ke katalog perpustakaan'}</p>
        </div>
      </div>

      <form className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Cover Buku</label>
              <div className="flex justify-center">
                <div className="w-40 h-56 border-2 border-dashed border-[#cfe0d4] dark:border-[#355244] rounded-xl p-2 text-center hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] transition-colors cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden bg-[#edf4ef]/50 dark:bg-[#1b2923]/50">
                  {formData.coverUrl ? (
                    <>
                      <img src={resolveBookCover(formData)} onError={handleBookCoverError} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg backdrop-blur-sm">
                        <span className="text-white font-medium text-sm">Ganti Cover</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, coverUrl: '' })); }} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md font-medium transition-colors">Hapus</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-[#6f8a7b] dark:text-[#8eab9b] mb-2" />
                      <p className="text-xs font-medium text-[#355243] dark:text-[#dcebe2] px-2">Klik untuk unggah</p>
                      <p className="text-[10px] text-[#567564] dark:text-[#9ec0ad] mt-1">Max 2MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setFormData(prev => ({ ...prev, coverUrl: ev.target?.result as string }));
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">File Buku Digital (PDF/EPUB)</label>
              <div className="border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg p-3 flex items-center gap-3 bg-white dark:bg-[#182621]">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#183126] dark:text-[#edf7f1] truncate">Pilih file...</p>
                  <p className="text-xs text-[#567564] dark:text-[#9ec0ad]">Max 50MB (opsional)</p>
                </div>
                <input type="file" accept=".pdf,.epub" className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="px-3 py-1.5 bg-[#e7f1ea] dark:bg-[#22352d] hover:bg-[#dfeee5] dark:hover:bg-[#2a3d34] text-sm font-medium text-[#355243] dark:text-[#dcebe2] rounded-md cursor-pointer transition-colors">Browse</label>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Judul Buku *</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className={inputCls} placeholder="Contoh: Laskar Pelangi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Penulis *</label>
                <input type="text" name="author" value={formData.author || ''} onChange={handleChange} required className={inputCls} placeholder="Contoh: Andrea Hirata" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Deskripsi / Sinopsis</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={inputCls} placeholder="Tuliskan sinopsis singkat buku ini..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Kategori</label>
                <select name="category" value={formData.category || 'Fiksi'} onChange={handleChange} className={inputCls}>
                  <option>Fiksi</option><option>Nonfiksi</option><option>Pendidikan</option><option>Teknologi</option><option>Sejarah</option><option>Agama</option><option>Novel</option><option>Cerita Anak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Tahun Terbit</label>
                <input type="number" name="year" value={formData.year || new Date().getFullYear()} onChange={handleChange} className={inputCls} placeholder="2024" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">Penerbit</label>
                <input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} className={inputCls} placeholder="Nama Penerbit" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-1">ISBN</label>
                <input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} className={inputCls} placeholder="Nomor ISBN" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#d7e3da] dark:border-[#2a3d34]">
          <button type="button" onClick={() => navigate('/books')} disabled={loading} className="px-5 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] text-[#355243] dark:text-[#dcebe2] font-medium rounded-lg hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] transition-colors">Batal</button>
          <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={loading} className="px-5 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] font-medium rounded-lg hover:bg-[#dfeee5] dark:hover:bg-[#2a3d34] transition-colors flex items-center gap-2"><Save className="w-4 h-4" />Simpan Draft</button>
          <button type="submit" onClick={(e) => handleSubmit(e, 'Published')} disabled={loading} className="px-5 py-2.5 bg-[#163126] text-[#f4fbf7] font-medium rounded-lg hover:bg-[#204437] transition-colors flex items-center gap-2 shadow-sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isEditing ? 'Perbarui Buku' : 'Publikasikan'}
          </button>
        </div>
      </form>

      {showToast && (
        <div className="fixed top-24 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 fade-in z-50">
          <Save className="w-4 h-4" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AddBook;
