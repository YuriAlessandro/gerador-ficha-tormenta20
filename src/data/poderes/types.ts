import { Atributo } from '../atributos';
import Divindade from '../../interfaces/Divindade';

export enum GeneralPowerType {
  COMBATE = 'COMBATE',
  DESTINO = 'DESTINO',
  MAGIA = 'MAGIA',
  CONCEDIDOS = 'CONCEDIDOS',
  TORMENTA = 'TORMENTA',
}

export enum RequirementType {
  PODER = 'PODER',
  ATRIBUTO = 'ATRIBUTO',
  PERICIA = 'PERICIA',
  HABILIDADE = 'HABILIDADE',
  PODER_TORMENTA = 'PODER_TORMENTA',
}

interface Requirement {
  type: RequirementType;
  name?: string | Atributo;
  value?: number;
}

export interface GeneralPower {
  type: GeneralPowerType;
  description: string;
  name: string;
  requirements: Requirement[];
  allowSeveralPicks?: boolean;
}

export interface GrantedPower extends GeneralPower {
  god: Divindade[];
}

export type GeneralPowers = {
  [key in GeneralPowerType]: GeneralPower[];
};
