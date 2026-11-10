'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  RotateCcw,
  FileText,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { PaymentTransactionDTO } from '@/lib/payments/repository';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransactionDTO[]>([]);
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    succeededCount: 0,
    refundedCount: 0,
    failedCount: 0,
    totalVolume: 0,
    refundedVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Refund Modal State
  const [selectedTx, setSelectedTx] = useState<PaymentTransactionDTO | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer requested refund / billing adjustment');
  const [refunding, setRefunding] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search: searchTerm,
        gateway: gatewayFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/v1/admin/transactions?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
        setMetrics(data.data.metrics || {});
      }
    } catch {
      setNotification({ type: 'error', text: 'Failed to load transaction ledger.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, gatewayFilter, statusFilter]);

  const handleOpenRefund = (tx: PaymentTransactionDTO) => {
    setSelectedTx(tx);
    setIsRefundModalOpen(true);
  };

  const handleExecuteRefund = async () => {
    if (!selectedTx) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/v1/admin/transactions/${selectedTx.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refundReason }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Refund executed for transaction ${selectedTx.transactionNumber}.`,
        });
        setIsRefundModalOpen(false);
        fetchTransactions();
      } else {
        setNotification({ type: 'error', text: data.error?.message || 'Refund failed' });
      }
    } catch {
      setNotification({ type: 'error', text: 'Network error processing refund' });
    } finally {
      setRefunding(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/v1/admin/transactions/export';
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            <span>Financial Transactions Ledger &amp; Refunds</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time audit ledger across Indian, International, and Crypto payment gateways with verified refund triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Top Ledger Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Volume Settled</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${metrics.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">{metrics.succeededCount} successful charges</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Transactions</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalCount}</div>
          <span className="text-[11px] text-slate-400">Ledger records across all gateways</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Refunded Volume</span>
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            ${metrics.refundedVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">{metrics.refundedCount} transactions refunded</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Failed Payment Declines</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{metrics.failedCount}</div>
          <span className="text-[11px] text-slate-400">Protected by 7-day grace period</span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xs overflow-hidden space-y-4">
        {/* Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference, email, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
              <option value="phonepe">PhonePe</option>
              <option value="cashfree">Cashfree</option>
              <option value="nowpayments">NOWPayments (Crypto)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCEEDED">Succeeded</option>
              <option value="REFUNDED">Refunded</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Gateway &amp; Method</th>
                <th className="px-4 py-3.5">Gateway Reference</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date (UTC)</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading ledger transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const statusVariant =
                    tx.status === 'SUCCEEDED'
                      ? 'emerald'
                      : tx.status === 'REFUNDED'
                      ? 'warning'
                      : tx.status === 'FAILED'
                      ? 'danger'
                      : 'slate';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        {tx.transactionNumber}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-200">{tx.customerName || 'Workspace Member'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{tx.customerEmail}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-200">{tx.gatewayName}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                        {tx.gatewayPaymentId || '—'}
                      </td>
                      <td className="px-4 py-4 font-bold text-white font-mono">
                        {tx.currency === 'INR' ? '₹' : '$'}
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant} size="sm">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {tx.status === 'SUCCEEDED' && !tx.isRefunded ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRefund(tx)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            Refund
                          </button>
                        ) : tx.isRefunded ? (
                          <span className="text-[11px] text-amber-500 font-medium">Refunded</span>
                        ) : (
                          <span className="text-[11px] text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Execute Verified Refund */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title={`Execute Refund for ${selectedTx?.transactionNumber || ''}`}
        size="md"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold">Important Refund Policy Notice</p>
                <p className="mt-0.5">
                  Refunding will reverse ${selectedTx.amount} {selectedTx.currency} to the customer through {selectedTx.gatewayName} and mark the transaction as REFUNDED in the ledger.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-300">Customer</label>
              <p className="font-mono text-slate-400">{selectedTx.customerEmail}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-300">Gateway Reference</label>
              <p className="font-mono text-slate-400">{selectedTx.gatewayPaymentId || 'N/A'}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Refund Reason</label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                disabled={refunding}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 flex items-center gap-1.5"
              >
                {refunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Refund</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
