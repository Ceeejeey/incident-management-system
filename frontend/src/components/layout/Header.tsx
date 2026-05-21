import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/80 px-5 md:px-7 lg:px-8 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 md:hidden">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Incident Management
          </h1>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Campus Safety Platform
          </p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />
          <button
            onClick={handleSignOut}
            className="btn-ghost text-xs px-2.5 py-1.5 text-gray-400 hover:text-danger"
            title="Sign Out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
