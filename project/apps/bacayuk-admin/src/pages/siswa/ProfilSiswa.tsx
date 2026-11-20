import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, BookOpen, Shield, Trophy, Flame, Hexagon, Star, CheckCircle2, Lock, Bell, Globe, Image as ImageIcon, Save } from 'lucide-react';
import { handleAvatarError, resolveUserAvatar } from '../../lib/bookCover';
import { useLanguage, type AppLanguage } from '../../lib/language';
import { api } from '../../lib/api';
import { getStudentSession, setStudentSession } from '../../lib/session';

const ProfilSiswa = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const session = getStudentSession();
  const studentId = session?.id || '';
  const [studentName, setStudentName] = useState(session?.name || 'Siswa');
  const [studentAvatar, setStudentAvatar] = useState<string>(session?.avatarUrl || session?.avatar || '');
  const [studentEmail, setStudentEmail] = useState<string>(session?.email || '');
  const [booksRead, setBooksRead] = useState<number>(Number(session?.booksRead || 0));
  const [booksCompleted, setBooksCompleted] = useState<number>(Number(session?.booksCompleted || 0));
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'statistik');

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  const [activeSettingsTab, setActiveSettingsTab] = useState('profil');
  const [editName, setEditName] = useState(studentName);
  const [editAvatar, setEditAvatar] = useState(studentAvatar);
  const [editEmail, setEditEmail] = useState(studentEmail);
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(lang);
  const [timezone, setTimezone] = useState('WIB');
  const [showSuccess, setShowSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState(t('settings.saved'));
  const [saving, setSaving] = useState(false);

  const settingTabs = [
    { id: 'profil', label: t('settings.profile'), icon: User },
    { id: 'keamanan', label: t('settings.security'), icon: Lock },
    { id: 'notifikasi', label: t('settings.notifications'), icon: Bell },
    { id: 'regional', label: t('settings.regional'), icon: Globe },
  ];

  useEffect(() => { setSelectedLang(lang); }, [lang]);

  useEffect(() => {
    if (!studentId) return;
    let mounted = true;
    (async () => {
      try {
        const profile = await api.get<any>(`/api/auth/student/profile/${studentId}`);
        if (!mounted || !profile) return;
        const name = profile.name || 'Siswa';
        const avatar = profile.avatarUrl || profile.avatar || '';
        setStudentName(name);
        setStudentAvatar(avatar);
        setStudentEmail(profile.email || '');
        setBooksRead(Number(profile.booksRead || 0));
        setBooksCompleted(Number(profile.booksCompleted || 0));
        setEditName(name);
        setEditAvatar(avatar);
        setEditEmail(profile.email || '');
        const s = getStudentSession();
        if (s) setStudentSession({ ...s, name, avatarUrl: avatar, avatar, email: profile.email || null, booksRead: Number(profile.booksRead || 0), booksCompleted: Number(profile.booksCompleted || 0) });
      } catch {
        // keep session data
      }
    })();
    return () => { mounted = false; };
  }, [studentId]);

  const flashSuccess = (msg = t('settings.saved')) => {
    setToastMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    const name = editName.trim() || 'Siswa';
    setSaving(true);
    try {
      const updated = await api.put<any>(`/api/auth/student/profile/${studentId}`, {
        name,
        avatarUrl: editAvatar || null,
        email: editEmail.trim() || null,
      });
      const avatar = updated?.avatarUrl ?? (editAvatar || '');
      const newName = updated?.name || name;
      const newEmail = updated?.email ?? (editEmail.trim() || null);
      setStudentName(newName);
      setStudentAvatar(avatar || '');
      setStudentEmail(newEmail || '');
      setEditName(newName);
      setEditAvatar(avatar || '');
      setEditEmail(newEmail || '');
      const s = getStudentSession();
      if (s) setStudentSession({ ...s, name: newName, avatarUrl: avatar || null, avatar: avatar || null, email: newEmail });
      window.dispatchEvent(new Event('profile_updated'));
      flashSuccess();
    } catch (err: any) {
      flashSuccess(err?.message || t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRegional = (e: React.FormEvent) => {
    e.preventDefault();
    setLang(selectedLang);
    flashSuccess();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if (width > height) { if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; } }
            else { if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; } }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(reader.result as string); return; }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
      setEditAvatar(dataUrl);
    } catch {}
    e.target.value = '';
  };

  const stats = [
    { label: t('profile.stat.currentLevel'), value: booksCompleted >= 10 ? 'L2' : t('profile.levelBeginner'), icon: Shield, color: 'text-[#8b5e34] dark:text-[#d4b07a]', bg: 'bg-[#f3e7d3] dark:bg-[#332823]' },
    { label: t('profile.stat.totalPoints'), value: String(booksCompleted * 50 + booksRead * 10), icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: t('profile.stat.booksCompleted'), value: String(booksCompleted), icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('profile.stat.streak'), value: `0 ${t('profile.daysUnit')}`, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const myPoints = booksCompleted * 50 + booksRead * 10;
  const leaderboard = [
    { rank: 1, name: 'Siti Aminah', points: 3450, badge: 'Master' },
    { rank: 2, name: 'Budi Santoso', points: 2890, badge: 'Senior' },
    { rank: 3, name: 'Andi Wijaya', points: 950, badge: 'Junior' },
    { rank: 4, name: 'Rina Melati', points: 820, badge: 'Junior' },
    { rank: 5, name: studentName, points: myPoints, badge: t('profile.levelBeginner'), isMe: true },
  ];

  const badges = [
    { name: t('badge.speedReader'), desc: t('badge.speedReaderDesc'), earned: false },
    { name: t('badge.fictionCollector'), desc: t('badge.fictionCollectorDesc'), earned: false },
    { name: t('badge.bookworm'), desc: t('badge.bookwormDesc'), earned: booksCompleted >= 5 },
    { name: t('badge.smartCritic'), desc: t('badge.smartCriticDesc'), earned: false },
  ];

  const inputCls = "w-full px-4 py-2.5 border border-[#eadfcd] dark:border-[#3a2e27] rounded-lg bg-white dark:bg-[#26201c] text-[#2a160b] dark:text-[#f3e9dc] focus:ring-2 focus:ring-[#d4c3a3] dark:focus:ring-[#5b4636] outline-none transition-colors";

  return (
    <div className="space-y-6 text-[#2a160b] dark:text-[#f3e9dc]">
      <div className="bg-gradient-to-r from-[#8b5e34] to-[#5a351d] rounded-3xl p-8 sm:p-10 text-[#fffaf3] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 bg-white/95 rounded-full p-2 shadow-lg relative">
            <img src={resolveUserAvatar({ avatar: studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=8b5e34&color=fff&size=256` })} onError={handleAvatarError} alt="Profile" className="w-full h-full rounded-full object-cover" />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black shadow-sm">{booksCompleted >= 10 ? 'L2' : 'L1'}</div>
          </div>
        </div>
        <div className="relative z-10 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20"><Shield className="w-4 h-4" /> {t('profile.titleBadge')}</div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif mb-2">{studentName}</h1>
          <p className="text-[#f3e7d3] mb-4 max-w-md">{t('profile.intro')}</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:w-64 h-3 bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.max(5, Math.min(100, booksCompleted * 10))}%` }}></div></div>
            <span className="text-xs font-bold text-[#f3e7d3]">{t('profile.progressToLevel2')}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-[#eadfcd] dark:border-[#3a2e27] overflow-x-auto">
        {[{id:'statistik',label:t('profile.tab.stats')},{id:'leaderboard',label:t('profile.tab.leaderboard')},{id:'pengaturan',label:t('profile.tab.settings')}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#8b5e34] text-[#8b5e34] dark:text-[#d4b07a] dark:border-[#d4b07a]' : 'border-transparent text-[#6b4a2d] dark:text-[#d9c6b2] hover:text-[#2a160b] dark:hover:text-white'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc]">{t('profile.statsTitle')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#211b17] p-5 rounded-2xl shadow-sm border border-[#eadfcd] dark:border-[#3a2e27] flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}><stat.icon className="w-6 h-6" /></div>
                <div><p className="text-xs text-[#6b4a2d] dark:text-[#d9c6b2] font-medium">{stat.label}</p><p className="text-xl font-black text-[#2a160b] dark:text-[#f6eadc]">{stat.value}</p></div>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-bold text-[#2a160b] dark:text-[#f6eadc] pt-4">{t('profile.badgesTitle')}</h2>
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
              <h2 className="text-2xl font-bold text-[#2a160b] dark:text-[#f6eadc] flex items-center gap-2"><Trophy className="w-7 h-7 text-amber-500" /> {t('profile.leaderboardTitle')}</h2>
              <p className="text-[#6b4a2d] dark:text-[#d9c6b2] text-sm mt-1">{t('profile.leaderboardDesc')}</p>
            </div>
            <div className="bg-[#f3e7d3] dark:bg-[#332823] text-[#8b5e34] dark:text-[#e4d2bb] px-4 py-2 rounded-xl font-bold text-sm">{t('profile.yourRank')} #{leaderboard.find(l => l.isMe)?.rank}</div>
          </div>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div key={user.rank} className={`flex items-center p-4 rounded-2xl transition-colors ${user.isMe ? 'bg-[#8b5e34] text-white shadow-md' : 'bg-[#f7f1e7] dark:bg-[#26201c] hover:bg-[#f1e6d6] dark:hover:bg-[#2f2722]'}`}>
                <div className={`w-8 font-black text-lg text-center ${user.isMe ? 'text-white' : user.rank <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-[#8a6d1c] dark:text-[#d4b07a]'}`}>#{user.rank}</div>
                <div className="w-10 h-10 ml-4 rounded-full bg-white shrink-0 shadow-sm overflow-hidden"><img src={resolveUserAvatar({ avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8b5e34&color=fff` })} onError={handleAvatarError} alt={user.name} /></div>
                <div className="ml-4 flex-1"><h4 className={`font-bold text-sm ${user.isMe ? 'text-white' : 'text-[#2a160b] dark:text-[#f6eadc]'}`}>{user.name} {user.isMe && t('profile.you')}</h4><p className={`text-xs ${user.isMe ? 'text-[#f3e7d3]' : 'text-[#6b4a2d] dark:text-[#d9c6b2]'}`}>{user.badge}</p></div>
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
              {showSuccess && (<div className="mb-6 p-4 bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /><p className="text-sm font-bold">{toastMsg}</p></div>)}
              {activeSettingsTab === 'profil' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">{t('settings.profileInfo')}</h2>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-[#f3e7d3] dark:bg-[#332823] border-2 border-[#eadfcd] dark:border-[#3a2e27] rounded-full flex items-center justify-center overflow-hidden"><img src={resolveUserAvatar({ avatar: editAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || 'Siswa')}&background=8b5e34&color=fff&size=256` })} onError={handleAvatarError} alt="Profile" className="w-full h-full object-cover" /></div>
                      <div>
                        <input type="file" id="avatarUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <button type="button" onClick={() => document.getElementById('avatarUpload')?.click()} className="flex items-center gap-2 px-4 py-2 border border-[#eadfcd] dark:border-[#3a2e27] rounded-lg text-sm font-medium hover:bg-[#f7f1e7] dark:hover:bg-[#26201c] transition-colors"><ImageIcon className="w-4 h-4" /> {t('settings.changePhoto')}</button>
                        {editAvatar && (<button type="button" onClick={() => setEditAvatar('')} className="text-xs text-red-600 dark:text-red-400 mt-2 hover:underline block text-left">{t('settings.removePhoto')}</button>)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.fullName')}</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} /></div>
                      <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.publicEmail')}</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputCls} /></div>
                    </div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.bio')}</label><textarea rows={3} className={inputCls} defaultValue={t('settings.bioDefault')}></textarea></div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm disabled:opacity-70"><Save className="w-4 h-4" /> {t('settings.saveChanges')}</button></div>
                  </form>
                </>
              )}
              {activeSettingsTab === 'keamanan' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">{t('settings.accountSecurity')}</h2>
                  <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); flashSuccess(lang === 'en' ? 'Student password change is not available yet.' : 'Ubah kata sandi siswa belum tersedia.');}}>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.currentPassword')}</label><input type="password" placeholder={t('settings.currentPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.newPassword')}</label><input type="password" placeholder={t('settings.newPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                    <div><label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.confirmNewPassword')}</label><input type="password" placeholder={t('settings.confirmNewPasswordPlaceholder')} className={inputCls + ' md:w-2/3'} /></div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> {t('settings.updateSecurity')}</button></div>
                  </form>
                </>
              )}
              {activeSettingsTab === 'notifikasi' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">{t('settings.notificationPrefs')}</h2>
                  <div className="space-y-4">
                    {[t('settings.notif1'),t('settings.notif2'),t('settings.notif3'),t('settings.notif4')].map((item,i)=>(
                      <div key={i} className="flex items-start justify-between p-4 bg-[#f7f1e7] dark:bg-[#26201c] border border-[#eadfcd] dark:border-[#3a2e27] rounded-xl"><div><p className="font-bold text-[#2a160b] dark:text-[#f6eadc] mb-1">{item}</p><p className="text-sm text-[#6b4a2d] dark:text-[#d9c6b2]">{t('settings.notifHint')}</p></div><label className="relative inline-flex items-center cursor-pointer mt-1"><input type="checkbox" defaultChecked={i<2} className="sr-only peer" /><div className="w-11 h-6 bg-[#d8c3a6] dark:bg-[#4a3a31] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b5e34]"></div></label></div>
                    ))}
                    <div className="pt-6 mt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="button" onClick={() => flashSuccess()} className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> {t('settings.savePrefs')}</button></div>
                  </div>
                </>
              )}
              {activeSettingsTab === 'regional' && (
                <>
                  <h2 className="text-lg font-bold text-[#2a160b] dark:text-[#f6eadc] mb-6">{t('settings.regionalTitle')}</h2>
                  <form className="space-y-6" onSubmit={handleSaveRegional}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.appLanguage')}</label>
                        <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value === 'en' ? 'en' : 'id')} className={inputCls}>
                          <option value="id">{t('settings.langId')}</option>
                          <option value="en">{t('settings.langEn')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#3a2012] dark:text-[#e8d8c4] mb-2">{t('settings.timezone')}</label>
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                          <option value="WIB">WIB (UTC+7)</option>
                          <option value="WITA">WITA (UTC+8)</option>
                          <option value="WIT">WIT (UTC+9)</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-[#eadfcd] dark:border-[#3a2e27] flex justify-end"><button type="submit" className="flex items-center gap-2 bg-[#8b5e34] text-white px-6 py-2.5 rounded-lg hover:bg-[#734c2a] transition-colors font-bold shadow-sm"><Save className="w-4 h-4" /> {t('settings.saveSettings')}</button></div>
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
