import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/endpoints';
import { Bell } from 'lucide-react';
import type { Notification } from '../../types';

export default function StaffNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.getStaff()
      .then(res => setNotifications(res.notifications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Updates about your assigned incidents</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">You'll be notified when new incidents are assigned.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.notification_id} className="card !py-3.5 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-900">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{new Date(n.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
