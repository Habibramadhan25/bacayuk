import { useState, useRef } from 'react';
import { Save, User, Lock, Bell, Globe, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [showToast, setShowToast] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('bacayuk_admin_avatar'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (profileImage) localStorage.setItem('bacayuk_admin_avatar', profileImage);
    else localStorage.removeItem('bacayuk_admin_avatar');
    window.dispatchEvent(new Event('avatarUpdated'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profil', label: 'Profil Admin', icon: User },
    { id: 'keamanan', label: 'Keamanan Akun', icon: Lock },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'regional', label: 'Regional & Bahasa', icon: Globe },
  ];

  const inputCls = "w-full px-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none transition-colors";

  return (
    <div className="space-y-6 max-w-5xl relative">
      <div>
        <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">Pengaturan</h1>
        <p className="text-[#567564] dark:text-[#9ec0ad]">Kelola preferensi dan profil akun petugas/admin</p>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          <div className="w-full md:w-64 bg-[#edf4ef] dark:bg-[#1b2923] border-r border-[#d7e3da] dark:border-[#2a3d34] p-4">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-[#e7f1ea] dark:bg-[#22352d] text-[#2f5b43] dark:text-[#cfead9]' : 'text-[#355243] dark:text-[#dcebe2] hover:bg-[#dfeee5] dark:hover:bg-[#22352d]'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profil' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">Informasi Profil</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#e7f1ea] dark:bg-[#22352d] border-2 border-[#cfe0d4] dark:border-[#355244] rounded-full flex items-center justify-center text-[#2f5b43] dark:text-[#cfead9] font-bold text-3xl overflow-hidden">
                      <img src={resolveUserAvatar({ avatar: profileImage })} onError={handleAvatarError} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg text-sm font-medium text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] transition-colors">
                        <ImageIcon className="w-4 h-4" /> Ubah Foto Profil
                      </button>
                      {profileImage && <button type="button" onClick={() => setProfileImage(null)} className="text-xs text-red-600 dark:text-red-400 hover:underline text-left">Hapus foto</button>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Nama Lengkap</label>
                      <input type="text" defaultValue="Administrator BacaYuk" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Email Publik</label>
                      <input type="email" defaultValue="admin@bacayuk.com" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Bio / Keterangan Singkat</label>
                    <textarea rows={3} className={inputCls} defaultValue="Petugas yang mengelola koleksi dan layanan perpustakaan BacaYuk."></textarea>
                  </div>

                  <div className="pt-6 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'keamanan' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">Keamanan Akun</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Password Saat Ini</label><input type="password" placeholder="Masukkan password saat ini" className={inputCls + ' md:w-2/3'} /></div>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Password Baru</label><input type="password" placeholder="Minimal 8 karakter" className={inputCls + ' md:w-2/3'} /></div>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Konfirmasi Password Baru</label><input type="password" placeholder="Ulangi password baru" className={inputCls + ' md:w-2/3'} /></div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between p-4 bg-[#edf4ef] dark:bg-[#1b2923] border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl">
                      <div>
                        <p className="font-bold text-[#183126] dark:text-[#edf7f1]">Autentikasi Dua Faktor (2FA)</p>
                        <p className="text-sm text-[#567564] dark:text-[#9ec0ad]">Tingkatkan keamanan akun petugas.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#cfe0d4] dark:bg-[#355244] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2f7a55]"></div>
                      </label>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Perbarui Keamanan
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'notifikasi' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">Preferensi Notifikasi</h2>
                <div className="space-y-4">
                  {[
                    { title: 'Anggota Baru', desc: 'Notifikasi saat ada pendaftaran anggota baru.' },
                    { title: 'Ulasan & Rating', desc: 'Pemberitahuan saat ada ulasan/rating baru.' },
                    { title: 'Peringatan Sistem', desc: 'Email jika ada aktivitas login mencurigakan.' },
                    { title: 'Laporan Mingguan', desc: 'Ringkasan aktivitas layanan perpustakaan.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-[#f8fbf8] dark:bg-[#182621] border border-[#d7e3da] dark:border-[#2a3d34] rounded-xl">
                      <div className="pr-4">
                        <p className="font-bold text-[#183126] dark:text-[#edf7f1] mb-1">{item.title}</p>
                        <p className="text-sm text-[#567564] dark:text-[#9ec0ad] leading-relaxed">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" defaultChecked={i % 2 === 0} className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#cfe0d4] dark:bg-[#355244] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2f7a55]"></div>
                      </label>
                    </div>
                  ))}
                  <div className="pt-6 mt-6 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end">
                    <button type="button" onClick={handleSave} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Preferensi
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'regional' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">Regional & Bahasa</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Bahasa Sistem</label>
                      <select className={inputCls}><option value="id">Bahasa Indonesia</option><option value="en">English (US)</option></select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Zona Waktu</label>
                      <select className={inputCls}><option value="WIB">WIB (Waktu Indonesia Barat)</option><option value="WITA">WITA (Waktu Indonesia Tengah)</option><option value="WIT">WIT (Waktu Indonesia Timur)</option></select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">Format Tanggal</label>
                    <div className="space-y-3 mt-3">
                      <label className="flex items-center gap-3 p-3 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] cursor-pointer">
                        <input type="radio" name="dateFormat" defaultChecked className="w-4 h-4 text-[#2f7a55]" />
                        <span className="text-[#355243] dark:text-[#dcebe2] text-sm">DD/MM/YYYY (contoh: 31/12/2026)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg hover:bg-[#edf4ef] dark:hover:bg-[#1b2923] cursor-pointer">
                        <input type="radio" name="dateFormat" className="w-4 h-4 text-[#2f7a55]" />
                        <span className="text-[#355243] dark:text-[#dcebe2] text-sm">MM/DD/YYYY (contoh: 12/31/2026)</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors font-medium shadow-sm">
                      <Save className="w-4 h-4" /> Simpan Pengaturan
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#163126] text-[#f4fbf7] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">Perubahan berhasil disimpan!</span>
        </div>
      )}
    </div>
  );
};
export default Settings;
