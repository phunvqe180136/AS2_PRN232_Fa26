'use client';
import { useState, useEffect } from 'react';
import { RequireAuth, useAuth } from '@/lib/auth';
import { Auth } from '@/lib/services';
import { getErrorMessage } from '@/lib/api';
import { ProfileDto } from '@/lib/types';
import { useToast } from '@/components/Toast';
import {
  User,
  Shield,
  KeyRound,
  Calendar,
  CheckCircle2,
  ListTodo,
  Mail,
  Save,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await Auth.profile();
      setProfile(data);
      setFullName(data.fullName);
    } catch (err) {
      toast.push('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to change password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await Auth.updateProfile({
        fullName: fullName.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.push('success', 'Profile updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-3xl font-black text-white shadow-lg ring-4 ring-white/10">
              {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {profile?.fullName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    profile?.role === 1
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {profile?.roleName}
                </span>
              </div>
              <p className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-indigo-400" />
                {profile?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Joined Date</div>
              <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                {profile?.createdDate ? new Date(profile.createdDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Created Tasks</div>
              <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5 text-emerald-400">
                <ListTodo className="h-3.5 w-3.5" />
                {profile?.createdTasksCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Edit Account Information
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Update your public name or change your account login credentials.
        </p>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Change Password Sub-section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-600" />
              Change Password (Optional)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Leave blank if you do not want to change your password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-70"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
