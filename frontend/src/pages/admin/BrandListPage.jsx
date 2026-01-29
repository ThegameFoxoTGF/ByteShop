import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import brandService from '../../services/brand.service';

function BrandListPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(12);
    const [keyword, setKeyword] = useState('');

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const data = await brandService.getBrands({
                page,
                limit,
                keyword
            });
            if (Array.isArray(data)) {
                // Fallback
                setBrands(data);
                setTotal(data.length);
                setPages(1);
            } else {
                setBrands(data.brands || []);
                setPages(data.pages || 0);
                setPage(data.page || 1);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error("โหลดข้อมูลแบรนด์ไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [page, limit, keyword]);

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบแบรนด์นี้ใช่หรือไม่?')) {
            try {
                await brandService.deleteBrand(id);
                toast.success('ลบแบรนด์เรียบร้อยแล้ว');
                fetchBrands();
            } catch (error) {
                console.error('Error deleting brand:', error);
                const message = error.response?.data?.message || 'ลบแบรนด์ไม่สำเร็จ';
                toast.error(message);
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">แบรนด์</h1>
                    <p className="text-sea-subtext mt-1">จัดการรายชื่อแบรนด์ในระบบ</p>
                </div>
                <Link
                    to="/admin/brands/new"
                    className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-sea-primary to-sea-deep text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5"
                >
                    <Icon icon="ic:round-add" width="20" />
                    เพิ่มแบรนด์
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" />
                    <input
                        type="text"
                        placeholder="ค้นหาแบรนด์..."
                        value={keyword}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sea-text placeholder-slate-400"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-sea-muted">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="ic:round-branding-watermark" className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-sea-text">ไม่พบข้อมูลแบรนด์</h3>
                        <p className="text-sea-subtext mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มแบรนด์ใหม่</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-sea-muted font-semibold">
                                        <th className="px-6 py-4 rounded-tl-2xl">ชื่อแบรนด์</th>
                                        <th className="px-6 py-4 rounded-tr-2xl text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {brands.map((brand) => (
                                        <tr
                                            key={brand._id}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-sea-text">{brand.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/brands/${brand._id}`}
                                                        className="p-2 text-slate-400 hover:text-sea-primary hover:bg-sea-light/50 rounded-lg transition-all"
                                                        title="แก้ไข"
                                                    >
                                                        <Icon icon="ic:round-edit" width="20" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(brand._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="ลบ"
                                                    >
                                                        <Icon icon="ic:round-delete-outline" width="20" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {brands.length > 0 && (
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                <p className="text-sm text-sea-subtext">
                                    แสดงผล <span className="font-medium text-sea-text">{(page - 1) * limit + 1}</span> ถึง <span className="font-medium text-sea-text">{Math.min(page * limit, total)}</span> จาก <span className="font-medium text-sea-text">{total}</span> ผล
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon icon="ic:round-chevron-left" width="20" />
                                    </button>
                                    {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                                        let p = i + 1;
                                        if (pages > 5 && page > 3) {
                                            p = page - 2 + i;
                                        }
                                        if (p > pages) return null;

                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p
                                                    ? 'bg-sea-primary text-white shadow-md shadow-sea-primary/20'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-sea-primary hover:text-sea-primary'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(pages, p + 1))}
                                        disabled={page === pages}
                                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon icon="ic:round-chevron-right" width="20" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default BrandListPage;