import { useState, type FormEvent } from 'react';
import { authApi } from '../../api/endpoints';
import { Key, Save, Lock } from 'lucide-react';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (newPassword !== confirmPassword) { setMsg({ text: 'Passwords do not match', type: 'error' }); return; }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setMsg({ text: 'Password updated successfully', type: 'success' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Failed to update', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-md">
          <Key size={20} />
        </div>
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      {msg.text && <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field pl-9" />
          </div>
        </div>
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field pl-9" placeholder="Min. 6 characters" />
          </div>
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-9" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          <Save size={15} /> {loading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
