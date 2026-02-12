import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import orderService from '../../services/order.service';

function OrderFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await orderService.getByOrderId(id);
            setOrder(data);
            setStatus(data.status);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const [trackingNumber, setTrackingNumber] = useState('');
    const [provider, setProvider] = useState('');

    useEffect(() => {
        if (order) {
            setTrackingNumber(order.shipping_info?.tracking_number || '');
            setProvider(order.shipping_info?.provider || '');
        }
    }, [order]);

    const handleUpdateStatus = async () => {
        if (status === 'shipped' && (!trackingNumber || !provider)) {
            toast.error("กรุณาระบุเลขพัสดุและผู้จัดส่ง");
            return;
        }

        setSaving(true);
        try {
            await orderService.updateOrderStatus(id, status, {
                tracking_number: trackingNumber,
                provider: provider
            });
            toast.success(`อัปเดตสถานะเป็น ${getStatusText(status)} เรียบร้อย`);
            fetchOrder();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('อัปเดตสถานะไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    const handleRefund = async () => {
        if (!window.confirm("ยืนยันการคืนเงินและยกเลิกคำสั่งซื้อ? สต็อกสินค้าจะถูกคืนกลับเข้าระบบ")) return;

        setSaving(true);
        try {
            await orderService.updateOrderStatus(id, 'cancelled', { is_refund: true });
            toast.success("คืนเงินและยกเลิกคำสั่งซื้อเรียบร้อย");
            fetchOrder();
        } catch (error) {
            console.error('Error refunding:', error);
            toast.error('ดำเนินการคืนเงินไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'waiting_verification': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'paid': return 'bg-green-50 text-green-700 border-green-100';
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
            case 'waiting_verification': return 'รอการตรวจสอบ';
            case 'paid': return 'ชำระเงินแล้ว';
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
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="flex items-center gap-2 text-slate-500 hover:text-sea-primary transition-colors mb-2"
                    >
                        <Icon icon="ic:round-arrow-back" /> กลับสู่รายการคำสั่งซื้อ
                    </button>
                    <h1 className="text-2xl font-bold text-sea-text flex items-center gap-3">
                        Order #{order.order_id || order._id.substring(0, 8).toUpperCase()}
                        <span className={`text-base px-3 py-1 rounded-full border uppercase ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </h1>
                    <p className="text-sea-subtext mt-1">
                        สั่งซื้อเมื่อ {new Date(order.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>

                {/* Status Control */}
                <div className="flex flex-col gap-3 items-end">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary text-sm min-w-[150px]"
                        >
                            <option value="pending">รอการชำระเงิน</option>
                            <option value="waiting_verification">รอการตรวจสอบ</option>
                            <option value="paid">ชำระเงินแล้ว</option>
                            <option value="processing">กำลังเตรียมพัสดุ</option>
                            <option value="shipped">จัดส่งแล้ว</option>
                            <option value="completed">สำเร็จ</option>
                            <option value="cancelled">ยกเลิก</option>
                        </select>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={saving || (status === order.status && status !== 'shipped')}
                            className="px-4 py-2 bg-sea-primary text-white rounded-lg text-sm font-medium shadow-lg shadow-sea-primary/20 hover:bg-sea-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saving ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
                        </button>
                    </div>

                    {order.status === 'shipped' && (
                        <button
                            onClick={() => {
                                if (window.confirm('ยืนยันว่าสินค้าถึงมือลูกค้าแล้ว? สถานะจะเปลี่ยนเป็น "สำเร็จ"')) {
                                    setStatus('completed'); // Update local state for consistency immediately or just call API
                                    // Actually calling API directly is better for a specific action button
                                    setSaving(true);
                                    orderService.updateOrderStatus(id, 'completed', {})
                                        .then(() => {
                                            toast.success('อัปเดตสถานะเป็น สำเร็จ เรียบร้อย');
                                            fetchOrder();
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                            toast.error('เกิดข้อผิดพลาด');
                                        })
                                        .finally(() => setSaving(false));
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-green-700 transition-colors w-full flex items-center justify-center gap-2 font-medium"
                            disabled={saving}
                        >
                            <Icon icon="ic:round-check-circle" /> ยืนยันสินค้าถึงมือลูกค้าแล้ว
                        </button>
                    )}

                    {order.payment_info?.payment_status === 'paid' && order.status !== 'cancelled' && (
                        <button
                            onClick={handleRefund}
                            disabled={saving}
                            className="px-4 py-2 text-red-600 bg-red-50 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-all flex items-center gap-1"
                        >
                            <Icon icon="ic:round-settings-backup-restore" /> คืนเงิน & ยกเลิก
                        </button>
                    )}
                </div>
            </div>

            {/* Shipping Info Input - Show when status is shipped or changing to shipped */}
            {
                (status === 'shipped' || order.status === 'shipped') && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-bold text-sea-text mb-4 flex items-center gap-2">
                            <Icon icon="ic:round-local-shipping" className="text-sea-primary" /> ข้อมูลการจัดส่ง
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ผู้ให้บริการขนส่ง (Provider)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                                    placeholder="เช่น Kerry, Flash, Thai Post"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">เลขพัสดุ (Tracking Number)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                                    placeholder="กรอกเลขพัสดุ"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        {status === 'shipped' && status !== order.status && (
                            <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                                <Icon icon="ic:round-info" /> กรุณาตรวจสอบเลขพัสดุให้ถูกต้องก่อนบันทึก
                            </p>
                        )}
                    </div>
                )
            }

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Items & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 font-bold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-shopping-bag" className="text-sea-primary" /> Order Items
                        </div>
                        <div className="p-6 space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-100 overflow-hidden shrink-0">
                                        <img
                                            src={item.main_image?.url || 'https://via.placeholder.com/64'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-800">{item.name}</h4>
                                        <p className="text-sm text-slate-500">จำนวน: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sea-primary">฿{item.price_snapshot?.toLocaleString()}</p>
                                        <p className="text-xs text-slate-400">ราคารวม: ฿{(item.price_snapshot * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>ราคาสินค้า</span>
                                <span>฿{order.pricing_info?.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>ค่าจัดส่ง</span>
                                <span>฿{order.pricing_info?.shipping_fee?.toLocaleString()}</span>
                            </div>
                            {order.pricing_info?.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>ส่วนลด</span>
                                    <span>-฿{order.pricing_info?.discount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-sea-text pt-2 border-t border-slate-200">
                                <span>ยอดรวม</span>
                                <span>฿{order.pricing_info?.total_price?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 font-bold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-payments" className="text-sea-primary" /> Payment Information
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">ช่องทางการชำระเงิน</p>
                                <p className="font-medium text-sea-text uppercase">{getPaymentMethodText(order.payment_method)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">สถานะการชำระเงิน</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border uppercase ${getPaymentStatusColor(order.payment_info?.payment_status)}`}>
                                    {getPaymentStatusText(order.payment_info?.payment_status)}
                                </span>
                            </div>
                            {order.payment_info?.slip_url?.url && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500 mb-2">หลักฐานการโอนเงิน</p>
                                    <div className="rounded-xl border border-slate-200 overflow-hidden max-w-sm">
                                        <a href={order.payment_info.slip_url.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={order.payment_info.slip_url.url}
                                                alt="Payment Slip"
                                                className="w-full h-auto hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                        <Icon icon="ic:round-info" /> คลิกที่รูปภาพเพื่อดูขนาดเต็ม
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-sea-text mb-4 flex items-center gap-2">
                            <Icon icon="ic:round-person" className="text-sea-primary" /> ข้อมูลลูกค้า
                        </h3>
                        {order.user_id ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        {order.user_id.first_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sea-text">{order.user_id.first_name} {order.user_id.last_name}</p>
                                        <p className="text-xs text-slate-400">ID: {order.user_id._id}</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-50 space-y-2">
                                    <p className="text-sm flex items-center gap-2 text-slate-600">
                                        <Icon icon="ic:round-email" className="text-slate-400" />
                                        {order.user_id.email}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">ไม่พบผู้ใช้ (อาจถูกลบไปแล้ว)</p>
                        )}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-sea-text mb-4 flex items-center gap-2">
                            <Icon icon="ic:round-location-on" className="text-sea-primary" /> ที่อยู่จัดส่งสินค้า
                        </h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-slate-600 space-y-1">
                                <p className="font-medium text-slate-800">{order.shipping_address.name}</p>
                                <p>{order.shipping_address.phone_number}</p>
                                <p>{order.shipping_address.address_line}</p>
                                <p>
                                    {order.shipping_address.sub_district}, {order.shipping_address.district}
                                </p>
                                <p>
                                    {order.shipping_address.province}, {order.shipping_address.zip_code}
                                </p>
                                {order.shipping_address.detail && (
                                    <p className="mt-2 text-slate-500 italic border-l-2 border-slate-200 pl-2">
                                        NOTE: {order.shipping_address.detail}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400">ไม่ได้ระบุที่อยู่จัดส่งสินค้า</p>
                        )}
                    </div>
                </div>

            </div>
        </div >
    );
}

export default OrderFormPage;