import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Icon } from "@iconify/react";
import useClickOutside from "../hooks/ClickOutside";
import CartDrawer from "./CartDrawer";

function Navbar() {
  const { user, logout, is_admin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?keyword=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-sea-light transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <Link to="/" className="shrink-0 flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-linear-to-br from-sea-primary to-sea-deep flex items-center justify-center text-white shadow-lg group-hover:shadow-sea-primary/40 transition-all duration-500 group-hover:rotate-3">
              {/* Placeholder for actual logo image if available, otherwise icon */}
              <Icon icon="ic:round-shopping-bag" width="24" height="24" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-sea-text tracking-tight leading-none">
                Byte<span className="text-sea-primary">Shop</span>
              </span>
              <span className="text-[10px] font-medium text-sea-subtext tracking-wider uppercase">Premium Store</span>
            </div>
          </Link>

          {/* Search Section */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon icon="ic:round-search" className="h-5 w-5 text-sea-muted" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-sea-light/50 border border-transparent rounded-full text-sm text-sea-text placeholder-sea-muted focus:outline-none focus:bg-white focus:border-sea-primary/30 focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
            />
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => {
                const searchForm = document.getElementById('mobile-search-form');
                if (searchForm) searchForm.classList.toggle('hidden');
              }}
              className="md:hidden p-2.5 rounded-full border border-sea-muted text-sea-subtext hover:bg-sea-light hover:text-sea-primary transition-all duration-200 group cursor-pointer"
            >
              <Icon icon="ic:round-search" width="24" height="24" className="transform group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full border border-sea-muted text-sea-subtext hover:bg-sea-light hover:text-sea-primary transition-all duration-200 group cursor-pointer"
            >
              <Icon icon="ic:outline-shopping-bag" width="24" height="24" className="transform group-hover:scale-110 transition-transform duration-200" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={ref}>
                <button
                  onClick={() => setOpen(!open)}
                  className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${open ? 'bg-sea-light border-sea-primary/30 ring-2 ring-sea-primary/10' : 'bg-white border-slate-200 hover:border-sea-primary/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-sea-primary to-sea-teal p-[2px]">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sea-primary font-bold text-xs">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-sea-text max-w-[100px] truncate hidden sm:block">
                    {user.first_name || 'User'}
                  </span>
                  <Icon icon="ic:round-keyboard-arrow-down" className={`text-sea-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute right-0 mt-5 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-xs text-sea-muted uppercase font-semibold">บัญชีผู้ใช้</p>
                      <p className="text-sm font-medium text-sea-text truncate">{user.email || 'user@example.com'}</p>
                    </div>

                    <div className="px-2 space-y-0.5">
                      <button onClick={() => { navigate("/profile"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sea-subtext hover:bg-sea-light hover:text-sea-primary rounded-xl transition-colors text-left group cursor-pointer">
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-sea-primary transition-colors">
                          <Icon icon="ic:round-person-outline" width="18" height="18" />
                        </div>
                        โปรไฟล์ของฉัน
                      </button>

                      <button onClick={() => { navigate("/profile/orders"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sea-subtext hover:bg-sea-light hover:text-sea-primary rounded-xl transition-colors text-left group cursor-pointer">
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-sea-primary transition-colors">
                          <Icon icon="ic:round-history" width="18" height="18" />
                        </div>
                        ประวัติคำสั่งซื้อ
                      </button>

                      <button onClick={() => { navigate("/profile/address"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sea-subtext hover:bg-sea-light hover:text-sea-primary rounded-xl transition-colors text-left group cursor-pointer">
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-sea-primary transition-colors">
                          <Icon icon="ic:round-location-on" width="18" height="18" />
                        </div>
                        ที่อยู่ของฉัน
                      </button>

                      <button onClick={() => { navigate("/profile/wishlist"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-sea-subtext hover:bg-sea-light hover:text-sea-primary rounded-xl transition-colors text-left group cursor-pointer">
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-sea-primary transition-colors">
                          <Icon icon="ic:round-favorite" width="18" height="18" />
                        </div>
                        สิ่งที่อยากได้
                      </button>
                    </div>

                    {is_admin && (
                      <div className="my-2 border-t border-slate-50 pt-2 px-2">
                        <button onClick={() => { navigate("/admin"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left cursor-pointer">
                          <Icon icon="ic:round-admin-panel-settings" width="18" height="18" />
                          ระบบจัดการหลังร้าน
                        </button>
                      </div>
                    )}

                    <div className="mt-1 border-t border-slate-50 pt-1 px-2 pb-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium cursor-pointer">
                        <Icon icon="ic:round-log-out" width="18" height="18" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sea-primary text-white font-medium text-sm hover:bg-sea-primary-hover shadow-lg shadow-sea-primary/30 transition-all hover:shadow-sea-primary/50 hover:-translate-y-0.5">
                <span>เข้าสู่ระบบ</span>
                <Icon icon="ic:round-arrow-forward" />
              </Link>
            )}
          </div>

        </div>

        {/* Mobile Search Form (Hidden by default) */}
        <form id="mobile-search-form" onSubmit={handleSearch} className="hidden md:hidden pb-4 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon icon="ic:round-search" className="h-5 w-5 text-sea-muted" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-sea-light/50 border border-transparent rounded-xl text-sm text-sea-text placeholder-sea-muted focus:outline-none focus:bg-white focus:border-sea-primary/30 focus:ring-4 focus:ring-sea-primary/10 transition-all duration-300"
            />
          </div>
        </form>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}

export default Navbar;
