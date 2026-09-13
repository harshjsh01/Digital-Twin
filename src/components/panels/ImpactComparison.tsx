'use client';

import React from 'react';
import {
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { OptimizationResult } from '../../lib/api/types';

interface ImpactComparisonProps {
  optimization: OptimizationResult | null;
  isResolved: boolean;
}

export const ImpactComparison: React.FC<ImpactComparisonProps> = ({
  optimization,
  isResolved,
}) => {
  if (!optimization) return null;

  const { beforeMetrics, afterMetrics } = optimization;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 font-mono">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            IMPACT VERIFICATION
          </h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition ${
            isResolved
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {isResolved ? 'POST-INTERVENTION' : 'PROJECTED OUTCOME'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Without Optimization Column */}
        <div className="p-3 rounded bg-zinc-950/80 border border-rose-900/30">
          <div className="text-[10px] uppercase font-bold text-rose-400 mb-2 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" />
            WITHOUT DISPATCH
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-zinc-400">Network Delay</div>
              <div className="text-base font-bold text-rose-300">
                {beforeMetrics.networkDelayMin} MIN
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">Active Conflicts</div>
              <div className="text-sm font-bold text-zinc-200">
                {beforeMetrics.activeConflicts}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">At-Risk Trains</div>
              <div className="text-sm font-bold text-zinc-200">
                {beforeMetrics.atRiskTrains}
              </div>
            </div>
          </div>
        </div>

        {/* With Recommendation Column */}
        <div
          className={`p-3 rounded border transition-all duration-500 ${
            isResolved
              ? 'bg-emerald-950/50 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-zinc-950/80 border-cyan-900/40'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            WITH OPTIMIZATION
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                Network Delay
                <span className="text-[9px] text-emerald-400 font-bold">-39%</span>
              </div>
              <div className="text-base font-bold text-emerald-300">
                {afterMetrics.networkDelayMin} MIN
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">Active Conflicts</div>
              <div className="text-sm font-bold text-emerald-400">
                {afterMetrics.activeConflicts} (CLEARED)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">At-Risk Trains</div>
              <div className="text-sm font-bold text-zinc-200">
                {afterMetrics.atRiskTrains}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Callout Strip */}
      <div className="p-2.5 rounded bg-black/40 border border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-zinc-400">Total Delay Recovery:</span>
        <span className="font-bold text-emerald-400 flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          -7.0 MINUTES PREVENTED
        </span>
      </div>
    </div>
  );
};
