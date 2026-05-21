import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ClipboardList, FileText, MessageSquare, Bell, Star, ArrowRight,
  Activity, MessageCircle, Clock, ExternalLink
} from 'lucide-react';
import { incidentApi, notificationApi, chatApi } from '../../api/endpoints';
import type { Incident } from '../../types';

const links = [
  { label: 'Assigned Incidents', path: '/staff/assigned-incidents', desc: 'View and update incidents assigned to you', icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
  { label: 'My Reports', path: '/staff/incidents', desc: 'View incidents you have reported', icon: FileText, color: 'from-emerald-500 to-teal-600' },
  { label: 'Communications', path: '/communication/staff_communication', desc: 'Chat with students', icon: MessageSquare, color: 'from-violet-500 to-purple-600' },
  { label: 'Notifications', path: '/staff/notifications', desc: 'View your notifications', icon: Bell, color: 'from-amber-500 to-orange-600' },
  { label: 'Feedback', path: '/feedback', desc: 'Submit feedback on resolved incidents', icon: Star, color: 'from-rose-500 to-pink-600' },
];

const statusColors: Record<string, string> = {
  pending: 'badge-pending',
  open: 'badge-pending',
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, reports: 0, unreadMessages: 0, unreadNotifs: 0 });
  const [recentAssigned, setRecentAssigned] = useState<Incident[]>([]);

  useEffect(() => {
    Promise.all([
      incidentApi.getAssigned().then(r => r.incidentReports).catch<Incident[]>(() => []),
      incidentApi.getReporterIncidents().then(r => r.incidents.length).catch(() => 0),
      chatApi.getStudentsWithUnread().then(r =>
        r.studentsWithUnreadMessages.reduce((sum: number, s) => sum + s.unread_count, 0)
      ).catch(() => 0),
      notificationApi.getStaffCount().then(r => r.count).catch(() => 0),
    ]).then(([assigned, reports, unreadMessages, unreadNotifs]) => {
      setStats({ assigned: assigned.length, reports, unreadMessages, unreadNotifs });
      setRecentAssigned(assigned.slice(0, 5));
    });
  }, []);

  const statCards = [
    { label: 'Assigned to You', value: stats.assigned, icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
    { label: 'My Reports', value: stats.reports, icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: MessageCircle, color: 'from-violet-500 to-purple-600' },
    { label: 'Notifications', value: stats.unreadNotifs, icon: Bell, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recentAssigned.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            Recently Assigned Incidents
          </h2>
          <div className="space-y-2">
            {recentAssigned.map(inc => (
              <div key={inc.incident_id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-secondary transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{inc.title}</p>
                  <p className="text-xs text-gray-400">
                    {inc.reporter_name || 'Unknown'} &middot; {new Date(inc.date_reported).toLocaleDateString()}
                  </p>
                </div>
                <span className={statusColors[inc.status] || 'badge-pending'}>{inc.status}</span>
              </div>
            ))}
          </div>
          <Link to="/staff/assigned-incidents" className="mt-3 text-xs text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
            View all assigned <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-gray-900 mb-4 text-base">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} className="group card card-hover block">
                <div className="flex items-start gap-4">
                  <div className={`stat-icon bg-gradient-to-br ${link.color} text-white shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{link.label}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
