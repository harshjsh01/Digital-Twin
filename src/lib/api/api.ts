import {
  Scenario,
  ScenarioId,
  Train,
  TrackBlock,
  Conflict,
  OptimizationResult,
  NetworkTelemetry,
  DispatchPriorityEntry,
} from './types';
import { mockApi } from './mockApi';
import { checkBackendHealth, API_BASE_URL } from './client';

export * from './types';
export * from './client';
export * as simulatorApi from './simulator';
export * as stationMasterApi from './stationMaster';
export * as passengerApi from './passenger';
export * from './websocket';

/**
 * Unified Railway Operations API Service
 * Intelligently switches between Real FastAPI backend and deterministic mock fallback.
 */
class RailwayApiService {
  async isBackendLive(): Promise<boolean> {
    return checkBackendHealth();
  }

  async getNetworkTopology() {
    const isLive = await this.isBackendLive();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/simulator/layout`).catch(() => fetch(`${API_BASE_URL}/api/network`));
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend topology fetch failed, using mock:', err);
      }
    }
    return mockApi.getNetworkTopology();
  }

  async getScenario(id: ScenarioId): Promise<Scenario> {
    return mockApi.getScenario(id);
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return mockApi.getAllScenarios();
  }

  async getTrains(scenarioId: ScenarioId, minute: number, isResolved: boolean = false): Promise<Train[]> {
    const isLive = await this.isBackendLive();
    if (isLive) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/simulator/state`).catch(() => fetch(`${API_BASE_URL}/api/state`));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.trains) && data.trains.length > 0) {
            // Map live backend trains to domain Train shape if needed
            return data.trains.map((bt: any, idx: number) => ({
              id: bt.id || `TRN_${idx}`,
              number: bt.number || bt.id || `${12000 + idx}`,
              name: bt.name || `Train ${bt.id}`,
              type: bt.type || 'EXPRESS',
              priority: (bt.priority >= 8 ? 'HIGH' : bt.priority >= 3 ? 'NORMAL' : 'LOW') as any,
              priorityWeight: bt.priority || 5,
              currentBlock: bt.block_id || bt.current_stn || 'B17',
              speedKmph: bt.speed_kmph || 80,
              maxSpeedKmph: 130,
              delayMin: bt.delay_min || 0,
              direction: 'UP',
              status: bt.status || 'RUNNING',
              route: ['ANVT', 'GZB', 'DER', 'ALJN', 'KRJ'],
              progressPercent: 50,
              coordinates: { x: bt.x || 700, y: bt.y || 220 },
              schedule: [],
              coaches: 18,
              locoType: 'WAP-7',
            }));
          }
        }
      } catch (err) {
        console.warn('Live train state failed, falling back to mock:', err);
      }
    }
    return mockApi.getTrainsAtMinute(scenarioId, minute, isResolved);
  }

  async getBlocks(scenarioId: ScenarioId, minute: number, isResolved: boolean = false): Promise<TrackBlock[]> {
    return mockApi.getBlocksAtMinute(scenarioId, minute, isResolved);
  }

  async getConflict(scenarioId: ScenarioId): Promise<Conflict | null> {
    return mockApi.getConflict(scenarioId);
  }

  async getOptimization(scenarioId: ScenarioId): Promise<OptimizationResult | null> {
    return mockApi.getOptimization(scenarioId);
  }

  async getTelemetry(
    scenarioId: ScenarioId,
    minute: number,
    isResolved: boolean = false
  ): Promise<NetworkTelemetry> {
    return mockApi.getTelemetry(scenarioId, minute, isResolved);
  }

  async getDispatchPriorityList(scenarioId: ScenarioId = 'junction_conflict', isResolved: boolean = false): Promise<DispatchPriorityEntry[]> {
    return mockApi.getDispatchPriorityList(scenarioId, isResolved);
  }
}

export const railwayApi = new RailwayApiService();
