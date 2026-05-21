import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, FileText, MapPin, Bell, Star, ArrowRight,
  Activity, CheckCircle, Clock, ExternalLink
} from 'lucide-react';
import { incidentApi, notificationApi } from '../../api/endpoints';
import type { IncidentReport } from '../../types';

const links = [
  { label: 'Report Incident', path: '/incident/report', desc: 'Submit a new incident report', icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  { label: 'My Incidents', path: '/student/incidents', desc: 'Track your reported incidents', icon: FileText, color: 'from-blue-500 to-indigo-600' },
  { label: 'Emergency Contacts', path: '/emergencyContacts', desc: 'Contact campus staff', icon: MapPin, color: 'from-emerald-500 to-teal-600' },
  { label: 'Notifications', path: '/student/notifications', desc: 'View incident updates', icon: Bell, color: 'from-amber-500 to-orange-600' },
  { label: 'Feedback', path: '/feedback', desc: 'Rate resolved incidents', icon: Star, color: 'from-violet-500 to-purple-600' },
];

const statusColors: Record<string, string> = {
  pending: 'badge-pending',
  open: 'badge-pending',
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ incidents: 0, resolved: 0, unreadNotifs: 0 });
  const [recent, setRecent] = useState<IncidentReport[]>([]);

  useEffect(() => {
    Promise.all([
      incidentApi.getStudentIncidents().then(r => r.incidents).catch<IncidentReport[]>(() => []),
      notificationApi.getStudentCount().then(r => r.count).catch(() => 0),
    ]).then(([incidents, unreadNotifs]) => {
      setStats({
        incidents: incidents.length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        unreadNotifs,
      });
      setRecent(incidents.slice(0, 5));
    });
  }, []);

  const statCards = [
    { label: 'My Incidents', value: stats.incidents, icon: Activity, color: 'from-blue-500 to-indigo-600' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
    { label: 'Notifications', value: stats.unreadNotifs, icon: Bell, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span></p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

      {recent.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            My Recent Reports
          </h2>
          <div className="space-y-2">
            {recent.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-secondary transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.category} &middot; {new Date(r.date).toLocaleDateString()}</p>
                </div>
                <span className={statusColors[r.status] || 'badge-pending'}>{r.status}</span>
              </div>
            ))}
          </div>
          <Link to="/student/incidents" className="mt-3 text-xs text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
            View all incidents <ArrowRight size={12} />
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
