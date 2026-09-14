import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Users,
  Bell,
  Plus,
  ArrowRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { DashboardStats, Invitation, User } from '../../types';

export const ChairmanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvitations, setRecentInvitations] = useState<Invitation[]>([]);
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, invRes, membersRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/invitations?limit=5'),
        api.get('/users?status=PENDING'),
      ]);

      setStats(statsRes.data);
      setRecentInvitations(invRes.data.invitations || []);
      setPendingMembers(membersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Invitations',
      value: stats?.totalInvitations ?? 0,
      icon: Mail,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
      path: '/chairman/invitations',
    },
    {
      label: 'Pending Decisions',
      value: stats?.pendingInvitations ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      path: '/chairman/invitations?status=PENDING',
    },
    {
      label: 'Accepted Events',
      value: stats?.acceptedInvitations ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      path: '/chairman/invitations?status=ACCEPTED',
    },
    {
      label: 'Rejected Invitations',
      value: stats?.rejectedInvitations ?? 0,
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      path: '/chairman/invitations?status=REJECTED',
    },
    {
      label: 'Pending Requests',
      value: stats?.pendingMemberRequests ?? 0,
      icon: UserCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      path: '/chairman/pending-requests',
    },
    {
      label: 'Management Members',
      value: stats?.managementMembers ?? 0,
      icon: Users,
      color: 'text-slate-700 bg-slate-100 border-slate-200',
      path: '/chairman/users',
    },
    {
      label: 'Unread Alerts',
      value: stats?.unreadNotifications ?? 0,
      icon: Bell,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      path: '/chairman/notifications',
    },
  ];

  return (
    <DashboardLayout title="Elite Invitation Dashboard">
      <div className="space-y-8">
        {/* Header Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Executive Dashboard Overview</h2>
            <p className="text-xs sm:text-sm text-brand-200 mt-1 font-medium">
              Manage invitation decisions, member approvals, and event schedules.
            </p>
          </div>
          <button
            onClick={() => navigate('/chairman/upload-invitation')}
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-brand-500/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Invitation
          </button>
        </div>

        {/* 7 CLICKABLE STATS CARDS GRID */}
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
                  <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Section: Pending Member Approvals & Recent Invitations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Invitations */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Invitations</h3>
                <p className="text-xs text-slate-500">Latest entries submitted into the system.</p>
              </div>
              <button
                onClick={() => navigate('/chairman/invitations')}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading invitations...</div>
            ) : recentInvitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No invitations uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Initial invitation count is zero.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate(`/chairman/invitations`)}
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
                            {new Date(inv.date).toLocaleDateString()} &bull; Category: {inv.category} &bull; Uploaded by: {inv.uploadedBy?.fullName || 'N/A'}
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

          {/* Pending Member Requests Side Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Requests</h3>
                <p className="text-xs text-slate-500">Management accounts awaiting approval.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                {pendingMembers.length}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
            ) : pendingMembers.length === 0 ? (
              <div className="text-center py-12 my-auto">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No pending requests</p>
                <p className="text-xs text-slate-400 mt-1">All registration applications have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{member.fullName}</p>
                      <p className="text-[11px] text-slate-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/chairman/pending-requests')}
                      className="bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/chairman/pending-requests')}
              className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Go to Pending Requests
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
