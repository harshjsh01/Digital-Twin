'use client';

import React from 'react';
import {
  AlertTriangle,
  Flame,
  ArrowDown,
  ArrowUp,
  Clock,
  Train as TrainIcon,
  ShieldAlert,
  ArrowRight,
  Crosshair,
} from 'lucide-react';
import { Conflict } from '../../lib/api/types';

interface SectionConflictIntelligenceProps {
  conflict: Conflict | null;
  minute: number;
  isResolved: boolean;
  onFocusBlock: (blockCode: string | null) => void;
}

export const SectionConflictIntelligence: React.FC<SectionConflictIntelligenceProps> = ({
  conflict,
  minute,
  isResolved,
  onFocusBlock,
}) => {
  if (!conflict) return null;

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>SECTION 03 · CONFLICT INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            CONFLICT C-104 DETECTED
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            A future resource conflict has been identified before it occurs.
            At T+31 minutes, two trains with differing operational priorities are projected to require single-line access through the Dadri Central Interlocking throat switch simultaneously.
          </p>
        </div>

        {/* Hero Conflict Canvas Card */}
        <div className="bg-[#090d16] border border-zinc-800 rounded-xl p-6 lg:p-8 shadow-2xl space-y-8">
          {/* Top Key Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-rose-950/80 border border-rose-600 text-rose-300 font-bold text-sm">
                CONFLICT C-104
              </span>
              <span className="text-xs text-zinc-400">
                PREDICTED IN <strong className="text-zinc-200">31 MINUTES</strong> (11:03 AM IST)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                CRITICAL RESOURCE: <strong className="text-cyan-400">BLOCK B17 (THROAT SWITCH 42B)</strong>
              </span>
              <button
                onClick={() => onFocusBlock('B17')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-xs transition"
              >
                VIEW ON TOPOLOGY
              </button>
            </div>
          </div>

          {/* Converging Diagram: Train 12804 -> Block B17 <- Train 14632 */}
          <div className="max-w-4xl mx-auto py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Train A Card (Left) */}
              <div className="p-5 rounded-lg bg-zinc-900/80 border border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-700">
                    EXPRESS
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800">
                    HIGH PRIORITY (W=10)
                  </span>
                </div>

                <div>
                  <div className="text-lg font-bold text-zinc-100">12804</div>
                  <div className="text-xs text-zinc-400">Swarna Jayanti Express</div>
                </div>

                <div className="text-[11px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span>Current Position:</span>
                    <span className="text-zinc-200">Block B01 (Up Main)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Speed:</span>
                    <span className="text-zinc-200">105 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule Deviation:</span>
                    <span className="text-amber-400">+2 min delay</span>
                  </div>
                </div>
              </div>

              {/* Converging Focal Junction: Block B17 (Center) */}
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-zinc-950 border-2 border-rose-600/70 shadow-[0_0_25px_rgba(239,68,68,0.2)] text-center space-y-3">
                <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-semibold uppercase">CONVERGENCE BOTTLENECK</div>
                  <div className="text-base font-bold text-rose-300 mt-0.5">BLOCK B17</div>
                  <div className="text-[10px] text-zinc-400 mt-1">Single Interlocking Throat</div>
                </div>

                <div className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                  PROJECTED ARRIVAL: T+31 MIN
                </div>
              </div>

              {/* Train B Card (Right) */}
              <div className="p-5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-700">
                    PASSENGER
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                    NORMAL PRIORITY (W=3)
                  </span>
                </div>

                <div>
                  <div className="text-lg font-bold text-zinc-100">14632</div>
                  <div className="text-xs text-zinc-400">Doon Express Link</div>
                </div>

                <div className="text-[11px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-800/80">
                  <div className="flex justify-between">
                    <span>Current Position:</span>
                    <span className="text-zinc-200">Block B08 (Maripat)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Speed:</span>
                    <span className="text-zinc-200">68 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule Deviation:</span>
                    <span className="text-emerald-400">On Time (0 min)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="p-4 rounded-lg bg-black/40 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
            <span className="text-zinc-400">
              Safety Enforcement Invariant: Simultaneous route locking of Block B17 is physically prohibited by digital interlocking logic.
            </span>
            <span className="font-bold text-rose-400 shrink-0 ml-4">
              ACTION REQUIRED PRIOR TO T+30
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
