import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./routes/Protected.Route";
import AdminRoute from "./routes/Admin.Route";
import GuestRoute from "./routes/Guest.Route";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import OTP from "./pages/auth/OTP";
import Order from "./pages/Order";
import Checkout from "./pages/checkout";

import Dashboard from "./pages/admin/Dashboard";
import Forgot from "./pages/auth/Forgot";

import ProductListPage from "./pages/admin/ProductListPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import CategoryListPage from "./pages/admin/CategoryListPage";
import CategoryFormPage from "./pages/admin/CategoryFormPage";
import CouponListPage from "./pages/admin/CouponListPage";
import CouponFormPage from "./pages/admin/CouponFormPage";
import CustomerListPage from "./pages/admin/CustomerListPage";
import OrderListPage from "./pages/admin/OrderListPage";
import OrderFormPage from "./pages/admin/OrderFormPage";
import BrandListPage from "./pages/admin/BrandListPage";
import BrandFormPage from "./pages/admin/BrandFormPage";



function App() {
  return (
    <Router>
      <Routes>

        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="otp" element={<OTP />} />

          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<Forgot />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="order" element={<Order />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route element={<AdminRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="categories/:id" element={<CategoryFormPage />} />
            <Route path="coupons" element={<CouponListPage />} />
            <Route path="coupons/:id" element={<CouponFormPage />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/:id" element={<OrderFormPage />} />
            <Route path="brands" element={<BrandListPage />} />
            <Route path="brands/:id" element={<BrandFormPage />} />

          </Route>
        </Route>

      </Routes>

      <ToastContainer position="top-center" autoClose={1500} limit={3} newestOnTop closeOnClick />
    </Router>
  );
}

export default App;
