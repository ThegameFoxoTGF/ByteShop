import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminRoute from "./routes/Admin.Route";
import UserRoute from "./routes/User.Route";
import GuestRoute from "./routes/Guest.Route";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Forgot from "./pages/auth/Forgot";

import Profile from "./pages/Profile";
import ProfileLayout from "./layouts/ProfileLayout";
import OrderHistory from "./pages/OrderHistory";
import AddressList from "./pages/AddressList";
import Order from "./pages/Order";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import WishlistPage from "./pages/WishlistPage";

import Dashboard from "./pages/admin/Dashboard";
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

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />

          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<Forgot />} />
          </Route>

          {/* User Routes */}
          <Route element={<UserRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id" element={<Order />} />
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<Profile />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="address" element={<AddressList />} />
              <Route path="wishlist" element={<WishlistPage />} />
            </Route>
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
