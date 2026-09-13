'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { OptimizationResult, SimulationPhase } from '../../lib/api/types';

interface SectionDispatchOptimizationProps {
  optimization: OptimizationResult | null;
  phase: SimulationPhase;
  isResolved: boolean;
  onApplyResolution: (candidateId: string) => void;
}

export const SectionDispatchOptimization: React.FC<SectionDispatchOptimizationProps> = ({
  optimization,
  phase,
  isResolved,
  onApplyResolution,
}) => {
  if (!optimization) return null;

  const isAnalyzing = phase === 'ANALYZING_RESOLUTIONS';

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>SECTION 05 · DISPATCH OPTIMIZATION ENGINE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            FIND THE LEAST-DAMAGING INTERVENTION
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Evaluate feasible dispatch responses against operational constraints.
            The mathematical solver computes discrete holding sidings, speed profiles, and switch paths to find the minimal global delay penalty.
          </p>
        </div>

        {/* Solver Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-zinc-300 font-bold">CONSTRAINT PROGRAMMING SOLVER (CP-SAT)</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400">Execution time: {optimization.solverTimeMs} ms</span>
          </div>
          <span className="text-zinc-400 text-[11px]">
            {isResolved ? 'OPTIMAL ACTION EXECUTED' : 'EVALUATION COMPLETE · 3 CANDIDATE PATHS'}
          </span>
        </div>

        {/* Three Candidate Decision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* OPTION 01: RECOMMENDED */}
          <div
            className={`p-6 rounded-xl border-2 transition-all flex flex-col justify-between ${
              isResolved
                ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : 'bg-zinc-950 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  OPTION 01
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  RECOMMENDED ACTION
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-100">HOLD TRAIN 14632</h3>
                <div className="text-xs text-zinc-400 font-semibold mt-0.5">
                  Dadri Outer Loop Siding 2
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-zinc-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Direct Train Delay:</span>
                  <span className="text-zinc-200 font-bold">+3 MIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Network Delay Impact:</span>
                  <span className="text-emerald-400 font-bold uppercase">LOW NETWORK IMPACT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Global Delay Saved:</span>
                  <span className="text-emerald-400 font-bold">-7.0 MINUTES</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Holds the lower-priority Passenger train in Dadri Siding 2 for 180 seconds.
                Express 12804 maintains maximum line speed (105 km/h) through Block B17 without yellow caution braking.
              </p>
            </div>

            <div className="mt-6">
              {!isResolved ? (
                <button
                  onClick={() => onApplyResolution('OPT_A')}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer border border-cyan-400/50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>APPLY RECOMMENDATION (HOLD 3 MIN)</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DISPATCH INTERVENTION ACTIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* OPTION 02 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between opacity-80 hover:opacity-100 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  OPTION 02
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/60 text-amber-400 border border-amber-800">
                  MEDIUM IMPACT
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-200">HOLD TRAIN 12804</h3>
                <div className="text-xs text-zinc-400 font-semibold mt-0.5">
                  Maripat Outer Signal (Block B08)
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-zinc-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Direct Train Delay:</span>
                  <span className="text-zinc-200 font-bold">+5 MIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Network Delay Impact:</span>
                  <span className="text-amber-400 font-bold uppercase">MEDIUM IMPACT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Global Delay Saved:</span>
                  <span className="text-zinc-300 font-bold">-2.0 MINUTES</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Penalizes the premier high-priority Express movement.
                Trailing Vande Bharat Express (22416) is forced to slow down, compounding secondary delays along the Up mainline.
              </p>
            </div>

            <div className="mt-6 p-3 rounded bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500 font-semibold">
              SUB-OPTIMAL (HIGHER PENALTY WEIGHT)
            </div>
          </div>

          {/* OPTION 03 */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between opacity-80 hover:opacity-100 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  OPTION 03
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/60 text-rose-400 border border-rose-800">
                  HIGH IMPACT
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-200">REROUTE TRAIN 14632</h3>
                <div className="text-xs text-zinc-400 font-semibold mt-0.5">
                  Dankaur Slow Goods Chord
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-zinc-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Direct Train Delay:</span>
                  <span className="text-rose-400 font-bold">+14 MIN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Network Delay Impact:</span>
                  <span className="text-rose-400 font-bold uppercase">HIGH IMPACT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Global Delay Saved:</span>
                  <span className="text-zinc-300 font-bold">0.0 MINUTES</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Diverts passenger rake over low-speed switch turnouts (30 km/h) onto goods chord, introducing severe travel time penalties and platform blockage at Dankaur.
              </p>
            </div>

            <div className="mt-6 p-3 rounded bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500 font-semibold">
              REJECTED (EXCESSIVE ROUTE PENALTY)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
