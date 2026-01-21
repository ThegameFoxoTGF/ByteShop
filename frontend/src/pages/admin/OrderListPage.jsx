import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import orderService from '../../services/order.service';

function OrderListPage() {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAllOrders({
                page,
                limit,
                keyword,
                status: statusFilter
            });
            // Handle both old array format (just in case) and new object format
            if (Array.isArray(response)) {
                setOrders(response);
                setTotal(response.length);
                setPages(1);
            } else {
                setOrders(response.orders || []);
                setPages(response.pages || 0);
                setPage(response.page || 1);
                setTotal(response.total || 0);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, limit, keyword, statusFilter]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(1);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'paid': return 'bg-green-50 text-green-700 border-green-100';
            case 'waiting_verification': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'รอการชำระเงิน';
            case 'paid': return 'ชำระเงินแล้ว';
            case 'waiting_verification': return 'รอตรวจสอบ';
            case 'processing': return 'กำลังเตรียมพัสดุ';
            case 'shipped': return 'จัดส่งแล้ว';
            case 'completed': return 'สำเร็จ';
            case 'cancelled': return 'ยกเลิก';
            default: return status;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'refunded': return 'text-red-600';
            default: return 'text-slate-600';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'paid': return 'ชำระเงินแล้ว';
            case 'pending': return 'รอการชำระเงิน';
            case 'refunded': return 'คืนเงิน';
            default: return status;
        }
    };
    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cod': return 'เงินสด';
            case 'bank_transfer': return 'โอนเงิน';
            default: return method;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">Orders</h1>
                    <p className="text-sea-subtext mt-1">จัดการคำสั่งซื้อทั้งหมด</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" />
                    <input
                        type="text"
                        placeholder="ค้นหาสั่งซื้อ..."
                        value={keyword}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sea-text placeholder-slate-400"
                    />
                </div>
                <div className="w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sea-primary text-sea-text"
                    >
                        <option value="">สถานะทั้งหมด</option>
                        <option value="pending">รอการชำระเงิน</option>
                        <option value="waiting_verification">รอตรวจสอบ</option>
                        <option value="paid">ชำระเงินแล้ว</option>
                        <option value="processing">กำลังเตรียมพัสดุ</option>
                        <option value="shipped">จัดส่งแล้ว</option>
                        <option value="completed">สำเร็จ</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-sea-muted">กำลังโหลดคำสั่งซื้อ...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="ic:round-receipt-long" className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-sea-text">ไม่พบคำสั่งซื้อ</h3>
                        <p className="text-sea-subtext mt-1">ลองปรับการค้นหาหรือตัวกรอง</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-sea-muted font-semibold">
                                    <th className="px-6 py-4 rounded-tl-2xl">หมายเลขคำสั่งซื้อ</th>
                                    <th className="px-6 py-4">ลูกค้า</th>
                                    <th className="px-6 py-4">วันที่</th>
                                    <th className="px-6 py-4">ราคา</th>
                                    <th className="px-6 py-4">สถานะ</th>
                                    <th className="px-6 py-4">การชำระเงิน</th>
                                    <th className="px-6 py-4 rounded-tr-2xl text-right">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-slate-700 font-medium">{order.order_id || order._id.substring(0, 8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-sea-text">
                                            {order.user_id ? `${order.user_id.profile?.first_name || ''} ${order.user_id.profile?.last_name || ''}`.trim() || 'Unknown' : 'Unknown User'}
                                            <div className="text-xs text-slate-400">{order.user_id?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-sea-text">
                                            ฿{order.pricing_info?.total_price?.toLocaleString() || order.total_price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="uppercase text-xs font-bold text-slate-500">{getPaymentMethodText(order.payment_method)}</span>
                                                <span className={`font-medium ${getPaymentStatusColor(order.payment_info?.payment_status || 'pending')}`}>
                                                    {getPaymentStatusText(order.payment_info?.payment_status || 'pending')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-sea-primary hover:text-sea-primary transition-all bg-white"
                                            >
                                                จัดการ <Icon icon="ic:round-arrow-forward" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && orders.length > 0 && (
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
            </div>
        </div>
    );
}

export default OrderListPage;