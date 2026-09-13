'use client';

import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Layers,
  Clock,
  ShieldX,
  Share2,
} from 'lucide-react';

export const SectionWhyConflictMatters: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'LOCAL CONFLICT',
      subtitle: 'Shared Bottleneck',
      desc: 'At 11:03 AM (T+31), Train 12804 and Train 14632 attempt simultaneous ingress onto Switch 42B at Block B17.',
      tag: 'Headway: 0 min',
      color: 'text-rose-400 border-rose-800/60 bg-rose-950/20',
    },
    {
      step: '02',
      title: 'PRIMARY DELAY',
      subtitle: 'Throat Deadlock',
      desc: 'Signal interlocking drops to Red aspect. One train is forcefully brought to an unscheduled dead stop at the outer home signal.',
      tag: 'Braking Penalty: +5m',
      color: 'text-amber-400 border-amber-800/60 bg-amber-950/20',
    },
    {
      step: '03',
      title: 'DOWNSTREAM IMPACT',
      subtitle: 'Trailing Movement Compression',
      desc: 'Trailing high-speed Vande Bharat (22416) and Magadh Express (12401) catch up to the stationary rake, receiving yellow caution signals.',
      tag: '3 Rakes Trapped',
      color: 'text-purple-400 border-purple-800/60 bg-purple-950/20',
    },
    {
      step: '04',
      title: 'NETWORK-WIDE DELAY',
      subtitle: 'Arterial Gridlock (+18m)',
      desc: 'Local headway failure propagates backward 35 km across the Ghaziabad-Dadri arterial corridor, accumulating 18 total minutes of passenger delay.',
      tag: 'Total Delay: +18m',
      color: 'text-rose-400 border-rose-800/60 bg-rose-950/30',
    },
  ];

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4" />
            <span>SECTION 04 · DELAY PROPAGATION ANALYSIS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            WHY THIS CONFLICT MATTERS
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            A single unresolved junction contention does not remain isolated.
            In dense mixed-traffic corridors, signal braking cascades backwards into trailing express traffic, turning a minor 3-minute overlap into an arterial delay cascade.
          </p>
        </div>

        {/* 4-Step Visual Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className={`p-5 rounded-xl border flex flex-col justify-between relative ${s.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-zinc-600">{s.step}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
                    {s.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-100 tracking-wide">{s.title}</h3>
                  <div className="text-xs text-zinc-400 mt-0.5 font-semibold">{s.subtitle}</div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 items-center justify-center text-zinc-400 shadow">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Takeaway Banner */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Manual First-In First-Out (FIFO) clearing would halt Express 12804 because Passenger 14632 arrives at the approach 90 seconds earlier.</span>
          </div>
          <span className="text-cyan-400 font-bold">
            PROACTIVE DISPATCH INTERVENTION REQUIRED
          </span>
        </div>
      </div>
    </section>
  );
};
