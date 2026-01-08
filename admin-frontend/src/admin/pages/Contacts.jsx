import { useEffect, useMemo, useState } from 'react';
import { fetchContacts } from '../../utils/adminApi.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';

const pageSize = 10;

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await fetchContacts();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filtered = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.email?.toLowerCase().includes(search.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' || (filter === 'unread' ? !contact.read : contact.read);
      return matchesSearch && matchesFilter;
    });
  }, [contacts, search, filter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  if (loading) {
    return <LoadingOverlay message="Loading contact inquiries..." />;
  }

  if (error && contacts.length === 0) {
    return <EmptyState title="Unable to load contacts" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Engagement</p>
          <h1 className="text-2xl font-semibold text-white">Contacts & inquiries</h1>
        </div>
        <button
          onClick={loadContacts}
          className="rounded-2xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search name, subject or email">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </SearchBar>

      <div className="space-y-4">
        {paginated.map((contact) => (
          <div
            key={contact._id}
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow shadow-slate-900/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">
                  {contact.name} ·{' '}
                  <span className="text-sm text-slate-400">{contact.email}</span>
                </p>
                <p className="text-sm text-slate-400">{contact.phone || 'No phone'}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  contact.read
                    ? 'border border-emerald-500/60 text-emerald-200'
                    : 'border border-amber-500/60 text-amber-200'
                }`}
              >
                {contact.read ? 'Read' : 'Unread'}
              </span>
            </div>
            <p className="mt-4 text-sm uppercase tracking-widest text-slate-500">
              {contact.subject || 'No subject'}
            </p>
            <p className="mt-2 text-base text-slate-100">{contact.message}</p>
          </div>
        ))}

        {paginated.length === 0 && (
          <EmptyState
            title="No contacts match"
            description="Try a different search or change the filter."
          />
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </div>
  );
};

export default ContactsPage;

