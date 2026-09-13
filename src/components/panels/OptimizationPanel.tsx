'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle,
  Zap,
  Check,
  Cpu,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { OptimizationResult, SimulationPhase } from '../../lib/api/types';

interface OptimizationPanelProps {
  optimization: OptimizationResult | null;
  phase: SimulationPhase;
  isResolved: boolean;
  onApplyResolution: (candidateId: string) => void;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  optimization,
  phase,
  isResolved,
  onApplyResolution,
}) => {
  if (!optimization) return null;

  const isCalculating = phase === 'ANALYZING_RESOLUTIONS';

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            DISPATCH OPTIMIZATION ENGINE
          </h2>
        </div>
        <span className="text-[10px] text-zinc-400">
          SOLVER: {optimization.solverTimeMs}ms
        </span>
      </div>

      {isCalculating ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 bg-black/40 rounded border border-zinc-800">
          <Cpu className="w-6 h-6 text-purple-400 animate-spin" />
          <div className="text-xs text-purple-300 font-bold tracking-wider uppercase">
            ANALYZING RESOLUTION MATRIX...
          </div>
          <div className="text-[10px] text-zinc-500">
            Evaluating discrete-event platform siding headways
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Candidate Options */}
          <div className="space-y-2">
            {optimization.candidates.map((candidate) => {
              const isRec = candidate.isRecommended;

              return (
                <div
                  key={candidate.id}
                  className={`p-3 rounded border transition-all ${
                    isRec
                      ? isResolved
                        ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-cyan-950/30 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                      : 'bg-zinc-950/60 border-zinc-800/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {candidate.code}
                      </span>
                      {isRec && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        candidate.impactLevel === 'LOW'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : candidate.impactLevel === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {candidate.impactLevel} IMPACT
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-zinc-100 mb-1">
                    {candidate.title}
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-normal mb-2">
                    {candidate.rationale}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/60">
                    <div>
                      Added: <span className="text-zinc-200 font-bold">+{candidate.directDelayAddedMin}m</span>
                    </div>
                    <div>
                      Network Saved:{' '}
                      <span className="text-emerald-400 font-bold">
                        -{candidate.networkDelaySavedMin}m
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Dispatch Button */}
          {!isResolved ? (
            <button
              onClick={() => onApplyResolution('OPT_A')}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-mono font-bold text-xs uppercase tracking-wider rounded border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>APPLY RECOMMENDED DISPATCH (OPTION A)</span>
            </button>
          ) : (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>DISPATCH INTERVENTION ACTIVE · SIDING HOLD EXECUTED</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
