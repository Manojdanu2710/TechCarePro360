import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './admin/components/ProtectedRoute.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import LoginPage from './admin/pages/Login.jsx';
import DashboardPage from './admin/pages/Dashboard.jsx';
import BookingsPage from './admin/pages/Bookings.jsx';
import ContactsPage from './admin/pages/Contacts.jsx';
import StaffPage from './admin/pages/Staff.jsx';
import ServicesPage from './admin/pages/Services.jsx';
import PaymentsPage from './admin/pages/Payments.jsx';
import NotFoundPage from './admin/pages/NotFound.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

