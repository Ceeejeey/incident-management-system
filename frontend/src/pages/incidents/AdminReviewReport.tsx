import { useState, useEffect } from 'react';
import { incidentApi } from '../../api/endpoints';
import { ClipboardList, CheckCircle, UserCheck, AlertTriangle, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EvidenceFiles from '../../components/common/EvidenceFiles';
import MiniMap from '../../components/common/MiniMap';
import type { IncidentReport, StaffMember } from '../../types';

const statusBadge: Record<string, string> = {
  pending: 'badge-pending',
  'in-progress': 'badge-in-progress',
  resolved: 'badge-resolved',
};

export default function AdminReviewReport() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<IncidentReport | null>(null);
  const [staffId, setStaffId] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [adminDesc, setAdminDesc] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetch = () => {
    setLoading(true);
    incidentApi.getPending()
      .then(res => { setReports(res.incidentReports); setStaff(res.staffMembers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const openAssign = (r: IncidentReport) => {
    setModal(r); setStaffId(''); setSeverity('medium');
    setAdminDesc(''); setLat(String(r.latitude)); setLng(String(r.longitude));
  };

  const handleAssign = async () => {
    if (!modal || !staffId) return;
    setAssigning(true);
    try {
      await incidentApi.assign({
        reportId: modal.id, latitude: Number(lat), longitude: Number(lng),
        staffId: Number(staffId), severity, adminDescription: adminDesc,
      });
      setModal(null); fetch();
    } catch (err) { alert('Assignment failed'); } finally { setAssigning(false); }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="page-title">Review Incidents</h1>
          <p className="page-subtitle"><span className="font-semibold text-amber-600">{reports.length}</span> pending report{reports.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 text-sm mt-1">No pending reports to review.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="table-header">
                <tr><th>Reporter</th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th className="text-right">Action</th></tr>
              </thead>
              <tbody className="table-body">
                {reports.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium text-gray-900">{r.reporter_name}</td>
                    <td className="max-w-[200px] truncate">{r.title}</td>
                    <td><span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{r.category}</span></td>
                    <td className="text-gray-500 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    <td><span className={statusBadge[r.status]}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />{r.status}</span></td>
                    <td className="text-right"><button onClick={() => openAssign(r)} className="btn-primary text-xs px-3 py-1.5"><UserCheck size={13} /> Assign</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
      {modal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Assign Incident</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-surface-secondary rounded-xl mb-5 space-y-2 text-sm">
              <p><span className="font-semibold text-gray-700">Title:</span> {modal.title}</p>
              <p><span className="font-semibold text-gray-700">Reporter:</span> {modal.reporter_name}</p>
              <p><span className="font-semibold text-gray-700">Category:</span> {modal.category}</p>
              <p className="text-gray-600 mt-2">{modal.description}</p>
              <div className="pt-2">
                <EvidenceFiles evidence={modal.evidence} />
              </div>
              <div className="pt-1">
                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin size={13} /> Location</p>
                <MiniMap latitude={modal.latitude} longitude={modal.longitude} />
              </div>
            </div>
            <div className="space-y-4">
              <div><label className="label">Assign to Staff</label><select value={staffId} onChange={e => setStaffId(e.target.value)} className="select-field"><option value="">Select staff...</option>{staff.map(s => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}</select></div>
              <div><label className="label">Severity</label><select value={severity} onChange={e => setSeverity(e.target.value)} className="select-field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              <div><label className="label">Admin Notes</label><textarea value={adminDesc} onChange={e => setAdminDesc(e.target.value)} rows={3} className="textarea-field" placeholder="Additional context for the staff member..." /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Latitude</label><input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="input-field" /></div><div><label className="label">Longitude</label><input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="input-field" /></div></div>
              <div className="flex gap-3 justify-end pt-2"><button onClick={() => setModal(null)} className="btn-secondary">Cancel</button><button onClick={handleAssign} disabled={assigning || !staffId} className="btn-primary">{assigning ? 'Assigning...' : 'Assign Incident'}</button></div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
