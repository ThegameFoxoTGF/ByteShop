import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import orderService from '../services/order.service';
import uploadService from '../services/upload.service';
import Breadcrumb from '../components/Breadcrumb';

function Order() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({});
    const [isEditingSlip, setIsEditingSlip] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const data = await orderService.getByOrderId(id);
            setOrder(data);
            setAddressForm(data.shipping_address);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = async () => {
        try {
            await orderService.updateOrderAddress(id, addressForm);
            toast.success('แก้ไขที่อยู่เรียบร้อยแล้ว');
            setIsEditingAddress(false);
            fetchOrder();
        } catch (error) {
            console.error(error);
            toast.error('แก้ไขที่อยู่ไม่สำเร็จ');
        }
    };

    const handleSlipUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const uploadRes = await uploadService.uploadSlip(formData);
            await orderService.updateOrderToPaid(id, {
                url: uploadRes.url,
                public_id: uploadRes.public_id
            });
            toast.success('แจ้งชำระเงินเรียบร้อยแล้ว');
            // After successful upload, turn off edit mode if it was on
            if (isEditingSlip) setIsEditingSlip(false);
            fetchOrder(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error('อัปโหลดสลิปไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("คุณต้องการยกเลิกคำสั่งซื้อนี้ใช่หรือไม่?")) return;
        try {
            await orderService.cancelOrder(id);
            toast.success("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว");
            fetchOrder();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถยกเลิกคำสั่งซื้อได้: " + (error.response?.data?.message || "Internal Error"));
        }
    };

    const handleConfirmReceived = async () => {
        if (!window.confirm("คุณได้รับสินค้าเรียบร้อยแล้วใช่หรือไม่?")) return;
        try {
            await orderService.confirmReceived(id);
            toast.success("ยืนยันการรับสินค้าเรียบร้อยแล้ว");
            fetchOrder();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถยืนยันได้: " + (error.response?.data?.message || "Internal Error"));
        }
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed'];
        const currentIdx = steps.indexOf(status);
        if (status === 'cancelled') return -1;
        return currentIdx;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Icon icon="eos-icons:loading" width="48" className="text-sea-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Icon icon="ic:round-error-outline" width="64" className="text-slate-300" />
                <p className="text-slate-500">ไม่พบคำสั่งซื้อนี้</p>
                <Link to="/profile" className="text-sea-primary hover:underline">กลับไปที่ประวัติคำสั่งซื้อ</Link>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

            <Breadcrumb items={[
                { label: 'หน้าหลัก', path: '/', icon: 'ic:round-home' },
                { label: 'บัญชีผู้ใช้', path: '/profile', icon: 'ic:round-account-circle' },
                { label: 'ประวัติคำสั่งซื้อ', path: '/profile/orders', icon: 'ic:round-history' },
                { label: `คำสั่งซื้อ #${order.order_id}`, icon: 'ic:round-receipt' }
            ]} />

            {/* Status Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-sea-text flex items-center gap-2">
                            คำสั่งซื้อ #{order.order_id}
                            {isCancelled && <span className="text-sm font-normal text-white bg-red-500 px-2 py-0.5 rounded-full">ยกเลิกแล้ว</span>}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')}
                        </p>

                        {/* Payment Deadline Warning */}
                        {order.status === 'pending' && order.payment_method === 'bank_transfer' && !isCancelled && (
                            <div className="mt-3 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100 flex items-start gap-2">
                                <Icon icon="ic:round-access-alarm" className="mt-0.5 shrink-0" width="16" />
                                <div>
                                    <span className="font-bold">กรุณาชำระเงินภายใน 1 ชั่วโมง</span><br />
                                    ครบกำหนด: {new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000).toLocaleString('th-TH')}
                                    <p className="mt-1 opacity-80">หากไม่ชำระเงินตามเวลาที่กำหนด ระบบจะยกเลิกคำสั่งซื้ออัตโนมัติ</p>
                                </div>
                            </div>
                        )}

                        {order.status === 'pending' && !isCancelled && (
                            <button
                                onClick={handleCancelOrder}
                                className="mt-5 px-4 py-2 text-sm font-medium text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 group w-fit cursor-pointer"
                            >
                                <Icon icon="ic:round-cancel" className="text-red-400 group-hover:text-red-500 transition-colors" width="18" />
                                ยกเลิกคำสั่งซื้อ
                            </button>
                        )}

                        {order.status === 'shipped' && !isCancelled && (
                            <button
                                onClick={handleConfirmReceived}
                                className="mt-5 px-6 py-2.5 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95 group w-fit cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                            >
                                <Icon icon="ic:round-check-circle" width="20" />
                                ฉันได้รับสินค้าแล้ว
                            </button>
                        )}
                    </div>
                    {!isCancelled && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['pending', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed'].map((step, idx) => (
                                <div key={step} className="flex flex-col items-center gap-1 min-w-[60px]">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors border-2 ${idx <= currentStep ? 'bg-sea-primary text-white border-sea-primary' : 'bg-white text-slate-300 border-slate-200'}`}>
                                        <Icon icon={
                                            step === 'pending' ? 'ic:round-access-time' :
                                                step === 'waiting_verification' ? 'ic:round-manage-search' :
                                                    step === 'paid' ? 'ic:round-check-circle' :
                                                        step === 'processing' ? 'ic:round-inventory-2' :
                                                            step === 'shipped' ? 'ic:round-local-shipping' :
                                                                'ic:round-flag'
                                        } width="16" />
                                    </div>
                                    <span className={`text-[10px] whitespace-nowrap ${idx <= currentStep ? 'text-sea-primary font-medium' : 'text-slate-400'}`}>
                                        {step === 'pending' ? 'รอชำระ' :
                                            step === 'waiting_verification' ? 'รอตรวจสอบ' :
                                                step === 'paid' ? 'ชำระแล้ว' :
                                                    step === 'processing' ? 'เตรียมของ' :
                                                        step === 'shipped' ? 'ส่งแล้ว' :
                                                            'สำเร็จ'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bank Transfer / Payment Upload */}
                {order.payment_method === 'bank_transfer' && ['pending', 'waiting_verification'].includes(order.status) && !isCancelled && (
                    <div className={`border rounded-xl p-4 mb-4 transition-colors ${order.status === 'waiting_verification' ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                        <h3 className={`font-semibold mb-2 flex items-center gap-2 ${order.status === 'waiting_verification' ? 'text-blue-800' : 'text-orange-800'}`}>
                            <Icon icon={order.status === 'waiting_verification' ? "ic:round-timer" : "ic:round-payment"} />
                            {order.status === 'waiting_verification' ? 'รอตรวจสอบการชำระเงิน' : 'แจ้งชำระเงิน'}
                        </h3>

                        {order.status === 'waiting_verification' && !isEditingSlip ? (
                            <div className="space-y-3">
                                <p className="text-sm text-blue-700">
                                    ได้รับหลักฐานแล้ว เจ้าหน้าที่กำลังตรวจสอบความถูกต้อง (ภายใน 24 ชม.)
                                </p>
                                <div className="flex items-center gap-4">
                                    {order.payment_info?.slip_url?.url && (
                                        <a href={order.payment_info.slip_url.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors shadow-sm text-sm font-medium">
                                            <Icon icon="ic:round-image" /> ดูสลิปที่ส่ง
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setIsEditingSlip(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <Icon icon="ic:round-edit" /> แก้ไขหลักฐาน
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-orange-700 mb-4">
                                    กรุณาโอนเงินมาที่ธนาคาร กสิกรไทย เลขที่บัญชี <span className="font-mono font-bold">123-4-56789-0</span> ชื่อบัญชี ByteShop
                                    {order.status === 'waiting_verification' ? ' (กำลังแก้ไขหลักฐาน)' : ' แล้วแนบสลิปด้านล่าง'}
                                </p>

                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2 shadow-sm">
                                        {uploading ? <Icon icon="eos-icons:loading" /> : <Icon icon="ic:round-cloud-upload" />}
                                        {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดสลิป'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} disabled={uploading} />
                                    </label>
                                    {order.status === 'waiting_verification' && (
                                        <button
                                            onClick={() => setIsEditingSlip(false)}
                                            className="text-sm text-slate-500 hover:text-slate-700"
                                        >
                                            ยกเลิกการแก้ไข
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Items & Address */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-sea-text mb-4 border-b pb-2">รายการสินค้า</h2>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                        {item.main_image?.url ? (
                                            <img src={item.main_image.url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400"><Icon icon="ic:round-image" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-800">{item.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1">จำนวน: {item.quantity} ชิ้น</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-700">฿{item.price_snapshot.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold text-sea-text">ที่อยู่จัดส่ง</h2>
                            {['pending', 'paid'].includes(order.status) && !isCancelled && (
                                <button
                                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                                    className="text-sm text-sea-primary hover:underline flex items-center gap-1"
                                >
                                    <Icon icon="ic:round-edit" /> {isEditingAddress ? 'ยกเลิก' : 'แก้ไข'}
                                </button>
                            )}
                        </div>

                        {isEditingAddress ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                <div>
                                    <label className="text-xs text-slate-500">ชื่อผู้รับ</label>
                                    <input
                                        name="name"
                                        value={addressForm.name || ''}
                                        onChange={handleAddressChange}
                                        className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">รายละเอียดเพิ่มเติม</label>
                                    <input
                                        name="detail"
                                        value={addressForm.detail || ''}
                                        onChange={handleAddressChange}
                                        className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">ที่อยู่ / บ้านเลขที่</label>
                                    <input
                                        name="address_line"
                                        value={addressForm.address_line || ''}
                                        onChange={handleAddressChange}
                                        className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500">แขวง/ตำบล</label>
                                        <input
                                            name="sub_district"
                                            placeholder="แขวง/ตำบล"
                                            value={addressForm.sub_district || ''}
                                            onChange={handleAddressChange}
                                            className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">เขต/อำเภอ</label>
                                        <input
                                            name="district"
                                            placeholder="เขต/อำเภอ"
                                            value={addressForm.district || ''}
                                            onChange={handleAddressChange}
                                            className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500">จังหวัด</label>
                                        <input
                                            name="province"
                                            placeholder="จังหวัด"
                                            value={addressForm.province || ''}
                                            onChange={handleAddressChange}
                                            className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">รหัสไปรษณีย์</label>
                                        <input
                                            name="zip_code"
                                            placeholder="รหัสไปรษณีย์"
                                            value={addressForm.zip_code || ''}
                                            onChange={handleAddressChange}
                                            className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">เบอร์โทรศัพท์</label>
                                    <input
                                        name="phone_number"
                                        value={addressForm.phone_number || ''}
                                        onChange={handleAddressChange}
                                        className="w-full text-sm border-slate-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveAddress}
                                    className="w-full py-2.5 bg-sea-primary text-white text-sm font-medium rounded-lg hover:bg-sea-deep transition-colors mt-2 shadow-lg shadow-sea-primary/20"
                                >
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        ) : (
                            <div className="text-slate-700 text-sm space-y-2">
                                <p className="font-bold text-slate-900 text-base">{order.shipping_address.name}</p>
                                <p className="flex items-start gap-2">
                                    <Icon icon="ic:round-location-on" width="18" className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>
                                        {order.shipping_address.address_line} {order.shipping_address.sub_district}<br />
                                        {order.shipping_address.district}, {order.shipping_address.province} {order.shipping_address.zip_code}
                                    </span>
                                </p>
                                {order.shipping_address.detail && (
                                    <p className="bg-slate-50 p-2 rounded text-slate-500 text-xs border border-dashed border-slate-200">
                                        <span className="font-bold">หมายเหตุ:</span> {order.shipping_address.detail}
                                    </p>
                                )}
                                <p className="pt-1 flex items-center gap-2 text-slate-600 font-medium">
                                    <Icon icon="ic:round-phone" className="text-slate-400" /> {order.shipping_address.phone_number}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                        <h2 className="text-lg font-semibold text-sea-text mb-4 border-b pb-2">สรุปชำระเงิน</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>ยอดรวมสินค้า</span>
                                <span>฿{order.pricing_info.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>ค่าจัดส่ง</span>
                                <span>฿{order.pricing_info.shipping_fee.toLocaleString()}</span>
                            </div>
                            {order.pricing_info.discount > 0 && (
                                <div>
                                    <div className="flex justify-between text-green-600">
                                        <span>ส่วนลด</span>
                                        <span>-฿{order.pricing_info.discount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>คูปอง</span>
                                        <span>{order.coupon_info.coupon_code}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-400 text-xs pt-2 border-t border-slate-100">
                                <span>ราคาก่อนภาษี</span>
                                <span>฿{order.pricing_info.subtotal_before_tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-xs">
                                <span>ภาษี (7%)</span>
                                <span>฿{order.pricing_info.tax_price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-2 font-bold text-lg text-sea-text">
                            <span>ยอดสุทธิ</span>
                            <span className="text-sea-primary">฿{order.pricing_info.total_price.toLocaleString()}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                            <p className="mb-1"><span className="font-semibold">วิธีการชำระเงิน:</span> {order.payment_method === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนเงินธนาคาร'}</p>
                            <p><span className="font-semibold">สถานะการชำระ:</span> {order.payment_info?.payment_status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}</p>
                            {order.payment_info?.slip_url?.url && (
                                <a href={order.payment_info.slip_url.url} target="_blank" rel="noreferrer" className="text-sea-primary underline mt-2 inline-block">ดูสลิปการโอน</a>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}

export default Order;