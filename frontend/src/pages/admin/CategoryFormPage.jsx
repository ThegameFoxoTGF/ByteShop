import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import categoryService from '../../services/category.service';

// Simple slugify helper to avoid external dependency
const simpleSlugify = (text, separator = '-') => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, separator) // Replace non-alphanumeric chars with separator
        .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators
};

const FIELD_TYPES = [
    { value: 'text', label: 'ข้อความ (Text)' },
    { value: 'number', label: 'ตัวเลข (Number)' },
    { value: 'select', label: 'เลือกหนึ่งรายการ (Single Select)' },
    { value: 'boolean', label: 'ใช่/ไม่ใช่ (Boolean)' },
    { value: 'array', label: 'เก็บหลายค่า (Array)' }
];

function CategoryFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    // If id is 'new' (from URL /categories/new matching :id), it's not edit mode
    const isEditMode = id && id !== 'new';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    // Basic Category Info
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        slug: ''
    });

    // Dynamic Lists
    const [filters, setFilters] = useState([]);
    const [specifications, setSpecifications] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        setFetching(true);
        try {
            const data = await categoryService.getCategoryById(id);
            setFormData({
                name: data.name || '',
                label: data.label || '',
                slug: data.slug || ''
            });
            setFilters(data.filters || []);
            setSpecifications(data.specifications || []);
        } catch (error) {
            console.error('Error fetching category:', error);
            toast.error('โหลดข้อมูลหมวดหมู่ไม่สำเร็จ');
            navigate('/admin/categories');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };
            // Auto-generate slug from name if creating new and slug hasn't been manually touched (roughly)
            // Or just allow user to click a 'generate' button. Let's do auto-generate if name changes and not in edit mode
            if (name === 'name' && !isEditMode) {
                updates.slug = simpleSlugify(value, '-');
            }
            return updates;
        });
    };

    const handleSlugBlur = () => {
        // Ensure slug is valid on blur
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

        const payload = {
            ...formData,
            filters,
            specifications
        };

        try {
            if (isEditMode) {
                await categoryService.updateCategory(id, payload);
                toast.success('อัปเดตหมวดหมู่เรียบร้อยแล้ว');
            } else {
                await categoryService.createCategory(payload);
                toast.success('สร้างหมวดหมู่เรียบร้อยแล้ว');
            }
            navigate('/admin/categories');
        } catch (error) {
            console.error('Error saving category:', error);
            const message = error.response?.data?.message || 'บันทึกหมวดหมู่ไม่สำเร็จ';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Dynamic Field Logic ---

    const addField = (setList) => {
        setList(prev => [
            ...prev,
            { key: '', label: '', type: 'text', unit: '', options: [] }
        ]);
    };

    const removeField = (setList, index) => {
        setList(prev => prev.filter((_, i) => i !== index));
    };

    const updateField = (setList, index, field, value) => {
        setList(prev => {
            const newList = [...prev];
            newList[index] = { ...newList[index], [field]: value };

            if (field === 'label') {
                const oldLabel = prev[index].label || '';
                const oldKey = prev[index].key || '';

                // Smart auto-generate: Update key if it was empty OR if it matched the previous label's slug
                // This allows the key to "follow" the label until the user manually changes the key.
                if (!oldKey || oldKey === simpleSlugify(oldLabel, '_')) {
                    newList[index].key = simpleSlugify(value, '_');
                }
            }

            return newList;
        });
    };

    const addOption = (setList, fieldIndex, optionValue) => {
        if (!optionValue.trim()) return;
        setList(prev => {
            const newList = [...prev];
            const currentOptions = newList[fieldIndex].options || [];
            if (!currentOptions.includes(optionValue.trim())) {
                newList[fieldIndex].options = [...currentOptions, optionValue.trim()];
            }
            return newList;
        });
    };

    const removeOption = (setList, fieldIndex, optionIndex) => {
        setList(prev => {
            const newList = [...prev];
            newList[fieldIndex].options = newList[fieldIndex].options.filter((_, i) => i !== optionIndex);
            return newList;
        });
    };

    const moveField = (setList, index, direction) => {
        setList(prev => {
            const newList = [...prev];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= newList.length) return prev;

            [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
            return newList;
        });
    };

    // --- Render Component for a Field Item ---
    const renderFieldEditor = (item, index, list, setList) => {
        const isOptionsType = ['select', 'multiselect'].includes(item.type);

        return (
            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 relative group transition-all hover:border-sea-primary/50">
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center">
                    <div className="flex gap-1">
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => moveField(setList, index, -1)}
                                className="p-1.5 bg-white text-slate-400 hover:text-sea-primary hover:shadow-md border border-slate-100 rounded-full transition-all"
                                title="เลื่อนขึ้น"
                            >
                                <Icon icon="ic:round-keyboard-arrow-up" width="18" />
                            </button>
                        )}
                        {index < list.length - 1 && (
                            <button
                                type="button"
                                onClick={() => moveField(setList, index, 1)}
                                className="p-1.5 bg-white text-slate-400 hover:text-sea-primary hover:shadow-md border border-slate-100 rounded-full transition-all"
                                title="เลื่อนลง"
                            >
                                <Icon icon="ic:round-keyboard-arrow-down" width="18" />
                            </button>
                        )}
                        <span className="w-px h-4 bg-slate-200 mx-1 self-center"></span>
                        <button
                            type="button"
                            onClick={() => removeField(setList, index)}
                            className="p-1.5 bg-white text-slate-400 hover:text-red-500 hover:shadow-md border border-slate-100 rounded-full transition-all"
                            title="ลบฟิลด์"
                        >
                            <Icon icon="ic:round-close" width="18" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Label & Key */}
                    <div className="md:col-span-4 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-sea-subtext mb-1">ป้ายกำกับที่แสดง</label>
                            <input
                                type="text"
                                placeholder="เช่น ขนาดหน้าจอ"
                                value={item.label}
                                onChange={(e) => updateField(setList, index, 'label', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sea-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sea-subtext mb-1">คีย์อ้างอิงภายใน</label>
                            <input
                                type="text"
                                placeholder="เช่น screen_size"
                                value={item.key}
                                onChange={(e) => updateField(setList, index, 'key', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 focus:outline-none focus:border-sea-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Type & Unit */}
                    <div className="md:col-span-3 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-sea-subtext mb-1">ประเภทข้อมูล</label>
                            <select
                                value={item.type}
                                onChange={(e) => updateField(setList, index, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sea-primary"
                            >
                                {FIELD_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-sea-subtext mb-1">หน่วย (ไม่บังคับ)</label>
                            <input
                                type="text"
                                placeholder="เช่น GB, นิ้ว"
                                value={item.unit}
                                onChange={(e) => updateField(setList, index, 'unit', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sea-primary"
                            />
                        </div>
                    </div>

                    {/* Options (Conditional) */}
                    <div className="md:col-span-5">
                        {isOptionsType ? (
                            <div className="bg-white p-4 border border-slate-200 rounded-xl h-full shadow-xs">
                                <label className="block text-xs font-bold text-sea-subtext uppercase tracking-wider mb-2">ตัวเลือก</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {item.options?.length > 0 ? (
                                        item.options.map((opt, optIdx) => (
                                            <span key={optIdx} className="inline-flex items-center px-2.5 py-1 bg-sea-light/10 text-sea-primary text-xs font-medium rounded-lg border border-sea-light/20">
                                                {opt}
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(setList, index, optIdx)}
                                                    className="ml-1.5 text-sea-primary/60 hover:text-red-500 transition-colors"
                                                >
                                                    <Icon icon="ic:round-close" width="14" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">ยังไม่ได้ระบุตัวเลือก</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="พิมพ์ตัวเลือก..."
                                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sea-primary focus:bg-white transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addOption(setList, index, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-1.5 bg-sea-primary text-white text-xs font-semibold rounded-lg hover:bg-sea-deep transition-all shadow-sm active:scale-95"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousSibling;
                                            addOption(setList, index, input.value);
                                            input.value = '';
                                        }}
                                    >
                                        เพิ่ม
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs text-center p-4">
                                <Icon icon="ic:round-info" className="mb-1 opacity-50" width="20" />
                                ประเภทนี้ไม่มีตัวเลือกที่กำหนดไว้ล่วงหน้า
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
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
                <Link to="/admin/categories" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Icon icon="ic:round-arrow-back" width="24" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-sea-text">
                        {isEditMode ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
                    </h1>
                    <p className="text-sea-subtext text-sm">กำหนดรายละเอียดหมวดหมู่ ตัวกรอง และสเปคสินค้า</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-lg font-semibold text-sea-text flex items-center gap-2">
                            <Icon icon="ic:round-info" className="text-sea-primary" /> ข้อมูลพื้นฐาน
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-2">ชื่อหมวดหมู่</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="เช่น laptops"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-sea-text mb-2">ป้ายกำกับ (แสดงหน้าเว็บ)</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    placeholder="เช่น แล็ปท็อป"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                />
                                <p className="text-xs text-sea-subtext mt-1">ไม่จำเป็น</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-sea-text mb-2">URL Slug (ลิงก์ถาวร)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    onBlur={handleSlugBlur}
                                    placeholder="laptops"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-sea-primary/20 focus:border-sea-primary transition-all"
                                    required
                                />
                                <p className="text-xs text-sea-subtext mt-1">ใช้สำหรับสร้างลิงก์ URL (ระบบจะสร้างให้อัตโนมัติจากชื่อหมวดหมู่)</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-100 space-y-8">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold text-sea-text flex items-center gap-2.5">
                                <div className="p-2 bg-sea-light/10 rounded-xl">
                                    <Icon icon="ic:round-filter-alt" className="text-sea-primary" width="24" />
                                </div>
                                ตัวกรองสินค้า (Filters)
                            </h2>
                            <p className="text-sm text-sea-subtext">กำหนดคุณลักษณะต่างๆ ที่ลูกค้าสามารถใช้กรองสินค้าในหมวดหมู่นี้</p>
                        </div>

                        <div className="space-y-6">
                            {filters.length === 0 ? (
                                <div className="group text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sea-primary/30 transition-all">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon icon="ic:round-filter-list-off" className="text-slate-300" width="32" />
                                    </div>
                                    <h3 className="text-slate-600 font-medium mb-1">ยังไม่มีการกำหนดตัวกรอง</h3>
                                    <p className="text-slate-400 text-xs mb-4">เพิ่มตัวกรองเพื่อให้ลูกค้าค้นหาสินค้าได้ง่ายขึ้น</p>
                                    <button
                                        type="button"
                                        onClick={() => addField(setFilters)}
                                        className="px-6 py-2 bg-white text-sea-primary text-sm font-bold rounded-xl border border-slate-200 hover:border-sea-primary hover:shadow-sm transition-all shadow-xs"
                                    >
                                        เพิ่มตัวกรองแรกของคุณ
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-0">
                                        {filters.map((item, index) => renderFieldEditor(item, index, filters, setFilters))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addField(setFilters)}
                                        className="w-full group flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-sea-primary hover:border-sea-primary hover:bg-sea-light/5 transition-all outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-sea-light/10 flex items-center justify-center transition-colors">
                                            <Icon icon="ic:round-add" width="24" />
                                        </div>
                                        <span className="font-bold tracking-wide">เพิ่มตัวกรองใหม่</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-100 space-y-8">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold text-sea-text flex items-center gap-2.5">
                                <div className="p-2 bg-sea-light/10 rounded-xl">
                                    <Icon icon="ic:round-list" className="text-sea-primary" width="24" />
                                </div>
                                ข้อมูลทางเทคนิค (Specifications)
                            </h2>
                            <p className="text-sm text-sea-subtext">กำหนดหัวข้อรายละเอียดทางเทคนิคที่จะแสดงในหน้าข้อมูลสินค้า</p>
                        </div>

                        <div className="space-y-6">
                            {specifications.length === 0 ? (
                                <div className="group text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sea-primary/30 transition-all">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon icon="ic:round-assignment" className="text-slate-300" width="32" />
                                    </div>
                                    <h3 className="text-slate-600 font-medium mb-1">ยังไม่มีการกำหนดหัวข้อสเปค</h3>
                                    <p className="text-slate-400 text-xs mb-4">กำหนดสเปคเพื่อแสดงรายละเอียดที่ชัดเจนให้กับลูกค้า</p>
                                    <button
                                        type="button"
                                        onClick={() => addField(setSpecifications)}
                                        className="px-6 py-2 bg-white text-sea-primary text-sm font-bold rounded-xl border border-slate-200 hover:border-sea-primary hover:shadow-sm transition-all shadow-xs"
                                    >
                                        เพิ่มสเปคแรกของคุณ
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-0">
                                        {specifications.map((item, index) => renderFieldEditor(item, index, specifications, setSpecifications))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addField(setSpecifications)}
                                        className="w-full group flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-sea-primary hover:border-sea-primary hover:bg-sea-light/5 transition-all outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-sea-light/10 flex items-center justify-center transition-colors">
                                            <Icon icon="ic:round-add" width="24" />
                                        </div>
                                        <span className="font-bold tracking-wide">เพิ่มข้อมูลทางเทคนิคใหม่</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="flex flex-col gap-3 lg:sticky lg:top-10 z-10 h-fit">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-linear-to-r from-sea-primary to-sea-deep text-white font-semibold shadow-lg shadow-sea-primary/20 hover:shadow-sea-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Icon icon="eos-icons:loading" />}
                        {isEditMode ? 'อัปเดตหมวดหมู่' : 'สร้างหมวดหมู่ใหม่'}
                    </button>
                    <Link
                        to="/admin/categories"
                        className="w-full py-3 rounded-xl text-slate-600 bg-white border border-slate-200 font-medium hover:bg-slate-50 transition-colors text-center"
                    >
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default CategoryFormPage;