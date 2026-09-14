import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Plus,
  Flag,
  Tag,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { InvitationDetailModal } from '../../components/invitations/InvitationDetailModal';
import { ReminderModal } from '../../components/invitations/ReminderModal';
import { api } from '../../services/api';
import { Invitation } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const Invitations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'ALL');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'ALL');

  // Modals state
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await api.get('/invitations', { params });
      setInvitations(res.data.invitations || []);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [statusFilter, priorityFilter, categoryFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvitations();
  };

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/invitations/${id}/accept`);
      fetchInvitations();
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/invitations/${id}/reject`);
      fetchInvitations();
    } catch (err) {
      console.error('Reject error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invitation record?')) return;
    try {
      await api.delete(`/invitations/${id}`);
      fetchInvitations();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <DashboardLayout title={isChairman ? 'All System Invitations' : 'My Uploaded Invitations'}>
      <div className="space-y-6">
        {/* Header & Upload CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isChairman ? 'Invitation Management' : 'My Uploaded Invitations'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isChairman
                ? 'Review, approve, reject, and schedule reminders for invitation entries.'
                : 'Track the status and review decisions for invitations you submitted.'}
            </p>
          </div>

          <button
            onClick={() => navigate(isChairman ? '/chairman/upload-invitation' : '/management/upload-invitation')}
            className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Upload Invitation
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by organization, family name, or remarks..."
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
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Priority: All</option>
              <option value="IMPORTANT">Important (Red)</option>
              <option value="NORMAL">Normal (Blue)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">Category: All</option>
              <option value="COLLEGE">College</option>
              <option value="FAMILY">Family</option>
              <option value="OTHERS">Others</option>
            </select>

            {/* Role Filter */}
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

        {/* Invitations List Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading invitations database...</div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No invitations found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No invitation entries match the selected filters or search parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {invitations.map((inv) => {
              const isImportant = inv.priority === 'IMPORTANT';
              return (
                <div
                  key={inv.id}
                  /* IMPORTANT Priority Highlight: ENTIRE CARD HIGHLIGHTED WITH SUBTLE RED ACCENT */
                  className={`rounded-2xl p-5 border transition-all shadow-xs ${
                    isImportant
                      ? 'bg-gradient-to-r from-rose-50/80 via-white to-white border-rose-300 shadow-rose-500/5 ring-1 ring-rose-400/30'
                      : 'bg-white border-slate-200/80 hover:border-brand-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Left Accent Bar */}
                      <div
                        className={`w-3 h-12 rounded-full shrink-0 ${
                          isImportant ? 'bg-rose-600 shadow-xs shadow-rose-600/50' : 'bg-brand-600'
                        }`}
                      />

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900">{inv.organizationFamilyName}</h3>
                          {isImportant && (
                            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                              Important
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
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

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-brand-600" />
                            {new Date(inv.date).toLocaleDateString()}
                          </span>
                          <span>Category: <strong className="text-slate-800">{inv.category}</strong></span>
                          <span>Role: <strong className="text-slate-800">{inv.role}</strong></span>
                          <span>Uploaded By: <strong className="text-slate-800">{inv.uploadedBy?.fullName || 'N/A'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                      <button
                        onClick={() => {
                          setSelectedInvitation(inv);
                          setDetailModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedInvitation(inv);
                          setReminderModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Set Reminder"
                      >
                        <Clock className="w-4 h-4" />
                      </button>

                      {isChairman && inv.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAccept(inv.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <InvitationDetailModal
        invitation={selectedInvitation}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onAccept={(id) => handleAccept(id)}
        onReject={(id) => handleReject(id)}
        onOpenReminder={(inv) => {
          setSelectedInvitation(inv);
          setReminderModalOpen(true);
        }}
        isChairman={isChairman}
      />

      {/* Reminder Modal */}
      <ReminderModal
        invitation={selectedInvitation}
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onSuccess={() => fetchInvitations()}
      />
    </DashboardLayout>
  );
};
