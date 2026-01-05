import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import GuestRoute from './components/GuestRoute.jsx';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              
              <Route path="/" element={<Home />} />
              
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
