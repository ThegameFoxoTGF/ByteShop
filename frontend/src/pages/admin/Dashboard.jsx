import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';
import SalesChart from '../../components/admin/SalesChart';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await adminService.getDashboardStats();
            setStats(res);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            title: "ยอดขายรวม",
            value: `฿${stats.totalSales.toLocaleString()}`,
            icon: "ic:round-monetization-on",
            className: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/20",
            desc: "รายได้ทั้งหมดที่ชำระแล้ว",
            iconColor: "text-white/80"
        },
        {
            title: "คำสั่งซื้อทั้งหมด",
            value: stats.totalOrders.toLocaleString(),
            icon: "ic:round-shopping-bag",
            className: "bg-white border-slate-100 text-slate-800",
            desc: `${stats.pendingOrders} รอการตรวจสอบ`,
            iconBg: "bg-blue-100 text-blue-600"
        },
        {
            title: "ลูกค้าทั้งหมด",
            value: stats.totalUsers.toLocaleString(),
            icon: "ic:round-people",
            className: "bg-white border-slate-100 text-slate-800",
            desc: `${stats.newUsersLast30Days} คนใน 30 วันล่าสุด`,
            iconBg: "bg-purple-100 text-purple-600"
        },
        {
            title: "สินค้าทั้งหมด",
            value: stats.totalProducts.toLocaleString(),
            icon: "ic:round-inventory-2",
            className: "bg-white border-slate-100 text-slate-800",
            desc: `${stats.lowStockProducts} รายการใกล้หมด`,
            iconBg: "bg-orange-100 text-orange-600"
        }
    ];

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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">Dashboard</h1>
                    <p className="text-sea-subtext mt-1">ภาพรวมของร้านค้าและสถิติล่าสุด</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-2 text-slate-400 hover:text-sea-primary hover:bg-sea-light/20 rounded-lg transition-all"
                    title="รีเฟรชข้อมูล"
                >
                    <Icon icon="ic:round-refresh" width="24" />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-2xl shadow-sm border transition-all hover:-translate-y-1 relative overflow-hidden group ${card.className}`}
                    >
                        {/* Background Decor (Only for colored cards) */}
                        {card.className.includes('bg-linear') && (
                            <Icon
                                icon={card.icon}
                                className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-500"
                            />
                        )}

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            {card.iconBg ? (
                                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                                    <Icon icon={card.icon} width="24" />
                                </div>
                            ) : (
                                <div className={`p-1 ${card.iconColor}`}>
                                    <Icon icon={card.icon} width="32" />
                                </div>
                            )}
                        </div>

                        <div className="relative z-10">
                            <h3 className={`text-sm font-medium mb-1 ${card.className.includes('text-white') ? 'text-white/80' : 'text-slate-500'}`}>
                                {card.title}
                            </h3>
                            <div className="text-2xl font-bold mb-2 tracking-tight">
                                {card.value}
                            </div>
                            <p className={`text-xs ${card.className.includes('text-white') ? 'text-white/60' : 'text-slate-400'}`}>
                                {card.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Sales Chart (Takes up 2 cols) */}
                <div className="lg:col-span-2">
                    <SalesChart initialData={stats.salesChart} />
                </div>

                {/* Right: Quick Actions / Low Stock (Takes up 1 col) */}
                <div className="space-y-6">
                    {/* Low Stock Alert */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-sea-text mb-4 flex items-center gap-2">
                            <Icon icon="ic:round-warning-amber" className="text-orange-500" />
                            สินค้าใกล้หมด
                        </h2>
                        {stats.lowStockProducts > 0 ? (
                            <div className="text-center py-6">
                                <div className="text-4xl font-bold text-orange-500 mb-2">{stats.lowStockProducts}</div>
                                <p className="text-slate-500 text-sm mb-4">รายการที่เหลือน้อยกว่า 10 ชิ้น</p>
                                <Link to="/admin/products" className="text-sea-primary text-sm font-medium hover:underline">
                                    จัดการสต็อกสินค้า
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Icon icon="ic:round-check-circle" className="mx-auto mb-2 text-green-500" width="32" />
                                สต็อกสินค้าเพียงพอ
                            </div>
                        )}
                    </div>

                    {/* Quick Menu */}
                    <div className="bg-linear-to-br from-sea-deep to-sea-primary p-6 rounded-2xl text-white shadow-lg shadow-sea-primary/20">
                        <h3 className="font-bold mb-4">เมนูลัด</h3>
                        <div className="space-y-3">
                            <Link to="/admin/products/new" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
                                <Icon icon="ic:round-add-box" /> เพิ่มสินค้าใหม่
                            </Link>
                            <Link to="/admin/categories" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
                                <Icon icon="ic:round-category" /> จัดการหมวดหมู่
                            </Link>
                            <Link to="/admin/coupons" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm">
                                <Icon icon="ic:round-local-offer" /> สร้างคูปองส่วนลด
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h2 className="text-lg font-bold text-sea-text flex items-center gap-2">
                        <Icon icon="ic:round-receipt-long" className="text-sea-primary" />
                        คำสั่งซื้อล่าสุด
                    </h2>
                    <Link to="/admin/orders" className="text-sm text-sea-primary hover:text-sea-deep font-medium hover:underline flex items-center gap-1">
                        ดูทั้งหมด <Icon icon="ic:round-arrow-forward" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-sea-muted font-semibold">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">ลูกค้า</th>
                                <th className="px-6 py-4">ยอดรวม</th>
                                <th className="px-6 py-4">สถานะ</th>
                                <th className="px-6 py-4">วันที่</th>
                                <th className="px-6 py-4 text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                                {order.order_id || order._id.substring(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800">
                                                    {order.user_id ? `${order.user_id.profile?.first_name || ''} ${order.user_id.profile?.last_name || ''}`.trim() || 'Unknown' : 'Unknown'}
                                                </span>
                                                <span className="text-xs text-slate-400">{order.user_id?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sea-text">
                                            ฿{order.pricing_info.total_price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString('th-TH')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-sea-primary hover:border-sea-primary transition-all text-xs font-medium shadow-xs"
                                            >
                                                ดู <Icon icon="ic:round-arrow-forward" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        ยังไม่มีคำสั่งซื้อล่าสุด
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;