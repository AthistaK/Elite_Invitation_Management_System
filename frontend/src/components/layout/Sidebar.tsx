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
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
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

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-brand-700/30">
            E
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide leading-none">EIMS Portal</h2>
            <p className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase mt-1">
              {isChairman ? 'Executive Control' : 'Authorized Member'}
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
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
      <div className="p-3.5 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block shrink-0">{sidebarContent}</div>

      {/* Mobile Backdrop & Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
