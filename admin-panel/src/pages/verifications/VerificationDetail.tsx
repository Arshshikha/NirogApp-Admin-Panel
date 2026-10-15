import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../config/api';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatters';

export const VerificationDetail: React.FC = () => {
  const { type, profileId } = useParams();
  const navigate = useNavigate();
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Re-use verification list query to pull current target record details
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
        Fetching profile details...
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

  const profile = data.queue.find((item: any) => item.id === profileId && item.type.toLowerCase() === type?.toLowerCase());

  if (!profile) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <p className="text-slate-400 text-sm">Profile verification request not found in queue (it may have been resolved).</p>
        <button 
          onClick={() => navigate('/verifications')}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    setErrorMsg(null);
    setProcessing(true);

    try {
      await api.post(`/admin/verifications/process/${profileId}`, {
        type: profile.type,
        action,
        notes: action === 'REJECT' ? rejectNotes : 'Approved credentials',
      });
      navigate('/verifications');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to process request. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header back navigation */}
      <button
        onClick={() => navigate('/verifications')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Verification Queue
      </button>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 text-xl font-bold mb-3 shadow-inner">
                {profile.name[0]}
              </div>
              <h3 className="text-base font-bold text-slate-100">{profile.name}</h3>
              <p className="text-xs text-slate-500">{profile.email}</p>

              <Badge variant="warning" className="mt-4">
                {profile.verificationStatus}
              </Badge>
            </div>

            <div className="w-full h-px bg-slate-800" />

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Registration Details
              </h4>
              <div className="grid grid-cols-2 gap-y-3">
                <span className="text-slate-500">Record Type</span>
                <span className="text-slate-200 font-semibold text-right">{profile.type}</span>

                <span className="text-slate-500">Reg Reference</span>
                <span className="text-slate-200 font-mono text-right">{profile.registrationNumber}</span>

                {profile.type === 'DOCTOR' && (
                  <>
                    <span className="text-slate-500">Medical Category</span>
                    <span className="text-slate-200 text-right">{profile.category}</span>

                    <span className="text-slate-500">Experience</span>
                    <span className="text-slate-200 text-right">{profile.experience} years</span>
                  </>
                )}

                {profile.type === 'STUDENT' && (
                  <>
                    <span className="text-slate-500">College / Inst.</span>
                    <span className="text-slate-200 text-right">{profile.institutionName}</span>

                    <span className="text-slate-500">Course of Study</span>
                    <span className="text-slate-200 text-right">{profile.courseOfStudy} (Yr {profile.yearOfStudy})</span>
                  </>
                )}

                {profile.type === 'PROVIDER' && (
                  <>
                    <span className="text-slate-500">Facility Type</span>
                    <span className="text-slate-200 text-right">{profile.providerType}</span>
                  </>
                )}

                <span className="text-slate-500">Submitted On</span>
                <span className="text-slate-200 text-right">{formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="flex gap-2 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Approval controls */}
            {profile.verificationStatus !== 'APPROVED' && (
              <div className="flex gap-3">
                <button
                  disabled={processing}
                  onClick={() => handleAction('APPROVE')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  disabled={processing}
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Credential documents preview panel */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[500px] p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-200">Credentials Document Viewer</h4>
            </div>

            {profile.documentUrl ? (
              <div className="flex-1 border border-slate-800 bg-slate-950 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-8">
                {profile.documentUrl.endsWith('.pdf') ? (
                  <iframe
                    src={profile.documentUrl}
                    title="Credentials Document Preview"
                    className="w-full h-full min-h-[400px] border-0"
                  />
                ) : (
                  <img
                    src={profile.documentUrl}
                    alt="License or identity verification files"
                    className="max-h-[450px] object-contain rounded border border-slate-850 shadow-lg"
                  />
                )}
                <div className="mt-4 text-center">
                  <a
                    href={profile.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    Open Document in New Tab
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <FileText className="w-12 h-12 text-slate-700 mb-2" />
                <p>No credential documents or licensing papers were uploaded with this registration.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason input Modal overlay */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <X className="w-5 h-5" />
              <h3 className="text-sm font-bold">Reject Verification Request</h3>
            </div>
            <p className="text-xs text-slate-400">
              Please specify the exact reasons for rejecting the applicant's credentials. This note will be recorded in the verification audit trail.
            </p>
            <textarea
              required
              rows={4}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Invalid license number registration, registration certificate expired, mismatched name details..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            />
            <div className="flex justify-end gap-3 text-xs font-bold">
              <button
                disabled={processing}
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                disabled={processing || !rejectNotes.trim()}
                onClick={() => handleAction('REJECT')}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-950 rounded-lg transition-all duration-200"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetail;
