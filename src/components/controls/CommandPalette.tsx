'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  RotateCcw,
  Maximize2,
  Crosshair,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { ScenarioId } from '../../lib/api/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunLookahead: () => void;
  onReset: () => void;
  onApplyResolution: () => void;
  onFocusBlock: (blockCode: string | null) => void;
  onSwitchScenario: (id: ScenarioId) => void;
  onTogglePresentation: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRunLookahead,
  onReset,
  onApplyResolution,
  onFocusBlock,
  onSwitchScenario,
  onTogglePresentation,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'lookahead',
      title: 'Run 60-Minute Look-Ahead Simulation',
      icon: Zap,
      action: () => {
        onRunLookahead();
        onClose();
      },
    },
    {
      id: 'dispatch',
      title: 'Apply Recommended Dispatch (Hold Train 14632 · 3 min)',
      icon: Check,
      action: () => {
        onApplyResolution();
        onClose();
      },
    },
    {
      id: 'focus-b17',
      title: 'Focus Camera on Interlocking Throat (Block B17)',
      icon: Crosshair,
      action: () => {
        onFocusBlock('B17');
        onClose();
      },
    },
    {
      id: 'present',
      title: 'Toggle Presentation Mode (Judge Fullscreen)',
      icon: Maximize2,
      action: () => {
        onTogglePresentation();
        onClose();
      },
    },
    {
      id: 'reset',
      title: 'Reset Simulation to Baseline (10:32 AM)',
      icon: RotateCcw,
      action: () => {
        onReset();
        onClose();
      },
    },
    {
      id: 'sc-hero',
      title: 'Scenario: Junction Conflict C-104 (Hero)',
      icon: Layers,
      action: () => {
        onSwitchScenario('junction_conflict');
        onClose();
      },
    },
    {
      id: 'sc-norm',
      title: 'Scenario: Normal Operations',
      icon: Layers,
      action: () => {
        onSwitchScenario('normal_operations');
        onClose();
      },
    },
    {
      id: 'sc-bottle',
      title: 'Scenario: Single Track Bottleneck',
      icon: Layers,
      action: () => {
        onSwitchScenario('single_track_bottleneck');
        onClose();
      },
    },
    {
      id: 'sc-cascade',
      title: 'Scenario: Cascading Delay Trap',
      icon: Layers,
      action: () => {
        onSwitchScenario('cascading_delay');
        onClose();
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 font-mono select-none">
      <div className="w-full max-w-lg bg-[#0d1117] border border-zinc-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-3.5 py-3 border-b border-zinc-800 gap-2.5">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Type command or scenario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition"
            aria-label="Close Command Palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              No matching operations found
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full px-3 py-2 rounded text-left text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 flex items-center gap-2.5 transition group"
                >
                  <Icon className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 shrink-0" />
                  <span className="truncate">{cmd.title}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-3.5 py-2 bg-zinc-950/80 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
          <span>NAVIGATION: ↑ ↓ · ENTER TO SELECT</span>
          <span>ESC TO DISMISS</span>
        </div>
      </div>
    </div>
  );
};
