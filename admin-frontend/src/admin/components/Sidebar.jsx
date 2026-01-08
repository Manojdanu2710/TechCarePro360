import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Bookings', to: '/admin/bookings' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Contacts', to: '/admin/contacts' },
  { label: 'Staff', to: '/admin/staff' },
  { label: 'Services', to: '/admin/services' }
];

const Sidebar = () => {
  const items = useMemo(() => navItems, []);

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950/80 p-6 lg:flex">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-slate-400">TechCare</p>
        <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand/20 text-white shadow-inner shadow-brand/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              ].join(' ')
            }
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-brand" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
        <p className="text-sm text-slate-400">Need help?</p>
        <p className="text-lg font-semibold text-white">support@techcare.com</p>
      </div>
    </aside>
  );
};

export default Sidebar;

