import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function CardProduct({ product }) {
    // Default empty state handling
    if (!product) return null;

    const discountPercentage = product.original_price > product.selling_price
        ? Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)
        : 0;

    return (
        <Link
            to={`/product/${product.slug || product._id}`}
            className="group bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-sea-primary/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
        >
            {/* Image Container */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                {product.main_image?.url || product.imageUrl ? (
                    <img
                        src={product.main_image?.url || product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Icon icon="ic:round-image" width="48" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.stock <= 0 && (
                        <span className="bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            Out of Stock
                        </span>
                    )}
                    {discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/20">
                            -{discountPercentage}%
                        </span>
                    )}

                </div>

                {/* Quick Action Overlay (Mobile hidden, Desktop show on hover) */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                    <span className="bg-white text-sea-deep px-6 py-2.5 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                        View Details
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col grow">
                {/* Category */}
                <p className="text-xs font-medium text-sea-subtext mb-1 uppercase tracking-wide">
                    {product.category?.name || product.category_id?.name || 'Accessories'}
                </p>

                {/* Title */}
                <h3 className="text-sea-text font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-sea-primary transition-colors min-h-10">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="mt-auto flex items-end gap-2">
                    <span className="text-lg font-extrabold text-sea-deep">
                        ฿{product.selling_price?.toLocaleString()}
                    </span>
                    {discountPercentage > 0 && (
                        <span className="text-sm text-sea-muted line-through mb-0.5">
                            ฿{product.original_price?.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default CardProduct;