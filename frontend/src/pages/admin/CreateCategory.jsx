import React, { useState } from 'react';
import { toast } from 'react-toastify';
import categoryService from '../../services/category.service';
import { MdOutlineNoteAdd, MdDelete } from "react-icons/md";

const CreateCategory = () => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [filters, setFilters] = useState([]);
    const [specifications, setSpecifications] = useState([]);

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        // Auto-generate slug
        setSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    };

    // Filter Handlers
    const addFilter = () => {
        setFilters([...filters, { key: '', label: '', type: 'text' }]);
    };

    const removeFilter = (index) => {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
    };

    const handleFilterChange = (index, field, value) => {
        const newFilters = [...filters];
        newFilters[index][field] = value;
        setFilters(newFilters);
    };

    // Specification Handlers
    const addSpecification = () => {
        setSpecifications([...specifications, { key: '', label: '', type: 'text', unit: '', options: '' }]);
    };

    const removeSpecification = (index) => {
        const newSpecs = specifications.filter((_, i) => i !== index);
        setSpecifications(newSpecs);
    };

    const handleSpecificationChange = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Process specifications to convert options string to array
            const processedSpecifications = specifications.map(spec => ({
                ...spec,
                options: spec.options ? spec.options.split(',').map(opt => opt.trim()).filter(opt => opt !== '') : []
            }));

            await categoryService.createCategory({ 
                name, 
                slug, 
                description,
                filters,
                specifications: processedSpecifications
            });
            toast.success('Category created successfully');
            setName('');
            setSlug('');
            setDescription('');
            setFilters([]);
            setSpecifications([]);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Category Name</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={handleNameChange}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Slug</label>
                    <input 
                        type="text" 
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                {/* Filters Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-medium">Filters</label>
                        <button 
                            type="button"
                            onClick={addFilter}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <MdOutlineNoteAdd className="mr-1" /> Add Filter
                        </button>
                    </div>
                    {filters.map((filter, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-start border p-2 rounded bg-gray-50">
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Key (e.g., color)"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={filter.key}
                                    onChange={(e) => handleFilterChange(index, 'key', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Label (e.g., Color)"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-1"
                                    value={filter.label}
                                    onChange={(e) => handleFilterChange(index, 'label', e.target.value)}
                                />
                            </div>
                            <div className="w-1/3">
                                <select
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={filter.type}
                                    onChange={(e) => handleFilterChange(index, 'type', e.target.value)}
                                >
                                    <option value="">Type</option>
                                    <option value="text">Text</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="range">Range</option>
                                </select>
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeFilter(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <MdDelete size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Specifications Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 font-medium">Specifications</label>
                        <button 
                            type="button"
                            onClick={addSpecification}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <MdOutlineNoteAdd className="mr-1" /> Add Specification
                        </button>
                    </div>
                    {specifications.map((spec, index) => (
                        <div key={index} className="mb-3 border p-3 rounded bg-gray-50">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-600">Spec #{index + 1}</span>
                                <button 
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <MdDelete size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Key"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={spec.key}
                                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Label"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={spec.label}
                                    onChange={(e) => handleSpecificationChange(index, 'label', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={spec.type}
                                    onChange={(e) => handleSpecificationChange(index, 'type', e.target.value)}
                                >
                                    <option value="">Type</option>
                                    <option value="text">Text</option>
                                    <option value="select">Select</option>
                                    <option value="number">Number</option>
                                </select>
                                <input 
                                    type="text" 
                                    placeholder="Unit (optional)"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={spec.unit}
                                    onChange={(e) => handleSpecificationChange(index, 'unit', e.target.value)}
                                />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Options (comma separated, e.g., Small, Medium, Large)"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                value={spec.options}
                                onChange={(e) => handleSpecificationChange(index, 'options', e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
                >
                    Create Category
                </button>
            </form>
        </div>
    );
};

export default CreateCategory;
