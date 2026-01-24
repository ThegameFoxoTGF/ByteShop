import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function ProductDetailView({ product }) {
    const navigate = useNavigate();
    const { fetchCartCount } = useCart();
    const { user, toggleWishlist } = useAuth();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Initial image setup
    useEffect(() => {
        if (product) {
            setSelectedImage(product.main_image?.url);
            setQuantity(1);
        }
    }, [product]);

    if (!product) return null;

    const isWishlisted = user?.wishlist?.includes(product._id);
    const images = [product.main_image, ...(product.image || [])].filter(img => img?.url);

    const handleWishlist = async () => {
        if (!user) {
            toast.info("กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด");
            return;
        }
        if (wishlistLoading) return;

        setWishlistLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            await toggleWishlist(product._id);
            toast.success(isWishlisted ? "ลบออกจากรายการโปรดแล้ว" : "เพิ่มลงรายการโปรดเรียบร้อย");
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setWishlistLoading(false);
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
        setAddingToCart(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            const res = await cartService.addToCart(product._id, quantity);

            if (res.message) {
                toast.warning(res.message);
            } else {
                toast.success('เพิ่มลงตะกร้าเรียบร้อยแล้ว');
            }

            await fetchCartCount();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                toast.info('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
            }
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
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

                    {/* Description removed from here */}

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
                            <button
                                onClick={handleWishlist}
                                disabled={wishlistLoading}
                                className={`w-14 h-14 flex items-center justify-center border rounded-xl transition-all transform active:scale-95 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500 hover:shadow-lg hover:shadow-red-200' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-slate-50'}`}
                                title={isWishlisted ? "ลบออกจากรายการโปรด" : "เพิ่มลงรายการโปรด"}
                            >
                                {wishlistLoading ? <Icon icon="eos-icons:loading" /> : <Icon icon={isWishlisted ? "ic:round-favorite" : "ic:round-favorite-border"} width="28" />}
                            </button>
                        </div>
                    </div>

                    {/* Specifications */}
                    {(() => {
                        let displayedSpecs = product.specifications || [];
                        if (product.category_id && Array.isArray(product.category_id.specifications) && product.category_id.specifications.length > 0) {
                            const productSpecMap = new Map(product.specifications.map(s => [s.key, s]));
                            displayedSpecs = product.category_id.specifications
                                .map(catSpec => {
                                    const productSpec = productSpecMap.get(catSpec.key);
                                    if (productSpec && productSpec.value) {
                                        return {
                                            label: catSpec.label,
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

            {/* Description Section */}
            {product.description && (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-sea-text mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                        <Icon icon="ic:round-description" className="text-sea-primary" />
                        รายละเอียดสินค้า
                    </h2>
                    <div
                        className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>
            )}
        </div>
    );
}

export default ProductDetailView;
