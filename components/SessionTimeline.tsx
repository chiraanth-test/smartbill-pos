import React, { useEffect, useRef } from 'react';
import { LogType, SessionLog } from '../types';
import { AlertTriangle, CheckCircle, Edit, Trash2, Video, RotateCcw } from 'lucide-react';
import { formatTime } from '../utils';

interface SessionTimelineProps {
  logs: SessionLog[];
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (type: LogType) => {
    switch (type) {
      case LogType.DETECTED: return <Video className="w-4 h-4 text-blue-500" />;
      case LogType.CONFIRMED: return <CheckCircle className="w-4 h-4 text-green-500" />;
      case LogType.FLAGGED: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case LogType.REMOVED: return <Trash2 className="w-4 h-4 text-red-500" />;
      case LogType.UNDO: return <RotateCcw className="w-4 h-4 text-purple-500" />;
      case LogType.EDITED: return <Edit className="w-4 h-4 text-yellow-600" />;
      default: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-700 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Session Audit Log
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 && (
          <p className="text-center text-slate-400 text-sm italic mt-10">No activity yet...</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-sm">
            <div className="mt-0.5">{getIcon(log.type)}</div>
            <div className="flex-1">
              <p className="text-slate-800 font-medium">{log.message}</p>
              {log.anomalyReason && (
                <div className="mt-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">
                  Anomaly: {log.anomalyReason}
                </div>
              )}
              <span className="text-xs text-slate-400">
                {formatTime(log.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};