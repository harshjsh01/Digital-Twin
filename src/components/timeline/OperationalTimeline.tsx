'use client';

import React from 'react';
import {
  Clock,
  AlertTriangle,
  Zap,
  CheckCircle,
  Flag,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { TimelineEvent } from '../../lib/api/types';

interface OperationalTimelineProps {
  events: TimelineEvent[];
  currentMinute: number;
  onSelectMinute: (minute: number) => void;
}

export const OperationalTimeline: React.FC<OperationalTimelineProps> = ({
  events,
  currentMinute,
  onSelectMinute,
}) => {
  return (
    <div className="w-full bg-[#0d1117] border border-zinc-800/80 rounded p-3 font-mono text-zinc-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            60-MINUTE OPERATIONAL HORIZON
          </h2>
        </div>
        <span className="text-[10px] text-zinc-400">
          CURSOR: T+{currentMinute.toString().padStart(2, '0')} MIN
        </span>
      </div>

      {/* Ticks and Progress Bar */}
      <div className="relative w-full h-7 mb-3 bg-zinc-950/80 rounded border border-zinc-800/80 flex items-center px-3 select-none">
        {/* Fill bar */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 border-r-2 border-emerald-400 transition-all duration-150"
          style={{ width: `${(currentMinute / 60) * 100}%` }}
        />

        {/* 10-minute major markers */}
        {[0, 10, 20, 30, 40, 50, 60].map((t) => (
          <div
            key={t}
            onClick={() => onSelectMinute(t)}
            className="absolute -top-1 bottom-0 flex flex-col items-center cursor-pointer group"
            style={{ left: `${(t / 60) * 100}%` }}
          >
            <div className="w-0.5 h-2 bg-zinc-600 group-hover:bg-zinc-300 transition" />
            <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200 font-bold mt-1">
              +{t}m
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal Scrollable Event Cards */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto custom-scrollbar pb-1.5">
        {events.map((evt) => {
          const isPast = currentMinute >= evt.minuteOffset;
          const isCurrent = Math.abs(currentMinute - evt.minuteOffset) <= 2;
          const isConflict = evt.type === 'CONFLICT';
          const isResolution = evt.type === 'OPTIMIZATION' || evt.type === 'RESOLUTION';

          return (
            <div
              key={evt.id}
              onClick={() => onSelectMinute(evt.minuteOffset)}
              className={`shrink-0 w-52 p-2.5 rounded border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-zinc-800/90 border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg'
                  : isConflict
                  ? 'bg-rose-950/30 border-rose-800/80 hover:border-rose-600'
                  : isResolution
                  ? 'bg-emerald-950/20 border-emerald-800/70 hover:border-emerald-600'
                  : 'bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700'
              } ${!isPast ? 'opacity-70 hover:opacity-100' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isConflict
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : isResolution
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  T+{evt.minuteOffset}M
                </span>
                <span className="text-[9px] text-zinc-400">{evt.timeStr}</span>
              </div>

              <div
                className={`text-xs font-bold truncate mb-1 ${
                  isConflict ? 'text-rose-300' : isResolution ? 'text-emerald-300' : 'text-zinc-200'
                }`}
              >
                {evt.title}
              </div>

              <div className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                {evt.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
