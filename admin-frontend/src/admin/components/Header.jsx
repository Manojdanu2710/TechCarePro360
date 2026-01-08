import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const mobileLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Bookings', to: '/admin/bookings' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Contacts', to: '/admin/contacts' },
  { label: 'Staff', to: '/admin/staff' },
  { label: 'Services', to: '/admin/services' }
];

const Header = () => {
  const { admin, logout } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/80 px-4 py-4 text-white shadow-sm shadow-slate-900/40 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="lg:hidden">
          <p className="text-xs uppercase tracking-widest text-slate-500">TechCare</p>
          <Link to="/admin" className="text-xl font-semibold">
            Admin Panel
          </Link>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2">
          <div>
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="font-semibold">{admin?.email ?? 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="flex flex-wrap gap-2 lg:hidden">
        {mobileLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              [
                'rounded-2xl px-4 py-2 text-xs font-semibold transition',
                isActive
                  ? 'bg-brand text-white'
                  : 'border border-slate-800 text-slate-300 hover:bg-slate-800'
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Header;

