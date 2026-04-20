"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Timer, AlertTriangle, Cpu } from "lucide-react";

interface MetricsSidebarProps {
  delayUnoptimized: number;
  delayOptimized: number;
  mode: string;
}

export const MetricsSidebar: React.FC<MetricsSidebarProps> = ({ 
  delayUnoptimized, 
  delayOptimized, 
  mode 
}) => {
  const data = [
    { name: "Unoptimized", value: delayUnoptimized, color: "#94a3b8" },
    { name: "AI Optimized", value: delayOptimized, color: "#6366f1" }
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Current Mode Badge */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        mode === "AI_OPTIMIZED" ? "bg-indigo-500/10 border-indigo-500/30" : "bg-slate-800/50 border-slate-700"
      }`}>
        <div className="flex items-center gap-3">
          <Cpu className={mode === "AI_OPTIMIZED" ? "text-indigo-400" : "text-slate-400"} size={20} />
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">System Mode</p>
            <p className="text-white text-sm font-semibold">{mode.replace("_", " ")}</p>
          </div>
        </div>
        {mode === "AI_OPTIMIZED" && (
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Delay Comparison Chart */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Timer className="text-slate-400" size={18} />
          <h3 className="text-white text-sm font-bold uppercase tracking-wide">Network Delay (Min)</h3>
        </div>
        
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Savings</span>
            <span className="text-emerald-400 font-bold">-{Math.max(0, delayUnoptimized - delayOptimized)} min</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Efficiency</span>
            <span className="text-indigo-400 font-bold">
              {delayUnoptimized > 0 ? (100 - (delayOptimized / delayUnoptimized * 100)).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
