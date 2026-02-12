import React from 'react'
import { Icon } from '@iconify/react'
import { Link, useLocation } from 'react-router-dom'

function AdminSidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: 'ic:baseline-dashboard', label: 'แดชบอร์ด' },
        { path: '/admin/products', icon: 'ic:baseline-inventory', label: 'ผลิตภัณฑ์' },
        { path: '/admin/orders', icon: 'ic:baseline-shopping-cart', label: 'คำสั่งซื้อ' },
        { path: '/admin/customers', icon: 'ic:baseline-people', label: 'ลูกค้า' },
        { path: '/admin/categories', icon: 'ic:baseline-category', label: 'หมวดหมู่' },
        { path: '/admin/brands', icon: 'ic:baseline-apple', label: 'แบรนด์' },
        { path: '/admin/coupons', icon: 'ic:baseline-local-offer', label: 'คูปอง' },
    ];

    return (
        <aside className="sticky top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col z-30 shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-6 flex items-center gap-3 border-b border-sea-light">
                <div className="w-10 h-10 bg-linear-to-br from-sea-primary to-sea-deep rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                    <Icon icon="ic:baseline-admin-panel-settings" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-sea-text leading-tight">แผงควบคุม</h2>
                    <p className="text-xs text-sea-subtext">ByteShop Manager</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    // Check if active: exact match for dashboard, startswith for others
                    const isActive = item.path === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-sea-light text-sea-primary font-semibold shadow-sm ring-1 ring-sea-primary/10'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-sea-primary'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sea-primary rounded-r-full" />
                            )}
                            <Icon
                                icon={item.icon}
                                width="22"
                                height="22"
                                className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`}
                            />
                            <span>{item.label}</span>
                            {isActive && (
                                <Icon icon="ic:round-chevron-right" className="ml-auto opacity-50" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group border border-transparent hover:border-red-100"
                >
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-inherit transition-shadow">
                        <Icon icon="ic:baseline-logout" width="20" height="20" />
                    </div>
                    <span className="font-medium">กลับสู่หน้าหลัก</span>
                </Link>
            </div>
        </aside>
    )
}

export default AdminSidebar