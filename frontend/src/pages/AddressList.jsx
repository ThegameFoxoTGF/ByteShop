import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import userService from '../services/user.service';

import AddressModal from '../components/AddressModal';

function AddressList() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await userService.getShippingAddress();
            setAddresses(res.address || []);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูลที่อยู่ไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (address = null) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) {
            try {
                await userService.deleteShippingAddress(id);
                toast.success('ลบที่อยู่เรียบร้อย');
                fetchAddresses();
            } catch (error) {
                console.error(error);
                toast.error('ลบที่อยู่ไม่สำเร็จ');
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-sea-text">ที่อยู่ของฉัน</h2>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-sea-primary text-white rounded-xl hover:bg-sea-deep transition-all shadow-lg shadow-sea-primary/20"
                >
                    <Icon icon="ic:round-add" width="20" /> เพิ่มที่อยู่ใหม่
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Icon icon="eos-icons:loading" width="32" className="text-sea-primary" />
                </div>
            ) : addresses.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <Icon icon="ic:round-location-off" width="64" className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">คุณยังไม่มีข้อมูลที่อยู่</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {addresses.map(addr => (
                        <div key={addr._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-slate-900">{addr.name}</span>
                                    {addr.is_default && (
                                        <span className="px-2 py-0.5 bg-sea-primary/10 text-sea-primary text-[10px] font-bold rounded-md border border-sea-primary/20">
                                            ค่าเริ่มต้น
                                        </span>
                                    )}
                                    {addr.label && (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md border border-slate-200 uppercase">
                                            {addr.label}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-slate-600 space-y-0.5">
                                    <p>{addr.phone_number}</p>
                                    <p>{addr.address_line} {addr.sub_district} {addr.district}</p>
                                    <p>{addr.province} {addr.zip_code}</p>
                                    {addr.detail && <p className="text-slate-400 italic text-xs mt-1">*{addr.detail}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => openModal(addr)}
                                    className="p-2 text-slate-400 hover:text-sea-primary hover:bg-sea-primary/5 rounded-lg transition-colors"
                                    title="แก้ไข"
                                >
                                    <Icon icon="ic:round-edit" width="18" />
                                </button>
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="ลบ"
                                >
                                    <Icon icon="ic:round-delete" width="18" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AddressModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={fetchAddresses}
                addressToEdit={editingAddress}
            />
        </div>
    );
}

export default AddressList;
