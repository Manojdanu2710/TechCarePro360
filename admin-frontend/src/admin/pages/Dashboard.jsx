import { useEffect, useMemo, useState } from 'react';
import {
  fetchBookings,
  fetchContacts,
  fetchServices,
  fetchStaff
} from '../../utils/adminApi.js';
import StatCards from '../components/StatCards.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const DashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [bookingRes, contactRes, staffRes, servicesRes] = await Promise.all([
          fetchBookings(),
          fetchContacts(),
          fetchStaff(),
          fetchServices()
        ]);
        setBookings(bookingRes);
        setContacts(contactRes);
        setStaff(staffRes);
        setServices(servicesRes);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return [
      { label: 'Total Bookings', value: bookings.length },
      { label: 'Pending', value: pending },
      { label: 'Completed', value: completed },
      { label: 'Active Staff', value: staff.filter((s) => s.active).length }
    ];
  }, [bookings, staff]);

  const statusChart = useMemo(() => {
    const counts = bookings.reduce(
      (acc, booking) => {
        const key = booking.status ?? 'pending';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [bookings]);

  if (loading) {
    return <LoadingOverlay message="Preparing analytics…" />;
  }

  if (error) {
    return <EmptyState title="Dashboard error" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-slate-500">Overview</p>
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
      </div>

      <StatCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Bookings by status</h2>
            <span className="text-sm text-slate-400">Last 90 days</span>
          </div>
          {statusChart.length === 0 ? (
            <EmptyState title="No bookings yet" description="Create bookings to see trends." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="status" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Latest bookings</h2>
            <span className="text-sm text-slate-400">Updated live</span>
          </div>
          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
              >
                <div>
                  <p className="text-base font-semibold text-white">{booking.name}</p>
                  <p className="text-sm text-slate-400">{booking.serviceType}</p>
                </div>
                <StatusBadge value={booking.status} />
              </div>
            ))}
            {bookings.length === 0 && (
              <EmptyState title="No bookings yet" description="New bookings will appear here." />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent contacts</h2>
          <ul className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <li key={contact._id} className="rounded-2xl border border-slate-800 p-4">
                <p className="font-semibold text-white">{contact.name}</p>
                <p className="text-sm text-slate-400">{contact.subject || 'No subject'}</p>
              </li>
            ))}
            {contacts.length === 0 && (
              <EmptyState title="No inquiries" description="Contact submissions appear here." />
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Available services</h2>
          <div className="grid gap-3">
            {Object.values(services).flat().map((service) => (
              <div key={service.id} className="rounded-2xl border border-slate-800 p-4">
                <p className="font-semibold text-white">{service.name}</p>
                <p className="text-sm text-slate-400">{service.description}</p>
                <p className="mt-2 text-sm text-brand-light">{service.price}</p>
              </div>
            ))}
            {Object.keys(services).length === 0 && (
              <EmptyState title="No services configured" description="Use backend to seed services." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

