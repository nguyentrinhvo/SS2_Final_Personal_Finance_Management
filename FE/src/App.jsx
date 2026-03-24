import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/dashboard/Home';
import axios from 'axios';

function App() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("Có lỗi xảy ra:", error);
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Default to Login page on launch */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
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