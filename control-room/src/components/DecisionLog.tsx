"use client";
import React from "react";
import { Activity, ShieldAlert } from "lucide-react";

interface Decision {
  id: string;
  time: number;
  message: string;
  type: 'INFO' | 'ACTION' | 'ALERT';
}

interface DecisionLogProps {
  decisions: Decision[];
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ decisions }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[300px]">
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-400" size={16} />
          <h3 className="text-white text-xs font-bold uppercase tracking-wider">Aahavaan Log</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-700">
        {decisions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            Scanning for network conflicts...
          </div>
        ) : (
          decisions.map((log) => (
            <div key={log.id} className="flex gap-3 group animate-in fade-in slide-in-from-left-2 transition-all">
              <span className="text-slate-600 shrink-0">[{log.time}m]</span>
              <span className={
                log.type === 'ACTION' ? 'text-indigo-400' : 
                log.type === 'ALERT' ? 'text-amber-400' : 'text-slate-400'
              }>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
