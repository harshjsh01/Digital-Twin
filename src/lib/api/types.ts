export type TrainType = 'EXPRESS' | 'SUPERFAST' | 'PASSENGER' | 'FREIGHT';

export type TrainPriority = 'HIGH' | 'NORMAL' | 'LOW';

export type TrainStatus = 'WAITING' | 'RUNNING' | 'HELD' | 'APPROACHING' | 'RESOLVED' | 'COMPLETED';

export type BlockState = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'AT_RISK' | 'CONFLICT' | 'RESOLVED';

export type SignalAspect = 'GREEN' | 'YELLOW' | 'DOUBLE_YELLOW' | 'RED';

export type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SimulationPhase =
  | 'IDLE'
  | 'INITIALIZING'
  | 'NETWORK_SYNC'
  | 'SIMULATING'
  | 'SCANNING_FUTURE_CONFLICTS'
  | 'CONFLICT_PREDICTED'
  | 'ANALYZING_RESOLUTIONS'
  | 'OPTIMAL_RESOLUTION_FOUND'
  | 'CONFLICT_RESOLVED';

export interface ScheduleStop {
  stationId: string;
  stationName: string;
  scheduledArrivalMin: number;
  scheduledDepartureMin: number;
  actualArrivalMin?: number;
  actualDepartureMin?: number;
  platform?: string;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  priority: TrainPriority;
  priorityWeight: number; // e.g. Express = 10, Passenger = 3, Freight = 1
  currentBlock: string;
  speedKmph: number;
  maxSpeedKmph: number;
  delayMin: number;
  direction: 'UP' | 'DOWN';
  status: TrainStatus;
  route: string[];
  currentStationId?: string;
  nextStationId?: string;
  progressPercent: number; // 0-100 on current segment
  coordinates?: { x: number; y: number };
  schedule: ScheduleStop[];
  coaches: number;
  locoType: string;
}

export interface StationPlatform {
  id: string;
  name: string;
  type: 'MAIN' | 'LOOP' | 'SIDING';
  capacity: number;
  occupiedBy?: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  km: number;
  platforms: StationPlatform[];
  coordinates: { x: number; y: number };
  junctionType?: 'TERMINAL' | 'PASS_THROUGH' | 'MAJOR_JUNCTION';
}

export interface TrackBlock {
  id: string;
  code: string; // e.g. "B17"
  name: string;
  lengthKm: number;
  speedLimitKmph: number;
  state: BlockState;
  currentTrainId?: string;
  reservedForTrainId?: string;
  signalAspect: SignalAspect;
  pathD: string;
  fromStationId: string;
  toStationId: string;
  trackType: 'UP_MAIN' | 'DOWN_MAIN' | 'LOOP' | 'JUNCTION_THROAT' | 'SIDING';
  isJunctionThroat?: boolean;
}

export interface Signal {
  id: string;
  blockId: string;
  aspect: SignalAspect;
  x: number;
  y: number;
  direction: 'UP' | 'DOWN';
}

export interface Conflict {
  id: string;
  code: string; // "C-104"
  title: string;
  description: string;
  timeToConflictMin: number; // T+31
  predictedTimestamp: string; // "11:03 AM IST"
  targetBlockId: string;
  targetBlockCode: string; // "B17"
  targetBlockName: string;
  primaryTrain: {
    id: string;
    number: string;
    name: string;
    type: TrainType;
    priority: TrainPriority;
    priorityWeight: number;
    delayMin: number;
  };
  secondaryTrain: {
    id: string;
    number: string;
    name: string;
    type: TrainType;
    priority: TrainPriority;
    priorityWeight: number;
    delayMin: number;
  };
  severity: ConflictSeverity;
  impactDescription: string;
  estimatedNetworkDelayMin: number;
}

export interface OptimizationCandidate {
  id: string;
  code: string; // "OPTION A"
  title: string;
  actionType: 'HOLD' | 'REROUTE' | 'SPEED_ADJUST';
  targetTrainId: string;
  targetTrainNumber: string;
  targetTrainName: string;
  durationMin: number;
  locationId: string;
  locationName: string;
  directDelayAddedMin: number;
  networkDelaySavedMin: number;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isRecommended: boolean;
  rationale: string;
}

export interface OptimizationResult {
  conflictId: string;
  recommendedCandidateId: string;
  solverTimeMs: number;
  candidates: OptimizationCandidate[];
  explanation: {
    headline: string;
    summary: string;
    keyConstraints: string[];
    priorityWeights: { trainNumber: string; role: string; weight: number }[];
    projectedNetworkDelayDelta: number;
  };
  beforeMetrics: {
    networkDelayMin: number;
    activeConflicts: number;
    atRiskTrains: number;
  };
  afterMetrics: {
    networkDelayMin: number;
    activeConflicts: number;
    atRiskTrains: number;
  };
}

export interface NetworkTelemetry {
  activeTrains: number;
  occupiedBlocks: number;
  predictedConflicts: number;
  activeConflicts: number;
  networkDelayMin: number;
  trainsAtRisk: number;
  lookAheadHorizonMin: number;
  operationalTime: string;
  simulationClockMin: number; // 0 to 60
}

export interface TimelineEvent {
  id: string;
  minuteOffset: number; // 0 to 60
  timeStr: string;
  type: 'DEPARTURE' | 'ARRIVAL' | 'BLOCK_ENTRY' | 'CONFLICT' | 'OPTIMIZATION' | 'RESOLUTION';
  title: string;
  description: string;
  trainNumber?: string;
  blockCode?: string;
  severity?: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export type ScenarioId = 'junction_conflict' | 'normal_operations' | 'single_track_bottleneck' | 'cascading_delay';

export interface Scenario {
  id: ScenarioId;
  name: string;
  subtitle: string;
  description: string;
  initialTelemetry: NetworkTelemetry;
  trains: Train[];
  blocks: TrackBlock[];
  stations: Station[];
  signals: Signal[];
  conflict?: Conflict;
  optimizationResult?: OptimizationResult;
  timelineEvents: TimelineEvent[];
}

// ==========================================
// BACKEND API CONTRACT TYPES (/api/v1)
// ==========================================

export interface PlatformTrack {
  id: string;
  track_id: string;
  length_m: number;
  max_speed_kmph: number;
}

export interface OuterHoldingTrack {
  id: string;
  track_id: string;
  capacity: number;
  description: string;
}

export interface SwitchPoint {
  id: string;
  location_km: number;
  state: 'NORMAL' | 'REVERSE';
}

export interface SignalCoordinate {
  id: string;
  type: string;
  aspect: SignalAspect;
}

export interface SimulatorLayout {
  station_id: string;
  name: string;
  platforms: PlatformTrack[];
  outer_waiting_tracks: OuterHoldingTrack[];
  switch_points: SwitchPoint[];
  signals: SignalCoordinate[];
}

export interface SimulatorTrainState {
  id: string;
  number?: string;
  name?: string;
  x: number;
  y: number;
  speed_kmph: number;
  status: string;
  block_id: string;
  delay_min?: number;
}

export interface SimulatorStateResponse {
  timestamp: number;
  trains: SimulatorTrainState[];
  signals: Record<string, SignalAspect>;
  switches: Record<string, 'NORMAL' | 'REVERSE'>;
}

export interface SimulatorTickRequest {
  step_seconds?: number;
}

export interface SimulatorTickResponse {
  current_time: number;
  time?: number;
  trains: SimulatorTrainState[];
}

export interface SimulatorPlaybackPayload {
  speed_multiplier: number;
  is_paused: boolean;
}

// Station Master HITL Types
export interface StationRadarItem {
  train_id: string;
  train_name: string;
  priority: number;
  eta_min: number;
  current_block: string;
  assigned_route: string;
  status: 'CRITICAL_PATH' | 'DIVERT_SCHEDULED' | 'ON_SCHEDULE' | 'DELAYED';
}

export interface StationRadarResponse {
  horizon_min: number;
  queue: StationRadarItem[];
}

export interface StationRecommendation {
  recommendation_id: string;
  train_id: string;
  train_name: string;
  priority: number;
  eta_min: number;
  recommended_action: 'ASSIGN_PLATFORM' | 'DIVERT_TO_HOLDING' | 'HOLD_AT_SIDING' | 'SPEED_ADJUST';
  assigned_track: string;
  alternative_track: string;
  outer_wait_min: number;
  reasoning: string;
  safety_interlock_approved: boolean;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'OVERRIDDEN' | 'REJECTED';
}

export interface StationRecommendationsResponse {
  generated_at: number;
  recommendations: StationRecommendation[];
}

export interface ApproveActionPayload {
  recommendation_id: string;
  train_id: string;
  assigned_track: string;
  dispatcher_id?: string;
}

export interface ApproveActionResponse {
  status: 'APPROVED_AND_LOCKED' | 'REJECTED_SAFETY_VIOLATION';
  route_id?: string;
  signal_id?: string;
  signal_aspect?: SignalAspect;
  switches_aligned?: string[];
  timestamp?: number;
  error_code?: string;
  detail?: string;
}

export interface OverrideActionPayload {
  train_id: string;
  manual_track: string;
  dispatcher_id?: string;
}

export interface OverrideActionResponse {
  status: string;
  assigned_track: string;
  safety_check_passed: boolean;
  message: string;
}

export interface EmergencyActionPayload {
  zone_id?: string;
  reason?: string;
  dispatcher_id?: string;
}

export interface EmergencyActionResponse {
  status: string;
  signals_tripped: number;
  timestamp: number;
}

// Passenger Portal Types
export interface PassengerTrainSearchResult {
  id: string;
  number: string;
  name: string;
  type: string;
  priority: number;
  origin: string;
  destination: string;
  current_status: string;
  delay_min: number;
}

export interface PassengerSearchResponse {
  results: PassengerTrainSearchResult[];
}

export interface PassengerTrainStatus {
  train_id: string;
  train_number: string;
  train_name: string;
  speed_kmph: number;
  current_block: string;
  next_station: string;
  delay_min: number;
  status: string;
  progress_percent: number;
}

export interface PassengerWhyStoppedResponse {
  train_id: string;
  train_name: string;
  is_stopped: boolean;
  stopped_at_location: string;
  duration_stopped_min: number;
  expected_clearance_min: number;
  plain_english_reason: string;
  technical_conflict?: {
    conflicting_train: string;
    conflict_section: string;
    priority_comparison: string;
  };
}

export interface X402PaymentRequirement {
  error: string;
  message: string;
  price_inr: number;
  price_microalgos: number;
  currency: string;
  network: string;
}

// Dispatch Priority Entry for Operator Ranking
export interface DispatchPriorityEntry {
  rank: number;
  trainId: string;
  trainNumber: string;
  trainName: string;
  type: TrainType;
  priorityWeight: number; // e.g. 10, 8, 3, 1
  priorityLevel: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'AT_RISK' | 'HOLDING' | 'PROCEEDING' | 'ON_TIME' | 'DELAYED';
  speedKmph: number;
  delayMin: number;
  currentBlock: string;
  assignedRoute?: string;
  relativePrecedenceNote?: string;
}

// WebSocket Connection & Frame Types
export type WebSocketConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';

export interface SimulatorWebSocketFrame {
  event: 'TRACK_CIRCUIT_UPDATE' | 'SIMULATION_TICK';
  timestamp: number;
  trains: SimulatorTrainState[];
  signals: Record<string, SignalAspect>;
  switches: Record<string, 'NORMAL' | 'REVERSE'>;
}

export interface StationMasterWebSocketFrame {
  event: 'NEW_RECOMMENDATION' | 'APPROVAL_EVENT' | 'RADAR_UPDATE';
  data: unknown;
}
