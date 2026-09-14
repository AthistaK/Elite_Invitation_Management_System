import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Upload,
  UserCheck,
  Users,
  BarChart3,
  Bell,
  FileText,
  User,
  MessageSquare,
  Settings,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isChairman = user?.role === 'CHAIRMAN';

  const chairmanNavItems = [
    { label: 'Dashboard', path: '/chairman/dashboard', icon: LayoutDashboard },
    { label: 'Invitations', path: '/chairman/invitations', icon: Mail },
    { label: 'Upload Invitation', path: '/chairman/upload-invitation', icon: Upload },
    { label: 'Pending Requests', path: '/chairman/pending-requests', icon: UserCheck },
    { label: 'User Management', path: '/chairman/users', icon: Users },
    { label: 'Reports', path: '/chairman/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/chairman/notifications', icon: Bell },
    { label: 'Activity Logs', path: '/chairman/logs', icon: FileText },
    { label: 'Profile', path: '/chairman/profile', icon: User },
    { label: 'Contact', path: '/chairman/contact', icon: MessageSquare },
    { label: 'Settings', path: '/chairman/settings', icon: Settings },
  ];

  const managementNavItems = [
    { label: 'Dashboard', path: '/management/dashboard', icon: LayoutDashboard },
    { label: 'My Invitations', path: '/management/invitations', icon: Mail },
    { label: 'Upload Invitation', path: '/management/upload-invitation', icon: Upload },
    { label: 'Notifications', path: '/management/notifications', icon: Bell },
    { label: 'Profile', path: '/management/profile', icon: User },
    { label: 'Contact', path: '/management/contact', icon: MessageSquare },
    { label: 'Settings', path: '/management/settings', icon: Settings },
  ];

  const navItems = isChairman ? chairmanNavItems : managementNavItems;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-brand-700/30">
          E
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-wide leading-none">EIMS Portal</h2>
          <p className="text-[11px] text-brand-400 font-semibold tracking-wider uppercase mt-1">
            {isChairman ? 'Executive Control' : 'Authorized Member'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-md shadow-brand-700/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Logout Button */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
