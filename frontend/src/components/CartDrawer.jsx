import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

function CartDrawer({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fetchCartCount } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                loadCart();
            } else {
                setCartItems([]);
                setTotal(0);
            }
        }
    }, [isOpen, user]);

    const loadCart = async () => {
        setLoading(true);
        try {
            const response = await cartService.getCart();

            const items = response.items || [];
            setCartItems(items);

            if (response.total_price !== undefined) {
                setTotal(response.total_price);
            } else {
                calculateTotal(items);
            }

            if (response.message) {
                toast.info(response.message);
            }
        } catch (error) {
            console.error("Failed to load cart", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => {
            const price = item.product?.selling_price || item.product?.original_price || 0;
            return acc + (price * item.quantity);
        }, 0);
        setTotal(sum);
    };

    const handleRemove = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            await fetchCartCount(); // Update global count
            loadCart(); // Reload local list
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const response = await cartService.updateCartItem(productId, newQuantity);

            if (response.message) {
                toast.info(response.message);
            }

            await fetchCartCount();
            loadCart();
        } catch (error) {
            console.error("Failed to update quantity", error);
            const message = error.response?.data?.message || "Failed to update quantity";
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition-transform duration-300 ease-in-out bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-shopping-bag" className="text-sea-primary" />
                            Shopping Cart
                            <span className="text-sm font-normal text-sea-muted ml-2">({cartItems.length} items)</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Icon icon="ic:round-close" width="24" height="24" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
                                <p className="text-sea-muted text-sm">Loading your cart...</p>
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="w-24 h-24 bg-sea-light/50 rounded-full flex items-center justify-center mb-2">
                                    <Icon icon="ic:outline-remove-shopping-cart" className="w-12 h-12 text-sea-primary/40" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-sea-text">Your cart is empty</h3>
                                    <p className="text-sea-muted text-sm mt-1 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-sea-primary text-white rounded-full font-medium hover:bg-sea-primary-hover shadow-lg shadow-sea-primary/20 transition-all hover:shadow-sea-primary/40 hover:-translate-y-0.5"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={item._id || index} className="group relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sea-primary/20 transition-all duration-200 flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Icon icon="ic:round-image" width="24" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium text-sea-text truncate pr-4">{item.product?.name || 'Unknown Product'}</h4>
                                                <p className="text-sm text-sea-subtext">{/* Variation or Option if any */}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 font-semibold text-sea-primary">
                                                    <span>฿{(item.product?.selling_price || item.product?.original_price || 0).toLocaleString()}</span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)}
                                                        className="p-1 hover:bg-white hover:text-red-500 rounded-l-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Icon icon="ic:round-remove" width="16" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-semibold text-sea-text">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)}
                                                        className="p-1 hover:bg-white hover:text-green-500 rounded-r-lg transition-colors cursor-pointer"
                                                    >
                                                        <Icon icon="ic:round-add" width="16" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Action */}
                                        <button
                                            onClick={() => handleRemove(item.product?._id)}
                                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                        >
                                            <Icon icon="ic:round-delete-outline" width="18" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-slate-100 p-6 bg-white space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sea-subtext text-sm">
                                    <span>Subtotal</span>
                                    <span>฿{total.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xl font-bold text-sea-text">
                                    <span>Total</span>
                                    <span className="text-sea-primary">฿{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/checkout');
                                }}
                                className="w-full py-3.5 bg-linear-to-r from-sea-primary to-sea-deep text-white rounded-xl font-bold shadow-lg shadow-sea-primary/30 flex items-center justify-center gap-2 hover:shadow-sea-primary/50 hover:scale-[1.02] transition-all duration-300"
                            >
                                <Icon icon="ic:round-lock" width="20" />
                                Checkout Securely
                            </button>

                            <p className="text-center text-xs text-sea-muted">
                                Free shipping on orders over ฿5,000
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default CartDrawer;
