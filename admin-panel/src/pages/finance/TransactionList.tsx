import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Search, Check, AlertCircle } from 'lucide-react';
import api from '../../config/api';
import { Badge } from '../../components/ui/badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const TransactionList: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'PAYOUTS'>('PAYMENTS');
  const [paySearch, setPaySearch] = useState('');
  const [payPage, setPayPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [refundTarget, setRefundTarget] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Fetch payments list
  const { data: payData, isLoading: payLoading, error: payError } = useQuery({
    queryKey: ['paymentsLedger', paySearch, payPage],
    queryFn: async () => {
      const params: any = { page: payPage, limit: 10 };
      if (paySearch) params.search = paySearch;
      const res = await api.get('/admin/finance/payments', { params });
      return res.data;
    },
    enabled: activeTab === 'PAYMENTS',
  });

  // Fetch payouts list
  const { data: payoutData, isLoading: payoutLoading, error: payoutError } = useQuery({
    queryKey: ['payoutsQueue'],
    queryFn: async () => {
      const res = await api.get('/admin/finance/payouts');
      return res.data;
    },
    enabled: activeTab === 'PAYOUTS',
  });

  // Payout Approval mutation
  const approvePayoutMutation = useMutation({
    mutationFn: async ({ payoutId, utr, bank }: { payoutId: string; utr: string; bank: string }) => {
      setProcessing(true);
      await api.post(`/admin/finance/payouts/approve/${payoutId}`, { utrNumber: utr, bankAccount: bank });
    },
    onSuccess: () => {
      alert('Payout successfully processed');
      setSelectedPayout(null);
      setUtrNumber('');
      setBankAccount('');
      queryClient.invalidateQueries({ queryKey: ['payoutsQueue'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to approve payout');
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      setProcessing(true);
      await api.post(`/admin/finance/refund/${paymentId}`, { reason });
    },
    onSuccess: () => {
      alert('Refund processed successfully');
      setRefundTarget(null);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['paymentsLedger'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to process refund');
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    approvePayoutMutation.mutate({
      payoutId: selectedPayout.id,
      utr: utrNumber,
      bank: bankAccount || selectedPayout.bankAccount || 'Processed bank account',
    });
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;
    refundMutation.mutate({
      paymentId: refundTarget.id,
      reason: refundReason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          Financial Control Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review system transaction invoices, process bank payouts, and handle customer refunds</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`pb-4 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'PAYMENTS'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Payments Register
        </button>
        <button
          onClick={() => setActiveTab('PAYOUTS')}
          className={`pb-4 text-sm font-semibold transition-all duration-200 border-b-2 -mb-[2px] ${
            activeTab === 'PAYOUTS'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Payout Approvals
        </button>
      </div>

      {/* Tab content: PAYMENTS */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="max-w-md relative bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by order ID or booking ref..."
              value={paySearch}
              onChange={(e) => { setPaySearch(e.target.value); setPayPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          {/* Table */}
          {payLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading payments data...</div>
          ) : payError || !payData ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">Error loading payments.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4">Paid Timestamp</th>
                      <th className="px-6 py-4">Booking Ref</th>
                      <th className="px-6 py-4">Patient Name</th>
                      <th className="px-6 py-4">Doctor / Clinic</th>
                      <th className="px-6 py-4">Paid Method</th>
                      <th className="px-6 py-4">Gross Amount</th>
                      <th className="px-6 py-4">Invoice Status</th>
                      <th className="px-6 py-4 text-center">Refunding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {payData.payments.length > 0 ? (
                      payData.payments.map((pay: any) => {
                        const patientName = `${pay.booking?.patient?.profile?.firstName || ''} ${pay.booking?.patient?.profile?.lastName || ''}`.trim() || 'Patient';
                        const vendorName = pay.booking?.doctorProfile 
                          ? `Dr. ${pay.booking.doctorProfile.user?.profile?.firstName || ''} ${pay.booking.doctorProfile.user?.profile?.lastName || ''}`.trim()
                          : pay.booking?.providerProfile?.legalName || 'N/A';

                        return (
                          <tr key={pay.id} className="hover:bg-slate-800/20 transition-all duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                              {formatDate(pay.paidAt || pay.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                              {pay.booking?.bookingReference || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-200">{patientName}</p>
                              <p className="text-[10px] text-slate-500">{pay.booking?.patient?.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                              {vendorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-850 text-slate-400 font-bold uppercase">
                                {pay.method || pay.gatewayName || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-200">
                              {formatCurrency(pay.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={
                                pay.status === 'PAID' 
                                  ? 'success' 
                                  : pay.status === 'PENDING' 
                                  ? 'warning' 
                                  : pay.status === 'REFUNDED'
                                  ? 'info'
                                  : 'error'
                              }>
                                {pay.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {pay.status === 'PAID' && (
                                <button
                                  onClick={() => setRefundTarget(pay)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all duration-200"
                                >
                                  Trigger Refund
                                </button>
                              )}
                              {pay.status === 'REFUNDED' && (
                                <span className="text-[10px] text-slate-500 font-bold">Processed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                          No payment transactions recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {payData.pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950/40 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Showing page <strong className="text-slate-200">{payData.pagination.page}</strong> of{' '}
                    <strong className="text-slate-200">{payData.pagination.pages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={payPage === 1}
                      onClick={() => setPayPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold"
                    >
                      Previous
                    </button>
                    <button
                      disabled={payPage === payData.pagination.pages}
                      onClick={() => setPayPage(p => Math.min(payData.pagination.pages, p + 1))}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab content: PAYOUTS */}
      {activeTab === 'PAYOUTS' && (
        <div className="space-y-6">
          {payoutLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading payouts approval queue...</div>
          ) : payoutError || !payoutData ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">Error loading payouts queue.</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Vendor Partner</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Platform Fee</th>
                      <th className="px-6 py-4">Payout Amount</th>
                      <th className="px-6 py-4">Bank Reference</th>
                      <th className="px-6 py-4">Payout Status</th>
                      <th className="px-6 py-4 text-center">Process</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {payoutData.payouts.length > 0 ? (
                      payoutData.payouts.map((payout: any) => {
                        const name = payout.doctorProfile 
                          ? `Dr. ${payout.doctorProfile.user?.profile?.firstName || ''} ${payout.doctorProfile.user?.profile?.lastName || ''}`.trim()
                          : payout.providerProfile?.legalName || 'N/A';
                        const email = payout.doctorProfile?.user?.email || payout.providerProfile?.user?.email;

                        return (
                          <tr key={payout.id} className="hover:bg-slate-800/20 transition-all duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                              {formatDate(payout.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-semibold text-slate-200">{name}</p>
                              <p className="text-[10px] text-slate-500">{email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">
                              {formatCurrency(payout.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-rose-400 font-medium">
                              -{formatCurrency(payout.platformFee)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-bold">
                              {formatCurrency(payout.netAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="font-semibold text-slate-200">{payout.bankAccount || 'Not Specified'}</p>
                                {payout.utrNumber && <p className="text-[10px] text-slate-500 font-mono">UTR: {payout.utrNumber}</p>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={
                                payout.status === 'SUCCESS' 
                                  ? 'success' 
                                  : payout.status === 'PROCESSING' 
                                  ? 'warning' 
                                  : 'error'
                              }>
                                {payout.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {payout.status !== 'SUCCESS' ? (
                                <button
                                  onClick={() => { setSelectedPayout(payout); setBankAccount(payout.bankAccount || ''); }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all duration-200 shadow-md shadow-emerald-500/10"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Verify Payout
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-bold">Disbursed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                          No pending payouts in approval queue.
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

      {/* Verify Payout Modal overlay */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleApproveSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5" />
              <h3 className="text-sm font-bold">Verify Partner Payout</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Enter bank transaction references to confirm platform disbursement. Disbursing a net amount of <strong className="text-emerald-400">{formatCurrency(selectedPayout.netAmount)}</strong>.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Partner Destination Bank Account
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC 501004889218 (IFSC HDFC0000102)"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  UTR Tracking Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-2026-8871203"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => { setSelectedPayout(null); setUtrNumber(''); }}
                className="px-4 py-2 bg-slate-850 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={processing || !utrNumber.trim()}
                className="px-4 py-2 bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-lg transition-all duration-200"
              >
                {processing ? 'Processing...' : 'Confirm Disbursed Success'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trigger Refund modal overlay */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleRefundSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold">Process Payment Refund</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              You are processing a full refund of <strong className="text-slate-200">{formatCurrency(refundTarget.amount)}</strong> back to the patient.
            </p>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Refund Reason Notes
              </label>
              <textarea
                required
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for manual refund, e.g. Customer dispute settlement, double payment..."
                className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
              />
            </div>

            <div className="flex justify-end gap-3 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => { setRefundTarget(null); setRefundReason(''); }}
                className="px-4 py-2 bg-slate-850 text-slate-300 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={processing || !refundReason.trim()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-950 rounded-lg transition-all duration-200"
              >
                {processing ? 'Processing...' : 'Submit Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
