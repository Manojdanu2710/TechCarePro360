import { useEffect, useMemo, useState } from 'react';
import { fetchPayments, updatePaymentStatus } from '../../utils/adminApi.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';

const pageSize = 10;

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, payment: null, status: '' });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const booking = payment.booking || {};
      const matchesSearch =
        booking.name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.email?.toLowerCase().includes(search.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return { total, completed, pending, failed, totalAmount };
  }, [payments]);

  const openStatusModal = (payment) => {
    setStatusModal({
      open: true,
      payment,
      status: payment.status
    });
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData(event.target);
      await updatePaymentStatus(
        statusModal.payment._id,
        formData.get('status'),
        formData.get('notes')
      );
      await loadPayments();
      setStatusModal({ open: false, payment: null, status: '' });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading payments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Finance</p>
          <h1 className="text-2xl font-semibold text-white">Payments</h1>
        </div>
        <button
          onClick={loadPayments}
          className="rounded-2xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Total Payments</p>
          <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-green-400">{stats.completed}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-brand">₹{stats.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search customer, email, or transaction ID">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All methods</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="wallet">Wallet</option>
        </select>
      </SearchBar>

      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Booking</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.map((payment) => {
              const booking = payment.booking || {};
              return (
                <tr key={payment._id} className="hover:bg-slate-900/60">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{booking.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{booking.email || 'No email'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{booking.serviceType || 'N/A'}</p>
                    <p className="text-xs text-slate-400">ID: {booking._id?.slice(-8) || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-brand">₹{payment.amount?.toLocaleString() || '0'}</p>
                    {payment.refundAmount > 0 && (
                      <p className="text-xs text-rose-400">Refunded: ₹{payment.refundAmount}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs capitalize">
                      {payment.paymentMethod || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={payment.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-slate-400">
                      {payment.transactionId || payment.razorpayPaymentId || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString()
                      : payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openStatusModal(payment)}
                      className="rounded-xl border border-brand px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <EmptyState title="No payments found" description="Try a different search or filter." />
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />

      <Modal
        title="Update Payment Status"
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, payment: null, status: '' })}
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment Status *</label>
            <select
              name="status"
              defaultValue={statusModal.status}
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {statusModal.status === 'refunded' && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">Refund Amount</label>
              <input
                type="number"
                name="refundAmount"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
                placeholder="Enter refund amount"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-slate-300">Notes</label>
            <textarea
              name="notes"
              rows="3"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStatusModal({ open: false, payment: null, status: '' })}
              className="rounded-2xl border border-slate-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
