export type equipGroup =
  | 'Arma'
  | 'Armadura'
  | 'Escudo'
  | 'Item Geral'
  | 'Alquimía'
  | 'Vestuário'
  | 'Hospedagem'
  | 'Alimentação'
  | 'Animal'
  | 'Veículo'
  | 'Serviço';
export default interface Equipment {
  nome: string;
  dano?: string;
  critico?: string;
  spaces?: number;
  tipo?: string;
  alcance?: string;
  group: equipGroup;
  atkBonus?: number;
  weaponTags?: string[];
  preco?: number;

  // Base values for weapons (original stats before any modifications)
  baseDano?: string;
  baseAtkBonus?: number;
  baseCritico?: string;

  // Flag to indicate if this weapon has manual user edits
  // When true, recalculateSheet will preserve user edits instead of resetting
  hasManualEdits?: boolean;
}

export type defenseEquipGroup = 'Armadura' | 'Escudo';

export interface DefenseEquipment extends Equipment {
  defenseBonus: number;
  armorPenalty: number;
  group: defenseEquipGroup;
}

interface Modification {
  name: string;
  description: string;
}

export interface SuperiorEquipment extends Equipment {
  modifications: Modification[];
}

export interface CombatItems {
  armasSimples: Equipment[];
  armasMarciais: Equipment[];
  armadurasLeves: DefenseEquipment[];
  armaduraPesada: DefenseEquipment[];
  escudos: DefenseEquipment[];
  armasExoticas: Equipment[];
  armasDeFogo: Equipment[];
}

export interface BagEquipments {
  Arma: Equipment[];
  Armadura: DefenseEquipment[];
  Escudo: DefenseEquipment[];
  'Item Geral': Equipment[];
  Alquimía: Equipment[];
  Vestuário: Equipment[];
  Hospedagem: Equipment[];
  Alimentação: Equipment[];
  Animal: Equipment[];
  Veículo: Equipment[];
  Serviço: Equipment[];
}
