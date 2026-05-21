import { useState, useEffect } from 'react';
import { userApi } from '../../api/endpoints';
import { Users } from 'lucide-react';
import type { User } from '../../types';

const roleStyles: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  staff: 'bg-blue-50 text-blue-700 border-blue-200',
  student: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getAll()
      .then(res => setUsers(res.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <Users size={20} />
        </div>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle"><span className="font-semibold text-gray-700">{users.length}</span> registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-header">
              <tr><th>Name</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody className="table-body">
              {users.map(u => (
                <tr key={u.user_id || u.id}>
                  <td className="font-medium text-gray-900">{u.name}</td>
                  <td className="text-gray-600">{u.email}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleStyles[u.role] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
