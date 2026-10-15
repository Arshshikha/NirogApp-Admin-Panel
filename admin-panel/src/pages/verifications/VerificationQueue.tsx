import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../../config/api';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatters';

export const VerificationQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'DOCTOR' | 'PROVIDER' | 'STUDENT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: ['verificationQueue'],
    queryFn: async () => {
      const res = await api.get('/admin/verifications/queue');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3" />
        Fetching verification requests...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        Failed to fetch verifications.
      </div>
    );
  }

  const queue = data.queue || [];

  // Filter verification list
  const filteredQueue = queue.filter((item: any) => {
    const matchesTab = activeTab === 'ALL' || item.type === activeTab;
    const matchesStatus = statusFilter === 'ALL' || item.verificationStatus === statusFilter;
    return matchesTab && matchesStatus;
  });

  const tabs = [
    { key: 'ALL', label: 'All Requests' },
    { key: 'DOCTOR', label: 'Doctors' },
    { key: 'PROVIDER', label: 'Providers' },
    { key: 'STUDENT', label: 'Students' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review credentials and approve medical practitioners and institutions</p>
        </div>

        {/* Status Select Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-4 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
              activeTab === tab.key
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table view */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4">Credentials Ref</th>
                <th className="px-6 py-4">Document Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((item: any) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-800/20 transition-all duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.type === 'DOCTOR' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : item.type === 'PROVIDER' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                      {item.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[150px]">{item.documentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        item.verificationStatus === 'APPROVED' 
                          ? 'success' 
                          : item.verificationStatus === 'PENDING' 
                          ? 'warning' 
                          : 'error'
                      }>
                        {item.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        to={`/verifications/${item.type.toLowerCase()}/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all duration-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                    No pending verification requests found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerificationQueue;
