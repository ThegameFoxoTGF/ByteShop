import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import productService from '../services/product.service';
import cartService from '../services/cart.service';
import { useCart } from '../contexts/CartContext';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchCartCount } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            let data;
            // Check if id is a valid Mongo Object ID (24 hex chars)
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

            if (isMongoId) {
                data = await productService.getProductById(id);
            } else {
                data = await productService.getProductBySlug(id); // Treat as slug
            }

            setProduct(data);
            setSelectedImage(data.main_image?.url);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (val) => {
        if (val < 1) return;
        if (val > product.stock) {
            toast.warning(`สินค้ามีจำนวนจำกัด (${product.stock} ชิ้น)`);
            return;
        }
        setQuantity(val);
    };

    const handleAddToCart = async () => {
        if (!product) return;
        setAddingToCart(true);
        try {
            const res = await cartService.addToCart(product._id, quantity);

            if (res.message) {
                toast.warning(res.message); // Show backend warning (e.g. partial stock)
            } else {
                toast.success('เพิ่มลงตะกร้าเรียบร้อยแล้ว');
            }

            await fetchCartCount();
            // Optional: could open a mini-cart or stay on page.
        } catch (error) {
            // Check if 401 (unauthorized) -> redirect to login?
            // Usually axios interceptor handles this, but let's be safe
            console.error(error);
            if (error.response && error.response.status === 401) {
                toast.info('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
                navigate('/login');
            } else {
                toast.error(error.response.data.message);
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Icon icon="eos-icons:loading" width="48" className="text-sea-primary" />
            </div>
        );
    }

    if (!product) return null;

    const images = [product.main_image, ...(product.image || [])].filter(img => img?.url);
    // Remove duplicates if main_image is also in image array? 
    // Usually backend handles uniqueness, but simple display is fine.

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumb could go here */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center relative group">
                        {selectedImage ? (
                            <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                            <div className="text-slate-300"><Icon icon="ic:round-image" width="64" /></div>
                        )}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-xl px-4 py-2 border-2 border-white rounded-lg transform -rotate-12">OUT OF STOCK</span>
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img.url)}
                                    className={`w-20 h-20 shrink-0 bg-white rounded-lg border overflow-hidden transition-all ${selectedImage === img.url ? 'border-sea-primary ring-2 ring-sea-primary/20' : 'border-slate-100 hover:border-sea-primary/50'}`}
                                >
                                    <img src={img.url} alt={`thumb-${idx}`} className="w-full h-full object-contain p-2" />
                                </button>
                            ))}
                        </div>
                    )}

                </div>



                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-sea-text mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">SKU: {product.sku}</span>
                            {product.stock > 0 ? (
                                <span className="text-green-600 flex items-center gap-1"><Icon icon="ic:round-check-circle" /> มีสินค้า ({product.stock})</span>
                            ) : (
                                <span className="text-red-500 flex items-center gap-1"><Icon icon="ic:round-error" /> สินค้าหมด</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-sea-primary">฿{product.selling_price.toLocaleString()}</span>
                        {product.original_price > product.selling_price && (
                            <span className="text-slate-400 line-through mb-1">฿{product.original_price.toLocaleString()}</span>
                        )}
                        {product.discount > 0 && (
                            <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full font-medium mb-2">
                                -฿{product.discount.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-sm text-slate-600 max-w-none whitespace-pre-line">
                        {product.description || null}
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-6">
                        {/* Selector */}
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-slate-700">จำนวน:</span>
                            <div className="flex items-center border border-slate-200 rounded-lg">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-sea-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    disabled={quantity <= 1 || product.stock <= 0}
                                >
                                    <Icon icon="ic:round-remove" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                    className="w-14 h-10 text-center border-x border-slate-200 text-slate-700 focus:outline-none"
                                    min="1"
                                    max={product.stock}
                                    disabled={product.stock <= 0}
                                />
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-sea-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    disabled={quantity >= product.stock || product.stock <= 0}
                                >
                                    <Icon icon="ic:round-add" />
                                </button>
                            </div>
                            <span className="text-xs text-slate-400">มีสินค้าเหลือ {product.stock} ชิ้น</span>
                        </div>



                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0 || addingToCart}
                                className="flex-1 bg-sea-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sea-primary/30 hover:shadow-sea-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {addingToCart ? <Icon icon="eos-icons:loading" /> : <Icon icon="ic:round-add-shopping-cart" />}
                                เพิ่มลงตะกร้า
                            </button>
                            {/* <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                                <Icon icon="ic:round-favorite-border" width="24" />
                            </button> */}
                        </div>
                    </div>

                    {/* Specifications */}
                    {(() => {
                        // Logic to sort specs based on Category configuration
                        let displayedSpecs = product.specifications || [];

                        if (product.category_id && Array.isArray(product.category_id.specifications) && product.category_id.specifications.length > 0) {
                            const productSpecMap = new Map(product.specifications.map(s => [s.key, s]));

                            displayedSpecs = product.category_id.specifications
                                .map(catSpec => {
                                    const productSpec = productSpecMap.get(catSpec.key);
                                    if (productSpec && productSpec.value) {
                                        return {
                                            label: catSpec.label, // Use latest label from category
                                            value: productSpec.value,
                                            unit: catSpec.unit || productSpec.unit,
                                            key: catSpec.key
                                        };
                                    }
                                    return null;
                                })
                                .filter(Boolean);
                        }

                        if (displayedSpecs.length === 0) return null;

                        return (
                            <div className="mt-8 bg-slate-50 rounded-xl p-6">
                                <h3 className="font-semibold text-sea-text mb-4">คุณสมบัติสินค้า</h3>
                                <div className="grid grid-cols-1 gap-y-2 text-sm">
                                    {displayedSpecs.map((spec, idx) => (
                                        <div key={idx} className="grid grid-cols-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-500 font-medium">{spec.label || spec.key}</span>
                                            <span className="col-span-2 text-slate-700">{spec.value} {spec.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
