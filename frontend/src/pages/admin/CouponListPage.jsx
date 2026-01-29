import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import couponService from '../../services/coupon.service';

function CouponListPage() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(12);
    const [keyword, setKeyword] = useState('');

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await couponService.getCoupons({
                page,
                limit,
                keyword
            });

            if (Array.isArray(response)) {
                // Fallback
                setCoupons(response);
                setTotal(response.length);
                setPages(1);
            } else {
                setCoupons(response.coupons || []);
                setPages(response.pages || 0);
                setPage(response.page || 1);
                setTotal(response.total || 0);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [page, limit, keyword]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await couponService.deleteCoupon(id);
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                toast.error('Failed to delete coupon');
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">คูปอง</h1>
                    <p className="text-sea-subtext mt-1">จัดการคูปองส่วนลด</p>
                </div>
                <Link
                    to="/admin/coupons/new"
                    className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-sea-primary to-sea-deep text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5"
                >
                    <Icon icon="ic:round-add" width="20" />
                    สร้างคูปอง
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" />
                    <input
                        type="text"
                        placeholder="ค้นหาคูปอง..."
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
                        <p className="mt-4 text-sea-muted">กำลังโหลด...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="ic:outline-local-offer" className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-sea-text">ไม่พบสินค้า</h3>
                        <p className="text-sea-subtext mt-1">สร้างสินค้าใหม่เพื่อเริ่มต้น</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-sea-muted font-semibold">
                                        <th className="px-6 py-4 rounded-tl-2xl">รหัสคูปอง</th>
                                        <th className="px-6 py-4">ส่วนลด</th>
                                        <th className="px-6 py-4">การใช้งาน</th>
                                        <th className="px-6 py-4">สถานะ</th>
                                        <th className="px-6 py-4">วันหมดอายุ</th>
                                        <th className="px-6 py-4 rounded-tr-2xl text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {coupons.map((coupon) => (
                                        <tr
                                            key={coupon._id}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sea-text font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                                                    {coupon.code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-sea-text">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <span className="text-green-600 font-medium">{coupon.discount_value}% OFF</span>
                                                ) : (
                                                    <span className="text-blue-600 font-medium">฿{coupon.discount_value} OFF</span>
                                                )}
                                                {coupon.min_order_value > 0 && (
                                                    <div className="text-xs text-slate-400 mt-0.5">ขั้นต่ำ: ฿{coupon.min_order_value}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${coupon.is_active
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {coupon.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'ไม่มีวันหมดอายุ'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/coupons/${coupon._id}`}
                                                        className="p-2 text-slate-400 hover:text-sea-primary hover:bg-sea-light/50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Icon icon="ic:round-edit" width="20" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Icon icon="ic:round-delete-outline" width="20" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {coupons.length > 0 && (
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

export default CouponListPage;