import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertTriangle, MessageSquare, TrendingUp, UserPlus } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Incident Management</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to={`/dashboards/${user.role}_dashboard`} className="btn-primary">
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/signin" className="btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn-primary">
                <UserPlus size={14} /> Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-8 shadow-xl shadow-primary-500/20">
          <ShieldCheck size={32} className="text-white" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          Safer Campus,<br />
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Together</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-lg mb-10 leading-relaxed">
          A centralized platform for reporting, tracking, and resolving campus incidents.
          Students, staff, and administrators working hand in hand for a safer environment.
        </p>

        {!user && (
          <div className="flex gap-3">
            <Link to="/signup" className="btn-primary px-6 py-2.5 text-base">
              <UserPlus size={18} /> Create Account
            </Link>
            <Link to="/signin" className="btn-secondary px-6 py-2.5 text-base">
              Sign In
            </Link>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full">
          {[
            { icon: AlertTriangle, title: 'Report Incidents', desc: 'Quickly report safety issues, property damage, or any campus incident with location and photo evidence.' },
            { icon: TrendingUp, title: 'Track Progress', desc: 'Follow your report in real-time as it moves through review, assignment, and resolution.' },
            { icon: MessageSquare, title: 'Stay Connected', desc: 'Chat directly with staff and get instant notifications when your incident status changes.' },
          ].map((item, i) => (
            <div key={i} className="card text-left group hover:border-primary-200 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-4">
                <item.icon size={20} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
