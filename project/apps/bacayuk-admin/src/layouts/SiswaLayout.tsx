import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Heart, History, LayoutGrid, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';
import { useTheme } from '../lib/theme';
import { useLanguage } from '../lib/language';
import {
  AppNotification,
  formatNotifTime,
  getNotificationsFor,
  markAllRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../lib/notifications';
import { clearStudentSession, getStudentSession } from '../lib/session';

const SiswaLayout = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [studentName, setStudentName] = useState('Siswa');
  const [studentAvatar, setStudentAvatar] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const syncProfile = () => {
    const s = getStudentSession();
    const name = s?.name || s?.username || 'Siswa';
    const avatar = s?.avatarUrl || s?.avatar || '';
    setStudentName(name);
    setStudentAvatar(avatar);
  };

  const refreshNotifications = async () => {
    try {
      const list = await getNotificationsFor('siswa');
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.readBySiswa).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    syncProfile();
    void refreshNotifications();
    const onUpdate = () => void refreshNotifications();
    const onProfile = () => syncProfile();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
    window.addEventListener('profile_updated', onProfile);
    window.addEventListener('auth_changed', onProfile);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
      window.removeEventListener('profile_updated', onProfile);
      window.removeEventListener('auth_changed', onProfile);
    };
  }, []);

  const handleLogout = () => {
    clearStudentSession();
    navigate('/siswa/login');
  };

  const navItems = [
    { to: '/siswa', label: t('nav.home'), icon: BookOpen, end: true },
    { to: '/siswa/katalog', label: t('nav.collection'), icon: LayoutGrid },
    { to: '/siswa/favorit', label: t('nav.favorites'), icon: Heart },
    { to: '/siswa/riwayat', label: t('nav.history'), icon: History },
  ];

  const avatarSrc = studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=8b5e34&color=fff&rounded=true`;

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
                <p className="text-[11px] sm:text-xs font-semibold text-[#8a6d1c] dark:text-[#d4b07a] uppercase tracking-[0.18em]">{t('nav.studentSpace')}</p>
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
                title={isDark ? t('nav.themeLight') : t('nav.themeDark')}
                aria-label={isDark ? t('nav.themeLight') : t('nav.themeDark')}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={async () => {
                    const next = !showNotifications;
                    setShowNotifications(next);
                    setShowProfileMenu(false);
                    if (next) {
                      try {
                        await markAllRead('siswa');
                        await refreshNotifications();
                      } catch {}
                    }
                  }}
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#e6d6bf] bg-white text-[#6b4a2d] hover:bg-[#f6efe3] dark:bg-[#26201c] dark:border-[#3a2e27] dark:text-[#f0dfc8] dark:hover:bg-[#332823] transition-colors"
                  title={t('nav.notifications')}
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#8b5e34] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#26201c]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#221c18] rounded-2xl shadow-xl border border-[#eadfcd] dark:border-[#3a2e27] z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#f0e6d8] dark:border-[#3a2e27] bg-[#fbf7f1] dark:bg-[#2a231f] flex justify-between items-center">
                        <h3 className="font-bold text-[#2a160b] dark:text-[#f6eadc]">{t('nav.notifications')}</h3>
                        <span className="text-[11px] font-bold text-[#8a6d1c] dark:text-[#d4b07a]">{notifications.length} info</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-[#6b4a2d] dark:text-[#d9c6b2]">{t('nav.notificationsEmpty')}</div>
                        ) : (
                          notifications.slice(0, 12).map((n) => (
                            <div key={n.id} className={`flex gap-3 p-3 rounded-xl ${n.readBySiswa ? 'opacity-80' : 'bg-[#fbf7f1] dark:bg-[#2a231f]'}`}>
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                n.type === 'book' ? 'bg-[#f4ead0] dark:bg-[#3a321f] text-[#8a6a1d] dark:text-[#efd28a]' :
                                n.type === 'user' ? 'bg-[#e7f1ea] dark:bg-[#22352d] text-[#2f5b43] dark:text-[#cfead9]' :
                                'bg-[#f6efe3] dark:bg-[#332823] text-[#6b4a2d] dark:text-[#f0dfc8]'
                              }`}>
                                {n.type === 'book' ? <BookOpen className="w-4 h-4" /> : n.type === 'user' ? <User className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[#2a160b] dark:text-[#f6eadc] text-sm leading-snug">{n.title}</p>
                                <p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] mt-0.5 leading-snug">{n.message}</p>
                                <p className="text-[11px] text-[#9a7a55] dark:text-[#a78967] mt-1">{formatNotifTime(n.createdAt)}</p>
                              </div>
                            </div>
                          ))
                        )}
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
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-[#e6d6bf] bg-white hover:bg-[#fdf8f1] dark:bg-[#26201c] dark:border-[#3a2e27] dark:hover:bg-[#332823] transition-colors"
                >
                  <img src={resolveUserAvatar({ avatar: avatarSrc })} onError={handleAvatarError} alt="Profil" className="w-8 h-8 rounded-full object-cover ring-2 ring-[#f1e6d6] dark:ring-[#4a3a31]" />
                  <span className="hidden sm:block text-sm font-semibold text-[#4a2b17] dark:text-[#f0dfc8] max-w-[110px] truncate">{studentName}</span>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#221c18] rounded-2xl shadow-xl border border-[#eadfcd] dark:border-[#3a2e27] z-50 overflow-hidden">
                      <div className="p-4 border-b border-[#f0e6d8] dark:border-[#3a2e27] bg-[#fbf7f1] dark:bg-[#2a231f]">
                        <p className="font-bold text-[#2a160b] dark:text-[#f6eadc] truncate">{studentName}</p>
                        <p className="text-xs text-[#8a6d1c] dark:text-[#d4b07a] font-semibold">{t('nav.studentAccount')}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/siswa/profil');
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#5a3a22] dark:text-[#e8d8c4] font-medium hover:bg-[#f6efe3] dark:hover:bg-[#332823] rounded-xl transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" /> {t('nav.profile')}
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/siswa/profil', { state: { tab: 'pengaturan' } });
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-[#5a3a22] dark:text-[#e8d8c4] font-medium hover:bg-[#f6efe3] dark:hover:bg-[#332823] rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" /> {t('nav.settings')}
                        </button>
                      </div>
                      <div className="p-2 border-t border-[#f0e6d8] dark:border-[#3a2e27]">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-4 h-4" /> {t('nav.logout')}
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
          <p className="text-sm font-semibold text-[#6b4a2d] dark:text-[#d9c6b2]">{t('nav.footerTitle')}</p>
          <p className="text-xs text-[#9a7a55] dark:text-[#a78967] mt-1">&copy; {new Date().getFullYear()} {t('nav.footerTagline')}</p>
        </div>
      </footer>
    </div>
  );
};

export default SiswaLayout;
