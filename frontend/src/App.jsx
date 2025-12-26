import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import CreateCategory from './pages/admin/CreateCategory.jsx';
import CreateProduct from './pages/admin/CreateProduct.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Guest Routes (Redirect to / if logged in) */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Admin/Employee Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
                <Route path="/admin/create-category" element={<CreateCategory />} />
                <Route path="/admin/create-product" element={<CreateProduct />} />
              </Route>
            </Routes>
          </div>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
