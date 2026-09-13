'use client';

import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { ScenarioId } from '../../lib/api/types';

interface SectionFinalOperationalStatusProps {
  isResolved: boolean;
  onReset: () => void;
  onSwitchScenario: (id: ScenarioId) => void;
}

export const SectionFinalOperationalStatus: React.FC<SectionFinalOperationalStatusProps> = ({
  isResolved,
  onReset,
  onSwitchScenario,
}) => {
  return (
    <section className="w-full py-16 px-4 md:px-8 font-mono text-zinc-200 bg-[#06080c]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Status Container */}
        <div className="p-8 md:p-12 rounded-2xl bg-[#090d16] border border-zinc-800 shadow-2xl space-y-8 text-center max-w-4xl mx-auto">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              SECTION 09 · OPERATIONAL DEBRIEF
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-100 tracking-tight">
              {isResolved ? 'NETWORK STABILIZED' : 'HORIZON MONITORED'}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              {isResolved
                ? 'Proactive dispatch intervention successfully executed. All train movements within the 60-minute window maintain zero headway violations with lowest projected cumulative delay.'
                : '60-minute look-ahead projection scanned all 22 block sections. Interlocking conflict C-104 detected and optimized.'}
            </p>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
              <div className="text-[11px] text-zinc-400 uppercase">Status</div>
              <div className="text-base font-bold text-emerald-400 mt-1">SAFE & CLEAR</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
              <div className="text-[11px] text-zinc-400 uppercase">Look-Ahead</div>
              <div className="text-base font-bold text-zinc-200 mt-1">60 MIN COMPLETE</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
              <div className="text-[11px] text-zinc-400 uppercase">Delay Avoided</div>
              <div className="text-base font-bold text-emerald-400 mt-1">7.0 MINUTES</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
              <div className="text-[11px] text-zinc-400 uppercase">Corridor Traffic</div>
              <div className="text-base font-bold text-cyan-300 mt-1">12 TRAINS MONITORED</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onReset}
              className="px-5 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY 60-MIN LOOK-AHEAD</span>
            </button>

            <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>TEST ANOTHER SCENARIO:</span>
              <button
                onClick={() => onSwitchScenario('single_track_bottleneck')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Single Track
              </button>
              <span>·</span>
              <button
                onClick={() => onSwitchScenario('cascading_delay')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Cascading Delay
              </button>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer & Branding */}
        <div className="text-center pt-8 text-[11px] text-zinc-600 space-y-1">
          <div>AAHAVAAN-RAIL · PREDICTIVE RAILWAY DECISION SUPPORT</div>
          <div>DEMO MODE · SYNTHETIC OPERATIONAL DATA · HIGH-FIDELITY DISCRETE-EVENT SIMULATION</div>
        </div>
      </div>
    </section>
  );
};
