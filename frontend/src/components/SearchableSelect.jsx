import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    label,
    name,
    disabled = false,
    required = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string' || typeof opt === 'number') {
            return { value: opt, label: opt };
        }
        return {
            value: opt.value || opt._id || opt.id,
            label: opt.label || opt.name
        };
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    const filteredOptions = normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [dropUp, setDropUp] = useState(false);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }

        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 300; // Approx max height
            setDropUp(spaceBelow < dropdownHeight);
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-sea-text mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex items-center justify-between text-left transition-all ${disabled ? 'cursor-not-allowed opacity-60 bg-slate-100' :
                    isOpen ? 'border-sea-primary ring-2 ring-sea-primary/20 bg-white' : 'border-slate-200 hover:bg-slate-100'
                    }`}
            >
                <span className={`block truncate ${selectedOption ? 'text-sea-text' : 'text-slate-400'}`}>
                    {selectedOption ? (selectedOption.label || selectedOption.name) : placeholder}
                </span>
                <Icon
                    icon="ic:round-keyboard-arrow-down"
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sea-primary' : ''}`}
                    width="24"
                />
            </button>

            {isOpen && (
                <div className={`absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-1' : 'mt-1'
                    }`}>
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Icon icon="ic:round-search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sea-primary focus:bg-white transition-colors"
                                placeholder="ค้นหา..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${value === option.value
                                        ? 'bg-sea-primary/10 text-sea-primary font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {option.label}
                                    {value === option.value && <Icon icon="ic:round-check" width="18" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-slate-400">
                                ไม่พบข้อมูล "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
