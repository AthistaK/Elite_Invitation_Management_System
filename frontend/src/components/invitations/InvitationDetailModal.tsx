import React from 'react';
import { X, Calendar, User, FileText, CheckCircle2, XCircle, Clock, ExternalLink, Crown } from 'lucide-react';
import { Invitation } from '../../types';
import { API_BASE_URL } from '../../services/api';

interface InvitationDetailModalProps {
  invitation: Invitation | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onOpenReminder?: (invitation: Invitation) => void;
  isChairman: boolean;
}

export const InvitationDetailModal: React.FC<InvitationDetailModalProps> = ({
  invitation,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onOpenReminder,
  isChairman,
}) => {
  if (!isOpen || !invitation) return null;

  const backendHost = API_BASE_URL.replace('/api/v1', '');
  const isImportant = invitation.priority === 'IMPORTANT';
  const isImage =
    invitation.attachmentPath &&
    /\.(jpg|jpeg|png|webp)$/i.test(invitation.attachmentPath);
  const isPdf = invitation.attachmentPath && /\.pdf$/i.test(invitation.attachmentPath);

  const formatInvitationRole = (roleStr?: string) => {
    switch (roleStr) {
      case 'CHIEF_GUEST':
        return 'Chief Guest';
      case 'GUEST_OF_HONOUR':
        return 'Guest of Honour';
      case 'SPECIAL_INVITEE':
        return 'Special Invitee';
      case 'ATTENDEE':
        return 'Attendee';
      default:
        return 'Other';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/80">
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-start justify-between rounded-t-3xl ${
            isImportant ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-12 rounded-full ${isImportant ? 'bg-rose-600' : 'bg-brand-600'}`}
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Invitation Details
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                {invitation.organizationFamilyName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status</span>
              <span
                className={`font-bold inline-block mt-0.5 ${
                  invitation.status === 'ACCEPTED'
                    ? 'text-emerald-700'
                    : invitation.status === 'REJECTED'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {invitation.status}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Priority</span>
              <span className={`font-bold inline-block mt-0.5 ${isImportant ? 'text-rose-600' : 'text-brand-700'}`}>
                {invitation.priority}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Requested Role</span>
              <span className="font-bold text-slate-800 inline-block mt-0.5">
                {formatInvitationRole(invitation.invitationRole)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Category</span>
              <span className="font-bold text-slate-800 inline-block mt-0.5">{invitation.category}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <strong className="font-semibold text-slate-900">Event Date & Time: </strong>
                {new Date(invitation.date).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <strong className="font-semibold text-slate-900">Uploaded By: </strong>
                {invitation.uploadedBy?.fullName || 'N/A'} ({invitation.uploadedBy?.email})
              </div>
            </div>

            {invitation.remarks && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900">Remarks / Venue: </strong>
                  <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{invitation.remarks}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attachment Image/PDF Preview */}
          {invitation.attachmentPath && (
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Attachment Preview
              </h4>
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-900 p-2 flex items-center justify-center min-h-60 max-h-96">
                {isImage ? (
                  <img
                    src={`${backendHost}${invitation.attachmentPath}`}
                    alt="Invitation Attachment Scan"
                    className="max-h-88 object-contain rounded-xl shadow-md"
                    onError={(e) => {
                      console.error('Image load error:', invitation.attachmentPath);
                    }}
                  />
                ) : isPdf ? (
                  <div className="py-12 text-center text-white">
                    <FileText className="w-12 h-12 text-brand-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold">PDF Document Attached</p>
                    <a
                      href={`${backendHost}${invitation.attachmentPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Open PDF File <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <a
                    href={`${backendHost}${invitation.attachmentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 text-xs font-bold underline"
                  >
                    Download Attachment File
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
          <button
            onClick={() => onOpenReminder && onOpenReminder(invitation)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-indigo-600" /> Set Reminder
          </button>

          <div className="flex items-center gap-3">
            {isChairman && invitation.status === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    onReject && onReject(invitation.id);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => {
                    onAccept && onAccept(invitation.id);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept Invitation
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
