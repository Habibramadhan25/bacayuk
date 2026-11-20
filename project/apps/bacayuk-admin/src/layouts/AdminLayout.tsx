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
import { useLanguage } from '../lib/language';
import {
  AppNotification,
  formatNotifTime,
  getNotificationsFor,
  markAllRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../lib/notifications';
import { clearAdminSession, getAdminSession } from '../lib/session';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { t, lang } = useLanguage();

  const session = getAdminSession();
  const avatar = session?.avatarUrl || session?.avatar || '';
  const adminName = session?.name || session?.username || 'Administrator';
  const adminEmail = session?.email || 'admin@bacayuk.id';

  const refreshNotifications = async () => {
    try {
      const list = await getNotificationsFor('admin');
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.readByAdmin).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const [, setProfileTick] = useState(0);

  useEffect(() => {
    void refreshNotifications();
    const onUpdate = () => void refreshNotifications();
    const onProfile = () => setProfileTick((t) => t + 1);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
    window.addEventListener('auth_changed', onProfile);
    window.addEventListener('profile_updated', onProfile);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
      window.removeEventListener('auth_changed', onProfile);
      window.removeEventListener('profile_updated', onProfile);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('admin.nav.overview'), end: true },
    { path: '/activity', icon: Activity, label: t('admin.nav.activity') },
    { path: '/books', icon: BookCopy, label: t('admin.nav.books') },
    { path: '/books/add', icon: PlusCircle, label: t('admin.nav.addBook') },
    { path: '/categories', icon: Tags, label: t('admin.nav.categories') },
    { path: '/users', icon: Users, label: t('admin.nav.users') },
    { path: '/ratings', icon: Star, label: t('admin.nav.ratings') },
    { path: '/history', icon: History, label: t('admin.nav.history') },
    { path: '/settings', icon: Settings, label: t('admin.nav.settings') },
  ];

  const pageMeta: Record<string, { title: string; desc: string }> = {
    '/': { title: t('admin.page.overview.title'), desc: t('admin.page.overview.desc') },
    '/activity': { title: t('admin.page.activity.title'), desc: t('admin.page.activity.desc') },
    '/books': { title: t('admin.page.books.title'), desc: t('admin.page.books.desc') },
    '/books/add': { title: t('admin.page.addBook.title'), desc: t('admin.page.addBook.desc') },
    '/categories': { title: t('admin.page.categories.title'), desc: t('admin.page.categories.desc') },
    '/users': { title: t('admin.page.users.title'), desc: t('admin.page.users.desc') },
    '/ratings': { title: t('admin.page.ratings.title'), desc: t('admin.page.ratings.desc') },
    '/history': { title: t('admin.page.history.title'), desc: t('admin.page.history.desc') },
    '/settings': { title: t('admin.page.settings.title'), desc: t('admin.page.settings.desc') },
  };

  const currentPath = window.location.pathname;
  const activeMeta =
    pageMeta[currentPath] ||
    (currentPath.startsWith('/books/edit')
      ? { title: t('admin.page.editBook.title'), desc: t('admin.page.editBook.desc') }
      : pageMeta['/']);

  const formattedDate = currentTime.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8efe7] text-[#183126] dark:bg-[#101915] dark:text-[#edf7f1]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#102019]/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#264236] bg-[#163126] text-[#eef8f1] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-[#244738] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#355d49] bg-[#234637] shadow-inner shadow-[#0e241c]/40">
                <LibraryBig className="h-5 w-5 text-[#d4a94e]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9abda7]">BacaYuk</p>
                <h1 className="text-lg font-bold leading-tight text-white">{t('admin.brand.workspace')}</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-[#9abda7] transition hover:bg-[#204437] hover:text-white lg:hidden"
              aria-label={t('admin.common.close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-4 mt-4 rounded-2xl border border-[#2b4e3e] bg-[#1d3c2f] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9abda7]">{t('admin.brand.role')}</p>
            <p className="mt-1 text-sm font-semibold text-white">{adminName}</p>
            <p className="mt-1 text-xs text-[#b7d4c1]">{t('admin.brand.panel')} • {t('admin.page.overview.title')}</p>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'border border-[#d4a94e]/30 bg-[#f3f7f1] text-[#163126] shadow-sm'
                      : 'text-[#cfe2d7] hover:bg-[#204437] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#163126]' : 'text-[#9abda7] group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-[#244738] px-4 py-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#2b4e3e] bg-[#1d3c2f] px-3 py-2.5">
              <img
                src={resolveUserAvatar({ avatar })}
                alt="Admin"
                onError={handleAvatarError}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#355d49] ring-offset-1 ring-offset-[#1d3c2f]"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{adminName}</p>
                <p className="truncate text-xs text-[#9abda7]">{adminEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#3a2a2a] bg-[#2a1d1d] px-4 py-2.5 text-sm font-semibold text-[#ffd8d8] transition hover:bg-[#3a2626]"
            >
              <LogOut className="h-4 w-4" />
              {t('admin.profileMenu.logout')}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-[#d7e3da] bg-[#f7faf6]/95 backdrop-blur dark:border-[#24342d] dark:bg-[#15211c]/95">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-[#d7e3da] bg-white p-2 text-[#355243] transition hover:bg-[#edf4ef] lg:hidden dark:border-[#2a3d34] dark:bg-[#182621] dark:text-[#dcebe2] dark:hover:bg-[#1f3028]"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-[0.16em] text-[#5e7b6a] dark:text-[#92af9f]">{formattedDate}</p>
                <h2 className="truncate text-lg font-bold text-[#183126] sm:text-xl dark:text-[#edf7f1]">{activeMeta.title}</h2>
                <p className="hidden truncate text-sm text-[#567564] sm:block dark:text-[#9ec0ad]">{activeMeta.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8a7b] dark:text-[#8eab9b]" />
                <input
                  type="text"
                  placeholder={t('admin.search.placeholder')}
                  className="w-56 rounded-xl border border-[#d7e3da] bg-white py-2 pl-9 pr-3 text-sm text-[#183126] placeholder:text-[#7c9788] focus:border-[#d4a94e] focus:outline-none focus:ring-2 focus:ring-[#d4a94e]/20 lg:w-72 dark:border-[#2a3d34] dark:bg-[#182621] dark:text-[#e7f0ea] dark:placeholder:text-[#789487]"
                />
              </div>

              <button
                onClick={toggleTheme}
                className="rounded-xl border border-[#d7e3da] bg-white p-2.5 text-[#355243] transition hover:bg-[#edf4ef] dark:border-[#2a3d34] dark:bg-[#182621] dark:text-[#dcebe2] dark:hover:bg-[#1f3028]"
                title={isDark ? t('admin.theme.light') : t('admin.theme.dark')}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={async () => {
                    const next = !showNotifications;
                    setShowNotifications(next);
                    setShowProfileMenu(false);
                    if (next) {
                      try {
                        await markAllRead('admin');
                        setUnreadCount(0);
                        await refreshNotifications();
                      } catch {}
                    } else {
                      void refreshNotifications();
                    }
                  }}
                  className="relative rounded-xl border border-[#d7e3da] bg-white p-2.5 text-[#355243] transition hover:bg-[#edf4ef] dark:border-[#2a3d34] dark:bg-[#182621] dark:text-[#dcebe2] dark:hover:bg-[#1f3028]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4a94e] px-1 text-[10px] font-bold text-[#163126]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-3 shadow-xl dark:border-[#2a3d34] dark:bg-[#15211c]">
                    <p className="mb-2 px-1 text-sm font-semibold text-[#183126] dark:text-[#edf7f1]">{t('admin.notifications.title')}</p>
                    <div className="max-h-72 space-y-2 overflow-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#d7e3da] p-3 text-xs text-[#567564] dark:border-[#2a3d34] dark:text-[#9ec0ad]">{t('admin.notifications.empty')}</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="rounded-xl border border-[#d7e3da] bg-white p-3 dark:border-[#2a3d34] dark:bg-[#182621]">
                            <p className="text-sm font-semibold text-[#183126] dark:text-[#edf7f1]">{n.title}</p>
                            <p className="mt-0.5 text-xs text-[#567564] dark:text-[#9ec0ad]">{n.message}</p>
                            <p className="mt-1 text-[11px] text-[#6f8a7b] dark:text-[#8eab9b]">{formatNotifTime(n.createdAt)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu((v) => !v);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#d7e3da] bg-white py-1.5 pl-1.5 pr-2.5 transition hover:bg-[#edf4ef] dark:border-[#2a3d34] dark:bg-[#182621] dark:hover:bg-[#1f3028]"
                >
                  <img
                    src={resolveUserAvatar({ avatar })}
                    alt="Admin"
                    onError={handleAvatarError}
                    className="h-8 w-8 rounded-full object-cover border border-[#c7d3cc] dark:border-[#355244]"
                  />
                  <span className="hidden text-sm font-semibold text-[#183126] sm:block dark:text-[#edf7f1]">Admin</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-2 shadow-xl dark:border-[#2a3d34] dark:bg-[#15211c]">
                    <div className="mb-1 border-b border-[#d7e3da] px-2 py-2 dark:border-[#2a3d34]">
                      <p className="text-sm font-semibold text-[#183126] dark:text-[#edf7f1]">{t('admin.profileMenu.title')}</p>
                      <p className="text-xs text-[#567564] dark:text-[#9ec0ad]">{adminEmail}</p>
                    </div>
                    <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#355243] transition hover:bg-[#edf4ef] dark:text-[#dcebe2] dark:hover:bg-[#1f3028]"><Users className="h-4 w-4" /> {t('admin.profileMenu.profile')}</button>
                    <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#355243] transition hover:bg-[#edf4ef] dark:text-[#dcebe2] dark:hover:bg-[#1f3028]"><Settings className="h-4 w-4" /> {t('admin.profileMenu.settings')}</button>
                    <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"><LogOut className="h-4 w-4" /> {t('admin.profileMenu.logout')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#e8efe7] dark:bg-[#101915]">
          <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
            <div className="mb-6 hidden rounded-2xl border border-[#d7e3da] bg-gradient-to-r from-[#f7faf6] to-[#edf4ef] px-5 py-4 sm:block dark:border-[#24342d] dark:from-[#15211c] dark:to-[#1a2923]">
              <div className="flex items-center gap-2 text-sm font-medium text-[#567564] dark:text-[#9ec0ad]">
                <BookOpen className="h-4 w-4 text-[#c8922f]" />
                <span>{activeMeta.desc}</span>
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
