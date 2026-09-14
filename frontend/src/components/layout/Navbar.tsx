import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronDown,
  Menu,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DynamicGreeting } from '../common/DynamicGreeting';
import { getFileUrl } from '../../utils/fileUtils';

interface NavbarProps {
  title?: string;
  onOpenNotifications?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Elite Invitation Dashboard',
  onOpenNotifications,
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount, soundEnabled, toggleSound } = useNotifications();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isChairman = user?.role === 'CHAIRMAN';
  const profilePath = isChairman ? '/chairman/profile' : '/management/profile';
  const settingsPath = isChairman ? '/chairman/settings' : '/management/settings';

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-3 flex items-center justify-between shadow-xs transition-all">
      {/* Title & Greeting Section */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Menu Hamburger Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            <span className="truncate">{title}</span>
            {isChairman && (
              <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-brand-200/60 hidden sm:inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Chairman Portal
              </span>
            )}
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
            <DynamicGreeting name={user?.fullName || ''} isChairman={isChairman} />
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Audio Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
            soundEnabled
              ? 'text-brand-700 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/60'
              : 'text-slate-400 bg-slate-100 hover:bg-slate-200/60'
          }`}
          title={soundEnabled ? 'Notification Sound: ON' : 'Notification Sound: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <VolumeX className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-brand-700 hover:bg-slate-100/80 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100/80 border border-slate-200/60 transition-all cursor-pointer"
          >
            {user?.profilePhoto ? (
              <img
                src={getFileUrl(user.profilePhoto)}
                alt={user.fullName}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full object-cover ring-2 ring-brand-600/20"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                {user?.fullName}
              </div>
              <div className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">
                {isChairman ? 'Chairman' : user?.role?.toLowerCase() + ' Member'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
              </div>

              <Link
                to={profilePath}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
              >
                <UserIcon className="w-4 h-4" /> Profile Details
              </Link>

              <Link
                to={settingsPath}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-700 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" /> System Settings
              </Link>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
