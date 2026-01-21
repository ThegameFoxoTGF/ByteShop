import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import couponService from '../../services/coupon.service';

function CouponFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage', // percentage, fixed
        discount_value: 0,
        max_discount_amount: 0,
        min_order_value: 0,
        usage_limit: 0, // 0 means unlimited
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCoupon();
        }
    }, [id]);

    const fetchCoupon = async () => {
        try {
            const data = await couponService.getCouponById(id);
            setFormData({
                code: data.code,
                description: data.description || '',
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                max_discount_amount: data.max_discount_amount || 0,
                min_order_value: data.min_order_value || 0,
                usage_limit: data.usage_limit || 0,
                start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
                end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
                is_active: data.is_active
            });
        } catch (error) {
            console.error('Error fetching coupon:', error);
            toast.error('Failed to fetch coupon details');
            navigate('/admin/coupons');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                max_discount_amount: Number(formData.max_discount_amount),
                min_order_value: Number(formData.min_order_value),
                usage_limit: Number(formData.usage_limit)
            };

            if (isEditMode) {
                await couponService.updateCoupon(id, payload);
                toast.success('Coupon updated successfully');
            } else {
                await couponService.createCoupon(payload);
                toast.success('Coupon created successfully');
            }
            navigate('/admin/coupons');
        } catch (error) {
            console.error('Error saving coupon:', error);
            const msg = error.response?.data?.message || 'Failed to save coupon';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/coupons" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon icon="ic:round-arrow-back" width="24" />
                </Link>
                <h1 className="text-2xl font-bold text-sea-text">
                    {isEditMode ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">

                {/* Code & Active */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสคูปอง</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary uppercase font-bold tracking-wider"
                                placeholder="e.g. SUMMER2024"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary text-sm"
                                placeholder="คำอธิบายสำหรับผู้ดูแลระบบ"
                            />
                        </div>
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 text-sea-primary rounded focus:ring-sea-primary"
                            />
                            <span className="text-sm font-medium text-slate-700">เปิดใช้งาน</span>
                        </label>
                    </div>
                </div>

                {/* Discount Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทส่วนลด</label>
                        <select
                            name="discount_type"
                            value={formData.discount_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                        >
                            <option value="percentage">ร้อยละ (%)</option>
                            <option value="fixed">จำนวนเงิน (฿)</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">มูลค่าส่วนลด</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="discount_value"
                                    value={formData.discount_value}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary pr-8"
                                    min="0"
                                    required
                                />
                                <span className="absolute right-3 top-2 text-slate-400 text-sm">
                                    {formData.discount_type === 'percentage' ? '%' : '฿'}
                                </span>
                            </div>
                        </div>

                        {formData.discount_type === 'percentage' && (
                            <div className="animate-in fade-in slide-in-from-top-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงินสูงสุดที่ลดได้ (฿)</label>
                                <input
                                    type="number"
                                    name="max_discount_amount"
                                    value={formData.max_discount_amount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                                    min="0"
                                />
                                <p className="text-xs text-slate-400 mt-1">จำนวนเงินสูงสุดที่ลดได้ (0 = ไม่จำกัด)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ยอดสั่งซื้อขั้นต่ำ (฿)</label>
                        <input
                            type="number"
                            name="min_order_value"
                            value={formData.min_order_value}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                            min="0"
                        />
                        <p className="text-xs text-slate-400 mt-1">0 = ไม่จำกัด</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนครั้งที่ใช้ได้</label>
                        <input
                            type="number"
                            name="usage_limit"
                            value={formData.usage_limit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                            min="0"
                        />
                        <p className="text-xs text-slate-400 mt-1">0 = ไม่จำกัด</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันเริ่มต้น</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันสิ้นสุด</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary"
                        />
                        <p className="text-xs text-slate-400 mt-1">ปล่อยว่างไว้จะไม่มีวันหมดอายุ</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/coupons')}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-linear-to-r from-sea-primary to-sea-deep text-white font-bold shadow-lg shadow-sea-primary/30 hover:shadow-sea-primary/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Icon icon="eos-icons:loading" />}
                        {isEditMode ? 'อัปเดตคูปอง' : 'สร้างคูปอง'}
                    </button>
                </div>

            </form >
        </div >
    );
}

export default CouponFormPage;