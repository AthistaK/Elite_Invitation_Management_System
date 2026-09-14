import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ContactMessageItem } from '../../types';

export const Contact: React.FC = () => {
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Chairman view contact messages list
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchContactMessages = async () => {
    if (!isChairman) return;
    try {
      setMessagesLoading(true);
      const res = await api.get('/contact');
      setContactMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, [isChairman]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !message) {
      setError('Name, Email, and Message are required.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/contact', { name, email, message });
      setSuccess('Your support message has been sent successfully.');
      setMessage('');
      if (isChairman) fetchContactMessages();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send support message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Contact & Executive Support">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Support Information Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-50 text-brand-700">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Support Email</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">support@eims-governance.edu</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-50 text-brand-700">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Support Phone</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">+1 (555) 019-2831</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-50 text-brand-700">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Office Address</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block mt-0.5">Executive Chairman Secretariat</span>
            </div>
          </div>
        </div>

        {/* Form & Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Message Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Send Support Message</h3>
              <p className="text-xs text-slate-500 mt-1">Submit inquiries directly to the Secretariat inbox.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter your support message or inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-brand-700/20 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Chairman Inbox View */}
          {isChairman ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col">
              <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Received Contact Messages</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Inbound support requests from portal members.</p>
                </div>
                <span className="bg-brand-50 text-brand-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-brand-200">
                  {contactMessages.length}
                </span>
              </div>

              {messagesLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div>
              ) : contactMessages.length === 0 ? (
                <div className="text-center py-16 my-auto">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No support messages received</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{msg.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">{msg.email}</p>
                      <p className="text-slate-700 mt-2 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-2">Secretariat Support Notice</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Messages submitted through this portal are directly dispatched to the Chairman's confidential message inbox. Urgent matters are prioritized automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
