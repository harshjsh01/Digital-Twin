'use client';

import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Check,
  Scale,
  Sliders,
  FileCheck,
  Award,
} from 'lucide-react';
import { OptimizationResult } from '../../lib/api/types';

interface SectionWhyThisDecisionProps {
  optimization: OptimizationResult | null;
}

export const SectionWhyThisDecision: React.FC<SectionWhyThisDecisionProps> = ({
  optimization,
}) => {
  if (!optimization) return null;

  const reasoningChain = [
    {
      label: 'PRIORITY',
      title: 'Operational Weight Precedence',
      detail: 'Train 12804 (Express) has priority weight W=10, whereas Train 14632 (Passenger) has weight W=3.',
      icon: Award,
    },
    {
      label: 'RESOURCE',
      title: 'Shared Single-Line Throat',
      detail: 'Both scheduled train movements require exclusive route lock of Block B17 (Switch 42B) at Dadri.',
      icon: Sliders,
    },
    {
      label: 'CONSTRAINT',
      title: 'Zero-Accident Safety Invariant',
      detail: 'Simultaneous occupancy of Block B17 is physically prohibited: Occupancy(B17, τ) ≤ 1 at all times.',
      icon: ShieldCheck,
    },
    {
      label: 'OBJECTIVE',
      title: 'Minimize Global Weighted Delay',
      detail: 'Objective function min ∑ (Priority_i × Delay_i) proves holding 14632 saves 7 network minutes.',
      icon: Scale,
    },
  ];

  return (
    <section className="w-full py-12 px-4 md:px-8 border-b border-zinc-800/60 font-mono text-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>SECTION 06 · EXPLAINABLE DISPATCH REASONING</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            WHY THIS DECISION?
          </h2>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Dispatch decisions in high-density corridors must be transparent, provable, and reproducible.
            The system applies formal constraint satisfaction instead of opaque heuristics.
          </p>
        </div>

        {/* 4-Column Operational Reasoning Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasoningChain.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-5 rounded-xl bg-[#090d16] border border-zinc-800 space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <Icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.detail}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-semibold">
                  FORMAL DISPATCH RULE
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Synthesis Card */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-cyan-950/30 border border-emerald-500/40 shadow-xl space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>OPERATIONAL SYNTHESIS</span>
          </div>
          <p className="text-sm md:text-base font-bold text-zinc-100 leading-relaxed">
            Holding Train 14632 for 3 minutes preserves the higher-priority movement (12804) while avoiding the Block B17 deadlock and minimizing projected network-wide delay.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-zinc-400">
            <div>
              Platform Used: <strong className="text-zinc-200">Dadri Outer Loop Siding 2</strong>
            </div>
            <div>
              Mainline Speed Preserved: <strong className="text-emerald-400">105 km/h</strong>
            </div>
            <div>
              Headway Margin: <strong className="text-cyan-400">+4.2 min buffer</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
