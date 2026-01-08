import { useEffect, useMemo, useState } from 'react';
import {
  fetchAllServices,
  createService,
  updateService,
  deleteService
} from '../../utils/adminApi.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';

const pageSize = 10;

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', service: null });

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchAllServices();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name?.toLowerCase().includes(search.toLowerCase()) ||
        service.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, categoryFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openCreateModal = () => {
    setModal({
      open: true,
      mode: 'create',
      service: {
        name: '',
        description: '',
        category: 'amc',
        price: '',
        basePrice: 0,
        active: true,
        displayOrder: 0
      }
    });
  };

  const openEditModal = (service) => {
    setModal({
      open: true,
      mode: 'edit',
      service: { ...service }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      const formData = new FormData(event.target);
      const payload = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price'),
        basePrice: parseFloat(formData.get('basePrice')) || 0,
        active: formData.get('active') === 'true',
        displayOrder: parseInt(formData.get('displayOrder')) || 0
      };

      if (modal.mode === 'create') {
        await createService(payload);
      } else {
        await updateService(modal.service._id, payload);
      }

      await loadServices();
      setModal({ open: false, mode: 'create', service: null });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to save service');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      setActionLoading(true);
      await deleteService(id);
      await loadServices();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete service');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading services..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">Catalog</p>
          <h1 className="text-2xl font-semibold text-white">Services Management</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadServices}
            className="rounded-2xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Add Service
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Search service name or description">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:border-brand focus:outline-none"
        >
          <option value="all">All categories</option>
          <option value="amc">AMC</option>
          <option value="homeIT">Home IT</option>
        </select>
      </SearchBar>

      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.map((service) => (
              <tr key={service._id} className="hover:bg-slate-900/60">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{service.name}</p>
                  <p className="text-xs text-slate-400">{service.description || 'No description'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-brand">{service.price}</p>
                  {service.basePrice > 0 && (
                    <p className="text-xs text-slate-400">Base: ₹{service.basePrice}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      service.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="rounded-xl border border-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={actionLoading}
                      className="rounded-xl border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <EmptyState title="No services found" description="Try a different search or create a new service." />
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />

      <Modal
        title={modal.mode === 'create' ? 'Create Service' : 'Edit Service'}
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', service: null })}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Service Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={modal.service?.name}
              required
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              placeholder="e.g., PC/Laptop AMC"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Description</label>
            <textarea
              name="description"
              defaultValue={modal.service?.description}
              rows="3"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              placeholder="Service description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Category *</label>
              <select
                name="category"
                defaultValue={modal.service?.category}
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              >
                <option value="amc">AMC</option>
                <option value="homeIT">Home IT</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                defaultValue={modal.service?.displayOrder || 0}
                min="0"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Price Display *</label>
              <input
                type="text"
                name="price"
                defaultValue={modal.service?.price}
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
                placeholder="e.g., Starting from ₹399/month"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Base Price (₹)</label>
              <input
                type="number"
                name="basePrice"
                defaultValue={modal.service?.basePrice || 0}
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-white focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="active"
                defaultChecked={modal.service?.active !== false}
                value="true"
                className="rounded border-slate-700 bg-slate-900"
              />
              Active (visible on public website)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModal({ open: false, mode: 'create', service: null })}
              className="rounded-2xl border border-slate-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {actionLoading ? 'Saving...' : modal.mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
