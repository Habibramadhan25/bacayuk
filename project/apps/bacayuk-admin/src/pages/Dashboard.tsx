import React, { useEffect, useState } from 'react';
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
import { Book, Category, initLocalStorage, User } from '../lib/mockData';

const dataReads = [
  { name: 'Sen', total: 1200 },
  { name: 'Sel', total: 1900 },
  { name: 'Rab', total: 1500 },
  { name: 'Kam', total: 2100 },
  { name: 'Jum', total: 2400 },
  { name: 'Sab', total: 3100 },
  { name: 'Min', total: 2800 },
];

const dataCategories = [
  { name: 'Fiksi', value: 400 },
  { name: 'Nonfiksi', value: 300 },
  { name: 'Sejarah', value: 200 },
  { name: 'Teknologi', value: 150 },
  { name: 'Anak', value: 100 },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    categories: 0,
    reads: 0,
    completed: 0,
    ratings: 0,
  });

  useEffect(() => {
    initLocalStorage();
    try {
      const books: Book[] = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
      const users: User[] = JSON.parse(localStorage.getItem('bacayuk_users') || '[]');
      const categories: Category[] = JSON.parse(localStorage.getItem('bacayuk_categories') || '[]');
      const safeBooks = Array.isArray(books) ? books : [];
      const safeUsers = Array.isArray(users) ? users : [];
      const safeCategories = Array.isArray(categories) ? categories : [];

      setStats({
        books: safeBooks.length,
        users: safeUsers.length,
        categories: safeCategories.length,
        reads: safeBooks.reduce((acc, curr) => acc + (Number(curr.readers) || 0), 0),
        completed: safeUsers.reduce((acc, curr) => acc + (Number((curr as any).booksCompleted) || 0), 0),
        ratings: 12543,
      });
    } catch {
      setStats({ books: 0, users: 0, categories: 0, reads: 0, completed: 0, ratings: 12543 });
    }
  }, []);

  const statCards = [
    { title: 'Koleksi Buku', value: stats.books, icon: BookOpen, note: '+12% bulan ini' },
    { title: 'Anggota Terdaftar', value: stats.users, icon: Users, note: '+5% anggota aktif' },
    { title: 'Kategori Rak', value: stats.categories, icon: Tags, note: 'Tertata rapi' },
    { title: 'Total Sirkulasi Baca', value: stats.reads.toLocaleString(), icon: TrendingUp, note: '+18% aktivitas' },
    { title: 'Buku Selesai Dibaca', value: stats.completed, icon: BookCheck, note: '+8% penyelesaian' },
    { title: 'Ulasan Masuk', value: stats.ratings.toLocaleString(), icon: Star, note: '+15% ulasan' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#cfe0d4] dark:border-[#2a3d34] bg-gradient-to-r from-[#163126] to-[#244738] text-[#eef7f1] p-6 md:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#d4a94e]/20 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide uppercase mb-3">
              <LibraryBig className="w-4 h-4 text-[#f0d27e]" /> Dashboard Petugas
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-serif">Ringkasan Layanan Perpustakaan</h1>
            <p className="text-[#cfe3d8] mt-1">Pantau koleksi, anggota, dan aktivitas baca dari satu meja kerja admin.</p>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 min-w-[220px]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="w-4 h-4 text-[#a6f0c2]" /> Sistem Operasional
            </div>
            <p className="text-xs text-[#cfe3d8] mt-1">Layanan katalog & sirkulasi berjalan normal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#e7f1ea] dark:bg-[#22352d] border border-[#cfe0d4] dark:border-[#355244] text-[#2f5b43] dark:text-[#cfead9]">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4ead0] text-[#7a5c16] dark:bg-[#3a321f] dark:text-[#efd28a] border border-[#e8d8a8] dark:border-[#5a4a2a]">
                {stat.note}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#567564] dark:text-[#9ec0ad]">{stat.title}</p>
            <h3 className="text-2xl font-black text-[#183126] dark:text-[#edf7f1] mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#f8fbf8] dark:bg-[#15211c] p-6 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1]">Aktivitas Membaca Mingguan</h3>
            <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">Tren kunjungan baca 7 hari terakhir</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataReads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f7a55" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2f7a55" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfe0d4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#567564', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#567564', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #cfe0d4', backgroundColor: '#f8fbf8', color: '#183126' }} />
                <Area type="monotone" dataKey="total" stroke="#2f7a55" strokeWidth={3} fillOpacity={1} fill="url(#colorTotalAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#f8fbf8] dark:bg-[#15211c] p-6 rounded-xl border border-[#d7e3da] dark:border-[#2a3d34] shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1]">Popularitas Kategori Rak</h3>
            <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">Distribusi minat baca per kategori</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cfe0d4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#567564', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#567564', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #cfe0d4', backgroundColor: '#f8fbf8', color: '#183126' }} cursor={{ fill: '#e7f1ea' }} />
                <Bar dataKey="value" fill="#d4a94e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
