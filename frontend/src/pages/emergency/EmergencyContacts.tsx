import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/endpoints';
import { MapPin, MessageSquare } from 'lucide-react';
import type { StaffMember } from '../../types';

export default function EmergencyContacts() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    userApi.getStaff()
      .then(res => setStaff(res.staff))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
          <MapPin size={20} />
        </div>
        <div>
          <h1 className="page-title">Emergency Contacts</h1>
          <p className="page-subtitle">Contact campus staff for urgent matters</p>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="card text-center py-16"><p className="text-gray-500">No staff contacts available.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {staff.map(s => (
            <div key={s.user_id} className="card flex items-center justify-between !py-3.5 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 text-sm font-bold">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{s.name}</span>
              </div>
              <button onClick={() => navigate(`/communication/chat/student?staffId=${s.user_id}`)}
                className="btn-primary text-xs px-3 py-1.5"><MessageSquare size={13} /> Chat</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
