import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ClipboardList, AlertTriangle, Users,
  MessageSquare, Bell, Key, FileText, MapPin,
  Star, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems: Record<string, { label: string; path: string; icon: React.ReactNode }[]> = {
  admin: [
    { label: 'Dashboard', path: '/dashboards/admin_dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Review Incidents', path: '/admin/review-incidents', icon: <ClipboardList size={18} /> },
    { label: 'Track Incidents', path: '/admin/trackIncidents', icon: <AlertTriangle size={18} /> },
    { label: 'User Management', path: '/user-management', icon: <Users size={18} /> },
    { label: 'Feedback', path: '/admin/feedback', icon: <Star size={18} /> },
    { label: 'Change Password', path: '/change-password', icon: <Key size={18} /> },
  ],
  staff: [
    { label: 'Dashboard', path: '/dashboards/staff_dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Assigned Incidents', path: '/staff/assigned-incidents', icon: <ClipboardList size={18} /> },
    { label: 'My Reports', path: '/staff/incidents', icon: <FileText size={18} /> },
    { label: 'Communications', path: '/communication/staff_communication', icon: <MessageSquare size={18} /> },
    { label: 'Notifications', path: '/staff/notifications', icon: <Bell size={18} /> },
    { label: 'Feedback', path: '/feedback', icon: <Star size={18} /> },
    { label: 'Change Password', path: '/change-password', icon: <Key size={18} /> },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboards/student_dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Report Incident', path: '/incident/report', icon: <AlertTriangle size={18} /> },
    { label: 'My Incidents', path: '/student/incidents', icon: <FileText size={18} /> },
    { label: 'Emergency Contacts', path: '/emergencyContacts', icon: <MapPin size={18} /> },
    { label: 'Notifications', path: '/student/notifications', icon: <Bell size={18} /> },
    { label: 'Feedback', path: '/feedback', icon: <Star size={18} /> },
    { label: 'Change Password', path: '/change-password', icon: <Key size={18} /> },
  ],
};

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.25, ease: 'easeOut' } }),
};

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <motion.aside
      variants={sidebarVariants} initial="hidden" animate="visible"
      className={`${collapsed ? 'w-16' : 'w-60'} bg-sidebar text-white min-h-screen flex flex-col shrink-0 transition-all duration-300 max-md:hidden`}
    >
      <div className={`p-4 border-b border-sidebar-divider flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-primary-500/20">
          <ShieldCheck size={16} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="min-w-0 overflow-hidden">
              <h2 className="text-[15px] font-bold tracking-tight text-white whitespace-nowrap">Incident Mgmt</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`p-3 border-b border-sidebar-divider ${collapsed ? 'text-center' : 'flex items-center gap-3'}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`${collapsed ? 'mx-auto' : ''} w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0`}
        >
          {user.name.charAt(0).toUpperCase()}
        </motion.div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user.name}</p>
            <p className="text-[11px] text-sidebar-text capitalize">{user.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div key={item.path} custom={i} variants={itemVariants} initial="hidden" animate="visible">
              <NavLink
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-active text-sidebar-text-active border-l-[3px] border-sidebar-active-border rounded-l-sm'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <motion.span whileHover={{ scale: 1.15 }} className="shrink-0">{item.icon}</motion.span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-divider">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
