import { apiFetch, checkBackendHealth } from './client';
import {
  SimulatorLayout,
  SimulatorStateResponse,
  SimulatorTickResponse,
  SimulatorPlaybackPayload,
} from './types';
import { mockApi } from './mockApi';

/**
 * Service functions for physical simulator endpoints
 */

export async function getSimulatorLayout(): Promise<SimulatorLayout> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<SimulatorLayout>('/api/v1/simulator/layout');
    } catch (err) {
      console.warn('Real /api/v1/simulator/layout failed, falling back:', err);
    }
  }
  return mockApi.getSimulatorLayout();
}

export async function getSimulatorState(): Promise<SimulatorStateResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<SimulatorStateResponse>('/api/v1/simulator/state');
    } catch {
      // Try baseline /api/state if v1 fails
      try {
        const baseline = await apiFetch<{ current_time: number; trains: any[] }>('/api/state');
        return {
          timestamp: baseline.current_time,
          trains: (baseline.trains || []).map((t) => ({
            id: t.id,
            name: t.name,
            x: (t.pos_km || 0) * 50 + 100,
            y: 220,
            speed_kmph: t.speed_kmph || 0,
            status: t.status || 'RUNNING',
            block_id: t.current_stn || 'B17',
            delay_min: t.delay_min || 0,
          })),
          signals: { SIG_HOME_UP: 'GREEN', SIG_STARTER_P1: 'RED' },
          switches: { SW_01A: 'NORMAL', SW_02B: 'NORMAL' },
        };
      } catch (baselineErr) {
        console.warn('Backend state fetch failed:', baselineErr);
      }
    }
  }
  return mockApi.getSimulatorState();
}

export async function tickSimulation(stepSeconds: number = 60): Promise<SimulatorTickResponse> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<SimulatorTickResponse>('/api/v1/simulator/control/tick', {
        method: 'POST',
        body: JSON.stringify({ step_seconds: stepSeconds }),
      });
    } catch {
      try {
        const baseline = await apiFetch<{ current_time: number; trains: any[] }>('/api/simulate/tick', {
          method: 'POST',
        });
        return {
          current_time: baseline.current_time,
          trains: (baseline.trains || []).map((t) => ({
            id: t.id,
            name: t.name,
            x: (t.pos_km || 0) * 50 + 100,
            y: 220,
            speed_kmph: t.speed_kmph || 0,
            status: t.status || 'RUNNING',
            block_id: t.current_stn || 'B17',
            delay_min: t.delay_min || 0,
          })),
        };
      } catch (err) {
        console.warn('Backend tick failed:', err);
      }
    }
  }
  return mockApi.tickSimulator(stepSeconds);
}

export async function setPlayback(payload: SimulatorPlaybackPayload): Promise<{ status: string }> {
  const isOnline = await checkBackendHealth();
  if (isOnline) {
    try {
      return await apiFetch<{ status: string }>('/api/v1/simulator/control/playback', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Playback control API failed, applied locally:', err);
    }
  }
  return { status: 'OK_LOCAL_APPLIED' };
}
