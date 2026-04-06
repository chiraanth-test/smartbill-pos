import React from 'react';
import { Scale } from 'lucide-react';

interface ScaleDisplayProps {
  weight: number;
  isStable?: boolean;
}

export const ScaleDisplay: React.FC<ScaleDisplayProps> = ({ weight, isStable = true }) => {
  return (
    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Scale size={120} />
        </div>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Scale Reading</span>
        <div className={`h-2 w-2 rounded-full ${isStable ? 'bg-green-500' : 'bg-red-500'}`} title={isStable ? "Stable" : "Unstable"} />
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-6xl font-mono font-bold tracking-tighter">
          {weight.toFixed(3)}
        </span>
        <span className="text-xl text-slate-400 font-medium">kg</span>
      </div>
      <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
        {/* Simple visual bar for weight relative to 5kg max */}
        <div 
          className="h-full bg-blue-500 transition-all duration-300" 
          style={{ width: `${Math.min((weight / 5) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};