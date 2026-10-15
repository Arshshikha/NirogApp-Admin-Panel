import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Eye, Power, PowerOff, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import api from '../../config/api';
import { formatOnlyDate } from '../../utils/formatters';

export const UserList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Fetch users list
  const { data, isLoading, error } = useQuery({
    queryKey: ['usersList', search, roleFilter, statusFilter, page],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.isActive = statusFilter === 'ACTIVE';
      const res = await api.get('/admin/users', { params });
      return res.data;
    },
  });

  // Mutation to toggle active status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await api.post(`/admin/users/status/${userId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
  });

  // Mutation to soft delete a user
  const softDeleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (window.confirm('Are you sure you want to soft delete this user account? The user will be deactivated.')) {
        await api.delete(`/admin/users/${userId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3" />
        Fetching user directory...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        Failed to fetch user directory.
      </div>
    );
  }

  const { users, pagination } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Manage system accounts, toggle active states, and perform administration actions</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        {/* Search Input */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
            <option value="STUDENT">Students</option>
            <option value="PROVIDER">Providers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active accounts</option>
            <option value="INACTIVE">Deactivated accounts</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {users.length > 0 ? (
                users.map((user: any) => {
                  const fullName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'No Name';
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-all duration-150">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                        {fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          user.role === 'ADMIN' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : user.role === 'DOCTOR' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : user.role === 'PROVIDER' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {formatOnlyDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          user.isActive ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {user.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Deactivated
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/users/${user.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-all duration-200"
                            title="Inspect User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>

                          {/* Toggle Status */}
                          <button
                            onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: !user.isActive })}
                            disabled={toggleStatusMutation.isPending}
                            className={`p-1.5 rounded-lg border transition-all duration-200 ${
                              user.isActive 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-slate-950' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                          </button>

                          {/* Soft Delete */}
                          <button
                            onClick={() => softDeleteMutation.mutate(user.id)}
                            disabled={softDeleteMutation.isPending}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-500 hover:bg-rose-500 hover:text-slate-950 transition-all duration-200"
                            title="Soft Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                    No users matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950/40 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Showing page <strong className="text-slate-200">{pagination.page}</strong> of{' '}
              <strong className="text-slate-200">{pagination.pages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
