'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Compass,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SimulationPhase } from '../../lib/api/types';

interface SimulationControlsProps {
  minute: number;
  phase: SimulationPhase;
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  isResolved: boolean;
  onRunLookahead: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
  onSetMinute: (minute: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  minute,
  phase,
  isPlaying,
  speed,
  isResolved,
  onRunLookahead,
  onPause,
  onResume,
  onReset,
  onSetSpeed,
  onSetMinute,
}) => {
  return (
    <div className="w-full bg-[#0d1117] border border-zinc-800/90 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Left: Prominent Hero Action Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRunLookahead}
          className="relative group px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-mono font-bold text-xs md:text-sm uppercase tracking-wider rounded shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.55)] transition-all flex items-center gap-2 border border-emerald-400/40 cursor-pointer active:scale-95"
        >
          <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200 group-hover:scale-110 transition-transform" />
          <span>RUN 60-MIN LOOK-AHEAD</span>
        </button>

        {/* Play/Pause toggle */}
        {isPlaying ? (
          <button
            onClick={onPause}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 rounded text-xs font-mono flex items-center gap-1.5 transition"
            title="Pause Simulation"
          >
            <Pause className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PAUSE</span>
          </button>
        ) : (
          <button
            onClick={onResume}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 rounded text-xs font-mono flex items-center gap-1.5 transition"
            title="Resume Simulation"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span className="hidden sm:inline">RESUME</span>
          </button>
        )}

        {/* Reset button */}
        <button
          onClick={onReset}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-amber-700/60 hover:text-amber-400 text-zinc-300 rounded text-xs font-mono flex items-center gap-1.5 transition"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>

      {/* Center: Look-Ahead Timeline Scrubber */}
      <div className="flex-1 min-w-[240px] max-w-xl mx-2 flex items-center gap-3">
        <div className="text-xs font-mono font-bold text-zinc-300 whitespace-nowrap min-w-[64px]">
          T+{minute.toString().padStart(2, '0')} MIN
        </div>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="60"
            value={minute}
            onChange={(e) => onSetMinute(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            aria-label="Simulation Minute Progress"
          />
          {/* Milestone tick indicator at T+31 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 border border-black pointer-events-none"
            style={{ left: `${(31 / 60) * 100}%` }}
            title="T+31 Conflict C-104"
          />
        </div>
        <div className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
          +60 MIN
        </div>
      </div>

      {/* Right: Simulation Speed Buttons */}
      <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 border border-zinc-800 rounded">
        <span className="text-[10px] font-mono text-zinc-400 px-1.5">SPEED:</span>
        {([1, 2, 5] as const).map((s) => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`px-2 py-1 rounded text-xs font-mono transition ${
              speed === s
                ? 'bg-zinc-700 text-white font-bold border border-zinc-600'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
