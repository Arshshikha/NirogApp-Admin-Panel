import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Lock, Mail } from 'lucide-react';
import api from '../config/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/admin/auth/login', { email, password });
      const { token, session } = response.data;

      localStorage.setItem('admin_token', token);
      localStorage.setItem('user_role', session.role);
      localStorage.setItem('admin_email', session.email);
      localStorage.setItem('admin_name', `${session.profile?.firstName || ''} ${session.profile?.lastName || ''}`.trim() || 'Admin');

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl z-10">
        {/* Header brand details */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            NirogApp Admin Panel
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your administrator credentials
          </p>
        </div>

        {error && (
          <div className="flex gap-2 p-3.5 mb-6 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nirog.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold transition-all duration-200 shadow-lg shadow-emerald-500/10 focus:outline-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
