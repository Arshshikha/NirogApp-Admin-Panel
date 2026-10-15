import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarRange, Search, Edit2, ShieldAlert } from 'lucide-react';
import api from '../../config/api';
import { Badge } from '../../components/ui/badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const BookingList: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch bookings list
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookingsList', search, statusFilter, typeFilter, page],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const res = await api.get('/admin/users/bookings', { params });
      return res.data;
    },
  });

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, cancellationReason }: { bookingId: string; status: string; cancellationReason?: string }) => {
      setUpdating(true);
      const res = await api.post(`/admin/users/bookings/${bookingId}/status`, { status, cancellationReason });
      return res.data;
    },
    onSuccess: (data) => {
      alert(data.message || 'Booking status updated successfully');
      setSelectedBooking(null);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['bookingsList'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update status. Please try again.');
    },
    onSettled: () => {
      setUpdating(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3" />
        Fetching bookings register...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        Failed to fetch bookings list.
      </div>
    );
  }

  const { bookings, pagination } = data;

  const handleUpdateClick = (booking: any) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const isCancel = newStatus.startsWith('CANCELLED') || newStatus === 'REJECTED';
    updateStatusMutation.mutate({
      bookingId: selectedBooking.id,
      status: newStatus,
      cancellationReason: isCancel ? cancelReason : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-emerald-400" />
          Global Appointments Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review scheduled doctor calls, clinical checkups, or online chat slots, and override states</p>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by reference code or patient email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED_BY_PATIENT">Cancelled By Patient</option>
            <option value="CANCELLED_BY_PROVIDER">Cancelled By Provider</option>
            <option value="NO_SHOW">No Show</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            <option value="ALL">All Types</option>
            <option value="IN_PERSON">In Person</option>
            <option value="ONLINE_VIDEO">Online Video</option>
            <option value="ONLINE_CHAT">Online Chat</option>
            <option value="HOME_VISIT">Home Visit</option>
            <option value="HOSPITAL_VISIT">Hospital Visit</option>
            <option value="LAB_TEST">Lab Test</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Scheduled Date</th>
                <th className="px-6 py-4">Ref Code</th>
                <th className="px-6 py-4">Patient Profile</th>
                <th className="px-6 py-4">Doctor / Clinic</th>
                <th className="px-6 py-4">Session Type</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Booking Status</th>
                <th className="px-6 py-4 text-center">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {bookings.length > 0 ? (
                bookings.map((booking: any) => {
                  const patientName = `${booking.patient?.profile?.firstName || ''} ${booking.patient?.profile?.lastName || ''}`.trim() || 'No Name';
                  const providerName = booking.doctorProfile 
                    ? `Dr. ${booking.doctorProfile.user?.profile?.firstName || ''} ${booking.doctorProfile.user?.profile?.lastName || ''}`.trim()
                    : booking.providerProfile?.legalName || 'N/A';

                  return (
                    <tr key={booking.id} className="hover:bg-slate-800/20 transition-all duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {formatDate(`${booking.scheduledDate.split('T')[0]}T${booking.scheduledTime}:00`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                        {booking.bookingReference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-200">{patientName}</p>
                        <p className="text-[10px] text-slate-500">{booking.patient?.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {providerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-850 text-slate-400">
                          {booking.appointmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          booking.paymentStatus === 'PAID' 
                            ? 'success' 
                            : booking.paymentStatus === 'PENDING' 
                            ? 'warning' 
                            : booking.paymentStatus === 'REFUNDED'
                            ? 'info'
                            : 'error'
                        }>
                          {booking.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          booking.status === 'COMPLETED' || booking.status === 'CONFIRMED'
                            ? 'success'
                            : booking.status === 'PENDING' || booking.status === 'RESCHEDULED'
                            ? 'warning'
                            : 'error'
                        }>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleUpdateClick(booking)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-850 transition-all duration-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                    No bookings found.
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

      {/* Override Status Overlay modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleStatusSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CalendarRange className="w-5 h-5" />
              <h3 className="text-sm font-bold">Override Booking Status</h3>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Manually modify the scheduling state of booking <strong className="text-slate-200 font-mono">{selectedBooking.bookingReference}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED_BY_PATIENT">Cancelled By Patient</option>
                  <option value="CANCELLED_BY_PROVIDER">Cancelled By Provider</option>
                  <option value="NO_SHOW">No Show</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Cancellation detail note */}
              {(newStatus.startsWith('CANCELLED') || newStatus === 'REJECTED') && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cancellation Reason Notes
                  </label>
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Provide detailed cancellation reason, e.g. Doctor emergency leave..."
                    rows={3}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                  />
                  {selectedBooking.paymentStatus === 'PAID' && (
                    <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 rounded-xl mt-1 leading-normal">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Note:</strong> Cancelling this confirmed appointment will automatically trigger a full refund of <strong>{formatCurrency(selectedBooking.totalFee)}</strong> to the patient.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 text-xs font-bold pt-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => { setSelectedBooking(null); setCancelReason(''); }}
                className="px-4 py-2 bg-slate-850 text-slate-300 rounded-lg hover:bg-slate-800 transition-all duration-200"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-lg transition-all duration-200"
              >
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingList;
