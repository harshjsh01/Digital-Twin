'use client';

import React from 'react';
import {
  Train as TrainIcon,
  Grid,
  AlertTriangle,
  Clock,
  Compass,
  TrendingDown,
} from 'lucide-react';
import { NetworkTelemetry, SimulationPhase } from '../../lib/api/types';

interface TelemetryStripProps {
  telemetry: NetworkTelemetry | null;
  phase: SimulationPhase;
  isResolved: boolean;
}

export const TelemetryStrip: React.FC<TelemetryStripProps> = ({
  telemetry,
  phase,
  isResolved,
}) => {
  if (!telemetry) return null;

  return (
    <div className="w-full bg-[#07090e] border-b border-zinc-800/60 px-4 md:px-8 py-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[700px] lg:min-w-0">
        {/* Metric 1: Active Trains */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            <TrainIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Active Trains
            </div>
            <div className="text-sm font-mono font-bold text-zinc-200">
              {telemetry.activeTrains}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800/80" />

        {/* Metric 2: Occupied Blocks */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Grid className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Occupied Blocks
            </div>
            <div className="text-sm font-mono font-bold text-zinc-200">
              {telemetry.occupiedBlocks}{' '}
              <span className="text-[10px] text-zinc-500 font-normal">/ 22</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800/80" />

        {/* Metric 3: Predicted Conflicts */}
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded border transition-colors ${
              telemetry.predictedConflicts > 0 || telemetry.activeConflicts > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Predicted Conflicts
            </div>
            <div
              className={`text-sm font-mono font-bold ${
                telemetry.predictedConflicts > 0 || telemetry.activeConflicts > 0
                  ? 'text-amber-300'
                  : 'text-zinc-200'
              }`}
            >
              {isResolved ? 0 : telemetry.predictedConflicts + telemetry.activeConflicts}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800/80" />

        {/* Metric 4: Network Delay */}
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded border transition-colors ${
              isResolved
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              Network Delay
              {isResolved && (
                <span className="text-[9px] text-emerald-400 font-bold flex items-center">
                  <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" /> -39%
                </span>
              )}
            </div>
            <div className="text-sm font-mono font-bold flex items-baseline gap-1.5">
              <span className={isResolved ? 'text-emerald-300' : 'text-zinc-200'}>
                {telemetry.networkDelayMin} MIN
              </span>
              {isResolved && (
                <span className="text-[10px] text-zinc-500 line-through font-normal">
                  18 MIN
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800/80" />

        {/* Metric 5: Look-Ahead Horizon */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Look-Ahead Horizon
            </div>
            <div className="text-sm font-mono font-bold text-zinc-200">
              {telemetry.lookAheadHorizonMin} MIN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
