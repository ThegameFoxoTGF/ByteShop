import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import brandService from '../../services/brand.service';

// Helper for slug generation
const simpleSlugify = (text, separator = '-') => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
};

function BrandFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo: '',
        description: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchBrand();
        }
    }, [id]);

    const fetchBrand = async () => {
        setFetching(true);
        try {
            const data = await brandService.getBrandById(id);
            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                logo: data.logo || '',
                description: data.description || ''
            });
        } catch (error) {
            console.error('Error fetching brand:', error);
            toast.error('โหลดข้อมูลแบรนด์ไม่สำเร็จ');
            navigate('/admin/brands');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };
            if (name === 'name' && !isEditMode) {
                updates.slug = simpleSlugify(value, '-');
            }
            return updates;
        });
    };

    const handleSlugBlur = () => {
        if (formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: simpleSlugify(prev.slug, '-')
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditMode) {
                await brandService.updateBrand(id, formData);
                toast.success('อัปเดตแบรนด์เรียบร้อยแล้ว');
            } else {
                await brandService.createBrand(formData);
                toast.success('สร้างแบรนด์เรียบร้อยแล้ว');
            }
            navigate('/admin/brands');
        } catch (error) {
            console.error('Error saving brand:', error);
            const message = error.response?.data?.message || 'บันทึกแบรนด์ไม่สำเร็จ';
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
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/brands" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon icon="ic:round-arrow-back" width="24" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">
                        {isEditMode ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์ใหม่'}
                    </h1>
                    <p className="text-sea-subtext text-sm">จัดการข้อมูลแบรนด์สินค้า</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                        <Icon icon="ic:round-info" className="text-sea-primary" /> ข้อมูลพื้นฐาน
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-2">ชื่อแบรนด์ <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="เช่น Apple"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-sea-text mb-2">URL Slug (ลิงก์ถาวร)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                onBlur={handleSlugBlur}
                                placeholder="เช่น apple"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                required
                            />
                            <p className="text-xs text-sea-subtext mt-1">ใช้สำหรับสร้างลิงก์ URL (ระบบจะสร้างให้อัตโนมัติจากชื่อแบรนด์)</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-sea-text mb-2">โลโก้ (URL รูปภาพ)</label>
                            <input
                                type="text"
                                name="logo"
                                value={formData.logo}
                                onChange={handleInputChange}
                                placeholder="เช่น https://example.com/logo.png"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all font-mono text-sm"
                            />
                            {formData.logo && (
                                <div className="mt-2 p-2 border border-slate-200 rounded-lg inline-block bg-white">
                                    <img src={formData.logo} alt="Preview" className="h-12 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-sea-text mb-2">คำอธิบาย (รายละเอียด)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="รายละเอียดเกี่ยวกับแบรนด์นี้..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        to="/admin/brands"
                        className="px-6 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                    >
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-linear-to-r from-sea-primary to-sea-deep text-white font-semibold shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Icon icon="eos-icons:loading" />}
                        {isEditMode ? 'อัปเดตแบรนด์' : 'สร้างแบรนด์'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BrandFormPage;