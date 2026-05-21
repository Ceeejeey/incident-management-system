import { useState, useEffect } from 'react';
import { incidentApi } from '../../api/endpoints';
import { FileText, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EvidenceFiles from '../../components/common/EvidenceFiles';
import MiniMap from '../../components/common/MiniMap';
import type { IncidentReport } from '../../types';

const statusBadge: Record<string, string> = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', resolved: 'badge-resolved' };

export default function StaffIncidentTracking() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<IncidentReport | null>(null);

  useEffect(() => {
    incidentApi.getReporterIncidents()
      .then(res => setIncidents(res.incidents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="page-title">My Reports</h1>
          <p className="page-subtitle"><span className="font-semibold text-gray-700">{incidents.length}</span> report{incidents.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">You haven't reported any incidents yet.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="table-header">
                <tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Evidence</th></tr>
              </thead>
              <tbody className="table-body">
                {incidents.map(r => (
                  <tr key={r.id} className="cursor-pointer" onClick={() => setDetail(r)}>
                    <td className="font-medium text-gray-900">{r.title}</td>
                    <td><span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{r.category}</span></td>
                    <td className="text-gray-500 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    <td><span className={statusBadge[r.status]}>{r.status}</span></td>
                    <td>{r.evidence && r.evidence !== '[]' ? (
                      <span className="text-primary-500 text-sm">View files</span>
                    ) : <span className="text-gray-400 text-sm">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
      {detail && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setDetail(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{detail.title}</h2>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 items-center">
                <span className={statusBadge[detail.status]}>{detail.status}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{detail.category}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{detail.description}</p>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Evidence</p>
                <EvidenceFiles evidence={detail.evidence} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin size={13} /> Location</p>
                <MiniMap latitude={detail.latitude} longitude={detail.longitude} />
              </div>
              <p className="text-xs text-gray-400">Reported on {new Date(detail.date).toLocaleDateString()}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
