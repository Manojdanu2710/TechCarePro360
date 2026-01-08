import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => (
  <div className="flex min-h-screen bg-slate-950 text-slate-100">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;

