import React from 'react';
import { Transaction, TrainingLog, LogType } from '../types';
import { X, Download, TrendingUp, Users, AlertOctagon, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { exportTrainingDataCSV } from '../services/storageService';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  trainingLogs: TrainingLog[];
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  trainingLogs
}) => {
  if (!isOpen) return null;

  // Calculate Stats
  const today = new Date().setHours(0, 0, 0, 0);
  const todayTx = transactions.filter(t => t.timestamp >= today);

  const totalSales = todayTx.reduce((acc, t) => acc + t.total, 0);
  const customerCount = todayTx.length;
  const flaggedCount = todayTx.filter(t => t.hasAnomalies).length;

  // Auto vs Manual items
  let autoItems = 0;
  let manualItems = 0;
  todayTx.forEach(t => {
    t.items.forEach(i => {
      if (i.isManual) manualItems++;
      else autoItems++;
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Daily Sales Report
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-blue-600 text-sm font-medium mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-slate-800">₹{totalSales.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-2">Today's consolidated sales</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-purple-600" />
              <span className="text-purple-600 text-sm font-medium">Customers</span>
            </div>
            <div className="text-3xl font-bold text-slate-800">{customerCount}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2 flex justify-between items-center">
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2">
                <Smartphone size={16} /> Usage Stats
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-bold">{autoItems} Auto-billed</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-bold">{manualItems} Manual</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-xs uppercase font-bold">Anomalies</div>
              <div className={`text-xl font-bold ${flaggedCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {flaggedCount}
              </div>
            </div>
          </div>

          <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
            <h3 className="font-bold text-slate-700 mb-2 text-sm">AI Training Data</h3>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-sm">
                <span className="font-bold text-slate-800">{trainingLogs.length}</span> Samples Collected
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
                onClick={exportTrainingDataCSV}
              >
                Export CSV
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * Export includes timestamps, detected items, confidence scores, and user corrections.
            </p>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close Report</Button>
        </div>
      </div>
    </div>
  );
};