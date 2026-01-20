import React, { useState, useEffect } from "react";
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import orderService from '../services/order.service';
import { Link } from 'react-router-dom';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await orderService.getAllOrders();
            setOrders(Array.isArray(res) ? res : (res.orders || []));
        } catch (error) {
            console.error(error);
            toast.error('โหลดประวัติการสั่งซื้อไม่สำเร็จ');
        } finally {
            setLoadingOrders(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'waiting_verification': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'รอชำระเงิน';
            case 'waiting_verification': return 'รอตรวจสอบการชำระเงิน';
            case 'paid': return 'ชำระเงินแล้ว';
            case 'processing': return 'กำลังเตรียมพัสดุ';
            case 'shipped': return 'จัดส่งแล้ว';
            case 'completed': return 'สำเร็จ';
            case 'cancelled': return 'ยกเลิก';
            default: return status;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-sea-text">ประวัติคำสั่งซื้อ</h2>

            {loadingOrders ? (
                <div className="flex justify-center p-12"><Icon icon="eos-icons:loading" width="32" className="text-sea-primary" /></div>
            ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <Icon icon="ic:round-shopping-bag" width="64" className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 mb-4">คุณยังไม่มีคำสั่งซื้อ</p>
                    <Link to="/" className="px-6 py-2 bg-sea-primary text-white rounded-lg hover:bg-sea-deep transition-colors">เลือกซื้อสินค้า</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono font-bold text-sea-text text-lg">#{order.order_id}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <Link to={`/order/${order._id}`} className="px-4 py-2 text-sm font-medium text-sea-primary bg-sea-primary/5 hover:bg-sea-primary/10 rounded-lg transition-colors text-center">
                                    ดูรายละเอียด
                                </Link>

                            </div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    {order.shipping_info?.tracking_number ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">เลขพัสดุ:</span>
                                            <span className="font-mono font-bold text-sea-text bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs uppercase tracking-wider">
                                                {order.shipping_info.tracking_number}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">ยังไม่มีเลขพัสดุ</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500">ยอดสุทธิ</span>
                                    <span className="text-xl font-bold text-sea-primary">฿{order.pricing_info?.total_price?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
