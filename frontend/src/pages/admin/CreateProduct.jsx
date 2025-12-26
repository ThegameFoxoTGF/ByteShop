import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        slug: '',
        price: '', // Will map to sell_price
        description: '',
        category: '',
        stock: 0,
        imageUrl: ''
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(Array.isArray(data) ? data : data.categories || []);
            } catch (error) {
                console.error("Failed to load categories", error);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-generate slug from name
            if (name === 'name') {
                newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                sku: formData.sku,
                slug: formData.slug,
                category_id: formData.category,
                sell_price: Number(formData.price),
                quantity: Number(formData.stock),
                description: formData.description,
                image: formData.imageUrl ? [formData.imageUrl] : [],
            };

            await productService.createProduct(payload);
            toast.success('Product created successfully');
            setFormData({
                name: '',
                sku: '',
                slug: '',
                price: '',
                description: '',
                category: '',
                stock: 0,
                imageUrl: ''
            });
        } catch (error) {
             console.error(error);
             toast.error(error.response?.data?.message || 'Failed to create product');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Product Name</label>
                        <input 
                            type="text" 
                            name="name"
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">SKU</label>
                        <input 
                            type="text" 
                            name="sku"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.sku}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Slug</label>
                    <input 
                        type="text" 
                        name="slug"
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                        value={formData.slug}
                        onChange={handleChange}
                    />
                </div>
                
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Price</label>
                        <input 
                            type="number" 
                            name="price"
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Stock</label>
                        <input 
                            type="number" 
                            name="stock"
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.stock}
                            onChange={handleChange}
                        />
                    </div>
                 </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Category</label>
                    <select 
                        name="category"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Image URL</label>
                    <input 
                        type="text" 
                        name="imageUrl"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.imageUrl}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea 
                        name="description"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
                >
                    Create Product
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
