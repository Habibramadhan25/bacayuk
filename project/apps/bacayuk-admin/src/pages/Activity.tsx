import { useState, useEffect } from 'react';
import { initialActivity, type ActivityLog } from '../lib/mockData';
import { Activity as ActivityIcon, CheckCircle2, AlertCircle, Info } from 'lucide-react';

function formatDateSafe(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const Activity = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bacayuk_activity');
      const data = saved ? JSON.parse(saved) : [];
      const arr = Array.isArray(data) ? data : [];
      setLogs(arr.length > 0 ? arr : initialActivity);
    } catch {
      setLogs(initialActivity);
    }
  }, []);

  const getIcon = (status: string) => {
    if (status === 'Success') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'Warning') return <AlertCircle className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-serif text-[#183126] dark:text-[#edf7f1]">Log Aktivitas</h1>
        <p className="text-[#567564] dark:text-[#9ec0ad]">Catatan riwayat aktivitas di dalam sistem perpustakaan</p>
      </div>

      <div className="bg-[#f8fbf8] dark:bg-[#15211c] rounded-xl shadow-sm border border-[#d7e3da] dark:border-[#2a3d34] overflow-hidden">
        <div className="divide-y divide-[#d7e3da] dark:divide-[#2a3d34]">
          {logs.map(log => (
            <div key={log.id} className="p-5 hover:bg-[#edf4ef]/70 dark:hover:bg-[#1b2923]/70 transition-colors flex items-start gap-4">
              <div className="mt-0.5">{getIcon(log.status)}</div>
              <div className="flex-1">
                <p className="text-[#183126] dark:text-[#edf7f1]">
                  <span className="font-bold">{log.user}</span> {log.action} <span className="font-medium text-[#355243] dark:text-[#dcebe2]">{log.target}</span>
                </p>
                <p className="text-sm text-[#567564] dark:text-[#9ec0ad] mt-1 flex items-center gap-1">
                  <ActivityIcon className="w-3.5 h-3.5" />
                  {formatDateSafe(log.time)}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
             <div className="p-8 text-center text-[#567564] dark:text-[#9ec0ad]">Belum ada aktivitas yang tercatat.</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Activity;
