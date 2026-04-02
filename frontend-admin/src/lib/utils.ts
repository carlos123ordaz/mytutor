import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), fmt);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'MMM d, yyyy HH:mm');
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export type ReservationStatus =
  | 'pending_payment_upload'
  | 'pending_review'
  | 'confirmed'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'no_show';

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending_payment_upload: 'bg-yellow-100 text-yellow-800',
    pending_review: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    no_show: 'bg-slate-200 text-slate-700',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_payment_upload: 'Pending Payment',
    pending_review: 'Pending Review',
    confirmed: 'Confirmed',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    pending: 'Pending',
    approved: 'Approved',
    active: 'Active',
    inactive: 'Inactive',
  };
  return map[status] ?? status;
}
