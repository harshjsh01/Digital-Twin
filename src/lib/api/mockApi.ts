import {
  Scenario,
  ScenarioId,
  Train,
  TrackBlock,
  Conflict,
  OptimizationResult,
  NetworkTelemetry,
} from './types';
import { ALL_SCENARIOS, DEFAULT_SCENARIO } from '../data/scenarios';
import { STATIONS, TRACK_BLOCKS, SIGNALS } from '../data/networkTopology';

export class MockApiService {
  private scenarios = ALL_SCENARIOS;

  async getNetworkTopology() {
    return {
      stations: STATIONS,
      blocks: TRACK_BLOCKS,
      signals: SIGNALS,
    };
  }

  async getScenario(id: ScenarioId): Promise<Scenario> {
    return this.scenarios[id] || DEFAULT_SCENARIO;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return Object.values(this.scenarios);
  }

  /**
   * Computes deterministic train positions and statuses based on simulation minute (0 - 60)
   * and whether the recommended dispatch resolution has been applied.
   */
  async getTrainsAtMinute(
    scenarioId: ScenarioId,
    minute: number,
    isResolved: boolean = false
  ): Promise<Train[]> {
    const scenario = this.scenarios[scenarioId] || DEFAULT_SCENARIO;
    const baseTrains = scenario.trains;

    return baseTrains.map((train) => {
      const copy = { ...train };

      if (train.direction === 'UP') {
        // Special logic for Hero conflict trains: 12804 & 14632
        if (train.id === 'TRN_14632') {
          if (isResolved) {
            // Train 14632 is held in loop siding at Dadri between minute 31 and 34
            if (minute < 30) {
              const startX = 685;
              const targetX = 770;
              const t = Math.min(1, minute / 30);
              copy.coordinates = { x: startX + (targetX - startX) * t, y: 185 };
              copy.currentBlock = 'B08';
              copy.status = 'APPROACHING';
            } else if (minute >= 30 && minute <= 34) {
              // IN SIDING LOOP
              copy.coordinates = { x: 790, y: 150 };
              copy.currentBlock = 'B17-LOOP';
              copy.status = 'HELD';
              copy.speedKmph = 0;
            } else {
              // Resumed from siding loop towards Boraki
              const resumedT = Math.min(1, (minute - 34) / 26);
              copy.coordinates = { x: 800 + (1080 - 800) * resumedT, y: 185 };
              copy.currentBlock = minute < 45 ? 'B09' : 'B11';
              copy.status = 'RUNNING';
              copy.speedKmph = 72;
            }
          } else {
            // Unresolved: enters conflict zone around minute 30-31
            const startX = 685;
            const targetX = 750;
            const t = Math.min(1, minute / 31);
            copy.coordinates = { x: startX + (targetX - startX) * t, y: 185 };
            if (minute >= 30) {
              copy.currentBlock = 'B17';
              copy.status = minute >= 31 ? 'HELD' : 'APPROACHING';
              copy.speedKmph = minute >= 31 ? 0 : 35;
            }
          }
        } else if (train.id === 'TRN_12804') {
          // Express 12804 moves West to East
          // Starts at x: 120, passes GZB (360) at min 15, reaches Dadri (790) at min 31, Khurja (1640) at min 58
          const totalDistance = 1640 - 120;
          const progress = Math.min(1, minute / 58);
          const currentX = 120 + totalDistance * progress;
          copy.coordinates = { x: currentX, y: 185 };

          if (currentX < 210) copy.currentBlock = 'B01';
          else if (currentX < 360) copy.currentBlock = 'B03';
          else if (currentX < 500) copy.currentBlock = 'B05';
          else if (currentX < 640) copy.currentBlock = 'B07';
          else if (currentX < 790) copy.currentBlock = 'B08';
          else if (currentX < 865) copy.currentBlock = 'B17';
          else if (currentX < 1080) copy.currentBlock = 'B11';
          else copy.currentBlock = 'B13';

          if (!isResolved && minute >= 31 && minute <= 38) {
            copy.status = 'HELD';
            copy.speedKmph = 0;
            copy.delayMin = 9;
          } else {
            copy.status = 'RUNNING';
            copy.speedKmph = 105;
            copy.delayMin = isResolved ? 2 : train.delayMin;
          }
        } else if (train.id === 'TRN_22416') {
          // Vande Bharat moves fast
          const progress = Math.min(1, minute / 45);
          const currentX = 330 + (1640 - 330) * progress;
          copy.coordinates = { x: currentX, y: 185 };
          copy.currentBlock = currentX < 640 ? 'B05' : currentX < 940 ? 'B09' : 'B13';
        } else {
          // Other generic Up trains move steadily
          const initialX = copy.coordinates?.x || 100;
          const advance = minute * 14;
          const newX = Math.min(1660, initialX + advance);
          copy.coordinates = { x: newX, y: copy.coordinates?.y || 185 };
        }
      } else {
        // DOWN trains move East to West (Right to Left)
        const initialX = copy.coordinates?.x || 1600;
        const advance = minute * 18;
        const newX = Math.max(70, initialX - advance);
        copy.coordinates = { x: newX, y: 255 };

        if (newX > 1500) copy.currentBlock = 'B18';
        else if (newX > 1220) copy.currentBlock = 'B20';
        else if (newX > 790) copy.currentBlock = 'B22';
        else if (newX > 360) copy.currentBlock = 'B24';
        else copy.currentBlock = 'B25';
      }

      return copy;
    });
  }

  /**
   * Computes block visual states (OCCUPIED, CONFLICT, RESOLVED, AVAILABLE, RESERVED)
   */
  async getBlocksAtMinute(
    scenarioId: ScenarioId,
    minute: number,
    isResolved: boolean = false
  ): Promise<TrackBlock[]> {
    const scenario = this.scenarios[scenarioId] || DEFAULT_SCENARIO;
    const blocks = [...scenario.blocks];

    return blocks.map((b) => {
      const block = { ...b };

      if (block.code === 'B17') {
        if (isResolved) {
          block.state = 'RESOLVED';
          block.signalAspect = 'GREEN';
        } else if (minute >= 30) {
          block.state = 'CONFLICT';
          block.signalAspect = 'RED';
        } else if (minute >= 20) {
          block.state = 'AT_RISK';
          block.signalAspect = 'YELLOW';
        } else {
          block.state = 'AVAILABLE';
          block.signalAspect = 'GREEN';
        }
      }

      if (block.code === 'B17-LOOP') {
        if (isResolved && minute >= 30 && minute <= 34) {
          block.state = 'OCCUPIED';
          block.currentTrainId = 'TRN_14632';
        } else {
          block.state = 'AVAILABLE';
        }
      }

      return block;
    });
  }

  async getConflict(scenarioId: ScenarioId): Promise<Conflict | null> {
    const scenario = this.scenarios[scenarioId] || DEFAULT_SCENARIO;
    return scenario.conflict || null;
  }

  async getOptimization(scenarioId: ScenarioId): Promise<OptimizationResult | null> {
    const scenario = this.scenarios[scenarioId] || DEFAULT_SCENARIO;
    return scenario.optimizationResult || null;
  }

  async getTelemetry(
    scenarioId: ScenarioId,
    minute: number,
    isResolved: boolean = false
  ): Promise<NetworkTelemetry> {
    const scenario = this.scenarios[scenarioId] || DEFAULT_SCENARIO;
    const base = scenario.initialTelemetry;

    if (scenarioId === 'junction_conflict') {
      if (isResolved) {
        return {
          ...base,
          simulationClockMin: minute,
          networkDelayMin: 11,
          predictedConflicts: 0,
          activeConflicts: 0,
          trainsAtRisk: 1,
          occupiedBlocks: 16,
        };
      } else if (minute >= 31) {
        return {
          ...base,
          simulationClockMin: minute,
          networkDelayMin: 18 + Math.floor((minute - 31) * 0.4),
          predictedConflicts: 0,
          activeConflicts: 1,
          trainsAtRisk: 3,
        };
      } else if (minute >= 20) {
        return {
          ...base,
          simulationClockMin: minute,
          predictedConflicts: 1,
          activeConflicts: 0,
          trainsAtRisk: 2,
        };
      }
    }

    return {
      ...base,
      simulationClockMin: minute,
    };
  }

  // ==========================================
  // PHYSICAL SIMULATOR MOCK METHODS
  // ==========================================

  async getSimulatorLayout(): Promise<any> {
    return {
      station_id: 'STN_DADRI',
      name: 'Dadri Central Junction',
      platforms: [
        { id: 'PLATFORM_1', track_id: 'TRK_P1', length_m: 650, max_speed_kmph: 30 },
        { id: 'PLATFORM_2', track_id: 'TRK_P2', length_m: 650, max_speed_kmph: 30 },
        { id: 'PLATFORM_3', track_id: 'TRK_P3', length_m: 650, max_speed_kmph: 30 },
        { id: 'PLATFORM_4', track_id: 'TRK_P4', length_m: 600, max_speed_kmph: 30 },
        { id: 'PLATFORM_5', track_id: 'TRK_P5', length_m: 600, max_speed_kmph: 30 },
        { id: 'PLATFORM_6', track_id: 'TRK_P6', length_m: 550, max_speed_kmph: 30 },
      ],
      outer_waiting_tracks: [
        { id: 'OUTER_HOLD_1', track_id: 'TRK_OH1', capacity: 1, description: 'Up Main Outer Loop' },
        { id: 'OUTER_HOLD_2', track_id: 'TRK_OH2', capacity: 1, description: 'Up Freight Siding / Loop 2' },
        { id: 'OUTER_HOLD_3', track_id: 'TRK_OH3', capacity: 1, description: 'Down Main Outer Loop' },
        { id: 'OUTER_HOLD_4', track_id: 'TRK_OH4', capacity: 1, description: 'Down Freight Siding' },
      ],
      switch_points: [
        { id: 'SW_01A', location_km: 14.2, state: 'NORMAL' },
        { id: 'SW_02B', location_km: 14.8, state: 'REVERSE' },
      ],
      signals: [
        { id: 'SIG_HOME_UP', type: '4_ASPECT', aspect: 'GREEN' },
        { id: 'SIG_STARTER_P1', type: '3_ASPECT', aspect: 'RED' },
      ],
    };
  }

  async getSimulatorState(): Promise<any> {
    return {
      timestamp: 31,
      trains: [
        {
          id: '12804',
          number: '12804',
          name: 'Purushottam Express',
          x: 770,
          y: 220,
          speed_kmph: 88,
          status: 'RUNNING',
          block_id: 'B17',
          delay_min: 0,
        },
        {
          id: '14632',
          number: '14632',
          name: 'Amritsar Passenger',
          x: 740,
          y: 290,
          speed_kmph: 35,
          status: 'APPROACHING',
          block_id: 'B17',
          delay_min: 6,
        },
        {
          id: '22416',
          number: '22416',
          name: 'Vande Bharat Express',
          x: 480,
          y: 220,
          speed_kmph: 130,
          status: 'RUNNING',
          block_id: 'B05',
          delay_min: 0,
        },
        {
          id: '12401',
          number: '12401',
          name: 'Magadh Superfast Express',
          x: 340,
          y: 220,
          speed_kmph: 105,
          status: 'RUNNING',
          block_id: 'B03',
          delay_min: 2,
        },
      ],
      signals: {
        SIG_HOME_UP: 'YELLOW',
        SIG_STARTER_P1: 'RED',
        SIG_STARTER_P2: 'GREEN',
      },
      switches: {
        SW_01A: 'NORMAL',
        SW_02B: 'REVERSE',
      },
    };
  }

  async tickSimulator(stepSeconds: number = 60): Promise<any> {
    return {
      current_time: 32,
      time: 32,
      trains: (await this.getSimulatorState()).trains,
    };
  }

  // ==========================================
  // STATION MASTER HITL MOCK METHODS
  // ==========================================

  async getStationRadar(): Promise<any> {
    return {
      horizon_min: 30,
      queue: [
        {
          train_id: '12804',
          train_name: 'Purushottam Express',
          priority: 10,
          eta_min: 4,
          current_block: 'B16',
          assigned_route: 'PLATFORM_1',
          status: 'CRITICAL_PATH',
        },
        {
          train_id: '14632',
          train_name: 'Amritsar Passenger',
          priority: 3,
          eta_min: 5,
          current_block: 'B15_D',
          assigned_route: 'OUTER_HOLD_2',
          status: 'DIVERT_SCHEDULED',
        },
        {
          train_id: '22416',
          train_name: 'Vande Bharat Express',
          priority: 10,
          eta_min: 14,
          current_block: 'B05',
          assigned_route: 'PLATFORM_2',
          status: 'ON_SCHEDULE',
        },
        {
          train_id: '12401',
          train_name: 'Magadh Express',
          priority: 8,
          eta_min: 22,
          current_block: 'B03',
          assigned_route: 'PLATFORM_1',
          status: 'DELAYED',
        },
        {
          train_id: '5012',
          train_name: 'Container Freight 5012',
          priority: 2,
          eta_min: 28,
          current_block: 'B01',
          assigned_route: 'OUTER_HOLD_1',
          status: 'DIVERT_SCHEDULED',
        },
      ],
    };
  }

  async getStationRecommendations(): Promise<any> {
    return {
      generated_at: 142,
      recommendations: [
        {
          recommendation_id: 'REC_8841',
          train_id: '14632',
          train_name: 'Amritsar Passenger',
          priority: 3,
          eta_min: 5,
          recommended_action: 'DIVERT_TO_HOLDING',
          assigned_track: 'OUTER_HOLD_2 (Loop Siding 2)',
          alternative_track: 'PLATFORM_3',
          outer_wait_min: 3,
          reasoning: 'Hold Passenger 14632 in Loop Siding 2 for 3 minutes to clear Block B17 throat. Grants Purushottam Express 12804 (Weight 10) immediate mainline passage. Avoids cascading delay to Vande Bharat 22416. Global delay saved: 7.0 minutes.',
          safety_interlock_approved: true,
          status: 'PENDING_APPROVAL',
        },
        {
          recommendation_id: 'REC_8842',
          train_id: '5012',
          train_name: 'Container Freight 5012',
          priority: 2,
          eta_min: 28,
          recommended_action: 'HOLD_AT_SIDING',
          assigned_track: 'OUTER_HOLD_1 (Up Main Outer Loop)',
          alternative_track: 'PLATFORM_6',
          outer_wait_min: 8,
          reasoning: 'Buffer freight at outer holding track to protect trailing Magadh Express 12401 high-speed junction slot.',
          safety_interlock_approved: true,
          status: 'PENDING_APPROVAL',
        },
      ],
    };
  }

  async approveRecommendation(payload: any): Promise<any> {
    return {
      status: 'APPROVED_AND_LOCKED',
      route_id: `ROUTE_${payload.assigned_track || 'SIDING_2'}`,
      signal_id: 'SIG_HOME_UP',
      signal_aspect: 'GREEN',
      switches_aligned: ['SW_01A:NORMAL', 'SW_02B:REVERSE'],
      timestamp: Date.now(),
    };
  }

  async overrideRecommendation(payload: any): Promise<any> {
    return {
      status: 'MANUALLY_OVERRIDDEN',
      assigned_track: payload.manual_track || 'PLATFORM_3',
      safety_check_passed: true,
      message: `Manual track allocation to ${payload.manual_track || 'PLATFORM_3'} verified against interlocking constraints. Route set.`,
    };
  }

  async triggerEmergencyStop(payload: any): Promise<any> {
    return {
      status: 'EMERGENCY_STOP_ACTIVE',
      signals_tripped: 18,
      timestamp: Date.now(),
    };
  }

  // ==========================================
  // PASSENGER PORTAL MOCK METHODS
  // ==========================================

  async searchPassengerTrains(query: string): Promise<any> {
    const q = (query || '').toLowerCase().trim();
    const all = [
      {
        id: '12804',
        number: '12804',
        name: 'Purushottam Express',
        type: 'Superfast Express',
        priority: 10,
        origin: 'New Delhi (NDLS)',
        destination: 'Puri (PURI)',
        current_status: 'RUNNING ON TIME',
        delay_min: 0,
      },
      {
        id: '14632',
        number: '14632',
        name: 'Amritsar Passenger',
        type: 'Passenger',
        priority: 3,
        origin: 'Dehradun (DDN)',
        destination: 'Amritsar (ASR)',
        current_status: 'APPROACHING HOLDING SIDING',
        delay_min: 6,
      },
      {
        id: '22416',
        number: '22416',
        name: 'Vande Bharat Express',
        type: 'Vande Bharat',
        priority: 10,
        origin: 'New Delhi (NDLS)',
        destination: 'Varanasi (BSB)',
        current_status: 'RUNNING ON TIME',
        delay_min: 0,
      },
      {
        id: '12401',
        number: '12401',
        name: 'Magadh Express',
        type: 'Superfast',
        priority: 8,
        origin: 'Islampur (IPR)',
        destination: 'New Delhi (NDLS)',
        current_status: 'RUNNING DELAYED (+2m)',
        delay_min: 2,
      },
      {
        id: '5012',
        number: '5012',
        name: 'Container Freight 5012',
        type: 'Freight',
        priority: 2,
        origin: 'Tughlakabad (TKD)',
        destination: 'Dadri DFC',
        current_status: 'SCHEDULED SIDING HOLD',
        delay_min: 4,
      },
    ];

    if (!q) return { results: all };
    return {
      results: all.filter(
        (t) =>
          t.number.includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.origin.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
      ),
    };
  }

  async getPassengerTrainStatus(trainId: string): Promise<any> {
    const list = (await this.searchPassengerTrains('')).results;
    const found = list.find((t: any) => t.id === trainId || t.number === trainId) || list[0];

    return {
      train_id: found.id,
      train_number: found.number,
      train_name: found.name,
      speed_kmph: found.id === '14632' ? 35 : found.id === '22416' ? 130 : 88,
      current_block: found.id === '14632' ? 'B17-LOOP' : 'B17',
      next_station: 'Dadri Central (DER)',
      delay_min: found.delay_min,
      status: found.current_status,
      progress_percent: 62,
    };
  }

  async getPassengerWhyStopped(trainId: string): Promise<any> {
    if (trainId === '14632') {
      return {
        train_id: '14632',
        train_name: 'Amritsar Passenger',
        is_stopped: true,
        stopped_at_location: 'Dadri Loop Siding 2 (Block B17)',
        duration_stopped_min: 3,
        expected_clearance_min: 1,
        plain_english_reason:
          'Your train is held in Loop Siding 2 for 3 minutes to allow High-Priority Express 12804 (Purushottam Express) to clear the interlocking crossover throat. Once Express 12804 clears Block B17, your departure signal will immediately clear to Green.',
        technical_conflict: {
          conflicting_train: 'Purushottam Express (12804)',
          conflict_section: 'Dadri Central Junction Throat Switch (Block B17)',
          priority_comparison: 'Purushottam Express (Priority 10) > Amritsar Passenger (Priority 3)',
        },
      };
    }

    return {
      train_id: trainId,
      train_name: 'Train ' + trainId,
      is_stopped: false,
      stopped_at_location: 'Mainline Corridor',
      duration_stopped_min: 0,
      expected_clearance_min: 0,
      plain_english_reason: 'Train is proceeding normally with Clear / Green signal aspect on mainline route.',
    };
  }

  // ==========================================
  // DISPATCH PRIORITY LIST ORDERING
  // ==========================================

  async getDispatchPriorityList(scenarioId: ScenarioId = 'junction_conflict', isResolved: boolean = false) {
    return [
      {
        rank: 1,
        trainId: 'TRN_12804',
        trainNumber: '12804',
        trainName: 'Purushottam Express',
        type: 'EXPRESS' as const,
        priorityWeight: 10,
        priorityLevel: 'CRITICAL' as const,
        status: isResolved ? ('PROCEEDING' as const) : ('AT_RISK' as const),
        speedKmph: 88,
        delayMin: isResolved ? 2 : 0,
        currentBlock: 'B17',
        assignedRoute: 'MAINLINE UP (PLATFORM 1)',
        relativePrecedenceNote: 'Priority 10 Express > Priority 3 Passenger (Preempts Siding)',
      },
      {
        rank: 2,
        trainId: 'TRN_22416',
        trainNumber: '22416',
        trainName: 'Vande Bharat Express',
        type: 'SUPERFAST' as const,
        priorityWeight: 10,
        priorityLevel: 'CRITICAL' as const,
        status: 'ON_TIME' as const,
        speedKmph: 130,
        delayMin: 0,
        currentBlock: 'B05',
        assignedRoute: 'FAST CORRIDOR (PLATFORM 2)',
        relativePrecedenceNote: 'Trailing premier rake protected by 3-minute hold on 14632',
      },
      {
        rank: 3,
        trainId: 'TRN_12401',
        trainNumber: '12401',
        trainName: 'Magadh Express',
        type: 'EXPRESS' as const,
        priorityWeight: 8,
        priorityLevel: 'HIGH' as const,
        status: 'DELAYED' as const,
        speedKmph: 105,
        delayMin: 2,
        currentBlock: 'B03',
        assignedRoute: 'MAINLINE (PLATFORM 1)',
        relativePrecedenceNote: 'Standard express headway maintained',
      },
      {
        rank: 4,
        trainId: 'TRN_14632',
        trainNumber: '14632',
        trainName: 'Amritsar Passenger',
        type: 'PASSENGER' as const,
        priorityWeight: 3,
        priorityLevel: 'NORMAL' as const,
        status: isResolved ? ('HOLDING' as const) : ('AT_RISK' as const),
        speedKmph: isResolved ? 0 : 35,
        delayMin: isResolved ? 9 : 6,
        currentBlock: isResolved ? 'B17-LOOP' : 'B17',
        assignedRoute: 'LOOP SIDING 2 (HOLDING)',
        relativePrecedenceNote: 'Held for 3 min to avoid trapping high-priority Express',
      },
      {
        rank: 5,
        trainId: 'TRN_5012',
        trainNumber: '5012',
        trainName: 'Container Freight 5012',
        type: 'FREIGHT' as const,
        priorityWeight: 1,
        priorityLevel: 'LOW' as const,
        status: 'HOLDING' as const,
        speedKmph: 0,
        delayMin: 4,
        currentBlock: 'B01',
        assignedRoute: 'OUTER HOLDING 1',
        relativePrecedenceNote: 'Low-priority freight buffered before entering mainline',
      },
    ];
  }
}

export const mockApi = new MockApiService();
