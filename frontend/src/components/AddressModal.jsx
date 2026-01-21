import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import userService from '../services/user.service';

function AddressModal({ isOpen, onClose, onSuccess, addressToEdit = null }) {
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        label: '',
        address_line: '',
        sub_district: '',
        district: '',
        province: '',
        zip_code: '',
        detail: '',
        is_default: false
    });

    useEffect(() => {
        if (isOpen) {
            if (addressToEdit) {
                setFormData({
                    name: addressToEdit.name || '',
                    phone_number: addressToEdit.phone_number || '',
                    label: addressToEdit.label || '',
                    address_line: addressToEdit.address_line || '',
                    sub_district: addressToEdit.sub_district || '',
                    district: addressToEdit.district || '',
                    province: addressToEdit.province || '',
                    zip_code: addressToEdit.zip_code || '',
                    detail: addressToEdit.detail || '',
                    is_default: addressToEdit.is_default || false
                });
            } else {
                setFormData({
                    name: '',
                    phone_number: '',
                    label: '',
                    address_line: '',
                    sub_district: '',
                    district: '',
                    province: '',
                    zip_code: '',
                    detail: '',
                    is_default: false
                });
            }
        }
    }, [isOpen, addressToEdit]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (addressToEdit) {
                await userService.updateShippingAddress(addressToEdit._id, formData);
                toast.success('แก้ไขที่อยู่เรียบร้อย');
            } else {
                await userService.addShippingAddress(formData);
                toast.success('เพิ่มที่อยู่เรียบร้อย');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-sea-text">{addressToEdit ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <Icon icon="ic:round-close" width="24" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">ชื่อผู้รับ</label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">เบอร์โทรศัพท์</label>
                            <input
                                name="phone_number"
                                required
                                value={formData.phone_number.replace(/\D/g, '')}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                                placeholder="08X-XXX-XXXX"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">ที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                        <input
                            name="address_line"
                            required
                            value={formData.address_line}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            placeholder="123/45 ซอย 6..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">แขวง/ตำบล</label>
                            <input
                                name="sub_district"
                                required
                                value={formData.sub_district}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">เขต/อำเภอ</label>
                            <input
                                name="district"
                                required
                                value={formData.district}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">จังหวัด</label>
                            <input
                                name="province"
                                required
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">รหัสไปรษณีย์</label>
                            <input
                                name="zip_code"
                                required
                                maxLength={5}
                                value={formData.zip_code}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">ป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)</label>
                        <input
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            placeholder="บ้าน / ที่ทำงาน / คอนโด"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                        <textarea
                            name="detail"
                            value={formData.detail}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sm"
                            placeholder="จุดสังเกต, ฝากป้อมยาม etc."
                            rows="2"
                        />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-sea-primary border-slate-300 rounded focus:ring-sea-primary"
                        />
                        <label htmlFor="is_default" className="text-sm text-slate-600 cursor-pointer select-none">ตั้งเป็นที่อยู่หลัก</label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-sea-primary text-white font-bold rounded-xl hover:bg-sea-deep transition-all shadow-lg shadow-sea-primary/20 active:scale-95 translate-y-0"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddressModal;
