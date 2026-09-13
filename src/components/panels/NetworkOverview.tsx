'use client';

import React, { useState } from 'react';
import {
  Train as TrainIcon,
  Navigation,
  Clock,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { Train, Station, TrainType } from '../../lib/api/types';
import { getPriorityStyle, getTrainTypeBadge } from '../../lib/utils/formatters';

interface NetworkOverviewProps {
  trains: Train[];
  stations: Station[];
  selectedTrainId: string | null;
  onSelectTrain: (train: Train | null) => void;
}

export const NetworkOverview: React.FC<NetworkOverviewProps> = ({
  trains,
  stations,
  selectedTrainId,
  onSelectTrain,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [tab, setTab] = useState<'TRAINS' | 'STATIONS'>('TRAINS');

  const filteredTrains = trains.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border border-zinc-800/80 rounded font-mono text-zinc-200 overflow-hidden">
      {/* Panel Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('TRAINS')}
            className={`text-xs font-bold uppercase pb-1 border-b-2 transition ${
              tab === 'TRAINS'
                ? 'text-zinc-100 border-cyan-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-300'
            }`}
          >
            ACTIVE TRAINS ({trains.length})
          </button>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => setTab('STATIONS')}
            className={`text-xs font-bold uppercase pb-1 border-b-2 transition ${
              tab === 'STATIONS'
                ? 'text-zinc-100 border-cyan-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-300'
            }`}
          >
            STATIONS ({stations.length})
          </button>
        </div>
      </div>

      {tab === 'TRAINS' ? (
        <>
          {/* Quick Filters */}
          <div className="px-3 py-2 border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['ALL', 'EXPRESS', 'SUPERFAST', 'PASSENGER', 'FREIGHT'].map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition shrink-0 ${
                  filterType === ft
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {ft}
              </button>
            ))}
          </div>

          {/* Train Roster List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredTrains.map((train) => {
              const isSelected = selectedTrainId === train.id;
              const pStyle = getPriorityStyle(train.priority);
              const tBadge = getTrainTypeBadge(train.type);

              return (
                <div
                  key={train.id}
                  onClick={() => onSelectTrain(train)}
                  className={`p-2.5 rounded border transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100">
                        {train.number}
                      </span>
                      <span className={`text-[9px] px-1 rounded border font-semibold ${tBadge.color}`}>
                        {train.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          train.delayMin > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {train.delayMin > 0 ? `+${train.delayMin}m` : 'ON TIME'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 truncate mb-1">
                    {train.name}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-300">BLOCK {train.currentBlock}</span>
                      <span>·</span>
                      <span className="text-zinc-400">{train.speedKmph} km/h</span>
                    </div>
                    <span className={`text-[9px] px-1 rounded ${pStyle.badgeClass}`}>
                      {train.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Stations List */
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {stations.map((stn) => (
            <div
              key={stn.id}
              className="p-2.5 rounded bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-zinc-200">{stn.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({stn.code})</span>
                </div>
                <span className="text-[10px] text-zinc-400">{stn.km} KM</span>
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                <span>Platforms: {stn.platforms.length}</span>
                {stn.junctionType === 'MAJOR_JUNCTION' && (
                  <span className="px-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[9px]">
                    MAJOR INTERLOCKING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
