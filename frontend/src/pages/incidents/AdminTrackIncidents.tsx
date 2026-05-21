import { useState, useEffect } from 'react';
import { incidentApi } from '../../api/endpoints';
import { AlertTriangle, Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EvidenceFiles from '../../components/common/EvidenceFiles';
import MiniMap from '../../components/common/MiniMap';
import type { Incident } from '../../types';

const statusBadge: Record<string, string> = { open: 'badge-pending', 'in-progress': 'badge-in-progress', resolved: 'badge-resolved' };
const severityBadge: Record<string, string> = { high: 'badge-severity-high', medium: 'badge-severity-medium', low: 'badge-severity-low' };

export default function AdminTrackIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Incident | null>(null);

  useEffect(() => {
    incidentApi.getAllIncidents()
      .then(res => setIncidents(res.incidents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.reported_by_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h1 className="page-title">Track Incidents</h1>
          <p className="page-subtitle"><span className="font-semibold text-gray-700">{incidents.length}</span> total incidents</p>
        </div>
      </div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 max-w-xs" placeholder="Search incidents..." />
      </div>
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-header">
              <tr><th>ID</th><th>Title</th><th>Reported By</th><th>Assigned To</th><th>Severity</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody className="table-body">
              {filtered.map(i => (
                <tr key={i.incident_id} className="cursor-pointer" onClick={() => setDetail(i)}>
                  <td className="font-mono text-xs text-gray-400">#{i.incident_id}</td>
                  <td className="font-medium text-gray-900 max-w-[200px] truncate">{i.title}</td>
                  <td>{i.reported_by_name || i.reported_by}</td>
                  <td className="text-gray-600">{i.assigned_staff_name || <span className="text-gray-400">Unassigned</span>}</td>
                  <td><span className={severityBadge[i.severity]}>{i.severity}</span></td>
                  <td><span className={statusBadge[i.status]}>{i.status}</span></td>
                  <td className="text-gray-500 text-sm whitespace-nowrap">{i.date_reported}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
      {detail && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setDetail(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Incident #{detail.incident_id}</h2>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className={severityBadge[detail.severity]}>{detail.severity}</span>
                <span className={statusBadge[detail.status]}>{detail.status}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{detail.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {detail.reported_by_name || 'Unknown'} &middot; {detail.date_reported}
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed">{detail.user_description}</p>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Admin Description</p>
                <p className="text-gray-600">{detail.description}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Evidence</p>
                <EvidenceFiles evidence={detail.evidence} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin size={13} /> Location</p>
                <MiniMap latitude={detail.latitude} longitude={detail.longitude} />
              </div>
              <div className="flex gap-4 pt-1 text-xs text-gray-400">
                <span>Assigned to: {detail.assigned_staff_name || 'N/A'}</span>
                <span>Last updated: {detail.last_updated}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
