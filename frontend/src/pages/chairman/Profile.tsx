import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getFileUrl, validateImageFile, createPreviewUrl, revokePreviewUrl } from '../../utils/fileUtils';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const isChairman = user?.role === 'CHAIRMAN';

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state whenever authenticated user changes/loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      if (user.profilePhoto) {
        setPreviewUrl(getFileUrl(user.profilePhoto));
      }
    }
  }, [user]);

  // Clean up object URLs to prevent memory leaks on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setError(check.error || 'Invalid file.');
      return;
    }
    setError('');

    // Revoke previous blob URL if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      revokePreviewUrl(previewUrl);
    }

    setProfilePhoto(file);
    setPreviewUrl(createPreviewUrl(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);

      const res = await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update global auth user state so greeting & avatar update instantly across app!
      updateUser(res.data.user);

      setSuccess('Profile details updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="User Profile Settings">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Manage Your Profile</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Update your account details, profile picture, and security password.
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload & Preview */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={fullName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-600/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-2xl">
                    {fullName.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}

                <label
                  htmlFor="photo-upload-input"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 text-white hover:bg-brand-500 cursor-pointer shadow-md transition-colors"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handlePhotoChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
                <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                  Role: {isChairman ? 'Chairman' : user?.role?.toLowerCase() + ' Member'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Click the camera icon to upload a new avatar picture.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Email (READ ONLY!) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address (Read Only)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="w-full bg-slate-200/70 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-600 font-mono cursor-not-allowed select-none"
                />
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Change Sub-section */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" /> Change Security Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Required to change password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
