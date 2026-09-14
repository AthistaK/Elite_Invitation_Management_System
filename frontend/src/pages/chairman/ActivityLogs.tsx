import React, { useEffect, useState } from 'react';
import { FileText, Search, ShieldAlert, User } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { ActivityLogItem } from '../../types';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      const res = await api.get('/logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <DashboardLayout title="System Activity & Audit Logs">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Audit Trail & Activity Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log recording every authentication, user governance, invitation decision, and system mutation.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search audit trail by action or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Search Logs
            </button>
          </form>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No activity recorded yet</h3>
              <p className="text-xs text-slate-400 mt-1">Audit log database is clean.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-brand-50 text-brand-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-brand-200/60 font-mono">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-800">{log.description}</td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {log.user ? `${log.user.fullName} (${log.user.role})` : 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
