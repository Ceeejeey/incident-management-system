import { useState, useEffect, type FormEvent } from 'react';
import { feedbackApi } from '../../api/endpoints';
import { Star, Send } from 'lucide-react';
import type { Incident } from '../../types';

export default function FeedbackForm() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentId, setIncidentId] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackApi.getUserIncidents()
      .then(res => setIncidents(res.incidents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!incidentId || !rating) return;
    try {
      await feedbackApi.submit({ incident_id: Number(incidentId), rating, comments });
      setMsg({ text: 'Feedback submitted successfully!', type: 'success' });
      setIncidentId(''); setRating(0); setComments('');
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Submission failed', type: 'error' });
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md">
          <Star size={20} />
        </div>
        <div>
          <h1 className="page-title">Submit Feedback</h1>
          <p className="page-subtitle">Rate how your incident was handled</p>
        </div>
      </div>

      {msg.text && <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>{msg.text}</div>}

      {incidents.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 font-medium">No incidents to review</p>
          <p className="text-gray-400 text-sm mt-1">You can provide feedback on resolved incidents you've reported.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Incident</label>
            <select value={incidentId} onChange={e => setIncidentId(e.target.value)} required className="select-field">
              <option value="">Select an incident...</option>
              {incidents.map(i => <option key={i.incident_id} value={i.incident_id}>{i.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-xl text-lg font-bold transition-all ${rating >= n ? 'bg-yellow-400 text-white scale-110 shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Comments (optional)</label>
            <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} className="textarea-field" placeholder="Share your thoughts on how the incident was handled..." />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5"><Send size={15} /> Submit Feedback</button>
        </form>
      )}
    </div>
  );
}
