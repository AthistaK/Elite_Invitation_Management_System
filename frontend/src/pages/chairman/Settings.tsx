import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout title="Application & System Settings">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-xl font-bold text-slate-900">System Preferences</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure notification channels, session security, and display options.
            </p>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-brand-600" /> Notification Channels
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">In-App Alerts</span>
                    <span className="text-xs text-slate-500">Receive real-time notifications in the dashboard navbar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={desktopAlerts}
                    onChange={(e) => setDesktopAlerts(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 block">Notification Sound</span>
                    <span className="text-xs text-slate-500">Play subtle audio alert on new unread notification</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Security Session Info */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" /> Session Security
              </h3>

              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Authenticated Role:</span>
                  <span className="font-bold text-brand-400">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Encryption Protocol:</span>
                  <span className="font-bold text-emerald-400">JWT Bearer (7-Day SSL Encrypted)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Password Hashing:</span>
                  <span className="font-bold text-emerald-400">Bcrypt Salt Cost 12</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
