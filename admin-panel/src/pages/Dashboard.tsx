import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import api from '../config/api';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/stats');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3" />
        Loading dashboard metrics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        Failed to fetch dashboard metrics. Please ensure the backend server is running.
      </div>
    );
  }

  const { summary, bookings, financials, trends } = data;

  const statsCards = [
    { 
      title: 'Total Users', 
      value: summary.totalUsers, 
      desc: `${summary.userCounts.PATIENT} Patients • ${summary.userCounts.DOCTOR} Doctors`, 
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20'
    },
    { 
      title: 'Pending Verifications', 
      value: summary.pendingVerifications, 
      desc: `${summary.pendingDetails.doctors} Doc • ${summary.pendingDetails.providers} Prov • ${summary.pendingDetails.students} Stud`, 
      icon: ShieldAlert,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20'
    },
    { 
      title: 'Active Bookings', 
      value: bookings.totalBookings, 
      desc: 'Total global appointments', 
      icon: Calendar,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20'
    },
    { 
      title: 'Total Platform Sales', 
      value: formatCurrency(financials.totalSales), 
      desc: 'Paid consultation invoices', 
      icon: DollarSign,
      color: 'from-violet-500/10 to-fuchsia-500/10 text-violet-400 border-violet-500/20'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Overview Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time statistics and service activity monitoring</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl bg-gradient-to-br bg-slate-900 border ${card.color} flex items-center justify-between shadow-lg`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-100">{card.value}</h3>
                <p className="text-[10px] text-slate-500 leading-none">{card.desc}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Revenue Stream (Last 6 Months)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Aggregated payments completed on the platform</p>
            </div>
            <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Platform fee: {formatCurrency(financials.totalPlatformFees)}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.monthlyRevenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registration Trend */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-200">New Registrations (Last 30 Days)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Daily growth log of user profiles</p>
            </div>
            <div className="text-blue-400 text-xs font-semibold flex items-center gap-1">
              <UserPlus className="w-4 h-4" />
              Active state
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.userRegistrationTrend}>
                <defs>
                  <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUser)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom split: Pending items lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending approvals summary links */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200">Verification Tasks</h4>
            <Link to="/verifications" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              Go to queue <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">Doctor Profiles Pending</span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {summary.pendingDetails.doctors} Queue
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">Provider Profiles Pending</span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {summary.pendingDetails.providers} Queue
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">Student Profiles Pending</span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {summary.pendingDetails.students} Queue
              </span>
            </div>
          </div>
        </div>

        {/* Reported content tickets */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200">Moderation System Logs</h4>
            <Link to="/moderation" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              Review reports <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-slate-800 rounded-xl min-h-[188px]">
            {summary.unresolvedReports > 0 ? (
              <div className="text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-xs text-slate-200 font-semibold">{summary.unresolvedReports} reported items require inspection</p>
                <p className="text-[10px] text-slate-500">Spam, inappropriate comments, or flagged doctor profiles</p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xs text-emerald-400 font-semibold">System Clear</p>
                <p className="text-[10px] text-slate-500">Zero unresolved reports or flagging disputes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
