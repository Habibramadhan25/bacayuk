import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookCopy,
  BookOpen,
  History,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Star,
  Sun,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';
import { useTheme } from '../lib/theme';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(localStorage.getItem('bacayuk_admin_avatar') || '');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatar(localStorage.getItem('bacayuk_admin_avatar') || '');
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('bacayuk_admin_auth');
    window.dispatchEvent(new Event('auth_changed'));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Koleksi Buku', path: '/books', icon: BookCopy },
    { name: 'Tambah Buku', path: '/books/add', icon: PlusCircle },
    { name: 'Kategori', path: '/categories', icon: Tags },
    { name: 'Anggota / Pengguna', path: '/users', icon: Users },
    { name: 'Ulasan & Rating', path: '/ratings', icon: Star },
    { name: 'Riwayat Bacaan', path: '/history', icon: History },
    { name: 'Log Aktivitas', path: '/activity', icon: Activity },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#eef3ef] text-[#13261d] dark:bg-[#0f1714] dark:text-[#e7f0ea] flex transition-colors">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#163126] text-[#e8f3ec] border-r border-[#244738] dark:bg-[#0c1411] dark:border-[#21332b] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-20 px-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#d4a94e] text-[#1b2b23] flex items-center justify-center shadow-sm">
                <LibraryBig className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-black font-serif text-lg leading-none tracking-tight">BacaYuk Admin</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#b9d2c3] mt-1">Panel Petugas Perpustakaan</p>
              </div>
            </div>
            <button className="lg:hidden text-[#cfe3d8] hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-4 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#e7c66a]" />
              <div>
                <p className="text-xs font-semibold text-[#f0f7f3]">Meja Sirkulasi & Koleksi</p>
                <p className="text-[11px] text-[#b9d2c3]">Kelola layanan perpustakaan</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors border ${
                    isActive
                      ? 'bg-[#e7c66a] text-[#1b2b23] border-[#e7c66a] shadow-sm'
                      : 'text-[#dcebe2] border-transparent hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl font-semibold text-[#f1d6d3] hover:bg-red-500/15 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Keluar Panel
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-[#f8fbf8]/95 dark:bg-[#121d19]/95 border-b border-[#d7e3da] dark:border-[#24352d] backdrop-blur flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button className="lg:hidden text-[#355243] dark:text-[#cfe3d8]" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#567564] dark:text-[#9ec0ad]">Ruang Kerja Petugas</p>
              <p className="text-sm font-semibold text-[#1e3328] dark:text-[#edf7f1]">Administrasi & Sirkulasi Perpustakaan</p>
            </div>
            <div className="relative hidden xl:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
              <input
                type="text"
                placeholder="Cari buku, anggota, atau aktivitas..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#182621] border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl text-sm focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none placeholder-[#7b9487] dark:placeholder-[#88a295] text-[#183126] dark:text-[#e7f0ea]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-[#1e3328] dark:text-[#edf7f1]">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[11px] font-semibold text-[#567564] dark:text-[#9ec0ad]">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#d7e3da] bg-white text-[#355243] hover:bg-[#edf4ef] dark:bg-[#182621] dark:border-[#2a3d34] dark:text-[#dcebe2] dark:hover:bg-[#21322b] transition-colors"
              title={isDark ? 'Mode terang' : 'Mode gelap'}
              aria-label="Toggle tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowProfileMenu(false);
                }}
                className={`relative p-2.5 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] transition-colors ${
                  showNotifications ? 'bg-[#edf4ef] dark:bg-[#21322b]' : 'bg-white dark:bg-[#182621] hover:bg-[#edf4ef] dark:hover:bg-[#21322b]'
                } text-[#355243] dark:text-[#dcebe2]`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#d4a94e] rounded-full ring-2 ring-white dark:ring-[#182621]" />
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl border border-[#d7e3da] dark:border-[#2a3d34] z-50 overflow-hidden">
                    <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923] flex justify-between items-center">
                      <h3 className="font-bold text-[#1e3328] dark:text-[#edf7f1]">Notifikasi Petugas</h3>
                      <span className="text-[11px] font-bold text-[#567564] dark:text-[#9ec0ad]">Update terbaru</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#dfeee5] dark:bg-[#22352d] text-[#2f5b43] dark:text-[#cfead9] flex items-center justify-center"><Users className="w-4 h-4" /></div>
                        <div><p className="font-medium text-[#1e3328] dark:text-[#edf7f1]">Pendaftaran anggota baru masuk.</p><p className="text-xs text-[#6f8a7b] dark:text-[#95b1a2] mt-0.5">Baru saja</p></div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#f4ead0] dark:bg-[#3a321f] text-[#8a6a1d] dark:text-[#efd28a] flex items-center justify-center"><BookCopy className="w-4 h-4" /></div>
                        <div><p className="font-medium text-[#1e3328] dark:text-[#edf7f1]">Koleksi buku diperbarui hari ini.</p><p className="text-xs text-[#6f8a7b] dark:text-[#95b1a2] mt-0.5">1 jam lalu</p></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu((v) => !v);
                  setShowNotifications(false);
                }}
                className="focus:outline-none rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] p-0.5 bg-white dark:bg-[#182621] hover:bg-[#edf4ef] dark:hover:bg-[#21322b]"
              >
                {avatar ? (
                  <img src={resolveUserAvatar({ avatar })} onError={handleAvatarError} alt="Admin" className="h-9 w-9 rounded-[10px] object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-[10px] bg-[#163126] dark:bg-[#d4a94e] flex items-center justify-center text-[#e7c66a] dark:text-[#1b2b23] font-black">
                    A
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-3 w-60 bg-[#f8fbf8] dark:bg-[#15211c] rounded-2xl shadow-xl border border-[#d7e3da] dark:border-[#2a3d34] z-50 overflow-hidden">
                    <div className="p-4 border-b border-[#d7e3da] dark:border-[#2a3d34] bg-[#edf4ef] dark:bg-[#1b2923]">
                      <p className="font-bold text-[#1e3328] dark:text-[#edf7f1] truncate">Petugas Perpustakaan</p>
                      <p className="text-xs text-[#567564] dark:text-[#9ec0ad] font-semibold truncate mt-0.5">admin@bacayuk.com</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#21322b] font-semibold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" /> Pengaturan Akun
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/activity');
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#21322b] font-semibold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" /> Log Aktivitas
                      </button>
                    </div>
                    <div className="p-2 border-t border-[#d7e3da] dark:border-[#2a3d34]">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-[radial-gradient(circle_at_top_right,#dfeee5,transparent_35%),linear-gradient(to_bottom,#f3f8f4,#eaf1ec)] dark:bg-[radial-gradient(circle_at_top_right,#1c3028,transparent_30%),linear-gradient(to_bottom,#0f1714,#101a16)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
