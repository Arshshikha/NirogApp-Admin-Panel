import type { VerificationStatus, BookingStatus, PaymentStatus, TransactionStatus } from '../types';

export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);
};

export const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatOnlyDate = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getVerificationStatusBadgeClass = (status: VerificationStatus): string => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'PENDING':
    case 'UNDER_REVIEW':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'REJECTED':
    case 'SUSPENDED':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getBookingStatusBadgeClass = (status: BookingStatus): string => {
  switch (status) {
    case 'COMPLETED':
    case 'CONFIRMED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'PENDING':
    case 'RESCHEDULED':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'CANCELLED_BY_PATIENT':
    case 'CANCELLED_BY_PROVIDER':
    case 'REJECTED':
    case 'NO_SHOW':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getPaymentStatusBadgeClass = (status: PaymentStatus): string => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'UNPAID':
    case 'FAILED':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getTransactionStatusBadgeClass = (status: TransactionStatus): string => {
  switch (status) {
    case 'SUCCESS':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'PROCESSING':
    case 'INITIATED':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'FAILED':
    case 'REVERSED':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};
