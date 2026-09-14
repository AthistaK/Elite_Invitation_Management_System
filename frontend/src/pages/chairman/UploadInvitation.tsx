import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle2, AlertCircle, Calendar, Flag, Tag, Users, FileCheck, Crown } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LiveCameraModal } from '../../components/invitations/LiveCameraModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const UploadInvitation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  const [orgName, setOrgName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [priority, setPriority] = useState<'IMPORTANT' | 'NORMAL'>('NORMAL');
  const [invitationRole, setInvitationRole] = useState<'CHIEF_GUEST' | 'GUEST_OF_HONOUR' | 'SPECIAL_INVITEE' | 'ATTENDEE' | 'OTHER'>('ATTENDEE');
  const [role, setRole] = useState<'OFFICE' | 'FAMILY'>('OFFICE');
  const [category, setCategory] = useState<'COLLEGE' | 'FAMILY' | 'GOVERNMENT' | 'PERSONAL' | 'OTHERS'>('COLLEGE');
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file format. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15 MB limit.');
      return;
    }

    setError('');
    setAttachment(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orgName || !eventDate || !priority || !role || !category || !invitationRole) {
      setError('All fields are required.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('organizationFamilyName', orgName);
      formData.append('date', eventDate);
      formData.append('priority', priority);
      formData.append('invitationRole', invitationRole);
      formData.append('role', role);
      formData.append('category', category);
      formData.append('remarks', remarks);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.post('/invitations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Invitation uploaded successfully.');

      setTimeout(() => {
        if (isChairman) {
          navigate('/chairman/invitations');
        } else {
          navigate('/management/invitations');
        }
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Upload Invitation">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Upload New Invitation</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit digital scan or file attachment for invitation record tracking.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Source Buttons */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Attachment Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-brand-600 bg-brand-50/50'
                    : 'border-slate-300 hover:border-brand-500 bg-slate-50/50'
                }`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <Upload className="w-8 h-8 text-brand-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {attachment ? attachment.name : 'Drag & Drop file or Browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">JPG, JPEG, PNG, WEBP, PDF (Max 15MB)</p>

                <input
                  id="file-upload-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Camera Capture Launcher */}
              <div
                onClick={() => setCameraModalOpen(true)}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/50 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
              >
                <Camera className="w-8 h-8 text-brand-600 mb-2" />
                <p className="text-xs font-bold text-slate-800">Live Camera Scan</p>
                <p className="text-[11px] text-slate-400 mt-1">Capture snapshot directly using device camera</p>
              </div>
            </div>

            {attachment && (
              <div className="mt-3 p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-brand-600 shrink-0" /> {attachment.name} (
                  {(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-rose-600 hover:underline cursor-pointer ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Organization / Family Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Organization / Family Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Education / Vance Family"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" /> Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Priority Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-brand-600" /> Priority Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('NORMAL')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      priority === 'NORMAL'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Normal (Blue)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('IMPORTANT')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      priority === 'IMPORTANT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Important (Red)
                  </button>
                </div>
              </div>

              {/* Requested Invitation Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-brand-600" /> Requested Invitation Role *
                </label>
                <select
                  value={invitationRole}
                  onChange={(e) => setInvitationRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                >
                  <option value="CHIEF_GUEST">Chief Guest</option>
                  <option value="GUEST_OF_HONOUR">Guest of Honour</option>
                  <option value="SPECIAL_INVITEE">Special Invitee</option>
                  <option value="ATTENDEE">Attendee</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" /> Event Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                >
                  <option value="COLLEGE">College</option>
                  <option value="FAMILY">Family</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="OTHERS">Others</option>
                </select>
              </div>

              {/* User Affiliation Role */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600" /> User Affiliation Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                >
                  <option value="OFFICE">Office</option>
                  <option value="FAMILY">Family</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Remarks / Venue Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Chief Guest requested. Dress Code: Formal. Auditorium Hall B."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Uploading Invitation...' : 'Submit Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <LiveCameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={(file) => handleFileChange(file)}
      />
    </DashboardLayout>
  );
};
