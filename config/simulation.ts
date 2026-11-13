import type { DryingStatus } from '@/models/firestore';

// Set EXPO_PUBLIC_ENABLE_SIMULATION_MODE=true in a local environment file for
// software-only demos. Production builds and all other values force Live Mode.
export const SIMULATION_MODE_ENABLED = __DEV__
  && process.env.EXPO_PUBLIC_ENABLE_SIMULATION_MODE === 'true';

export type SimulationScenarioId = 'good' | 'not-good' | 'bad-time' | 'inspection';

export type SimulationScenario = {
  id: SimulationScenarioId;
  label: string;
  description: string;
  dryingStatus: DryingStatus;
  estimatedMinutesRemaining: number;
  elapsedMinutes: number;
  temperatures: number[];
  inspectionRequired: boolean;
};

// Presentation-only demo fixtures. These values do not represent a permanent
// drying formula and are never written to Firebase.
export const SIMULATION_SCENARIOS: readonly SimulationScenario[] = [
  {
    id: 'good',
    label: 'GOOD',
    description: 'Stable demo temperature with drying time remaining.',
    dryingStatus: 'GOOD',
    estimatedMinutesRemaining: 150,
    elapsedMinutes: 210,
    temperatures: [46.2, 46.8, 47.1, 47.6, 48.0, 48.2, 48.4, 48.3],
    inspectionRequired: false,
  },
  {
    id: 'not-good',
    label: 'NOT GOOD',
    description: 'Changing demo temperature requiring attention.',
    dryingStatus: 'NOT GOOD',
    estimatedMinutesRemaining: 210,
    elapsedMinutes: 180,
    temperatures: [45.8, 44.9, 46.1, 43.8, 45.0, 44.2, 43.6, 44.0],
    inspectionRequired: false,
  },
  {
    id: 'bad-time',
    label: 'BAD TIME',
    description: 'Unfavorable demo condition for workflow testing.',
    dryingStatus: 'BAD TIME',
    estimatedMinutesRemaining: 300,
    elapsedMinutes: 120,
    temperatures: [41.6, 41.1, 40.7, 40.2, 39.8, 39.3, 38.9, 38.5],
    inspectionRequired: false,
  },
  {
    id: 'inspection',
    label: 'TIME REACHED',
    description: 'Estimated time has reached zero; physical inspection is required.',
    dryingStatus: 'GOOD',
    estimatedMinutesRemaining: 0,
    elapsedMinutes: 360,
    temperatures: [47.0, 47.4, 47.7, 48.0, 48.1, 48.3, 48.2, 48.0],
    inspectionRequired: true,
  },
] as const;

export function getSimulationScenario(id: SimulationScenarioId) {
  return SIMULATION_SCENARIOS.find((scenario) => scenario.id === id) ?? SIMULATION_SCENARIOS[0];
}
