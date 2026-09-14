import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { api } from '../../services/api';
import { User } from '../../types';

export const PendingRequests: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?status=PENDING');
      setPendingUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/users/${id}/approve`);
      fetchPendingUsers();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/users/${id}/reject`);
      fetchPendingUsers();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  return (
    <DashboardLayout title="Pending Member Requests">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Pending Registration Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and approve management accounts registered through the self-registration portal.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading pending requests...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No pending management requests</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All self-registered member applications have been reviewed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {pendingUsers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Status: PENDING
                    </span>
                    <span className="text-xs text-slate-400">
                      Registered: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{member.fullName}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{member.email}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReject(member.id)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>

                  <button
                    onClick={() => handleApprove(member.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Member
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
