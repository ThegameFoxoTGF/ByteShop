import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import userService from '../services/user.service';
import CardProduct from '../components/CardProduct';

function WishlistPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 12;

    useEffect(() => {
        fetchWishlist();
    }, [page]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const data = await userService.getWishlist({ page, limit });
            setProducts(data.wishlist || []);
            setTotalPages(data.pages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-2xl font-bold text-sea-text">สิ่งที่อยากได้ ({total})</h1>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-sea-muted font-medium">กำลังโหลด...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Icon icon="ic:round-favorite-border" className="text-slate-300 text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-sea-text">ยังไม่มีรายการสิ่งที่อยากได้</h3>
                    <p className="text-sea-subtext mt-1">กดหัวใจที่สินค้าที่คุณชอบเพื่อบันทึกไว้ที่นี่</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <CardProduct key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon icon="ic:round-chevron-left" width="24" />
                            </button>
                            <div className="flex items-center gap-1 font-medium text-slate-600 bg-white px-4 border border-slate-200 rounded-lg">
                                <span>{page}</span> <span className="text-slate-400">/</span> <span className="text-slate-400">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon icon="ic:round-chevron-right" width="24" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default WishlistPage;
