import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Calendar, MapPin, Shield, FileText } from 'lucide-react';
import api from '../../config/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Badge } from '../../components/ui/badge';

export const UserDetail: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['userDetail', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3" />
        Loading user profiles details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center">
        Failed to fetch user profiles. It may have been deleted or the ID is invalid.
      </div>
    );
  }

  const { user, bookingsAsVendor } = data;
  const fullName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'No Name';

  // Identify display fields based on role
  const isPatient = user.role === 'PATIENT';
  const isDoctor = user.role === 'DOCTOR';
  const isStudent = user.role === 'STUDENT';
  const isProvider = user.role === 'PROVIDER';

  const address = user.profile?.address || user.providerProfile?.address;
  const bookings = isPatient ? user.bookingsAsPatient : bookingsAsVendor;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to User List
      </button>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Core account stats */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-emerald-400 text-xl font-bold mb-3 shadow-inner">
                {fullName[0]}
              </div>
              <h3 className="text-base font-bold text-slate-100">{fullName}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>

              <div className="flex items-center gap-2 mt-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  user.role === 'ADMIN' 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : user.role === 'DOCTOR' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {user.role}
                </span>

                <Badge variant={user.isActive ? 'success' : 'default'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="w-full h-px bg-slate-800" />

            {/* Profile Statistics info */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Profile Info
              </h4>
              <div className="space-y-2.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Number</span>
                  <span>{user.profile?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered At</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                {user.profile?.bio && (
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-1">Biography</span>
                    <p className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-400 leading-relaxed">
                      {user.profile.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {address && (
              <>
                <div className="w-full h-px bg-slate-800" />
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Address Details
                  </h4>
                  <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-200">{address.line1}</p>
                    {address.line2 && <p className="text-slate-400">{address.line2}</p>}
                    <p className="text-slate-400 mt-1">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{address.country}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Columns: Role profile details & bookings lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specific Role Info details card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              Role Profile Credentials
            </h4>

            {isPatient && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Blood Group</p>
                  <p className="text-sm font-bold text-slate-200">{user.patientProfile?.bloodGroup || 'UNKNOWN'}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Allergies List</p>
                  <p className="text-xs text-slate-200">
                    {user.patientProfile?.allergies?.join(', ') || 'None recorded'}
                  </p>
                </div>
              </div>
            )}

            {isDoctor && user.doctorProfile && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Reg Number</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">{user.doctorProfile.registrationNumber}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Specialties</p>
                  <p className="text-xs text-slate-200">{user.doctorProfile.specialties?.join(', ')}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Consultation Fee</p>
                  <p className="text-sm font-bold text-slate-200">{formatCurrency(user.doctorProfile.consultationFee)}</p>
                </div>
              </div>
            )}

            {isStudent && user.studentProfile && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Institution</p>
                  <p className="text-sm font-bold text-slate-200">{user.studentProfile.institutionName}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Enrollment</p>
                  <p className="text-sm font-bold text-slate-200 font-mono">{user.studentProfile.enrollmentNumber || 'N/A'}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Course Of Study</p>
                  <p className="text-xs text-slate-200">{user.studentProfile.courseOfStudy} (Year {user.studentProfile.yearOfStudy})</p>
                </div>
              </div>
            )}

            {isProvider && user.providerProfile && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Provider Legal Name</p>
                  <p className="text-sm font-bold text-slate-200">{user.providerProfile.legalName}</p>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 mb-0.5">Provider Type</p>
                  <p className="text-sm font-bold text-slate-200">{user.providerProfile.providerType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bookings log table list */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Appointment History Log
            </h4>

            {bookings && bookings.length > 0 ? (
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/30">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-4 py-3">Scheduled Date</th>
                      <th className="px-4 py-3">Ref ID</th>
                      <th className="px-4 py-3">Participant Details</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {bookings.map((booking: any) => {
                      const practitioner = booking.doctorProfile 
                        ? `Dr. ${booking.doctorProfile.user?.profile?.firstName || ''} ${booking.doctorProfile.user?.profile?.lastName || ''}`.trim()
                        : booking.providerProfile?.legalName || 'N/A';
                      const patientName = `${booking.patient?.profile?.firstName || ''} ${booking.patient?.profile?.lastName || ''}`.trim() || 'Patient';

                      return (
                        <tr key={booking.id} className="hover:bg-slate-800/20">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                            {formatDate(`${booking.scheduledDate.split('T')[0]}T${booking.scheduledTime}:00`)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400">
                            {booking.bookingReference}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-semibold text-slate-200">{isPatient ? practitioner : patientName}</p>
                            <p className="text-[10px] text-slate-500">{booking.appointmentType}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-300">
                            {formatCurrency(booking.totalFee)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              booking.status === 'COMPLETED' || booking.status === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : booking.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No appointment bookings recorded for this user.</p>
            )}
          </div>

          {/* Audit Logs list */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-400" />
              Recent Actions Audit Log
            </h4>

            {user.auditLogs && user.auditLogs.length > 0 ? (
              <div className="space-y-3.5">
                {user.auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{log.action}</p>
                      <p className="text-[10px] text-slate-500">IP: {log.ipAddress || 'N/A'}</p>
                    </div>
                    <span className="text-slate-400 text-[10px]">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent actions logged for this user.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
