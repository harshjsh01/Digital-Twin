'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Crosshair,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { Station, TrackBlock, Signal, Train, SimulationPhase } from '../../lib/api/types';
import {
  getBlockStateColor,
  getSignalColor,
  getPriorityStyle,
  getTrainTypeBadge,
} from '../../lib/utils/formatters';

interface RailwayCanvasProps {
  stations: Station[];
  blocks: TrackBlock[];
  signals: Signal[];
  trains: Train[];
  phase: SimulationPhase;
  focusedBlockCode: string | null;
  selectedTrainId: string | null;
  minute: number;
  onSelectTrain: (train: Train | null) => void;
  onSelectBlock: (block: TrackBlock | null) => void;
  onFocusBlock: (blockCode: string | null) => void;
}

export const RailwayCanvas: React.FC<RailwayCanvasProps> = ({
  stations,
  blocks,
  signals,
  trains,
  phase,
  focusedBlockCode,
  selectedTrainId,
  minute,
  onSelectTrain,
  onSelectBlock,
  onFocusBlock,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Default wide schematic viewport
  const defaultViewBox = useMemo(() => ({ x: 20, y: 80, width: 1720, height: 280 }), []);
  const [viewBox, setViewBox] = useState(defaultViewBox);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Conflict state detection
  const isConflictApproaching = minute >= 25 && minute <= 35 && phase !== 'CONFLICT_RESOLVED';
  const isConflictActive = (phase === 'CONFLICT_PREDICTED' || (minute >= 30 && minute <= 35)) && phase !== 'CONFLICT_RESOLVED';

  // Camera auto-focus on Block B17 when conflict is focused or predicted
  useEffect(() => {
    if (focusedBlockCode === 'B17' || isConflictActive) {
      setViewBox({
        x: 600,
        y: 110,
        width: 480,
        height: 220,
      });
    }
  }, [focusedBlockCode, isConflictActive]);

  const handleZoom = (delta: number) => {
    setViewBox((prev) => {
      const zoomFactor = delta > 0 ? 0.8 : 1.25;
      const newWidth = Math.max(320, Math.min(2000, prev.width * zoomFactor));
      const newHeight = Math.max(160, Math.min(500, prev.height * zoomFactor));
      const dx = (prev.width - newWidth) / 2;
      const dy = (prev.height - newHeight) / 2;
      return {
        x: Math.max(-50, prev.x + dx),
        y: Math.max(20, prev.y + dy),
        width: newWidth,
        height: newHeight,
      };
    });
  };

  const handleResetZoom = () => {
    setViewBox(defaultViewBox);
    onFocusBlock(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    const scale = viewBox.width / containerRef.current.clientWidth;

    setViewBox((prev) => ({
      ...prev,
      x: prev.x - dx * scale,
      y: prev.y - dy * scale,
    }));
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[460px] bg-[#07090e] select-none overflow-hidden rounded-lg border border-zinc-800/80 flex flex-col shadow-2xl">
      {/* Top Overlay Legend & Status */}
      <div className="absolute top-3 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded text-xs font-mono text-zinc-300 shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-zinc-100 tracking-wider">SCHEMATIC CORRIDOR TOPOLOGY</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">110 KM · 12 STATIONS</span>
        </div>

        {/* Dynamic Focus Callout when C-104 is active */}
        {isConflictActive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 backdrop-blur-md border border-rose-600 text-rose-300 rounded text-xs font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>FOCUSING: BLOCK B17 CONVERGING CONFLICT (C-104)</span>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => onFocusBlock('B17')}
          title="Focus on Conflict Zone (Block B17)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border transition ${
            focusedBlockCode === 'B17' || isConflictActive
              ? 'bg-rose-950 border-rose-600 text-rose-200 font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>FOCUS B17</span>
        </button>

        <button
          onClick={() => handleZoom(1)}
          className="p-1.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="p-1.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          title="Reset View"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Subtle Engineering Grid */}
            <pattern id="railGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>

            {/* Controlled Glow Filters */}
            <filter id="conflictHalo" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="resolvedHalo" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect x="-300" y="-100" width="2400" height="700" fill="url(#railGrid)" />

          {/* Quiet Track Line Labels */}
          <text x="35" y="174" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
            UP MAIN LINE →
          </text>
          <text x="35" y="272" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
            ← DOWN MAIN LINE
          </text>

          {/* Track Blocks */}
          <g id="track-segments">
            {blocks.map((block) => {
              const isB17 = block.code === 'B17';
              const isLoopSiding = block.code === 'B17-LOOP';
              const isConflict = block.state === 'CONFLICT';
              const isResolved = block.state === 'RESOLVED';
              const isAtRisk = block.state === 'AT_RISK';

              // Visual quieting: when conflict C-104 is active, unrelated blocks dim slightly
              const shouldDim = isConflictApproaching && !isB17 && !isLoopSiding && block.code !== 'B08';

              let strokeColor = '#27272a'; // neutral dark zinc
              let strokeWidth = block.isJunctionThroat ? 4.5 : 3.5;

              if (isConflict) {
                strokeColor = '#ef4444';
                strokeWidth = 5.5;
              } else if (isResolved) {
                strokeColor = '#10b981';
                strokeWidth = 4.5;
              } else if (isAtRisk) {
                strokeColor = '#f59e0b';
              } else if (block.state === 'OCCUPIED') {
                strokeColor = '#0284c7';
              }

              return (
                <g
                  key={block.id}
                  onClick={() => onSelectBlock(block)}
                  className="cursor-pointer group"
                  opacity={shouldDim ? 0.35 : 1}
                  style={{ transition: 'opacity 0.4s ease' }}
                >
                  {/* Outer Highlight for Conflict / Resolved */}
                  {(isConflict || isResolved) && (
                    <path
                      d={block.pathD}
                      fill="none"
                      stroke={isConflict ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}
                      strokeWidth={14}
                      strokeLinecap="round"
                      filter={isConflict ? 'url(#conflictHalo)' : 'url(#resolvedHalo)'}
                    />
                  )}

                  {/* Core Track Stroke */}
                  <path
                    d={block.pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={block.trackType === 'LOOP' ? '6 3' : undefined}
                    className="transition-colors duration-300"
                  />

                  {/* Progressive Label for Throat and Loop */}
                  {isB17 && (
                    <g transform="translate(775, 202)">
                      <rect x="-35" y="-9" width="70" height="15" rx="2" fill="#090d16" stroke={isConflict ? '#ef4444' : '#334155'} strokeWidth="1" />
                      <text
                        x="0"
                        y="2"
                        fill={isConflict ? '#f87171' : isResolved ? '#34d399' : '#94a3b8'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        THROAT B17
                      </text>
                    </g>
                  )}

                  {isLoopSiding && (
                    <text
                      x="790"
                      y="142"
                      fill="#94a3b8"
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      DADRI LOOP SIDING 2
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Railway Signals */}
          <g id="signals">
            {signals.map((sig) => {
              const { fill, glow } = getSignalColor(sig.aspect);
              const shouldDim = isConflictApproaching && sig.blockId !== 'BLK_17' && sig.blockId !== 'BLK_17L';

              return (
                <g
                  key={sig.id}
                  transform={`translate(${sig.x}, ${sig.y})`}
                  opacity={shouldDim ? 0.35 : 1}
                  style={{ transition: 'opacity 0.4s ease' }}
                >
                  <line x1="0" y1="0" x2="0" y2="9" stroke="#475569" strokeWidth="1.2" />
                  <circle cx="0" cy="-3" r="2.8" fill={fill} style={{ filter: `drop-shadow(0 0 3px ${glow})` }} />
                </g>
              );
            })}
          </g>

          {/* Stations Hierarchy */}
          <g id="stations">
            {stations.map((stn) => {
              const isMajor = stn.junctionType === 'MAJOR_JUNCTION';
              const shouldDim = isConflictApproaching && stn.code !== 'DER' && stn.code !== 'MIU';

              return (
                <g
                  key={stn.id}
                  transform={`translate(${stn.coordinates.x}, ${stn.coordinates.y})`}
                  opacity={shouldDim ? 0.4 : 1}
                  style={{ transition: 'opacity 0.4s ease' }}
                >
                  <line x1="0" y1="-40" x2="0" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                  <circle
                    cx="0"
                    cy="0"
                    r={isMajor ? 5.5 : 3.5}
                    fill="#0a0f1d"
                    stroke={isMajor ? '#38bdf8' : '#475569'}
                    strokeWidth={isMajor ? 2 : 1.2}
                  />
                  <text
                    x="0"
                    y={isMajor ? -48 : -38}
                    fill={isMajor ? '#f1f5f9' : '#94a3b8'}
                    fontSize={isMajor ? '11' : '9'}
                    fontFamily="monospace"
                    fontWeight={isMajor ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {stn.name}
                  </text>
                  <text
                    x="0"
                    y={isMajor ? 54 : 46}
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {stn.km} KM
                  </text>
                </g>
              );
            })}
          </g>

          {/* Trains Hierarchy */}
          <g id="trains">
            {trains.map((train) => {
              const coords = train.coordinates || { x: 100, y: 185 };
              const isSelected = selectedTrainId === train.id;
              const isHeroExpress = train.id === 'TRN_12804';
              const isHeroPassenger = train.id === 'TRN_14632';
              const isHeroConflictTrain = isHeroExpress || isHeroPassenger;
              const isHeld = train.status === 'HELD';

              // Visual focus: when conflict is active, hero trains stand out sharply, others dim slightly
              const shouldDim = isConflictApproaching && !isHeroConflictTrain;

              return (
                <g
                  key={train.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  onClick={() => onSelectTrain(train)}
                  className="cursor-pointer group"
                  opacity={shouldDim ? 0.3 : 1}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {/* Highlighting Beacon on Hero Trains during Conflict */}
                  {isConflictApproaching && isHeroConflictTrain && (
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke={isHeroExpress ? '#38bdf8' : '#fb923c'}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-spin"
                    />
                  )}

                  {/* Selection Frame */}
                  {isSelected && (
                    <rect x="-26" y="-18" width="52" height="36" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  )}

                  {/* Train Carriage */}
                  <rect
                    x="-18"
                    y="-7"
                    width="36"
                    height="14"
                    rx="2.5"
                    fill={
                      isHeroConflictTrain && isConflictActive
                        ? isHeroExpress
                          ? '#1e3a8a'
                          : '#78350f'
                        : isHeld
                        ? '#581c87'
                        : isHeroExpress
                        ? '#0c4a6e'
                        : '#18181b'
                    }
                    stroke={
                      isHeroConflictTrain && isConflictActive
                        ? isHeroExpress
                          ? '#38bdf8'
                          : '#fb923c'
                        : isHeroExpress
                        ? '#0284c7'
                        : '#3f3f46'
                    }
                    strokeWidth={isHeroConflictTrain ? 2 : 1}
                  />

                  {/* Train Number Label */}
                  <text
                    x="0"
                    y="3"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {train.number}
                  </text>

                  {/* Priority & Speed Tag */}
                  <g transform="translate(0, -12)">
                    <rect x="-22" y="-7" width="44" height="8" rx="2" fill="#000000" stroke="#27272a" strokeWidth="0.8" />
                    <text
                      x="0"
                      y="-1"
                      fill={train.priority === 'HIGH' ? '#f43f5e' : '#38bdf8'}
                      fontSize="6"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {train.priority} · {train.speedKmph}k
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Focal Conflict Marker C-104 */}
          {isConflictActive && (
            <g transform="translate(790, 185)">
              <circle cx="0" cy="0" r="28" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="10" fill="#ef4444" opacity="0.8">
                <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              <rect x="-40" y="-32" width="80" height="15" rx="2" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" />
              <text x="0" y="-21" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                CONFLICT C-104
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-2 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">NETWORK SCHEMATIC:</span>
          <span>Click any train or track section for telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SCROLL: ZOOM</span>
          <span>·</span>
          <span>DRAG: PAN</span>
        </div>
      </div>
    </div>
  );
};
