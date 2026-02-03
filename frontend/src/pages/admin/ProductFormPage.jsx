import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';
import brandService from '../../services/brand.service';
import uploadService from '../../services/upload.service';

const simpleSlugify = (text, separator = '-') => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
};

function ProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initial Data
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Category specific schemas
    const [categorySchema, setCategorySchema] = useState({ filters: [], specifications: [] });

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        sku: '',
        price: '',
        selling_price: '', // if different from price? or usually original_price vs price. Let's assume price = original, selling_price = current selling
        stock: 0,
        category: '',
        brand: '',
        main_image: null, // { url: '', public_id: '' }
        images: [], // [ { url: '', public_id: '' } ]
        is_active: true,
        filters: {}, // { key: value } or { key: [values] }
        specifications: [], // [ { key: 'screen_size', value: '15 inch', label: 'Screen Size' } ] ? Or just match the schema
        warranty_period: '',
        warranty_provider: '',
        search_keywords: ''
    });

    // Fetch Lists
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, brds] = await Promise.all([
                    categoryService.getCategories(),
                    brandService.getBrands()
                ]);
                setCategories(cats.categories || (Array.isArray(cats) ? cats : []));
                setBrands(brds.brands || (Array.isArray(brds) ? brds : []));
            } catch (error) {
                console.error('Error fetching lists:', error);
                toast.error('โหลดข้อมูลตัวเลือกไม่สำเร็จ');
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Product if Edit
    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        setFetching(true);
        try {
            const data = await productService.getProductById(id);
            // Map data to form
            // Check if price/selling_price mapping is correct based on backend. 
            // Usually backend might use price as selling price and original_price as MSRP. 
            // Let's assume selling_price is the main price, original_price is "price" in form?
            // Actually, let's check standard. usually: price (regular), sale_price (discounted).
            // Let's map: original_price -> price, selling_price -> selling_price

            // Transform filters array to object for form state
            const filtersObj = {};
            if (data.filters && Array.isArray(data.filters)) {
                data.filters.forEach(f => {
                    if (f.key) filtersObj[f.key] = f.value;
                });
            }

            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                description: data.description || '',
                sku: data.sku || '',
                price: data.original_price || '',
                selling_price: data.selling_price || '',
                stock: data.stock || 0,
                category: data.category_id?._id || data.category_id || '',
                brand: data.brand_id?._id || data.brand_id || '',
                main_image: data.main_image || null,
                images: data.image || [],
                is_active: data.is_active ?? true,
                filters: filtersObj,
                specifications: data.specifications || [],
                warranty_period: data.warranty_period || '',
                warranty_provider: data.warranty_provider || '',
                search_keywords: data.search_keywords ? data.search_keywords.join(', ') : ''
            });

            // If category exists, fetch schema
            if (data.category_id) {
                const catId = typeof data.category_id === 'object' ? data.category_id._id : data.category_id;
                fetchCategorySchema(catId);
            }

        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('โหลดข้อมูลสินค้าไม่สำเร็จ');
            navigate('/admin/products');
        } finally {
            setFetching(false);
        }
    };

    const fetchCategorySchema = async (catId) => {
        if (!catId) return;
        try {
            const cat = await categoryService.getCategoryById(catId);
            setCategorySchema({
                filters: cat.filters || [],
                specifications: cat.specifications || []
            });
        } catch (error) {
            console.error('Error fetching category schema:', error);
        }
    };

    // Handle Input Changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updates = { ...prev, [name]: val };
            if (name === 'name' && !isEditMode) {
                updates.slug = simpleSlugify(value, '-');
            }
            return updates;
        });

        if (name === 'category') {
            fetchCategorySchema(value);
            // Clear filters/specs when category changes? Maybe yes to avoid conflicts
            // But maybe user wants to keep basic info
            setFormData(prev => ({
                ...prev,
                category: value,
                filters: {},
                specifications: []
            }));
        }
    };

    const handleSlugBlur = () => {
        if (formData.slug) {
            setFormData(prev => ({ ...prev, slug: simpleSlugify(prev.slug, '-') }));
        }
    };

    const isSavedRef = React.useRef(false); // Track save status with ref to avoid closure staleness in cleanup
    const uploadedImagesRef = React.useRef([]); // Track new uploads for cleanup

    // Cleanup on unmount if not saved
    useEffect(() => {
        return () => {
            // Only cleanup if NOT saved and there are uploaded images
            if (!isSavedRef.current && uploadedImagesRef.current.length > 0) {
                console.log('Cleaning up orphaned images:', uploadedImagesRef.current);
                uploadedImagesRef.current.forEach(public_id => {
                    uploadService.deleteImage(public_id).catch(err => console.error('Cleanup error:', err));
                });
            }
        };
    }, []);

    // Image Upload Helpers
    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const res = await uploadService.uploadImage(uploadData);
            setFormData(prev => ({ ...prev, main_image: res }));
            uploadedImagesRef.current.push(res.public_id); // Track
        } catch (error) {
            toast.error('อัปโหลดรูปภาพไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(file => {
                const data = new FormData();
                data.append('image', file);
                return uploadService.uploadImage(data);
            });
            const results = await Promise.all(uploadPromises);

            results.forEach(res => uploadedImagesRef.current.push(res.public_id)); // Track

            setFormData(prev => ({ ...prev, images: [...prev.images, ...results] }));
        } catch (error) {
            toast.error('อัปโหลดรูปภาพบางรายการไม่สำเร็จ');
        } finally {
            setUploading(false);
        }
    };

    const removeMainImage = async () => {
        const public_id = formData.main_image?.public_id;
        if (public_id) {
            try {
                await uploadService.deleteImage(public_id);
                // Remove from ref if it was just uploaded
                uploadedImagesRef.current = uploadedImagesRef.current.filter(id => id !== public_id);
            } catch (error) {
                console.error("Failed to delete image", error);
            }
        }
        setFormData(prev => ({ ...prev, main_image: null }));
    };

    const removeGalleryImage = async (index) => {
        const imageToDelete = formData.images[index];
        if (imageToDelete?.public_id) {
            try {
                await uploadService.deleteImage(imageToDelete.public_id);
                uploadedImagesRef.current = uploadedImagesRef.current.filter(id => id !== imageToDelete.public_id);
            } catch (error) {
                console.error("Failed to delete image", error);
            }
        }

        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleCancel = async () => {
        if (uploadedImagesRef.current.length > 0) {
            try {
                await Promise.all(uploadedImagesRef.current.map(id => uploadService.deleteImage(id)));
                uploadedImagesRef.current = [];
            } catch (e) { console.error(e) }
        }
        navigate('/admin/products');
    };

    // Filters & Specs Handlers
    const handleFilterChange = (key, value, isArray = false) => {
        setFormData(prev => {
            const newFilters = { ...prev.filters };
            if (isArray) {
                // Should handle array if multiselect
                // For now assume value is the final value (e.g. from a select)
                newFilters[key] = value;
            } else {
                newFilters[key] = value;
            }
            return { ...prev, filters: newFilters };
        });
    };

    const handleSpecChange = (key, value, label, unit) => {
        setFormData(prev => {
            const newSpecs = [...(prev.specifications || [])];
            const existingIndex = newSpecs.findIndex(s => s.key === key);

            if (existingIndex >= 0) {
                newSpecs[existingIndex] = { key, value, label, unit };
            } else {
                newSpecs.push({ key, value, label, unit });
            }
            return { ...prev, specifications: newSpecs };
        });
    };

    const getSpecValue = (key) => {
        const spec = formData.specifications?.find(s => s.key === key);
        return spec ? spec.value : '';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare Payload
        // Ensure numbers are numbers
        const originalPrice = Number(formData.price);
        const sellingPrice = Number(formData.selling_price) || originalPrice;
        const discount = originalPrice - sellingPrice;

        // Transform filters object to array for backend
        const filtersArray = Object.entries(formData.filters).map(([key, value]) => {
            const schema = categorySchema.filters.find(f => f.key === key);
            return {
                key,
                value,
                label: schema ? schema.label : key
            };
        }).filter(f => f.value !== ''); // Only keep filters with values

        const payload = {
            ...formData,
            category_id: formData.category,
            brand_id: formData.brand,
            original_price: originalPrice,
            selling_price: sellingPrice,
            discount: discount > 0 ? discount : 0,
            stock: Number(formData.stock),
            filters: filtersArray,
            image: formData.images,
            warranty_period: Number(formData.warranty_period) || 0,
            warranty_provider: formData.warranty_provider,
            search_keywords: formData.search_keywords ? formData.search_keywords.split(',').map(k => k.trim()).filter(k => k !== '') : []
        };
        // ...


        try {
            if (isEditMode) {
                await productService.updateProduct(id, payload);
                isSavedRef.current = true;
                toast.success('อัปเดตสินค้าเรียบร้อยแล้ว');
            } else {
                await productService.createProduct(payload);
                isSavedRef.current = true;
                toast.success('สร้างสินค้าเรียบร้อยแล้ว');
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            const message = error.response?.data?.message || 'บันทึกสินค้าไม่สำเร็จ';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-sea-light border-t-sea-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/products" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon icon="ic:round-arrow-back" width="24" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">
                        {isEditMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                    </h1>
                    <p className="text-sea-subtext text-sm">จัดการข้อมูลสินค้าในคลัง</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-article" className="text-sea-primary" /> ข้อมูลทั่วไป
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="เช่น CPU Core i3 1200"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-sea-text mb-1">URL Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        onBlur={handleSlugBlur}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                        placeholder="cpu-core-i3-1200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-sea-text mb-1">SKU (รหัสสินค้า) </label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                        placeholder="PROD-001"
                                    />
                                    <p className="text-xs text-sea-subtext mt-1">หากไม่ระบุจะสร้างอัตโนมัติ</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">คำค้นหา (Keywords)</label>
                                <input
                                    type="text"
                                    name="search_keywords"
                                    value={formData.search_keywords}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="คั่นด้วยเครื่องหมายจุลภาค (,) เช่น gaming, rgb, intel"
                                />
                                <p className="text-xs text-sea-subtext mt-1">ช่วยในการค้นหาสินค้าได้ง่ายขึ้น</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">คำอธิบายรายละเอียด</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="รายละเอียดเกี่ยวกับสินค้า..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-attach-money" className="text-sea-primary" /> ราคาและคลังสินค้า
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">ราคาปกติ (บาท) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="0.00"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">ราคาขายจริง (บาท)</label>
                                <input
                                    type="number"
                                    name="selling_price"
                                    value={formData.selling_price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="0.00"
                                    min="0"
                                />
                                <p className="text-xs text-sea-subtext mt-1">หากไม่ระบุจะใช้ราคาปกติ</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">จำนวนสินค้าในคลัง <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Warranty & SEO */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-verified-user" className="text-sea-primary" /> การรับประกัน & SEO
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">ระยะเวลารับประกัน (เดือน)</label>
                                <input
                                    type="number"
                                    name="warranty_period"
                                    value={formData.warranty_period}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="เช่น 12"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-1">ผู้ให้บริการรับประกัน</label>
                                <input
                                    type="text"
                                    name="warranty_provider"
                                    value={formData.warranty_provider}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    placeholder="เช่น Synnex, Advice, ศูนย์ไทย"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Attributes (Dynamic from Category Filters) */}
                    {formData.category && categorySchema.filters.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                                <Icon icon="ic:round-filter-list" className="text-sea-primary" /> คุณลักษณะ (ตัวกรอง)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {categorySchema.filters.map((filter, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium text-sea-text mb-1">
                                            {filter.label} <span className="text-slate-400 text-xs">({filter.key})</span>
                                        </label>

                                        {['select', 'multiselect'].includes(filter.type) ? (
                                            <select
                                                value={formData.filters[filter.key] || ''}
                                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sea-primary"
                                            >
                                                <option value="">-- เลือก --</option>
                                                {filter.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : filter.type === 'boolean' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleFilterChange(filter.key, 'Yes')}
                                                    className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${formData.filters[filter.key] === 'Yes'
                                                        ? 'bg-sea-primary text-white border-sea-primary shadow-md shadow-sea-primary/20'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    ใช่
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFilterChange(filter.key, 'No')}
                                                    className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${formData.filters[filter.key] === 'No'
                                                        ? 'bg-sea-primary text-white border-sea-primary shadow-md shadow-sea-primary/20'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    ไม่ใช่
                                                </button>
                                            </div>
                                        ) : (
                                            <input
                                                type={filter.type === 'number' ? 'number' : 'text'}
                                                value={formData.filters[filter.key] || ''}
                                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sea-primary"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specifications (Dynamic from Category Specs) */}
                    {formData.category && categorySchema.specifications.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                                <Icon icon="ic:round-list" className="text-sea-primary" /> ข้อมูลทางเทคนิค
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {categorySchema.specifications.map((spec, index) => (
                                    <div key={index}>
                                        <label className="block text-sm font-medium text-sea-text mb-1">
                                            {spec.label} <span className="text-slate-400 text-xs">({spec.key})</span>
                                        </label>
                                        <div className="flex gap-2 items-start">
                                            {spec.type === 'boolean' ? (
                                                <div className="w-full flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSpecChange(spec.key, 'Yes', spec.label, spec.unit)}
                                                        className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${getSpecValue(spec.key) === 'Yes'
                                                            ? 'bg-sea-primary text-white border-sea-primary shadow-md shadow-sea-primary/20'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        ใช่
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSpecChange(spec.key, 'No', spec.label, spec.unit)}
                                                        className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${getSpecValue(spec.key) === 'No'
                                                            ? 'bg-sea-primary text-white border-sea-primary shadow-md shadow-sea-primary/20'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        ไม่ใช่
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex-1">
                                                        <input
                                                            type={spec.type === 'number' ? 'number' : 'text'}
                                                            value={getSpecValue(spec.key)}
                                                            onChange={(e) => handleSpecChange(spec.key, e.target.value, spec.label, spec.unit)}
                                                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors ${spec.type === 'select'
                                                                ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                                                                : 'bg-slate-50 border-slate-200 focus:border-sea-primary'
                                                                }`}
                                                            placeholder={`ระบุ ${spec.label}`}
                                                            readOnly={spec.type === 'select'}
                                                        />
                                                        {spec.type === 'number' && (
                                                            <p className="text-xs text-sea-subtext mt-1">
                                                                * กรุณาระบุเป็นตัวเลขเท่านั้น
                                                            </p>
                                                        )}
                                                        {spec.unit && <span className="text-xs text-slate-500 mt-1 block">หน่วย: {spec.unit}</span>}
                                                    </div>
                                                    {spec.type === 'select' && spec.options && (
                                                        <select
                                                            value=""
                                                            onChange={(e) => handleSpecChange(spec.key, e.target.value, spec.label, spec.unit)}
                                                            className="w-33 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none hover:border-sea-primary text-sm text-slate-700 cursor-pointer shadow-sm"
                                                        >
                                                            <option value="" disabled>เลือกตัวเลือก</option>
                                                            {spec.options.map((option, idx) => (
                                                                <option key={idx} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Organization & Images */}
                <div className="space-y-8">
                    {/* Organization */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text">การจัดหมวดหมู่</h2>

                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                required
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-1">แบรนด์ <span className="text-red-500">*</span></label>
                            <select
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                required
                            >
                                <option value="">-- เลือกแบรนด์ --</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded text-sea-primary focus:ring-sea-primary"
                                />
                                <span className="text-sm font-medium text-sea-text">เปิดขายสินค้า (Active)</span>
                            </label>

                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-image" className="text-sea-primary" /> รูปภาพสินค้า
                        </h2>

                        {/* Main Image */}
                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-2">รูปภาพหลัก <span className="text-red-500">*</span></label>
                            <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden hover:bg-slate-100 transition-colors group">
                                {loading || uploading ? (
                                    <Icon icon="eos-icons:loading" className="text-slate-400" width="32" />
                                ) : formData.main_image?.url ? (
                                    <>
                                        <img src={formData.main_image.url} alt="Main" className="w-full h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={removeMainImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icon icon="ic:round-close" width="16" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="ic:round-add-photo-alternate" className="text-slate-400 w-10 h-10 mb-2" />
                                        <span className="text-sm text-slate-500">คลิกเพื่ออัปโหลด</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMainImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Gallery */}
                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-2">รูปภาพเพิ่มเติม</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg bg-slate-50 border border-slate-200 overflow-hidden group">
                                        <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icon icon="ic:round-close" width="12" />
                                        </button>
                                    </div>
                                ))}
                                <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
                                    <Icon icon="ic:round-add" className="text-slate-400 w-6 h-6" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:sticky lg:top-10 z-10">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full py-3 rounded-xl bg-linear-to-r from-sea-primary to-sea-deep text-white font-semibold shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Icon icon="eos-icons:loading" />}
                            {isEditMode ? 'อัปเดตสินค้า' : 'สร้างสินค้า'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full py-3 rounded-xl text-slate-600 bg-white border border-slate-200 font-medium hover:bg-slate-50 transition-colors text-center"
                        >
                            ยกเลิก
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}

export default ProductFormPage;