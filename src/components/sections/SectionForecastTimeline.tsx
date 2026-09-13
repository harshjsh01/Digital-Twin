'use client';

import React from 'react';
import {
  Clock,
  Compass,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { TimelineEvent } from '../../lib/api/types';

interface SectionForecastTimelineProps {
  events: TimelineEvent[];
  currentMinute: number;
  onSelectMinute: (minute: number) => void;
}

export const SectionForecastTimeline: React.FC<SectionForecastTimelineProps> = ({
  events,
  currentMinute,
  onSelectMinute,
}) => {
  const milestoneTicks = [
    { min: 0, label: 'NOW', desc: 'Baseline Network State' },
    { min: 10, label: '+10 MIN', desc: 'Downstream Traffic Evolves' },
    { min: 20, label: '+20 MIN', desc: 'Headway Compression Begins' },
    { min: 30, label: '+30 MIN', desc: 'Dadri Throat Headway Narrowing' },
    { min: 31, label: '+31 MIN', desc: 'C-104 CONFLICT PREDICTED', isCritical: true },
    { min: 40, label: '+40 MIN', desc: 'Dispatch Response Active' },
    { min: 50, label: '+50 MIN', desc: 'Corridor Flow Stabilizing' },
    { min: 60, label: '+60 MIN', desc: 'Horizon Cleared' },
  ];

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>SECTION 02 · 60-MINUTE OPERATIONAL FORECAST</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            WHAT HAPPENS NEXT?
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Standard sectional controllers clear movements using local First-In, First-Out (FIFO) rules.
            The 60-minute look-ahead projection computes exact spatial headways across every block in advance to detect entrapment traps before physical switches are crossed.
          </p>
        </div>

        {/* Big Horizontal Timeline Horizon */}
        <div className="bg-[#090d16] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Progress Bar with Minute Markers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold text-zinc-300">HORIZON PROGRESSION</span>
              <span className="text-cyan-400 font-bold">T+{currentMinute.toString().padStart(2, '0')} MIN (CURRENT SIMULATION CURSOR)</span>
            </div>

            <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(currentMinute / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Large Interactive Milestone Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {milestoneTicks.map((tick) => {
              const isPast = currentMinute >= tick.min;
              const isSelected = Math.abs(currentMinute - tick.min) <= 2;

              return (
                <div
                  key={tick.min}
                  onClick={() => onSelectMinute(tick.min)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    tick.isCritical
                      ? isSelected
                        ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-rose-950/30 border-rose-800/80 hover:border-rose-600'
                      : isSelected
                      ? 'bg-zinc-800 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                      : isPast
                      ? 'bg-zinc-900/90 border-zinc-700/80'
                      : 'bg-zinc-950/60 border-zinc-800/60 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div>
                    <div
                      className={`text-xs font-bold tracking-wider mb-1 ${
                        tick.isCritical ? 'text-rose-400' : isPast ? 'text-cyan-300' : 'text-zinc-400'
                      }`}
                    >
                      {tick.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight">
                      {tick.desc}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-500">
                    <span>{tick.min === 31 ? 'CONFLICT' : 'SCHEDULE'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operational Events Feed */}
          <div className="border-t border-zinc-800/80 pt-4">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Discrete Interlocking Events Along Horizon
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {events.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectMinute(evt.minuteOffset)}
                  className="p-3 rounded bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-200">T+{evt.minuteOffset}M</span>
                    <span className="text-[10px] text-zinc-500">{evt.timeStr}</span>
                  </div>
                  <div className="text-xs font-bold text-cyan-300 mb-1">{evt.title}</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2">{evt.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
