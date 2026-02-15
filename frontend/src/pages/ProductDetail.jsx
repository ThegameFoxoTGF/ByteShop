import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import productService from '../services/product.service';
import ProductDetailView from '../components/ProductDetailView';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            let data;
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

            if (isMongoId) {
                data = await productService.getProductById(id);
            } else {
                data = await productService.getProductBySlug(id);
            }

            setProduct(data);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
            navigate('/');
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <ProductDetailView product={product} />
        </div>
    );
}

export default ProductDetail;
