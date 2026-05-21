import { useState, useEffect } from 'react';
import { feedbackApi } from '../../api/endpoints';
import { Star, MessageSquare } from 'lucide-react';
import type { Feedback } from '../../types';

function Stars({ rating }: { rating: number }) {
  return <span className="text-yellow-500 tracking-wider">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function AdminViewFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackApi.getAll()
      .then(res => setFeedbacks(res.feedbacks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="page-title">User Feedback</h1>
          <p className="page-subtitle"><span className="font-semibold text-gray-700">{feedbacks.length}</span> feedback submission{feedbacks.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="table-header">
                <tr><th>User</th><th>Incident</th><th>Rating</th><th>Comments</th><th>Date</th></tr>
              </thead>
              <tbody className="table-body">
                {feedbacks.map(f => (
                  <tr key={f.feedback_id}>
                    <td className="font-medium text-gray-900">{f.user_name}</td>
                    <td className="text-gray-600 max-w-[220px] truncate">{f.incident_description}</td>
                    <td><Stars rating={f.rating} /></td>
                    <td className="text-gray-600 max-w-[220px] truncate">{f.comments || <span className="text-gray-400 italic">No comment</span>}</td>
                    <td className="text-gray-500 text-sm whitespace-nowrap">{new Date(f.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
