/**
 * System types for multi-system support
 */

export enum SystemId {
  TORMENTA20 = 'tormenta20',
  // Future systems can be added here:
  // DND5E = 'dnd5e',
  // PATHFINDER2E = 'pathfinder2e',
}

export interface SystemInfo {
  id: SystemId;
  name: string;
  description: string;
  icon?: string;
  version?: string;
  enabled: boolean;
}

export const AVAILABLE_SYSTEMS: SystemInfo[] = [
  {
    id: SystemId.TORMENTA20,
    name: 'Tormenta 20',
    description: 'Sistema de RPG brasileiro baseado no d20',
    enabled: true,
  },
  // Future systems will be added here
];
