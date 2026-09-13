'use client';

import React from 'react';
import {
  X,
  Train as TrainIcon,
  Gauge,
  Clock,
  MapPin,
  Shield,
  Activity,
  Navigation,
} from 'lucide-react';
import { Train } from '../../lib/api/types';
import { getPriorityStyle, getTrainTypeBadge } from '../../lib/utils/formatters';

interface TrainDetailDrawerProps {
  train: Train | null;
  onClose: () => void;
}

export const TrainDetailDrawer: React.FC<TrainDetailDrawerProps> = ({
  train,
  onClose,
}) => {
  if (!train) return null;

  const pStyle = getPriorityStyle(train.priority);
  const tBadge = getTrainTypeBadge(train.type);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0d1117]/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl z-50 flex flex-col font-mono text-zinc-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrainIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>{train.number}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${tBadge.color}`}>
                {train.type}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 truncate max-w-[220px]">
              {train.name}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          aria-label="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              CURRENT SPEED
            </div>
            <div className="text-base font-bold text-zinc-100 mt-1">
              {train.speedKmph} <span className="text-[10px] text-zinc-400 font-normal">km/h</span>
            </div>
            <div className="text-[9px] text-zinc-500">Max: {train.maxSpeedKmph} km/h</div>
          </div>

          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              SCHEDULE STATUS
            </div>
            <div
              className={`text-base font-bold mt-1 ${
                train.delayMin > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {train.delayMin > 0 ? `+${train.delayMin} MIN` : 'ON TIME'}
            </div>
            <div className="text-[9px] text-zinc-500">Status: {train.status}</div>
          </div>

          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" />
              CURRENT BLOCK
            </div>
            <div className="text-base font-bold text-cyan-300 mt-1">
              BLOCK {train.currentBlock}
            </div>
            <div className="text-[9px] text-zinc-500">Direction: {train.direction} LINE</div>
          </div>

          <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-rose-400" />
              PRIORITY WEIGHT
            </div>
            <div className="text-base font-bold text-rose-300 mt-1">
              {train.priorityWeight}{' '}
              <span className="text-[10px] text-zinc-400 font-normal">({train.priority})</span>
            </div>
            <div className="text-[9px] text-zinc-500">Dispatch Tier 1</div>
          </div>
        </div>

        {/* Consist & Locomotive Specs */}
        <div className="p-3 rounded bg-zinc-900/40 border border-zinc-800 text-xs space-y-1.5">
          <div className="text-[10px] text-zinc-400 uppercase font-semibold">
            Consist & Locomotive Telemetry
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Locomotive:</span>
            <span className="font-bold text-zinc-200">{train.locoType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Coach Composition:</span>
            <span className="font-bold text-zinc-200">{train.coaches} Rakes (LHB)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Braking Regime:</span>
            <span className="font-bold text-emerald-400">Twin-pipe Air Brake (Nominal)</span>
          </div>
        </div>

        {/* Timetable Schedule Stops */}
        <div>
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
            Operational Timetable
          </div>
          <div className="space-y-1.5">
            {train.schedule.map((stop, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-200">{stop.stationName}</div>
                  <div className="text-[10px] text-zinc-400">
                    Arr: T+{stop.scheduledArrivalMin}m | Dep: T+{stop.scheduledDepartureMin}m
                  </div>
                </div>
                {stop.platform && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {stop.platform}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
