'use client';

import React, { useState, useEffect } from 'react';
import { CommandHeader } from '@/components/header/CommandHeader';
import { RailwayCanvas } from '@/components/canvas/RailwayCanvas';
import { TrainDetailDrawer } from '@/components/panels/TrainDetailDrawer';
import { useSimulationController } from '@/hooks/useSimulationController';
import { simulatorApi } from '@/lib/api/api';
import { useRailwayWebSocket } from '@/lib/api/websocket';
import {
  Play,
  Pause,
  FastForward,
  StepForward,
  RotateCcw,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Layers,
  Radio,
} from 'lucide-react';

export default function SimulatorPage() {
  const {
    minute,
    speed,
    isPlaying,
    isResolved,
    selectedTrain,
    scenario,
    trains,
    blocks,
    conflict,
    phase,
    focusedBlockCode,
    pauseSimulation,
    resumeSimulation,
    setSpeed,
    resetSimulation,
    setMinute,
    setSelectedTrain,
    setSelectedBlock,
    focusBlock,
  } = useSimulationController();

  const [tickLoading, setTickLoading] = useState(false);
  const [layoutInfo, setLayoutInfo] = useState<any>(null);
  const [switchesState, setSwitchesState] = useState<{ SW_01A: string; SW_02B: string }>({
    SW_01A: 'NORMAL',
    SW_02B: isResolved ? 'NORMAL' : 'REVERSE',
  });

  // Connect WebSocket to /ws/simulator
  const { connectionState, lastMessage } = useRailwayWebSocket<any>({
    channel: '/ws/simulator',
    enabled: true,
  });

  // Fetch Simulator Layout
  useEffect(() => {
    simulatorApi.getSimulatorLayout().then((layout) => {
      setLayoutInfo(layout);
    });
  }, []);

  // Handle manual step tick
  const handleStepTick = async () => {
    setTickLoading(true);
    try {
      await simulatorApi.tickSimulation(60);
      setMinute(Math.min(60, minute + 1));
    } finally {
      setTickLoading(false);
    }
  };

  // Handle playback toggle
  const handleTogglePlay = async () => {
    if (isPlaying) {
      pauseSimulation();
      await simulatorApi.setPlayback({ speed_multiplier: speed, is_paused: true });
    } else {
      resumeSimulation();
      await simulatorApi.setPlayback({ speed_multiplier: speed, is_paused: false });
    }
  };

  // Handle speed change
  const handleSpeedChange = async (newSpeed: 1 | 2 | 5) => {
    setSpeed(newSpeed);
    await simulatorApi.setPlayback({ speed_multiplier: newSpeed, is_paused: !isPlaying });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Universal Navigation Header */}
      <CommandHeader
        minute={minute}
        phase={isPlaying ? 'SIMULATING' : 'IDLE'}
        scenarioId={scenario.id}
        onReset={resetSimulation}
      />

      {/* Main Simulator Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Title & Live Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c0f17] border border-white/10 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base font-bold font-mono tracking-wider uppercase text-white">
                PHYSICAL STATION & CORRIDOR SIMULATOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                /api/v1/simulator
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              6 dedicated platform lines, 4 outer waiting tracks, dynamic crossover switch points, and 4-aspect signal heads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* WebSocket Channel Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
              <Radio className={`w-3.5 h-3.5 ${connectionState === 'CONNECTED' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="text-zinc-400">WS /ws/simulator:</span>
              <span className={`font-semibold ${connectionState === 'CONNECTED' ? 'text-emerald-300' : 'text-zinc-400'}`}>
                {connectionState}
              </span>
            </div>

            {/* Simulation Clock Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIM CLOCK: T+{minute}m</span>
            </div>
          </div>
        </div>

        {/* Hero Schematic Topology Canvas */}
        <section className="bg-[#0c0f17] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-semibold">
                CORRIDOR SCHEMATIC TOPOLOGY & DADRI CENTRAL JUNCTION
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              CLICK ANY TRAIN TO INSPECT TELEMETRY
            </span>
          </div>

          <div className="h-[480px] lg:h-[520px] w-full">
            <RailwayCanvas
              stations={scenario?.stations || []}
              blocks={blocks}
              trains={trains}
              signals={scenario?.signals || []}
              phase={phase}
              focusedBlockCode={focusedBlockCode}
              onSelectTrain={setSelectedTrain}
              onSelectBlock={setSelectedBlock}
              onFocusBlock={focusBlock}
              selectedTrainId={selectedTrain?.id || null}
              minute={minute}
            />
          </div>
        </section>

        {/* Simulator Control Deck */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Playback & Tick Controls */}
          <div className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                SIMULATION PLAYBACK CONTROLS
              </h3>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${
                    isPlaying
                      ? 'bg-amber-500 text-black hover:bg-amber-400'
                      : 'bg-cyan-500 text-black hover:bg-cyan-400'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'PAUSE SIMULATION' : 'RUN SIMULATION'}</span>
                </button>

                <button
                  onClick={handleStepTick}
                  disabled={tickLoading}
                  className="px-4 py-2.5 rounded-lg font-mono text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 transition flex items-center gap-1.5"
                  title="Step Forward 1 Minute (/control/tick)"
                >
                  <StepForward className="w-4 h-4 text-cyan-400" />
                  <span>STEP TICK</span>
                </button>

                <button
                  onClick={resetSimulation}
                  className="p-2.5 rounded-lg font-mono text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition"
                  title="Reset to T+0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">PLAYBACK RATE:</span>
              <div className="flex items-center gap-1.5">
                {([1, 2, 5] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition ${
                      speed === s
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Switch Points & Signal Interlocking */}
          <div className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              INTERLOCKING & SWITCH POINT STATE
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-semibold text-white">SWITCH SW_01A</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">Dadri Crossover Throat (Km 14.2)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {switchesState.SW_01A}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-semibold text-white">SWITCH SW_02B</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">Block B17 Siding Crossover (Km 14.8)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  switchesState.SW_02B === 'REVERSE'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {switchesState.SW_02B} (TO LOOP SIDING 2)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-semibold text-white">SIGNAL SIG_HOME_UP</span>
                  <span className="text-[10px] font-mono text-zinc-400 block">4-Aspect Mainline Entry</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  CLEAR (GREEN)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Platform & Siding Occupancy Matrix */}
          <div className="bg-[#0c0f17] border border-white/10 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              6 PLATFORMS & 4 HOLDING TRACKS
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">PF 1:</span>
                <span className="text-emerald-400 font-bold">12804 (CLEAR)</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">PF 2:</span>
                <span className="text-zinc-400">AVAILABLE</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">PF 3:</span>
                <span className="text-zinc-400">AVAILABLE</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">PF 4:</span>
                <span className="text-zinc-400">AVAILABLE</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">SIDING 1:</span>
                <span className="text-zinc-400">AVAILABLE</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">SIDING 2:</span>
                <span className="text-amber-400 font-bold">14632 (HOLD 3M)</span>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
              Zero-collision interlocking supervisor active. All track circuits safely isolated.
            </div>
          </div>
        </section>
      </main>

      {/* Train Detail Inspection Drawer */}
      <TrainDetailDrawer train={selectedTrain} onClose={() => setSelectedTrain(null)} />
    </div>
  );
}
