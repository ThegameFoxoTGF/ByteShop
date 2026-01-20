import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';

function UserSidebar() {
    const { user, logout } = useAuth();

    const activeClassName = "w-full text-left px-6 py-4 flex items-center gap-3 transition-colors bg-sea-primary/5 text-sea-primary border-l-4 border-sea-primary";
    const inactiveClassName = "w-full text-left px-6 py-4 flex items-center gap-3 transition-colors text-slate-600 hover:bg-slate-50 border-l-4 border-transparent";

    return (
        <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 mx-auto bg-sea-primary/10 rounded-full flex items-center justify-center text-sea-primary mb-4">
                    <Icon icon="ic:round-person" width="48" />
                </div>
                <h2 className="font-bold text-lg text-sea-text truncate">{user?.first_name || user?.name || 'User'}</h2>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                >
                    <Icon icon="ic:round-manage-accounts" width="20" /> ข้อมูลส่วนตัว
                </NavLink>
                <NavLink
                    to="/profile/orders"
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                >
                    <Icon icon="ic:round-history" width="20" /> ประวัติคำสั่งซื้อ
                </NavLink>
                <NavLink
                    to="/profile/address"
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                >
                    <Icon icon="ic:round-location-on" width="20" /> ที่อยู่ของฉัน
                </NavLink>
                <button
                    onClick={logout}
                    className="w-full text-left px-6 py-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors border-l-4 border-transparent"
                >
                    <Icon icon="ic:round-logout" width="20" /> ออกจากระบบ
                </button>
            </div>
        </div>
    );
}

export default UserSidebar;
