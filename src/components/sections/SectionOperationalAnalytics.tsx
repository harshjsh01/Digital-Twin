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

interface SectionOperationalAnalyticsProps {
  currentMinute: number;
  isResolved: boolean;
}

export const SectionOperationalAnalytics: React.FC<SectionOperationalAnalyticsProps> = ({
  currentMinute,
  isResolved,
}) => {
  const [activeTab, setActiveTab] = useState<'DELAY' | 'RISK' | 'UTILIZATION'>('DELAY');

  const delayData = [
    { min: 'NOW', unoptimized: 18, optimized: 18 },
    { min: '+10m', unoptimized: 18, optimized: 18 },
    { min: '+20m', unoptimized: 19, optimized: 17 },
    { min: '+30m', unoptimized: 22, optimized: 15 },
    { min: '+40m', unoptimized: 26, optimized: 12 },
    { min: '+50m', unoptimized: 29, optimized: 11 },
    { min: '+60m', unoptimized: 32, optimized: 11 },
  ];

  const riskData = [
    { min: 'NOW', riskScore: 0.1 },
    { min: '+10m', riskScore: 0.2 },
    { min: '+20m', riskScore: 0.45 },
    { min: '+30m', riskScore: isResolved ? 0.15 : 0.95 },
    { min: '+40m', riskScore: isResolved ? 0.08 : 0.75 },
    { min: '+50m', riskScore: isResolved ? 0.02 : 0.6 },
    { min: '+60m', riskScore: 0.0 },
  ];

  const utilizationData = [
    { block: 'B01', label: 'ANVT-SBB', load: 65 },
    { block: 'B03', label: 'GZB Throat', load: 80 },
    { block: 'B08', label: 'MIU-DER', load: 85 },
    { block: 'B17', label: 'Throat Switch', load: isResolved ? 40 : 98 },
    { block: 'B17-L', label: 'Loop Siding 2', load: isResolved ? 70 : 10 },
    { block: 'B11', label: 'BRKY-AJR', load: 55 },
    { block: 'B22', label: 'AJR-DER Dn', load: 75 },
  ];

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>SECTION 08 · NETWORK OPERATIONS ANALYTICS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            DEEP TELEMETRY & NETWORK FORECAST
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Analytical validation of line performance metrics under mixed-traffic constraints.
            Observe how siding diversion flattens the bottleneck peak and stabilizes arterial throughput.
          </p>
        </div>

        {/* Tab Switcher & Chart Container */}
        <div className="bg-[#090d16] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>TELEMETRY PROJECTION CURVES</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('DELAY')}
                className={`px-3 py-1.5 rounded transition ${
                  activeTab === 'DELAY'
                    ? 'bg-zinc-800 text-cyan-300 font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                DELAY TRAJECTORY
              </button>
              <button
                onClick={() => setActiveTab('RISK')}
                className={`px-3 py-1.5 rounded transition ${
                  activeTab === 'RISK'
                    ? 'bg-zinc-800 text-rose-300 font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CONFLICT RISK DENSITY
              </button>
              <button
                onClick={() => setActiveTab('UTILIZATION')}
                className={`px-3 py-1.5 rounded transition ${
                  activeTab === 'UTILIZATION'
                    ? 'bg-zinc-800 text-amber-300 font-bold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                SECTION UTILIZATION %
              </button>
            </div>
          </div>

          {/* Chart Viewport */}
          <div className="h-64 w-full text-xs">
            {activeTab === 'DELAY' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={delayData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="unoptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="min" stroke="#71717a" />
                  <YAxis stroke="#71717a" unit=" min" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#27272a',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="unoptimized"
                    name="FIFO Unoptimized Cascade"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#unoptGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="optimized"
                    name="Look-Ahead Optimized Resolution"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#optGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'RISK' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="min" stroke="#71717a" />
                  <YAxis stroke="#71717a" domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#27272a',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="riskScore"
                    name="Headway Contention Index (0 - 1.0)"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'UTILIZATION' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="block" stroke="#71717a" />
                  <YAxis stroke="#71717a" unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#27272a',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="load" name="Section Utilization %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
