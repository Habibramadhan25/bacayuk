import { useEffect, useRef, useState } from 'react';
import { Save, User, Lock, Bell, Globe, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../lib/bookCover';
import { useLanguage, type AppLanguage } from '../lib/language';
import { api } from '../lib/api';
import { getAdminSession, setAdminSession } from '../lib/session';

const Settings = () => {
  const { lang, setLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profil');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('Administrator Utama');
  const [email, setEmail] = useState('admin@bacayuk.id');
  const [role, setRole] = useState('Super Admin');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(lang);
  const [timezone, setTimezone] = useState('WIB');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const adminId = getAdminSession()?.id || 'admin1';

  useEffect(() => { setSelectedLang(lang); }, [lang]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await api.get<any>(`/api/auth/admin/profile?id=${encodeURIComponent(adminId)}`);
        if (!mounted) return;
        setName(profile?.name || 'Administrator Utama');
        setEmail(profile?.email || 'admin@bacayuk.id');
        setRole(profile?.role || 'Super Admin');
        setTimezone(profile?.timezone || 'WIB');
        setProfileImage(profile?.avatarUrl || null);
      } catch {
        // fallback to session
        const s = getAdminSession();
        if (mounted && s) {
          setName(s.name || name);
          setEmail(s.email || email);
          setRole(s.role || role);
          setTimezone(s.timezone || timezone);
          setProfileImage(s.avatarUrl || s.avatar || null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const showToastMsg = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  };

  const syncSession = (patch: Record<string, any>) => {
    const s = getAdminSession();
    if (s) setAdminSession({ ...s, ...patch });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put<any>('/api/auth/admin/profile', {
        id: adminId,
        name: name.trim() || 'Administrator',
        email: email.trim() || 'admin@bacayuk.id',
        avatarUrl: profileImage,
      });
      syncSession({ name: updated?.name, email: updated?.email, avatarUrl: updated?.avatarUrl, avatar: updated?.avatarUrl });
      window.dispatchEvent(new Event('profile_updated'));
      showToastMsg('success', t('admin.settings.saved'));
    } catch (err: any) {
      showToastMsg('error', err?.message || t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRegional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/settings/admin', { id: adminId, timezone });
      setLang(selectedLang);
      syncSession({ timezone });
      showToastMsg('success', t('admin.settings.saved'));
    } catch (err: any) {
      showToastMsg('error', err?.message || t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword.trim() || !confirmPassword) {
      showToastMsg('error', t('admin.settings.passwordFillAll'));
      return;
    }
    if (newPassword.trim().length < 8) {
      showToastMsg('error', t('admin.settings.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      showToastMsg('error', t('admin.settings.passwordMismatch'));
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/auth/admin/change-password', { id: adminId, currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToastMsg('success', t('admin.settings.passwordUpdated'));
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('saat ini')) showToastMsg('error', t('admin.settings.passwordCurrentWrong'));
      else showToastMsg('error', msg || t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('img'));
          img.onload = () => {
            const maxSize = 256;
            let { width, height } = img;
            if (width > height) {
              if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
            } else {
              if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(reader.result as string); return; }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
      setProfileImage(dataUrl);
    } catch {
      showToastMsg('error', t('admin.settings.saveError'));
    }
    e.target.value = '';
  };

  const tabs = [
    { id: 'profil', label: t('admin.settings.tab.profile'), icon: User },
    { id: 'keamanan', label: t('admin.settings.tab.security'), icon: Lock },
    { id: 'notifikasi', label: t('admin.settings.tab.notifications'), icon: Bell },
    { id: 'regional', label: t('admin.settings.tab.regional'), icon: Globe },
  ];

  const inputCls = "w-full px-4 py-2.5 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg bg-white dark:bg-[#182621] text-[#183126] dark:text-[#e7f0ea] focus:ring-2 focus:ring-[#d4a94e]/30 focus:border-[#d4a94e] outline-none transition-colors";

  return (
    <div className="space-y-6 max-w-5xl relative">
      <div>
        <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">{t('admin.settings.title')}</h1>
        <p className="text-[#567564] dark:text-[#9ec0ad]">{t('admin.settings.desc')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-[#e7f1ea] dark:bg-[#22352d] text-[#183126] dark:text-[#edf7f1]' : 'text-[#355243] dark:text-[#dcebe2] hover:bg-[#edf4ef] dark:hover:bg-[#1b2923]'}`}>
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#2f5b43] dark:text-[#cfead9]' : 'text-[#567564] dark:text-[#9ec0ad]'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] p-6">
            {loading ? (
              <div className="py-12 text-center text-[#567564] dark:text-[#9ec0ad]">Memuat...</div>
            ) : (
            <>
            {activeTab === 'profil' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">{t('admin.settings.profileInfo')}</h2>
                <form className="space-y-6" onSubmit={handleSaveProfile}>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#e7f1ea] dark:bg-[#22352d] rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[#d4a94e]/40 ring-offset-2 ring-offset-[#f8fbf8] dark:ring-offset-[#15211c] border-2 border-[#cfe0d4] dark:border-[#355244]">
                      {profileImage ? <img src={profileImage} alt="Admin" className="w-full h-full object-cover" onError={handleAvatarError} /> : <img src={resolveUserAvatar(undefined)} alt="Admin" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-[#2f5b43] dark:text-[#cfead9] border border-[#cfe0d4] dark:border-[#355244] bg-[#e7f1ea] dark:bg-[#22352d] px-4 py-2 rounded-lg hover:bg-[#dfeee5] dark:hover:bg-[#2a3d34] transition-colors flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> {t('admin.settings.changePhoto')}
                      </button>
                      {profileImage && <button type="button" onClick={() => setProfileImage(null)} className="block mt-2 text-xs text-red-500 hover:underline">{t('admin.settings.removePhoto')}</button>}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.fullName')}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.adminEmail')}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.role')}</label><input type="text" value={role} className={inputCls} disabled /></div>
                  </div>
                  <div className="pt-4 border-t border-[#d7e3da] dark:border-[#2a3d34] flex justify-end"><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors shadow-sm font-medium disabled:opacity-70"><Save className="w-4 h-4" /> {t('admin.settings.saveChanges')}</button></div>
                </form>
              </>
            )}
            {activeTab === 'keamanan' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">{t('admin.settings.accountSecurity')}</h2>
                <form className="space-y-6" onSubmit={handleUpdateSecurity}>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.currentPassword')}</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('admin.settings.currentPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.newPassword')}</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('admin.settings.newPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                  <div><label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.confirmNewPassword')}</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('admin.settings.confirmNewPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                  <div className="pt-4"><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors shadow-sm font-medium disabled:opacity-70">{t('admin.settings.updateSecurity')}</button></div>
                </form>
              </>
            )}
            {activeTab === 'notifikasi' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">{t('admin.settings.notifPrefs')}</h2>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); showToastMsg('success', t('admin.settings.saved')); }}>
                  {[t('admin.settings.notif1'), t('admin.settings.notif2'), t('admin.settings.notif3'), t('admin.settings.notif4')].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-[#d7e3da] dark:border-[#2a3d34] rounded-lg bg-white dark:bg-[#182621]">
                      <span className="font-medium text-[#355243] dark:text-[#dcebe2]">{item}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                        <div className="w-11 h-6 bg-[#d7e3da] dark:bg-[#355244] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2f5b43]"></div>
                      </label>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors shadow-sm font-medium">{t('admin.settings.savePrefs')}</button></div>
                </form>
              </>
            )}
            {activeTab === 'regional' && (
              <>
                <h2 className="text-lg font-bold text-[#183126] dark:text-[#edf7f1] mb-6">{t('admin.settings.regionalTitle')}</h2>
                <form className="space-y-6" onSubmit={handleSaveRegional}>
                  <div>
                    <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.appLanguage')}</label>
                    <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value as AppLanguage)} className={inputCls + ' md:w-2/3'}>
                      <option value="id">{t('admin.settings.langId')}</option>
                      <option value="en">{t('admin.settings.langEn')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#355243] dark:text-[#dcebe2] mb-2">{t('admin.settings.timezone')}</label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls + ' md:w-2/3'}>
                      <option value="WIB">WIB (Waktu Indonesia Barat)</option>
                      <option value="WITA">WITA (Waktu Indonesia Tengah)</option>
                      <option value="WIT">WIT (Waktu Indonesia Timur)</option>
                    </select>
                  </div>
                  <div className="pt-4"><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#163126] text-[#f4fbf7] px-6 py-2.5 rounded-lg hover:bg-[#204437] transition-colors shadow-sm font-medium disabled:opacity-70">{t('admin.settings.saveSettings')}</button></div>
                </form>
              </>
            )}
            </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in z-50 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#163126] text-[#f4fbf7]'}`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-white/20' : 'bg-emerald-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
};
export default Settings;
