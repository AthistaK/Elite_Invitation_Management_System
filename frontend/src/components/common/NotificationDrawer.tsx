import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCheck, Bell, Calendar, UserCheck, Mail, ShieldAlert, Lock, Volume2, VolumeX } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, soundEnabled, toggleSound, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isChairman = user?.role === 'CHAIRMAN';

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    onClose();
    if (n.relatedEntity === 'Invitation' && n.relatedEntityId) {
      const targetUrl = isChairman
        ? `/chairman/invitations?invitationId=${n.relatedEntityId}`
        : `/management/invitations?invitationId=${n.relatedEntityId}`;
      navigate(targetUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MANAGEMENT_REGISTRATION':
        return <UserCheck className="w-5 h-5 text-amber-600" />;
      case 'MEMBER_APPROVAL':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'MEMBER_REJECTION':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'INVITATION_UPLOAD':
        return <Mail className="w-5 h-5 text-brand-600" />;
      case 'INVITATION_ACCEPTED':
        return <Mail className="w-5 h-5 text-emerald-600" />;
      case 'INVITATION_REJECTED':
        return <Mail className="w-5 h-5 text-rose-600" />;
      case 'REMINDER_DUE':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  Notifications
                </h3>
                <p className="text-[10px] sm:text-[11px] text-brand-700 font-semibold flex items-center gap-1 mt-0.5 truncate">
                  <Lock className="w-3 h-3 text-brand-600 shrink-0" />
                  Private Alert Feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title={soundEnabled ? 'Notification Sound: ON' : 'Notification Sound: OFF'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:bg-brand-50 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">No Private Alerts</h4>
                <p className="text-xs text-slate-400 mt-1">You're all caught up. No recent alerts for your account.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-white border-slate-200/80 text-slate-600'
                      : 'bg-brand-50/40 border-brand-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/60 shrink-0 shadow-2xs">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Direct Alert
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
