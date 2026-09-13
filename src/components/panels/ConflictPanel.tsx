'use client';

import React from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  Radio,
  Train,
  ArrowRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { Conflict, SimulationPhase } from '../../lib/api/types';

interface ConflictPanelProps {
  conflict: Conflict | null;
  phase: SimulationPhase;
  isResolved: boolean;
  minute: number;
}

export const ConflictPanel: React.FC<ConflictPanelProps> = ({
  conflict,
  phase,
  isResolved,
  minute,
}) => {
  if (!conflict) {
    return (
      <div className="p-4 rounded bg-zinc-900/40 border border-zinc-800 text-center text-zinc-500 font-mono text-xs">
        NO CRITICAL CONFLICTS IN CURRENT SECTION
      </div>
    );
  }

  const isConflictActive = minute >= 30 && !isResolved;

  return (
    <div
      className={`rounded border p-4 transition-all duration-300 font-mono ${
        isResolved
          ? 'bg-emerald-950/20 border-emerald-800/60'
          : isConflictActive
          ? 'bg-rose-950/30 border-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          : 'bg-zinc-900/60 border-zinc-800'
      }`}
    >
      {/* Top Badge & Code */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border flex items-center gap-1 ${
              isResolved
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                : isConflictActive
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-amber-950 text-amber-300 border-amber-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {isResolved ? 'CONFLICT C-104 RESOLVED' : conflict.code}
          </span>
          <span className="text-[10px] text-zinc-400">
            {isResolved ? 'CLEARED' : `T+${conflict.timeToConflictMin} MIN`}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
            isResolved
              ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
              : 'bg-rose-900/60 text-rose-300 border-rose-700'
          }`}
        >
          {isResolved ? 'OPTIMIZED' : conflict.severity}
        </span>
      </div>

      {/* Target Resource */}
      <div className="bg-black/40 rounded p-2.5 mb-3 border border-zinc-800/80">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">
          Target Interlocking Resource
        </div>
        <div className="text-xs md:text-sm font-bold text-zinc-100 mt-0.5 flex items-center justify-between">
          <span className="text-cyan-400">BLOCK {conflict.targetBlockCode}</span>
          <span className="text-[10px] text-zinc-400 font-normal">
            Dadri Jn Interlocking Throat
          </span>
        </div>
      </div>

      {/* Competing Train Movements */}
      <div className="space-y-2 mb-3 text-xs">
        {/* Train A: High Priority Express */}
        <div className="flex items-center justify-between p-2 rounded bg-zinc-950/70 border border-blue-900/40">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-500/20 text-blue-400">
              <Train className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <span>{conflict.primaryTrain.number}</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {conflict.primaryTrain.name}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                {conflict.primaryTrain.type} · +{conflict.primaryTrain.delayMin}m delay
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
            PRIORITY 10
          </span>
        </div>

        {/* Train B: Passenger */}
        <div className="flex items-center justify-between p-2 rounded bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-zinc-800 text-zinc-400">
              <Train className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span>{conflict.secondaryTrain.number}</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {conflict.secondaryTrain.name}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400">
                {conflict.secondaryTrain.type} · ON TIME
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
            PRIORITY 3
          </span>
        </div>
      </div>

      {/* Threat Impact Summary */}
      <div className="text-[11px] text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-2.5">
        <span className="text-zinc-400">Expected Impact: </span>
        {isResolved
          ? 'Clearance guaranteed. Express 12804 granted mainline green aspect; Passenger 14632 held in siding.'
          : conflict.impactDescription}
      </div>
    </div>
  );
};
