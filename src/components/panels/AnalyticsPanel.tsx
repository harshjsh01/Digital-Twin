'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingDown, Layers, Activity } from 'lucide-react';

interface AnalyticsPanelProps {
  currentMinute: number;
  isResolved: boolean;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  currentMinute,
  isResolved,
}) => {
  const [activeChart, setActiveChart] = useState<'DELAY' | 'CONFLICTS' | 'UTILIZATION'>('DELAY');

  // Deterministic 60-min delay trajectory
  const delayData = [
    { min: 'T+0', unoptimized: 18, optimized: 18 },
    { min: 'T+10', unoptimized: 18, optimized: 18 },
    { min: 'T+20', unoptimized: 19, optimized: 17 },
    { min: 'T+30', unoptimized: 22, optimized: 15 },
    { min: 'T+40', unoptimized: 26, optimized: 12 },
    { min: 'T+50', unoptimized: 29, optimized: 11 },
    { min: 'T+60', unoptimized: 32, optimized: 11 },
  ];

  // Conflict risk density over time
  const conflictData = [
    { min: 'T+0', risk: 0.1 },
    { min: 'T+10', risk: 0.2 },
    { min: 'T+20', risk: 0.4 },
    { min: 'T+30', risk: isResolved ? 0.2 : 0.95 },
    { min: 'T+40', risk: isResolved ? 0.1 : 0.8 },
    { min: 'T+50', risk: isResolved ? 0.05 : 0.6 },
    { min: 'T+60', risk: 0.0 },
  ];

  // Block section capacity load
  const blockLoadData = [
    { block: 'B01', load: 65 },
    { block: 'B03', load: 80 },
    { block: 'B08', load: 85 },
    { block: 'B17', load: isResolved ? 45 : 98 },
    { block: 'B17-L', load: isResolved ? 70 : 10 },
    { block: 'B11', load: 55 },
    { block: 'B22', load: 75 },
  ];

  return (
    <div className="w-full bg-[#0d1117] border border-zinc-800/80 rounded p-3 font-mono text-zinc-200">
      {/* Chart Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
            OPERATIONAL FORECAST ANALYTICS
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-800 text-[10px]">
          <button
            onClick={() => setActiveChart('DELAY')}
            className={`px-2 py-1 rounded transition ${
              activeChart === 'DELAY'
                ? 'bg-zinc-800 text-cyan-300 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DELAY OVER TIME
          </button>
          <button
            onClick={() => setActiveChart('CONFLICTS')}
            className={`px-2 py-1 rounded transition ${
              activeChart === 'CONFLICTS'
                ? 'bg-zinc-800 text-rose-300 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            CONFLICT RISK
          </button>
          <button
            onClick={() => setActiveChart('UTILIZATION')}
            className={`px-2 py-1 rounded transition ${
              activeChart === 'UTILIZATION'
                ? 'bg-zinc-800 text-amber-300 font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            BLOCK LOAD
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-44 w-full text-xs">
        {activeChart === 'DELAY' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={delayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="unoptColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="optColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="min" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} unit="m" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#27272a',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              <Area
                type="monotone"
                dataKey="unoptimized"
                name="FIFO Baseline (Unoptimized)"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#unoptColor)"
              />
              <Area
                type="monotone"
                dataKey="optimized"
                name="AI Look-Ahead Optimized"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#optColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'CONFLICTS' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conflictData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="min" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#27272a',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Line
                type="monotone"
                dataKey="risk"
                name="Interlocking Conflict Probability"
                stroke="#fb7185"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#fb7185' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'UTILIZATION' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={blockLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="block" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#27272a',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="load" name="Section Utilization %" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
