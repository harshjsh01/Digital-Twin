import { TrainPriority, BlockState, SignalAspect, TrainType } from '../api/types';

/**
 * Formats minute offset from 10:32 AM into standard 12-hour clock
 */
export function formatOperationalTime(minuteOffset: number, baseHour = 10, baseMin = 32): string {
  const totalMinutes = baseHour * 60 + baseMin + Math.floor(minuteOffset);
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = minutes.toString().padStart(2, '0');
  return `${hours12}:${mm} ${ampm} IST`;
}

export function formatDelay(delayMin: number): string {
  if (delayMin <= 0) return 'ON TIME';
  return `+${delayMin} MIN`;
}

export function getPriorityStyle(priority: TrainPriority) {
  switch (priority) {
    case 'HIGH':
      return {
        label: 'HIGH PRIORITY',
        badgeClass: 'bg-rose-950/80 text-rose-400 border border-rose-700/60',
        dotClass: 'bg-rose-500',
      };
    case 'NORMAL':
      return {
        label: 'NORMAL PRIORITY',
        badgeClass: 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/60',
        dotClass: 'bg-cyan-500',
      };
    case 'LOW':
      return {
        label: 'LOW PRIORITY',
        badgeClass: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
        dotClass: 'bg-zinc-500',
      };
  }
}

export function getTrainTypeBadge(type: TrainType) {
  switch (type) {
    case 'SUPERFAST':
      return { label: 'SUPERFAST', color: 'text-amber-400 bg-amber-950/60 border-amber-700/50' };
    case 'EXPRESS':
      return { label: 'EXPRESS', color: 'text-blue-400 bg-blue-950/60 border-blue-700/50' };
    case 'PASSENGER':
      return { label: 'PASSENGER', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50' };
    case 'FREIGHT':
      return { label: 'FREIGHT', color: 'text-purple-400 bg-purple-950/60 border-purple-700/50' };
  }
}

export function getBlockStateColor(state: BlockState) {
  switch (state) {
    case 'AVAILABLE':
      return {
        stroke: '#334155', // slate-700
        fill: 'transparent',
        label: 'AVAILABLE',
        badgeClass: 'bg-slate-900 text-slate-400 border-slate-700',
      };
    case 'OCCUPIED':
      return {
        stroke: '#0284c7', // sky-600
        fill: 'rgba(2, 132, 199, 0.15)',
        label: 'OCCUPIED',
        badgeClass: 'bg-sky-950 text-sky-400 border-sky-700',
      };
    case 'RESERVED':
      return {
        stroke: '#d97706', // amber-600
        fill: 'rgba(217, 119, 6, 0.15)',
        label: 'RESERVED',
        badgeClass: 'bg-amber-950 text-amber-400 border-amber-700',
      };
    case 'AT_RISK':
      return {
        stroke: '#f59e0b', // amber-500
        fill: 'rgba(245, 158, 11, 0.25)',
        label: 'AT RISK',
        badgeClass: 'bg-amber-900/80 text-amber-300 border-amber-600',
      };
    case 'CONFLICT':
      return {
        stroke: '#ef4444', // red-500
        fill: 'rgba(239, 68, 68, 0.3)',
        label: 'CONFLICT',
        badgeClass: 'bg-red-950 text-red-400 border-red-600 animate-pulse',
      };
    case 'RESOLVED':
      return {
        stroke: '#10b981', // emerald-500
        fill: 'rgba(16, 185, 129, 0.2)',
        label: 'RESOLVED',
        badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-600',
      };
  }
}

export function getSignalColor(aspect: SignalAspect) {
  switch (aspect) {
    case 'GREEN':
      return { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' };
    case 'YELLOW':
    case 'DOUBLE_YELLOW':
      return { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' };
    case 'RED':
      return { fill: '#ef4444', glow: 'rgba(239, 68, 68, 0.8)' };
  }
}
