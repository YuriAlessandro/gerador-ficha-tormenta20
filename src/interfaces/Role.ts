import { ClassNames } from './Class';

export type RoleNames =
  | 'Tank'
  | 'Suporte'
  | 'Mago'
  | 'Off Tank'
  | 'Face'
  | 'Dano';

export type Role = Record<RoleNames, ClassNames[]>;
