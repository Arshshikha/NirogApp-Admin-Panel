import React, { useState } from 'react';
import { Settings, Shield, User, Key, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const adminName = localStorage.getItem('admin_name') || 'System Admin';
  const adminEmail = localStorage.getItem('admin_email') || 'admin@nirog.com';
  const adminRole = localStorage.getItem('user_role') || 'ADMIN';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password fields do not match.');
      return;
    }

    setUpdating(true);
    // Simulate updating password
    setTimeout(() => {
      setUpdating(false);
      setSuccessMsg('Admin password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage admin profile details, security settings, and update system passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Profile Details */}
        <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400">
            <User className="w-5 h-5" />
            <h3 className="text-sm font-bold">Admin Credentials</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Name</span>
              <span className="text-slate-200 font-medium text-sm">{adminName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Email</span>
              <span className="text-slate-200 font-medium text-sm">{adminEmail}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Role Group</span>
              <span className="text-slate-200 font-medium text-sm flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {adminRole}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Security settings */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400">
            <Key className="w-5 h-5" />
            <h3 className="text-sm font-bold">Update System Password</h3>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="flex gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 rounded-xl bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold transition-all duration-200 shadow-md shadow-emerald-500/10 focus:outline-none"
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
