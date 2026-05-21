import { useState, type FormEvent } from 'react';
import { incidentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, MapPin, Calendar, Upload, Send, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import MapPicker from '../../components/common/MapPicker';

const categories = ['Safety', 'Harassment', 'Property Damage', 'Fire', 'Medical', 'Other'];

export default function IncidentReport() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!category) { setMsg({ text: 'Please select a category', type: 'error' }); return; }
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('description', description);
      fd.append('date', date); fd.append('category', category);
      fd.append('latitude', latitude); fd.append('longitude', longitude);
      if (files) Array.from(files).forEach(f => fd.append('evidence[]', f));
      await incidentApi.report(fd);
      setMsg({ text: 'Incident reported successfully!', type: 'success' });
      setTitle(''); setDescription(''); setCategory(''); setLatitude(''); setLongitude(''); setFiles(null);
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Failed to report', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h1 className="page-title">Report an Incident</h1>
          <p className="page-subtitle">Provide details about what happened</p>
        </div>
      </div>

      {msg.text && <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
            className="input-field" placeholder="Brief title of the incident" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4}
            className="textarea-field" placeholder="Describe what happened in detail..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="input-field pl-9" />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="select-field">
              <option value="">Select...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Location <span className="text-gray-400 font-normal">(click the map to set)</span></label>
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
          />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="relative">
              <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" step="any" placeholder="Latitude" value={latitude}
                onChange={e => setLatitude(e.target.value)} className="input-field pl-8 text-sm" />
            </div>
            <input type="number" step="any" placeholder="Longitude" value={longitude}
              onChange={e => setLongitude(e.target.value)} className="input-field text-sm" />
          </div>
        </div>
        <div>
          <label className="label">Evidence</label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500">{files ? `${files.length} file(s) selected` : 'Upload photos or screenshots'}</span>
            <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} className="hidden" />
          </label>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Submitting...' : 'Submit Report'}
          {!loading && <Send size={16} />}
        </motion.button>
      </form>
    </div>
  );
}
