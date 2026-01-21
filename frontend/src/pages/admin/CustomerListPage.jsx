import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import userService from "../../services/user.service";

function CustomerListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [keyword, setKeyword] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userService.getUsers({
                page,
                limit,
                keyword
            });
            if (Array.isArray(res)) {
                // Fallback for old API behavior
                setUsers(res);
                setTotal(res.length);
                setPages(1);
            } else {
                setUsers(res.users || []);
                setPages(res.pages || 0);
                setPage(res.page || 1);
                setTotal(res.total || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error("ดึงข้อมูลลูกค้าไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit, keyword]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(1); // Reset to first page
    };

    const handleDelete = async (id) => {
        if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบลูกค้ารายนี้?")) {
            try {
                await userService.deleteUser(id);
                toast.success("ลบลูกค้าเรียบร้อยแล้ว");
                fetchUsers();
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "ลบลูกค้าไม่สำเร็จ");
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">Customer Management</h1>
                    <p className="text-sea-subtext mt-1">จัดการข้อมูลลูกค้า</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" />
                    <input
                        type="text"
                        placeholder="ค้นหาลูกค้า..."
                        value={keyword}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sea-text placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-sea-muted">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
                                        <th className="px-6 py-4 font-semibold">อีเมล</th>
                                        <th className="px-6 py-4 font-semibold">เบอร์โทรศัพท์</th>
                                        <th className="px-6 py-4 font-semibold">สถานะ</th>
                                        <th className="px-6 py-4 font-semibold">วันที่สมัคร</th>
                                        <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                        {user.profile?.first_name?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-800">
                                                            {user.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name || ''}` : '-'}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono sm:hidden">{user._id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{user.profile?.phone_number || '-'}</td>
                                            <td className="px-6 py-4">
                                                {user.is_admin ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                                        <Icon icon="ic:round-admin-panel-settings" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                        <Icon icon="ic:round-person" /> User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/orders?keyword=${user.email}`}
                                                        className="text-slate-400 hover:text-sea-primary transition-colors"
                                                        title="ดูประวัติการสั่งซื้อ"
                                                    >
                                                        <Icon icon="ic:round-receipt-long" width="20" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        disabled={user.is_admin}
                                                        className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={user.is_admin ? "ไม่สามารถลบ Admin ได้" : "ลบข้อมูล"}
                                                    >
                                                        <Icon icon="ic:round-delete" width="20" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                                <Icon icon="ic:round-search-off" width="48" className="mx-auto mb-2 opacity-50" />
                                                ไม่พบข้อมูลลูกค้า
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {users.length > 0 && (
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                <p className="text-sm text-sea-subtext">
                                    แสดงผล <span className="font-medium text-sea-text">{(page - 1) * limit + 1}</span> ถึง <span className="font-medium text-sea-text">{Math.min(page * limit, total)}</span> จาก <span className="font-medium text-sea-text">{total}</span> ผล
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon icon="ic:round-chevron-left" width="20" />
                                    </button>
                                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                                        let p = i + 1;
                                        if (pages > 5 && page > 3) {
                                            p = page - 2 + i;
                                        }
                                        if (p > pages) return null;

                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p
                                                    ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/20'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-sea-primary hover:text-sea-primary'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(pages, p + 1))}
                                        disabled={page === pages}
                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon icon="ic:round-chevron-right" width="20" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CustomerListPage;