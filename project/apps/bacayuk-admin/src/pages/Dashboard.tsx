import { useEffect, useState } from 'react';
import {
  Activity,
  BookCheck,
  BookOpen,
  LibraryBig,
  Star,
  Tags,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../lib/language';
import { api } from '../lib/api';
import type { ActivityLog } from '../lib/mockData';

type DashboardStats = {
  books: number;
  users: number;
  categories: number;
  reads: number;
  completed: number;
  averageRating: number;
  historyCount?: number;
  reviewCount?: number;
};

const Dashboard = () => {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    books: 0,
    users: 0,
    categories: 0,
    reads: 0,
    completed: 0,
    averageRating: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dash, activity] = await Promise.all([
          api.get<DashboardStats>('/api/dashboard'),
          api.get<ActivityLog[]>('/api/activity').catch(() => []),
        ]);
        if (!mounted) return;
        setStats({
          books: Number(dash?.books || 0),
          users: Number(dash?.users || 0),
          categories: Number(dash?.categories || 0),
          reads: Number(dash?.reads || 0),
          completed: Number(dash?.completed || 0),
          averageRating: Number(dash?.averageRating || 0),
          historyCount: Number(dash?.historyCount || 0),
          reviewCount: Number(dash?.reviewCount || 0),
        });
        setRecentActivity(Array.isArray(activity) ? activity.slice(0, 5) : []);
      } catch {
        if (!mounted) return;
        setStats({ books: 0, users: 0, categories: 0, reads: 0, completed: 0, averageRating: 0 });
        setRecentActivity([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const dataReads = lang === 'en'
    ? [
        { name: 'Mon', total: 1200 }, { name: 'Tue', total: 1900 }, { name: 'Wed', total: 1500 },
        { name: 'Thu', total: 2100 }, { name: 'Fri', total: 2400 }, { name: 'Sat', total: 3100 }, { name: 'Sun', total: 2800 },
      ]
    : [
        { name: 'Sen', total: 1200 }, { name: 'Sel', total: 1900 }, { name: 'Rab', total: 1500 },
        { name: 'Kam', total: 2100 }, { name: 'Jum', total: 2400 }, { name: 'Sab', total: 3100 }, { name: 'Min', total: 2800 },
      ];

  const dataCategories = lang === 'en'
    ? [
        { name: 'Fiction', value: 400 }, { name: 'Nonfiction', value: 300 }, { name: 'History', value: 200 },
        { name: 'Technology', value: 150 }, { name: 'Children', value: 100 },
      ]
    : [
        { name: 'Fiksi', value: 400 }, { name: 'Nonfiksi', value: 300 }, { name: 'Sejarah', value: 200 },
        { name: 'Teknologi', value: 150 }, { name: 'Anak', value: 100 },
      ];

  const StatCard = ({ title, value, subtext, icon: Icon, accent }: { title: string; value: string | number; subtext: string; icon: any; accent: string }) => (
    <div className="rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-5 shadow-sm dark:border-[#24342d] dark:bg-[#15211c]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#567564] dark:text-[#9ec0ad]">{title}</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-[#183126] dark:text-[#edf7f1]">{value}</h3>
          <p className="mt-1 text-xs text-[#6f8a7b] dark:text-[#8eab9b]">{subtext}</p>
        </div>
        <div className={`rounded-xl border px-3 py-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  const formatTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value || '-';
    return d.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const activityStatusLabel = (s: string) => {
    if (s === 'Success') return t('admin.status.done');
    if (s === 'Warning') return t('admin.status.reading');
    if (s === 'Error') return 'Error';
    return s || '-';
  };

  const locale = lang === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className="space-y-6 text-[#183126] dark:text-[#edf7f1]">
      <div className="rounded-3xl border border-[#d7e3da] bg-gradient-to-br from-[#163126] via-[#1d4333] to-[#274b3b] p-6 text-white shadow-sm dark:border-[#2a3d34]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#e8f4ec]">
              <LibraryBig className="h-3.5 w-3.5 text-[#d4a94e]" />
              {t('admin.page.overview.title')}
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t('admin.page.overview.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#cfe6d8] sm:text-base">{t('admin.page.overview.desc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-[#cfe6d8]">{t('admin.dashboard.booksCompleted')}</p>
              <p className="mt-1 text-xl font-bold text-white">{stats.completed.toLocaleString(locale)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs text-[#cfe6d8]">{t('admin.dashboard.avgRating')}</p>
              <p className="mt-1 text-xl font-bold text-white">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm sm:col-span-1">
              <p className="text-xs text-[#cfe6d8]">{t('admin.dashboard.totalReads')}</p>
              <p className="mt-1 text-xl font-bold text-[#f0d58c]">{stats.reads.toLocaleString(locale)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t('admin.dashboard.totalBooks')} value={stats.books.toLocaleString(locale)} subtext={t('admin.dashboard.updatedFromCollection')} icon={BookOpen} accent="border-[#dcebdd] bg-[#eef7f1] text-[#2f5b43] dark:border-[#355244] dark:bg-[#1e332a] dark:text-[#cfead9]" />
        <StatCard title={t('admin.dashboard.activeMembers')} value={stats.users.toLocaleString(locale)} subtext={t('admin.dashboard.registeredReaders')} icon={Users} accent="border-[#dce7f1] bg-[#edf4fa] text-[#2f5774] dark:border-[#33495a] dark:bg-[#1b2b35] dark:text-[#d5e8f6]" />
        <StatCard title={t('admin.dashboard.shelfCategories')} value={stats.categories.toLocaleString(locale)} subtext={t('admin.dashboard.collectionClassification')} icon={Tags} accent="border-[#ede4c8] bg-[#faf4e4] text-[#7a5a16] dark:border-[#4a3d20] dark:bg-[#2c2618] dark:text-[#f0ddb0]" />
        <StatCard title={t('admin.dashboard.readingActivity')} value={stats.reads.toLocaleString(locale)} subtext={t('admin.dashboard.totalReads')} icon={Activity} accent="border-[#f0d9c8] bg-[#fff1e8] text-[#8a4a1f] dark:border-[#4a3426] dark:bg-[#2d211a] dark:text-[#ffd8b8]" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-5 shadow-sm xl:col-span-2 dark:border-[#24342d] dark:bg-[#15211c]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1]">{t('admin.dashboard.weeklyTrend')}</h3>
              <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">{t('admin.dashboard.weeklyTrendDesc')}</p>
            </div>
            <div className="rounded-lg bg-[#edf4ef] p-2 text-[#355243] dark:bg-[#1b2923] dark:text-[#cfead9]"><TrendingUp className="h-4 w-4" /></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataReads} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f7a55" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2f7a55" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d7e3da" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#567564', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#567564', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #d7e3da', backgroundColor: '#f8fbf8', color: '#183126' }} />
                <Area type="monotone" dataKey="total" stroke="#2f7a55" strokeWidth={3} fillOpacity={1} fill="url(#colorReads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-5 shadow-sm dark:border-[#24342d] dark:bg-[#15211c]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1]">{t('admin.dashboard.categoryDist')}</h3>
              <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">{t('admin.dashboard.categoryDistDesc')}</p>
            </div>
            <div className="rounded-lg bg-[#faf4e4] p-2 text-[#7a5a16] dark:bg-[#2c2618] dark:text-[#f0ddb0]"><BookCheck className="h-4 w-4" /></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategories} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#d7e3da" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#355243', fontSize: 12, fontWeight: 500 }} width={82} />
                <Tooltip cursor={{ fill: '#edf4ef' }} contentStyle={{ borderRadius: '12px', border: '1px solid #d7e3da', backgroundColor: '#f8fbf8', color: '#183126' }} />
                <Bar dataKey="value" fill="#c8922f" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d7e3da] bg-[#f8fbf8] p-5 shadow-sm dark:border-[#24342d] dark:bg-[#15211c]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1]">{t('admin.dashboard.recentActivity')}</h3>
            <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">{t('admin.page.history.desc')}</p>
          </div>
          <div className="rounded-lg bg-[#edf4ef] p-2 text-[#355243] dark:bg-[#1b2923] dark:text-[#cfead9]"><Star className="h-4 w-4" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#d7e3da] text-[#567564] dark:border-[#24342d] dark:text-[#9ec0ad]">
                <th className="px-3 py-3 font-medium">{t('admin.users.col.member')}</th>
                <th className="px-3 py-3 font-medium">{t('admin.history.modalTitle')}</th>
                <th className="px-3 py-3 font-medium">{t('admin.books.col.book')}</th>
                <th className="px-3 py-3 font-medium">{t('admin.history.lastActivity')}</th>
                <th className="px-3 py-3 font-medium">{t('admin.common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e3da] dark:divide-[#24342d]">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#567564] dark:text-[#9ec0ad]">{t('admin.activity.empty')}</td>
                </tr>
              ) : recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70">
                  <td className="px-3 py-3 font-medium text-[#183126] dark:text-[#edf7f1]">{item.user}</td>
                  <td className="px-3 py-3 text-[#355243] dark:text-[#dcebe2]">{item.action}</td>
                  <td className="px-3 py-3 text-[#355243] dark:text-[#dcebe2]">{item.target}</td>
                  <td className="px-3 py-3 text-[#567564] dark:text-[#9ec0ad]">{formatTime(item.time)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'Success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : item.status === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {activityStatusLabel(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
