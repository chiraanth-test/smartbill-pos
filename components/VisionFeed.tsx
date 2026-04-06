import React from 'react';
import { Camera, Zap, EyeOff } from 'lucide-react';
import { VisionResult } from '../types';
import { ANOMALY_THRESHOLDS } from '../constants';

interface VisionFeedProps {
  detected: VisionResult | null;
  onConfirm: () => void;
  isDemoMode: boolean;
  isVisible: boolean; // New prop for Manual mode
}

export const VisionFeed: React.FC<VisionFeedProps> = ({ detected, onConfirm, isDemoMode, isVisible }) => {
  const confidencePercent = detected ? Math.round(detected.confidence * 100) : 0;
  const isLowConfidence = detected && detected.confidence < ANOMALY_THRESHOLDS.LOW_CONFIDENCE;

  if (!isVisible) {
      return (
        <div className="relative bg-slate-100 rounded-xl aspect-video overflow-hidden shadow-inner border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <EyeOff size={32} className="mb-2 opacity-50"/>
            <span className="text-xs font-semibold uppercase tracking-wider">Vision Disabled</span>
            <span className="text-[10px] opacity-70 mt-1">Manual Mode Active</span>
        </div>
      );
  }

  return (
    <div className="relative bg-slate-900 rounded-xl aspect-video overflow-hidden shadow-md group">
      {/* Mock Camera Feed Background */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
        <div className="text-slate-600 flex flex-col items-center">
            {isDemoMode ? (
                 <div className="animate-pulse flex flex-col items-center">
                    <Camera size={48} className="mb-2" />
                    <span className="text-xs uppercase tracking-widest">Live Feed Active</span>
                 </div>
            ) : (
                <>
                    <Camera size={48} className="mb-2" />
                    <span className="text-xs uppercase tracking-widest">Camera Offline</span>
                </>
            )}
        </div>
      </div>

      {/* Grid Overlay for "Tech" feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      {/* Detection Box */}
      {detected && isDemoMode && (
        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
          <div className={`border-l-4 pl-4 ${isLowConfidence ? 'border-orange-500' : 'border-green-500'} mb-2`}>
            <div className="flex items-center gap-2">
                <h3 className="text-white text-2xl font-bold">{detected.product.name}</h3>
                {isLowConfidence && <span className="text-orange-400 text-xs font-bold border border-orange-400 px-1 rounded">LOW CONFIDENCE</span>}
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className={`font-mono ${isLowConfidence ? 'text-orange-400' : 'text-green-400'}`}>
                    {confidencePercent}% Match
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">${detected.product.price.toFixed(2)} / {detected.product.unit}</span>
            </div>
          </div>
          
          <button 
            onClick={onConfirm}
            disabled={!!isLowConfidence}
            className={`mt-2 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all
              ${isLowConfidence 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-500 hover:scale-[1.02] shadow-lg shadow-green-900/50'}`}
          >
            {isLowConfidence ? 'Verification Needed' : (
                <>
                    <Zap size={18} fill="currentColor" />
                    Confirm & Add
                </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};