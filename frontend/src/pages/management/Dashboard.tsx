import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Clock, CheckCircle2, XCircle, Plus, Upload, Calendar } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { DashboardStats, Invitation } from '../../types';

export const ManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myInvitations, setMyInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, invRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/invitations'),
      ]);

      setStats(statsRes.data);
      setMyInvitations(invRes.data.invitations || []);
    } catch (err) {
      console.error('Failed to load management dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'My Invitations',
      value: stats?.myInvitations ?? 0,
      icon: Mail,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
      path: '/management/invitations',
    },
    {
      label: 'Pending Approval',
      value: stats?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      path: '/management/invitations?status=PENDING',
    },
    {
      label: 'Accepted',
      value: stats?.accepted ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      path: '/management/invitations?status=ACCEPTED',
    },
    {
      label: 'Rejected',
      value: stats?.rejected ?? 0,
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      path: '/management/invitations?status=REJECTED',
    },
  ];

  return (
    <DashboardLayout title="Elite Invitation Dashboard">
      <div className="space-y-8">
        {/* Header Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-brand-900 p-6 rounded-3xl text-white shadow-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Management Member Dashboard</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Upload invitation documentation for executive review.
            </p>
          </div>
          <button
            onClick={() => navigate('/management/upload-invitation')}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Invitation
          </button>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(stat.path)}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2.5 rounded-xl border ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Uploads or Empty State */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Uploaded Invitations</h3>
              <p className="text-xs text-slate-500">Track status and details of invitations you submitted.</p>
            </div>
            {myInvitations.length > 0 && (
              <button
                onClick={() => navigate('/management/upload-invitation')}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
              >
                + Upload New
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your uploads...</div>
          ) : myInvitations.length === 0 ? (
            /* PROFESSIONAL EMPTY STATE */
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 border border-brand-200 mx-auto flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No invitations uploaded yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
                Upload your first invitation to start tracking status and sending details for executive review.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/management/upload-invitation')}
                  className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-brand-700/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Upload Invitation
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myInvitations.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/management/invitations`)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    inv.priority === 'IMPORTANT'
                      ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-10 rounded-full ${
                          inv.priority === 'IMPORTANT' ? 'bg-rose-600' : 'bg-brand-600'
                        }`}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {inv.organizationFamilyName}
                          {inv.priority === 'IMPORTANT' && (
                            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Important
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(inv.date).toLocaleDateString()} &bull; Category: {inv.category} &bull; Role: {inv.role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
