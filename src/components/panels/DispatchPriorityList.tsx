'use client';

import React, { useState } from 'react';
import { DispatchPriorityEntry } from '@/lib/api/types';
import {
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DispatchPriorityListProps {
  entries?: DispatchPriorityEntry[];
  onSelectTrain?: (trainNumber: string) => void;
  selectedTrainNumber?: string | null;
  className?: string;
  compact?: boolean;
}

const DEFAULT_PRIORITY_ENTRIES: DispatchPriorityEntry[] = [
  {
    rank: 1,
    trainId: 'TRN_12804',
    trainNumber: '12804',
    trainName: 'Purushottam Express',
    type: 'EXPRESS',
    priorityWeight: 10,
    priorityLevel: 'CRITICAL',
    status: 'AT_RISK',
    speedKmph: 88,
    delayMin: 0,
    currentBlock: 'B17',
    assignedRoute: 'MAINLINE UP (PLATFORM 1)',
    relativePrecedenceNote: 'Express Precedence (Weight 10) > Passenger 14632 (Weight 3). Mainline path locked.',
  },
  {
    rank: 2,
    trainId: 'TRN_22416',
    trainNumber: '22416',
    trainName: 'Vande Bharat Express',
    type: 'SUPERFAST',
    priorityWeight: 10,
    priorityLevel: 'CRITICAL',
    status: 'ON_TIME',
    speedKmph: 130,
    delayMin: 0,
    currentBlock: 'B05',
    assignedRoute: 'FAST CORRIDOR (PLATFORM 2)',
    relativePrecedenceNote: 'Trailing premier rake protected by 3-minute hold on 14632.',
  },
  {
    rank: 3,
    trainId: 'TRN_12401',
    trainNumber: '12401',
    trainName: 'Magadh Express',
    type: 'EXPRESS',
    priorityWeight: 8,
    priorityLevel: 'HIGH',
    status: 'DELAYED',
    speedKmph: 105,
    delayMin: 2,
    currentBlock: 'B03',
    assignedRoute: 'MAINLINE (PLATFORM 1)',
    relativePrecedenceNote: 'Standard express headway maintained without diversion.',
  },
  {
    rank: 4,
    trainId: 'TRN_14632',
    trainNumber: '14632',
    trainName: 'Amritsar Passenger',
    type: 'PASSENGER',
    priorityWeight: 3,
    priorityLevel: 'NORMAL',
    status: 'HOLDING',
    speedKmph: 0,
    delayMin: 6,
    currentBlock: 'B17-LOOP',
    assignedRoute: 'LOOP SIDING 2 (HOLDING)',
    relativePrecedenceNote: 'Lower precedence train held in loop siding to avoid trapping high-priority express.',
  },
  {
    rank: 5,
    trainId: 'TRN_5012',
    trainNumber: '5012',
    trainName: 'Container Freight 5012',
    type: 'FREIGHT',
    priorityWeight: 1,
    priorityLevel: 'LOW',
    status: 'HOLDING',
    speedKmph: 0,
    delayMin: 4,
    currentBlock: 'B01',
    assignedRoute: 'OUTER HOLDING 1',
    relativePrecedenceNote: 'Freight buffered in outer holding siding before entering arterial corridor.',
  },
];

export const DispatchPriorityList: React.FC<DispatchPriorityListProps> = ({
  entries = DEFAULT_PRIORITY_ENTRIES,
  onSelectTrain,
  selectedTrainNumber,
  className = '',
  compact = false,
}) => {
  const [expandedRank, setExpandedRank] = useState<number | null>(1);

  const toggleExpand = (rank: number) => {
    setExpandedRank(expandedRank === rank ? null : rank);
  };

  return (
    <div className={`bg-[#0c0f17] border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
            DISPATCH PRECEDENCE & PRIORITY RANKING
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            CP-SAT WEIGHTED MATRIX
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            5 ACTIVE CORRIDOR TRAINS
          </span>
        </div>
      </div>

      {/* Hero Precedence Highlight */}
      <div className="mx-4 my-3 p-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <div className="text-amber-200 font-medium">
            Active Junction Conflict Precedence: <span className="font-mono text-white">Express 12804 (Weight 10)</span> vs{' '}
            <span className="font-mono text-white">Passenger 14632 (Weight 3)</span>
          </div>
          <div className="text-zinc-400 text-[11px] mt-0.5">
            Solver policy prioritizes Train 12804 on Mainline Block B17; holds Train 14632 in Loop Siding 2 for 3 minutes to avoid a +18 min network delay cascade.
          </div>
        </div>
      </div>

      {/* Priority List Items */}
      <div className="divide-y divide-white/5">
        {entries.map((train) => {
          const isSelected = selectedTrainNumber === train.trainNumber;
          const isExpanded = expandedRank === train.rank;

          // Priority badge colors
          const badgeColor =
            train.priorityWeight >= 10
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : train.priorityWeight >= 8
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : train.priorityWeight >= 3
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700';

          const statusBadge =
            train.status === 'AT_RISK' ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                <AlertTriangle className="w-3 h-3 text-red-400" /> AT RISK (C-104)
              </span>
            ) : train.status === 'HOLDING' ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3 text-amber-400" /> HELD IN SIDING
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PROCEEDING
              </span>
            );

          return (
            <div
              key={train.trainId}
              className={`transition-colors ${
                isSelected ? 'bg-cyan-500/[0.08] border-l-2 border-cyan-400' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => {
                  toggleExpand(train.rank);
                  onSelectTrain?.(train.trainNumber);
                }}
              >
                {/* Rank & Train Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-mono font-bold text-zinc-500 w-6">
                    {String(train.rank).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm text-white">{train.trainNumber}</span>
                      <span className="text-xs text-zinc-300 truncate max-w-[150px] sm:max-w-[200px]">
                        {train.trainName}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                        {train.type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        Block: <strong className="text-zinc-200">{train.currentBlock}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-zinc-500" />
                        {train.speedKmph} km/h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Weight & Precedence Tag */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border inline-block ${badgeColor}`}>
                      PRIORITY {train.priorityWeight}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      Delay: {train.delayMin > 0 ? `+${train.delayMin}m` : '0m'}
                    </div>
                  </div>
                  {statusBadge}
                  <button
                    type="button"
                    aria-label="Toggle details"
                    className="p-1 rounded text-zinc-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="px-4 pb-3.5 pt-1 text-xs border-t border-white/5 bg-black/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                        Assigned Route / Platform
                      </span>
                      <span className="font-mono text-zinc-200 font-medium">{train.assignedRoute || 'UNASSIGNED'}</span>
                    </div>
                    <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-0.5">
                        Relative Precedence Policy
                      </span>
                      <span className="text-zinc-300 text-[11px] leading-relaxed">
                        {train.relativePrecedenceNote || 'Standard automatic dispatching rules applied.'}
                      </span>
                    </div>
                  </div>

                  {onSelectTrain && (
                    <button
                      onClick={() => onSelectTrain(train.trainNumber)}
                      className="mt-2.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Focus on Railway Visualizer</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer explanation */}
      <div className="p-3 bg-white/[0.01] border-t border-white/10 text-[11px] text-zinc-400 font-mono flex items-center justify-between">
        <span>Higher weight guarantees mainline allocation over lower weight during converging track conflicts.</span>
        <span className="text-zinc-400">P10: Premier · P8: Express · P3: Passenger · P1: Freight</span>
      </div>
    </div>
  );
};
