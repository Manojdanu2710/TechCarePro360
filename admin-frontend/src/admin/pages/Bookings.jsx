import { useEffect, useMemo, useState } from 'react';
import {
  fetchBookings,
  updateBookingStatus,
  assignStaffToBooking,
  fetchStaff
} from '../../utils/adminApi.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

const pageSize = 8;

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignModal, setAssignModal] = useState({ open: false, bookingId: null, staffId: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingRes, staffRes] = await Promise.all([fetchBookings(), fetchStaff()]);
      setBookings(bookingRes);
      setStaff(staffRes);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.name?.toLowerCase().includes(search.toLowerCase()) ||
        booking.email?.toLowerCase().includes(search.toLowerCase()) ||
        booking.phone?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleStatusChange = async (bookingId, status) => {
    try {
      setActionLoading(true);
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((booking) => (booking._id === bookingId ? { ...booking, status } : booking))
      );
    } catch (err) {
      setError(err.message || 'Unable to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const openAssignModal = (bookingId) => {
    setAssignModal({
      open: true,
      bookingId,
      staffId: bookings.find((booking) => booking._id === bookingId)?.assignedStaff?._id || ''
    });
  };

  const handleAssignStaff = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      await assignStaffToBooking(assignModal.bookingId, assignModal.staffId);
      await loadData();
      setAssignModal({ open: false, bookingId: null, staffId: '' });
    } catch (err) {
      setError(err.message || 'Unable to assign staff');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading bookings..." />;
  }

  if (error && bookings.length === 0) {
    return <EmptyState title="Something went wrong" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Operations</p>
          <h1 className="text-2xl font-semibold text-white">Bookings</h1>
        </div>
        <button
          onClick={loadData}
          className="rounded-2xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search name, email or phone">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </SearchBar>

      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Schedule</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Assigned Staff</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.map((booking) => (
              <tr key={booking._id} className="hover:bg-slate-900/60">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{booking.name}</p>
                  <p className="text-xs text-slate-400">{booking.email || 'No email'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{booking.serviceType}</p>
                  <p className="text-xs text-slate-400">{booking.city}</p>
                </td>
                <td className="px-6 py-4">
                  <p>{booking.preferredDate || 'TBD'}</p>
                  <p className="text-xs text-slate-400">{booking.preferredTime || 'Flexible'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge value={booking.status} />
                    <select
                      className="rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-white focus:border-brand focus:outline-none"
                      value={booking.status}
                      disabled={actionLoading}
                      onChange={(event) => handleStatusChange(booking._id, event.target.value)}
                    >
                      {['pending', 'assigned', 'completed', 'cancelled'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {booking.assignedStaff ? (
                    <div>
                      <p className="font-semibold">{booking.assignedStaff.name}</p>
                      <p className="text-xs text-slate-400">{booking.assignedStaff.phone}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="rounded-xl border border-brand px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/20"
                    onClick={() => openAssignModal(booking._id)}
                  >
                    Assign Staff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <EmptyState title="No bookings match" description="Try another search or filter." />
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />

      <Modal
        title="Assign staff"
        open={assignModal.open}
        onClose={() => setAssignModal({ open: false, bookingId: null, staffId: '' })}
      >
        <form onSubmit={handleAssignStaff} className="space-y-4">
          <select
            value={assignModal.staffId}
            onChange={(event) => setAssignModal((prev) => ({ ...prev, staffId: event.target.value }))}
            required
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
          >
            <option value="">Select staff</option>
            {staff.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} — {member.location}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAssignModal({ open: false, bookingId: null, staffId: '' })}
              className="rounded-2xl border border-slate-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !assignModal.staffId}
              className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {actionLoading ? 'Saving...' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingsPage;

