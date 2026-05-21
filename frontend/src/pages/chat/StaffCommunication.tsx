import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../../api/endpoints';
import { MessageSquare, ChevronRight } from 'lucide-react';
import type { StudentWithUnread } from '../../types';

export default function StaffCommunication() {
  const [students, setStudents] = useState<StudentWithUnread[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    chatApi.getStudentsWithUnread()
      .then(res => setStudents(res.studentsWithUnreadMessages))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="page-title">Communications</h1>
          <p className="page-subtitle">Chat with students about their incidents</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500 font-medium">No unread messages</p>
          <p className="text-gray-400 text-sm mt-1">Messages from students will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <div key={s.student_id} onClick={() => navigate(`/communication/chat/staff/${s.student_id}`)}
              className="card-hover flex items-center justify-between cursor-pointer !py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 text-sm font-bold">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <p className="text-xs text-gray-400">{s.unread_count} unread message{s.unread_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge-in-progress">{s.unread_count}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
