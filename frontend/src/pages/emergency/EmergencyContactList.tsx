import { useState, useEffect } from 'react';
import { emergencyApi } from '../../api/endpoints';
import { Phone, ChevronDown, ChevronRight } from 'lucide-react';
import type { EmergencyContact } from '../../types';

export default function EmergencyContactList() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    emergencyApi.getContacts()
      .then(res => setContacts(res.contacts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i: number) => {
    setExpanded(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
          <Phone size={20} />
        </div>
        <div>
          <h1 className="page-title">University Contacts</h1>
          <p className="page-subtitle">Official university emergency contacts</p>
        </div>
      </div>

      <div className="space-y-2">
        {contacts.map((c, i) => (
          <div key={i} className="card !p-0 overflow-hidden">
            <button onClick={() => toggle(i)} className="w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-surface-secondary transition-colors">
              <span className="font-medium text-gray-900">{c.role}</span>
              {expanded.has(i) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-300" />}
            </button>
            {expanded.has(i) && (
              <div className="px-4 pb-3.5 pt-0 text-sm text-gray-600 space-y-1.5 border-t border-gray-100 ml-4">
                <p><span className="font-medium text-gray-700">Address:</span> {c.address}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {c.email}</p>
                <p><span className="font-medium text-gray-700">Office:</span> {c.office}</p>
                <p><span className="font-medium text-gray-700">Fax:</span> {c.fax}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
