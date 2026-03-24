import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/dashboard/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="accounts" element={<div>Account Management Page</div>} />
          <Route path="goals" element={<div>Goals Page</div>} />
          <Route path="reports" element={<div>Report Page</div>} />
          <Route path="transactions" element={<div>Transactions Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;