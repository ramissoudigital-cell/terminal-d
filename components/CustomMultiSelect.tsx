import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface SelectGroup {
    label: string;
    options: SelectOption[];
}

export type SelectItem = SelectOption | SelectGroup;

interface CustomMultiSelectProps {
    values: string[];
    onChange: (values: string[]) => void;
    items: SelectItem[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

function isGroup(item: SelectItem): item is SelectGroup {
    return 'options' in item;
}

export const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ values = [], onChange, items, placeholder = "Sélectionner...", disabled, className, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleValue = (val: string) => {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    };

    let displayValue = placeholder;
    if (values.length > 0) {
        if (values.length === 1) {
            let foundLabel = values[0];
            for (const item of items) {
                if (isGroup(item)) {
                    const found = item.options.find(opt => opt.value === values[0]);
                    if (found) { foundLabel = found.label; break; }
                } else {
                    if (item.value === values[0]) { foundLabel = item.label; break; }
                }
            }
            displayValue = foundLabel;
        } else {
            displayValue = `${values.length} sélectionnés`;
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full bg-gray-50 border ${isOpen ? 'border-sky-500 bg-white' : 'border-transparent'} focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-left flex justify-between items-center ${values.length > 0 ? 'text-gray-800' : 'text-gray-400'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className || ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    {icon && <div className="text-gray-400 shrink-0">{icon}</div>}
                    <span className="truncate">{displayValue}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-[100] w-full mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-200/50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-2 space-y-1">
                            {items.map((item, idx) => {
                                if (isGroup(item)) {
                                    return (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                                <span>{item.label}</span>
                                            </div>
                                            {item.options.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    disabled={opt.disabled}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleValue(opt.value);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-between ${
                                                        values.includes(opt.value)
                                                            ? 'bg-sky-50 text-sky-700' 
                                                            : opt.disabled ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {opt.label}
                                                    {values.includes(opt.value) && <Check size={16} className="text-sky-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                } else {
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            disabled={item.disabled}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleValue(item.value);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-between ${
                                                values.includes(item.value)
                                                    ? 'bg-sky-50 text-sky-700' 
                                                    : item.disabled ? 'text-gray-400 opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {item.label}
                                            {values.includes(item.value) && <Check size={16} className="text-sky-500" />}
                                        </button>
                                    );
                                }
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
