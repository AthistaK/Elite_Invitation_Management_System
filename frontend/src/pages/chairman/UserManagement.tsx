import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AddMemberModal } from '../../components/members/AddMemberModal';
import { ResetPasswordModal } from '../../components/members/ResetPasswordModal';
import { api } from '../../services/api';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await api.get('/users', { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/users/${id}/approve`);
      fetchUsers();
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/users/${id}/reject`);
      fetchUsers();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.post(`/users/${id}/activate`);
      fetchUsers();
    } catch (err) {
      console.error('Activate error:', err);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await api.post(`/users/${id}/deactivate`);
      fetchUsers();
    } catch (err) {
      console.error('Deactivate error:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <DashboardLayout title="Management User Governance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">User Governance Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage authorized office staff and family members, approve registration applications, and reset passwords.
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search member by full name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Members:
            </span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Role: All</option>
              <option value="OFFICE">Office</option>
              <option value="FAMILY">Family</option>
            </select>
          </div>
        </div>

        {/* Member Directory Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading member directory...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No management members found</h3>
              <p className="text-xs text-slate-400 mt-1">No member accounts match the specified filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{member.fullName}</div>
                          {member.phone && <div className="text-[11px] text-slate-400">{member.phone}</div>}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{member.email}</td>

                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase">
                          {member.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            member.accountStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : member.accountStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : member.accountStatus === 'INACTIVE'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {member.accountStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {member.accountStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(member.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Approve Member"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(member.id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Reject Member"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {member.accountStatus === 'APPROVED' ? (
                            <button
                              onClick={() => handleDeactivate(member.id)}
                              className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Deactivate Member"
                            >
                              Deactivate
                            </button>
                          ) : member.accountStatus === 'INACTIVE' ? (
                            <button
                              onClick={() => handleActivate(member.id)}
                              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Activate Member"
                            >
                              Activate
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              setSelectedUser(member);
                              setResetPasswordModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(member.id, member.fullName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => fetchUsers()}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        user={selectedUser}
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        onSuccess={() => fetchUsers()}
      />
    </DashboardLayout>
  );
};
