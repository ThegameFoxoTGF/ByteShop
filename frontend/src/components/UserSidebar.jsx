import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';

function UserSidebar() {
    const { user } = useAuth();

    const activeClassName = "w-full text-left px-6 py-4 flex items-center gap-3 transition-colors bg-sea-primary/5 text-sea-primary border-l-4 border-sea-primary";
    const inactiveClassName = "w-full text-left px-6 py-4 flex items-center gap-3 transition-colors text-slate-600 hover:bg-slate-50 border-l-4 border-transparent";

    return (
        <div className="w-full md:w-64 shrink-0 space-y-4 md:space-y-6 md:sticky md:top-24">
            {/* User Info Card - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 mx-auto bg-sea-primary/10 rounded-full flex items-center justify-center text-sea-primary mb-4">
                    <Icon icon="ic:round-person" width="48" />
                </div>
                <h2 className="font-bold text-lg text-sea-text truncate">{user?.first_name || user?.email?.split('@')[0]}</h2>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto md:overflow-hidden flex flex-row md:flex-col scrollbar-hide py-2 md:py-0">
                <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) => `shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 text-sm md:text-base whitespace-nowrap ${isActive ? 'border-sea-primary text-sea-primary bg-sea-primary/5 md:bg-transparent' : 'border-transparent text-slate-600 hover:text-sea-primary'}`}
                >
                    <Icon icon="ic:round-manage-accounts" className="text-lg md:text-xl" /> <span className="md:inline">ข้อมูลส่วนตัว</span>
                </NavLink>
                <NavLink
                    to="/profile/orders"
                    className={({ isActive }) => `shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 text-sm md:text-base whitespace-nowrap ${isActive ? 'border-sea-primary text-sea-primary bg-sea-primary/5 md:bg-transparent' : 'border-transparent text-slate-600 hover:text-sea-primary'}`}
                >
                    <Icon icon="ic:round-history" className="text-lg md:text-xl" /> <span className="md:inline">ประวัติคำสั่งซื้อ</span>
                </NavLink>
                <NavLink
                    to="/profile/address"
                    className={({ isActive }) => `shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 text-sm md:text-base whitespace-nowrap ${isActive ? 'border-sea-primary text-sea-primary bg-sea-primary/5 md:bg-transparent' : 'border-transparent text-slate-600 hover:text-sea-primary'}`}
                >
                    <Icon icon="ic:round-location-on" className="text-lg md:text-xl" /> <span className="md:inline">ที่อยู่ของฉัน</span>
                </NavLink>
                <NavLink
                    to="/profile/wishlist"
                    className={({ isActive }) => `shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 transition-colors border-b-2 md:border-b-0 md:border-l-4 text-sm md:text-base whitespace-nowrap ${isActive ? 'border-sea-primary text-sea-primary bg-sea-primary/5 md:bg-transparent' : 'border-transparent text-slate-600 hover:text-sea-primary'}`}
                >
                    <Icon icon="ic:round-favorite" className="text-lg md:text-xl" /> <span className="md:inline">รายการโปรด</span>
                </NavLink>
            </div>
        </div>
    );
}

export default UserSidebar;
