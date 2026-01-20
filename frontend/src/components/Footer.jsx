import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-12 pb-8 mt-auto">
            <div className="container mx-auto px-4">
                {/* Service Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 bg-sea-primary/10 rounded-full flex items-center justify-center text-sea-primary mb-4">
                            <Icon icon="ic:round-local-shipping" width="24" height="24" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">ส่งฟรี</h3>
                        <p className="text-slate-500 text-sm">เมื่อซื้อครบ 5,000 บาท</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 bg-sea-primary/10 rounded-full flex items-center justify-center text-sea-primary mb-4">
                            <Icon icon="ic:round-access-time-filled" width="24" height="24" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">รวดเร็ว</h3>
                        <p className="text-slate-500 text-sm">รวดเร็วในการให้บริการ</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 bg-sea-primary/10 rounded-full flex items-center justify-center text-sea-primary mb-4">
                            <Icon icon="ic:round-security" width="24" height="24" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">ปลอดภัย</h3>
                        <p className="text-slate-500 text-sm">ชำระเงินปลอดภัย ด้วยระบบแนบสลิป</p>
                    </div>
                </div>

                <div className="flex justify-center border-t border-slate-100 pt-8flex-col md:flex-row items-center gap-4">
                    <div className="flex flex-col md:items-start justify-center items-center">
                        <Link to="/" className="w-full text-2xl font-black justify-center items-center text-sea-primary mb-2 flex gap-2">
                            <Icon icon="ic:round-computer" /> ByteShop
                        </Link>
                        <p className="w-full text-center text-slate-400 text-sm">&copy; 2026 ByteShop. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;