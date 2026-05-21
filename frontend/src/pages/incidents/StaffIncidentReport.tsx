import { useState, useEffect } from 'react';
import { incidentApi } from '../../api/endpoints';
import {
  ClipboardList, CheckCircle, RotateCcw, X, MapPin,
  Clock, User, Calendar, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EvidenceFiles from '../../components/common/EvidenceFiles';
import MiniMap from '../../components/common/MiniMap';
import type { Incident } from '../../types';

const statusBadge: Record<string, string> = {
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
};
const severityBadge: Record<string, string> = {
  high: 'badge-severity-high',
  medium: 'badge-severity-medium',
  low: 'badge-severity-low',
};

export default function StaffIncidentReport() {
  const [active, setActive] = useState<Incident[]>([]);
  const [resolved, setResolved] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'resolved'>('active');
  const [updateModal, setUpdateModal] = useState<Incident | null>(null);
  const [resolveModal, setResolveModal] = useState<Incident | null>(null);
  const [desc, setDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      incidentApi.getAssigned().then(r => r.incidentReports).catch<Incident[]>(() => []),
      incidentApi.getAssignedResolved().then(r => r.incidentReports).catch<Incident[]>(() => []),
    ]).then(([a, r]) => { setActive(a); setResolved(r); }).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const doUpdate = async () => {
    if (!updateModal) return;
    setActionLoading(true);
    try { await incidentApi.update({ incidentId: updateModal.incident_id, updateDescription: desc }); setUpdateModal(null); setDesc(''); fetch(); } catch { alert('Failed'); } finally { setActionLoading(false); }
  };
  const doResolve = async () => {
    if (!resolveModal) return;
    setActionLoading(true);
    try { await incidentApi.resolve({ incidentId: resolveModal.incident_id, resolveDescription: desc }); setResolveModal(null); setDesc(''); fetch(); } catch { alert('Failed'); } finally { setActionLoading(false); }
  };

  const incidents = tab === 'active' ? active : resolved;

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="page-title">Assigned Incidents</h1>
          <p className="page-subtitle">
            <span className="font-semibold text-blue-600">{active.length}</span> active &middot;
            <span className="font-semibold text-emerald-600 ml-1">{resolved.length}</span> resolved
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-secondary p-1 rounded-xl w-fit border border-gray-200">
        <button
          onClick={() => setTab('active')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'active' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={15} /> Active ({active.length})
        </button>
        <button
          onClick={() => setTab('resolved')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'resolved' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive size={15} /> Resolved ({resolved.length})
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {tab === 'active' ? 'All clear!' : 'No resolved incidents yet'}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {tab === 'active'
              ? 'No incidents currently assigned to you.'
              : 'Completed incidents will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {incidents.map(i => (
            <div key={i.incident_id} className="card hover:border-gray-200 transition-all duration-200 overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                    tab === 'resolved' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    #{i.incident_id}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{i.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><User size={11} /> {i.reporter_name}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(i.date_reported).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={severityBadge[i.severity]}>{i.severity}</span>
                  <span className={statusBadge[i.status]}>{i.status}</span>
                </div>
              </div>

              {i.category && (
                <span className="inline-block text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium mb-2">
                  {i.category}
                </span>
              )}

              <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{i.user_description}</p>

              <EvidenceFiles evidence={i.evidence} />

              {tab === 'active' && (
                <div className="mb-3">
                  <MiniMap latitude={i.latitude} longitude={i.longitude} />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>Updated {new Date(i.last_updated).toLocaleDateString()}</span>
                </div>
                {tab === 'active' ? (
                  <div className="flex gap-2">
                    <button onClick={() => { setUpdateModal(i); setDesc(''); }} className="btn-secondary text-xs px-3 py-1.5">
                      <RotateCcw size={13} /> Update
                    </button>
                    <button onClick={() => { setResolveModal(i); setDesc(''); }} className="btn-primary text-xs px-3 py-1.5">
                      <CheckCircle size={13} /> Resolve
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle size={14} />
                    Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
      {updateModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Update Incident</h2>
              <button onClick={() => setUpdateModal(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">#{updateModal.incident_id} &middot; {updateModal.title}</p>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} className="textarea-field mb-4" placeholder="Describe the progress made..." />
            <div className="flex gap-3 justify-end"><button onClick={() => setUpdateModal(null)} className="btn-secondary">Cancel</button><button onClick={doUpdate} disabled={actionLoading || !desc} className="btn-primary">{actionLoading ? 'Saving...' : 'Save Update'}</button></div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {resolveModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setResolveModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Resolve Incident</h2>
              <button onClick={() => setResolveModal(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">#{resolveModal.incident_id} &middot; {resolveModal.title}</p>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} className="textarea-field mb-4" placeholder="Describe how this incident was resolved..." />
            <div className="flex gap-3 justify-end"><button onClick={() => setResolveModal(null)} className="btn-secondary">Cancel</button><button onClick={doResolve} disabled={actionLoading || !desc} className="btn-danger">{actionLoading ? 'Resolving...' : 'Mark Resolved'}</button></div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
