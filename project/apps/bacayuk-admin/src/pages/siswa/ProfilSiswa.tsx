import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, BookOpen, Settings, Shield, Trophy, Flame, Hexagon, Star, CheckCircle2, Lock, Bell, Globe, Image as ImageIcon, Save } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../../lib/bookCover';

const ProfilSiswa = () => {
  const location = useLocation();
  const [studentName, setStudentName] = useState('Siswa');
  const [studentAvatar, setStudentAvatar] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'statistik');

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  const [activeSettingsTab, setActiveSettingsTab] = useState('profil');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const settingTabs = [
    { id: 'profil', label: 'Profil Siswa', icon: User },
    { id: 'keamanan', label: 'Keamanan Akun', icon: Lock },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'regional', label: 'Regional & Bahasa', icon: Globe },
  ];

  useEffect(() => {
    const name = localStorage.getItem('bacayuk_siswa_name') || 'Siswa';
    const avatar = localStorage.getItem('bacayuk_siswa_avatar') || '';
    setStudentName(name);
    setStudentAvatar(avatar);
    setEditName(name);
    setEditAvatar(avatar);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const name = editName.trim() || 'Siswa';
    localStorage.setItem('bacayuk_siswa_name', name);
    if (editAvatar) localStorage.setItem('bacayuk_siswa_avatar', editAvatar);
    else localStorage.removeItem('bacayuk_siswa_avatar');
    setStudentName(name);
    setStudentAvatar(editAvatar);
    window.dispatchEvent(new Event('profile_updated'));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Level Saat Ini', value: 'Pemula', icon: Shield, color: 'text-[#8b5e34] dark:text-[#d4b07a]', bg: 'bg-[#f3e7d3] dark:bg-[#332823]' },
    { label: 'Total Poin', value: '0', icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Buku Selesai', value: '0', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Hari Beruntun', value: '0 Hari', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Siti Aminah', points: 3450, badge: 'Master' },
    { rank: 2, name: 'Budi Santoso', points: 2890, badge: 'Senior' },
    { rank: 3, name: 'Andi Wijaya', points: 950, badge: 'Junior' },
    { rank: 4, name: 'Rina Melati', points: 820, badge: 'Junior' },
    { rank: 5, name: studentName, points: 0, badge: 'Pemula', isMe: true },
  ];

  const badges = [
    { name: 'Pembaca Kilat', desc: 'Selesaikan 1 buku dalam 24 jam', earned: false },
    { name: 'Kolektor Fiksi', desc: 'Baca 5 buku fiksi', earned: false },
    { name: 'Ulat Buku', desc: 'Membaca 7 hari berturut-turut', earned: false },
    { name: 'Kritikus Cerdas', desc: 'Beri ulasan pada 10 buku', earned: false },
  ];

  const inputCls = "w-full px-4 py-2.5 border border-[#eadfcd] dark:border-[#3a2e27] rounded-lg bg-white dark:bg-[#26201c] text-[#2a160b] dark:text-[#f3e9dc] focus:ring-2 focus:ring-[#d4c3a3] dark:focus:ring-[#5b4636] outline-none transition-colors";

  return (
    <div className="space-y-6 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="bg-gradient-to-r from-[#8b5e34] to-[#5a351d] rounded-3xl p-8 sm:p-10 text-[#fffaf3] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 bg-white/95 rounded-full p-2 shadow-lg relative">
            <img src={resolveUserAvatar({ avatar: studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=8b5e34&color=fff&size=256` })} onError={handleAvatarError} alt="Profile" className="w-full h-full rounded-full object-cover" />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black shadow-sm">L1</div>
          </div>
        </div>
        <div className="relative z-10 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20"><Shield className="w-4 h-4" /> Gelar: Pemula</div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif mb-2">{studentName}</h1>
          <p className="text-[#f3e7d3] mb-4 max-w-md">Terus membaca untuk membuka level dan lencana baru di ruang baca siswa.</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:w-64 h-3 bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full w-[5%]"></div></div>
            <span className="text-xs font-bold text-[#f3e7d3]">5% menuju Level 2</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-[#eadfcd] dark:border-[#3a2e27] overflow-x-auto">
        {[{id:'statistik',label:'Statistik & Lencana'},{id:'leaderboard',label:'Papan Peringkat'},{id:'pengaturan',label:'Pengaturan'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#8b5e34] text-[#8b5e34] dark:text-[#d4b07a] dark:border-[#d4b07a]' : 'border-transparent text-[#6b4a2d] dark:text-[#d9c6b2] hover:text-[#2a160b] dark:hover:text-white'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc]">Statistik Membaca</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#211b17] p-5 rounded-2xl shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}><stat.icon className="w-6 h-6" /></div>
                <div><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] font-medium">{stat.label}</p><p className="text-xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stat.value}</p></div>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc] pt-4">Koleksi Lencana</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, i) => (
              <div key={i} className={`p-5 rounded-2xl border text-center transition-all ${badge.earned ? 'bg-white dark:bg-[#211b17] border-amber-200 dark:border-amber-800 shadow-sm' : 'bg-[#f7f1e7] dark:bg-[#211b17] border-[#eadfcd] dark:border-[#3a2e27] opacity-70'}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${badge.earned ? 'bg-amber-100 text-amber-600' : 'bg-[#e8d6b8] dark:bg-[#332823] text-[#8a6d1c] dark:text-[#d4b07a]'}`}><Hexagon className="w-10 h-10" /></div>
                <h4 className="font-bold text-[#2a160b] dark:text-[#f6eadc] text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-[#211b17] rounded-3xl p-6 md:p-8 shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#2a160b] dark:text-[#f6eadc] flex items-center gap-2"><Trophy className="w-7 h-7 text-amber-500" /> Papan Peringkat</h2>
              <p className="text-[#6b4a2d] dark:text-[#d9c6b2] text-sm mt-1">Pembaca paling aktif bulan ini</p>
            </div>
            <div className="bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] px-4 py-2 rounded-xl font-bold text-sm">Peringkatmu: #{leaderboard.find(l => l.isMe)?.rank}</div>
          </div>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div key={user.rank} className={`flex items-center p-4 rounded-2xl transition-colors ${user.isMe ? 'bg-[#8b5e34] text-white shadow-md' : 'bg-[#f7f1e7] dark:bg-[#26201c] hover:bg-[#f1e6d6] dark:hover:bg-[#2f2722]'}`}>
                <div className={`w-8 font-black text-lg text-center ${user.isMe ? 'text-white' : user.rank <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-[#8a6d1c] dark:text-[#d4b07a]'}`}>#{user.rank}</div>
                <div className="w-10 h-10 ml-4 rounded-full bg-white shrink-0 shadow-sm overflow-hidden"><img src={resolveUserAvatar({ avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5e34&color=fff` })} onError={handleAvatarError} alt={user.name} /></div>
                <div className="ml-4 flex-1"><h4 className={`font-bold text-sm ${user.isMe ? 'text-white' : 'text-[#2a160b] dark:text-[#f6eadc]'}`}>{user.name} {user.isMe && '(Kamu)'}</h4><p className={`text-xs ${user.isMe ? 'text-[#f3e7d3]' : 'text-[#6b4a2d] dark:text-[#d9c6b2]'}`}>{user.badge}</p></div>
                <div className={`font-black text-lg ${user.isMe ? 'text-amber-200' : 'text-[#8b5e34] dark:text-[#d4b07a]'}`}>{user.points.toLocaleString()} <span className={`text-xs font-medium ${user.isMe ? 'text-[#f3e7d3]' : 'text-[#6b4a2d] dark:text-[#d9c6b2]'}`}>pts</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pengaturan' && (
        <div className="bg-white dark:bg-[#211b17] rounded-xl shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row min-h-[500px]">
            <div className="w-full md:w-64 bg-[#f7f1e7] dark:bg-[#26201c] border-r border-[#eadfcd] dark:border-[#3a2e27] p-4">
              <nav className="space-y-1">
                {settingTabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeSettingsTab === tab.id ? 'bg-[#e8d6b8] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] font-bold' : 'text-[#5a3a22] dark:text-[#d9c6b2] hover:bg-[#efe3d1] dark:hover:bg-[#2f2722]'}`}><tab.icon className="w-4 h-4" /> {tab.label}</button>
                ))}
              </nav>
            </div>
            <div className="flex-1 p-6 md:p-8">
              {showSuccess && (<div className="mb-6 p-4 bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /><p className="text-sm font-bold">Pengaturan berhasil diperbarui!</p></div>)}
              {activeSettingsTab === 'profil' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">Informasi Profil</h2>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-[#f3e7d3] dark:bg-[#332823] border-2 border-[#eadfcd] dark:border-[#3a2e27] rounded-full flex items-center justify-center overflow-hidden"><img src={resolveUserAvatar({ avatar: editAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || 'Siswa')}&background=8b5e34&color=fff&size=256` })} onError={handleAvatarError} alt="Profile" className="w-full h-full object-cover" /></div>
                      <div>
                        <input type="file" id="avatarUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <button type="button" onClick={() => document.getElementById('avatarUpload')?.click()} className="flex items-center gap-2 px-4 py-2 border border-[#eadfcd] dark:border-[#3a2e27] rounded-lg text-sm font-medium hover:bg-[#f7f1e7] dark:hover:bg-[#26201c] transition-colors"><ImageIcon className="w-4 h-4" /> Ubah Foto Profil</button>
                        {editAvatar && (<button type="button" onClick={() => setEditAvatar('')} className="text-xs text-red-600 dark:text-red-400 mt-2 hover:underline block text-left">Hapus foto</button>)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Nama Lengkap</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} /></div>
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Email Publik</label><input type="email" defaultValue={`${studentName.toLowerCase().replace(/\s+/g, '.')}@siswa.com`} className={inputCls} /></div>
                    </div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Bio / Keterangan Singkat</label><textarea rows={3} className={inputCls} defaultValue="Siswa yang gemar membaca dan menjelajah koleksi perpustakaan digital."></textarea></div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> Simpan Perubahan</button></div>
                  </form>
                </>
              )}
              {activeSettingsTab === 'keamanan' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">Keamanan Akun</h2>
                  <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000);}}>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Password Saat Ini</label><input type="password" placeholder="Masukkan password saat ini" className={inputCls + ' md:w-2/3'} /></div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Password Baru</label><input type="password" placeholder="Minimal 8 karakter" className={inputCls + ' md:w-2/3'} /></div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Konfirmasi Password Baru</label><input type="password" placeholder="Ulangi password baru" className={inputCls + ' md:w-2/3'} /></div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> Perbarui Keamanan</button></div>
                  </form>
                </>
              )}
              {activeSettingsTab === 'notifikasi' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">Preferensi Notifikasi</h2>
                  <div className="space-y-4">
                    {['Pengingat membaca harian','Info buku baru di katalog','Notifikasi pencapaian dan lencana','Pesan sistem dari perpustakaan'].map((item,i)=>(
                      <div key={i} className="flex items-start justify-between p-4 bg-[#f7f1e7] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl"><div><p className="font-bold text-[#2a160b] dark:text-[#f6eadc] mb-1">{item}</p><p className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2]">Aktifkan untuk menerima pembaruan terkait.</p></div><label className="relative inline-flex items-center cursor-pointer mt-1"><input type="checkbox" defaultChecked={i<2} className="sr-only peer" /><div className="w-11 h-6 bg-[#d8c3a6] dark:bg-[#4a3a31] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5e34]"></div></label></div>
                    ))}
                    <div className="pt-6 mt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="button" onClick={()=>{setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000);}} className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> Simpan Preferensi</button></div>
                  </div>
                </>
              )}
              {activeSettingsTab === 'regional' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">Regional & Bahasa</h2>
                  <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000);}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Bahasa Aplikasi</label><select className={inputCls}><option value="id">Bahasa Indonesia</option><option value="en">English (US)</option></select></div>
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">Zona Waktu</label><select className={inputCls}><option value="WIB">WIB</option><option value="WITA">WITA</option><option value="WIT">WIT</option></select></div>
                    </div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> Simpan Pengaturan</button></div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilSiswa;
