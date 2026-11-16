import { useState, useEffect } from 'react';
import type { Category } from '../lib/mockData';
import { Tags, Plus, Edit, Trash2, Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('bacayuk_categories') || '[]');
      const normalized = (Array.isArray(data) ? data : []).map((c: any) => ({ ...c, bookCount: Number(c?.bookCount) || 0 }));
      setCategories(normalized);
      localStorage.setItem('bacayuk_categories', JSON.stringify(normalized));
    } catch {
      setCategories([]);
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState('');
  const [catName, setCatName] = useState('');
  const [bookCount, setBookCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const openAddModal = () => { setModalMode('add'); setCatName(''); setBookCount(0); setIsModalOpen(true); };
  const openEditModal = (cat: Category) => { setModalMode('edit'); setEditId(cat.id); setCatName(cat.name); setBookCount(cat.bookCount || 0); setIsModalOpen(true); };

  const saveCategory = () => {
    const name = catName.trim();
    if (!name) return;
    let updated: Category[];
    if (modalMode === 'add') {
      updated = [...categories, { id: String(Date.now()), name, bookCount: Number(bookCount) || 0 }];
    } else {
      updated = categories.map(c => c.id === editId ? { ...c, name, bookCount: Number(bookCount) || 0 } : c);
    }
    setCategories(updated);
    localStorage.setItem('bacayuk_categories', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => { setDeleteId(id); setIsDeleteModalOpen(true); };
  const executeDelete = () => {
    const updated = categories.filter(c => c.id !== deleteId);
    setCategories(updated);
    localStorage.setItem('bacayuk_categories', JSON.stringify(updated));
    setIsDeleteModalOpen(false);
  };

  const filtered = categories.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">Manajemen Kategori Rak</h1>
          <p className="text-[#567564] dark:text-[#9ec0ad]">Kelola klasifikasi koleksi perpustakaan</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-4 py-2.5 rounded-xl hover:bg-[#204437] transition-colors shadow-sm font-semibold border border-[#244738]">
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
            <input
              type="text"
              placeholder="Cari kategori..."
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
                <th className="p-4 font-medium">No</th>
                <th className="p-4 font-medium">Nama Kategori</th>
                <th className="p-4 font-medium">Jumlah Buku</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e3da] dark:divide-[#2a3d34]">
              {filtered.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70 transition-colors">
                  <td className="p-4 text-[#567564] dark:text-[#9ec0ad] font-mono text-sm">#{index + 1}</td>
                  <td className="p-4 font-medium text-[#183126] dark:text-[#edf7f1] flex items-center gap-2">
                    <Tags className="w-4 h-4 text-[#567564] dark:text-[#9ec0ad]" />
                    {cat.name}
                  </td>
                  <td className="p-4 text-[#355243] dark:text-[#dcebe2]">
                    <span className="bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] px-3 py-1 rounded-full text-xs font-medium border border-[#cfe0d4] dark:border-[#355244]">
                      {cat.bookCount || 0} buku
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(cat)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(cat.id)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <Tags className="w-12 h-12 text-[#cfe0d4] dark:text-[#355244] mb-3" />
              <p className="text-[#567564] dark:text-[#9ec0ad] font-medium">Kategori tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-5 border-b border-[#d7e3da] dark:border-[#2a3d34]">
              <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#567564] dark:text-[#9ec0ad]" />
                {modalMode === 'add' ? 'Tambah Kategori Baru' : 'Ubah Kategori'}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Nama Kategori</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none" placeholder="Misal: Fiksi Ilmiah" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveCategory()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Jumlah Buku</label>
                <input type="number" min="0" value={bookCount} onChange={(e) => setBookCount(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none" onKeyDown={(e) => e.key === 'Enter' && saveCategory()} />
              </div>
            </div>
            <div className="p-5 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end gap-3 bg-[#edf4ef] dark:bg-[#1b2923]">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[#355243] dark:text-[#dcebe2] font-medium hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-xl transition-colors">Batal</button>
              <button onClick={saveCategory} className="px-5 py-2 bg-[#163126] text-[#f4fbf7] font-medium hover:bg-[#204437] rounded-xl shadow-sm transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#183126] dark:text-[#edf7f1] mb-2">Hapus Kategori?</h3>
              <p className="text-[#567564] dark:text-[#9ec0ad] text-sm">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-center gap-3 bg-[#edf4ef] dark:bg-[#1b2923]">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-[#355243] dark:text-[#dcebe2] font-medium hover:bg-[#dfeee5] dark:hover:bg-[#22352d] rounded-xl transition-colors">Batal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl shadow-sm transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Categories;
