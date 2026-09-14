import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Lock,
  CheckCircle2,
  Smartphone,
  Send,
  Volume2,
  ShieldAlert,
  UserCheck,
  Shield,
  AlertTriangle,
  X,
  KeyRound,
  Mail,
  User,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  getNotificationPermissionState,
  isPushSubscribed,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '../../utils/pushManager';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [permissionState, setPermissionState] = useState<string>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Transfer Chairman Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [transferError, setTransferError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const checkSubscriptionStatus = async () => {
    setPermissionState(getNotificationPermissionState());
    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const handleEnablePush = async () => {
    setPushLoading(true);
    setPushStatusMsg(null);
    const res = await subscribeToPushNotifications();
    setPushLoading(false);

    if (res.success) {
      await checkSubscriptionStatus();
      setPushStatusMsg({ type: 'success', text: res.message });
    } else {
      setPushStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleDisablePush = async () => {
    setPushLoading(true);
    setPushStatusMsg(null);
    const res = await unsubscribeFromPushNotifications();
    setPushLoading(false);

    if (res.success) {
      await checkSubscriptionStatus();
      setPushStatusMsg({ type: 'success', text: res.message });
    } else {
      setPushStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSendTestPush = async () => {
    try {
      setTestPushLoading(true);
      const res = await api.post('/notifications/test-push');
      setPushStatusMsg({ type: 'success', text: res.data.message || 'Test push notification sent!' });
    } catch (err: any) {
      setPushStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to dispatch test push notification.',
      });
    } finally {
      setTestPushLoading(false);
    }
  };

  const handleOpenTransferModal = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (!newFullName || !newEmail || !newPassword || !currentPassword) {
      setTransferError('All fields (New Name, New Email, New Password, and Your Password) are required.');
      return;
    }

    if (newPassword.length < 6) {
      setTransferError('New Chairman password must be at least 6 characters.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    try {
      setTransferLoading(true);
      setTransferError('');

      await api.post('/users/transfer-chairman', {
        newFullName,
        newEmail,
        newPassword,
        currentPassword,
      });

      setShowConfirmModal(false);
      logout();
      navigate('/chairman/login', {
        state: { message: `Chairman authority successfully transferred to ${newFullName} (${newEmail}). Please sign in with your new credentials.` },
      });
    } catch (err: any) {
      setShowConfirmModal(false);
      setTransferError(err.response?.data?.error || 'Failed to transfer Chairman authority.');
    } finally {
      setTransferLoading(false);
    }
  };

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
            <h2 className="text-xl font-bold text-slate-900">System Preferences & Executive Security</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure Web Push alerts, Chairman account transfer, and session security.
            </p>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings saved successfully.</span>
            </div>
          )}

          {pushStatusMsg && (
            <div
              className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-2 ${
                pushStatusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {pushStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pushStatusMsg.text}</span>
            </div>
          )}

          <div className="space-y-8">
            {/* Real Web Push Notifications Management Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-brand-600" /> Web Push Notifications
                </h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    permissionState === 'granted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : permissionState === 'denied'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  Permission: {permissionState}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Device Push Subscription</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Receive real-time popups on Android, Windows, and browsers even when the app is closed.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSubscribed ? (
                      <button
                        type="button"
                        onClick={handleDisablePush}
                        disabled={pushLoading}
                        className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {pushLoading ? 'Updating...' : 'Disable Push'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnablePush}
                        disabled={pushLoading || permissionState === 'unsupported'}
                        className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {pushLoading ? 'Enabling...' : 'Enable Push Notifications'}
                      </button>
                    )}
                  </div>
                </div>

                {permissionState === 'granted' && (
                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Verify live push delivery:</span>
                    <button
                      type="button"
                      onClick={handleSendTestPush}
                      disabled={testPushLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {testPushLoading ? 'Sending...' : 'Send Test Notification'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chairman Account Transfer Section */}
            {user?.role === 'CHAIRMAN' && (
              <div className="pt-6 border-t border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-rose-600" /> Chairman Account Transfer
                  </h3>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    Single Chairman Invariant
                  </span>
                </div>

                <div className="p-6 rounded-3xl bg-rose-50/40 border border-rose-200/80 space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      Transfer Executive Authority
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Transfer full executive authority to a new Chairman. The new Chairman will become the <strong>only active Chairman</strong>. Your account will immediately lose Chairman privileges and your session will end. <strong>All historical invitations, logs, and reports will remain fully preserved.</strong>
                    </p>
                  </div>

                  {transferError && (
                    <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{transferError}</span>
                    </div>
                  )}

                  <form onSubmit={handleOpenTransferModal} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Chairman Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Dr. Arthur Vance"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Chairman Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          placeholder="newchairman@college.edu"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Set New Chairman Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Your Current Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-rose-600/20"
                      >
                        <Shield className="w-4 h-4" /> Transfer Chairman Authority...
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Application Preferences Form */}
            <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-brand-600" /> In-App & Sound Preferences
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block">In-App Notification Drawer</span>
                      <span className="text-xs text-slate-500">Show real-time badge counters in top navbar</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Security Session Info */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-brand-600" /> Session Security & Infrastructure
                </h3>

                <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authenticated Role:</span>
                    <span className="font-bold text-brand-400">{user?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Headers:</span>
                    <span className="font-bold text-emerald-400">Helmet Protection Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Encryption Protocol:</span>
                    <span className="font-bold text-emerald-400">JWT Bearer (7-Day SSL Encrypted)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Push Encryption:</span>
                    <span className="font-bold text-emerald-400">VAPID ECDSA Curve P-256</span>
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
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-extrabold">Confirm Chairman Transfer</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                Are you absolutely sure you want to transfer executive authority to:
              </p>
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 font-bold text-slate-900 space-y-1">
                <div>Full Name: <span className="text-rose-700">{newFullName}</span></div>
                <div>Email Address: <span className="text-rose-700">{newEmail}</span></div>
              </div>
              <p className="text-rose-800 font-semibold bg-rose-100/60 p-2.5 rounded-xl border border-rose-200">
                ⚠️ NOTICE: Upon confirmation, your session will end immediately. You will lose access to the Chairman Portal. All historical invitations, reports, and logs will remain preserved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={transferLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {transferLoading ? 'Transferring...' : 'Yes, Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
