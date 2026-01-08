import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center text-white">
    <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Oops</p>
    <h1 className="mt-3 text-5xl font-semibold">404</h1>
    <p className="mt-3 text-slate-400">We couldn&apos;t find that page.</p>
    <Link
      to="/admin"
      className="mt-6 rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white"
    >
      Back to dashboard
    </Link>
  </div>
);

export default NotFoundPage;

