'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Maximize2,
  Minimize2,
  Terminal,
  Clock,
  Layers,
  RotateCcw,
  Wifi,
  WifiOff,
  Radio,
  Sliders,
  Compass,
  Users,
} from 'lucide-react';
import { SimulationPhase, ScenarioId } from '../../lib/api/types';
import { formatOperationalTime } from '../../lib/utils/formatters';
import { checkBackendHealth } from '../../lib/api/client';

interface CommandHeaderProps {
  minute?: number;
  phase?: SimulationPhase;
  scenarioId?: ScenarioId;
  presentationMode?: boolean;
  onTogglePresentation?: () => void;
  onToggleCommandPalette?: () => void;
  onSwitchScenario?: (id: ScenarioId) => void;
  onReset?: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  minute = 0,
  phase = 'IDLE',
  scenarioId = 'junction_conflict',
  presentationMode = false,
  onTogglePresentation,
  onToggleCommandPalette,
  onSwitchScenario,
  onReset,
}) => {
  const pathname = usePathname();
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const online = await checkBackendHealth();
      if (isMounted) setIsBackendOnline(online);
    };

    check();
    const interval = setInterval(check, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getPhaseBadge = () => {
    switch (phase) {
      case 'IDLE':
        return { label: 'STANDBY · READY', color: 'bg-zinc-800/80 text-zinc-300 border-zinc-700' };
      case 'INITIALIZING':
      case 'NETWORK_SYNC':
        return { label: 'SYNCHRONIZING NETWORK...', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-700 animate-pulse' };
      case 'SIMULATING':
        return { label: `SIMULATING LOOK-AHEAD · T+${minute}M`, color: 'bg-blue-950/80 text-blue-300 border-blue-700' };
      case 'SCANNING_FUTURE_CONFLICTS':
        return { label: 'SCANNING INTERLOCKING THREATS...', color: 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse' };
      case 'CONFLICT_PREDICTED':
        return { label: 'CONFLICT C-104 PREDICTED', color: 'bg-rose-950 text-rose-300 border-rose-600 animate-bounce' };
      case 'ANALYZING_RESOLUTIONS':
        return { label: 'SOLVER COMPUTING CANDIDATES...', color: 'bg-purple-950/80 text-purple-300 border-purple-700 animate-pulse' };
      case 'OPTIMAL_RESOLUTION_FOUND':
        return { label: 'OPTIMAL ACTION IDENTIFIED', color: 'bg-cyan-950 text-cyan-300 border-cyan-500' };
      case 'CONFLICT_RESOLVED':
        return { label: 'DISPATCH APPLIED · FLOW RESTORED', color: 'bg-emerald-950 text-emerald-300 border-emerald-600' };
      default:
        return { label: 'STANDBY · READY', color: 'bg-zinc-800/80 text-zinc-300 border-zinc-700' };
    }
  };

  const phaseBadge = getPhaseBadge();

  const navLinks = [
    { href: '/', label: 'COMMAND CENTER', icon: Radio },
    { href: '/simulator', label: 'SIMULATOR', icon: Sliders },
    { href: '/station-master', label: 'STATION MASTER', icon: Compass },
    { href: '/passenger', label: 'PASSENGER PORTAL', icon: Users },
  ];

  return (
    <header className="w-full bg-[#0d1117] border-b border-zinc-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none text-zinc-200">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-black text-base shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:border-emerald-400/60 transition">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold tracking-wider text-zinc-100 uppercase font-mono">
                AAHAVAAN-RAIL
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-zinc-800/90 text-zinc-400 border border-zinc-700/60 rounded">
                OPS v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono tracking-tight">
              Predictive Railway Decision Support
            </p>
          </div>
        </Link>
      </div>

      {/* Center 4 Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
              <span className="hidden md:inline">{link.label}</span>
              <span className="md:hidden">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Backend Mode & Phase Badge */}
      <div className="hidden xl:flex items-center gap-2">
        {isBackendOnline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-600/50 text-[10px] font-mono text-emerald-300">
            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LIVE BACKEND · CONNECTED (:8000)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400">
            <WifiOff className="w-3 h-3 text-zinc-500" />
            <span>DEMO MODE · SYNTHETIC OPERATIONAL DATA</span>
          </div>
        )}

        {pathname === '/' && (
          <div className={`px-2.5 py-1 rounded border text-[11px] font-mono font-medium ${phaseBadge.color}`}>
            {phaseBadge.label}
          </div>
        )}
      </div>

      {/* Right Controls & Operational Clock */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Scenario Picker (on root) */}
        {pathname === '/' && onSwitchScenario && (
          <div className="relative hidden sm:flex items-center">
            <Layers className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={scenarioId}
              onChange={(e) => onSwitchScenario(e.target.value as ScenarioId)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono rounded pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer hover:border-zinc-700 transition"
              aria-label="Select Scenario"
            >
              <option value="junction_conflict">Junction Conflict (Hero C-104)</option>
              <option value="normal_operations">Normal Operations</option>
              <option value="single_track_bottleneck">Single Track Bottleneck</option>
              <option value="cascading_delay">Cascading Delay Trap</option>
            </select>
          </div>
        )}

        {/* Operational Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded font-mono text-xs text-zinc-200">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold">{formatOperationalTime(minute)}</span>
        </div>

        {/* Command Palette Button */}
        {onToggleCommandPalette && (
          <button
            onClick={onToggleCommandPalette}
            title="Open Command Palette (Ctrl+K)"
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition"
            aria-label="Command Palette"
          >
            <Terminal className="w-4 h-4" />
          </button>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            title="Reset Simulation"
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-800/60 transition"
            aria-label="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Presentation Mode Toggle */}
        {onTogglePresentation && (
          <button
            onClick={onTogglePresentation}
            title={presentationMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode (Judge View)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono transition ${
              presentationMode
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
            }`}
          >
            {presentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{presentationMode ? 'EXIT' : 'PRESENT'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
