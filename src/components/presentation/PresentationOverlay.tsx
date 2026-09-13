'use client';

import React from 'react';
import {
  Minimize2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SimulationPhase } from '../../lib/api/types';

interface PresentationOverlayProps {
  minute: number;
  phase: SimulationPhase;
  isResolved: boolean;
  onExit: () => void;
  onRunLookahead: () => void;
  onApplyResolution: () => void;
}

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  minute,
  phase,
  isResolved,
  onExit,
  onRunLookahead,
  onApplyResolution,
}) => {
  return (
    <div className="absolute top-4 inset-x-4 z-40 pointer-events-none font-mono flex flex-col items-center">
      {/* Top Banner Story Bar */}
      <div className="pointer-events-auto bg-black/90 backdrop-blur-xl border border-zinc-700/80 rounded-xl px-5 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-4 max-w-5xl w-full">
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            JUDGE PRESENTATION MODE
          </div>
          <span className="text-xs text-zinc-300">
            T+{minute.toString().padStart(2, '0')}m / 60m Lookahead Horizon
          </span>
        </div>

        {/* Story Workflow Progression */}
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className={minute >= 0 ? 'text-zinc-200 font-bold' : ''}>CURRENT</span>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <span className={minute > 0 ? 'text-cyan-400 font-bold' : ''}>LOOK-AHEAD</span>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <span className={minute >= 30 && !isResolved ? 'text-rose-400 font-bold animate-pulse' : ''}>
            CONFLICT C-104
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <span className={isResolved ? 'text-emerald-400 font-bold' : ''}>OPTIMIZATION</span>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <span className={isResolved ? 'text-emerald-300 font-bold' : ''}>-39% DELAY</span>
        </div>

        {/* Quick Trigger Buttons */}
        <div className="flex items-center gap-2">
          {!isResolved && minute >= 30 ? (
            <button
              onClick={onApplyResolution}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)] transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>APPLY RESOLUTION</span>
            </button>
          ) : (
            <button
              onClick={onRunLookahead}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>RUN LOOK-AHEAD</span>
            </button>
          )}

          <button
            onClick={onExit}
            className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Exit Presentation Mode"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
