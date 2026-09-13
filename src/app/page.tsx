'use client';

import React, { useState } from 'react';
import { CommandHeader } from '../components/header/CommandHeader';
import { TelemetryStrip } from '../components/header/TelemetryStrip';
import { RailwayCanvas } from '../components/canvas/RailwayCanvas';
import { SimulationControls } from '../components/controls/SimulationControls';
import { SectionForecastTimeline } from '../components/sections/SectionForecastTimeline';
import { SectionConflictIntelligence } from '../components/sections/SectionConflictIntelligence';
import { SectionWhyConflictMatters } from '../components/sections/SectionWhyConflictMatters';
import { SectionDispatchOptimization } from '../components/sections/SectionDispatchOptimization';
import { DispatchPriorityList } from '../components/panels/DispatchPriorityList';
import { SectionWhyThisDecision } from '../components/sections/SectionWhyThisDecision';
import { SectionImpactComparison } from '../components/sections/SectionImpactComparison';
import { SectionOperationalAnalytics } from '../components/sections/SectionOperationalAnalytics';
import { SectionFinalOperationalStatus } from '../components/sections/SectionFinalOperationalStatus';
import { TrainDetailDrawer } from '../components/panels/TrainDetailDrawer';
import { CommandPalette } from '../components/controls/CommandPalette';
import { PresentationOverlay } from '../components/presentation/PresentationOverlay';
import { useSimulationController } from '../hooks/useSimulationController';
import {
  Train as TrainIcon,
  ChevronDown,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function CommandCenterPage() {
  const controller = useSimulationController();
  const [showRoster, setShowRoster] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-zinc-100 font-mono select-none overflow-x-hidden">
      {/* Sticky Operational Header */}
      <div className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md">
        <CommandHeader
          minute={controller.minute}
          phase={controller.phase}
          scenarioId={controller.scenarioId}
          presentationMode={controller.presentationMode}
          onTogglePresentation={controller.togglePresentationMode}
          onToggleCommandPalette={controller.toggleCommandPalette}
          onSwitchScenario={controller.switchScenario}
          onReset={controller.resetSimulation}
        />

        {/* Quiet Compact Telemetry Strip */}
        <TelemetryStrip
          telemetry={controller.telemetry}
          phase={controller.phase}
          isResolved={controller.isResolved}
        />
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: COMMAND CENTER & HERO RAILWAY TOPOLOGY       */}
      {/* ======================================================== */}
      <section className="w-full px-4 md:px-8 pt-4 pb-12 border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Top Operational Context Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-zinc-200">
                CURRENT NETWORK STATE · 10:32 AM IST
              </span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400">110 KM ARTERIAL CORRIDOR</span>
            </div>

            {/* Quick Toggle for Train Roster Drawer */}
            <button
              onClick={() => setShowRoster(!showRoster)}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <TrainIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showRoster ? 'HIDE TRAIN ROSTER' : 'INSPECT TRAIN ROSTER (12)'}</span>
            </button>
          </div>

          {/* Collapsible Train Roster Drawer */}
          {showRoster && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold text-zinc-200 uppercase">Active Corridor Train Roster</span>
                <span>Click any train to inspect specifications</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {controller.trains.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => controller.setSelectedTrain(t)}
                    className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/80 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-100">{t.number}</span>
                      <span className="text-[9px] text-zinc-400">{t.type}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{t.name}</div>
                    <div className="text-[9px] text-cyan-400 mt-1 font-semibold">
                      Block {t.currentBlock} · {t.speedKmph}k
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action & Simulation Controller */}
          <SimulationControls
            minute={controller.minute}
            phase={controller.phase}
            isPlaying={controller.isPlaying}
            speed={controller.speed}
            isResolved={controller.isResolved}
            onRunLookahead={controller.runLookahead}
            onPause={controller.pauseSimulation}
            onResume={controller.resumeSimulation}
            onReset={controller.resetSimulation}
            onSetSpeed={controller.setSpeed}
            onSetMinute={controller.setMinute}
          />

          {/* Substantially Enlarged Hero SVG Railway Network Visualizer */}
          <div className="w-full h-[420px] md:h-[500px] lg:h-[540px]">
            <RailwayCanvas
              stations={controller.scenario?.stations || []}
              blocks={controller.blocks}
              signals={controller.scenario?.signals || []}
              trains={controller.trains}
              phase={controller.phase}
              focusedBlockCode={controller.focusedBlockCode}
              selectedTrainId={controller.selectedTrain?.id || null}
              minute={controller.minute}
              onSelectTrain={controller.setSelectedTrain}
              onSelectBlock={controller.setSelectedBlock}
              onFocusBlock={controller.focusBlock}
            />
          </div>

          {/* Scroll Cue Hint */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
            <span>SCROLL TO EXPLORE THE 60-MINUTE OPERATIONAL STORY</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-cyan-400" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: 60-MINUTE OPERATIONAL FORECAST               */}
      {/* ======================================================== */}
      <SectionForecastTimeline
        events={controller.scenario?.timelineEvents || []}
        currentMinute={controller.minute}
        onSelectMinute={controller.setMinute}
      />

      {/* ======================================================== */}
      {/* SECTION 3: CONFLICT INTELLIGENCE                        */}
      {/* ======================================================== */}
      <SectionConflictIntelligence
        conflict={controller.conflict}
        minute={controller.minute}
        isResolved={controller.isResolved}
        onFocusBlock={controller.focusBlock}
      />

      {/* ======================================================== */}
      {/* SECTION 4: WHY THIS CONFLICT MATTERS                     */}
      {/* ======================================================== */}
      <SectionWhyConflictMatters />

      {/* ======================================================== */}
      {/* SECTION 5: DISPATCH OPTIMIZATION                         */}
      {/* ======================================================== */}
      <SectionDispatchOptimization
        optimization={controller.optimization}
        phase={controller.phase}
        isResolved={controller.isResolved}
        onApplyResolution={controller.applyResolution}
      />

      {/* ======================================================== */}
      {/* DISPATCH PRIORITY-ORDER RANKING                          */}
      {/* ======================================================== */}
      <section className="w-full px-4 md:px-8 py-8 border-b border-zinc-800/60 bg-[#07090e]">
        <div className="max-w-7xl mx-auto space-y-3">
          <DispatchPriorityList
            onSelectTrain={(trainNumber) => {
              const train = controller.trains.find((t) => t.number === trainNumber);
              if (train) {
                controller.setSelectedTrain(train);
                controller.focusBlock(train.currentBlock);
              }
            }}
            selectedTrainNumber={controller.selectedTrain?.number || null}
          />
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: WHY THIS DECISION?                            */}
      {/* ======================================================== */}
      <SectionWhyThisDecision optimization={controller.optimization} />

      {/* ======================================================== */}
      {/* SECTION 7: THE IMPACT OF ONE DECISION (BEFORE / AFTER)    */}
      {/* ======================================================== */}
      <SectionImpactComparison
        optimization={controller.optimization}
        isResolved={controller.isResolved}
      />

      {/* ======================================================== */}
      {/* SECTION 8: NETWORK OPERATIONS ANALYTICS                  */}
      {/* ======================================================== */}
      <SectionOperationalAnalytics
        currentMinute={controller.minute}
        isResolved={controller.isResolved}
      />

      {/* ======================================================== */}
      {/* SECTION 9: FINAL OPERATIONAL STATUS                      */}
      {/* ======================================================== */}
      <SectionFinalOperationalStatus
        isResolved={controller.isResolved}
        onReset={controller.resetSimulation}
        onSwitchScenario={controller.switchScenario}
      />

      {/* ======================================================== */}
      {/* DRAWERS & OVERLAYS                                       */}
      {/* ======================================================== */}
      {/* Train Detail Inspection Drawer */}
      <TrainDetailDrawer
        train={controller.selectedTrain}
        onClose={() => controller.setSelectedTrain(null)}
      />

      {/* Keyboard Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={controller.commandPaletteOpen}
        onClose={controller.toggleCommandPalette}
        onRunLookahead={controller.runLookahead}
        onReset={controller.resetSimulation}
        onApplyResolution={() => controller.applyResolution('OPT_A')}
        onFocusBlock={controller.focusBlock}
        onSwitchScenario={controller.switchScenario}
        onTogglePresentation={controller.togglePresentationMode}
      />

      {/* Presentation Mode Overlay */}
      {controller.presentationMode && (
        <PresentationOverlay
          minute={controller.minute}
          phase={controller.phase}
          isResolved={controller.isResolved}
          onExit={controller.togglePresentationMode}
          onRunLookahead={controller.runLookahead}
          onApplyResolution={() => controller.applyResolution('OPT_A')}
        />
      )}
    </div>
  );
}
