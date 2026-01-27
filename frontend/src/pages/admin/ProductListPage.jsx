import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import productService from '../../services/product.service';

function ProductListPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [keyword, setKeyword] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAllProducts({
                page,
                limit,
                keyword
            });
            setProducts(response.products || []);
            setPages(response.pages || 0);
            setPage(response.page || 1);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, limit, keyword]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(1); // Reset to first page on search
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">Products</h1>
                    <p className="text-sea-subtext mt-1">จัดการสินค้าของคุณ</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-sea-primary to-sea-deep text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5"
                >
                    <Icon icon="ic:round-add" width="20" />
                    เพิ่มสินค้า
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="20" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={keyword}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all text-sea-text placeholder-slate-400"
                    />
                </div>
                {/* Additional filters can go here */}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-sea-muted">กำลังโหลดผลิตภัณฑ์...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="ic:outline-inventory-2" className="text-slate-300 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-sea-text">ไม่พบผลิตภัณฑ์</h3>
                        <p className="text-sea-subtext mt-1">ลองปรับการค้นหาหรือเพิ่มผลิตภัณฑ์ใหม่</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-sea-muted font-semibold">
                                    <th className="px-6 py-4 rounded-tl-2xl">ผลิตภัณฑ์</th>
                                    <th className="px-6 py-4">ประเภท</th>
                                    <th className="px-6 py-4">แบรนด์</th>
                                    <th className="px-6 py-4">ราคา</th>
                                    <th className="px-6 py-4">ส่วนลด</th>
                                    <th className="px-6 py-4">สต็อก</th>
                                    <th className="px-6 py-4">สถานะ</th>
                                    <th className="px-6 py-4 rounded-tr-2xl text-right">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((product) => (
                                    <tr
                                        key={product._id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                    {product.main_image || product.imageUrl ? (
                                                        <img
                                                            src={product.main_image.url || product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Icon icon="ic:round-image" width="20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sea-text group-hover:text-sea-primary transition-colors">{product.name}</h3>
                                                    <p className="text-xs text-sea-muted truncate max-w-[200px]">{product.sku || 'No SKU'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-sea-text">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                                                {product.category?.name || product.category_id?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-sea-text">
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
                                                {product.brand?.name || product.brand_id?.name || 'Unbranded'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sea-text">฿{product.selling_price?.toLocaleString()}</span>
                                                {product.original_price > product.selling_price && (
                                                    <span className="text-xs text-sea-muted line-through">฿{product.original_price?.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sea-text">{product.discount?.toLocaleString()}</span>

                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.stock > 10
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : product.stock > 0
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} />
                                                {product.stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {product.is_active ? 'เปิด' : 'ปิด'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/products/${product._id}`}
                                                    className="p-2 text-slate-400 hover:text-sea-primary hover:bg-sea-light/50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Icon icon="ic:round-edit" width="20" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
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
                )}

                {/* Pagination */}
                {!loading && products.length > 0 && (
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
                                // Logic to show window of pages, simplifying to show first 5 for now or sliding window
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
            </div>
        </div>
    );
}

export default ProductListPage;