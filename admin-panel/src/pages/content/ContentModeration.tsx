import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Check } from 'lucide-react';
import api from '../../config/api';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../utils/formatters';

export const ContentModeration: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'AUDIT'>('REPORTS');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch reports list
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['reportsList'],
    queryFn: async () => {
      const res = await api.get('/admin/moderation/reports');
      return res.data;
    },
    enabled: activeTab === 'REPORTS',
  });

  // Fetch audit logs
  const { data: auditData, isLoading: auditLoading, error: auditError } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await api.get('/admin/moderation/audit-logs');
      return res.data;
    },
    enabled: activeTab === 'AUDIT',
  });

  // Mutation to resolve report
  const resolveReportMutation = useMutation({
    mutationFn: async ({ reportId, notes }: { reportId: string; notes: string }) => {
      setProcessing(true);
      await api.post(`/admin/moderation/reports/resolve/${reportId}`, { resolvedNotes: notes });
    },
    onSuccess: () => {
      alert('Report ticket marked as resolved successfully');
      setSelectedReport(null);
      setResolutionNotes('');
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to resolve report');
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    resolveReportMutation.mutate({
      reportId: selectedReport.id,
      notes: resolutionNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          Moderation & Audits Panel
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review spam reports, flag inappropriate content comments, and view operations logs</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`pb-4 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'REPORTS'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Flagged Reports Tickets
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-4 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'AUDIT'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          System Audit Logs
        </button>
      </div>

      {/* Tab: REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          {reportsLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading reports tickets...</div>
          ) : reportsError || !reportsData ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">Error loading reports.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4">Reported Date</th>
                      <th className="px-6 py-4">Reported By</th>
                      <th className="px-6 py-4">Subject Type</th>
                      <th className="px-6 py-4">Flag Reason</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {reportsData.reports.length > 0 ? (
                      reportsData.reports.map((report: any) => {
                        const reporterName = `${report.reportedBy?.profile?.firstName || ''} ${report.reportedBy?.profile?.lastName || ''}`.trim() || 'Reporter';
                        return (
                          <tr key={report.id} className="hover:bg-slate-800/20 transition-all duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                              {formatDate(report.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-200">{reporterName}</p>
                              <p className="text-[10px] text-slate-500">{report.reportedBy?.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-850 text-slate-400 font-bold uppercase">
                                {report.subjectType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-amber-400">
                              {report.reason}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-slate-400">
                              {report.description || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={report.isResolved ? 'success' : 'error'}>
                                {report.isResolved ? 'Resolved' : 'Open Ticket'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {!report.isResolved ? (
                                <button
                                  onClick={() => setSelectedReport(report)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all duration-200"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Resolve
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-bold">Closed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                          No report tickets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          {auditLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading system audit logs...</div>
          ) : auditError || !auditData ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">Error loading logs.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Actor</th>
                      <th className="px-6 py-4">Executed Action</th>
                      <th className="px-6 py-4">Affected Entity</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Metadata Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-355 text-slate-300">
                    {auditData.logs.length > 0 ? (
                      auditData.logs.map((log: any) => {
                        const actorName = log.actor 
                          ? `${log.actor.profile?.firstName || ''} ${log.actor.profile?.lastName || ''}`.trim() || log.actor.email
                          : 'System Process';
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/20 transition-all duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-200">{actorName}</p>
                              <p className="text-[10px] text-slate-500">{log.actor?.email || 'automated@nirog.com'}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-emerald-400 font-semibold">
                              {log.action}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                              {log.entityType} ({log.entityId?.slice(0, 8) || 'system'})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono">
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-slate-400 font-mono text-[10px]">
                              {JSON.stringify(log.metadata || {})}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                          No audit entries logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolve Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleResolveSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5" />
              <h3 className="text-sm font-bold">Resolve Flagged Ticket</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Provide resolution actions notes to close support ticket ID <strong className="text-slate-200 font-mono">{selectedReport.id.slice(0, 8)}</strong>.
            </p>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Resolution Comments
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe resolution notes, e.g. Flagged comments soft-deleted, review verified ok..."
                className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>

            <div className="flex justify-end gap-3 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => { setSelectedReport(null); setResolutionNotes(''); }}
                className="px-4 py-2 bg-slate-850 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing || !resolutionNotes.trim()}
                className="px-4 py-2 bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-lg transition-all duration-200"
              >
                {processing ? 'Processing...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
