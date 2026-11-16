import { useState, useEffect } from 'react';
import type { User } from '../lib/mockData';
import { Users as UsersIcon, Search, MoreVertical, UserX } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';

function formatDateSafe(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || '-';
  return d.toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('bacayuk_users') || '[]');
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  }, []);

  const handleToggleStatus = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: (u.status === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : u);
    setUsers(updated);
    localStorage.setItem('bacayuk_users', JSON.stringify(updated));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">Manajemen Anggota</h1>
        <p className="text-[#567564] dark:text-[#9ec0ad]">Kelola data pengguna dan anggota perpustakaan</p>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
            <input
              type="text"
              placeholder="Cari anggota..."
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
                <th className="p-4 font-medium">Anggota</th>
                <th className="p-4 font-medium">Bergabung</th>
                <th className="p-4 font-medium">Aktivitas Baca</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e3da] dark:divide-[#2a3d34]">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={resolveUserAvatar(user)} onError={handleAvatarError} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#d7e3da] dark:border-[#2a3d34]" />
                    <div>
                      <div className="font-semibold text-[#183126] dark:text-[#edf7f1]">{user.name}</div>
                      <div className="text-xs text-[#567564] dark:text-[#9ec0ad]">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-[#355243] dark:text-[#dcebe2] text-sm">{formatDateSafe(user.joinDate)}</td>
                  <td className="p-4 text-[#355243] dark:text-[#dcebe2] text-sm">
                    <span className="font-semibold text-[#183126] dark:text-[#edf7f1]">{user.booksRead ?? 0}</span>
                    <span className="text-[#567564] dark:text-[#9ec0ad] text-xs"> buku ({user.booksCompleted ?? 0} selesai)</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      user.status === 'Active' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : 'bg-[#e7f1ea] text-[#355243] border-[#cfe0d4] dark:bg-[#22352d] dark:text-[#cfead9] dark:border-[#355244]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleStatus(user.id)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Ubah Status">
                        <UserX className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-[#567564] dark:text-[#9ec0ad] hover:text-[#2f5b43] hover:bg-[#e7f1ea] dark:hover:bg-[#22352d] rounded-lg transition-colors" title="Detail">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <UsersIcon className="w-12 h-12 text-[#cfe0d4] dark:text-[#355244] mb-3" />
              <p className="text-[#567564] dark:text-[#9ec0ad] font-medium">Anggota tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#d7e3da] dark:border-[#2a3d34]">
            <div className="p-6 text-center border-b border-[#d7e3da] dark:border-[#2a3d34] relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 text-[#567564] dark:text-[#9ec0ad] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] rounded-full transition-colors">
                <UserX className="w-5 h-5 rotate-45" />
              </button>
              <img src={resolveUserAvatar(selectedUser)} onError={handleAvatarError} alt={selectedUser.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#e7f1ea] dark:border-[#22352d] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#183126] dark:text-[#edf7f1]">{selectedUser.name}</h3>
              <p className="text-[#567564] dark:text-[#9ec0ad]">{selectedUser.email}</p>
              <div className="mt-3 inline-flex px-3 py-1 bg-[#e7f1ea] dark:bg-[#22352d] text-[#355243] dark:text-[#cfead9] rounded-full text-xs font-medium">
                Bergabung {formatDateSafe(selectedUser.joinDate)}
              </div>
            </div>
            <div className="p-6 bg-[#edf4ef] dark:bg-[#1b2923]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fbf8] dark:bg-[#15211c] p-4 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] text-center">
                  <div className="text-2xl font-bold text-[#2f5b43] dark:text-[#cfead9]">{selectedUser.booksRead ?? 0}</div>
                  <div className="text-xs text-[#567564] dark:text-[#9ec0ad] mt-1 font-medium">Buku Dibaca</div>
                </div>
                <div className="bg-[#f8fbf8] dark:bg-[#15211c] p-4 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{selectedUser.booksCompleted ?? 0}</div>
                  <div className="text-xs text-[#567564] dark:text-[#9ec0ad] mt-1 font-medium">Diselesaikan</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#d7e3da] dark:border-[#2a3d34]">
              <button onClick={() => setSelectedUser(null)} className="w-full py-2.5 bg-[#163126] text-[#f4fbf7] font-medium hover:bg-[#204437] rounded-xl transition-colors">Tutup Profil</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#163126] text-[#f4fbf7] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <UserX className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-sm">Status anggota berhasil diperbarui!</span>
        </div>
      )}
    </div>
  );
};
export default Users;
