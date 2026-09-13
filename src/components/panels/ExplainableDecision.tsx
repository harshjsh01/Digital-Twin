'use client';

import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Check,
  Scale,
  FileText,
  Activity,
  Award,
} from 'lucide-react';
import { OptimizationResult } from '../../lib/api/types';

interface ExplainableDecisionProps {
  optimization: OptimizationResult | null;
}

export const ExplainableDecision: React.FC<ExplainableDecisionProps> = ({
  optimization,
}) => {
  if (!optimization) return null;

  const { explanation } = optimization;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 font-mono">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-400" />
        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          WHY THIS DECISION?
        </h2>
      </div>

      <div className="text-xs font-bold text-emerald-300 mb-1.5">
        {explanation.headline}
      </div>

      <p className="text-[11px] text-zinc-300 leading-relaxed mb-3">
        {explanation.summary}
      </p>

      {/* Constraints Satisfied */}
      <div className="space-y-1.5 mb-3 bg-black/40 p-2.5 rounded border border-zinc-800/80">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">
          Operational Constraints Satisfied:
        </div>
        {explanation.keyConstraints.map((constraint, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{constraint}</span>
          </div>
        ))}
      </div>

      {/* Priority Weights Matrix */}
      <div className="border-t border-zinc-800/80 pt-2.5">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Priority Weighting Formulation:</span>
          <span className="text-[9px] text-zinc-400">CP-SAT Penalty Function</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {explanation.priorityWeights.map((pw, i) => (
            <div key={i} className="bg-zinc-950 p-2 rounded border border-zinc-800">
              <div className="text-[10px] text-zinc-400 truncate">{pw.trainNumber}</div>
              <div className="text-xs font-bold text-zinc-100 flex items-center justify-between mt-0.5">
                <span>W = {pw.weight}</span>
                <span className="text-[9px] text-cyan-400">{pw.weight >= 10 ? 'HIGH' : 'NORM'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
