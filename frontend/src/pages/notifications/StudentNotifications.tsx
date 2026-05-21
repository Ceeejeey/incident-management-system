import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/endpoints';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import type { Notification } from '../../types';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    notificationApi.getStudent()
      .then(res => setNotifications(res.notifications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Updates about your incidents</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">You'll be notified when your incidents are updated.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const id = n.id || n.notification_id || 0;
            return (
              <div key={id} className="card !p-0 overflow-hidden">
                <button onClick={() => toggle(id)} className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                    <span className={`text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.message}</span>
                  </div>
                  {expanded.has(id) ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-300 shrink-0" />}
                </button>
                {expanded.has(id) && (
                  <div className="px-4 pb-3.5 pt-0 text-sm text-gray-600 space-y-1 border-t border-gray-100 ml-6">
                    {n.incident_title && <p>Incident: <span className="font-medium text-gray-700">{n.incident_title}</span></p>}
                    {n.staff_name && <p>Staff: <span className="font-medium text-gray-700">{n.staff_name}</span></p>}
                    <p className="text-xs text-gray-400">{new Date(n.created_at || n.timestamp).toLocaleString()}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
