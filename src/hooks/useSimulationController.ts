'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScenarioId,
  Scenario,
  SimulationPhase,
  Train,
  TrackBlock,
  Conflict,
  OptimizationResult,
  NetworkTelemetry,
} from '../lib/api/types';
import { railwayApi } from '../lib/api/api';
import { DEFAULT_SCENARIO, ALL_SCENARIOS } from '../lib/data/scenarios';

export function useSimulationController() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('junction_conflict');
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [phase, setPhase] = useState<SimulationPhase>('IDLE');
  const [minute, setMinute] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(2);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Live state initialized synchronously with DEFAULT_SCENARIO for instant SSR & paint
  const [trains, setTrains] = useState<Train[]>(DEFAULT_SCENARIO.trains);
  const [blocks, setBlocks] = useState<TrackBlock[]>(DEFAULT_SCENARIO.blocks);
  const [telemetry, setTelemetry] = useState<NetworkTelemetry>(DEFAULT_SCENARIO.initialTelemetry);
  const [conflict, setConflict] = useState<Conflict | null>(DEFAULT_SCENARIO.conflict || null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(
    DEFAULT_SCENARIO.optimizationResult || null
  );

  // Selected entities for drill-down inspection
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TrackBlock | null>(null);
  const [focusedBlockCode, setFocusedBlockCode] = useState<string | null>(null);

  // Overlays
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load scenario when scenarioId changes
  useEffect(() => {
    let isMounted = true;
    railwayApi.getScenario(scenarioId).then((sc) => {
      if (isMounted) {
        setScenario(sc);
        setTrains(sc.trains);
        setBlocks(sc.blocks);
        setTelemetry(sc.initialTelemetry);
        setConflict(sc.conflict || null);
        setOptimization(sc.optimizationResult || null);
        setMinute(0);
        setIsResolved(false);
        setPhase('IDLE');
        setFocusedBlockCode(null);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [scenarioId]);

  // Update dynamic state as minute or resolution changes
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      railwayApi.getTrains(scenarioId, minute, isResolved),
      railwayApi.getBlocks(scenarioId, minute, isResolved),
      railwayApi.getTelemetry(scenarioId, minute, isResolved),
    ]).then(([tList, bList, telem]) => {
      if (!isMounted) return;
      setTrains(tList);
      setBlocks(bList);
      setTelemetry(telem);

      // Keep selected train synced with moving position
      if (selectedTrain) {
        const updated = tList.find((t) => t.id === selectedTrain.id);
        if (updated) setSelectedTrain(updated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [scenarioId, minute, isResolved, selectedTrain?.id]);

  // Simulation tick progression
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = speed === 5 ? 120 : speed === 2 ? 300 : 600;

    timerRef.current = setInterval(() => {
      setMinute((prev) => {
        if (prev >= 60) {
          setIsPlaying(false);
          setPhase('CONFLICT_RESOLVED');
          return 60;
        }

        const nextMin = prev + 1;

        // Phase transitions during hero scenario
        if (scenarioId === 'junction_conflict') {
          if (nextMin === 4) {
            setPhase('SIMULATING');
          } else if (nextMin === 18) {
            setPhase('SCANNING_FUTURE_CONFLICTS');
          } else if (nextMin === 30 && !isResolved) {
            setPhase('CONFLICT_PREDICTED');
            setFocusedBlockCode('B17');
          } else if (nextMin === 32 && !isResolved) {
            setPhase('ANALYZING_RESOLUTIONS');
          } else if (nextMin === 34 && !isResolved) {
            setPhase('OPTIMAL_RESOLUTION_FOUND');
          }
        }

        return nextMin;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, scenarioId, isResolved]);

  // Actions
  const runLookahead = useCallback(() => {
    setMinute(0);
    setIsResolved(false);
    setPhase('INITIALIZING');
    setIsPlaying(true);
    setFocusedBlockCode(null);
  }, []);

  const pauseSimulation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeSimulation = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setMinute(0);
    setIsResolved(false);
    setPhase('IDLE');
    setFocusedBlockCode(null);
    setSelectedTrain(null);
    setSelectedBlock(null);
    const base = ALL_SCENARIOS[scenarioId] || DEFAULT_SCENARIO;
    setTrains(base.trains);
    setBlocks(base.blocks);
    setTelemetry(base.initialTelemetry);
  }, [scenarioId]);

  const applyResolution = useCallback((candidateId: string) => {
    setIsResolved(true);
    setPhase('CONFLICT_RESOLVED');
    setIsPlaying(true);
  }, []);

  const switchScenario = useCallback((id: ScenarioId) => {
    setIsPlaying(false);
    setScenarioId(id);
  }, []);

  const togglePresentationMode = useCallback(() => {
    setPresentationMode((prev) => !prev);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev);
  }, []);

  const focusBlock = useCallback((blockCode: string | null) => {
    setFocusedBlockCode(blockCode);
  }, []);

  return {
    scenarioId,
    scenario,
    phase,
    minute,
    isPlaying,
    speed,
    isResolved,
    trains,
    blocks,
    telemetry,
    conflict,
    optimization,
    selectedTrain,
    selectedBlock,
    focusedBlockCode,
    presentationMode,
    commandPaletteOpen,
    setSelectedTrain,
    setSelectedBlock,
    setSpeed,
    setMinute,
    runLookahead,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    applyResolution,
    switchScenario,
    togglePresentationMode,
    toggleCommandPalette,
    focusBlock,
  };
}
