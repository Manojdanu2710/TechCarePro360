import { useEffect, useMemo, useState } from 'react';
import { fetchStaff, createStaff, updateStaff, deleteStaff } from '../../utils/adminApi.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

const pageSize = 8;

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  location: '',
  skills: '',
  active: true
};

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, mode: 'add' });
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await fetchStaff();
      setStaff(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filtered = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.location?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'active' ? member.active : !member.active);
      return matchesSearch && matchesFilter;
    });
  }, [staff, search, filter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openModal = (mode, member = null) => {
    if (mode === 'edit' && member) {
      setForm({
        name: member.name,
        phone: member.phone,
        email: member.email ?? '',
        location: member.location,
        skills: member.skills?.join(', ') ?? '',
        active: member.active
      });
    } else {
      setForm(defaultForm);
    }
    setModal({ open: true, mode, member });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'add', member: null });
    setForm(defaultForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      skills: form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    };

    try {
      setSaving(true);
      if (modal.mode === 'add') {
        const created = await createStaff(payload);
        setStaff((prev) => [created, ...prev]);
      } else if (modal.mode === 'edit' && modal.member?._id) {
        const updated = await updateStaff(modal.member._id, payload);
        setStaff((prev) =>
          prev.map((member) => (member._id === modal.member._id ? updated : member))
        );
      }
      closeModal();
    } catch (err) {
      setError(err.message || 'Unable to save staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memberId) => {
    const confirmDelete = window.confirm('Delete this staff member?');
    if (!confirmDelete) return;

    try {
      await deleteStaff(memberId);
      setStaff((prev) => prev.filter((member) => member._id !== memberId));
    } catch (err) {
      setError(err.message || 'Unable to delete staff');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading staff roster..." />;
  }

  if (error && staff.length === 0) {
    return <EmptyState title="Unable to load staff" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Team</p>
          <h1 className="text-2xl font-semibold text-white">Staff management</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadStaff}
            className="rounded-2xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Refresh
          </button>
          <button
            onClick={() => openModal('add')}
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            + Add staff
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or location">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </SearchBar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginated.map((member) => (
          <div key={member._id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{member.name}</p>
                <p className="text-sm text-slate-400">{member.location}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  member.active
                    ? 'border border-emerald-500/60 text-emerald-200'
                    : 'border border-rose-500/60 text-rose-200'
                }`}
              >
                {member.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{member.email || 'No email'}</p>
            <p className="text-sm text-slate-400">{member.phone}</p>
            <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Skills</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(member.skills?.length ? member.skills : ['Generalist']).map((skill) => (
                <span key={skill} className="rounded-full border border-slate-700 px-3 py-1 text-xs">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('edit', member)}
                className="flex-1 rounded-2xl border border-slate-700 px-4 py-2 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member._id)}
                className="flex-1 rounded-2xl border border-rose-500/60 px-4 py-2 text-sm text-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {paginated.length === 0 && (
        <EmptyState title="No staff match" description="Try a different search or filter." />
      )}

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />

      <Modal
        title={modal.mode === 'add' ? 'Add staff member' : 'Edit staff member'}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Phone</label>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                value={form.email}
                type="email"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Location</label>
            <input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Skills (comma separated)</label>
            <input
              value={form.skills}
              onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
            />
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              className="h-4 w-4 rounded border border-slate-700 bg-slate-900"
            />
            Active
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="rounded-2xl border border-slate-700 px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? 'Saving...' : modal.mode === 'add' ? 'Add staff' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;

