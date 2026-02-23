import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import orderService from '../../services/order.service';

function ReceiptPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await orderService.getByOrderId(id);
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('โหลดข้อมูลใบเสร็จไม่สำเร็จ');
            navigate(-1);
        } finally {
            setLoading(false);
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

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cod': return 'ชำระเงินปลายทาง';
            case 'bank_transfer': return 'โอนเงิน';
            default: return method;
        }
    };

    // แปลงตัวเลขเป็นคำอ่านภาษาไทยแบบง่ายๆ
    const numToThaiText = (num) => {
        if (!num || num === 0) return 'ศูนย์บาทถ้วน';
        const text = Number(num).toFixed(2).split('.');
        const integerPart = parseInt(text[0], 10);
        const fractionalPart = parseInt(text[1], 10);

        const t = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
        const p = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
        const toThai = (n) => {
            if (n === 0) return '';
            let str = n.toString();
            let res = '';
            for (let i = 0; i < str.length; i++) {
                let d = parseInt(str[i], 10);
                let pos = str.length - i - 1;
                if (d === 0) continue;
                if (d === 1 && pos === 0 && str.length > 1) { res += 'เอ็ด'; continue; }
                if (d === 1 && pos === 1) { res += 'สิบ'; continue; }
                if (d === 2 && pos === 1) { res += 'ยี่สิบ'; continue; }
                res += t[d] + p[pos % 6]; // Fix for millions
            }
            return res;
        }
        let res = toThai(integerPart) + 'บาท';
        if (fractionalPart > 0) res += toThai(fractionalPart) + 'สตางค์';
        else res += 'ถ้วน';
        return res;
    };

    const orderNo = order.order_id || order._id.substring(0, 10).toUpperCase();

    const ITEMS_PER_PAGE = 12;
    const totalPages = Math.max(1, Math.ceil((order?.items?.length || 0) / ITEMS_PER_PAGE));
    const pages = Array.from({ length: totalPages });

    return (
        <div className="min-h-screen bg-slate-200 print:bg-white flex flex-col items-center py-8 print:py-0 print:block overflow-x-hidden">
            <style>
                {`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
                    .a4-page { 
                        width: 210mm !important; 
                        height: 297mm !important; 
                        margin: 0 !important; 
                        padding: 10mm 15mm !important; 
                        border: none !important; 
                        box-shadow: none !important; 
                        page-break-after: always;
                        overflow: hidden !important;
                    }
                    .a4-page:last-child {
                        page-break-after: auto;
                    }
                }
                /* สำหรับการแสดงผลบนหน้าจอเดสก์ท็อปให้มีขนาดเท่ากระดาษ A4 เสมอ */
                @media screen {
                    .a4-page {
                        width: 210mm;
                        height: 297mm;
                        padding: 10mm 15mm;
                    }
                }
                `}
            </style>

            {/* Control Bar */}
            <div className="w-full max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <button
                    onClick={() => window.close()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <Icon icon="ic:round-close" width="20" /> ปิดหน้าต่าง
                </button>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <Icon icon="ic:round-info" /> รูปแบบหน้ากระดาษ A4 (210 x 297mm)
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-sea-primary text-white rounded-lg hover:bg-sea-deep flex items-center gap-2 shadow-lg shadow-sea-primary/20 font-medium transition-colors ml-4"
                    >
                        <Icon icon="ic:round-print" width="20" /> พิมพ์ / บันทึก PDF
                    </button>
                </div>
            </div>

            {/* Receipt Content - A4 Pagination Layout */}
            {pages.map((_, pageIndex) => {
                const isLastPage = pageIndex === totalPages - 1;
                const pageItems = order.items.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE);

                return (
                    <div key={pageIndex} className="a4-page bg-white text-black shadow-xl box-border font-sans text-xs print:m-0 flex flex-col mb-8 print:mb-0">
                        {/* 1. HEADER */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-4">
                                <div>
                                    <h1 className="text-xl font-bold mb-1">ByteShop</h1>
                                    <p className="text-[11px] text-slate-600 leading-tight">
                                        บริษัท ไบต์ช็อป จำกัด<br />
                                        43/6 ตำบลบางพระ อำเภอศรีราชา จังหวัดชลบุรี 20110<br />
                                        โทร. 033-136-099
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">ใบเสร็จรับเงิน</h2>
                                <p className="text-sm font-medium">ต้นฉบับ {totalPages > 1 && `(หน้า ${pageIndex + 1}/${totalPages})`}</p>
                            </div>
                        </div>

                        {/* 2. CUSTOMER & ORDER INFO */}
                        <div className="grid grid-cols-2 border border-slate-900 mb-4 text-[11px]">
                            <div className="p-3 border-r border-slate-900">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="w-24 font-bold align-top pb-1">นาม/Sold to</td>
                                            <td className="align-top pb-1 uppercase">{order.shipping_address?.name}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold align-top">ที่อยู่/Address</td>
                                            <td className="align-top leading-tight">
                                                {order.shipping_address ?
                                                    `${order.shipping_address.address_line} ต.${order.shipping_address.sub_district} อ.${order.shipping_address.district} จ.${order.shipping_address.province} ${order.shipping_address.zip_code}`
                                                    : '-'}
                                                <br />เบอร์โทรศัพท์: {order.shipping_address?.phone_number || '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold align-top pt-1">อีเมล/Email</td>
                                            <td className="align-top pt-1 text-slate-600">{order.user_id?.email || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-3">
                                <table className="w-full">
                                    <tbody>
                                        <tr>
                                            <td className="w-32 font-bold pb-1">เลขที่เอกสาร/Doc No.</td>
                                            <td className="pb-1 uppercase">{orderNo}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold pb-1">วันที่/Date</td>
                                            <td className="pb-1">{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                                        </tr>
                                        <tr>
                                            <td className="font-bold">ช่องทางชำระ/Payment</td>
                                            <td>{getPaymentMethodText(order.payment_method)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 3. ITEM TABLE (FLEX-1 TO STRETCH TO BOTTOM) */}
                        <div className="flex-1 flex flex-col border border-slate-900 border-b-0 mb-0">
                            <table className="w-full text-center text-[11px] border-collapse flex-1 flex flex-col items-stretch">
                                <thead className="bg-slate-100 shrink-0 w-full table table-fixed m-0">
                                    <tr className="border-b border-slate-900">
                                        <th className="py-2 px-1 w-[50px] border-r border-slate-900 font-bold">ลำดับที่<br /><span className="text-[9px] font-normal">Item No.</span></th>
                                        <th className="py-2 px-1 text-center border-r border-slate-900 font-bold">รายการ<br /><span className="text-[9px] font-normal">Description</span></th>
                                        <th className="py-2 px-1 w-[60px] border-r border-slate-900 font-bold">จำนวน<br /><span className="text-[9px] font-normal">Quantity</span></th>
                                        <th className="py-2 px-1 w-[80px] border-r border-slate-900 font-bold">ราคาต่อหน่วย<br /><span className="text-[9px] font-normal">Unit Price</span></th>
                                        <th className="py-2 px-1 w-[90px] font-bold">จำนวนเงิน<br /><span className="text-[9px] font-normal">Amount</span></th>
                                    </tr>
                                </thead>
                                <tbody className="flex-1 flex flex-col w-full">
                                    {pageItems.map((item, index) => {
                                        const globalIndex = pageIndex * ITEMS_PER_PAGE + index + 1;
                                        return (
                                            <tr key={globalIndex} className="w-full table table-fixed align-top">
                                                <td className="py-3 px-1 w-[50px] border-r border-slate-900">{globalIndex}</td>
                                                <td className="py-3 px-4 text-left border-r border-slate-900">
                                                    <p className="font-medium text-slate-800 leading-tight">{item.name}</p>
                                                    <p className="text-slate-500 text-[9px] uppercase mt-1">SKU: {item._id?.substring(0, 8)}</p>
                                                </td>
                                                <td className="py-3 px-1 w-[60px] border-r border-slate-900">{item.quantity}</td>
                                                <td className="py-3 px-1 w-[80px] border-r border-slate-900 text-right pr-3">{item.price_snapshot?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="py-3 px-1 w-[90px] text-right pr-3">{((item.price_snapshot || 0) * (item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                    {/* Stretch Row specifically to push down the rest using flex-1 */}
                                    <tr className="flex-1 w-full table table-fixed h-full">
                                        <td className="w-[50px] border-r border-slate-900 border-b-0 h-full"></td>
                                        <td className="border-r border-slate-900 border-b-0 h-full"></td>
                                        <td className="w-[60px] border-r border-slate-900 border-b-0 h-full"></td>
                                        <td className="w-[80px] border-r border-slate-900 border-b-0 h-full"></td>
                                        <td className="w-[90px] border-b-0 h-full"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. FOOTER CALCULATIONS */}
                        {isLastPage ? (
                            <>
                                <div className="grid grid-cols-[1fr_240px] border border-slate-900 min-h-[100px] mb-4 text-[11px]">
                                    {/* Left: Notes & Thai Text */}
                                    <div className="flex flex-col justify-between border-r border-slate-900">
                                        <div className="p-3">
                                            <h4 className="font-bold mb-1">หมายเหตุ/Remarks:</h4>
                                            <p className="text-slate-700">การรับประกันสินค้าจะเป็นไปตามเงื่อนไขของบริษัท หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่</p>
                                            {order.note && <p className="mt-1 text-slate-600">ข้อความเพิ่มเติม: {order.note}</p>}
                                        </div>
                                        <div className="bg-slate-100 p-2 text-center text-[12px] font-bold border-t border-slate-900">
                                            ( {numToThaiText(order.pricing_info?.total_price || 0)} )
                                        </div>
                                    </div>

                                    {/* Right: Calculation */}
                                    <div className="flex flex-col h-full font-medium">
                                        <div className="flex justify-between p-1 px-3 border-b border-slate-300">
                                            <span>ราคาสินค้ารวม (Sub-Total)</span>
                                            <span>{order.pricing_info?.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between p-1 px-3 border-b border-slate-300">
                                            <span>ส่วนลดคูปอง (Coupon Discount)</span>
                                            <span>{order.pricing_info?.discount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between p-1 px-3 border-b border-slate-300">
                                            <span>ค่าจัดส่ง (Delivery Fee)</span>
                                            <span>{order.pricing_info?.shipping_fee?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                                        </div>
                                        {/* Filler Space if needed to align bottom */}
                                        <div className="flex-1 bg-white border-b border-slate-900"></div>

                                        <div className="flex justify-between items-center p-2 px-3 bg-slate-100 font-bold text-sm h-11">
                                            <span>ยอดสุทธิ (Net Total)</span>
                                            <span>{order.pricing_info?.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. SIGNATURE SPACES */}
                                <div className="grid grid-cols-2 gap-8 px-4 text-center mt-auto pb-4">
                                    <div className="max-w-[200px] mx-auto w-full">
                                        <p className="mb-8 font-medium">ผู้รับของ / Received by</p>
                                        <div className="border-b border-black mb-2"></div>
                                        <p className="text-[10px] text-slate-600">วันที่ / Date: ............./............./.............</p>
                                    </div>
                                    <div className="max-w-[200px] mx-auto w-full">
                                        <p className="mb-8 font-medium">ผู้ออกเอกสาร / Authorized by</p>
                                        <div className="border-b border-black mb-2"></div>
                                        <p className="text-[10px] text-slate-600">วันที่ / Date: ............./............./.............</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="border border-slate-900 border-t-0 p-4 text-center text-slate-500 text-[11px] italic mb-auto">
                                มีรายการต่อหน้าถัดไป (Continue to next page...)
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}

export default ReceiptPage;
