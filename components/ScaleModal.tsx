import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ScaleDisplay } from './ScaleDisplay';
import { X, Check } from 'lucide-react';

interface ScaleModalProps {
    isOpen: boolean;
    product: Product | null;
    onConfirm: (weight: number) => void;
    onClose: () => void;
}

export const ScaleModal: React.FC<ScaleModalProps> = ({
    isOpen,
    product,
    onConfirm,
    onClose
}) => {
    const [weight, setWeight] = useState(0);
    const [isStable, setIsStable] = useState(false);

    useEffect(() => {
        if (!isOpen || !product) return;

        // Reset state on open
        setWeight(0);
        setIsStable(false);

        /**
         * FIXED WEIGHT RANGE
         * 200–400 grams → 0.2–0.4 kg
         */
        const targetWeight =
            Math.random() * (0.4 - 0.2) + 0.2;

        let currentWeight = 0;

        const interval = setInterval(() => {
            const jitter = (Math.random() - 0.5) * 0.02; // ±10g jitter

            if (currentWeight < targetWeight) {
                currentWeight += 0.03; // smooth ramp-up
            } else {
                currentWeight = targetWeight + jitter;

                if (Math.abs(currentWeight - targetWeight) < 0.01) {
                    setIsStable(true);
                    setWeight(targetWeight);
                    clearInterval(interval);
                    return;
                }
            }

            setWeight(Math.max(0, currentWeight));
        }, 100);

        // Hard stop to ensure stability
        const timeout = setTimeout(() => {
            setIsStable(true);
            setWeight(targetWeight);
            clearInterval(interval);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isOpen, product]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.code === 'Space' && isStable) {
                e.preventDefault();
                onConfirm(weight);
            }

            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isStable, weight, onConfirm, onClose]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg text-slate-800">
                            Weighing Item
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {product.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scale Display */}
                <div className="p-8 bg-slate-100 flex justify-center">
                    <div className="w-full max-w-sm">
                        <ScaleDisplay
                            weight={weight}
                            isStable={isStable}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm font-medium text-slate-500">
                            Unit Price:{' '}
                            <span className="text-slate-900 font-mono">
                                ₹{product.price.toFixed(2)}/kg
                            </span>
                        </div>
                        <div className="text-xl font-bold text-slate-900">
                            Total:{' '}
                            <span className="text-blue-600">
                                ₹{(weight * product.price).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => isStable && onConfirm(weight)}
                        disabled={!isStable}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg transition-all
                        ${
                            isStable
                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-200 hover:scale-[1.02]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isStable ? (
                            <>
                                <Check size={24} />
                                Confirm
                                <span className="text-sm font-normal bg-blue-700 px-2 py-0.5 rounded opacity-80 ml-2">
                                    SPACE
                                </span>
                            </>
                        ) : (
                            'Stabilizing...'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
