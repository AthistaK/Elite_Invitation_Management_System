import React, { useEffect, useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, FileCode, CheckCircle2, Clock, Mail, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api, API_BASE_URL } from '../../services/api';
import { DashboardStats } from '../../types';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportFilter, setExportFilter] = useState('all');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch report stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const token = localStorage.getItem('eims_token');
    const downloadUrl = `${API_BASE_URL}/exports?format=${format}&filter=${exportFilter}&token=${token}`;

    // Trigger download using Axios blob response to attach Auth bearer header
    api.get(`/exports?format=${format}&filter=${exportFilter}`, { responseType: 'blob' })
      .then((res) => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eims_invitations_${exportFilter}_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('Export download error:', err));
  };

  return (
    <DashboardLayout title="Executive Reports & Data Export">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time invitation breakdown statistics and export data generator.
          </p>
        </div>

        {/* Real DB Analytics Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Invitations</span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">{stats?.totalInvitations ?? 0}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Pending</span>
            <span className="text-3xl font-extrabold text-amber-700 block mt-1">{stats?.pendingInvitations ?? 0}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Accepted</span>
            <span className="text-3xl font-extrabold text-emerald-700 block mt-1">{stats?.acceptedInvitations ?? 0}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Important Priority</span>
            <span className="text-3xl font-extrabold text-rose-700 block mt-1">{stats?.importantInvitations ?? 0}</span>
          </div>
        </div>

        {/* Data Distribution Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown Progress Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Category Distribution</h3>
            {stats?.categoryBreakdown ? (
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                  const total = stats.totalInvitations || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">Loading distribution...</div>
            )}
          </div>

          {/* Role Breakdown Progress Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Role Distribution</h3>
            {stats?.roleBreakdown ? (
              <div className="space-y-4">
                {Object.entries(stats.roleBreakdown).map(([role, count]) => {
                  const total = stats.totalInvitations || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{role} Role</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">Loading distribution...</div>
            )}
          </div>
        </div>

        {/* Multi-Format Export Center */}
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-2xl bg-brand-700/30 text-brand-300 border border-brand-500/30">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Multi-Format Data Exporter</h3>
              <p className="text-xs text-slate-300">Generate and download official CSV, Excel, or PDF report files.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">
                Select Report Data Filter
              </label>
              <select
                value={exportFilter}
                onChange={(e) => setExportFilter(e.target.value)}
                className="w-full sm:w-72 bg-slate-950 border border-slate-800 text-white font-medium text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none"
              >
                <option value="all">All Invitations</option>
                <option value="pending">Pending Invitations Only</option>
                <option value="accepted">Accepted Invitations Only</option>
                <option value="rejected">Rejected Invitations Only</option>
                <option value="important">Important Priority Only</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer border border-slate-700 shadow-md"
              >
                <FileCode className="w-4 h-4 text-brand-400" /> Export CSV Document
              </button>

              <button
                onClick={() => handleExport('xlsx')}
                className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4" /> Export PDF Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
