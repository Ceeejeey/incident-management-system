import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, AlertTriangle, Users, Star, ArrowRight,
  Activity, ShieldCheck, Clock, ExternalLink
} from 'lucide-react';
import { incidentApi, userApi, feedbackApi } from '../../api/endpoints';
import type { Incident } from '../../types';

const navLinks = [
  { label: 'Review Incidents', path: '/admin/review-incidents', desc: 'Approve and assign incoming reports', icon: ClipboardList, color: 'from-amber-500 to-orange-600' },
  { label: 'Track Incidents', path: '/admin/trackIncidents', desc: 'Monitor all incidents across campus', icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  { label: 'User Management', path: '/user-management', desc: 'Manage students, staff, and admins', icon: Users, color: 'from-blue-500 to-indigo-600' },
  { label: 'View Feedback', path: '/admin/feedback', desc: 'Review user ratings and comments', icon: Star, color: 'from-purple-500 to-violet-600' },
];

const severityColors: Record<string, string> = {
  high: 'badge-severity-high',
  medium: 'badge-severity-medium',
  low: 'badge-severity-low',
};

const statusColors: Record<string, string> = {
  pending: 'badge-pending',
  open: 'badge-pending',
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ incidents: 0, pending: 0, users: 0, feedbacks: 0 });
  const [recent, setRecent] = useState<Incident[]>([]);
  const [dailyResolved, setDailyResolved] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    Promise.all([
      incidentApi.getAllIncidents().then(r => r.incidents).catch<Incident[]>(() => []),
      incidentApi.getPending().then(r => r.incidentReports.length).catch(() => 0),
      userApi.getAll().then(r => r.users.length).catch(() => 0),
      feedbackApi.getAll().then(r => r.feedbacks.length).catch(() => 0),
      incidentApi.getResolvedDaily().catch(() => []),
    ]).then(([incidents, pending, users, feedbacks, resolved]) => {
      setStats({
        incidents: incidents.length,
        pending,
        users,
        feedbacks,
      });
      setRecent(incidents.slice(0, 5));
      setDailyResolved(resolved);
    });
  }, []);

  const statCards = [
    { label: 'Total Incidents', value: stats.incidents, icon: Activity, color: 'from-blue-500 to-indigo-600' },
    { label: 'Pending Review', value: stats.pending, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
    { label: 'Active Users', value: stats.users, icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
    { label: 'Feedback Entries', value: stats.feedbacks, icon: Star, color: 'from-purple-500 to-violet-600' },
  ];

  const maxResolved = Math.max(...dailyResolved.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            Recent Incidents
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No incidents reported yet</p>
          ) : (
            <div className="space-y-2">
              {recent.map(inc => (
                <div key={inc.incident_id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-secondary transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{inc.title}</p>
                    <p className="text-xs text-gray-400">{inc.reported_by_name || 'Unknown'} &middot; {new Date(inc.date_reported).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={statusColors[inc.status] || 'badge-pending'}>{inc.status}</span>
                    <span className={severityColors[inc.severity] || 'badge-severity-medium'}>{inc.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/trackIncidents" className="mt-3 text-xs text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
            View all incidents <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            Resolved (Last 7 Days)
          </h2>
          {dailyResolved.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No resolved data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-32 pt-2">
              {dailyResolved.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{d.count}</span>
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary-500 to-primary-300 transition-all duration-300"
                    style={{ height: `${(d.count / maxResolved) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                  />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">
                    {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-4 text-base">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {navLinks.map(link => {
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
