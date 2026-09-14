import React, { useState } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Invitation } from '../../types';
import { api } from '../../services/api';

interface ReminderModalProps {
  invitation: Invitation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ invitation, isOpen, onClose, onSuccess }) => {
  const [reminderDatetime, setReminderDatetime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !invitation) return null;

  const setPresetReminder = (daysBefore: number | 'now') => {
    if (daysBefore === 'now') {
      const now = new Date();
      // Add 2 seconds for instantaneous testing
      now.setSeconds(now.getSeconds() + 2);
      const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setReminderDatetime(isoLocal);
      return;
    }

    const eventDate = new Date(invitation.date);
    eventDate.setDate(eventDate.getDate() - daysBefore);
    const isoLocal = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setReminderDatetime(isoLocal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!reminderDatetime) {
      setError('Please select a reminder date and time.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/reminders', {
        invitationId: invitation.id,
        reminderDatetime,
      });

      setSuccessMsg('Reminder scheduled successfully! The notification system will alert you when due.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Set Event Reminder</h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{invitation.organizationFamilyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quick Timer Presets
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPresetReminder(7)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold transition-colors text-left"
              >
                📅 7 Days Before
              </button>
              <button
                type="button"
                onClick={() => setPresetReminder(3)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold transition-colors text-left"
              >
                📅 3 Days Before
              </button>
              <button
                type="button"
                onClick={() => setPresetReminder(1)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-semibold transition-colors text-left"
              >
                ⏰ 1 Day Before
              </button>
              <button
                type="button"
                onClick={() => setPresetReminder('now')}
                className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors text-left flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Immediate Test
              </button>
            </div>
          </div>

          {/* Custom Date Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reminder Date & Time *
            </label>
            <input
              type="datetime-local"
              value={reminderDatetime}
              onChange={(e) => setReminderDatetime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
