import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { X, Check, Search, Scan } from 'lucide-react';

interface VisionModalProps {
    isOpen: boolean;
    product: Product | null;
    detectedLabel: string;
    inventory: Product[];
    onConfirm: (p: Product) => void;
    onClose: () => void;
}

export const VisionModal: React.FC<VisionModalProps> = ({ isOpen, product, detectedLabel, inventory, onConfirm, onClose }) => {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSearch(detectedLabel || '');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, detectedLabel]);

    const filtered = inventory.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                if (filtered[selectedIndex]) {
                    e.preventDefault();
                    onConfirm(filtered[selectedIndex]);
                }
            } else if (e.code === 'Space') {
                if (filtered[selectedIndex]) {
                    e.preventDefault();
                    onConfirm(filtered[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onConfirm, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Scan size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">AI Detection Confirmation</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Live Vision Verification</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Raw Detection Status */}
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">YOLO Output:</span>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">{detectedLabel}</span>
                    </div>
                    {product ? (
                        <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter">
                            <Check size={12} strokeWidth={3} /> Auto-Mapped
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase italic">Mapping Required</div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            ref={inputRef}
                            className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-xl outline-none focus:border-blue-500 shadow-sm transition-all"
                            placeholder="Search or Select Product..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setSelectedIndex(0);
                            }}
                        />
                    </div>
                    <p className="mt-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                        <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">↑↓</kbd> to navigate
                        <span className="opacity-30">•</span>
                        <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">SPACE</kbd> or <kbd className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">ENTER</kbd> to confirm
                    </p>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                    {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                            <Search size={40} className="mb-2 opacity-10" />
                            <p className="text-sm font-medium italic">No items found matching "{search}"</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((p, idx) => {
                                const isYoloMatch = p.id === product?.id;
                                const isSelected = idx === selectedIndex;

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => onConfirm(p)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border-2 ${isSelected
                                            ? 'bg-blue-50/50 border-blue-500 shadow-sm translate-x-1'
                                            : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${isYoloMatch ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{p.name}</span>
                                                    {isYoloMatch && (
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Match</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-mono font-bold ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>₹{p.price.toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per {p.unit}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex gap-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-sans font-normal">↑↓</kbd> Navigate
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-sans font-normal">ENTER</kbd> Confirm
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-sans font-normal">SPACE</kbd> Fast Accept
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors"
                    >
                        Cancel [ESC]
                    </button>
                </div>
            </div>
        </div>
    );
};


