import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, History, LayoutGrid, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';
import { useTheme } from '../lib/theme';

const SiswaLayout = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [studentName, setStudentName] = useState(localStorage.getItem('bacayuk_siswa_name') || 'Siswa');
  const [studentAvatar, setStudentAvatar] = useState(
    localStorage.getItem('bacayuk_siswa_avatar') ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(localStorage.getItem('bacayuk_siswa_name') || 'Siswa')}&background=8b5e34&color=fff&rounded=true`
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const name = localStorage.getItem('bacayuk_siswa_name') || 'Siswa';
      const avatar =
        localStorage.getItem('bacayuk_siswa_avatar') ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5e34&color=fff&rounded=true`;
      setStudentName(name);
      setStudentAvatar(avatar);
    };

    window.addEventListener('profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('profile_updated', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bacayuk_siswa_auth');
    localStorage.removeItem('bacayuk_siswa_name');
    window.dispatchEvent(new Event('auth_changed'));
    navigate('/siswa/login');
  };

  const navItems = [
    { to: '/siswa', label: 'Beranda', icon: BookOpen, end: true },
    { to: '/siswa/katalog', label: 'Koleksi', icon: LayoutGrid },
    { to: '/siswa/favorit', label: 'Favorit', icon: Heart },
    { to: '/siswa/riwayat', label: 'Riwayat', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fdfbf7] text-[#2a160b] dark:bg-[#171311] dark:text-[#f3e9dc] transition-colors">
      <header className="sticky top-0 z-40 border-b border-[#eadfcd] bg-[#fffdf9]/90 backdrop-blur dark:border-[#3a2e27] dark:bg-[#1d1714]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-4">
            <Link to="/siswa" className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5e34] to-[#5a351d] text-white flex items-center justify-center shadow-sm ring-1 ring-[#d8c3a6]/60 dark:ring-[#5b4636]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#3a2012] dark:text-[#f6eadc] truncate">BacaYuk</p>
                <p className="text-[11px] sm:text-xs font-semibold text-[#8a6d1c] dark:text-[#d4b07a] uppercase tracking-[0.18em]">Ruang Baca Siswa</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2 bg-[#f6efe3] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] rounded-full p-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-white text-[#3a2012] shadow-sm border border-[#e6d6bf] dark:bg-[#3a2e27] dark:text-[#f6eadc] dark:border-[#4a3a31]'
                        : 'text-[#6b4a2d] hover:text-[#3a2012] hover:bg-white/70 dark:text-[#d9c6b2] dark:hover:text-white dark:hover:bg-[#332823]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e6d6bf] bg-white text-[#6b4a2d] hover:bg-[#f6efe3] dark:bg-[#26201c] dark:border-[#3a2e27] dark:text-[#f0dfc8] dark:hover:bg-[#332823] transition-colors"
                title={isDark ? 'Mode terang' : 'Mode gelap'}
                aria-label="Toggle tema"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-[#e6d6bf] bg-white hover:bg-[#fdf8f1] dark:bg-[#26201c] dark:border-[#3a2e27] dark:hover:bg-[#332823] transition-colors"
                >
                  <img src={resolveUserAvatar({ avatar: studentAvatar })} onError={handleAvatarError} alt="Profil" className="w-8 h-8 rounded-full object-cover ring-2 ring-[#f1e6d6] dark:ring-[#4a3a31]" />
                  <span className="hidden sm:block text-sm font-semibold text-[#4a2b17] dark:text-[#f0dfc8] max-w-[110px] truncate">{studentName}</span>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#221c18] rounded-2xl shadow-xl border border-[#eadfcd] dark:border-[#3a2e27] z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#f0e6d8] dark:border-[#3a2e27] bg-[#fbf7f1] dark:bg-[#2a231f]">
                        <p className="font-bold text-[#2a160b] dark:text-[#f6eadc] truncate">{studentName}</p>
                        <p className="text-xs text-[#8a6d1c] dark:text-[#d4b07a] font-semibold">Akun Siswa</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/siswa/profil');
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#5a3a22] dark:text-[#e8d8c4] font-medium hover:bg-[#f6efe3] dark:hover:bg-[#332823] rounded-xl transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" /> Profil Saya
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/siswa/profil', { state: { tab: 'pengaturan' } });
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#5a3a22] dark:text-[#e8d8c4] font-medium hover:bg-[#f6efe3] dark:hover:bg-[#332823] rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" /> Pengaturan
                        </button>
                      </div>
                      <div className="p-2 border-t border-[#f0e6d8] dark:border-[#3a2e27]">
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
          </div>

          <nav className="md:hidden pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap px-3 py-2 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#8b5e34] text-white border-[#8b5e34]'
                      : 'bg-[#f7f1e7] text-[#6b4a2d] border-[#eadfcd] dark:bg-[#26201c] dark:text-[#d9c6b2] dark:border-[#3a2e27]'
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="border-t border-[#eadfcd] dark:border-[#3a2e27] bg-[#fbf7f1] dark:bg-[#1d1714] mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-[#6b4a2d] dark:text-[#d9c6b2]">BacaYuk • Ruang Baca Digital Siswa</p>
          <p className="text-xs text-[#9a7a55] dark:text-[#a78967] mt-1">&copy; {new Date().getFullYear()} Temukan cerita, perluas wawasan.</p>
        </div>
      </footer>
    </div>
  );
};

export default SiswaLayout;
