import React from 'react';
import { Bell, CheckCheck, Lock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  return (
    <DashboardLayout title="System Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Private Notification Feed
              <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-brand-600" /> Strictly Isolated
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized alerts for <strong className="text-slate-800">{user?.fullName}</strong> ({isChairman ? 'Chairman' : 'Management Member'}).
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-brand-200 transition-colors cursor-pointer shrink-0"
            >
              <CheckCheck className="w-4 h-4" /> Mark All as Read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">You're all caught up</h3>
              <p className="text-xs text-slate-400 mt-1">No notifications recorded in your private inbox feed.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-200/80 text-slate-600'
                    : 'bg-brand-50/40 border-brand-200 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                <div className="mt-2 text-[10px] text-brand-600 font-semibold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Direct Account Alert
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
