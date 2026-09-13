import { Scenario, ScenarioId } from '../../api/types';
import { JUNCTION_CONFLICT_SCENARIO } from './junctionConflict';
import {
  NORMAL_OPS_SCENARIO,
  SINGLE_TRACK_BOTTLENECK_SCENARIO,
  CASCADING_DELAY_SCENARIO,
} from './otherScenarios';

export const ALL_SCENARIOS: Record<ScenarioId, Scenario> = {
  junction_conflict: JUNCTION_CONFLICT_SCENARIO,
  normal_operations: NORMAL_OPS_SCENARIO,
  single_track_bottleneck: SINGLE_TRACK_BOTTLENECK_SCENARIO,
  cascading_delay: CASCADING_DELAY_SCENARIO,
};

export const DEFAULT_SCENARIO = JUNCTION_CONFLICT_SCENARIO;
