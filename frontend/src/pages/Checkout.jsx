import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';
import userService from '../services/user.service';
import couponService from '../services/coupon.service';
import { useCart } from '../contexts/CartContext';
import AddressModal from '../components/AddressModal';

function Checkout() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { fetchCartCount } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone_number: '',
        address_line: '',
        sub_district: '',
        district: '',
        province: '',
        zip_code: '',
        detail: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('bank_transfer'); // Default
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        fetchCart();
        fetchSavedAddresses();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await cartService.getCart();
            if (!res || !res.items || res.items.length === 0) {
                toast.info('ตะกร้าสินค้าว่างเปล่า');
                navigate('/');
                return;
            }
            setCart(res);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลตะกร้าไม่สำเร็จ');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedAddresses = async () => {
        try {
            const res = await userService.getShippingAddress();
            const addrList = res.address || [];
            setSavedAddresses(addrList);

            // Auto-fill default address if available
            const defaultAddr = addrList.find(a => a.is_default);
            if (defaultAddr) {
                fillAddress(defaultAddr);
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        }
    };

    const fillAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setShippingAddress({
            name: addr.name || '',
            phone_number: addr.phone_number || '',
            address_line: addr.address_line || '',
            sub_district: addr.sub_district || '',
            district: addr.district || '',
            province: addr.province || '',
            zip_code: addr.zip_code || '',
            detail: addr.detail || ''
        });
    };

    const calculateSubtotal = () => {
        if (!cart) return 0;
        return cart.items.reduce((total, item) => total + (item.product.selling_price * item.quantity), 0);
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        return subtotal >= 5000 ? 0 : 50;
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.discount || 0;
    };

    const calculateTotal = () => {
        return Math.max(0, calculateSubtotal() + calculateShipping() - calculateDiscount());
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        try {
            const res = await couponService.checkCoupon({
                code: couponCode,
                subtotal: calculateSubtotal()
            });
            if (res.valid) {
                setAppliedCoupon({
                    coupon_code: res.coupon_code,
                    discount: res.discount,
                    id: res.coupon_id
                });
                toast.success('ใช้คูปองเรียบร้อยแล้ว');
            } else {
                setCouponError(res.message || 'คูปองใช้ไม่ได้');
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error(error);
            setCouponError(error.response?.data?.message || 'ตรวจสอบคูปองไม่สำเร็จ');
            setAppliedCoupon(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!shippingAddress.name || !shippingAddress.address_line || !shippingAddress.district || !shippingAddress.province || !shippingAddress.zip_code || !shippingAddress.phone_number) {
                toast.error('กรุณากรอกข้อมูลผู้รับและที่อยู่จัดส่งให้ครบถ้วน');
                setSubmitting(false);
                return;
            }

            const payload = {
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null
            };

            const order = await orderService.createOrder(payload);
            toast.success('สั่งซื้อสำเร็จ! กรุณาชำระเงิน');
            await fetchCartCount(); // Update cart count in navbar
            navigate(`/order/${order._id}`, { replace: true });
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'สั่งซื้อไม่สำเร็จ';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Icon icon="eos-icons:loading" width="48" className="text-sea-primary" />
            </div>
        );
    }

    if (!cart) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-sea-text mb-6 flex items-center gap-2">
                <Icon icon="ic:round-shopping-cart-checkout" className="text-sea-primary" />
                ชำระเงิน (Checkout)
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Shipping Address */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Saved Addresses Selection */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-sea-text mb-4 flex items-center gap-2">
                            <Icon icon="ic:round-location-on" className="text-sea-primary" /> ที่อยู่จัดส่ง
                        </h2>

                        {savedAddresses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-4">คุณยังไม่มีที่อยู่จัดส่ง</p>
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
                                    className="px-6 py-2 bg-sea-primary text-white rounded-xl hover:bg-sea-deep transition-all shadow-lg shadow-sea-primary/20 flex items-center gap-2 mx-auto"
                                >
                                    <Icon icon="ic:round-add" /> เพิ่มที่อยู่ใหม่
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {/* Add New Button Card */}
                                <div
                                    onClick={() => setIsModalOpen(true)}
                                    className="shrink-0 w-32 p-4 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-sea-primary hover:bg-sea-primary/5 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-sea-primary gap-2 min-h-[140px]"
                                >
                                    <Icon icon="ic:round-add-circle" width="32" />
                                    <span className="text-xs font-bold">เพิ่มใหม่</span>
                                </div>

                                {savedAddresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => fillAddress(addr)}
                                        className={`shrink-0 w-64 p-4 border rounded-xl cursor-pointer transition-all group relative ${selectedAddressId === addr._id
                                            ? 'border-sea-primary bg-sea-primary/5 ring-1 ring-sea-primary'
                                            : 'border-slate-100 bg-slate-50/50 hover:border-sea-primary hover:bg-sea-primary/5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm text-sea-text flex items-center gap-1">
                                                <Icon icon="ic:round-person" className="text-slate-400" /> {addr.name}
                                            </span>
                                            {addr.label && (
                                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase">
                                                    {addr.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {addr.address_line}, {addr.sub_district}, {addr.district}, {addr.province} {addr.zip_code}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">{addr.phone_number}</span>
                                            {selectedAddressId === addr._id && (
                                                <div className="text-sea-primary text-[10px] font-bold flex items-center gap-1">
                                                    เลือกแล้ว <Icon icon="ic:round-check-circle" />
                                                </div>
                                            )}
                                        </div>
                                        {addr.is_default && selectedAddressId !== addr._id && (
                                            <div className="absolute top-2 right-2 text-sea-primary" title="ที่อยู่หลัก">
                                                <Icon icon="ic:round-star" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Display Selected Address Summary if any */}
                        {shippingAddress.name && (
                            <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in">
                                <h3 className="text-sm font-bold text-slate-700 mb-2">ที่อยู่ที่จะจัดส่ง:</h3>
                                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="font-bold text-slate-800">{shippingAddress.name} ({shippingAddress.phone_number})</p>
                                    <p>{shippingAddress.address_line}, {shippingAddress.sub_district}, {shippingAddress.district}, {shippingAddress.province} {shippingAddress.zip_code}</p>
                                    {shippingAddress.detail && <p className="text-slate-500 italic text-xs mt-1">Note: {shippingAddress.detail}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-sea-text mb-4 border-b pb-2">วิธีการชำระเงิน</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-sea-primary bg-sea-primary/5 ring-1 ring-sea-primary' : 'border-slate-200 hover:border-sea-primary/50'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="bank_transfer"
                                    checked={paymentMethod === 'bank_transfer'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-sea-primary focus:ring-sea-primary"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sea-text flex items-center gap-2">
                                        <Icon icon="mdi:bank-outline" className="text-xl" /> โอนเงินผ่านธนาคาร
                                    </div>
                                    <p className="text-sm text-slate-500">แนบสลิปการโอนเงินในภายหลัง</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-sea-primary bg-sea-primary/5 ring-1 ring-sea-primary' : 'border-slate-200 hover:border-sea-primary/50'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-sea-primary focus:ring-sea-primary"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sea-text flex items-center gap-2">
                                        <Icon icon="mdi:cash-multiple" className="text-xl" /> เก็บเงินปลายทาง (COD)
                                    </div>
                                    <p className="text-sm text-slate-500">ชำระเงินเมื่อได้รับสินค้า</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>



                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                        <h2 className="text-lg font-semibold text-sea-text mb-4 border-b pb-2">สรุปรายการสั่งซื้อ</h2>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                            {cart.items.map((item) => (
                                <div key={item._id} className="flex gap-3 text-sm">
                                    <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                                        {item.product.main_image?.url ? (
                                            <img src={item.product.main_image.url} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Icon icon="ic:round-image" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 line-clamp-2">{item.product.name}</p>
                                        <p className="text-slate-500 mt-1">
                                            {item.quantity} x ฿{item.product.selling_price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-sea-primary">
                                            ฿{(item.quantity * item.product.selling_price).toLocaleString()}
                                        </p>
                                        {item.product.original_price > item.product.selling_price && (
                                            <p className="text-xs text-slate-400 line-through">
                                                ฿{(item.quantity * item.product.original_price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 py-4 border-t border-slate-100 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>ยอดรวมสินค้า</span>
                                <span>฿{calculateSubtotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>ค่าจัดส่ง</span>
                                <span>{calculateShipping() === 0 ? 'ฟรี' : `฿${calculateShipping()}`}</span>
                            </div>


                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-1"><Icon icon="ic:round-discount" /> ส่วนลด ({appliedCoupon.code})</span>
                                    <span>-฿{calculateDiscount().toLocaleString()}</span>
                                </div>
                            )}

                            {/* Coupon Input */}
                            <div className="pt-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="โค้ดส่วนลด"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedCoupon}
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sea-primary uppercase"
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            type="button"
                                            onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                            className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Icon icon="ic:round-close" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode}
                                            className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ใช้
                                        </button>
                                    )}
                                </div>
                                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 border-t border-slate-100 font-bold text-lg text-sea-text">
                            <span>ยอดชำระทั้งสิ้น</span>
                            <span className="text-sea-primary">฿{calculateTotal().toLocaleString()}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !shippingAddress.name}
                            className="w-full py-3 rounded-xl bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold shadow-lg shadow-sea-primary/30 hover:shadow-sea-primary/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {submitting ? <Icon icon="eos-icons:loading" /> : <Icon icon="ic:round-check-circle" />}
                            ยืนยันการสั่งซื้อ
                        </button>
                    </div>
                </div>

            </form >
            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSavedAddresses}
            />
        </div >
    );
}

export default Checkout;